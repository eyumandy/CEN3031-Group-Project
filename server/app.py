# app.py with added functionality for habits and inventory

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId
from datetime import datetime, timedelta, timezone

from default_achievements import DEFAULT_ACHIEVEMENTS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Connect to MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client['momentum_db']
users_collection = db['users']
habits_collection = db['user_habits']
inventory_collection = db['user_inventory']
achievements_collection = db['user_achievements']

# Authentication endpoints
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create user
    user_id = users_collection.insert_one({
        'email': data['email'], 
        'password': hashed_password, 
        'name': data.get('name', '')
    }).inserted_id
    
    # Initialize empty habits list for new user
    habits_collection.insert_one({
        'user_email': data['email'],
        'habits': []
    })
    
    # Initialize inventory with starting coins
    inventory_collection.insert_one({
        'user_email': data['email'],
        'coins': 100,  # Starting coins for new users
        'items': []
    })

    # Initialize achievements for new user
    achievements_collection.insert_one({
        'user_email': data['email'],
        'achievements': DEFAULT_ACHIEVEMENTS
    })
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({'email': data.get('email')})
    
    if not user or not bcrypt.check_password_hash(user['password'], data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user['email'])
    return jsonify({
        'access_token': access_token,
        'user': {
            'email': user['email'],
            'name': user.get('name', '')
        }
    }), 200

# Habits endpoints
@app.route('/habits', methods=['GET'])
@jwt_required()
def get_habits():
    current_user = get_jwt_identity()
    user_habits = habits_collection.find_one({'user_email': current_user})
    
    if not user_habits:
        # Initialize habits if not exist
        habits_collection.insert_one({
            'user_email': current_user,
            'habits': []
        })
        return jsonify({'habits': []}), 200
    
    return jsonify({'habits': user_habits.get('habits', [])}), 200

@app.route('/habits', methods=['POST'])
@jwt_required()
def create_habit():
    current_user = get_jwt_identity()
    data = request.json
    
    required_fields = ['title', 'frequency', 'category']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Generate unique habit ID
    habit_id = str(ObjectId())
    
    # Create habit object
    new_habit = {
        'id': habit_id,
        'title': data['title'],
        'description': data.get('description', ''),
        'frequency': data['frequency'],
        'streak': 0,
        'totalCompletions': 0,
        'category': data['category'],
        'createdAt': datetime.utcnow().isoformat(),
        'lastCompletedAt': None,
        'completedToday': False,
        'timeOfDay': data.get('timeOfDay', 'any'),
        'color': data.get('color', '#00DCFF'),  # Default color
        'difficulty': data.get('difficulty', 'medium'),
        'coinReward': data.get('coinReward', 10)  # Default reward
    }
    
    # Update user habits
    result = habits_collection.update_one(
        {'user_email': current_user},
        {'$push': {'habits': new_habit}},
        upsert=True
    )
    
    if result.modified_count > 0 or result.upserted_id:
        return jsonify({'message': 'Habit created successfully', 'habit': new_habit}), 201
    else:
        return jsonify({'error': 'Failed to create habit'}), 500

@app.route('/habits/<habit_id>', methods=['PUT'])
@jwt_required()
def update_habit(habit_id):
    current_user = get_jwt_identity()
    data = request.json
    
    # Find the user's habits
    user_habits = habits_collection.find_one({'user_email': current_user})
    if not user_habits:
        return jsonify({'error': 'No habits found for user'}), 404
    
    # Find the specific habit
    habit_index = None
    for i, habit in enumerate(user_habits.get('habits', [])):
        if habit.get('id') == habit_id:
            habit_index = i
            break
    
    if habit_index is None:
        return jsonify({'error': 'Habit not found'}), 404
    
    # Update habit fields
    for key, value in data.items():
        # Use MongoDB's positional operator to update specific fields in the array
        update_key = f'habits.{habit_index}.{key}'
        habits_collection.update_one(
            {'user_email': current_user},
            {'$set': {update_key: value}}
        )
    
    # Get updated habits
    updated_habits = habits_collection.find_one({'user_email': current_user})
    updated_habit = next((h for h in updated_habits.get('habits', []) if h.get('id') == habit_id), None)
    
    return jsonify({'message': 'Habit updated successfully', 'habit': updated_habit}), 200

def recalc_achievements_for_user(user_email):
    # 1) Grab all habits for the user
    user_doc = habits_collection.find_one({'user_email': user_email}) or {}
    habits   = user_doc.get('habits', [])

    # 2) Compute overall stats
    total_completions = sum(h.get('totalCompletions', 0) for h in habits)

    # 3) Build a map: category_name → sum of completions in that category
    cat_counts = {}
    for h in habits:
        cat = h.get('category')
        cat_counts[cat] = cat_counts.get(cat, 0) + h.get('totalCompletions', 0)

    # 4) Longest streak across all habits
    longest_streak = max((h.get('streak', 0) for h in habits), default=0)

    # 5) Load or bail
    doc = achievements_collection.find_one({'user_email': user_email})
    if not doc:
        return

    achievements = doc.get('achievements', [])
    updated = False

    # 6) Walk each achievement
    for ach in achievements:
        if ach.get('earned'):
            continue

        cat = ach.get('category')

        # 7) Choose the right counter
        if   cat == 'habits':
            progress = total_completions
        elif cat == 'streaks':
            progress = longest_streak
        else:
            # any other category string must match a habit.category
            progress = cat_counts.get(cat, 0)

        # clamp & compare
        new_prog = min(progress, ach.get('total', 0))
        if new_prog != ach.get('progress', 0):
            ach['progress'] = new_prog
            updated = True

        # if complete, mark earned
        if new_prog >= ach.get('total', 0):
            ach['earned']     = True
            ach['earnedDate'] = datetime.now(timezone.utc).isoformat()
            updated = True

    # 8) Write back if anything changed
    if updated:
        achievements_collection.update_one(
            {'user_email': user_email},
            {'$set': {'achievements': achievements}}
        )
        
@app.route('/achievements', methods=['GET'])
@jwt_required()
def get_achievements():
    user_email = get_jwt_identity()
    doc = achievements_collection.find_one({'user_email': user_email})

    if not doc:
        achievements_collection.insert_one({
            'user_email': user_email,
            'achievements': DEFAULT_ACHIEVEMENTS  # or []
        })
        return jsonify({'achievements': []}), 200

    achievements = doc.get('achievements', [])
    updated = False

    for ach in achievements:
        if not ach.get('earned', False) and ach.get('progress', 0) >= ach.get('total', 0):
            ach['earned'] = True
            ach['earnedDate'] = datetime.utcnow().isoformat()
            updated = True

    if updated:
        achievements_collection.update_one(
            {'user_email': user_email},
            {'$set': {'achievements': achievements}}
        )

    return jsonify({'achievements': achievements}), 200

@app.route('/achievements/<achievement_id>/claim', methods=['POST'])
@jwt_required()
def claim_achievement(achievement_id):
    user_email = get_jwt_identity()

    user_doc = achievements_collection.find_one({'user_email': user_email})
    if not user_doc:
        return jsonify({'error': 'No achievements found'}), 404

    achievements = user_doc.get('achievements', [])
    ach = next((a for a in achievements if a['id'] == achievement_id), None)
    if not ach:
        return jsonify({'error': 'Achievement not found'}), 404

    if not ach.get('earned', False):
        return jsonify({'error': 'Achievement not yet earned'}), 400
    if ach.get('claimed', False):
        return jsonify({'error': 'Achievement already claimed'}), 400

    achievements_collection.update_one(
        {'user_email': user_email, 'achievements.id': achievement_id},
        {'$set': {
            'achievements.$.claimed': True
        }}
    )

    coin_reward = ach.get('coinReward', 0)
    inventory_collection.update_one(
        {'user_email': user_email},
        {'$inc': {'coins': coin_reward}}
    )
    inv = inventory_collection.find_one({'user_email': user_email})

    updated_ach = next((a for a in achievements if a['id'] == achievement_id), None)
    updated_ach['claimed'] = True

    return jsonify({
      'achievement': updated_ach,
      'currentCoins': inv.get('coins', 0)
    }), 200

@app.route('/habits/<habit_id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(habit_id):
    user_email = get_jwt_identity()

    user_doc = habits_collection.find_one({'user_email': user_email})
    if not user_doc:
        return jsonify({'error': 'No habits found for user'}), 404
    habits = user_doc.get('habits', [])

    for idx, h in enumerate(habits):
        if h['id'] == habit_id:
            habit = h
            break
    else:
        return jsonify({'error': 'Habit not found'}), 404

    if habit.get('completedToday'):
        return jsonify({'error': 'Habit already completed today'}), 400

    now_utc = datetime.now(timezone.utc)
    today   = now_utc.date()

    last_iso = habit.get('lastCompletedAt')
    if last_iso:
        last_dt   = datetime.fromisoformat(last_iso)
        last_dt   = last_dt.astimezone(timezone.utc)
        last_date = last_dt.date()
    else:
        last_date = None

    continued = last_date is not None and (today - last_date == timedelta(days=1))
    new_streak = (habit.get('streak', 0) + 1) if continued else 1

    new_total    = habit.get('totalCompletions', 0) + 1
    base_reward  = habit.get('coinReward', 10)
    streak_bonus = 0
    if new_streak >= 5:  
        streak_bonus += 5
    if new_streak >= 10: 
        streak_bonus += 5
    if new_streak >= 30: 
        streak_bonus += 10
    total_reward = base_reward + streak_bonus

    update_fields = {
        f"habits.{idx}.completedToday":    True,
        f"habits.{idx}.lastCompletedAt":   now_utc.isoformat(),
        f"habits.{idx}.streak":            new_streak,
        f"habits.{idx}.totalCompletions":  new_total
    }
    habits_collection.update_one(
        {'user_email': user_email},
        {'$set': update_fields}
    )

    # Award coins
    inventory_collection.update_one(
        {'user_email': user_email},
        {'$inc': {'coins': total_reward}}
    )

    # Fetch Achievements
    recalc_achievements_for_user(user_email)

    updated_habits = habits_collection.find_one({'user_email': user_email})['habits']
    updated_habit  = next(h for h in updated_habits if h['id'] == habit_id)
    current_coins  = inventory_collection.find_one({'user_email': user_email})['coins']

    return jsonify({
        'message':      'Habit completed successfully',
        'habit':        updated_habit,
        'reward':       total_reward,
        'currentCoins': current_coins
    }), 200

@app.route('/habits/<habit_id>', methods=['DELETE'])
@jwt_required()
def delete_habit(habit_id):
    current_user = get_jwt_identity()
    
    result = habits_collection.update_one(
        {'user_email': current_user},
        {'$pull': {'habits': {'id': habit_id}}}
    )
    
    if result.modified_count > 0:
        return jsonify({'message': 'Habit deleted successfully'}), 200
    else:
        return jsonify({'error': 'Habit not found'}), 404

# Inventory endpoints
@app.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    current_user = get_jwt_identity()
    user_inventory = inventory_collection.find_one({'user_email': current_user})
    
    if not user_inventory:
        # Initialize inventory if not exists
        inventory_collection.insert_one({
            'user_email': current_user,
            'coins': 100,
            'items': []
        })
        return jsonify({'coins': 100, 'items': []}), 200
    
    return jsonify({
        'coins': user_inventory.get('coins', 0),
        'items': user_inventory.get('items', [])
    }), 200

@app.route('/inventory/purchase', methods=['POST'])
@jwt_required()
def purchase_item():
    current_user = get_jwt_identity()
    data = request.json
    
    required_fields = ['id', 'name', 'category', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check if user has enough coins
    user_inventory = inventory_collection.find_one({'user_email': current_user})
    if not user_inventory:
        return jsonify({'error': 'User inventory not found'}), 404
    
    current_coins = user_inventory.get('coins', 0)
    item_price = data.get('price', 0)
    
    if current_coins < item_price:
        return jsonify({'error': 'Not enough coins'}), 400
    
    # Check if item is already owned
    user_items = user_inventory.get('items', [])
    if any(item.get('id') == data['id'] for item in user_items):
        return jsonify({'error': 'Item already owned'}), 400
    
    # Create item object
    new_item = {
        'id': data['id'],
        'name': data['name'],
        'category': data['category'],
        'purchasedAt': datetime.utcnow().isoformat(),
    }
    
    # Add category-specific properties
    if data['category'] == 'themes':
        new_item['themeId'] = data.get('themeId', '')
        new_item['isActive'] = False
    elif data['category'] == 'powerups':
        new_item['usageLimit'] = data.get('usageLimit', 1)
        new_item['usesLeft'] = data.get('usageLimit', 1)
    elif data['category'] == 'backgrounds':
        new_item['isActive'] = False
    
    # Update inventory: add item and deduct coins
    result = inventory_collection.update_one(
        {'user_email': current_user},
        {
            '$push': {'items': new_item},
            '$inc': {'coins': -item_price}
        }
    )
    
    if result.modified_count > 0:
        # Get updated inventory
        updated_inventory = inventory_collection.find_one({'user_email': current_user})
        return jsonify({
            'message': 'Item purchased successfully',
            'item': new_item,
            'currentCoins': updated_inventory.get('coins', 0)
        }), 200
    else:
        return jsonify({'error': 'Failed to purchase item'}), 500

@app.route('/inventory/use', methods=['POST'])
@jwt_required()
def use_item():
    current_user = get_jwt_identity()
    data = request.json
    
    if not data.get('itemId'):
        return jsonify({'error': 'Item ID is required'}), 400
    
    # Find user inventory
    user_inventory = inventory_collection.find_one({'user_email': current_user})
    if not user_inventory:
        return jsonify({'error': 'User inventory not found'}), 404
    
    # Find the specific item
    item = None
    for i in user_inventory.get('items', []):
        if i.get('id') == data['itemId']:
            item = i
            break
    
    if item is None:
        return jsonify({'error': 'Item not found in inventory'}), 404
    
    # Handle different item types
    if item['category'] == 'themes':
        # Deactivate all other themes
        for i, inv_item in enumerate(user_inventory.get('items', [])):
            if inv_item.get('category') == 'themes' and inv_item.get('isActive'):
                inventory_collection.update_one(
                    {'user_email': current_user},
                    {'$set': {f'items.{i}.isActive': False}}
                )
        
        # Activate the selected theme
        inventory_collection.update_one(
            {'user_email': current_user, 'items.id': data['itemId']},
            {'$set': {'items.$.isActive': True}}
        )
        
        return jsonify({'message': f'Theme {item["name"]} activated'}), 200
        
    elif item['category'] == 'powerups':
        # Handle powerup usage logic
        if item.get('usesLeft', 0) <= 0:
            return jsonify({'error': 'No uses left for this powerup'}), 400
        
        # Apply powerup effect based on itemId
        if item['id'] == 'powerup-5':  # Bonus Coins
            inventory_collection.update_one(
                {'user_email': current_user},
                {'$inc': {'coins': 50}}  # Add 50 coins
            )
            
        # Decrease uses left or remove if exhausted
        if item.get('usesLeft', 1) <= 1:
            # Remove the item if no uses left
            inventory_collection.update_one(
                {'user_email': current_user},
                {'$pull': {'items': {'id': data['itemId']}}}
            )
        else:
            # Decrease uses left
            inventory_collection.update_one(
                {'user_email': current_user, 'items.id': data['itemId']},
                {'$inc': {'items.$.usesLeft': -1}}
            )
        
        # Get updated inventory
        updated_inventory = inventory_collection.find_one({'user_email': current_user})
        
        return jsonify({
            'message': f'Powerup {item["name"]} used successfully',
            'currentCoins': updated_inventory.get('coins', 0)
        }), 200
        
    elif item['category'] == 'backgrounds':
        # Deactivate all other backgrounds
        for i, inv_item in enumerate(user_inventory.get('items', [])):
            if inv_item.get('category') == 'backgrounds' and inv_item.get('isActive'):
                inventory_collection.update_one(
                    {'user_email': current_user},
                    {'$set': {f'items.{i}.isActive': False}}
                )
        
        # Activate the selected background
        inventory_collection.update_one(
            {'user_email': current_user, 'items.id': data['itemId']},
            {'$set': {'items.$.isActive': True}}
        )
        
        return jsonify({'message': f'Background {item["name"]} applied'}), 200
    
    else:
        return jsonify({'error': 'Unknown item category'}), 400

@app.route('/user/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    current_user = get_jwt_identity()
    
    # Get user habits
    user_habits = habits_collection.find_one({'user_email': current_user})
    habits = user_habits.get('habits', []) if user_habits else []
    
    # Get user inventory
    user_inventory = inventory_collection.find_one({'user_email': current_user})
    coins = user_inventory.get('coins', 0) if user_inventory else 0
    items = user_inventory.get('items', []) if user_inventory else []
    
    # Calculate stats
    total_habits = len(habits)
    completed_today = sum(1 for h in habits if h.get('completedToday'))
    longest_streak = max((h.get('streak', 0) for h in habits), default=0)
    total_completions = sum(h.get('totalCompletions', 0) for h in habits)
    
    # Calculate completion rate
    completion_rate = (completed_today / total_habits * 100) if total_habits > 0 else 0
    
    # Get active theme and background
    active_theme = next((item for item in items if item.get('category') == 'themes' and item.get('isActive')), None)
    active_background = next((item for item in items if item.get('category') == 'backgrounds' and item.get('isActive')), None)
    
    return jsonify({
        'totalHabits': total_habits,
        'completedToday': completed_today,
        'completionRate': completion_rate,
        'longestStreak': longest_streak,
        'totalCompletions': total_completions,
        'coins': coins,
        'activeTheme': active_theme.get('themeId') if active_theme else 'basic',
        'activeBackground': active_background.get('id') if active_background else None
    }), 200

@app.route('/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_email = get_jwt_identity()

    user = users_collection.find_one(
        {'email': current_email},
        {'_id': False, 'email': True, 'name': True}
    )

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user), 200

if __name__ == '__main__':
    print("MongoDB Database Names:", client.list_database_names())
    app.run(debug=True)
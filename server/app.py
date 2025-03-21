"""
TODO: Mongo DB Auth
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Connect to MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client['auth_db']
users_collection = db['users']

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'error': 'User already exists'}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    users_collection.insert_one({'email': data['email'], 'password': hashed_password, 'name': data.get('name')})
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({'email': data.get('email')})
    
    if not user or not bcrypt.check_password_hash(user['password'], data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user['email'])
    return jsonify({'access_token': access_token}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Hello, {current_user}!'}), 200

if __name__ == '__main__':
    print(client.list_database_names())
    app.run(debug=True)

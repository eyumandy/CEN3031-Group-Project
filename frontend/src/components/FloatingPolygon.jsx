/**
 * 
 * @description Reusable animated 3D polygon component for background visual effects
 * @version 1.0
 * @dependencies 
 *  - @react-three/fiber
 *  - @react-three/drei
 */
"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, Sparkles } from "@react-three/drei"

/**
 * Animated 3D polygon component for background visual effect
 * Renders a wireframe icosahedron with glow and sparkle effects
 * 
 * @returns {JSX.Element} Three.js component for 3D visual effect
 */
export default function FloatingPolygon() {
  const meshRef = useRef(null)
  const glowRef = useRef(null)

  // Animate the polygon rotation on each frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
    if (glowRef.current) {
      glowRef.current.rotation.x -= delta * 0.1
      glowRef.current.rotation.y -= delta * 0.15
    }
  })

  return (
    <>
      {/* Sparkles effect around the polygon */}
      <Sparkles count={100} scale={[10, 10, 10]} size={0.5} speed={0.3} color="#00DCFF" opacity={0.2} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Main wireframe polygon */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <icosahedronGeometry args={[1.5, 2]} /> {/* Increased detail level */}
          <meshStandardMaterial
            color="#00DCFF"
            emissive="#00DCFF"
            emissiveIntensity={0.4}
            roughness={0.3}
            metalness={0.9}
            wireframe={true}
          />
        </mesh>

        {/* Inner glow effect */}
        <mesh ref={glowRef} scale={0.9}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshStandardMaterial
            color="#00DCFF"
            emissive="#00DCFF"
            emissiveIntensity={0.2}
            transparent={true}
            opacity={0.1}
          />
        </mesh>
      </Float>

      {/* Additional light source */}
      <pointLight position={[0, 0, 0]} intensity={1} color="#00DCFF" distance={5} decay={2} />
    </>
  )
}
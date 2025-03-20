"use client"

import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { FloatingPolygon } from "./index"

/**
 * Wrapper component for Three.js canvas with environment and polygon
 * Used to ensure client-side rendering of 3D elements
 * 
 * @returns {JSX.Element} Three.js canvas component
 */
export default function ThreeCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <FloatingPolygon />
      <Environment preset="night" />
    </Canvas>
  )
}
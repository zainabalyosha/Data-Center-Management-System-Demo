"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Box, Sphere, Text } from "@react-three/drei"
import type * as THREE from "three"

interface SimulationState {
  location: string
  currentTemp: number
  heatwaveActive: boolean
  heatwaveIntensity: string
  operationMode: string
  renewablePenetration: number
  batteryCapacity: number
  backupGenerators: boolean
  loadShifting: boolean
}

interface Facility3DProps {
  simulation: SimulationState
}

function ServerRack({ position, isOverheating }: { position: [number, number, number]; isOverheating: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && isOverheating) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <Box ref={meshRef} position={position} args={[0.8, 2, 0.4]} material-color={isOverheating ? "#ff4444" : "#333333"}>
      <meshStandardMaterial color={isOverheating ? "#ff4444" : "#333333"} />
    </Box>
  )
}

function CoolingUnit({ position, isActive }: { position: [number, number, number]; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.05
    }
  })

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3]} material-color={isActive ? "#00aaff" : "#666666"}>
        <meshStandardMaterial color={isActive ? "#00aaff" : "#666666"} />
      </Sphere>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color={isActive ? "#00aaff" : "#666666"}
        anchorX="center"
        anchorY="middle"
      >
        {isActive ? "COOLING" : "IDLE"}
      </Text>
    </group>
  )
}

function DataCenterScene({ simulation }: { simulation: SimulationState }) {
  const isOverheating = simulation.heatwaveActive && simulation.currentTemp > 35
  const coolingUnitsActive = simulation.heatwaveActive ? 6 : 4

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Server Racks */}
      {Array.from({ length: 24 }, (_, i) => {
        const x = (i % 6) * 2 - 5
        const z = Math.floor(i / 6) * 2 - 3
        const rackOverheating = isOverheating && i >= 22
        return <ServerRack key={i} position={[x, 0, z]} isOverheating={rackOverheating} />
      })}

      {/* Cooling Units */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const isActive = i < coolingUnitsActive
        return <CoolingUnit key={i} position={[x, 3, z]} isActive={isActive} />
      })}

      {/* Floor */}
      <Box position={[0, -1.5, 0]} args={[20, 0.2, 12]} material-color="#444444">
        <meshStandardMaterial color="#444444" />
      </Box>

      {/* Temperature Display */}
      <Text
        position={[0, 6, 0]}
        fontSize={1}
        color={isOverheating ? "#ff4444" : "#00ff00"}
        anchorX="center"
        anchorY="middle"
      >
        {simulation.currentTemp}°C
      </Text>

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  )
}

export function Facility3D({ simulation }: Facility3DProps) {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [15, 10, 15], fov: 60 }}>
        <DataCenterScene simulation={simulation} />
      </Canvas>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Planet } from '@/components/Planet'
import { Star } from '@/components/Star'
import { useHandTracking, GestureEvent } from '@/hooks/useHandTracking'

export default function ExplorePage() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const [currentGesture, setCurrentGesture] = useState<string | null>(null)

  // Handle hand tracking gestures
  const handleGesture = (gesture: GestureEvent) => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    
    if (!camera || !controls) return

    // Show gesture feedback
    setCurrentGesture(gesture.type)
    setTimeout(() => setCurrentGesture(null), 500)

    switch (gesture.type) {
      case 'zoom':
        if (gesture.delta) {
          const zoomFactor = gesture.delta * 0.05
          const direction = new THREE.Vector3()
          camera.getWorldDirection(direction)
          camera.position.addScaledVector(direction, zoomFactor)
          controls.update()
        }
        break

      case 'rotate':
        if (gesture.delta) {
          const rotationSpeed = gesture.delta * 0.001
          const offset = new THREE.Vector3().subVectors(camera.position, controls.target)
          const spherical = new THREE.Spherical().setFromVector3(offset)
          spherical.theta += rotationSpeed
          offset.setFromSpherical(spherical)
          camera.position.copy(controls.target).add(offset)
          controls.update()
        }
        break

      case 'pan':
        if (gesture.dx !== undefined && gesture.dy !== undefined) {
          const panSpeed = 0.01
          const offset = new THREE.Vector3()
          offset.copy(camera.position).sub(controls.target)
          
          const targetDistance = offset.length()
          const panX = -gesture.dx * panSpeed * targetDistance
          const panY = gesture.dy * panSpeed * targetDistance
          
          const left = new THREE.Vector3()
          left.setFromMatrixColumn(camera.matrix, 0)
          left.multiplyScalar(panX)
          
          const up = new THREE.Vector3()
          up.setFromMatrixColumn(camera.matrix, 1)
          up.multiplyScalar(panY)
          
          camera.position.add(left).add(up)
          controls.target.add(left).add(up)
          controls.update()
        }
        break
    }
  }

  const { connected, error, reconnect } = useHandTracking(handleGesture)

  useEffect(() => {
    const mount = mountRef.current!
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = true
    controls.minDistance = 2
    controls.maxDistance = 50

    camera.position.set(0, 0, 10)

    // Store references for hand tracking
    cameraRef.current = camera
    controlsRef.current = controls

    const light = new THREE.PointLight(0xffffff, 2)
    light.position.set(10, 10, 10)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0x404040)
    scene.add(ambient)

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    setScene(scene)

    return () => {
      mount.removeChild(renderer.domElement)
      window.removeEventListener('resize', handleResize)
    }
    }, [])
    const planets = [
        {
          name: 'Sun',
          textureUrl: '/textures/sun.jpg',
          radius: 4,
          position: [0, 0, 0] as [number, number, number],
          rotationSpeed: 0.0005, 
          orbitSpeed: 0,
        },
        {
          name: 'Mercury',
          textureUrl: '/textures/mercury.jpg',
          radius: 0.4,
          position: [6, 0, 0] as [number, number, number],
          rotationSpeed: 0.00017, 
          orbitSpeed: 0.0083, 
        },
        {
          name: 'Venus',
          textureUrl: '/textures/venus.jpg',
          radius: 0.9,
          position: [9, 0, 0] as [number, number, number],
          rotationSpeed: -0.00004,
          orbitSpeed: 0.0032, 
        },
        {
          name: 'Earth',
          textureUrl: '/textures/earth.jpg',
          radius: 1,
          position: [12, 0, 0] as [number, number, number],
          rotationSpeed: 0.01,
          orbitSpeed: 0.002, 
        },
        {
          name: 'Mars',
          textureUrl: '/textures/mars.jpg',
          radius: 0.8,
          position: [15, 0, 0] as [number, number, number],
          rotationSpeed: 0.0098,
          orbitSpeed: 0.0011,
        },
        {
          name: 'Jupiter',
          textureUrl: '/textures/jupiter.jpg',
          radius: 2.5,
          position: [20, 0, 0] as [number, number, number],
          rotationSpeed: 0.024,
          orbitSpeed: 0.00017,
        },
        {
          name: 'Saturn',
          textureUrl: '/textures/saturn.jpg',
          radius: 2.2,
          position: [27, 0, 0] as [number, number, number],
          rotationSpeed: 0.022, 
          orbitSpeed: 0.00007,
        },
        {
          name: 'Uranus',
          textureUrl: '/textures/uranus.jpg',
          radius: 1.6,
          position: [33, 0, 0] as [number, number, number],
          rotationSpeed: -0.012, 
          orbitSpeed: 0.00003,
        },
        {
          name: 'Neptune',
          textureUrl: '/textures/neptune.jpg',
          radius: 1.5,
          position: [38, 0, 0] as [number, number, number],
          rotationSpeed: 0.009,
          orbitSpeed: 0.00002,
        },
    ]


  return (
    <div ref={mountRef} className="h-screen w-screen bg-black overflow-hidden relative">
        {/* Hand Tracking Status Indicator */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <div className={`px-4 py-2 rounded-lg backdrop-blur-md ${
            connected 
              ? 'bg-green-500/20 border border-green-500/50' 
              : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-white text-sm font-medium">
                {connected ? 'Hand Tracking Active' : 'Hand Tracking Disconnected'}
              </span>
            </div>
          </div>
          
          {error && (
            <div className="px-4 py-2 rounded-lg backdrop-blur-md bg-yellow-500/20 border border-yellow-500/50">
              <p className="text-yellow-200 text-xs">{error}</p>
              <button 
                onClick={reconnect}
                className="mt-1 text-yellow-300 text-xs underline hover:text-yellow-100"
              >
                Retry Connection
              </button>
            </div>
          )}
          
          {currentGesture && (
            <div className="px-4 py-2 rounded-lg backdrop-blur-md bg-blue-500/30 border border-blue-500/50 animate-pulse">
              <span className="text-white text-sm font-medium capitalize">
                {currentGesture === 'zoom' && '🔍 Zooming'}
                {currentGesture === 'rotate' && '🔄 Rotating'}
                {currentGesture === 'pan' && '✋ Panning'}
              </span>
            </div>
          )}
        </div>

        {/* Controls Guide */}
        <div className="absolute bottom-4 left-4 z-10 px-4 py-3 rounded-lg backdrop-blur-md bg-black/50 border border-white/20">
          <h3 className="text-white text-sm font-semibold mb-2">Hand Controls:</h3>
          <ul className="text-white/80 text-xs space-y-1">
            <li>👉 <span className="font-medium">Right hand pinch</span> (up/down): Zoom</li>
            <li>👈 <span className="font-medium">Left hand pinch</span> (left/right): Rotate</li>
            <li>✊ <span className="font-medium">Two fists</span>: Pan</li>
          </ul>
        </div>
        
        {scene && (
            <>
            <Star scene={scene} />
            {planets.map((planet) => (
              <Planet key={planet.name} scene={scene} {...planet} emissive />
            ))}
            </>
        )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Planet } from '@/components/Planet'

export default function ExplorePage() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)

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
          position: [6, 0, 0],
          rotationSpeed: 0.00017, 
          orbitSpeed: 0.0083, 
        },
        {
          name: 'Venus',
          textureUrl: '/textures/venus.jpg',
          radius: 0.9,
          position: [9, 0, 0],
          rotationSpeed: -0.00004,
          orbitSpeed: 0.0032, 
        },
        {
          name: 'Earth',
          textureUrl: '/textures/earth.jpg',
          radius: 1,
          position: [12, 0, 0],
          rotationSpeed: 0.01,
          orbitSpeed: 0.002, 
        },
        {
          name: 'Mars',
          textureUrl: '/textures/mars.jpg',
          radius: 0.8,
          position: [15, 0, 0],
          rotationSpeed: 0.0098,
          orbitSpeed: 0.0011,
        },
        {
          name: 'Jupiter',
          textureUrl: '/textures/jupiter.jpg',
          radius: 2.5,
          position: [20, 0, 0],
          rotationSpeed: 0.024,
          orbitSpeed: 0.00017,
        },
        {
          name: 'Saturn',
          textureUrl: '/textures/saturn.jpg',
          radius: 2.2,
          position: [27, 0, 0],
          rotationSpeed: 0.022, 
          orbitSpeed: 0.00007,
        },
        {
          name: 'Uranus',
          textureUrl: '/textures/uranus.jpg',
          radius: 1.6,
          position: [33, 0, 0],
          rotationSpeed: -0.012, 
          orbitSpeed: 0.00003,
        },
        {
          name: 'Neptune',
          textureUrl: '/textures/neptune.jpg',
          radius: 1.5,
          position: [38, 0, 0],
          rotationSpeed: 0.009,
          orbitSpeed: 0.00002,
        },
    ]


  return (
    <div ref={mountRef} className="h-screen w-screen bg-black overflow-hidden">
      {scene &&
        planets.map((planet) => (
          <Planet key={planet.name} scene={scene} {...planet} emissive/>
        ))}
    </div>
  )
}

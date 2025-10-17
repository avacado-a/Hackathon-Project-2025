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

  return (
    <div ref={mountRef} className="h-screen w-screen bg-black overflow-hidden">
      {scene && (
        <>
          <Planet
            scene={scene}
            name="Sun"
            textureUrl="/textures/sun.jpg"
            radius={2}
            position={[0, 0, 0]}
            emissive
            rotationSpeed={0.002}
          />
          <Planet
            scene={scene}
            name="Mercury"
            textureUrl="/textures/mercury.jpg"
            radius={1}
            position={[6, 0, 0]}
            
            rotationSpeed={0.01}
          />
          <Planet
            scene={scene}
            name="Earth"
            textureUrl="/textures/earth.jpg"
            radius={1}
            position={[6, 0, 0]}
            
            rotationSpeed={0.01}
          />
        </>
      )}
    </div>
  )
}

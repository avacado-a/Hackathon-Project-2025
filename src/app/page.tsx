'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Star } from '@/components/Star'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
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
    camera.position.z = 10  
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)  
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate() 
    setScene(scene) 
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize) 
    return () => {
      mount.removeChild(renderer.domElement)
      window.removeEventListener('resize', handleResize)
    }
  }, [])  
  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
      <div ref={mountRef} className="absolute inset-0" />
      {scene && <Star scene={scene} count={8000} area={3000} size={1.5} />}
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <Image
          src="/logo.png"
          alt="Logo"
          width={500}
          height={500}
          className="object-contain"
        />
        <Link href="/explore">
          <button className="px-8 py-6 bg-white text-black rounded-full text-lg font-semibold hover:bg-white/90 transition">
            Start Exploring
          </button>
        </Link>
      </div>
      <footer className="absolute bottom-4 text-gray-400 text-sm z-10">
        © 2025 Astrograph
      </footer>
    </div>
  )
}

'use client'

import * as THREE from 'three'
import { useEffect } from 'react'

type StarProps = {
  scene: THREE.Scene
  count?: number
  area?: number
  size?: number
}

export function Star({
  scene,
  count = 10000,
  area = 4000,
  size = 2,
}: StarProps) {
  useEffect(() => {
    const starGeometry = new THREE.BufferGeometry()
    const starVertices: number[] = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * area
      const y = (Math.random() - 0.5) * area
      const z = (Math.random() - 0.5) * area
      starVertices.push(x, y, z)
    }

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starVertices, 3)
    )

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size,
      sizeAttenuation: true,
    })

    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    const animate = () => {
      requestAnimationFrame(animate)
      stars.rotation.y += 0.0003 // slow drift
    }
    animate()

    return () => {
      scene.remove(stars)
    }
  }, [scene, count, area, size])

  return null
}

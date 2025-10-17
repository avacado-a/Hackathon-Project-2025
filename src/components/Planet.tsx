'use client'

import * as THREE from 'three'
import { useEffect } from 'react'

type Planet = {
    scene: THREE.Scene
    name: string
    textureUrl: string
    radius: number
    position: [number, number, number]
    rotationSpeed?: number
    emissive?: boolean
    orbitSpeed?: number
}

export function Planet({
    scene,
    name,
    textureUrl,
    radius,
    position,
    rotationSpeed = 0.01,
    emissive = false,
    orbitSpeed = 0.001
}: Planet) {
  useEffect(() => {
        const texture = new THREE.TextureLoader().load(textureUrl)
        const material = emissive ? new THREE.MeshBasicMaterial({ map: texture }): new THREE.MeshStandardMaterial({ map: texture })

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 64, 64),
            material
        )
        const pivot = new THREE.Group()
        scene.add(pivot)
        sphere.position.set(...position)
        // sphere.name = name
        scene.add(sphere)
        pivot.add(sphere)

        const animate = () => {
            requestAnimationFrame(animate)
            sphere.rotation.y += rotationSpeed
            pivot.rotation.y += orbitSpeed
        }
        animate()

        return () => {
            scene.remove(sphere)
        }
    }, [scene, name, textureUrl, radius, position, rotationSpeed, emissive])
    return null
}

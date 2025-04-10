import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const Model = forwardRef(({
  color,
  wireframe,
  normalMap,
  roughness,
  metalness,
  emissiveMap,
  aoMap,
  vertexNormals,
  uvChecker,
  useMatcap,
  uploadedTexture
}, ref) => {
  const { scene } = useGLTF('/model/sample.glb')
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  const normalMapTexture = useRef(null)
  const emissiveMapTexture = useRef(null)
  const aoMapTexture = useRef(null)
  const uvCheckerTexture = useRef(null)
  const matcapTexture = useRef(null)

  useEffect(() => {
    const loadTextures = async () => {
      const loader = new THREE.TextureLoader()
      
      const loadTexture = (path) => new Promise((resolve) => {
        loader.load(path, resolve)
      })

      try {
        const promises = []
        
        if (normalMap) promises.push(loadTexture('/textures/normal.jpg').then(tex => normalMapTexture.current = tex))
        if (emissiveMap) promises.push(loadTexture('/textures/emission.jpg').then(tex => emissiveMapTexture.current = tex))
        if (aoMap) promises.push(loadTexture('/textures/ao_map.jpg').then(tex => aoMapTexture.current = tex))
        if (uvChecker) promises.push(loadTexture('/textures/uv_checker.jpg').then(tex => uvCheckerTexture.current = tex))
        if (useMatcap) promises.push(loadTexture('/textures/matcap.png').then(tex => matcapTexture.current = tex))

        await Promise.all(promises)
        setTexturesLoaded(true)
      } catch (error) {
        console.error('Texture loading error:', error)
      }
    }

    loadTextures()

    return () => {
      [normalMapTexture, emissiveMapTexture, aoMapTexture, uvCheckerTexture, matcapTexture].forEach(ref => {
        if (ref.current) ref.current.dispose()
      })
    }
  }, [normalMap, emissiveMap, aoMap, uvChecker, useMatcap])

  useEffect(() => {
    if (!texturesLoaded) return

    scene.traverse((child) => {
        if (child.isMesh) {
          const originalMaterial = child.material
      
          // If useMatcap or uvChecker or uploadedTexture is selected, override material
          if (useMatcap || uvChecker || uploadedTexture) {
            let material
      
            if (useMatcap) {
              material = new THREE.MeshMatcapMaterial({
                matcap: matcapTexture.current,
                wireframe,
              })
            } else {
              material = new THREE.MeshStandardMaterial({
                color: uvChecker ? '#ffffff' : color,
                wireframe,
                roughness,
                metalness,
                normalMap: normalMap ? normalMapTexture.current : null,
                emissiveMap: emissiveMap ? emissiveMapTexture.current : null,
                aoMap: aoMap ? aoMapTexture.current : null,
                map: uvChecker
                  ? uvCheckerTexture.current
                  : uploadedTexture || null,
              })
            }
      
            child.material = material
      
            if (material.map) {
              material.map.encoding = THREE.sRGBEncoding
              material.map.flipY = false
              material.map.needsUpdate = true
            }
          } else {
            // Don't override the original material — just update roughness/metalness if needed
            originalMaterial.wireframe = wireframe
            originalMaterial.roughness = roughness
            originalMaterial.metalness = metalness
            child.material = originalMaterial
          }
      
          if (vertexNormals) {
            child.geometry.computeVertexNormals()
          }
        }
      })
      
  }, [
    scene, color, wireframe, normalMap, emissiveMap, aoMap, roughness,
    metalness, vertexNormals, uvChecker, uploadedTexture, useMatcap, texturesLoaded
  ])

  useImperativeHandle(ref, () => ({
    scene,
    texturesLoaded,
    uploadedTexture
  }))
  

  return <primitive object={scene} scale={1.5} />
})

Model.displayName = 'Model' // This helps with debugging in React DevTools

export default Model
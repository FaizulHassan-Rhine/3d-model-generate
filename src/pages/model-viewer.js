import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import { useControls } from 'leva'
import { GLTFExporter } from 'three-stdlib'
import { saveAs } from 'file-saver'
import * as THREE from 'three'
import Model from '../components/ModelViewer/Model'
import ModelControls from '../components/ModelViewer/ModelControls'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ModelViewer() {
  const [uploadedTexture, setUploadedTexture] = useState(null)
  const modelRef = useRef()
  const [glContext, setGlContext] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState('controls')

  const {
    color,
    wireframe,
    normalMap,
    emissiveMap,
    aoMap,
    roughness,
    metalness,
    vertexNormals,
    uvChecker,
    useMatcap,
  } = useControls({
    color: '#ffffff',
    wireframe: false,
    normalMap: false,
    emissiveMap: false,
    aoMap: false,
    roughness: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0.5, min: 0, max: 1 },
    vertexNormals: false,
    uvChecker: false,
    useMatcap: false,
  })

  const handleTextureUpload = async (e) => {
    const file = e.target.files[0]
    if (!file?.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }
  
    try {
      const bitmap = await createImageBitmap(file)
      const texture = new THREE.CanvasTexture(bitmap)
texture.name = 'custom_uploaded_texture'
texture.encoding = THREE.sRGBEncoding
texture.flipY = false
texture.needsUpdate = true
setUploadedTexture(texture)

    } catch (error) {
      console.error('Texture upload error:', error)
      alert('Failed to process the uploaded texture.')
    }
  }

  const handleExportGLB = async () => {
    if (!modelRef.current?.scene || !modelRef.current?.texturesLoaded) {
      alert('Model or textures are not ready yet. Please wait.')
      return
    }

    setIsExporting(true)
    
    try {
        const uploadedTexture = modelRef.current?.uploadedTexture
      
      sceneClone.traverse((child) => {
        if (child.isMesh && child.material) {
          if (!child.material.map && uploadedTexture) {
            child.material.map = uploadedTexture
            child.material.map.encoding = THREE.sRGBEncoding
            child.material.map.flipY = false
            child.material.map.needsUpdate = true
          }
        }
      })

      const exporter = new GLTFExporter()
      const result = await new Promise((resolve, reject) => {
        exporter.parse(
          sceneClone,
          (glb) => resolve(glb),
          (error) => {
            console.error('Export error:', error)
            reject(error)
          },
          {
            binary: true,
            onlyVisible: false,
            truncateDrawRange: true,
            embedImages: true,
            animations: [],
            forceIndices: true,
            forcePowerOfTwoTextures: true
          }
        )
      })

      const blob = new Blob([result], { type: 'model/gltf-binary' })
      saveAs(blob, 'modified_model.glb')
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export model. See console for details.')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    return () => {
      uploadedTexture?.dispose?.()
    }
  }, [uploadedTexture])

  return (
    <div className="flex h-screen bg-gray-100 text-white overflow-hidden">
      <div className="flex-1 relative">
        <Canvas
          onCreated={({ gl, scene, camera }) => {
            setGlContext({ gl, scene, camera })
          }}
          className="rounded-lg"
        >
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 3, 3]} intensity={1.5} />
          <Model
            ref={modelRef}
            color={color}
            wireframe={wireframe}
            normalMap={normalMap}
            roughness={roughness}
            metalness={metalness}
            emissiveMap={emissiveMap}
            aoMap={aoMap}
            vertexNormals={vertexNormals}
            uvChecker={uvChecker}
            useMatcap={useMatcap}
            uploadedTexture={uploadedTexture}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </div>

      <div className="w-80 bg-gray-800/80 backdrop-blur-md border-l border-gray-700 flex flex-col">
        <ModelControls
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          glContext={glContext}
          handleExportGLB={handleExportGLB}
          isExporting={isExporting}
          handleTextureUpload={handleTextureUpload}
        />
      </div>
    </div>
  )
}
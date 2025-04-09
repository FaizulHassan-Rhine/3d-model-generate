import { useRef, useState, useEffect, Suspense, forwardRef, useImperativeHandle } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import * as THREE from 'three'
import { GLTFExporter } from 'three-stdlib'
import { saveAs } from 'file-saver'
import { FiUpload, FiFolder, FiDownload, FiCamera, FiSettings, FiImage, FiX } from 'react-icons/fi'

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
            normalMap: normalMap && !uvChecker ? normalMapTexture.current : null,
            emissiveMap: emissiveMap && !uvChecker ? emissiveMapTexture.current : null,
            aoMap: aoMap && !uvChecker ? aoMapTexture.current : null,
            map: uvChecker
              ? uvCheckerTexture.current
              : uploadedTexture
                ? uploadedTexture
                : null,
          })
        }

        child.material = material

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
    texturesLoaded
  }))

  return <primitive object={scene} scale={1.5} />
})

function SnapshotButton({ gl, scene, camera }) {
  const handleSnapshot = () => {
    gl.render(scene, camera)
    gl.domElement.toBlob((blob) => {
      if (blob) {
        saveAs(blob, 'snapshot.png')
      }
    })
  }

  return (
    <button
      onClick={handleSnapshot}
      className="flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 w-full rounded-lg hover:opacity-90 transition-all text-sm font-medium shadow-lg"
    >
      <FiCamera /> Export Snapshot (.png)
    </button>
  )
}

export default function Home() {
  const inputRef = useRef(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [modelVisible, setModelVisible] = useState(false)
  const [uploadedTexture, setUploadedTexture] = useState(null)
  const modelRef = useRef()
  const [glContext, setGlContext] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState('controls')
  const [showUploadModal, setShowUploadModal] = useState(false)

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

  const handleUpload = (files) => {
    const validImages = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (validImages.length < 5) {
      alert('Please upload at least 5 images!')
      return
    }

    setImages(validImages.map(file => URL.createObjectURL(file)))
    setLoading(true)
    setShowUploadModal(false)

    setTimeout(() => {
      setLoading(false)
      setModelVisible(true)
    }, 3000)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

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
      setUploadedTexture(texture)
    } catch (error) {
      console.error('Texture upload error:', error)
      alert('Failed to process the uploaded texture.')
    }
  }

  const handleDownloadImages = () => {
    images.forEach((url, index) => {
      const a = document.createElement('a')
      a.href = url
      a.download = `image_${index + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
  }

  const handleExportGLB = async () => {
    if (!modelRef.current?.scene || !modelRef.current?.texturesLoaded) {
      alert('Model or textures are not ready yet. Please wait.')
      return
    }

    setIsExporting(true)
    
    try {
      const sceneClone = modelRef.current.scene.clone(true)
      
      sceneClone.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.type === 'MeshMatcapMaterial') {
            const mat = new THREE.MeshStandardMaterial({
              color: child.material.color,
              map: child.material.matcap,
              roughness: 0.5,
              metalness: 0.5
            })
            child.material = mat
          }

          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding
            child.material.map.flipY = false
          }
          if (child.material.normalMap) {
            child.material.normalMap.encoding = THREE.LinearEncoding
            child.material.normalMap.flipY = false
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
      images.forEach(url => URL.revokeObjectURL(url))
    }
  }, [uploadedTexture, images])

  return (
    <div
      className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Left Sidebar - Gallery */}
      {images.length > 0 && (
        <div className="w-20 bg-gray-800/80 backdrop-blur-md p-4 overflow-y-auto border-r border-gray-700 flex flex-col items-center">
          <h2 className="font-bold text-xs text-center mb-4 text-gray-400">GALLERY</h2>
          <div className="flex flex-col gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  alt={`upload-${idx}`} 
                  className="w-12 h-12 border-2 border-gray-600 object-cover rounded-lg hover:border-indigo-500 transition-all cursor-pointer" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-lg">
                  <FiDownload className="text-white text-xs" />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleDownloadImages}
            className="mt-auto flex items-center justify-center gap-1 bg-indigo-600/50 hover:bg-indigo-600 p-2 rounded-lg text-xs transition-all"
          >
            <FiDownload size={14} /> All
          </button>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        {/* Upload Modal */}
        {showUploadModal && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Source Images</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-all"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <FiUpload className="mx-auto text-2xl mb-2 text-gray-400" />
                  <p className="text-sm text-gray-300">Click to select files</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600/80 hover:bg-blue-600 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm"
                  >
                    <FiImage /> Select Files
                  </label>
                  
                  <input
                    type="file"
                    id="folder-upload"
                    accept="image/*"
                    multiple
                    webkitdirectory="true"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  <label 
                    htmlFor="folder-upload" 
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600/80 hover:bg-green-600 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm"
                  >
                    <FiFolder /> Select Folder
                  </label>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-4 text-center">
                Minimum 5 images required for 3D reconstruction
              </p>
            </div>
          </div>
        )}

        {!modelVisible && !loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                3D Model Generator
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Upload multiple images to generate and customize your 3D model with advanced material controls
              </p>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-lg shadow-lg hover:opacity-90 transition-all"
              >
                Start Uploading Images
              </button>
              
              <div className="mt-8 flex justify-center gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiUpload size={20} className="text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-300">Upload Images</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiSettings size={20} className="text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-300">Customize Model</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FiDownload size={20} className="text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300">Export Results</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-medium">Processing Your Model</h2>
              <p className="text-gray-400 mt-2">This may take a few moments...</p>
            </div>
          </div>
        )}

        {modelVisible && (
          <Canvas
            onCreated={({ gl, scene, camera }) => {
              setGlContext({ gl, scene, camera })
            }}
            className="rounded-lg"
          >
            <Environment preset="studio" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 3, 3]} intensity={1.5} />
            <Suspense fallback={
              <Html center className="text-white text-sm">
                Loading 3D Model...
              </Html>
            }>
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
            </Suspense>
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          </Canvas>
        )}
      </div>

      {/* Right Sidebar - Controls */}
      {modelVisible && (
        <div className="w-80 bg-gray-800/80 backdrop-blur-md border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiSettings /> Model Controls
            </h2>
          </div>
          
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'controls' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'export' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              Export
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'controls' ? (
              <>
                <div className="mb-6">
                  <Leva 
                    collapsed={false} 
                    fill 
                    flat 
                    hideCopyButton
                    theme={{
                      sizes: {
                        controlWidth: '100px',
                      },
                      colors: {
                        accent1: '#818cf8',
                        accent2: '#6366f1',
                        accent3: '#4f46e5',
                      }
                    }}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Custom Texture</label>
                  <label className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm">
                    <FiUpload size={14} />
                    <span>Upload Texture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTextureUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleExportGLB}
                  disabled={isExporting}
                  className={`flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 w-full rounded-lg hover:opacity-90 transition-all font-medium shadow-lg ${
                    isExporting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  <FiDownload />
                  {isExporting ? 'Exporting Model...' : 'Download GLB File'}
                </button>

                {glContext && (
                  <SnapshotButton
                    gl={glContext.gl}
                    scene={glContext.scene}
                    camera={glContext.camera}
                  />
                )}

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Export Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Include Textures</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Binary Format</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import { FiUpload, FiSettings, FiDownload, FiShare2 } from 'react-icons/fi'
import UploadModal from '../components/UploadModal/UploadModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { useRouter } from 'next/router'
import ModelUploader from '@/components/ModelUploader/ModelUploader'
import Link from 'next/link'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEmbedModal, setShowEmbedModal] = useState(false)
  
  const router = useRouter()

  const handleUpload = (files) => {
    const validImages = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (validImages.length < 5) {
      alert('Please upload at least 5 images!')
      return
    }

    setLoading(true)
    setShowUploadModal(false)

    setTimeout(() => {
      setLoading(false)
      router.push('/model-viewer')
    }, 3000)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {loading && <LoadingSpinner />}
      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={handleUpload} 
        />
      )}
     

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
            3D Model Generator
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Create, customize and share 3D models from images
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FiUpload /> Upload Images
            </button>
            <Link
              href="/embaded-model-view"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-medium shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <FiShare2 /> Generate Embed
            </Link>
          </div>
          
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
              <p className="text-sm text-gray-300">Export & Share</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
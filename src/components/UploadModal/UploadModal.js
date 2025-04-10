import { FiUpload, FiFolder, FiImage, FiX } from 'react-icons/fi'
import UploadDropzone from './UploadDropzone'

export default function UploadModal({ onClose, onUpload }) {
  const handleFileUpload = (e) => {
    onUpload(e.target.files)
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Source Images</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <UploadDropzone onUpload={onUpload} />
          
          <div className="flex gap-2">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
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
              onChange={handleFileUpload}
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
  )
}
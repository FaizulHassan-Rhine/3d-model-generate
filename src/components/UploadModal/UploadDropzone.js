import { FiUpload } from "react-icons/fi"

export default function UploadDropzone({ onUpload }) {
    const handleDrop = (e) => {
      e.preventDefault()
      onUpload(e.dataTransfer.files)
    }
  
    const handleDragOver = (e) => {
      e.preventDefault()
    }
  
    return (
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-all"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <FiUpload className="mx-auto text-2xl mb-2 text-gray-400" />
        <p className="text-sm text-gray-300">Click to select files</p>
        <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
      </div>
    )
  }
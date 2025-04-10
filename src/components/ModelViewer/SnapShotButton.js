import { saveAs } from 'file-saver'
import { FiCamera } from 'react-icons/fi'

export default function SnapshotButton({ gl, scene, camera }) {
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
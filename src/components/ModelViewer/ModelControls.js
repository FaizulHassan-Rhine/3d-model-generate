import { Leva } from 'leva'
import { FiUpload, FiDownload, FiSettings, FiCamera } from 'react-icons/fi'
import SnapshotButton from './SnapShotButton'


export default function ModelControls({
  activeTab,
  setActiveTab,
  glContext,
  handleExportGLB,
  isExporting,
  handleTextureUpload
}) {
  return (
    <>
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
              <label className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm">
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
    </>
  )
}
// pages/index.js
import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [embedCode, setEmbedCode] = useState('');

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const modelId = Math.random().toString(36).substring(2, 10);
    const blobUrl = URL.createObjectURL(uploadedFile);

    localStorage.setItem(`model-${modelId}`, blobUrl); // Save for embed
    const iframeCode = `<iframe src="${window.location.origin}/embed/${modelId}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`;

    setFile(uploadedFile);
    setEmbedCode(iframeCode);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Upload 3D Model (.glb/.gltf)</h1>

      <input
        type="file"
        accept=".glb,.gltf"
        onChange={handleUpload}
        className="mb-4 p-2"
      />

      {embedCode && (
        <div className="bg-gray-800 p-4 rounded w-full max-w-2xl mt-4">
          <h2 className="text-xl mb-2">Embed Code:</h2>
          <textarea
            readOnly
            className="w-full p-2 bg-gray-700 rounded"
            rows={4}
            value={embedCode}
          />
          <p className="text-sm text-green-400 mt-2">You can paste this iframe anywhere!</p>
        </div>
      )}
    </div>
  );
}

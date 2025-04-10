import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/router';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useProgress } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';

function Model({ url }) {
  const { scene } = useGLTF(url);
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return <primitive object={scene} dispose={null} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: 'white', fontSize: '1.2rem' }}>{progress.toFixed(0)}% loading...</div>
    </Html>
  );
}

export default function EmbedViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [modelUrl, setModelUrl] = useState(null);

  useEffect(() => {
    if (id) {
      const storedUrl = localStorage.getItem(`model-${id}`);
      if (storedUrl) setModelUrl(storedUrl);
    }
  }, [id]);

  if (!modelUrl) {
    return <div className="text-white text-center mt-20">Loading model...</div>;
  }

  return (
    <div className="w-full h-screen bg-white">
  <Canvas
    shadows
    camera={{ position: [2, 2, 4], fov: 45 }}
    style={{ background: 'white' }} // sets actual canvas background
  >
    <Suspense fallback={<Loader />}>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[5, 5, 5]}
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Model url={modelUrl} />
      <OrbitControls />
    </Suspense>
  </Canvas>
</div>

  );
}

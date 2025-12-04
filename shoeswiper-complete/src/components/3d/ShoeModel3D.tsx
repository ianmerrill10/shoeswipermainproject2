import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// TYPES
// ============================================

interface ShoeModel3DProps {
  modelUrl: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  backgroundColor?: string;
  showShadow?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface ShoeModelProps {
  url: string;
  onLoad?: () => void;
}

// ============================================
// LOADING INDICATOR
// ============================================

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white text-sm font-medium">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
}

// ============================================
// 3D SHOE MODEL COMPONENT
// ============================================

function ShoeModel({ url, onLoad }: ShoeModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      // Center the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);

      // Scale to fit
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      scene.scale.setScalar(scale);

      // Notify parent
      onLoad?.();
    }
  }, [scene, onLoad]);

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
    </group>
  );
}

// ============================================
// AUTO-ROTATE CONTROLLER
// ============================================

function AutoRotate({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    if (enabled) {
      angle.current += delta * 0.5;
      camera.position.x = Math.sin(angle.current) * 5;
      camera.position.z = Math.cos(angle.current) * 5;
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

// ============================================
// MAIN 3D VIEWER COMPONENT
// ============================================

export function ShoeModel3D({
  modelUrl,
  autoRotate = true,
  enableZoom = true,
  enablePan = false,
  backgroundColor = '#18181b',
  showShadow = true,
  onLoad,
  onError,
}: ShoeModel3DProps) {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error) => {
    console.error('3D Model loading error:', error);
    setHasError(true);
    onError?.(error);
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <p className="text-red-400 text-sm">Failed to load 3D model</p>
          <p className="text-zinc-500 text-xs mt-1">Using image fallback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onPointerDown={() => setIsUserInteracting(true)}
        onPointerUp={() => setIsUserInteracting(false)}
        onPointerLeave={() => setIsUserInteracting(false)}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <spotLight
          position={[-10, 10, -10]}
          angle={0.15}
          penumbra={1}
          intensity={0.5}
        />
        <pointLight position={[0, -10, 0]} intensity={0.3} />

        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* 3D Model with Suspense */}
        <Suspense fallback={<Loader />}>
          <ShoeModel url={modelUrl} onLoad={onLoad} />
        </Suspense>

        {/* Shadow */}
        {showShadow && (
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />
        )}

        {/* Controls */}
        <OrbitControls
          enableZoom={enableZoom}
          enablePan={enablePan}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />

        {/* Auto-rotate when not interacting */}
        <AutoRotate enabled={autoRotate && !isUserInteracting} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <p className="text-white/70 text-xs">Drag to rotate • Pinch to zoom</p>
      </div>
    </div>
  );
}

// ============================================
// PRELOAD UTILITY
// ============================================

export function preloadShoeModel(url: string) {
  useGLTF.preload(url);
}

export default ShoeModel3D;

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { X, RotateCcw, Box } from 'lucide-react'

// Подменяем все URL текстур на пустой пиксель — никаких 404 и краша WebGL
const BLANK_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='
const noTexManager = new THREE.LoadingManager()
noTexManager.setURLModifier(url => {
  // Перехватываем только текстуры, FBX-файл пропускаем как есть
  if (/\.(jpe?g|png|exr|tga|bmp|hdr|tiff?)(\?.*)?$/i.test(url)) return BLANK_PNG
  return url
})

const neutralMat = new THREE.MeshStandardMaterial({
  color: '#94a3b8',
  roughness: 0.6,
  metalness: 0.15,
  side: THREE.DoubleSide,
})

function FBXScene({ url }) {
  const fbx = useLoader(FBXLoader, url, loader => { loader.manager = noTexManager })
  const ref = useRef()

  useEffect(() => {
    if (!ref.current) return

    const box = new THREE.Box3().setFromObject(ref.current)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    ref.current.position.sub(center)
    if (maxDim > 0) ref.current.scale.setScalar(2 / maxDim)

    // Заменяем все материалы на нейтральный — избегаем 404 текстур и крэша WebGL
    ref.current.traverse(child => {
      if (child.isMesh) {
        child.material = neutralMat
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [fbx])

  return <primitive ref={ref} object={fbx} />
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#334155" wireframe />
    </mesh>
  )
}

export default function Model3DViewer({ modelUrl, title }) {
  const [open, setOpen] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [canvasKey, setCanvasKey] = useState(0)
  const [error, setError] = useState(false)
  const controlsRef = useRef()

  if (!modelUrl) return null

  const isFbx = modelUrl.toLowerCase().includes('.fbx')
  if (!isFbx) return null

  const handleOpen = () => {
    setError(false)
    setCanvasReady(false)
    setOpen(true)
    // Даём браузеру один кадр освободить старый WebGL-контекст,
    // затем монтируем Canvas с новым ключом
    requestAnimationFrame(() => {
      setCanvasKey(k => k + 1)
      setCanvasReady(true)
    })
  }

  const resetCamera = () => {
    if (controlsRef.current) controlsRef.current.reset()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all text-sm font-medium"
      >
        <Box className="w-4 h-4" />
        Просмотр 3D модели
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-900/90 z-10">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Box className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-medium">{title}</span>
                <span className="text-slate-600">·</span>
                <span>Используйте мышь для вращения и зума</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetCamera}
                  title="Сбросить камеру"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1">
              {error ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                  <Box className="w-12 h-12 opacity-30" />
                  <p className="text-sm">Не удалось загрузить 3D модель</p>
                </div>
              ) : canvasReady ? (
                <Canvas
                  key={canvasKey}
                  camera={{ position: [0, 1, 4], fov: 50 }}
                  shadows
                  gl={{ antialias: true }}
                  onCreated={({ gl }) => {
                    gl.setClearColor('#0f172a')
                  }}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
                  <directionalLight position={[-4, 2, -4]} intensity={0.4} />

                  <Suspense fallback={<LoadingFallback />}>
                    <FBXScene
                      url={modelUrl}
                      onError={() => setError(true)}
                    />
                    <Environment preset="city" />
                  </Suspense>

                  <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.08}
                    minDistance={0.5}
                    maxDistance={20}
                    autoRotate
                    autoRotateSpeed={0.8}
                  />

                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
                    <circleGeometry args={[3, 64]} />
                    <meshStandardMaterial color="#1e293b" roughness={0.8} />
                  </mesh>
                </Canvas>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Loader overlay */}
            <div
              id="model-loading"
              className="absolute inset-0 top-12 flex items-center justify-center bg-slate-900/60 pointer-events-none"
              style={{ animation: 'fadeOut 0.5s 2s forwards' }}
            >
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Загрузка модели...</span>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeOut { to { opacity: 0; pointer-events: none; } }
      `}</style>
    </>
  )
}

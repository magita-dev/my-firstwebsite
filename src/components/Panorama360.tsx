import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Package } from '../types';
import { 
  Rotate3d, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Play, 
  Pause, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface Panorama360Props {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
  onBookNow: (packageId: string) => void;
}

// High-resolution real 360 equirectangular photo of Times Square at night
const TIMES_SQUARE_PANORAMA_URL = 
  'https://upload.wikimedia.org/wikipedia/commons/4/4b/Times_Square_360_panorama_at_night.jpg';
// Low-res fallback preview placeholder
const FALLBACK_PANORAMA_URL = 
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2400&q=80';

export const Panorama360: React.FC<Panorama360Props> = ({ packages, onSelectPackage, onBookNow }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(25);
  const [webGLAvailable, setWebGLAvailable] = useState(true);
  const [isParallaxMode, setIsParallaxMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<Package | null>(null);
  const [cameraFov, setCameraFov] = useState(72);
  const [currentHeading, setCurrentHeading] = useState(0); // in degrees
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parallax fallback state
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const reqAnimRef = useRef<number | null>(null);

  // Interaction coordinates
  const isUserInteracting = useRef(false);
  const onPointerDownPointerX = useRef(0);
  const onPointerDownPointerY = useRef(0);
  const onPointerDownLon = useRef(0);
  const onPointerDownLat = useRef(0);
  const lon = useRef(0);
  const lat = useRef(5);
  const phi = useRef(0);
  const theta = useRef(0);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const isIdle = useRef(false);

  // Hotspots 2D screen positions
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<{
    id: string;
    x: number;
    y: number;
    visible: boolean;
    packageItem: Package;
  }[]>([]);

  // Function to create a synthetic photographic equirectangular texture if network fails
  const createFallbackTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Dark midnight blue sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0, '#050814');
    skyGrad.addColorStop(0.35, '#0B132B');
    skyGrad.addColorStop(0.5, '#1C2541');
    skyGrad.addColorStop(0.65, '#2D1B36'); // purple/neon evening glow
    skyGrad.addColorStop(1, '#0F121C');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Stars / Snow dust in night sky
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * 2048;
      const sy = Math.random() * 450;
      const sr = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Manhattan skyscraper skyline silhouettes around horizon
    const buildingColors = ['#10172A', '#1E293B', '#0F172A', '#131D38'];
    for (let x = 0; x < 2048; x += 40 + Math.random() * 50) {
      const bw = 35 + Math.random() * 45;
      const bh = 220 + Math.random() * 280;
      const by = 550 - bh;
      ctx.fillStyle = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      ctx.fillRect(x, by, bw, bh);

      // Lit windows
      ctx.fillStyle = Math.random() > 0.4 ? '#FEF08A' : '#93C5FD';
      for (let wy = by + 20; wy < 530; wy += 14) {
        for (let wx = x + 5; wx < x + bw - 6; wx += 9) {
          if (Math.random() > 0.4) {
            ctx.fillRect(wx, wy, 4, 6);
          }
        }
      }
    }

    // Times Square Vibrant Billboards & Neon signs
    const billboards = [
      { x: 300, y: 350, w: 220, h: 140, color: '#DC2626', text: 'BROADWAY' },
      { x: 620, y: 320, w: 260, h: 180, color: '#2563EB', text: 'TIMES SQUARE' },
      { x: 980, y: 360, w: 190, h: 130, color: '#D97706', text: 'RADIO CITY' },
      { x: 1300, y: 330, w: 280, h: 170, color: '#7C3AED', text: 'HOLIDAY SPECTACULAR' },
      { x: 1700, y: 350, w: 200, h: 140, color: '#059669', text: 'ROCKEFELLER' }
    ];

    billboards.forEach(b => {
      // Glow
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 30;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;

      // Inner screen border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(b.x + 4, b.y + 4, b.w - 8, b.h - 8);

      // Billboard Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2 + 8);
    });

    // Street Ground & reflections
    const streetGrad = ctx.createLinearGradient(0, 550, 0, 1024);
    streetGrad.addColorStop(0, '#1E293B');
    streetGrad.addColorStop(0.3, '#0F172A');
    streetGrad.addColorStop(1, '#05070D');
    ctx.fillStyle = streetGrad;
    ctx.fillRect(0, 550, 2048, 474);

    // Festive yellow taxi headlights & reflection streaks
    for (let i = 0; i < 24; i++) {
      const tx = (i * 90) % 2048;
      const ty = 580 + (i * 15) % 180;
      ctx.fillStyle = '#FBBF24'; // Yellow cab
      ctx.fillRect(tx, ty, 50, 24);
      // Red taillights
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(tx + 46, ty + 6, 6, 12);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  };

  // Check WebGL availability
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLAvailable(false);
        setIsParallaxMode(true);
      }
    } catch {
      setWebGLAvailable(false);
      setIsParallaxMode(true);
    }
  }, []);

  // Initialize Three.js 360 viewer
  useEffect(() => {
    if (!webGLAvailable || isParallaxMode || !canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(cameraFov, width / height, 1, 1200);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Sphere geometry (inverted so normals face inward)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial low-res / procedural material while high-res loads
    const initialTexture = createFallbackTexture();
    const material = new THREE.MeshBasicMaterial({
      map: initialTexture
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Load High-Res Equirectangular Panorama
    const textureLoader = new THREE.TextureLoader();
    setLoadProgress(45);

    textureLoader.load(
      TIMES_SQUARE_PANORAMA_URL,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        material.map = texture;
        material.needsUpdate = true;
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 300);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(Math.min(95, Math.max(40, percent)));
        }
      },
      () => {
        // Fallback to secondary photo or generated canvas
        textureLoader.load(
          FALLBACK_PANORAMA_URL,
          (fbTexture) => {
            fbTexture.mapping = THREE.EquirectangularReflectionMapping;
            material.map = fbTexture;
            material.needsUpdate = true;
            setIsLoading(false);
          },
          undefined,
          () => {
            // Procedural texture already applied
            setIsLoading(false);
          }
        );
      }
    );

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Render & Animation loop
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);

      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      // Gentle auto-rotation when user is not actively dragging
      if (autoRotate && !isUserInteracting.current) {
        lon.current += 0.055;
      }

      // Constrain latitude (pitch) to avoid gimbal flipping
      lat.current = Math.max(-85, Math.min(85, lat.current));

      phi.current = THREE.MathUtils.degToRad(90 - lat.current);
      theta.current = THREE.MathUtils.degToRad(lon.current);

      const targetX = 500 * Math.sin(phi.current) * Math.cos(theta.current);
      const targetY = 500 * Math.cos(phi.current);
      const targetZ = 500 * Math.sin(phi.current) * Math.sin(theta.current);

      cameraRef.current.lookAt(targetX, targetY, targetZ);

      // Current compass heading
      const degHeading = Math.round(((lon.current % 360) + 360) % 360);
      setCurrentHeading(degHeading);

      // Project hotspots from 3D sphere coordinates to 2D screen positions
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;

        const updatedPositions = packages.map((pkg) => {
          const hs = pkg.hotspot;
          // Calculate 3D sphere coordinate
          const hsPhi = THREE.MathUtils.degToRad(90 - hs.pitch);
          const hsTheta = THREE.MathUtils.degToRad(hs.yaw);
          const r = hs.distance || 460;

          const hx = r * Math.sin(hsPhi) * Math.cos(hsTheta);
          const hy = r * Math.cos(hsPhi);
          const hz = r * Math.sin(hsPhi) * Math.sin(hsTheta);

          const posVector = new THREE.Vector3(hx, hy, hz);
          posVector.project(cameraRef.current!);

          // Check if hotspot is in front of the camera
          const isVisible = posVector.z < 1;
          const sx = (posVector.x * 0.5 + 0.5) * cw;
          const sy = (-(posVector.y * 0.5) + 0.5) * ch;

          return {
            id: hs.id,
            x: sx,
            y: sy,
            visible: isVisible && sx >= 0 && sx <= cw && sy >= 0 && sy <= ch,
            packageItem: pkg
          };
        });

        setHotspotScreenPositions(updatedPositions);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (sphereMeshRef.current) {
        sphereMeshRef.current.geometry.dispose();
        if (Array.isArray(sphereMeshRef.current.material)) {
          sphereMeshRef.current.material.forEach(m => m.dispose());
        } else {
          sphereMeshRef.current.material.dispose();
        }
      }
    };
  }, [webGLAvailable, isParallaxMode, autoRotate, cameraFov, packages]);

  // Pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isUserInteracting.current = true;
    onPointerDownPointerX.current = e.clientX;
    onPointerDownPointerY.current = e.clientY;
    onPointerDownLon.current = lon.current;
    onPointerDownLat.current = lat.current;

    if (idleTimer.current) clearTimeout(idleTimer.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isUserInteracting.current) return;

    // Movement speed multiplier
    const factor = 0.12;
    lon.current = (onPointerDownPointerX.current - e.clientX) * factor + onPointerDownLon.current;
    lat.current = (e.clientY - onPointerDownPointerY.current) * factor + onPointerDownLat.current;
  };

  const handlePointerUp = () => {
    isUserInteracting.current = false;

    // Idle timer to resume gentle rotation after 3 seconds
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      isIdle.current = true;
    }, 3000);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setCameraFov((prev) => {
      const nextFov = Math.max(38, Math.min(92, prev + e.deltaY * 0.05));
      if (cameraRef.current) {
        cameraRef.current.fov = nextFov;
        cameraRef.current.updateProjectionMatrix();
      }
      return nextFov;
    });
  };

  // Reset view to default Broadway marquee angle
  const handleResetView = () => {
    lon.current = -30;
    lat.current = 6;
    setCameraFov(72);
    if (cameraRef.current) {
      cameraRef.current.fov = 72;
      cameraRef.current.updateProjectionMatrix();
    }
    setActiveHotspot(null);
  };

  // Zoom buttons
  const handleZoom = (direction: 'in' | 'out') => {
    setCameraFov((prev) => {
      const step = direction === 'in' ? -10 : 10;
      const nextFov = Math.max(38, Math.min(92, prev + step));
      if (cameraRef.current) {
        cameraRef.current.fov = nextFov;
        cameraRef.current.updateProjectionMatrix();
      }
      return nextFov;
    });
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Parallax mouse movement handler for fallback mode
  const handleParallaxMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseParallax({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none bg-[#0B132B] ${
        isFullscreen ? 'h-screen fixed inset-0 z-50' : 'h-[620px] lg:h-[720px] rounded-2xl border border-[#D4AF37]/25 shadow-2xl'
      }`}
      onWheel={handleWheel}
      onMouseMove={isParallaxMode ? handleParallaxMouseMove : undefined}
    >
      {/* 3D WebGL Canvas */}
      {!isParallaxMode && (
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      )}

      {/* Graceful Parallax Photo Fallback Layer (when WebGL disabled or requested) */}
      {isParallaxMode && (
        <div className="relative w-full h-full overflow-hidden">
          {/* Background Layer: Night Sky & Distant Towers */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=2000&q=80')`,
              transform: `translate3d(${mouseParallax.x * -20}px, ${mouseParallax.y * -15}px, 0)`
            }}
          />

          {/* Midground Layer: Times Square Neon & Billboards */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-90 transition-transform duration-150 ease-out scale-110"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=2000&q=80')`,
              transform: `translate3d(${mouseParallax.x * -35}px, ${mouseParallax.y * -25}px, 0)`
            }}
          />

          {/* Foreground Glow Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-transparent to-[#0B132B]/60" />

          {/* Fallback interactive hotspots positioned across the scene */}
          <div className="absolute inset-0 pointer-events-auto">
            {packages.slice(0, 4).map((pkg, idx) => {
              const positions = [
                { top: '38%', left: '25%' },
                { top: '48%', left: '72%' },
                { top: '28%', left: '52%' },
                { top: '65%', left: '38%' }
              ];
              const pos = positions[idx % positions.length];
              return (
                <div 
                  key={pkg.id} 
                  className="absolute"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot?.id === pkg.id ? null : pkg)}
                    className="relative group p-2 focus:outline-none"
                    aria-label={`View ${pkg.name}`}
                  >
                    <span className="absolute -inset-1 rounded-full bg-[#D4AF37]/40 animate-ping opacity-75" />
                    <span className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B132B]/90 border border-[#D4AF37] text-xs font-semibold text-[#F3E5AB] shadow-lg backdrop-blur-md">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{pkg.hotspot.title}</span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !isParallaxMode && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0B132B]/95 backdrop-blur-md text-white transition-opacity duration-500">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
            <Sparkles className="w-6 h-6 text-[#D4AF37] absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#F3E5AB] tracking-wide mb-1">
            Loading Times Square 360°
          </h3>
          <p className="text-sm text-slate-300 mb-4">
            Rendering holiday lights & panoramic coordinates ({loadProgress}%)
          </p>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-300 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 3D Hotspot Screen Anchors (Rendered in DOM over WebGL) */}
      {!isParallaxMode && showHotspots && !isLoading && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {hotspotScreenPositions.map(({ id, x, y, visible, packageItem }) => {
            if (!visible) return null;
            const isSelected = activeHotspot?.id === packageItem.id;

            return (
              <div
                key={id}
                className="absolute pointer-events-auto transition-transform duration-75"
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
                  zIndex: isSelected ? 30 : 20
                }}
              >
                {/* Hotspot Pulsing Beacon */}
                <button
                  onClick={() => setActiveHotspot(isSelected ? null : packageItem)}
                  className={`group relative flex items-center justify-center focus:outline-none transition-transform duration-200 ${
                    isSelected ? 'scale-125' : 'hover:scale-115'
                  }`}
                  aria-label={`Hotspot for ${packageItem.hotspot.title}`}
                >
                  {/* Glowing Rings */}
                  <span className="absolute w-8 h-8 rounded-full bg-[#D4AF37]/35 hotspot-pulse" />
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9E2A2B] to-[#D4AF37] p-0.5 shadow-lg border border-white/80 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </span>

                  {/* Floating Tag */}
                  <div className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#0B132B]/90 backdrop-blur-md border border-[#D4AF37]/50 text-slate-100 text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                    <span>{packageItem.hotspot.title}</span>
                    <span className="ml-1.5 text-[#F3E5AB] font-normal">· ${packageItem.price}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Hotspot Interactive Tooltip Card */}
      {activeHotspot && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md bg-[#0B132B]/95 backdrop-blur-xl border border-[#D4AF37]/60 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex gap-4">
            {/* Package Photo */}
            <div className="w-28 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
              <img 
                src={activeHotspot.image} 
                alt={activeHotspot.name}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 px-1 py-0.5 rounded text-slate-300">
                {activeHotspot.duration}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                    {activeHotspot.category}
                  </span>
                  <button 
                    onClick={() => setActiveHotspot(null)}
                    className="text-slate-400 hover:text-white p-0.5 rounded"
                    aria-label="Close tooltip"
                  >
                    ✕
                  </button>
                </div>
                <h4 className="font-serif font-bold text-white text-sm line-clamp-1">
                  {activeHotspot.name}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                  {activeHotspot.tagline}
                </p>
              </div>

              {/* Price & Book CTA */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-slate-400 block">From</span>
                  <span className="text-lg font-bold text-[#F3E5AB] font-serif">
                    ${activeHotspot.price}
                  </span>
                  <span className="text-xs text-slate-400 font-normal"> / person</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onSelectPackage(activeHotspot);
                      setActiveHotspot(null);
                    }}
                    className="px-2.5 py-1.5 text-xs text-slate-200 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      onBookNow(activeHotspot.id);
                      setActiveHotspot(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] hover:from-[#E5C158] hover:to-[#D4AF37] rounded-md shadow-md transition-transform active:scale-95"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Compass / Mode Indicator */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-200 shadow-lg">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Heading {currentHeading}°</span>
            <span className="text-slate-400">·</span>
            <span className="text-[#F3E5AB]">Times Square 360°</span>
          </div>

          {/* Mode Switcher (3D vs Parallax) */}
          <button
            onClick={() => setIsParallaxMode(!isParallaxMode)}
            className="glass-panel px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all flex items-center gap-1.5"
            title="Toggle between 3D WebGL and 2.5D Parallax fallback"
          >
            <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">{isParallaxMode ? 'Switch to 3D Sphere' : 'Parallax Fallback'}</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              showHotspots ? 'bg-[#D4AF37] text-[#0B132B]' : 'glass-panel text-slate-300 hover:text-white'
            }`}
            title={showHotspots ? 'Hide 3D Hotspots' : 'Show 3D Hotspots'}
            aria-label="Toggle Hotspots"
          >
            {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              autoRotate ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F3E5AB]' : 'glass-panel text-slate-300 hover:text-white'
            }`}
            title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
            aria-label="Toggle Auto-Rotation"
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg glass-panel text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all"
            title="Reset View Orientation"
            aria-label="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoom('in')}
            className="p-2 rounded-lg glass-panel text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all hidden sm:block"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom('out')}
            className="p-2 rounded-lg glass-panel text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all hidden sm:block"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg glass-panel text-slate-300 hover:text-white hover:border-[#D4AF37] transition-all"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-xs text-slate-400 pointer-events-none">
        <div className="glass-panel px-3 py-1 rounded-full flex items-center gap-1.5">
          <Rotate3d className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Drag to look around · Scroll to zoom · Click pins to explore packages</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400">
          <span>Times Square, New York</span>
          <span className="text-[#D4AF37]">✦</span>
          <span>Holiday Season</span>
        </div>
      </div>
    </div>
  );
};

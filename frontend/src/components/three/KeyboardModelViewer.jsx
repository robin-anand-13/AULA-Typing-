import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three-stdlib';
import { RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function KeyboardModelViewer({ height = '460px', interactive = true }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef(null);
  const resetCameraRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Detect WebGL
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setError('WebGL acceleration is not available on this browser.');
      setLoading(false);
      return;
    }

    const width = currentMount.clientWidth || 500;
    const h = parseInt(height, 10) || 460;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup - positioned elevated and angled down towards the keyboard top face
    const camera = new THREE.PerspectiveCamera(38, width / h, 0.1, 100);
    camera.position.set(0, 11, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);

    // OrbitControls for true interactive 3D inspection
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Don't flip under the floor
    controls.minDistance = 5;
    controls.maxDistance = 24;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    resetCameraRef.current = () => {
      camera.position.set(0, 11, 10);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    // Sophisticated Multi-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfff7ea, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffecd2, 3.2);
    keyLight.position.set(6, 16, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7da4d4, 2.0);
    fillLight.position.set(-8, 10, -6);
    scene.add(fillLight);

    const accentLight = new THREE.DirectionalLight(0xd4c4a8, 2.4);
    accentLight.position.set(0, 14, -8);
    scene.add(accentLight);

    // Subtle under-glow plane
    const pointGlow = new THREE.PointLight(0xd3a376, 2.5, 15);
    pointGlow.position.set(0, 1, 0);
    scene.add(pointGlow);

    let keyboardRoot = null;
    let animationFrameId = null;

    // Load Aula F75 GLB Model
    const loader = new GLTFLoader();
    loader.load(
      '/models/keyboard.glb',
      (gltf) => {
        keyboardRoot = gltf.scene;

        // Enhance materials
        keyboardRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.side = THREE.DoubleSide;
              child.material.needsUpdate = true;
            }
          }
        });

        // Compute Bounding Box
        const bbox = new THREE.Box3().setFromObject(keyboardRoot);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;

        // Target size roughly 8.5 units wide
        const desiredScale = 8.5 / maxDim;
        keyboardRoot.scale.setScalar(desiredScale);

        // Center on X and Y, and orient Z flat facing upwards
        // Blender exporter is Z-up; in Three.js Y is up, so rotate -90 deg on X
        keyboardRoot.rotation.x = -Math.PI / 2;
        
        // Recalculate center after rotation to ensure perfect centroid
        const orientedBox = new THREE.Box3().setFromObject(keyboardRoot);
        const orientedCenter = orientedBox.getCenter(new THREE.Vector3());
        
        keyboardRoot.position.x = -orientedCenter.x;
        keyboardRoot.position.y = -orientedCenter.y + 0.3;
        keyboardRoot.position.z = -orientedCenter.z;

        scene.add(keyboardRoot);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Failed to load Aula F75 3D model:', err);
        setError('Interactive 3D model could not be rendered.');
        setLoading(false);
      }
    );

    // Animation loop
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controls) {
        controls.autoRotate = autoRotate && !prefersReducedMotion;
        controls.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      camera.aspect = newWidth / h;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [height, autoRotate]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden' }}>
      {/* 3D Model HUD & Interactive Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          fontWeight: 800
        }}>
          3D Interactive Showcase
        </div>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Aula F75 Mechanical Keyboard
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Click & Drag to rotate · Scroll to zoom
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          className="glass-btn"
          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Turntable Rotation"
        >
          <RotateCw size={14} className={autoRotate ? 'spin-slow' : ''} />
          {autoRotate ? 'Rotating' : 'Paused'}
        </button>
        <button
          className="glass-btn"
          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
          onClick={() => resetCameraRef.current && resetCameraRef.current()}
          title="Reset Camera Angle"
        >
          <Maximize2 size={14} /> Reset View
        </button>
      </div>

      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '12px',
          color: 'var(--color-accent)', background: 'rgba(13, 27, 42, 0.65)'
        }}>
          <div className="spinner-ring" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading 3D Aula F75 Model...</span>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}

      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
    </div>
  );
}

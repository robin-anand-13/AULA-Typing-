import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import logoNoBgUrl from '../../assets/logo-no-bg.png';

export default function Intro3DLogo({ onComplete }) {
  const mountRef = useRef(null);
  const [fading, setFading] = useState(false);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    // If the component already finished in this mount, skip
    if (hasFinishedRef.current) return;

    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Perspective Camera, and Alpha Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);

    // 2. Atmospheric 3D Lighting matching the original logo neon aura
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointBlue = new THREE.PointLight(0x3b82f6, 4.0, 14);
    pointBlue.position.set(-3.5, 0, 3);
    scene.add(pointBlue);

    const pointMagenta = new THREE.PointLight(0xec4899, 3.5, 12);
    pointMagenta.position.set(0, -1.8, 3);
    scene.add(pointMagenta);

    const pointEmerald = new THREE.PointLight(0x10b981, 4.0, 14);
    pointEmerald.position.set(3.5, 0, 3);
    scene.add(pointEmerald);

    const pointAmber = new THREE.PointLight(0xf59e0b, 3.0, 10);
    pointAmber.position.set(1.5, 1.2, 3);
    scene.add(pointAmber);

    // 3. Create Multi-layered 3D Extruded Plate from Clean Logo
    const textureLoader = new THREE.TextureLoader();
    let logoMesh = null;
    let glowMesh = null;
    let particlesMesh = null;

    textureLoader.load(logoNoBgUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      // Primary front plate (aspect ratio 810 x 546 = 1.483)
      const aspect = 810 / 546;
      const h = 3.6;
      const w = h * aspect;

      const geometry = new THREE.PlaneGeometry(w, h);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.25,
        metalness: 0.1,
        emissive: new THREE.Color(0x222222),
        side: THREE.DoubleSide,
        depthWrite: false
      });

      logoMesh = new THREE.Mesh(geometry, material);
      logoMesh.position.set(0, 0, 0.15); // Layered slightly forward
      scene.add(logoMesh);

      // Secondary back depth layer to give true 3D spatial thickness
      const backMat = material.clone();
      backMat.color = new THREE.Color(0x000000);
      backMat.opacity = 0.85;
      const backMesh = new THREE.Mesh(geometry, backMat);
      backMesh.position.set(0, 0, -0.15);
      scene.add(backMesh);

      // Deep glowing aura behind logo
      const glowMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      glowMesh = new THREE.Mesh(geometry, glowMat);
      glowMesh.position.set(0, 0, -0.05);
      glowMesh.scale.set(1.04, 1.04, 1);
      scene.add(glowMesh);

      // Initial Entrance Angle & Scale
      logoMesh.scale.set(0.1, 0.1, 0.1);
      logoMesh.rotation.x = 0.35;
      logoMesh.rotation.y = -0.45;
      backMesh.scale.copy(logoMesh.scale);
      backMesh.rotation.copy(logoMesh.rotation);
      glowMesh.scale.copy(logoMesh.scale);
      glowMesh.rotation.copy(logoMesh.rotation);
    });

    // Ambient floating star dust particles
    const particleCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 16;
      pPos[i + 1] = (Math.random() - 0.5) * 10;
      pPos[i + 2] = (Math.random() - 0.5) * 6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xd4c4a8,
      size: 0.04,
      transparent: true,
      opacity: 0.5
    });
    particlesMesh = new THREE.Points(pGeo, pMat);
    scene.add(particlesMesh);

    // 4. Smooth, Cinematic Animation Timeline (Total ~3.8 seconds for smooth pacing)
    const startTime = Date.now();
    let animationFrameId = null;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;

      if (logoMesh) {
        if (elapsed < 1.8) {
          // Smooth ease-out zoom and leveling rotation
          const t = elapsed / 1.8;
          const easeOut = 1 - Math.pow(1 - t, 4); // Quartic ease out for fluid deceleration
          const currentScale = 0.1 + easeOut * 0.95;
          logoMesh.scale.set(currentScale, currentScale, currentScale);
          logoMesh.rotation.x = 0.35 * (1 - easeOut);
          logoMesh.rotation.y = -0.45 * (1 - easeOut);
        } else {
          // Continuous gentle 3D spatial float
          logoMesh.rotation.y = Math.sin(elapsed * 1.4) * 0.06;
          logoMesh.rotation.x = Math.cos(elapsed * 1.4) * 0.04;
          logoMesh.position.y = Math.sin(elapsed * 2.2) * 0.08;
        }

        // Keep companion meshes synchronized
        scene.children.forEach(child => {
          if (child !== logoMesh && child !== particlesMesh && child.isMesh) {
            child.scale.copy(logoMesh.scale);
            child.rotation.copy(logoMesh.rotation);
            child.position.y = logoMesh.position.y;
          }
        });
      }

      if (particlesMesh) {
        particlesMesh.rotation.y += 0.0008;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 5. Single-play smooth completion after 3.8s total
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 3200);

    const finishTimer = setTimeout(() => {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true;
        if (onComplete) onComplete();
      }
    }, 3800);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0D1B2A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: fading ? 'none' : 'auto'
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          letterSpacing: '0.18em',
          color: 'var(--color-text-primary)',
          textTransform: 'uppercase'
        }}>
          Aula<span style={{ color: 'var(--color-accent)' }}>.Typing</span>
        </div>
        <div style={{
          fontSize: '0.78rem',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.14em',
          marginTop: '6px'
        }}>
          INITIALIZING 3D ENVIRONMENT...
        </div>
      </div>
    </div>
  );
}

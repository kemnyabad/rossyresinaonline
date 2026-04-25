import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeDAnforaProps {
  participants: string[];
  activeName?: string;
  entryCount?: number;
  spinPulseKey?: number;
  showControls?: boolean;
  onWinner?: (winner: string) => void;
}

const safeName = (name?: string) => {
  const value = String(name || '').trim();
  return value || 'Participante';
};

const makeTicketTexture = (name: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(40, 6, 35, 0.22)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.roundRect(18, 18, 220, 58, 12);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#7a1f61';
  ctx.font = '900 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(safeName(name).toUpperCase().slice(0, 18), 128, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
};

const ThreeDAnfora = ({
  participants,
  activeName,
  entryCount = 1,
  spinPulseKey = 0,
  showControls = false,
  onWinner,
}: ThreeDAnforaProps) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const drumRef = useRef<THREE.Group | null>(null);
  const ticketsRef = useRef<Array<{ mesh: THREE.Mesh; base: THREE.Vector3; phase: number; radius: number }>>([]);
  const speedRef = useRef(0.018);
  const targetSpeedRef = useRef(0.018);
  const stoppingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const namesRef = useRef<string[]>([]);
  const [winner, setWinner] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  const visualNames = useMemo(() => {
    const current = Array.from({ length: Math.min(Math.max(entryCount, 1), 14) }, () => safeName(activeName));
    const pool = [...current, ...participants].filter(Boolean);
    return pool.length > 0 ? pool.slice(0, 32) : ['Participante'];
  }, [activeName, entryCount, participants]);

  useEffect(() => {
    namesRef.current = visualNames;
  }, [visualNames]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf7d1e7, 7, 15);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.15, 6.3);
    camera.lookAt(0, 0.75, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lighting: soft ambient fill plus directional/key lights for acrylic reflections.
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.8, 5.5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd8ef, 1.6);
    rimLight.position.set(-4, 2.6, -3);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshStandardMaterial({ color: 0x5d164b, transparent: true, opacity: 0.18, roughness: 0.6 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.55;
    floor.receiveShadow = true;
    scene.add(floor);

    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x111114, metalness: 0.65, roughness: 0.32 });
    const acrylicMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      transmission: 0.55,
      thickness: 0.35,
      ior: 1.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const drum = new THREE.Group();
    drumRef.current = drum;
    drum.position.y = 0.78;
    scene.add(drum);

    // Transparent rotating barrel.
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 2.7, 40, 1, false), acrylicMaterial);
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    drum.add(body);

    // Acrylic rings and slot help read the object as a real raffle drum.
    const ringMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.06, clearcoat: 1 });
    [-1.38, 1.38].forEach((x) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.025, 12, 64), ringMaterial);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = x;
      drum.add(ring);
    });

    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.035, 0.025),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.78, roughness: 0.18 })
    );
    slot.position.set(0, 0.96, 0.18);
    drum.add(slot);

    // Static black metal stand.
    const postGeometry = new THREE.CylinderGeometry(0.045, 0.045, 2.35, 18);
    [-1.48, 1.48].forEach((x) => {
      const post = new THREE.Mesh(postGeometry, standMaterial);
      post.position.set(x, -0.25, 0);
      post.castShadow = true;
      scene.add(post);
    });

    const makeBar = (width: number, position: THREE.Vector3, rotationZ = 0) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.08, 0.1), standMaterial);
      bar.position.copy(position);
      bar.rotation.z = rotationZ;
      bar.castShadow = true;
      scene.add(bar);
    };
    makeBar(3.2, new THREE.Vector3(0, -1.42, 0));
    makeBar(1.18, new THREE.Vector3(-1.18, -1.68, 0), -0.22);
    makeBar(1.18, new THREE.Vector3(1.18, -1.68, 0), 0.22);

    [-1.72, 1.72].forEach((x) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.055, 12, 24), standMaterial);
      wheel.position.set(x, -1.78, 0.05);
      wheel.rotation.y = Math.PI / 2;
      wheel.castShadow = true;
      scene.add(wheel);
    });

    const rebuildTickets = () => {
      ticketsRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();
        drum.remove(mesh);
      });
      ticketsRef.current = [];

      namesRef.current.slice(0, 30).forEach((name, index) => {
        const texture = makeTicketTexture(name);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.18), material);
        const angle = (index * 2.399) % (Math.PI * 2);
        const radius = 0.18 + ((index * 37) % 48) / 100;
        const x = -0.95 + ((index * 53) % 190) / 100;
        const y = Math.cos(angle) * radius * 0.7;
        const z = Math.sin(angle) * radius * 0.95;
        mesh.position.set(x, y, z);
        mesh.rotation.set(Math.sin(angle) * 0.8, angle, Math.cos(angle) * 0.8);
        drum.add(mesh);
        ticketsRef.current.push({ mesh, base: mesh.position.clone(), phase: angle, radius });
      });
    };

    rebuildTickets();

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(mount);

    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.045;
      drum.rotation.x += speedRef.current;
      drum.rotation.y = Math.sin(elapsed * 0.45) * 0.08;

      ticketsRef.current.forEach((ticket, index) => {
        const intensity = Math.min(1, Math.abs(speedRef.current) * 16);
        const wobble = elapsed * (1.1 + index * 0.017) + ticket.phase;
        ticket.mesh.position.x = ticket.base.x + Math.sin(wobble * 0.8) * 0.08 * intensity;
        ticket.mesh.position.y = ticket.base.y + Math.cos(wobble * 1.35) * 0.22 * intensity;
        ticket.mesh.position.z = ticket.base.z + Math.sin(wobble * 1.1) * 0.18 * intensity;
        ticket.mesh.rotation.x += 0.014 * intensity;
        ticket.mesh.rotation.y += 0.022 * intensity;
        ticket.mesh.rotation.z += 0.017 * intensity;
      });

      if (stoppingRef.current && Math.abs(speedRef.current) < 0.004) {
        targetSpeedRef.current = 0;
        speedRef.current = 0;
        stoppingRef.current = false;
        setIsSpinning(false);
        const pool = namesRef.current.length > 0 ? namesRef.current : ['Participante'];
        const selected = pool[Math.floor(Math.random() * pool.length)];
        setWinner(selected);
        onWinner?.(selected);
      }

      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const namesInterval = window.setInterval(rebuildTickets, 1200);

    return () => {
      window.clearInterval(namesInterval);
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      ticketsRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.dispose();
      });
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [onWinner]);

  useEffect(() => {
    targetSpeedRef.current = 0.075;
    window.setTimeout(() => {
      if (!isSpinning) targetSpeedRef.current = 0.022;
    }, 850);
  }, [spinPulseKey, entryCount, isSpinning]);

  const startDraw = () => {
    setWinner('');
    stoppingRef.current = false;
    setIsSpinning(true);
    targetSpeedRef.current = 0.12;
  };

  const stopDraw = () => {
    stoppingRef.current = true;
    targetSpeedRef.current = 0;
  };

  return (
    <div className="w-full">
      <div className="relative h-[360px] w-full overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.24),transparent_34%),linear-gradient(135deg,rgba(122,31,97,.16),rgba(255,255,255,.06))]">
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      {showControls && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startDraw}
            className="rounded-full bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#7a1f61] shadow-sm transition hover:bg-[#fff4fb] active:scale-95"
          >
            Iniciar sorteo
          </button>
          <button
            type="button"
            onClick={stopDraw}
            className="rounded-full bg-[#2a1024] px-4 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#180a14] active:scale-95"
          >
            Detener
          </button>
        </div>
      )}

      {showControls && winner && (
        <div className="mt-4 rounded-2xl bg-white/14 px-4 py-3 text-center text-white backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Ticket seleccionado</p>
          <p className="mt-1 text-xl font-black">{winner}</p>
        </div>
      )}
    </div>
  );
};

export default ThreeDAnfora;

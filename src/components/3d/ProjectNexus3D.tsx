import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Sparkles,
  Box,
  Layers,
  Activity,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type Model3DMode = 'architecture' | 'velocity' | 'riskRadar';

interface ProjectNexus3DProps {
  height?: string;
  interactive?: boolean;
  theme?: 'dark' | 'light';
  showControls?: boolean;
  initialMode?: Model3DMode;
  title?: string;
  subtitle?: string;
}

export const ProjectNexus3D: React.FC<ProjectNexus3DProps> = ({
  height = '380px',
  interactive = true,
  showControls = true,
  initialMode = 'architecture',
  title = 'Interactive 3D Project Telemetry',
  subtitle = 'Drag to rotate • Click nodes to inspect milestone telemetry'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Model3DMode>(initialMode);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(7);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<{
    title: string;
    type: string;
    metric: string;
    status: 'success' | 'warning' | 'info';
    details: string;
  } | null>({
    title: 'Phase II: Edge Prototype Node',
    type: 'Capstone Milestone',
    metric: 'Weightage: 35%',
    status: 'success',
    details: 'Hardware breadboard telemetry and API latency benchmarking verified.'
  });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = zoomLevel;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Master group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.8);
    dirLight1.position.set(5, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.2);
    dirLight2.position.set(-5, -4, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // ==========================================
    // BUILD 3D OBJECTS BASED ON ACTIVE MODE
    // ==========================================
    const dynamicObjects: {
      update?: (time: number, speed: number) => void;
      satellites?: THREE.Mesh[];
    } = {};

    if (mode === 'architecture') {
      // MODE 1: CAPSTONE ARCHITECTURE NEXUS
      // Central Polyhedron
      const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x4f46e5,
        roughness: 0.25,
        metalness: 0.85,
        wireframe: wireframe,
        emissive: 0x312e81,
        emissiveIntensity: 0.5
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      masterGroup.add(coreMesh);

      // Outer Cage
      const cageGeo = new THREE.IcosahedronGeometry(2.1, 1);
      const cageMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.35
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      masterGroup.add(cageMesh);

      // Orbiting Rings
      const ringGeo1 = new THREE.TorusGeometry(2.8, 0.035, 16, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.65
      });
      const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 3;
      masterGroup.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(3.3, 0.025, 16, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.5
      });
      const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.y = Math.PI / 4;
      ring2.rotation.x = -Math.PI / 6;
      masterGroup.add(ring2);

      // Orbiting Satellites (Milestones)
      const sats: THREE.Mesh[] = [];
      const satColors = [0x10b981, 0x6366f1, 0xf59e0b, 0xec4899];
      const satData = [
        { title: 'Project Proposal', metric: 'Weightage: 15%', type: 'Milestone 1', status: 'success' as const, details: 'Problem statement, literature survey, and hardware architecture baseline approved.' },
        { title: 'System Architecture', metric: 'Weightage: 20%', type: 'Milestone 2', status: 'success' as const, details: 'Database schemas, sensor interface pinouts, and cloud security rules validated.' },
        { title: 'Edge Prototype', metric: 'Weightage: 35%', type: 'Milestone 3', status: 'warning' as const, details: 'Working IoT sensor gateway integration and real-time inference telemetry active.' },
        { title: 'Final Viva Voce', metric: 'Weightage: 30%', type: 'Milestone 4', status: 'info' as const, details: 'Individual Q&A defense rubric, code plagiarism verification, and viva marks allocation.' }
      ];

      for (let i = 0; i < 4; i++) {
        const sGeo = new THREE.OctahedronGeometry(0.32, 0);
        const sMat = new THREE.MeshStandardMaterial({
          color: satColors[i],
          roughness: 0.2,
          metalness: 0.9,
          emissive: satColors[i],
          emissiveIntensity: 0.5
        });
        const satMesh = new THREE.Mesh(sGeo, sMat);
        satMesh.userData = { ...satData[i], angle: (i * Math.PI) / 2, radius: 2.9 };
        masterGroup.add(satMesh);
        sats.push(satMesh);
      }
      dynamicObjects.satellites = sats;

      dynamicObjects.update = (time, speed) => {
        masterGroup.rotation.y += 0.005 * speed;
        masterGroup.rotation.x += 0.002 * speed;
        ring1.rotation.z += 0.01 * speed;
        ring2.rotation.z -= 0.008 * speed;

        sats.forEach((sat, idx) => {
          const angle = sat.userData.angle + time * 0.5 * (idx % 2 === 0 ? 1 : -0.8) * speed;
          const radius = sat.userData.radius;
          sat.position.x = Math.cos(angle) * radius;
          sat.position.z = Math.sin(angle) * radius;
          sat.position.y = Math.sin(time * 1.6 + idx) * 0.7;
          sat.rotation.x += 0.02 * speed;
          sat.rotation.y += 0.03 * speed;
        });

        const pulse = 1 + Math.sin(time * 2) * 0.03;
        coreMesh.scale.set(pulse, pulse, pulse);
      };
    } else if (mode === 'velocity') {
      // MODE 2: TEAM VELOCITY HELIX (DNA OF CODE SPRINT)
      const helixPointsA: THREE.Vector3[] = [];
      const helixPointsB: THREE.Vector3[] = [];
      const numNodes = 36;
      const heightSpan = 5;
      const radius = 1.8;

      for (let i = 0; i < numNodes; i++) {
        const t = (i / numNodes) * Math.PI * 4;
        const y = ((i / numNodes) - 0.5) * heightSpan;
        helixPointsA.push(new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius));
        helixPointsB.push(new THREE.Vector3(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius));
      }

      // Add spheres at nodes
      const nodeMeshes: THREE.Mesh[] = [];
      helixPointsA.forEach((pos, idx) => {
        const isComplete = idx < 26;
        const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sMat = new THREE.MeshStandardMaterial({
          color: isComplete ? 0x10b981 : 0x6366f1,
          emissive: isComplete ? 0x059669 : 0x4338ca,
          emissiveIntensity: 0.6
        });
        const mesh = new THREE.Mesh(sGeo, sMat);
        mesh.position.copy(pos);
        mesh.userData = {
          title: `Task #${idx + 1}: ${isComplete ? 'Merged Git Artifact' : 'Sprint Backlog Item'}`,
          type: 'Velocity Node',
          metric: isComplete ? 'Status: Completed' : 'Status: In Progress',
          status: isComplete ? 'success' : 'info',
          details: `Commit tracking node. Verifiable individual code contribution logged by sprint reviewer.`
        };
        masterGroup.add(mesh);
        nodeMeshes.push(mesh);

        // Connecting rungs
        if (idx % 2 === 0) {
          const posB = helixPointsB[idx];
          const cylCurve = new THREE.LineCurve3(pos, posB);
          const cylGeo = new THREE.TubeGeometry(cylCurve, 1, 0.03, 8, false);
          const cylMat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.4 });
          masterGroup.add(new THREE.Mesh(cylGeo, cylMat));
        }
      });

      helixPointsB.forEach((pos, idx) => {
        const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(sGeo, sMat);
        mesh.position.copy(pos);
        mesh.userData = {
          title: `Telemetry Checkpoint #${idx + 1}`,
          type: 'Review Gate',
          metric: 'Automated CI/CD Pass',
          status: 'success',
          details: 'Continuous integration pass rate: 98.4% across 4 active student repositories.'
        };
        masterGroup.add(mesh);
        nodeMeshes.push(mesh);
      });

      dynamicObjects.satellites = nodeMeshes;
      dynamicObjects.update = (time, speed) => {
        masterGroup.rotation.y += 0.012 * speed;
      };
    } else {
      // MODE 3: AI RISK RADAR (SPHERICAL MONITORING SCANNER)
      const radarSphereGeo = new THREE.SphereGeometry(2.3, 24, 24);
      const radarSphereMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      const radarSphere = new THREE.Mesh(radarSphereGeo, radarSphereMat);
      masterGroup.add(radarSphere);

      // Scanning Equator Sweep Ring
      const scanRingGeo = new THREE.RingGeometry(2.3, 2.38, 64);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
      scanRing.rotation.x = Math.PI / 2;
      masterGroup.add(scanRing);

      // Ping Beacons (At-Risk & On-Track Teams)
      const beaconsData = [
        { pos: [1.8, 0.8, 1.0], color: 0xef4444, title: 'Group 09: Autonomous Drone', metric: 'Risk: High (Score: 80/100)', status: 'warning' as const, details: 'Critical milestone delay detected: Edge Prototype is 5 days overdue with zero commits this week.' },
        { pos: [-1.6, 1.2, 0.7], color: 0x10b981, title: 'Group 04: MedFlow IoT', metric: 'Risk: Low (Score: 18/100)', status: 'success' as const, details: 'Healthy sprint velocity. Phase II deliverables uploaded and verified on schedule.' },
        { pos: [0.5, -1.8, 1.2], color: 0xf59e0b, title: 'Group 07: AgroDrone Vision', metric: 'Risk: Moderate (Score: 52/100)', status: 'warning' as const, details: 'Minor deliverable rework requested by guide Prof. Rajeshwar Sharma.' },
        { pos: [-1.2, -1.4, -1.2], color: 0x10b981, title: 'Group 02: EduBlock Ledger', metric: 'Risk: Low (Score: 12/100)', status: 'success' as const, details: 'Optimal group contribution balance: 4/4 members have verified pull requests.' }
      ];

      const beaconMeshes: THREE.Mesh[] = [];
      beaconsData.forEach((b) => {
        const bGeo = new THREE.DodecahedronGeometry(0.24, 0);
        const bMat = new THREE.MeshStandardMaterial({
          color: b.color,
          roughness: 0.1,
          emissive: b.color,
          emissiveIntensity: 0.8
        });
        const bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(b.pos[0] as number, b.pos[1] as number, b.pos[2] as number);
        bMesh.userData = {
          title: b.title,
          type: 'Group Risk Beacon',
          metric: b.metric,
          status: b.status,
          details: b.details
        };
        masterGroup.add(bMesh);
        beaconMeshes.push(bMesh);
      });

      dynamicObjects.satellites = beaconMeshes;
      dynamicObjects.update = (time, speed) => {
        masterGroup.rotation.y += 0.007 * speed;
        masterGroup.rotation.x = Math.sin(time * 0.5) * 0.2;
        scanRing.position.y = Math.sin(time * 2 * speed) * 1.8;

        beaconMeshes.forEach((mesh, idx) => {
          const s = 1 + Math.sin(time * 4 + idx) * 0.2;
          mesh.scale.set(s, s, s);
        });
      };
    }

    // Particle Cloud / Starfield
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 11;
      particlePositions[i + 1] = (Math.random() - 0.5) * 11;
      particlePositions[i + 2] = (Math.random() - 0.5) * 11;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.045,
      transparent: true,
      opacity: 0.65
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse Interaction (Tilt, Drag, and Raycasting click on nodes)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let mouseTilt = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseTilt = { x: x * 0.35, y: y * 0.35 };

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        masterGroup.rotation.y += deltaX * 0.009;
        masterGroup.rotation.x += deltaY * 0.009;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      isDragging = false;
      // Raycast click
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      if (dynamicObjects.satellites && dynamicObjects.satellites.length > 0) {
        const intersects = raycaster.intersectObjects(dynamicObjects.satellites, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.title) {
            setSelectedNodeInfo({
              title: hit.userData.title,
              type: hit.userData.type || 'Telemetry Node',
              metric: hit.userData.metric || '',
              status: hit.userData.status || 'info',
              details: hit.userData.details || 'Live project telemetry logged.'
            });
          }
        }
      }
    };

    if (interactive) {
      container.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentSpeed = isPaused ? 0 : rotationSpeed;

      if (dynamicObjects.update) {
        dynamicObjects.update(elapsedTime, currentSpeed);
      }

      // Smooth camera tilt follow
      masterGroup.rotation.y += (mouseTilt.x - masterGroup.rotation.y) * 0.02;
      masterGroup.rotation.x += (-mouseTilt.y - masterGroup.rotation.x) * 0.02;

      particleSystem.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [mode, wireframe, rotationSpeed, isPaused, zoomLevel]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(4.5, Math.min(10.5, prev + delta));
      if (cameraRef.current) {
        cameraRef.current.position.z = next;
      }
      return next;
    });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* 3D Model Header with Mode Tabs */}
      <div className="p-3.5 border-b border-slate-200/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                Three.js 3D
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 3D Model View Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setMode('architecture')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'architecture'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Architecture</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('velocity')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'velocity'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Velocity Helix</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('riskRadar')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'riskRadar'
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Risk Radar</span>
          </button>
        </div>
      </div>

      {/* Main 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing select-none relative"
        title="Interactive 3D Viewport: Click & drag to rotate in 3D. Click any satellite to inspect telemetry."
      />

      {/* Interactive Selected Node Inspector Overlay */}
      {selectedNodeInfo && (
        <div className="absolute top-16 left-3 right-3 sm:right-auto sm:max-w-xs z-20 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-indigo-200 dark:border-indigo-900/60 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {selectedNodeInfo.type}
            </span>
            <button
              onClick={() => setSelectedNodeInfo(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>

          <div className="font-extrabold text-slate-900 dark:text-white text-xs">
            {selectedNodeInfo.title}
          </div>

          <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            {selectedNodeInfo.status === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{selectedNodeInfo.metric}</span>
          </div>

          <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
            {selectedNodeInfo.details}
          </p>
        </div>
      )}

      {/* Bottom Interactive Controls */}
      {showControls && (
        <div className="p-2.5 border-t border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title={isPaused ? 'Resume Rotation' : 'Pause Rotation'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() =>
                setRotationSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))
              }
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              title="Change rotation speed"
            >
              <RotateCw className="w-3 h-3" />
              <span>{rotationSpeed}x Speed</span>
            </button>

            <button
              onClick={() => setWireframe(!wireframe)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                wireframe
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Wireframe
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleZoom(-0.8)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline ml-1">
              WebGL 60 FPS
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

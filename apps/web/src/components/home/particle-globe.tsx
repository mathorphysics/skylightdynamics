import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Minimal pseudo-noise used to scatter particles into "landmass" clusters,
// mirroring the reference globe. Pure function — no state.
function noise(x: number, y: number, z: number) {
	let n = Math.sin(x * 3) + Math.cos(y * 3) + Math.sin(z * 3);
	n += Math.sin(x * 6 + y * 2) * 0.5;
	n += Math.cos(y * 6 + z * 2) * 0.5;
	return n / 2.0;
}

function createGlowTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 64;
	const ctx = canvas.getContext('2d')!;
	const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
	gradient.addColorStop(0.2, 'rgba(100, 200, 255, 0.8)');
	gradient.addColorStop(0.5, 'rgba(0, 50, 255, 0.2)');
	gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, 64, 64);
	return new THREE.CanvasTexture(canvas);
}

/**
 * Interactive particle globe — the cinematic opening visual for the homepage.
 * Auto-rotates with a soft reflection and surface glow, and tilts gently
 * toward the pointer on desktop. Particle density and pixel ratio are reduced
 * on mobile for performance, and all motion is skipped under reduced-motion.
 */
export function ParticleGlobe() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const isMobile = window.innerWidth < 768;

		let width = container.clientWidth;
		let height = container.clientHeight;

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x030814, 0.025);

		const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
		camera.position.set(0, 5, 25);

		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
		renderer.setSize(width, height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
		container.appendChild(renderer.domElement);

		const glowTexture = createGlowTexture();

		const radius = 8;
		const widthSegments = isMobile ? 130 : 200;
		const heightSegments = isMobile ? 65 : 100;

		const globeGroup = new THREE.Group();
		scene.add(globeGroup);

		const positions: number[] = [];
		const colors: number[] = [];
		const reflectionColors: number[] = [];

		const colorLand = new THREE.Color(0xddeeff);
		const colorOcean = new THREE.Color(0x0033aa);
		const colorHighlight = new THREE.Color(0xffffff);

		for (let i = 0; i <= heightSegments; i++) {
			const v = i / heightSegments;
			const lat = (v - 0.5) * Math.PI;
			for (let j = 0; j <= widthSegments; j++) {
				const u = j / widthSegments;
				const lon = u * Math.PI * 2;
				const x = radius * Math.cos(lat) * Math.cos(lon);
				const y = radius * Math.sin(lat);
				const z = radius * Math.cos(lat) * Math.sin(lon);
				const noiseVal = noise(x * 0.15, y * 0.15, z * 0.15);
				const isLand = noiseVal > 0.1;
				if (isLand || Math.random() > 0.85) {
					positions.push(x, y, z);
					if (isLand) {
						if (Math.random() > 0.98) {
							colors.push(colorHighlight.r, colorHighlight.g, colorHighlight.b);
							reflectionColors.push(colorHighlight.r, colorHighlight.g, colorHighlight.b);
						} else {
							colors.push(colorLand.r, colorLand.g, colorLand.b);
							reflectionColors.push(colorLand.r * 0.5, colorLand.g * 0.5, colorLand.b * 0.5);
						}
					} else {
						colors.push(colorOcean.r, colorOcean.g, colorOcean.b);
						reflectionColors.push(colorOcean.r * 0.2, colorOcean.g * 0.2, colorOcean.b * 0.2);
					}
				}
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 0.25,
			map: glowTexture,
			transparent: true,
			opacity: 0.9,
			vertexColors: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		const globe = new THREE.Points(geometry, material);
		globeGroup.add(globe);

		const reflectionGeometry = new THREE.BufferGeometry();
		reflectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		reflectionGeometry.setAttribute('color', new THREE.Float32BufferAttribute(reflectionColors, 3));
		const reflectionMaterial = new THREE.PointsMaterial({
			size: 0.25,
			map: glowTexture,
			transparent: true,
			opacity: 0.25,
			vertexColors: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		const reflection = new THREE.Points(reflectionGeometry, reflectionMaterial);
		reflection.scale.y = -1;
		reflection.position.y = -radius * 2.05;
		globeGroup.add(reflection);

		const planeGeometry = new THREE.PlaneGeometry(100, 100);
		const planeMaterial = new THREE.MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.7,
			depthWrite: false,
		});
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = -radius - 0.2;
		scene.add(plane);

		const ambientLight = new THREE.PointLight(0x0066ff, 1, 30);
		ambientLight.position.set(0, -radius, 0);
		scene.add(ambientLight);

		const clock = new THREE.Clock();
		let rafId = 0;
		let targetX = 0;

		const onPointerMove = (e: PointerEvent) => {
			targetX = (e.clientX / window.innerWidth - 0.5) * 3;
		};
		window.addEventListener('pointermove', onPointerMove);

		function animate() {
			rafId = requestAnimationFrame(animate);
			const t = clock.getElapsedTime();
			globeGroup.rotation.y = t * 0.05;
			globeGroup.position.y = Math.sin(t * 0.5) * 0.2;
			camera.position.x += (targetX - camera.position.x) * 0.03;
			camera.lookAt(0, 0, 0);
			renderer.render(scene, camera);
		}

		if (reduceMotion) {
			renderer.render(scene, camera);
		} else {
			animate();
		}

		function onResize() {
			width = container!.clientWidth;
			height = container!.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		}
		window.addEventListener('resize', onResize);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('resize', onResize);
			geometry.dispose();
			reflectionGeometry.dispose();
			planeGeometry.dispose();
			material.dispose();
			reflectionMaterial.dispose();
			planeMaterial.dispose();
			glowTexture.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode === container) {
				container!.removeChild(renderer.domElement);
			}
		};
	}, []);

	return <div ref={containerRef} className="particle-globe" aria-hidden="true" />;
}

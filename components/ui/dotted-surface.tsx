'use client';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

// Extremely optimized Shader for DottedSurface to eradicate lag
const vertexShader = `
uniform float uTime;
attribute vec3 color;
varying vec3 vColor;
varying float vDepth;

void main() {
    vColor = color;
    vec3 pos = position;
    
    // Calculate synthetic ix and iy based on world positions
    float ix = (pos.x / 150.0) + 20.0;
    float iy = (pos.z / 150.0) + 30.0;
    
    // Animate Y position with sine waves on the GPU
    pos.y = sin((ix + uTime) * 0.3) * 50.0 + sin((iy + uTime) * 0.5) * 50.0;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -mvPosition.z;
    
    // sizeAttenuation equivalent
    gl_PointSize = 6.0 * (1000.0 / vDepth);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vColor;
varying float vDepth;

void main() {
    // Make points circular and soft instead of sharp squares
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    // Smooth fade based on distance from camera
    float depthAlpha = smoothstep(1800.0, 500.0, vDepth) * smoothstep(100.0, 400.0, vDepth);
    float alpha = (0.5 - ll) * 2.0;
    
    // Set overall opacity significantly lower for subtlety (0.25)
    gl_FragColor = vec4(vColor, alpha * 0.25 * depthAlpha);
}
`;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const { theme } = useTheme();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const SEPARATION = 150;
		const AMOUNTX = 40;
		const AMOUNTY = 60;

		// Scene setup
		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x08090a, 2000, 10000);

		const camera = new THREE.PerspectiveCamera(
			60,
			containerRef.current.clientWidth / containerRef.current.clientHeight,
			1,
			10000,
		);
		// Lowered camera to look through the waves elegantly
		camera.position.set(0, 180, 1000);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true,
			powerPreference: "high-performance",
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
		renderer.setClearColor(scene.fog.color, 0);

		containerRef.current.appendChild(renderer.domElement);

		// Create particles
		const positions: number[] = [];
		const colors: number[] = [];
		const geometry = new THREE.BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0; // GPU will animate this
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				// Quantr Accent Green colors
				colors.push(0.0, 0.91, 0.48);
			}
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

		// Use ShaderMaterial instead of PointsMaterial to eliminate CPU calculations
		const material = new THREE.ShaderMaterial({
			uniforms: {
				uTime: { value: 0.0 }
			},
			vertexShader,
			fragmentShader,
			transparent: true,
			depthWrite: false, // Better for overlapping transparent particles
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let animationId: number;
		const clock = new THREE.Clock();

		let isRunning = true;

		// Animation function is incredibly lightweight
		const animate = () => {
			if (!isRunning) return;
			
			// Always enqueue next frame first thing
			animationId = requestAnimationFrame(animate);

			// Update uniform
			if (material.uniforms) {
				material.uniforms.uTime.value = clock.getElapsedTime() * 2.5; 
				material.uniformsNeedUpdate = true;
			}

			renderer.render(scene, camera);
		};

		// Handle window resize
		const handleResize = () => {
			if (!containerRef.current) return;
			camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
		};

		window.addEventListener('resize', handleResize);
		animate(); // Start loop

		// Cleanup
		return () => {
			isRunning = false;
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);

			geometry.dispose();
			material.dispose();
			renderer.dispose();

			if (containerRef.current && renderer.domElement) {
				try {
					containerRef.current.removeChild(renderer.domElement);
				} catch (e) {
					// Element might be unmounted already
				}
			}
		};
	}, [theme]);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
			style={{ minHeight: '100%' }}
			{...props}
		/>
	);
}

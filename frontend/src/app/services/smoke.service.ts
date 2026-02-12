import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({
    providedIn: 'root'
})
export class SmokeService {
    private scene!: THREE.Scene;
    private camera!: THREE.Camera;
    private renderer!: THREE.WebGLRenderer;

    private simulationMesh!: THREE.Mesh;
    private simulationMaterial!: THREE.ShaderMaterial;

    private fboA!: THREE.WebGLRenderTarget;
    private fboB!: THREE.WebGLRenderTarget;

    private mouse = new THREE.Vector2(0, 0);
    private lastMouse = new THREE.Vector2(0, 0);
    private velocity = new THREE.Vector2(0, 0);

    constructor(private ngZone: NgZone) { }

    public init(renderer: THREE.WebGLRenderer): void {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const size = 128; // Simulation resolution
        this.fboA = new THREE.WebGLRenderTarget(size, size, {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter
        });
        this.fboB = this.fboA.clone();

        this.simulationMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tPrev: { value: null },
                uMouse: { value: this.mouse },
                uVelocity: { value: this.velocity },
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(size, size) }
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform sampler2D tPrev;
        uniform vec2 uMouse;
        uniform vec2 uVelocity;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          vec2 res = 1.0 / uResolution;
          
          // Advection: look back along velocity field
          vec4 data = texture2D(tPrev, vUv);
          vec2 vel = data.xy;
          vec2 advectUv = vUv - vel * res * 1.5;
          vec4 prev = texture2D(tPrev, advectUv);
          
          // Diffusion & Decay
          prev *= 0.992; // Persistence/Decay
          
          // Mouse Splat (Displacement)
          float dist = distance(vUv, uMouse);
          float splat = exp(-dist * 40.0) * 0.1;
          
          // Turbulence (Noise based)
          float n = (hash(vUv * 5.0 + uTime * 0.1) - 0.5) * 0.05;
          
          // Update Velocity (RGB = [vel.x, vel.y, density])
          vec2 newVel = mix(prev.xy, uVelocity * 2.0, splat * 10.0);
          float newDensity = mix(prev.z, 1.0, splat * 8.0);
          
          // Dissipation
          newDensity *= 0.985;
          
          gl_FragColor = vec4(newVel, newDensity, 1.0);
        }
      `
        });

        this.simulationMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simulationMaterial);
        this.scene.add(this.simulationMesh);
    }

    public update(time: number, mouseX: number, mouseY: number): THREE.Texture {
        // Convert mouse to [0, 1]
        this.mouse.set((mouseX + 1) * 0.5, (mouseY + 1) * 0.5);
        this.velocity.subVectors(this.mouse, this.lastMouse);
        this.lastMouse.copy(this.mouse);

        this.simulationMaterial.uniforms['tPrev'].value = this.fboA.texture;
        this.simulationMaterial.uniforms['uMouse'].value = this.mouse;
        this.simulationMaterial.uniforms['uVelocity'].value = this.velocity;
        this.simulationMaterial.uniforms['uTime'].value = time;

        this.renderer.setRenderTarget(this.fboB);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);

        // Swap FBOs
        const temp = this.fboA;
        this.fboA = this.fboB;
        this.fboB = temp;

        return this.fboA.texture;
    }
}

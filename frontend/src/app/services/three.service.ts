import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { LoggerService } from '../core/services/logger.service';
import * as THREE from 'three';
import { CanBuilder } from '../three/can-builder';
import { ParticleSystem } from '../three/particles';
import { EffectsBuilder } from '../three/effects-builder';
import { SmokeService } from './smoke.service';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

@Injectable({
  providedIn: 'root'
})
export class ThreeService implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private composer!: EffectComposer;
  private frameId: number | null = null;

  public canMesh!: THREE.Group;
  public particles!: ParticleSystem;
  public energyRings!: THREE.Group;
  public ambientDust!: THREE.Points;
  private smokePlane!: THREE.Mesh;
  public mousePos = new THREE.Vector2(0, 0);


  constructor(
    private ngZone: NgZone,
    private logger: LoggerService,
    private smokeService: SmokeService
  ) { }

  public initialize(canvas: HTMLCanvasElement): void {
    this.logger.info('Initializing ThreeJS scene');
    this.cleanUp();
    this.canvas = canvas;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false, // Recommended false for PostProcessing
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 8;

    // Add Can Mesh
    this.canMesh = CanBuilder.createCan();
    this.canMesh.rotation.z = 0.1;
    this.scene.add(this.canMesh);

    this.particles = new ParticleSystem(500);
    this.scene.add(this.particles.getMesh());

    // Ambient Dust
    this.ambientDust = EffectsBuilder.createAmbientDust(300);
    this.scene.add(this.ambientDust);

    // Lighting
    this.setupLighting();

    // Smoke Simulation
    this.smokeService.init(this.renderer);
    this.setupSmokePlane();

    this.setupPostProcessing();

    // Start Loop
    this.logger.info('Starting animation loop');
    this.animate();

    // Resize Listener
    window.addEventListener('resize', this.onWindowResize);
  }

  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4, // Strength
      0.5, // Radius
      0.9  // Threshold
    );
    this.composer.addPass(bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  public updateCanColor(colorHex: number): void {
    // Label material is index 0 in body mesh usually, or we find it.
    // In CanBuilder we used individual meshes.
    const body = this.canMesh.getObjectByName('body') as THREE.Mesh;
    if (body) {
      // We used a label texture. Detailed color changing might need tinting 
      // or replacing the texture. For now, let's tint the material color.
      // The label material was MeshStandardMaterial.
      (body.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
    }
  }

  private setupLighting(): void {
    // Ambient Light (Subtle base)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Key Light (Main source)
    const keyLight = new THREE.SpotLight(0xffffff, 10);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    this.scene.add(keyLight);

    // Rim Light (Backlight for edge definition)
    const rimLight = new THREE.SpotLight(0x00ddeb, 5); // Cyan tint
    rimLight.position.set(-5, 5, -5);
    this.scene.add(rimLight);

    // Fill Light (Soften shadows)
    const fillLight = new THREE.PointLight(0xff0055, 2); // Pink tint
    fillLight.position.set(-5, 0, 5);
    this.scene.add(fillLight);

    // Front Light (For label visibility)
    const frontLight = new THREE.PointLight(0xffffff, 3);
    frontLight.position.set(0, 0, 6);
    this.scene.add(frontLight);
  }

  private setupSmokePlane(): void {
    const geometry = new THREE.PlaneGeometry(30, 20);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tSmoke: { value: null },
        uColor: { value: new THREE.Color(0x0055ff) }, // Pepsi Blue
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tSmoke;
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
          vec4 smoke = texture2D(tSmoke, vUv);
          float alpha = smoothstep(0.01, 0.4, smoke.z);
          
          vec3 baseColor = vec3(0.02, 0.05, 0.15);
          vec3 smokeColor = mix(baseColor, uColor, alpha);
          smokeColor += smoke.z * 0.3; // Add intensity glow
          
          gl_FragColor = vec4(smokeColor, alpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.smokePlane = new THREE.Mesh(geometry, material);
    this.smokePlane.position.z = -2;
    this.scene.add(this.smokePlane);
  }


  public getCanMesh(): THREE.Group {
    return this.canMesh;
  }

  public getCanPart(name: string): THREE.Object3D | undefined {
    return this.canMesh.getObjectByName(name);
  }

  public getParticles(): ParticleSystem {
    return this.particles;
  }

  private animate = (): void => {
    this.ngZone.runOutsideAngular(() => {
      const time = performance.now() * 0.001;

      // Update Smoke
      const smokeTexture = this.smokeService.update(time, this.mousePos.x, this.mousePos.y);
      if (this.smokePlane) {
        (this.smokePlane.material as THREE.ShaderMaterial).uniforms['tSmoke'].value = smokeTexture;
        (this.smokePlane.material as THREE.ShaderMaterial).uniforms['uTime'].value = time;
      }

      // Animate Particles
      if (this.particles && this.canMesh) {
        // Sync particle origin to Can's top position (Height/2 approx 1.6)
        this.particles.getMesh().position.copy(this.canMesh.position).add(new THREE.Vector3(0, 1.6, 0));
        this.particles.update(time, this.explosionFactor);
      }

      // Animate Energy Rings
      if (this.energyRings) {
        this.energyRings.children.forEach(child => {
          const speed = child.userData['speed'];
          child.rotation.x += speed.x * 0.1;
          child.rotation.y += speed.y * 0.1;
          child.rotation.z += speed.z * 0.1;
        });
      }

      // Animate Ambient Dust
      if (this.ambientDust) {
        this.ambientDust.rotation.y = time * 0.05;
        this.ambientDust.rotation.x = time * 0.02;
      }

      if (this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      this.frameId = requestAnimationFrame(this.animate);
    });
  };

  public explosionFactor: number = 0; // Controlled by GSAP

  private onWindowResize = (): void => {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  };


  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public cleanUp(): void {
    this.logger.info('Cleaning up ThreeJS resources');
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    window.removeEventListener('resize', this.onWindowResize);

    if (this.composer) {
      this.composer.dispose();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        this.disposeObject(object);
      });
      this.scene.clear();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    this.explosionFactor = 0;
  }

  private disposeObject(object: THREE.Object3D): void {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => this.disposeMaterial(material));
        } else {
          this.disposeMaterial(object.material);
        }
      }
    }
  }

  private disposeMaterial(material: THREE.Material): void {
    material.dispose();

    // Dispose of textures if they exist
    for (const key of Object.keys(material)) {
      const value = (material as any)[key];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanUp();
  }
}

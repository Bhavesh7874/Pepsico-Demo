import { Component, ElementRef, AfterViewInit, ViewChild, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { ThreeService } from '../../services/three.service';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-scene',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #rendererCanvas class="fixed top-0 left-0 w-full h-full z-0 outline-none pointer-events-none"></canvas>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private threeService = inject(ThreeService);
  private platformId = inject(PLATFORM_ID);
  private ctx: gsap.Context | undefined;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Register locally to be sure
      gsap.registerPlugin(ScrollTrigger);

      // Initialize ThreeJS
      if (this.canvasRef) {
        this.threeService.initialize(this.canvasRef.nativeElement);

        // Setup Animation Context for easy cleanup
        this.ctx = gsap.context(() => {
          this.setupAnimations();
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.ctx) {
      this.ctx.revert(); // Cleanup GSAP
    }
  }

  private setupAnimations(): void {
    const can = this.threeService.getCanMesh();
    // Wait for mesh if it's async (it is sync in our case, but let's be safe)
    if (!can) return;

    const camera = this.threeService.getCamera();
    const body = this.threeService.getCanPart('body');
    const lid = this.threeService.getCanPart('lid');
    const tab = this.threeService.getCanPart('tab');
    const topRim = this.threeService.getCanPart('topRim');

    // Initial State Override for visibility check
    can.position.set(2, 0, 0);
    // Rotate to show label (Experiment with Y rotation)
    can.rotation.set(0.1, Math.PI, 0.2); // Math.PI (180 deg) often faces front for cylinder UVs

    if (body && lid && tab && topRim) {

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // --- GLOBAL CONTINUOUS ROTATION (0% - 90%) ---
      // We overwrite 'y' rotation for the first 90% of the timeline.
      // Starting at Math.PI
      mainTl.fromTo(can.rotation, {
        y: Math.PI
      }, {
        y: Math.PI + (Math.PI * 2 * 4.5), // 4.5 spins (End at 10PI)
        duration: 90, // Covers 90%
        ease: "none"
      }, 0);

      // 2. INGREDIENTS EXPLOSION (20% - 40%)
      mainTl.to(can.position, {
        y: -1,
        duration: 20
      }, 20);

      mainTl.to([lid.position, tab.position, topRim.position], {
        y: "+=2",
        duration: 10,
        ease: "power2.out"
      }, 20);

      const threeSvc = this.threeService;
      const explosionProxy = { val: 0 };
      mainTl.to(explosionProxy, {
        val: 1,
        duration: 15,
        onUpdate: () => {
          threeSvc.explosionFactor = explosionProxy.val;
        }
      }, 20);

      // 3. REASSEMBLE & VARIANTS (40% - 70%)
      mainTl.to([lid.position, tab.position, topRim.position], {
        y: "-=2",
        duration: 10,
        ease: "power2.in"
      }, 45);

      mainTl.to(explosionProxy, {
        val: 0,
        duration: 10,
        onUpdate: () => {
          threeSvc.explosionFactor = explosionProxy.val;
        }
      }, 45);

      // Color Change
      const colorProxy = { hex: 0xff0055 };
      mainTl.to(can.rotation, {
        z: -0.5,
        x: 0.5,
        duration: 25
      }, 50);

      mainTl.to(colorProxy, {
        hex: 0xff0055, duration: 5,
        onUpdate: () => threeSvc.updateCanColor(colorProxy.hex)
      }, 50)
        .to(colorProxy, {
          hex: 0x00ddeb, duration: 5,
          onUpdate: () => threeSvc.updateCanColor(colorProxy.hex)
        }, 60)
        .to(colorProxy, {
          hex: 0x00ff00, duration: 5,
          onUpdate: () => threeSvc.updateCanColor(colorProxy.hex)
        }, 70);

      // 4. CTA ZOOM (90% - 100%)
      mainTl.to(can.position, {
        z: 3,
        y: 0,
        x: 0,
        duration: 10,
        ease: "power4.inOut"
      }, 90);

      mainTl.to(can.rotation, {
        y: Math.PI * 12, // Continue to 12PI (1 full spin in last 10%)
        duration: 10,
        ease: "power2.out"
      }, 90);
    }

    // Idle Float Animation (Sine Wave)
    const startTime = performance.now();
    const idleFloat = () => {
      if (!can) return;
      const elapsed = (performance.now() - startTime) * 0.001;
      // Add subtle floating motion on Y axis, independent of GSAP timeline
      // using a small offset. 
      // Note: GSAP controls 'y' via scroll. If scroll is 0, y is 0.
      // We can modify 'y' directly in the render loop in ThreeService, but here we can try
      // adding to rotation or scaling slightly to make it alive.
      // Let's float the ENTIRE GROUP (canMesh) in ThreeService?
      // Actually, let's just do a subtle rotation on Z or X that isn't locked by GSAP yet.
      can.rotation.z = 0.2 + Math.sin(elapsed) * 0.05;

      requestAnimationFrame(idleFloat);
    };
    idleFloat();

    // Mouse Parallax & Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (e) => {
      // Parallax
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      mouse.x = x;
      mouse.y = y;

      if (camera) {
        gsap.to(camera.position, {
          x: x * 0.5,
          y: y * 0.5,
          duration: 1,
          ease: "power2.out"
        });

        if (can) {
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(can.children, true);

          if (intersects.length > 0) {
            document.body.style.cursor = 'pointer';
            // Scale up for impact - SAFER than material changes
            gsap.to(can.scale, { x: 1.15, y: 1.15, z: 1.15, duration: 0.4, ease: "back.out(1.7)" });
          } else {
            document.body.style.cursor = 'default';
            // Scale back
            gsap.to(can.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
          }
        }
      }
    });


  }
}

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
    <canvas #rendererCanvas class="fixed top-0 left-0 w-full h-full z-0 outline-none"></canvas>
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
    can.position.set(0, 0, 0);
    can.rotation.set(0.1, 0, 0.2);
    
    if (body && lid && tab && topRim) {
        
        const mainTl = gsap.timeline({
            scrollTrigger: {
                trigger: "main", // Use main element instead of body for better encapsulation usually, or body if we are sure
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            }
        });

        // 1. HERO ROTATION (0% - 20%)
        mainTl.to(can.rotation, {
            y: Math.PI * 2,
            duration: 20,
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

        // 4. CTA ZOOM (80% - 100%)
        mainTl.to(can.position, {
          z: 3, 
          y: 0,
          x: 0,
          duration: 10,
          ease: "power4.inOut"
        }, 90);
        
        mainTl.to(can.rotation, {
          y: Math.PI * 4,
          duration: 10
        }, 90);
    }

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

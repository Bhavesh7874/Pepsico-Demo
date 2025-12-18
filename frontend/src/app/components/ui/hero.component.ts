import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="h-screen w-full flex flex-col justify-center items-center relative pointer-events-none">
      <div class="z-10 text-center pointer-events-auto mix-blend-difference">
        <h1 class="text-9xl font-bold tracking-tighter text-white mb-4 animate-in fade-in zoom-in duration-1000">
          PEPSICO
        </h1>
        <p class="text-2xl text-white/80 font-light tracking-widest uppercase mb-8">
          Taste the Future
        </p>
      </div>
    </section>
  `,
  styles: []
})
export class HeroComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden">
      <div class="z-10 text-center pointer-events-auto">
        <div class="inline-block px-6 py-2 mb-6 border border-white/20 rounded-full backdrop-blur-md bg-white/5 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span class="text-sm font-semibold tracking-widest text-blue-400 uppercase">Interactive Experience</span>
        </div>
        <h1 class="text-[12rem] font-black tracking-tighter leading-[0.8] mb-4 text-white drop-shadow-2xl animate-in fade-in zoom-in-95 duration-1000 ease-out">
          PEPSI<span class="text-red-500">.</span>
        </h1>
        <p class="text-3xl text-white/90 font-light tracking-[0.4em] uppercase mb-12 animate-in fade-in duration-1000 delay-300">
          Taste the Future
        </p>
        <div class="flex gap-6 justify-center animate-in fade-in duration-1000 delay-500">
          <button class="px-10 py-4 bg-white text-blue-900 rounded-full font-bold hover:scale-105 transition-transform duration-300 shadow-xl">
            Explore Flavors
          </button>
          <button class="px-10 py-4 border-2 border-white/30 text-white rounded-full font-bold backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
            Our Story
          </button>
        </div>
      </div>
      
      <!-- Subtle overlay for depth -->
      <div class="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent pointer-events-none"></div>
    </section>
  `,
  styles: []
})
export class HeroComponent { }

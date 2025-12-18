import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-[400vh] w-full relative z-10 pointer-events-none">
      
      <!-- INGREDIENTS SECTION (20% - 40%) -->
      <div class="h-screen flex items-center justify-start px-20">
        <div class="max-w-xl pointer-events-auto">
          <h2 class="text-6xl font-bold text-white mb-6">EXPLOSIVE FLAVOR</h2>
          <p class="text-xl text-gray-400 leading-relaxed">
             Proprietary "Zero-G" sugar crystals dissolve instantly upon opening.
             Releasing a burst of energy without the crash.
          </p>
          <ul class="mt-4 space-y-2 text-brand-accent font-mono">
            <li>+ Taurine Matrix</li>
            <li>+ B-Vitamin Complex</li>
            <li>+ Glacial Water</li>
          </ul>
        </div>
      </div>
      
      <!-- VARIANTS SECTION (40% - 70%) -->
      <div class="h-screen flex items-center justify-end px-20">
        <div class="max-w-xl text-right pointer-events-auto">
          <h2 class="text-6xl font-bold text-white mb-6">ADAPTIVE CAMOUFLAGE</h2>
          <p class="text-xl text-gray-400 leading-relaxed">
            The can that changes with your mood. 
            Thermo-reactive pigments shift color based on consumption temperature.
          </p>
          <div class="flex gap-4 justify-end mt-6">
            <div class="w-12 h-12 rounded-full bg-red-500 border border-white/20"></div>
            <div class="w-12 h-12 rounded-full bg-blue-500 border border-white/20"></div>
            <div class="w-12 h-12 rounded-full bg-green-500 border border-white/20"></div>
          </div>
        </div>
      </div>

       <!-- CTA SECTION (80% - 100%) -->
       <div class="h-screen flex flex-col items-center justify-center pointer-events-auto text-center">
          <h2 class="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-8 filter drop-shadow-lg">
            TASTE THE FUTURE
          </h2>
          <button class="px-16 py-6 bg-white text-black text-2xl font-bold tracking-widest rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-all duration-300">
            PRE-ORDER ACCESS &rarr;
          </button>
          
          <div class="mt-20 grid grid-cols-3 gap-12 text-sm text-gray-500 uppercase tracking-widest max-w-4xl border-t border-white/10 pt-10">
             <div>
                <h4 class="text-white mb-2 font-bold">Connect</h4>
                <p>Instagram</p>
                <p>Twitter / X</p>
                <p>Discord</p>
             </div>
             <div>
                <h4 class="text-white mb-2 font-bold">Company</h4>
                <p>About Pepsico</p>
                <p>Careers</p>
                <p>Sustainability</p>
             </div>
             <div>
                <h4 class="text-white mb-2 font-bold">Legal</h4>
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
                <p>Cookies</p>
             </div>
          </div>
          
          <p class="mt-10 text-xs text-gray-600">
             © 2025 Pepsico, Inc. All Rights Reserved. PEPSI and the generic shapes are trademarks.
          </p>
       </div>

    </section>
  `,
  styles: []
})
export class FeaturesComponent {}

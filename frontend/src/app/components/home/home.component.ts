import { Component } from '@angular/core';
import { SceneComponent } from '../scene/scene.component';
import { HeroComponent } from '../ui/hero.component';
import { FeaturesComponent } from '../ui/features.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SceneComponent, HeroComponent, FeaturesComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent { }

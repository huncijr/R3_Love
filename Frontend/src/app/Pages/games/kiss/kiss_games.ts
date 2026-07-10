import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  HandHeart,
  LUCIDE_ICONS,
  LucideIconProvider,
  LucideAngularModule,
  Mars,
  Venus,
} from 'lucide-angular';

@Component({
  selector: 'app-kiss',
  imports: [CommonModule, HlmButton, LucideAngularModule],
  templateUrl: './kiss_games.html',
  styleUrl: './kiss_games.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        HandHeart,
        Mars,
        Venus,
      }),
    },
  ],
})
export class KissComponent {
  currentGender = signal<'male' | 'female'>('male');
  isKissing = signal(false);

  toggleGender(): void {
    this.currentGender.update((gender) => (gender === 'male' ? 'female' : 'male'));
    this.isKissing.set(false);
  }

  launchKiss(): void {
    if (this.isKissing()) return;
    this.isKissing.set(true);

    // Reset kiss pose after the animation finishes
    window.setTimeout(() => {
      this.isKissing.set(false);
    }, 1500);
  }
}

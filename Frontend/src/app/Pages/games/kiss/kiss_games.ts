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
  Maximize,
  ScanFace,
  TvMinimal,
  User,
  Heart,
} from 'lucide-angular';
import { HlmCard } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-kiss',
  imports: [CommonModule, HlmButton, LucideAngularModule, HlmCard],
  templateUrl: './kiss_games.html',
  styleUrl: './kiss_games.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        HandHeart,
        Mars,
        Venus,
        Maximize,
        ScanFace,
        TvMinimal,
        User,
        Heart,
      }),
    },
  ],
})
export class KissComponent {
  currentGender = signal<'male' | 'female'>('male');
  isKissing = signal(false);
  showMessage = signal(false);
  kisses = signal<{ id: number; x: number; y: number }[]>([]);

  kissPosition = signal<{ x: number; y: number } | null>(null);
  private kissInterval?: number;
  private kissTimeout?: number;
  private messageTimeout?: number;
  private kissId = 0;

  view = signal<'full' | 'body' | 'face' | 'default'>('default');
  zoom = signal(1);
  focusY = signal(0);

  isZooming = signal(false);
  showKissOverlay = signal(false);

  private readonly views = {
    default: { zoom: 1, focusY: 0 },
    full: { zoom: 1.4, focusY: 0 },
    body: { zoom: 1.8, focusY: -140 },
    face: { zoom: 2.5, focusY: 330 },
  } as const;

  toggleGender(): void {
    this.currentGender.update((gender) => (gender === 'male' ? 'female' : 'male'));
    this.isKissing.set(false);
    this.resetKiss();
  }

  launchKiss(): void {
    if (this.isKissing()) return;

    this.resetKiss();
    this.isKissing.set(true);

    if (this.view() === 'default') {
      this.isZooming.set(true);
      this.setView('full');
    }

    this.moveKissIcon();

    this.kissInterval = window.setInterval(() => {
      this.moveKissIcon();
    }, 400);

    this.kissTimeout = window.setTimeout(() => {
      window.clearInterval(this.kissInterval);
      this.showMessage.set(true);
      this.isKissing.set(false);
      this.showKissOverlay.set(true);

      this.messageTimeout = window.setTimeout(() => {
        this.showKissOverlay.set(false);
        this.showMessage.set(false);
        this.kissPosition.set(null);
        this.isZooming.set(false);

        if (this.view() === 'full') {
          this.setView('default');
        }
      }, 3000);
    }, 3000);
  }

  private moveKissIcon(): void {
    this.kissPosition.set({
      x: Math.random() * 50 + 25,
      y: Math.random() * 70 + 10,
    });
  }

  private resetKiss(): void {
    window.clearInterval(this.kissInterval);
    window.clearTimeout(this.kissTimeout);
    window.clearTimeout(this.messageTimeout);

    this.isKissing.set(false);
    this.showMessage.set(false);
    this.kissPosition.set(null);
    this.kisses.set([]);
  }

  setView(v: 'default' | 'full' | 'body' | 'face'): void {
    this.view.set(v);
    this.zoom.set(this.views[v].zoom);
    this.focusY.set(this.views[v].focusY);
  }

  zoomIn(): void {
    const next = Math.min(2.2, +(this.zoom() + 0.2).toFixed(2));
    this.zoom.set(next);
    this.view.set('full');
  }

  zoomOut(): void {
    const next = Math.max(1, +(this.zoom() - 0.2).toFixed(2));
    this.zoom.set(next);
  }
}

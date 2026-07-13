import { Component, inject, OnInit, signal } from '@angular/core';
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
  Volume2,
  VolumeOff,
  Play,
  EyeOff,
} from 'lucide-angular';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
  HlmCardFooter,
  HlmCardImports,
} from '@spartan-ng/helm/card';
import { UserService } from '../../../services/user.service';
import { HlmBadge } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-kiss',
  imports: [
    CommonModule,
    HlmButton,
    LucideAngularModule,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmCardFooter,
    HlmCardImports,
    HlmButton,
    HlmBadge,
  ],
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
        Volume2,
        VolumeOff,
        Play,
        EyeOff,
      }),
    },
  ],
})
export class KissComponent implements OnInit {
  private userService = inject(UserService);

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
  showIntro = signal(true);

  soundEnabled = signal(true);
  private readonly views = {
    default: { zoom: 1, focusY: 0 },
    full: { zoom: 1.4, focusY: 0 },
    body: { zoom: 1.8, focusY: -140 },
    face: { zoom: 2.5, focusY: 330 },
  } as const;

  ngOnInit(): void {
    const introDismissed = localStorage.getItem('kissIntroDismissed');
    this.showIntro.set(introDismissed !== 'true');

    const savedGender = localStorage.getItem('kissGameGender');
    if (savedGender === 'male' || savedGender === 'female') {
      this.currentGender.set(savedGender);
    }

    const savedSound = localStorage.getItem('kissGameSound');
    if (savedSound !== null) {
      this.soundEnabled.set(savedSound === 'true');
    }

    const savedView = localStorage.getItem('kissGameView');
    if (savedView && savedView in this.views) {
      this.setView(savedView as 'default' | 'full' | 'body' | 'face');
    }
  }

  toggleGender(): void {
    this.currentGender.update((gender) => (gender === 'male' ? 'female' : 'male'));
    localStorage.setItem('kissGameGender', this.currentGender());
    this.isKissing.set(false);
    this.resetKiss();
  }

  launchKiss(): void {
    if (this.isKissing()) return;
    if (this.soundEnabled()) {
      const drumsound = new Audio('/Sounds/Drum Roll.mp3');
      drumsound.play().catch((err) => {
        console.warn('Audio play blocked or failed:', err);
      });
    }

    this.resetKiss();
    this.isKissing.set(true);

    if (this.view() === 'default') {
      this.isZooming.set(true);
      this.setView('full');
    }

    this.moveKissIcon();

    this.kissInterval = window.setInterval(() => {
      this.moveKissIcon();
    }, 300);

    this.kissTimeout = window.setTimeout(() => {
      window.clearInterval(this.kissInterval);
      this.showMessage.set(true);
      this.isKissing.set(false);
      this.showKissOverlay.set(true);

      this.messageTimeout = window.setTimeout(() => {
        this.showKissOverlay.set(false);
        this.showMessage.set(false);
        this.isZooming.set(false);

        if (this.view() === 'full') {
          this.setView('default');
        }
      }, 2500);
    }, 1500);
  }

  private moveKissIcon(): void {
    const isFemale = this.currentGender() === 'female';
    const view = this.view();
    let x = 50;
    let y = 50;

    if (view === 'face') {
      if (isFemale) {
        x = this.randomBetween(55, 35);
        y = this.randomBetween(15, 35);
      } else {
        x = this.randomBetween(55, 40);
        y = this.randomBetween(6, 35);
      }
    } else if (view === 'body') {
      x = Math.random() * 30 + 35;
      y = Math.random() * 25 + 45;
    } else {
      x = Math.random() * 40 + 30;
      y = Math.random() * 40 + 30;
    }

    this.kissPosition.set({
      x,
      y,
    });
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  toggleSound(): void {
    this.soundEnabled.update((enabled) => {
      const next = !enabled;
      localStorage.setItem('kissGameSound', String(next));
      return next;
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
    localStorage.setItem('kissGameView', v);
  }

  dissmissIntro(_markGameDone: boolean): void {
    localStorage.setItem('kissIntroDismissed', 'true');
    this.showIntro.set(false);

    this.userService.markGameDone().subscribe({
      next: () => {
        localStorage.setItem('kissGameDown', 'true');
        console.log('Game marked as done');
      },
      error: (err) => {
        console.error('Failed to mark game as done', err);
      },
    });
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

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import {
  CalendarDays,
  Clock,
  Heart,
  HeartCrack,
  Sparkles,
  LUCIDE_ICONS,
  Music,
  Disc,
  AudioLines,
  SquareArrowOutUpRight,
  Play,
  CircleSlash2,
  LucideAngularModule,
  LucideIconProvider,
  Map,
  ChevronLeft,
  ChevronRight,
  Music2,
  Square,
  X,
  Gift,
} from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { UserContext } from '../../services/UserContext/user-context';
import { GiftRecommendation } from '../games/gift/gift';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../enviroments/enviroment';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { ToastrService } from 'ngx-toastr';
import { SpotifyPlayerService } from '../../services/spotify/spotify-player';

export type RomanticSong = {
  title: string;
  artist: string;
  url: string;
  imageUrl: string;
  uri: string;
};

@Component({
  selector: 'app-home',
  imports: [HlmCardImports, LucideAngularModule, HlmBadge, HlmButton, RouterLink],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        Heart,
        CalendarDays,
        Clock,
        HeartCrack,
        Sparkles,
        Music,
        Disc,
        AudioLines,
        SquareArrowOutUpRight,
        Play,
        Map,
        CircleSlash2,
        ChevronLeft,
        ChevronRight,
        Music2,
        Square,
        X,
        Gift,
      }),
      multi: true,
    },
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private userContext = inject(UserContext);
  private toastr = inject(ToastrService);
  private spotifyPlayerService = inject(SpotifyPlayerService);
  // Computes total days since the relationship started
  private calculateDaysTogether(datingDateStr: string) {
    const datingDate = new Date(datingDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - datingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysTogether.set(diffDays);
  }

  private readonly RANDOM_GIFT_KEY = 'homeRandomGift';
  private readonly ROMANTIC_SONGS_KEY = 'romanticSongs';

  currentUser = this.userContext.currentUser;
  quizData = signal<any>(null);
  daysTogether = signal(0);
  daysUntilBirthday = signal(0);
  daysUntilAnniversary = signal(0);
  funFact = signal('');

  isLoggedIn = computed(() => this.currentUser() !== null);
  hasPartner = computed(() => this.quizData() && this.quizData().isSingle === false);

  private readonly DAILY_INSIGHT_KEY = 'dailyInsight';
  daysUntilValentine = signal(0);
  daysUntilGirlfriendDay = signal(0);

  dailyInsight = signal<{ didYouKnow: string; advice: string } | null>(null);

  romanticSongs = signal<RomanticSong[] | null>(null);
  currentSong = signal<RomanticSong | null>(null);
  isPlaying = signal(false);

  showSpotifyConnect = signal(false);
  spotifyConnected = signal(false);
  showMusicBar = signal(false);

  randomGift = signal<GiftRecommendation | null>(null);
  partnerName = computed(() => this.quizData()?.partnerName || '');

  giftMapUrl = computed<SafeResourceUrl | null>(() => {
    const gift = this.randomGift();
    if (!gift) return null;
    const query = gift.stores?.[0]
      ? `${gift.stores[0].name} ${gift.stores[0].address}`
      : `${gift.title} gift shop near me`;

    const url = `https://www.google.com/maps/embed/v1/search?key=${environment.googleMapsApiKey}&q=${encodeURIComponent(query)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  buyOnlineUrl = computed(() => {
    const gift = this.randomGift();
    if (!gift) return '#';
    if (gift.onlineLinks?.length) return gift.onlineLinks[0];
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(gift.title)}`;
  });

  buyForPartnerUrl = computed(() => {
    const gift = this.randomGift();
    if (!gift) return '#';
    const name = this.partnerName();
    const query = name ? `${gift.title} gift for ${name}` : gift.title;
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
  });

  truncatedDescription = computed(() => {
    const desc = this.randomGift()?.description || '';
    const max = 140;
    return desc.length > max ? desc.slice(0, max) + '...' : desc;
  });

  formatLink(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.length > 25 ? url.slice(0, 25) + '...' : url;
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      console.log('code', code);

      if (code) {
        this.userService.exchangeSpotifyCode(code).subscribe({
          next: () => {
            this.spotifyConnected.set(true);
            this.showSpotifyConnect.set(false);
            this.toastr.success('Spotify connected succesfully', 'Connected', {
              positionClass: 'toast-top-right',
              timeOut: 3000,
            });
            this.router.navigate([], { queryParams: {} });
          },
          error: (err) => {
            console.error('Spotify connect error', err);
            this.spotifyConnected.set(false);
          },
        });
      }
      if (this.userContext.isLoggedIn()) {
        this.userService.isSpotifyConnected().subscribe({
          next: (connected) => {
            this.spotifyConnected.set(connected);
          },
          error: () => {
            this.spotifyConnected.set(false);
          },
        });
      }
    });

    this.loadDailyInsight();
    this.loadRomanticSongs();
    this.loadRandomGift();
    if (this.userContext.isLoggedIn()) {
      this.userService.getCalendarQuiz().subscribe({
        next: (quiz) => {
          this.quizData.set(quiz);
          console.log(quiz);
          if (quiz && !quiz.isSingle && quiz.datingDate) {
            this.calculateDaysTogether(quiz.datingDate);
            this.calculateUpcomingDates(quiz.datingDate, quiz.partnerBirthday);
            this.funFact.set(this.getFunFact(this.daysTogether()));
          } else {
            this.calculateSingleDays();
          }
        },
        error: () => {
          this.calculateSingleDays();
        },
      });
    } else {
      const savedQuiz = localStorage.getItem('calendar-quiz');
      if (savedQuiz) {
        const data = JSON.parse(savedQuiz);
        this.quizData.set(data);
        if (!data.isSingle && data.datingDate) {
          this.calculateDaysTogether(data.datingDate);
        } else if (data.isSingle) {
          this.calculateSingleDays();
        }
      } else {
        this.calculateSingleDays();
      }
    }
  }

  // Calculates days remaining until next anniversary and partner's birthday
  private calculateUpcomingDates(datingDateStr: string, birthdayStr: string) {
    if (birthdayStr) {
      this.daysUntilBirthday.set(this.daysUntil(birthdayStr));
    }
    if (datingDateStr) {
      this.daysUntilAnniversary.set(this.daysUntil(datingDateStr));
    }
  }

  private calculateSingleDays() {
    const currentYear = new Date().getFullYear();
    this.daysUntilValentine.set(this.daysUntil(`${currentYear}-02-14`));
    this.daysUntilGirlfriendDay.set(this.daysUntil(`${currentYear}-08-01`));
  }

  private loadRandomGift() {
    const saved = sessionStorage.getItem(this.RANDOM_GIFT_KEY);
    if (saved) {
      try {
        this.randomGift.set(JSON.parse(saved));
        return;
      } catch {
        sessionStorage.removeItem(this.RANDOM_GIFT_KEY);
      }
    }

    if (!this.userContext.isLoggedIn()) {
      const pending = localStorage.getItem('gift_pending_recommendations');
      if (pending) {
        const recs: GiftRecommendation[] = JSON.parse(pending);
        this.pickRandomGift(recs);
      }
      return;
    }

    this.userService.getGiftRecommendationsHistory().subscribe({
      next: (res: any) => {
        const history = res.data?.getGiftRecommendationsHistory || [];
        if (history.length === 0) return;

        const allRecommendations = history.flatMap((set: any) => set.recommendations || []);
        this.pickRandomGift(allRecommendations);
      },
      error: (err) => console.error('Failed to load gift history', err),
    });
  }

  private pickRandomGift(recommendations: GiftRecommendation[]) {
    if (recommendations.length === 0) return;
    const index = Math.floor(Math.random() * recommendations.length);
    const gift = recommendations[index];
    this.randomGift.set(gift);
    sessionStorage.setItem(this.RANDOM_GIFT_KEY, JSON.stringify(gift));
  }

  private loadDailyInsight() {
    const saved = sessionStorage.getItem(this.DAILY_INSIGHT_KEY);
    console.log('saved', saved);
    if (saved) {
      try {
        this.dailyInsight.set(JSON.parse(saved));
        return;
      } catch (error) {
        sessionStorage.removeItem(this.DAILY_INSIGHT_KEY);
      }
    }

    const fallbackInsight = {
      didYouKnow:
        'Did you know that the smallest gestures often leave the biggest imprint on the heart?',
      advice: 'Send a message today for no reason other than to say you are thinking of them.',
    };
    this.userService.getDailyInsight().subscribe({
      next: (insight) => {
        const value = insight ?? fallbackInsight;
        this.dailyInsight.set(value);
        if (value) {
          sessionStorage.setItem(this.DAILY_INSIGHT_KEY, JSON.stringify(value));
        }
      },
      error: () => this.dailyInsight.set(fallbackInsight),
    });
  }

  // Helper to compute days until the next occurrence of a given date
  private daysUntil(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    let nextDate = new Date(currentYear, date.getMonth(), date.getDate());
    if (nextDate < today) {
      nextDate = new Date(currentYear + 1, date.getMonth(), date.getDate());
    }
    const diffTime = nextDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  loadRomanticSongs() {
    const saved = sessionStorage.getItem(this.ROMANTIC_SONGS_KEY);
    if (saved) {
      try {
        this.romanticSongs.set(JSON.parse(saved));
        return;
      } catch {
        sessionStorage.removeItem(this.ROMANTIC_SONGS_KEY);
      }
    }

    this.userService.getRomanticSongs().subscribe({
      next: (result) => {
        const songs = result.data?.getRomanticSongs ?? null;
        console.log(result);
        this.romanticSongs.set(songs);
        if (songs) {
          sessionStorage.setItem(this.ROMANTIC_SONGS_KEY, JSON.stringify(songs));
        }
      },
      error: (err) => {
        console.error('Failed to load romantic songs', err);
        sessionStorage.removeItem(this.ROMANTIC_SONGS_KEY);
      },
    });
  }

  async playSong(song: RomanticSong, event: Event) {
    event.stopPropagation();
    if (!this.spotifyConnected()) {
      this.showSpotifyConnect.set(true);
      return;
    }

    this.currentSong.set(song);
    this.isPlaying.set(true);
    this.showMusicBar.set(true);

    try {
      await this.spotifyPlayerService.init();
      await this.spotifyPlayerService.play(song.uri);
    } catch (error) {
      console.error('Failed to play song', error);
      this.isPlaying.set(false);
    }
  }

  stopSong(event: Event) {
    event.stopPropagation();
    this.isPlaying.set(false);
  }

  connectToSpotify() {
    this.userService.getSpotifyAuthUrl().subscribe({
      next: (url) => {
        if (url) {
          console.log('Spotify auth URL received:', url);
          window.location.href = url;
        }
      },
      error: (err) => console.error('Failed to get Spotify auth URL', err),
    });
  }

  closeSpotifyConnect() {
    this.showSpotifyConnect.set(false);
  }

  closeMusicBar(event: Event) {
    event.stopPropagation();
    this.showMusicBar.set(false);
    this.isPlaying.set(false);
    this.currentSong.set(null);
  }

  openCurrentSong(event: Event) {
    event.stopPropagation();
    const song = this.currentSong();
    if (song) {
      window.open(song.url, '_blank');
    }
  }

  // Returns a fun relationship fact based on total days together
  private getFunFact(days: number): string {
    const facts = [
      `That's ${(days * 24).toLocaleString()} hours of love!`,
      `Your hearts beat approximately ${(days * 115200).toLocaleString()} times together!`,
      `You've spent about ${(days * 7).toLocaleString()} hours dreaming of each other!`,
      `That's enough time to read ${Math.floor(days / 14)} books together!`,
      `You've shared approximately ${(days * 3).toLocaleString()} meals together!`,
    ];
    return facts[days % facts.length];
  }
}

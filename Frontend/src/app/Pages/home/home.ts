import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import {
  CalendarDays,
  Clock,
  Heart,
  HeartCrack,
  Sparkles,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
} from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { UserContext } from '../../services/UserContext/user-context';

//for testing:
const MOCK_SONGS: SpotifySong[] = [
  {
    title: 'Perfect',
    artist: 'Ed Sheeran',
    url: 'https://open.spotify.com/track/0tgVpDi06FyKpA1zm0rEO5',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
  },
  {
    title: 'All of Me',
    artist: 'John Legend',
    url: 'https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2731d97a275a5bb915dc92f0477',
  },
  {
    title: 'Just the Way You Are',
    artist: 'Bruno Mars',
    url: 'https://open.spotify.com/track/7BqBn9nzAq8spo54e7HX',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273f6b55ca93b332132b2e9a3c2',
  },
  {
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    url: 'https://open.spotify.com/track/6lanRgr6wXibZr8KgzXxBl',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273c82a683c61e665677e7e8c06',
  },
  {
    title: 'Make You Feel My Love',
    artist: 'Adele',
    url: 'https://open.spotify.com/track/1P4e3w2t6A0Z7Y3q8X9vW',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2736f5b8e09b9aef5b1e4e3e1b0',
  },
];
@Component({
  selector: 'app-home',
  imports: [HlmCardImports, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Heart, CalendarDays, Clock, HeartCrack, Sparkles }),
      multi: true,
    },
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private userService = inject(UserService);
  private userContext = inject(UserContext);
  // Computes total days since the relationship started
  private calculateDaysTogether(datingDateStr: string) {
    const datingDate = new Date(datingDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - datingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysTogether.set(diffDays);
  }

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

  romanticSongs = signal<{ title: string; artist: string; url: string; imageUrl: string }[] | null>(
    null,
  );

  ngOnInit(): void {
    this.loadDailyInsight();
    this.loadRomanticSongs();
    if (this.userContext.isLoggedIn()) {
      this.userService.getCalendarQuiz().subscribe({
        next: (quiz) => {
          this.quizData.set(quiz);
          console.log(quiz);
          if (quiz && !quiz.isSingle && quiz.datingDate) {
            this.calculateDaysTogether(quiz.datingDate);
            this.calculateUpcomingDates(quiz.datingDate, quiz.partnerBirthday);
            this.funFact.set(this.getFunFact(this.daysTogether()));
          } else if (quiz && quiz.isSingle) {
            this.calculateSingleDays();
          }
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

    this.userService.getDailyInsight().subscribe({
      next: (insight) => {
        const value = insight ?? null;
        this.dailyInsight.set(value);
        if (value) {
          sessionStorage.setItem(this.DAILY_INSIGHT_KEY, JSON.stringify(value));
        }
      },
      error: () => this.dailyInsight.set(null),
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
    this.userService.getRomanticSongs().subscribe({
      next: (result) => {
        console.log(result);
        this.romanticSongs.set(result.data?.getRomanticSongs ?? null);
      },
      error: (err) => {
        console.error('Failed to load romantic songs', err);
      },
    });
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

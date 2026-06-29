import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import {
  CalendarDays,
  Clock,
  Heart,
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
} from 'lucide-angular';
import { UserService } from '../../services/user.service';
import { UserContext } from '../../services/UserContext/user-context';

@Component({
  selector: 'app-home',
  imports: [HlmCardImports, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Heart, CalendarDays, Clock }),
      multi: true,
    },
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private userService = inject(UserService);
  private userContext = inject(UserContext);
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

  ngOnInit(): void {
    if (this.userContext.isLoggedIn()) {
      this.userService.getCalendarQuiz().subscribe({
        next: (quiz) => {
          this.quizData.set(quiz);
          if (quiz && !quiz.isSingle && quiz.datingDate) {
            this.calculateDaysTogether(quiz.datingDate);
            this.calculateUpcomingDates(quiz.datingDate, quiz.partnerBirthday);
            this.funFact.set(this.getFunFact(this.daysTogether()));
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
        }
      }
    }
  }

  private calculateUpcomingDates(datingDateStr: string, birthdayStr: string) {
    if (birthdayStr) {
      this.daysUntilBirthday.set(this.daysUntil(birthdayStr));
    }
    if (datingDateStr) {
      this.daysUntilAnniversary.set(this.daysUntil(datingDateStr));
    }
  }

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

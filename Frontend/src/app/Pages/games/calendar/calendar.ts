import { Component, inject, OnDestroy, OnInit, signal, effect } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';
import { CalendarMonthViewComponent, CalendarEvent } from 'angular-calendar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '../../../ui/card/src';
import { HlmRadioGroupImports } from '../../../ui/radio-group/src';
import { HlmProgressImports } from '../../../ui/progress/src';
import { HlmBadgeImports } from '../../../ui/badge/src';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarHeart,
  CalendarOff,
  ChevronUp,
  Plus,
  X,
  CalendarClock,
  CheckCheck,
  Heart,
  Undo2,
  Venus,
  Mars,
  Shirt,
  ArrowRight,
  HeartHandshake,
  HeartCrack,
  Save,
  Pencil,
  Cake,
  Users,
  Sparkle,
  UserMinus,
  Lightbulb,
} from 'lucide-angular';
import { HlmSheetDescription } from '@spartan-ng/helm/sheet';
import { HlmLabel } from '@spartan-ng/helm/label';
import { UserService } from '../../../services/user.service';
import { UserContext } from '../../../services/UserContext/user-context';
import { RouterLink } from '@angular/router';

interface EventColor {
  name: string;
  primary: string;
  secondary: string;
}

@Component({
  selector: 'app-calendar',
  imports: [
    CalendarMonthViewComponent,
    DatePipe,
    LucideAngularModule,
    HlmButton,
    NgFor,
    FormsModule,
    HlmCardImports,
    HlmRadioGroupImports,
    HlmBadgeImports,
    HlmProgressImports,
    RouterLink,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        ChevronLeft,
        ChevronRight,
        CalendarHeart,
        CalendarOff,
        Plus,
        X,
        CalendarClock,
        ChevronDown,
        ChevronUp,
        CheckCheck,
        Heart,
        Undo2,
        Venus,
        Mars,
        Shirt,
        ArrowRight,
        HeartHandshake,
        HeartCrack,
        Save,
        Pencil,
        Cake,
        Users,
        Sparkle,
        UserMinus,
        Lightbulb,
      }),
      multi: true,
    },
  ],
})
export class Calendar implements OnInit, OnDestroy {
  private loadSavedDate(): Date {
    const saved = localStorage.getItem('calendar-view-date');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  }
  viewDate: Date = this.loadSavedDate();

  private savedDate = () => {
    localStorage.setItem('calendar-view-date', this.viewDate.toISOString());
  };

  private reminderInterval: any;
  private toastr = inject(ToastrService);
  private saveQuiz() {
    const data = {
      isSingle: this.quizIsSingle() ?? false,
      partnerName: this.quizPartnerName(),
      datingDate: this.quizDatingDate(),
      partnerBirthday: this.quizPartnerBirthday(),
    };
    if (this.UserContext.isLoggedIn()) {
      this.UserService.saveCalendarQuiz(
        data.isSingle,
        data.partnerName,
        data.datingDate,
        data.partnerBirthday,
      ).subscribe({
        next: () => {
          this.quizCompleted.set(true);
          if (!this.quizIsSingle()) {
            this.calculateDaysTogether();
            this.calculateSpecialDates();
            this.generateQuizEvents();
          }
        },
        error: (err) => console.error('Failed to save quiz', err),
      });
    } else {
      localStorage.setItem('calendar-quiz', JSON.stringify(data));
      this.quizCompleted.set(true);
      this.showLoginPrompt.set(true);
      if (!this.quizIsSingle()) {
        this.calculateDaysTogether();
        this.calculateSpecialDates();
        this.generateQuizEvents();
      }
    }
  }

  eventsSignal = signal<CalendarEvent[]>(this.getDefaultEvents());

  selectedDate = signal<Date | null>(null);
  showAddForm = signal(false);

  newEventTitle = signal('');
  newEventDescription = signal('');
  newEventColor = signal('#ec4899');
  titleError = signal(false);

  toastMessage = signal<string | null>(null);
  toastVisible = signal(false);

  isShowing = signal(false);

  quizStep = signal(0);
  quizGender = signal<string>('');
  quizDatingDate = signal<string>('');
  quizPartnerBirthday = signal<string>('');
  quizCompleted = signal(false);
  quizIsSingle = signal<boolean | null>(null);
  quizPartnerName = signal<string>('');

  daysTogether = signal(0);
  daysUntilValentines = signal(0);
  daysUntilAnniversary = signal(0);
  showLoginPrompt = signal(false);

  isLoadingQuiz = signal(true);
  isEditingQuiz = signal(false);

  showTipToast = signal(false);
  tipDismissed = signal(false);

  tipToastVisible = signal(false);
  tipToastDismissed = signal(false);
  private tipShown = false;

  private quizBackup: any = null;

  constructor(
    private UserService: UserService,
    private UserContext: UserContext,
  ) {
    const dismissed = localStorage.getItem('calendar-tip-dismissed');
    if (dismissed === 'true') {
      this.tipToastDismissed.set(true);
    }

    effect(() => {
      if (
        this.quizCompleted() &&
        !this.showLoginPrompt() &&
        !this.tipToastDismissed() &&
        !this.tipShown
      ) {
        this.tipShown = true;
        setTimeout(() => {
          this.tipToastVisible.set(true);
        }, 1000);
      }
    });
  }

  private loadFromLocalStorage() {
    const savedQuiz = localStorage.getItem('calendar-quiz');
    if (savedQuiz) {
      const data = JSON.parse(savedQuiz);
      this.quizGender.set(data.gender || '');
      this.quizDatingDate.set(data.datingDate || '');
      this.quizPartnerBirthday.set(data.partnerBirthday);
      this.quizCompleted.set(data.completed || false);

      if ('hasPartner' in data) {
        this.quizIsSingle.set(!data.hasPartner);
      } else {
        this.quizIsSingle.set(data.isSingle ?? null);
      }
      this.quizPartnerName.set(data.partnerName || '');

      if (!this.quizIsSingle()) {
        this.calculateDaysTogether();
        this.calculateSpecialDates();
        this.generateQuizEvents();
      }
    }
  }

  ngOnDestroy() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
  }

  ngOnInit(): void {
    if (this.UserContext.isLoggedIn()) {
      this.loadCalendarEvents();
      this.UserService.getCalendarQuiz().subscribe({
        next: (quiz) => {
          this.isLoadingQuiz.set(false);
          if (quiz) {
            this.quizIsSingle.set(quiz.isSingle);
            this.quizPartnerName.set(quiz.partnerName || '');
            this.quizDatingDate.set(quiz.datingDate || '');
            this.quizPartnerBirthday.set(quiz.partnerBirthday || '');
            this.quizCompleted.set(true);
            if (!quiz.isSingle) {
              this.calculateDaysTogether();
              this.calculateSpecialDates();
              this.generateQuizEvents();
            }
          }
        },
        error: (err) => {
          this.isLoadingQuiz.set(false);
          console.error('Failed to load calendar quiz', err);
        },
      });
    } else {
      this.loadFromLocalStorage();
      this.isLoadingQuiz.set(false);
    }
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  nextStep() {
    if (this.quizStep() === 1 && this.quizIsSingle()) {
      this.quizStep.set(5);
      return;
    }
    if (this.quizStep() < 5) {
      this.quizStep.update((s) => s + 1);
    }
  }

  updateQuiz() {
    if (!this.quizIsSingle()) {
      const name = this.quizPartnerBirthday().trim();
      const birthday = this.quizPartnerBirthday().trim();
      const datingDate = this.quizDatingDate().trim();
      if (!name || !birthday || !datingDate) {
        this.toastr.error('Please fill in all partner fields', 'Password Error');

        return;
      }
      this.saveQuiz();
      this.isEditingQuiz.set(false);
    }
  }

  restartQuiz() {
    this.quizStep.set(1);
    this.quizCompleted.set(false);
    this.isEditingQuiz.set(false);
  }

  prevStep() {
    if (this.quizStep() === 5 && this.quizIsSingle()) {
      this.quizStep.set(1);
      return;
    }
    if (this.quizStep() > 1) {
      this.quizStep.update((s) => s - 1);
    }
  }
  setQuizGender(value: string | undefined) {
    this.quizGender.set(value ?? '');
  }

  getDefaultEvents(): CalendarEvent[] {
    const year = this.viewDate.getFullYear();
    return [
      {
        start: new Date(year, 1, 14),
        title: "Valentine's Day",
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description:
            "A special day to celebrate love, romance, and affection with your partner. Don't forget the flowers!",
        },
      },
      {
        start: new Date(year, 2, 14),
        title: 'White Day',
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description:
            "On Valentine's Day, women typically give gifts to men. On White Day, it is the men's turn to return the favor by gifting white chocolates, jewelry, or sweets",
        },
      },
      {
        start: new Date(year, 3, 23),
        title: 'Lovers Day',
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description:
            'Couples use this day to escape the daily hustle, spend quality time together, and celebrate the simple joy of being a couple',
        },
      },
      {
        start: new Date(year, 7, 1),
        title: 'Girlfriend Day',
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description:
            'A massive social media trend where men take the spotlight to pamper, appreciate, and praise their girlfriends',
        },
      },
      {
        start: new Date(year, 7, 8),
        title: 'Couples Day',
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description: 'This day is a celebration of teamwork, partnership, and togetherness',
        },
      },
      {
        start: new Date(year, 9, 3),
        title: 'Boyfriend Day',
        allDay: true,
        color: {
          primary: '#ec4899',
          secondary: '#fbcfe8',
        },
        meta: {
          description:
            'This is the day when women return the energy and show appreciation for their boyfriends. It’s all about making the men feel special, loved, and noticed',
        },
      },
    ];
  }

  get events(): CalendarEvent[] {
    return this.eventsSignal();
  }

  get getMonthEvents(): CalendarEvent[] {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    return this.events.filter((event) => {
      const eventMonth = event.start.getMonth();
      const eventYear = event.start.getFullYear();
      return eventMonth === month && eventYear === year;
    });
  }

  private StartX = 0;
  private EndX = 0;
  private swipeX = 50;

  prevMonth() {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.viewDate = newDate;
    this.savedDate();
  }

  nextMonth() {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.viewDate = newDate;
    this.savedDate();
  }

  dismissTip() {
    localStorage.setItem('calendar-tip-dismissed', 'true');
    this.tipDismissed.set(true);
  }
  dismissTipToast() {
    localStorage.setItem('calendar-tip-dismissed', 'true');
    this.tipToastDismissed.set(true);
    this.tipToastVisible.set(false);
  }

  onDayClicked(day: any) {
    this.selectedDate.set(day.date);
    this.showAddForm.set(true);
    this.newEventTitle.set('');
    this.newEventDescription.set('');
    this.newEventColor.set('#ec4899');
    this.titleError.set(false);
    this.isShowing.set(false);
  }

  ShowColor() {
    this.isShowing.set(!this.isShowing());
  }

  onTouchStart(event: TouchEvent) {
    this.StartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.EndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  addEvent() {
    const date = this.selectedDate();
    const title = this.newEventTitle();

    if (!title.trim()) {
      this.titleError.set(true);
      return;
    }

    if (!date) return;

    const newEvent: CalendarEvent = {
      start: date,
      title: title.trim(),
      allDay: true,
      color: {
        primary: this.newEventColor() + '35',
        secondary: this.newEventColor() + '34',
      },
      meta: {
        description: this.newEventDescription().trim(),
      },
    };

    this.eventsSignal.update((events) => [...events, newEvent]);
    this.showAddForm.set(false);
    this.selectedDate.set(null);
    this.newEventTitle.set('');
    this.newEventDescription.set('');
    this.newEventColor.set('#ec4899');
    this.isShowing.set(false);
    this.saveEventToBackend(newEvent);
  }

  cancelAdd() {
    this.showAddForm.set(false);
    this.selectedDate.set(null);
    this.newEventTitle.set('');
    this.newEventDescription.set('');
    this.newEventColor.set('#ec4899');
    this.titleError.set(false);
    this.isShowing.set(false);
  }

  startEdit() {
    this.quizBackup = {
      isSingle: this.quizIsSingle(),
      partnerName: this.quizPartnerName(),
      partnerBirthday: this.quizPartnerBirthday(),
      datingDate: this.quizDatingDate(),
    };
    this.isEditingQuiz.set(true);
  }

  cancelEdit() {
    if (this.quizBackup) {
      this.quizIsSingle.set(this.quizBackup.isSingle);
      this.quizPartnerName.set(this.quizBackup.partnerName);
      this.quizPartnerBirthday.set(this.quizBackup.partnerBirthday);
      this.quizDatingDate.set(this.quizBackup.datingdate);
      this.quizBackup = null;
    }
    this.isEditingQuiz.set(false);
  }

  private handleSwipe() {
    const swipeDistance = this.EndX - this.StartX;

    if (Math.abs(swipeDistance) > this.swipeX) {
      if (swipeDistance < 0) {
        this.nextMonth();
      } else {
        this.prevMonth();
      }
    }
  }
  private ShowToast(message: string) {
    this.toastMessage.set(message);
    this.toastVisible.set(true);

    setTimeout(() => {
      this.toastVisible.set(false);
      setTimeout(() => {
        this.toastMessage.set(null);
      }, 300);
    }, 3000);
  }

  private loadCalendarEvents() {
    if (!this.UserContext.isLoggedIn()) return;
    this.UserService.getCalendarEvents().subscribe({
      next: (events) => {
        const mapped = events.map((e) => ({
          start: new Date(e.startDate),
          title: e.title,
          allDay: e.allDay,
          color: e.color ? { primary: e.color, secondary: e.color } : undefined,
          meta: { description: e.description },
        }));
        console.log('[DEBUG] Mapped events:', mapped);
        this.eventsSignal.update((existing) => [...existing, ...mapped]);
      },
      error: (err) => console.error('Failed to load events', err),
    });
  }

  private saveEventToBackend(event: CalendarEvent) {
    if (!this.UserContext.isLoggedIn()) return;
    this.UserService.saveCalendarEvent({
      title: event.title,
      description: event.meta?.description,
      startDate: event.start.toISOString(),
      allDay: event.allDay,
      color: event.color?.primary,
    }).subscribe({
      next: () => {
        this.toastr.success('Event saved', 'Success');
        this.loadCalendarEvents();
      },

      error: (err) => console.error('Failed to save event', err),
    });
  }

  private calculateDaysTogether() {
    const datingDate = new Date(this.quizDatingDate());
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - datingDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.daysTogether.set(diffDays);
  }

  private calculateSpecialDates() {
    this.daysUntilValentines.set(this.daysUntilDate(1, 14));
    if (this.quizDatingDate()) {
      const dating = new Date(this.quizDatingDate());
      this.daysUntilAnniversary.set(this.daysUntilDate(dating.getMonth(), dating.getDate()));
    }
  }

  private daysUntilDate(month: number, day: number): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    let nextDate = new Date(currentYear, month, day);
    if (nextDate < today) {
      nextDate = new Date(currentYear + 1, month, day);
    }
    const diffMs = nextDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
  completeQuiz() {
    this.saveQuiz();
  }

  private generateQuizEvents() {
    const currentYear = new Date().getFullYear();
    const events: CalendarEvent[] = [];

    const bday = new Date(this.quizPartnerBirthday());
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {}
    events.push({
      start: new Date(currentYear, bday.getMonth(), bday.getDate()),
      title: "Partner's Birthday",
      allDay: true,
      color: {
        primary: '#f59e0b',
        secondary: '#fef3c7',
      },
      meta: {
        description: "Don't forget to celebrate!",
      },
    });

    const dating = new Date(this.quizDatingDate());
    for (let year = currentYear - 1; year <= currentYear + 2; year++) {
      const anniversaryYear = year - dating.getFullYear();
      events.push({
        start: new Date(year, dating.getMonth(), dating.getDate()),
        title:
          anniversaryYear > 0
            ? `${anniversaryYear} Year${anniversaryYear > 1 ? 's' : ''} Together`
            : 'Together Anniversary',
        allDay: true,
        color: {
          primary: '#8c81b6',
          secondary: '#7559d9',
        },
        meta: { description: 'Happy Anniversary' },
      });
    }
    this.eventsSignal.update((existing) => [...existing, ...events]);
  }
}

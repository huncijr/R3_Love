import { Component, signal } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';
import { CalendarMonthViewComponent, CalendarEvent } from 'angular-calendar';
import { HlmButton } from '@spartan-ng/helm/button';
import { FormsModule } from '@angular/forms';

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
} from 'lucide-angular';

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
      }),
      multi: true,
    },
  ],
})
export class Calendar {
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
        primary: this.newEventColor(),
        secondary: this.newEventColor() + '20',
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

    this.ShowToast('Event added succesfully');
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
}

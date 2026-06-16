import { Component } from '@angular/core';
import { DatePipe, NgFor } from '@angular/common';
import { CalendarMonthViewComponent, CalendarEvent } from 'angular-calendar';
import { HlmButton } from '@spartan-ng/helm/button';

import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  ChevronLeft,
  ChevronRight,
  CalendarHeart,
  CalendarOff,
} from 'lucide-angular';

@Component({
  selector: 'app-calendar',
  imports: [CalendarMonthViewComponent, DatePipe, LucideAngularModule, HlmButton, NgFor],
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
  get events(): CalendarEvent[] {
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

  onTouchStart(event: TouchEvent) {
    this.StartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.EndX = event.changedTouches[0].screenX;
    this.handleSwipe();
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
}

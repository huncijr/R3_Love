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
      }),
      multi: true,
    },
  ],
})
export class Calendar {
  viewDate: Date = new Date();
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
  }

  nextMonth() {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.viewDate = newDate;
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

import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CalendarMonthViewComponent } from 'angular-calendar';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  LucideAngularModule,
  LUCIDE_ICONS,
  LucideIconProvider,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-calendar',
  imports: [CalendarMonthViewComponent, DatePipe, LucideAngularModule, HlmButton],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        ChevronLeft,
        ChevronRight,
      }),
      multi: true,
    },
  ],
})
export class Calendar {
  viewDate: Date = new Date();
  events = [];
  // const date
  //   currentDate = signal(new Date());
  //   weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  //   monthYearLabel = computed(() => {
  //     return this.currentDate().toLocaleDateString('en-US', {
  //       month: 'long',
  //       year: 'numeric',
  //     });
  //   });
  //   calendarDays = computed(() => {
  //     const date = this.currentDate();
  //     const year = date.getFullYear();
  //     const month = date.getMonth();

  //     const firstDayOfMonth = new Date(year, month, 1);
  //     const lastDayOfMonth = new Date(year, month + 1, 0);
  //     const startDay = firstDayOfMonth.getDay();
  //     const daysInMonth = lastDayOfMonth.getDate();

  //     const offset = startDay === 0 ? 6 : startDay - 1;
  //     const days: {
  //       day: number | null;
  //       isCurrentMonth: boolean;
  //       isToday: boolean;
  //     }[] = [];

  //     for (let i = 0; i < offset; i++) {
  //       days.push({ day: null, isCurrentMonth: false, isToday: false });
  //     }

  //     const today = new Date();
  //     for (let i = 1; i <= daysInMonth; i++) {
  //       const isToday =
  //         i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  //       days.push({ day: i, isCurrentMonth: true, isToday });
  //     }

  //     const remaining = 42 - days.length;
  //     for (let i = 0; i < remaining; i++) {
  //       days.push({ day: null, isCurrentMonth: false, isToday: false });
  //     }
  //     return days;
  //   });

  prevMonth() {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.viewDate = newDate;
    // const current = this.currentDate();
    // this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.viewDate = newDate;
  }
}

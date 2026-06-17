import { Component, signal, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';

import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Menu,
  Home,
  User,
  GamepadDirectional,
  ChevronUp,
  ChevronDown,
  CalendarHeart,
  Gift,
  HeartPulse,
} from 'lucide-angular';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        Menu,
        Home,
        User,
        GamepadDirectional,
        ChevronUp,
        CalendarHeart,
        Gift,
        HeartPulse,
        ChevronDown,
      }),
      multi: true,
    },
  ],
})
export class Navbar {
  isMenuOpen = signal(false);
  isGamesOpen = signal(false);

  constructor(private elementRef: ElementRef) {
    const menuSaved = localStorage.getItem('menuOpen');
    const gameSaved = localStorage.getItem('gamesOpen');
    // console.log('menuOpen from storage:', menuSaved);
    // console.log('gamesOpen from storage:', gameSaved);
    this.isGamesOpen.set(menuSaved === 'true');
    this.isGamesOpen.set(gameSaved === 'true');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event?.target);
    if (!clickedInside && this.isGamesOpen()) {
      this.isGamesOpen.set(false);
      localStorage.setItem('gamesOpen', 'false');
    }
  }

  toggleMenu() {
    const newValue = !this.isMenuOpen();
    this.isMenuOpen.set(newValue);
    localStorage.setItem('menuOpen', newValue ? 'true' : 'false');
  }
  closeMenu() {
    this.isMenuOpen.set(false);
    this.isGamesOpen.set(false);
    localStorage.setItem('menuOpen', 'false');
    localStorage.setItem('gamesOpen', 'false');
  }
  toggleGames() {
    const newValue = !this.isGamesOpen();
    this.isGamesOpen.set(newValue);
    localStorage.setItem('gamesOpen', newValue ? 'true' : 'false');
    return newValue;
  }
}

import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Menu,
  Home,
  User,
} from 'lucide-angular';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, HlmButton],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ Menu, Home, User }),
      multi: true,
    },
  ],
})
export class Navbar {
  isMenuOpen = signal(false);
  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }
  closeMenu() {
    this.isMenuOpen.set(false);
  }
}

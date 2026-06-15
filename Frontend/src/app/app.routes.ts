import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Calendar } from './Pages/games/calendar/calendar';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'games/calendar', component: Calendar },
];

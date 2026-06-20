import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Calendar } from './Pages/games/calendar/calendar';
import { Account } from './Pages/account/account';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'games/calendar', component: Calendar },
  { path: 'account', component: Account },
];

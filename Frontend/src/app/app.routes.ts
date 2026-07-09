import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Calendar } from './Pages/games/calendar/calendar';
import { Account } from './Pages/account/account';
import { GiftFinder } from './Pages/games/gift/gift';
import { KissComponent } from './Pages/games/kiss/kiss_games';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'account', component: Account },
  { path: 'games/calendar', component: Calendar },
  { path: 'games/gift', component: GiftFinder },
  { path: 'games/kiss-game', component: KissComponent },
];

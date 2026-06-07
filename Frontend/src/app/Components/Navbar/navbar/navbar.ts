import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, BrnSheetImports],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}

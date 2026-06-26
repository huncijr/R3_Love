import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabel } from '@spartan-ng/helm/label';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  Mars,
  Venus,
  User,
  CircleCheck,
  Eye,
  EyeOff,
  Calendar,
  Gift,
  Gamepad2,
  MoveRight,
} from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSwitch } from '../../ui/switch/src';
import { UserService } from '../../services/user.service';
import { UserContext } from '../../services/UserContext/user-context';

@Component({
  selector: 'app-account',
  imports: [
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmLabel,
    LucideAngularModule,
    HlmInput,
    HlmSwitch,
    RouterLink,
  ],
  templateUrl: './account.html',
  providers: [
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        Mars,
        Venus,
        User,
        CircleCheck,
        Eye,
        EyeOff,
        Calendar,
        Gamepad2,
        Gift,
        MoveRight,
      }),
    },
  ],
  styleUrl: './account.scss',
})
export class Account {
  private toastr = inject(ToastrService);
  private userService = inject(UserService);
  private userContext = inject(UserContext);

  private syncCalendarQuiz() {
    const savedQuiz = localStorage.getItem('calendar-quiz');
    if (!savedQuiz) return;

    const data = JSON.parse(savedQuiz);
    this.userService
      .saveCalendarQuiz(data.hasPartner ?? false, data.datingDate || '', data.partnerBirthday || '')
      .subscribe({
        next: () => {
          localStorage.removeItem('calendar-quiz');
        },
        error: (err) => {
          console.error('Failed to sync calendar quiz', err);
        },
      });
  }

  currentUser = this.userContext.currentUser;

  username = signal('');
  password = signal('');
  gender = signal('');
  confirmPassword = signal('');

  isSubmited = signal(false);
  isLoading = signal(false);
  showPassword = signal(true);
  showConfirmPassword = signal(true);
  isLoginMode = signal(false);

  Setgender(value: string) {
    this.gender.set(value);
  }

  checkPassword(password: string): boolean {
    const errors: string[] = [];
    if (!password.trim()) {
      errors.push('Password cant be blank!');
    }
    if (password.length < 3) {
      errors.push('Password is too short!');
    }
    if (password.length > 15) {
      errors.push('Password is too long!');
    }
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(password)) {
      errors.push('Password must contain at least 1 special character (!@#$%^&*...)');
    }
    if (errors.length > 0) {
      this.toastr.error(errors.join(' '), 'Password Error');
    }
    return true;
  }

  checkUsername(username: string): boolean {
    const errors: string[] = [];
    if (!username.trim()) {
      errors.push('Username cannot be blank!');
    }
    if (username.length < 4) {
      errors.push('Username is too short! Minimum 4 characters.');
    }
    if (username.length > 15) {
      errors.push('Username is too long! Maximum 15 characters.');
    }
    if (errors.length > 0) {
      this.toastr.error(errors.join(' '), 'Password Error');
    }
    return true;
  }

  checkPasswordsMatch(password: string, confirmPassword: string): boolean {
    if (password !== confirmPassword) {
      this.toastr.error('The passwords doesnt match', 'Error');
      return false;
    }
    return true;
  }

  onSubmit() {
    if (this.isLoginMode()) {
      this.onLogin();
      return;
    }
    const isUsernameValid = this.checkUsername(this.username());
    const isPasswordValid = this.checkPassword(this.password());
    const isPasswordMatch = this.checkPasswordsMatch(this.password(), this.confirmPassword());

    if (!this.gender()) {
      this.toastr.warning('Please select a gender', 'Warning');
      return;
    }

    if (isUsernameValid && isPasswordValid && isPasswordMatch && this.gender()) {
      this.isLoading.set(true);
      this.userService.createUser(this.username(), this.password(), this.gender()).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.isSubmited.set(true);
          this.userContext.login(response.user, response.token);
          this.toastr.success('Account created successfully!', 'Success');
          this.syncCalendarQuiz();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.isSubmited.set(false);
          const errorMessage = err.message || 'Something went wrong';
          this.toastr.error(errorMessage, 'Error');
          console.error('GraphQL error', err);
        },
      });
      this.isSubmited.set(true);
      console.log('Account created:', {
        username: this.username(),
        password: this.password(),
        gender: this.gender(),
      });
    }
  }

  logout() {
    this.userContext.logout();
    this.toastr.info('You have been logged out', 'Logout');
  }

  onLogin() {
    if (!this.username().trim() || !this.password().trim()) {
      this.toastr.warning('Please enter username and password', 'Warning');
      return;
    }
    this.isLoading.set(true);
    this.userService.login(this.username(), this.password()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSubmited.set(true);
        this.userContext.login(response.user, response.token);
        this.toastr.success('Logged in successfully', 'Success');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isSubmited.set(false);
        const errorMessage = err.message || 'Login failed';
        this.toastr.error(errorMessage, 'Error');
        console.error('Login error', err);
      },
    });
  }

  toggleMode() {
    this.isLoginMode.update((value) => !value);
    this.username.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.gender.set('');
  }
}

import { Component, computed, inject, OnInit, signal, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabel } from '@spartan-ng/helm/label';
import {
  LUCIDE_ICONS,
  LucideAngularModule,
  LucideIconProvider,
  Mail,
  MailCheck,
  Pen,
  Unplug,
} from 'lucide-angular';
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
  UserStar,
  EllipsisVertical,
  LogOut,
  Trash2,
  X,
  CircleCheckBig,
} from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSwitch } from '../../ui/switch/src';
import { CreateUserResponse, UserService } from '../../services/user.service';
import { UserContext } from '../../services/UserContext/user-context';
import { getCode } from 'country-list';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { environment } from '../../../enviroments/enviroment.prod';
import {
  HlmInputOtp,
  HlmInputOtpGroup,
  HlmInputOtpSeparator,
  HlmInputOtpSlot,
} from '@spartan-ng/helm/input-otp';
import { BrnInputImports } from '@spartan-ng/brain/input';
import { BrnInputOtp } from '@spartan-ng/brain/input-otp';

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
    };
    onTurnstileCallback?: (token: string) => void;
  }
}

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
    HlmDropdownMenuImports,
    BrnInputImports,
    HlmInputOtpGroup,
    HlmInputOtpSlot,
    BrnInputOtp,
    HlmInputOtp,
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
        UserStar,
        EllipsisVertical,
        LogOut,
        Trash2,
        X,
        CircleCheckBig,
        Unplug,
        Pen,
        Mail,
        MailCheck,
      }),
    },
  ],
  styleUrl: './account.scss',
})
export class Account implements OnInit, AfterViewInit {
  private toastr = inject(ToastrService);
  private userService = inject(UserService);
  private userContext = inject(UserContext);
  googleClientId = environment.googleClientId;

  emailVerified = signal(false);
  email = signal('');
  isSendingCode = signal(false);
  isVerifyingCode = signal(false);
  otpCode = signal('');
  loginEmail = signal('');

  showEmailVerification = computed(() => this.currentUser()?.email && !this.emailVerified());

  ngAfterViewInit(): void {
    window.onTurnstileCallback = (token: string) => {
      this.turnstileToken.set(token);
    };
    if (window.turnstile) {
      window.turnstile.render('.cf-turnstile', {
        sitekey: this.turnstileSiteKey,
        callback: (token: string) => {
          this.turnstileToken.set(token);
        },
      });
    }

    this.initGoogleAuth();
  }

  private initGoogleAuth() {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: this.googleClientId,
        callback: (response: any) => {
          this.handleGoogleCredential(response);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const container = document.getElementById('google-signin-btn');
      if (container) {
        (window as any).google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: container.parentElement?.clientWidth || 300,
        });
      }
    } else {
      setTimeout(() => this.initGoogleAuth(), 500);
    }
  }

  // Syncs locally stored calendar quiz to backend after successful registration
  private syncCalendarQuiz() {
    const savedQuiz = localStorage.getItem('calendar-quiz');
    if (!savedQuiz) return;

    const data = JSON.parse(savedQuiz);
    const isSingle = data.isSingle ?? (data.hasPartner != null ? !data.hasPartner : false);
    this.userService
      .saveCalendarQuiz(
        isSingle,
        data.partnerName || '',
        data.datingDate || '',
        data.partnerBirthday || '',
      )
      .subscribe({
        next: () => {
          localStorage.removeItem('calendar-quiz');
        },
        error: (err) => {
          console.error('Failed to sync calendar quiz', err);
        },
      });
  }

  showSpotifyDisconnectConfirm = signal(false);

  private syncGiftRecommendation() {
    const saved = localStorage.getItem('gift-recommendations');
    if (!saved) return;

    const data = JSON.parse(saved);
    this.userService
      .saveGiftRecommendations({
        answers: data.answers,
        recommendations: data.recommendations,
      })

      .subscribe({
        next: () => {
          localStorage.removeItem('gift-recommendations');
          this.userService.getUserProgress().subscribe({
            next: (progress) => this.userProgress.set(progress),
            error: (err) => console.error('Failed to refresh progress', err),
          });
        },
        error: (err) => {
          console.error('Failed to sync gift recommendations', err);
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
  showDeleteConfirm = signal(false);

  spotifyConnected = signal(false);
  pendingEmail = signal('');
  showOtpModal = signal(false);

  isFinished = computed(() => {
    return this.setupItems().every((item) => item.done);
  });

  calendarQuiz = signal<any>(null);
  userProgress = signal<{ calendarDone: boolean; giftDone: boolean; gameDone: boolean }>({
    calendarDone: false,
    giftDone: false,
    gameDone: false,
  });

  showGenderEditModal = signal(false);

  showGenderCard = computed(() => this.currentUser() !== null && !this.currentUser()?.gender);

  spotifyDisplayName = signal<string | null>(null);

  turnstileToken = signal('');
  turnstileSiteKey = environment.turnstileSiteKey;

  // Counts how many of the three game modules the user has completed
  completedCount = computed(() => {
    let count = 0;
    if (this.userProgress().calendarDone) count++;
    if (this.userProgress().giftDone) count++;
    if (this.userProgress().gameDone) count++;
    return count;
  });

  // Returns the list of setup steps with their completion status
  setupItems = computed(() => {
    let items: Array<{ id: string; label: string; done: boolean }> = [];
    items.push({
      id: 'calendar',
      label: 'Calendar Quiz',
      done: this.userProgress().calendarDone,
    });
    items.push({
      id: 'gift',
      label: 'gift Setup',
      done: this.userProgress().giftDone,
    });
    items.push({
      id: 'game',
      label: 'game Setup',
      done: this.userProgress().gameDone,
    });

    return items;
  });

  openSpotifyDisconnectConfirm() {
    this.showSpotifyDisconnectConfirm.set(true);
  }

  cancelSpotifyDisconnect() {
    this.showSpotifyDisconnectConfirm.set(false);
  }

  confirmDisconnectSpotify() {
    this.showSpotifyDisconnectConfirm.set(false);
    this.userService.disconnectSpotify().subscribe({
      next: () => {
        this.spotifyConnected.set(false);
        this.spotifyDisplayName.set(null);
        sessionStorage.removeItem('spotifyDisplayName');
        this.toastr.success('Spotify disconnected', 'Done');
      },
      error: (err) => {
        this.toastr.error('Failed to disconnect Spotify', 'Error');
      },
    });
  }

  ngOnInit() {
    this.loadProgress();

    (window as any).handleGoogleCredential = (response: any) => {
      this.handleGoogleCredential(response);
    };

    const savedSpotifyName = sessionStorage.getItem('spotifyDisplayName');
    if (savedSpotifyName) {
      this.spotifyDisplayName.set(savedSpotifyName);
    }
    this.userService.getCalendarQuiz().subscribe({
      next: (quiz) => {
        this.calendarQuiz.set(quiz);
      },
      error: (err) => console.error('Failed to load calendar quiz', err),
    });
    this.userService.getUserProgress().subscribe({
      next: (progress) => this.userProgress.set(progress),

      error: (err) => console.error('Failed to load progress', err),
    });

    this.userService.isSpotifyConnected().subscribe({
      next: (connected) => {
        this.spotifyConnected.set(connected);
        if (connected) {
          this.userService.getSpotifyProfile().subscribe({
            next: (profile) => {
              const name = profile?.displayName ?? null;
              if (name) {
                sessionStorage.setItem('spotifyDisplayName', name);
              } else {
                sessionStorage.removeItem('spotifyDisplayName');
              }
            },
            error: (err) => console.error('Failed to load Spotify profile', err),
          });
        } else {
          this.spotifyDisplayName.set(null);
          sessionStorage.removeItem('spotifyDisplayName');
        }
      },
      error: (err) => {
        console.error('Failed to check Spotify status', err);
      },
    });

    const user = this.currentUser();
    this.emailVerified.set(!!(user as any)?.emailVerified);
  }

  Setgender(value: string) {
    this.gender.set(value);
  }

  // Validates password length and special character requirements
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

  private loadProgress(): void {
    this.userService.getUserProgress().subscribe({
      next: (progress) => this.userProgress.set(progress),
      error: (err) => console.error('Failed to load progress', err),
    });
  }

  // Validates username length constraints
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

  // Ensures password and confirmation fields match
  checkPasswordsMatch(password: string, confirmPassword: string): boolean {
    if (password !== confirmPassword) {
      this.toastr.error('The passwords doesnt match', 'Error');
      return false;
    }
    return true;
  }

  handleGoogleCredential(response: { credential: string }) {
    if (!this.turnstileToken()) {
      this.toastr.warning('Please complete the captcha first', 'Warning');
      return;
    }

    this.userService.googleAuth(response.credential).subscribe({
      next: (res) => {
        this.userContext.login(res.user, res.token);
        this.emailVerified.set(!!res.user.emailVerified);
        this.toastr.success('Signed in with Google', 'Welcome');
        this.syncCalendarQuiz();
        this.syncGiftRecommendation();
      },
      error: (err) => {
        this.toastr.error(err.message || 'Google sign-in failed', 'Error');
      },
    });
  }

  // Handles both registration and login form submission
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
      this.userService
        .createUser(
          this.username(),
          this.password(),
          this.email(),
          this.gender(),
          this.turnstileToken(),
        )
        .subscribe({
          next: (response) => {
            console.log('Create user response, token', JSON.stringify(response.token));
            this.isLoading.set(false);
            this.isSubmited.set(false);
            if (response.token) {
              this.userContext.login(response.user, response.token);
              this.toastr.success('Account created!', 'Success');
              this.syncCalendarQuiz();
              this.syncGiftRecommendation();
            } else {
              this.isSubmited.set(true);
              this.toastr.success('Check your email for verification code!');
              this.pendingEmail.set(response.user.email || this.email());
              this.showOtpModal.set(true);
            }
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

  sendVerificationCode() {
    this.isSendingCode.set(true);
    this.userService.sendVerificationEmail().subscribe({
      next: () => {
        this.isSendingCode.set(false);
        this.toastr.success('Code sent to your email');
      },
      error: (err) => {
        this.isSendingCode.set(false);
        this.toastr.error(err.message || 'Failed to send code', 'Error');
      },
    });
  }

  verifyCode() {
    console.log('Code', this.otpCode());
    const code = this.otpCode();
    if (code.length !== 6) return;
    this.isVerifyingCode.set(true);
    this.userService.verifyEmail(code, this.pendingEmail()).subscribe({
      next: (response: any) => {
        this.isVerifyingCode.set(false);
        if (response.token) {
          this.userContext.login(response.user, response.token);
          this.showOtpModal.set(false);
          this.toastr.success('Email verified! Welcome!');
        }
      },
      error: (err) => {
        this.isVerifyingCode.set(false);
        this.toastr.error(err.message);
      },
    });
  }

  onOtpComplete(code: string) {
    this.otpCode.set(code);
    this.verifyCode();
  }

  openGenderEdit() {
    this.showGenderEditModal.set(true);
  }

  closeGenderEdit() {
    this.showGenderEditModal.set(false);
  }

  selectGender(gender: string) {
    this.userService.updateUserGender(gender).subscribe({
      next: (updateUser) => {
        this.userContext.updateUser(updateUser);
        this.showGenderEditModal.set(false);
        this.toastr.success('Gender set!', 'Done');
      },
      error: (err) => this.toastr.error('Failed to set gender', 'Error'),
    });
  }

  // Clears user session and shows logout confirmation
  logout() {
    this.userContext.logout();
    this.resetForm();
    this.calendarQuiz.set(null);
    this.userProgress.set({ calendarDone: false, giftDone: false, gameDone: false });
    sessionStorage.removeItem('spotifyDisplayName');
    this.toastr.info('You have been logged out', 'Logout');
  }

  signOut() {
    this.logout();
  }

  resetTurnstile() {
    this.turnstileToken.set('');
    if (window.turnstile) {
      window.turnstile.reset();
    }
  }

  confirmDeleteAccount() {
    this.showDeleteConfirm.set(false);

    this.userService.deleteUser().subscribe({
      next: () => {
        this.toastr.success('Your account has been deleted', 'Goodbye');
        this.logout();
      },
      error: (err) => {
        const errorMessage = err.message || 'Failed to delete account';
        this.toastr.error(errorMessage, 'Error');
        console.error('Delete account error', err);
      },
    });
  }

  private resetForm() {
    this.username.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.gender.set('');
    this.email.set('');
  }

  openDeleteConfirm() {
    this.showDeleteConfirm.set(true);
  }

  cancelDeleteAccount() {
    this.showDeleteConfirm.set(false);
  }

  // Authenticates existing user and stores session token
  onLogin() {
    if (!this.loginEmail().trim() || !this.password().trim()) {
      this.toastr.warning('Please enter email and password', 'Warning');
      return;
    }

    this.isLoading.set(true);
    this.userService.login(this.loginEmail(), this.password(), this.turnstileToken()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSubmited.set(true);
        this.userContext.login(response.user, response.token);
        this.emailVerified.set(!!response.user.emailVerified);
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

  getCountryFlag(countryName: string | null | undefined): string {
    if (!countryName) return ``;
    const code = getCode(countryName);
    if (!code) return ``;
    const codePoints = code
      .toUpperCase()
      .split(``)
      .map((char) => 127397 + char.charCodeAt(0));

    return String.fromCodePoint(...codePoints);
  }

  // Switches between login and registration form views
  toggleMode() {
    this.isLoginMode.update((value) => !value);
    this.username.set('');
    this.password.set('');
    this.confirmPassword.set('');
    this.gender.set('');
    this.loginEmail.set('');
    this.email.set('');
  }
}

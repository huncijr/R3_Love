import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmLabel } from '@spartan-ng/helm/label';
import { LUCIDE_ICONS, LucideAngularModule, LucideIconProvider } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { HlmInput } from '@spartan-ng/helm/input';
import { Mars, Venus, User, CircleCheck } from 'lucide-angular';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-account',
  imports: [
    FormsModule,
    HlmButton,
    HlmCardImports,
    HlmLabel,
    LucideAngularModule,
    HlmInput,
    HlmBadge,
  ],
  templateUrl: './account.html',
  providers: [
    { provide: LUCIDE_ICONS, useValue: new LucideIconProvider({ Mars, Venus, User, CircleCheck }) },
  ],
  styleUrl: './account.scss',
})
export class Account {
  private toastr = inject(ToastrService);
  private userService = inject(UserService);

  username = signal('');
  password = signal('');
  gender = signal('');
  isSubmited = signal(false);
  isLoading = signal(false);

  Setgender(value: string) {
    this.gender.set(value);
  }

  checkPassword(password: string): boolean {
    if (!password.trim()) {
      this.toastr.error('Password cant be blank!');
      return false;
    }
    if (password.length < 3) {
      this.toastr.error('Password is too short!');
      return false;
    }
    if (password.length > 15) {
      this.toastr.error('Password is too long!');
      return false;
    }
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialChars.test(password)) {
      this.toastr.error('Password must contain at least 1 special character (!@#$%^&*...)');
      return false;
    }
    return true;
  }

  checkUsername(username: string): boolean {
    if (!username.trim()) {
      this.toastr.error('Username cannot be blank!');
      return false;
    }
    if (username.length < 4) {
      this.toastr.error('Username is too short! Minimum 4 characters.');
      return false;
    }
    if (username.length > 15) {
      this.toastr.error('Username is too long! Maximum 15 characters.');
      return false;
    }
    return true;
  }

  onSubmit() {
    const isUsernameValid = this.checkUsername(this.username());
    const isPasswordValide = this.checkPassword(this.password());

    if (!this.gender()) {
      this.toastr.warning('PLease select a gender', 'Warning');
      return;
    }

    if (isUsernameValid && isPasswordValide && this.gender()) {
      this.isLoading.set(true);
      this.userService.createUser(this.username(), this.password(), this.gender()).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.isSubmited.set(true);
          this.toastr.success('Account created successfully!', 'Success');
          console.log('User created with ID:', response.id);
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
      this.toastr.success('Account created succesfully', 'Success');
      console.log('Account created:', {
        username: this.username(),
        password: this.password(),
        gender: this.gender(),
      });
    }
  }
}

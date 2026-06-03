import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';
import { domainValidator } from '../../../core/validators/domain.validator';
import { LoginLoadingScreenComponent } from '../login-loading-screen/login-loading-screen.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, Button, InputText, Message, LoginLoadingScreenComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  authError = false;
  showLoadingScreen = false;
  passwordVisible = false;

  private pendingLogin: { email: string; password: string } | null = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email, domainValidator('@musicapp.com')]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onLoadingFinished(): void {
    if (!this.pendingLogin) {
      this.showLoadingScreen = false;
      return;
    }

    const { email, password } = this.pendingLogin;
    this.pendingLogin = null;

    if (this.authService.login(email, password)) {
      // Mantener la pantalla de carga hasta que el router destruya este componente.
      this.router.navigate(['/app/playlists']);
      return;
    }

    this.showLoadingScreen = false;
    this.authError = true;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    this.authError = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.showLoadingScreen) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.pendingLogin = { email: email!, password: password! };
    this.showLoadingScreen = true;
  }

  isInvalid(field: 'email' | 'password'): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getEmailError(): string | null {
    const control = this.form.get('email');

    if (!control?.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'El correo es obligatorio';
    }

    if (control.errors['email']) {
      return 'Ingresa un correo válido';
    }

    if (control.errors['invalidDomain']) {
      return 'El correo debe ser del dominio @musicapp.com';
    }

    return null;
  }

  getPasswordError(): string | null {
    const control = this.form.get('password');

    if (!control?.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'La contraseña es obligatoria';
    }

    if (control.errors['minlength']) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    return null;
  }
}

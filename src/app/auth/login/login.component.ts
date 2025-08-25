import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from "../../service/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Reset any previous state
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = false;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { email, password } = this.loginForm.value;

      try {
        await this.authService.signIn(email, password);
        this.successMessage = 'Login successful!';
        this.router.navigate(['/toolbar/home']).then(() => {
          this.reloadPage();
        });
      } catch (error: any) {
        this.errorMessage = error.message || 'An error occurred during login.';
      } finally {
        this.loading = false;
      }
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}

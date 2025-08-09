import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../service/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    
    // Reset form state when component initializes
    this.resetForm();
  }

  resetForm() {
    this.loginForm.reset();
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
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
        await this.supabaseService.signIn(email, password);
        this.successMessage = 'Login successful!';
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.errorMessage = error.message || 'An error occurred during login.';
        this.loading = false;
      } finally {
        // Only reset loading if there was no error (success case is handled by navigation)
        if (!this.errorMessage) {
          this.loading = false;
        }
      }
    }
  }
}

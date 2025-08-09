import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../service/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Reset any previous state
    this.errorMessage = null;
    this.successMessage = null;
    this.loading = false;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;
      const { email, password } = this.registerForm.value;

      try {
        const data = await this.supabaseService.signUp(email, password);
        this.successMessage = 'Registration successful! You can now log in.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
        console.log('User:', data.user);
      } catch (error: any) {
        this.errorMessage = error.message || 'An error occurred during registration.';
      } finally {
        this.loading = false;
      }
    }
  }

}
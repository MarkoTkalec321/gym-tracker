import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from "@angular/router";
import { AuthService } from "../../service/auth.service";
import {ToastService} from "../../service/toast.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      dob: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.loading = false;
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirm_password')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const { first_name, last_name, dob, email, password } = this.registerForm.value;

      try {
        const data = await this.authService.signUp(email, password); // no destructuring

        if (data?.user) {
          await this.authService.updateClientProfile(data.user.id, {
            first_name,
            last_name,
            date_of_birth: dob
          });
        }

        this.toastService.showSuccess('Registration successful! You can now log in.');
        setTimeout(() => this.router.navigate(['/toolbar/login']), 1500);
        console.log('User:', data?.user);

      } catch (error: any) {
        if (error.status === 400 && error.message.includes('User already registered')) {
          this.toastService.showSuccess('This email is already registered. Please log in.');
        } else {
          this.toastService.showSuccess(error.message || 'An unexpected error occurred.');
        }
      } finally {
        this.loading = false;
      }
    }
  }


}

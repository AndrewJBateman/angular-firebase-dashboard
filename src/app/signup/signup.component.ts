import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  isProgressVisible: boolean;
  signupForm!: FormGroup;
  firebaseErrorMessage: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.isProgressVisible = false;
    this.firebaseErrorMessage = '';
  }

  // if the user's logged in, navigate to dashboard
  ngOnInit(): void {
    if (this.authService.userLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    // fill form with user details entered
    this.signupForm = new FormGroup({
      displayName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  signup() {
    if (this.signupForm.invalid)
      return;

    this.isProgressVisible = true;
    this.authService
      .signupUser(this.signupForm.value)
      .then((result) => {
        if (result == null)
          // null is success, false means there was an error
          this.router.navigate(['/dashboard']);
        else if (result.isValid == false)
          this.firebaseErrorMessage = result.message;

        this.isProgressVisible = false; // no matter what, when the auth service returns, we hide the progress indicator
      })
      .catch(() => {
        this.isProgressVisible = false;
      });
  }
}

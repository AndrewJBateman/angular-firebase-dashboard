import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore
} from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userLoggedIn: boolean;
  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.userLoggedIn = false;

    this.afAuth.onAuthStateChanged((user) => {
      // set up a subscription to always know the login status of the user
      if (user) {
        this.userLoggedIn = true;
      } else {
        this.userLoggedIn = false;
      }
    });
  }

  loginUser(email: string, password: string): Promise<any> {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Auth Service: loginUser: success');
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.log('Auth Service: login error code', error.code, error);
        if (error.code) return { isValid: false, message: error.message };
        return { isValid: true, message: 'no errors :-)' };
      });
  }

  // save user input details in database users directory
  signupUser(user: any): Promise<any> {
    return this.afAuth
      .createUserWithEmailAndPassword(user.email, user.password)
      .then((result) => {
        let emailLower = user.email.toLowerCase();

        this.afs.doc('/users/' + emailLower).set({
          accountType: 'admin',
          displayName: user.displayName,
          displayName_lower: user.displayName.toLowerCase(),
          email: user.email,
          email_lower: emailLower,
        });

        if (result.user !== null) {
          result.user.sendEmailVerification(); // immediately send the user a verification email
        }
      })
      .catch((error: any) => {
        console.log('Auth Service: signup error', error);
        if (error.code) return { isValid: false, message: error.message };
        return { isValid: true, message: 'no errors :-)' };
      });
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth
      .sendPasswordResetEmail(email)
      .then(() => {
        console.log('Auth Service: reset password success');
      })
      .catch((error) => {
        console.log('Auth Service: reset password error...');
        console.log(error.code);
        console.log(error);
        if (error.code) return error;
      });
  }

  async resendVerificationEmail() {
    // verification email is sent in the Sign Up function, but if you need to resend, call this function
    const checkedCurrentUser = await this.afAuth.currentUser;
    if (checkedCurrentUser !== null) {
      return checkedCurrentUser
        .sendEmailVerification()
        .then(() => {
          // this.router.navigate(['home']);
        })
        .catch((error) => {
          console.log('Auth Service: sendVerificationEmail error...');
          console.log('error code', error.code);
          console.log('error', error);
          if (error.code) return error;
        });
    }
  }

  logoutUser(): Promise<void> {
    return this.afAuth
      .signOut()
      .then(() => {
        this.router.navigate(['/home']); // when we log the user out, navigate them to home
      })
      .catch((error) => {
        console.log('Auth Service: logout error...', error.code, error);
        if (error.code) return error;
      });
  }

  setUserInfo(payload: object) {
    console.log('Auth Service: saving user info...');
    this.afs
      .collection('users')
      .add(payload)
      .then(function (res) {
        console.log('Auth Service: setUserInfo response...', res);
      });
  }

  getCurrentUser() {
    return this.afAuth.currentUser; // returns user object for logged-in users, otherwise returns null
  }
}

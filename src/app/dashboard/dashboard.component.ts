import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user: Observable<any> | null; // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)

  constructor(
    public afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {
    this.user = null;
  }

  // if user already logged in then get user details from Firestore
  ngOnInit(): void {
    this.afAuth.authState.subscribe((user) => {
      console.log('Dashboard: user', user);

      if (user && user.email !== null) {
        let emailLower = user.email.toLowerCase();
        this.user = this.firestore
          .collection('users')
          .doc(emailLower)
          .valueChanges();
      }
    });
  }
}

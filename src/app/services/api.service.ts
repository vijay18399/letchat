import { environment } from './../../environments/environment';
import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { take, map, switchMap, delay } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
const helper = new JwtHelperService();
export const TOKEN_KEY = 'jwt-token';

export interface User {
  username: string;
  email: string;
  _id: string;
}
export interface Group {
  groupid: string;
  owner: string;
  _id: string;
}
export interface Message {
  to: string;
  from: string;
  message: string;
  score: number;
  spamcheck: string;
  createdAt: Date;
  groupid: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);
  constructor(private storage: Storage, private http: HttpClient, private plt: Platform, private router: Router) {
    this.loadStoredToken();
  }
  loadStoredToken() {
    const platformObs = from(this.plt.ready());

    this.user = platformObs.pipe(
      switchMap(() => {
        return from(this.storage.get(TOKEN_KEY));
      }),
      map(token => {
        if (token) {
          const decoded = helper.decodeToken(token);
          this.userData.next(decoded);
          return true;
        } else {
          return null;
        }
      })
    );
  }

  login(credentials: {username: string, password: string }) {
    return this.http.post(`${environment.apiUrl}/login`, credentials).pipe(
      take(1),
      map(res => {
        // Extract the JWT
        return res['token'];
      }),
      switchMap(token => {
        const decoded = helper.decodeToken(token);
        this.userData.next(decoded);
        const storageObs = from(this.storage.set(TOKEN_KEY, token));
        return storageObs;
      })
    );
  }


  register(credentials: {username: string, email: string , password: string }) {
    return this.http.post(`${environment.apiUrl}/register`, credentials).pipe(
      take(1),
      switchMap(res => {
        console.log('result: ', res);
        return this.login(credentials);
      })
    );
  }

  getUserToken() {
    return this.userData.getValue();
  }

  getUserData() {
    const id = this.getUserToken().id;
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`).pipe(
      take(1)
    );
  }
  createGroup(data) {
    return this.http.post(`${environment.apiUrl}/create_group`, data).pipe(
      take(1)
    );
  }

  getAllUsers(id): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users/${id}`).pipe(
      take(1)
    );
  }
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${environment.apiUrl}/groups/`).pipe(
      take(1)
    );
  }

  getAllMessages(data: {to: string, from: string}): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages/${data.to}/${data.from}`).pipe(
      take(1)
    );
  }
  getAllGroupMessages(id): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/gmessages/${id}`).pipe(
      take(1)
    );
  }
  updateUser(id, data) {
    return this.http.put(`${environment.apiUrl}/users/${id}`, data).pipe(
      take(1)
    );
  }

  removeUser(id) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`).pipe(
      take(1)
    );
  }
  Detecturls(data) {
    return this.http.post(`${environment.apiUrl2}/url`, data).pipe(
      take(1)
    );
  }
  Translate(data) {
    return this.http.post(`${environment.apiUrl2}/translate`, data).pipe(
      take(1)
    );
  }
  DetectLang(data) {
    return this.http.post(`${environment.apiUrl2}/detect`, data).pipe(
      take(1)
    );
  }
  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next(null);
    });
  }

}

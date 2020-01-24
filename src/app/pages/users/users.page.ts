import { Component, OnInit } from '@angular/core';
import { ApiService, User } from '../../services/api.service';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  users: User[] = [];
  constructor(private api: ApiService, private loadingCtrl: LoadingController,
              private socket: Socket, private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.socket.fromEvent('new_user').subscribe(data => {
      const x = this.api.getUserToken()['username'];
      if (x !== data['username']) {
        this.showToast('new User joined' + data['username']);
      }

    });
    this.socket.fromEvent('logined').subscribe(data => {
      const x = this.api.getUserToken()['username'];
      if (x !== data['username']) {
        this.showToast(data['username'] + ' is online now');
      }
    });
    this.socket.fromEvent('message_in_group').subscribe(data => {
      this.showToast(data['from']+"@"+data['groupid'] +":"+data['message']);
    });
  }

  async loadUsers(event?) {
  //  const loading = await this.loadingCtrl.create();
    // loading.present();
    const x = this.api.getUserToken().username;
    this.api.getAllUsers(x).pipe(
      tap(data => {
        console.log(data);
        this.users = data;
      }),
      finalize(() => {
        // loading.dismiss();
        if (event) {
          event.target.complete();
        }
      })
    ).subscribe();
  }
  async showToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }
  signOut() {
    this.api.logout();
  }
}

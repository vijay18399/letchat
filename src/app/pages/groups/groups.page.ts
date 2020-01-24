import { Component, OnInit } from '@angular/core';
import { ApiService, Group } from '../../services/api.service';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {

  constructor(private api: ApiService,  
              private toastCtrl: ToastController,
              private loadingCtrl: LoadingController, private socket: Socket) { }
  groups: Group[] = [];
 ngOnInit() {
    this.loadGroups();
    this.socket.fromEvent('group_created').subscribe(data => {
        this.showToast(data['groupid'] + ' created successfully !! please reload ');
    });
    /*
    this.socket.fromEvent('message').subscribe(data => {
      this.showToast(data['from']+":"+data['message']);
    });
    */
    this.socket.fromEvent('message_in_group').subscribe(data => {
      this.showToast(data['from']+"@"+data['groupid'] +":"+data['message']);
    });
  }

  async loadGroups(event?) {
   // const loading = await this.loadingCtrl.create();
  //  loading.present();
    this.api.getAllGroups().pipe(
      tap(data => {
        this.groups = data;
      }),
      finalize(() => {
      //  loading.dismiss();
        if (event) {
          event.target.complete();
        }
      })
    ).subscribe();
  }

  signOut() {
    this.api.logout();
  }
  async showToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      position: 'top',
      duration: 2000
    });
    toast.present();
  }


}

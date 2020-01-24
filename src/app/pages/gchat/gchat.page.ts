import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';
import { LoadingController } from '@ionic/angular';
import { tap, finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-gchat',
  templateUrl: './gchat.page.html',
  styleUrls: ['./gchat.page.scss'],
})
export class GchatPage implements OnInit {
  data =  {
    groupid: '',
    from: '',
    message: ''
  };
  messages = null;
  constructor(private activatedRoute: ActivatedRoute, private api: ApiService,
              private loadingCtrl: LoadingController,  private socket: Socket,
              private toastCtrl: ToastController,     private router: Router
              ) { }

              ngOnInit() {
                this.loadMessages();
                this.socket.fromEvent('message_in_group').subscribe(data => {
                  this.loadMessage(data);
                });
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
              }
              isTyping() {
                this.socket.emit('typing', this.data);
              }
              loadMessage(message) {
                console.log(this.messages);
                this.messages.push(message);
                console.log(this.messages);
              }
              async loadMessages(event?) {
                // const loading = await this.loadingCtrl.create();
                // loading.present();
                this.data.groupid = this.activatedRoute.snapshot.paramMap.get('gid');
                this.data.from = this.api.getUserToken().username;
                console.log(this.data);
                this.api.getAllGroupMessages(this.data.groupid).pipe(
                  tap(data => {
                    console.log(data);
                    this.messages = data;
                  }),
                  finalize(() => {
                    // loading.dismiss();
                    if (event) {
                      event.target.complete();
                    }
                  })
                ).subscribe();
              }
              sendMessage() {
                this.socket.emit('message_in_group', this.data);
                this.data.message = '';
              }
              async showToast(msg) {
                let toast = await this.toastCtrl.create({
                  message: msg,
                  position: 'top',
                  duration: 2000
                });
                toast.present();
              }
              getSentiment(sentiment) {
                if (sentiment > 0.5) {
                  return 'success';
                } else if (sentiment < 0.0) {
                  return 'danger';
                } else {
                  return 'default';
                }
              }
              isspam(str) {
                if (str === 'spam') {
                  return (true);
                } else {
                  return (false);
                }
              }
              isbirthday(str) {
                str = str.toLowerCase();
                if (str.includes('happy birthday')) {
                    return true;
                } else {
                    return false;
                }
            }
            iscongratulation(str) {
              str = str.toLowerCase();
              if (str.includes('congratulations')) {
                  return true;
              } else {
                  return false;
              }
            }
            goback() {
              this.router.navigateByUrl('/app/groups');
            }

}

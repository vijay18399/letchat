import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';
import { LoadingController } from '@ionic/angular';
import { tap, finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  data =  {
    to: '',
    from: '',
    message: ''
  };
   typing = false;
  timeout = undefined;
  @ViewChild(IonContent, {read: IonContent, static: false}) myContent: IonContent;
  messages = null;
  constructor(private activatedRoute: ActivatedRoute, private api: ApiService,
              private loadingCtrl: LoadingController,  private socket: Socket,
              private toastCtrl: ToastController,     private router: Router
              ) { }


  ngOnInit() {
    this.ScrollToBottom(100);
    this.loadUsers();
    this.socket.fromEvent('message').subscribe(data => {
      this.loadMessage(data);
      this.ScrollToBottom(300);
    });
    this.socket.fromEvent('new_user').subscribe(data => {
      const x = this.api.getUserToken()['username'];
      if (x !== data['username']) {
        this.showToast('new User joined' + data['username']);
      }

    });
    this.socket.fromEvent('message_in_group').subscribe(data => {
      this.showToast(data['from']+"@"+data['groupid'] +":"+data['message']);
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
  async loadUsers(event?) {
    // const loading = await this.loadingCtrl.create();
    // loading.present();
    this.data.to = this.activatedRoute.snapshot.paramMap.get('id');
    this.data.from = this.api.getUserToken().username;
    this.api.getAllMessages(this.data).pipe(
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
  loadMessages(data) {
   if ( (data.to === this.data.to && data.from === this.data.from ) ||  (data.to === this.data.from && data.from === this.data.to )  ) {
   this.messages.push(data);
   } else if (data.to === this.data.from && data.from !== this.data.to) {
    this.showToast('you got a messsage from ' + data.from);
   }
  }
  loadMessage(message) {
    console.log(this.messages);
    this.messages.push(message);
    console.log(this.messages);
  }
  sendMessage() {
    this.socket.emit('send-message', this.data);
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
ScrollToBottom(x){
  setTimeout(() => {
    this.myContent.scrollToBottom(x);
 }, 500);

}
goback() {
  this.router.navigateByUrl('/app/users');
}



}

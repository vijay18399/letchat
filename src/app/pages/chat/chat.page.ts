import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { tap, finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  isactive = false;
  data = {
    to: '',
    from: '',
    message: ''
  };
  typing = false;
  timeout = undefined;
  @ViewChild(IonContent, { read: IonContent, static: false }) myContent: IonContent;
  messages = null;
  constructor(private activatedRoute: ActivatedRoute, private api: ApiService,
    private loadingCtrl: LoadingController, private socket: Socket,
    private toastCtrl: ToastController, private router: Router,
    private tts: TextToSpeech, public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController
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
      this.showToast(data['from'] + "@" + data['groupid'] + ":" + data['message']);
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
   
    if ((data.to === this.data.to && data.from === this.data.from) || (data.to === this.data.from && data.from === this.data.to)) {
      this.messages.push(data);
    } else if (data.to === this.data.from && data.from !== this.data.to) {
      this.showToast('you got a messsage from ' + data.from);
    }
  }
  loadMessage(message) {
    console.log(this.messages);
    console.log(this.isactive);
    console.log(message.to === this.data.from && message.from === this.data.to);
    if( (message.to === this.data.from && message.from === this.data.to)&& this.isactive){
      this.tts.speak(message['message'])
      .then(() => console.log('Success'))
      .catch((reason: any) => console.log(reason));
    }
    this.messages.push(message);
    console.log(this.messages);
  }
  sendMessage() {
    console.log(this.data);
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
  ScrollToBottom(x) {
    setTimeout(() => {
      this.myContent.scrollToBottom(x);
    }, 500);

  }
  goback() {
    this.router.navigateByUrl('/app/users');
  }
  async presentActionSheet(data) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Message',
      buttons: [
        {
          text: 'Detect language',
          icon: 'share',
          handler: () => {
            this.DetectLang(data);
          }
        }, {
          text: 'Translate to English',
          icon: 'arrow-dropright-circle',
          handler: () => {
            this.Translate(data);
          }
        }, {
          text: 'Detect Urls',
          icon: 'heart',
          handler: () => {
            this.Detecturls(data);
          }
        }, {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });
    await actionSheet.present();
  }

  async Detecturls(data) {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.Detecturls(data).pipe(
      finalize(() => loading.dismiss())
    )
      .subscribe(async res => {
        console.log(res);
        var message = '';
        if (res['length'] == 0) {
          message = 'No urls found';
        }
        for (var i = 0; i < res['length']; i++) {
          message = message + `<ion-anchor (onclick)="open(res[i].url)"> ${res[i].url} is ${res[i].spamcheck} <ion-anchor/><br>`;
        }
        const alert = await this.alertCtrl.create({
          header: 'Result',
          message: message,
          buttons: ['OK']
        });
        await alert.present();
      }, async err => {
        const alert = await this.alertCtrl.create({
          header: 'error',
          message: err.error['msg'],
          buttons: ['OK']
        });
        await alert.present();
      });
  }
  async DetectLang(data) {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.DetectLang(data).pipe(
      finalize(() => loading.dismiss())
    )
      .subscribe(async res => {
        if (res['error']) {
          const alert = await this.alertCtrl.create({
            header: 'Language Detected Failed',
            message: res['msg'],
            buttons: ['OK']
          });
          await alert.present();
        }
        else {
          const alert = await this.alertCtrl.create({
            header: 'Language Detected',
            message: "<ion-button size='small' color='secondary'>" + res['language'] + "</ion-button>",
            buttons: ['OK']
          });
          await alert.present();
        }

      
      });
  }
  async Translate(data) {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.Translate(data).pipe(
      finalize(() => loading.dismiss())
    )
      .subscribe(async res => {
        console.log(res);
        if (res['error']) {
          const alert = await this.alertCtrl.create({
            header: 'Language Translation Failed',
            message: res['msg'],
            buttons: ['OK']
          });
          await alert.present();
        }
        else {
          const alert = await this.alertCtrl.create({
            header: 'Translation Completed',
            message: "<ion-button size='small' color='secondary'>" + res['language'] + "</ion-button>" + res['message'] + "<br><ion-button size='small' color='tertiary'>English</ion-button> " + res['result'],
            buttons: ['OK']
          });
          await alert.present();
        }
     
      });
  }
  urlcolor(x) {
    if (x) {
      return ('danger');
    } else {
      return ('success');
    }
  }
  ionViewWillEnter(){
    console.log('enetering'+ this.isactive);
    this.isactive = true;
    console.log(this.isactive); 
  }
  ionViewWillLeave(){
    console.log('leaving'+this.isactive);
    this.isactive = false;
    console.log(this.isactive);
  }
  open(url){
    window.open(url, '_system');
  }


}

import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  credentials = {
    email: '',
    password: '',
    username : ''
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private socket: Socket
  ) {}
  ngOnInit() { }
  async register() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.register(this.credentials).pipe(
      finalize(() => loading.dismiss())
    )
    .subscribe(res => {
        this.socket.emit('signup', this.credentials) ;
        this.router.navigateByUrl('/app');
    }, async err => {
      const alert = await this.alertCtrl.create({
        header: 'Registration failed',
        message: err.error['msg'],
        buttons: ['OK']
      });
      await alert.present();
    });
  }
}

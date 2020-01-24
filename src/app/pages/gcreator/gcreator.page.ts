import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
@Component({
  selector: 'app-gcreator',
  templateUrl: './gcreator.page.html',
  styleUrls: ['./gcreator.page.scss'],
})
export class GcreatorPage implements OnInit {
  credentials = {
    groupid: '',
    owner: ''
  };
  constructor(private api: ApiService,
              private router: Router, private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private socket: Socket) { }

  ngOnInit() {
    this.credentials.owner = this.api.getUserToken().username;
  }

  async createGroup() {
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.createGroup(this.credentials).pipe(
      finalize(() => loading.dismiss())
    )
    .subscribe(res => {
      if (res) {
        this.socket.emit('group_created', this.credentials);
        this.router.navigateByUrl('/app/groups');
      }
    }, async err => {
      const alert = await this.alertCtrl.create({
        header: 'Group Creation failed',
        message: err.error.msg,
        buttons: ['OK']
      });
      await alert.present();
    });
  }
  goback() {
    this.router.navigateByUrl('/app/groups');
  }

}

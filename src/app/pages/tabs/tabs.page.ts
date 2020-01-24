import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  constructor(private socket: Socket) {}

  ngOnInit() {
  }

}

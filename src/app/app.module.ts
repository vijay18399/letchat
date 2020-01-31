import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import * as process from 'process';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {IonicGestureConfig} from './gestures/ionic-gesture-config';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';
import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

const config: SocketIoConfig = { url:   process.env.SOCKET ||
   'https://letchats-socket.herokuapp.com'  , options: {} };
// https://letchats-socket.herokuapp.com
import { TOKEN_KEY } from './services/api.service';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get(TOKEN_KEY);
    },
    whitelistedDomains: ['localhost:5000', 'letchats-server.herokuapp.com'] // Add your Heroku URL in here!
  };
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    IonicStorageModule.forRoot(),
    SocketIoModule.forRoot(config),
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
  providers: [
    StatusBar,
    SplashScreen,
    TextToSpeech,
    Camera,
    File,
    WebView,
    FilePath,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: IonicGestureConfig
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

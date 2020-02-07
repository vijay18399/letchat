import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { tap, finalize } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import { ActionSheetController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { VideoPlayer } from '@ionic-native/video-player/ngx';

import {
  MediaCapture,
  MediaFile,
  CaptureError
} from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { Storage } from '@ionic/storage';
const STORAGE_KEY = 'my_images';
const MEDIA_FOLDER_NAME = 'my_media';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  images = [];
  files = [];
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
    private loadingCtrl: LoadingController,
    private socket: Socket,
    private toastCtrl: ToastController, private router: Router,
    private tts: TextToSpeech, public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController,
    private camera: Camera, private file: File,
    private webview: WebView, private storage: Storage,
    private plt: Platform, private ref: ChangeDetectorRef, private filePath: FilePath,
    private media: Media,
    private streamingMedia: StreamingMedia,
    private mediaCapture: MediaCapture

  ) { }


  ngOnInit() {
   // Enable
 // (<any>window).plugins.preventscreenshot.enable((a) => this.successCallback(a), (b) => this.errorCallback(b));
 
// Disable
  
 


    ///////////////////////////////////////////
    this.plt.ready().then(() => {

      let path = this.file.dataDirectory;
      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
        () => {
       this.loadFiles();
        },
        err => {
          this.file.createDir(path, MEDIA_FOLDER_NAME, false);
        }
      );
      
    });



    //////////////////////////////////////////////////
    this.ScrollToBottom(100);
    this.loadUsers();
    this.socket.fromEvent('message').subscribe(data => {
      this.loadMessage(data);
      this.ScrollToBottom(300);
    });
    this.socket.fromEvent('new_user').subscribe(data => {
      const x = this.api.getUserToken()['username'];
      if (x !== data['username']) {
        this.presentToast('new User joined' + data['username']);
      }

    });
    this.socket.fromEvent('message_in_group').subscribe(data => {
      this.presentToast(data['from'] + "@" + data['groupid'] + ":" + data['message']);
    });

    this.socket.fromEvent('logined').subscribe(data => {
      const x = this.api.getUserToken()['username'];
      if (x !== data['username']) {
        this.presentToast(data['username'] + ' is online now');
      }
    });
  }

//////////////////////////////////////////////////////////////////////////////
loadFiles() {
  this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
    res => {
      this.files = res;
    },
    err => console.log('error loading files: ', err)
  );
}

////////////////////////////////////////////////////////////////////////



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
      this.presentToast('you got a messsage from ' + data.from);
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
  async presentToast(msg) {
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
    console.log('enetering' + this.isactive);
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
//here
loadStoredImages() {
  this.storage.get(STORAGE_KEY).then(images => {
    if (images) {
      let arr = JSON.parse(images);
      this.images = [];
      for (let img of arr) {
        let filePath = this.file.dataDirectory + img;
        let resPath = this.pathForImage(filePath);
        this.images.push({ name: img, path: resPath, filePath: filePath });
      }
    }
  });
}

pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    let converted = this.webview.convertFileSrc(img);
    return converted;
  }
}
uploadcamera(){
  this.takePicture(this.camera.PictureSourceType.CAMERA);
}
uploadimage(){
  this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
}
uploaddocument(){
  alert('hi');
}
takePicture(sourceType: PictureSourceType) {
  var options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
  };

  this.camera.getPicture(options).then(imagePath => {
      if (this.plt.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
              .then(filePath => {
                  let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                  let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
                  this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
              });
      } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
  });

}

createFileName() {
  var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
  return newFileName;
}

copyFileToLocalDir(namePath, currentName, newFileName) {
  this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
  }, error => {
      this.presentToast('Error while storing file.');
  });
}

updateStoredImages(name) {
  this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
          let newImages = [name];
          this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
          arr.push(name);
          this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;
      let resPath = this.pathForImage(filePath);

      let newEntry = {
          name: name,
          path: resPath,
          filePath: filePath
      };

      this.images = [newEntry, ...this.images];
      this.ref.detectChanges(); // trigger change detection cycle
  });
}
deleteImage(imgEntry, position) {
  this.images.splice(position, 1);

  this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      var correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);

      this.file.removeFile(correctPath, imgEntry.name).then(res => {
          this.presentToast('File removed.');
      });
  });
}
startUpload(imgEntry) {
  this.file.resolveLocalFilesystemUrl(imgEntry.filePath)
      .then(entry => {
          ( < FileEntry > entry).file(file => this.readFile(file))
      })
      .catch(err => {
          this.presentToast('Error while reading file.');
      });
}

readFile(file: any) {
  const reader = new FileReader();
  reader.onload = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
          type: file.type
      });
      formData.append('file', imgBlob, file.name);
      this.uploadImageData(formData);
  };
  reader.readAsArrayBuffer(file);
}

async uploadImageData(formData: FormData) {
 
    const loading = await this.loadingCtrl.create();
    loading.present();

    this.api.Upload(formData).pipe(
      finalize(() => loading.dismiss())
    )
      .subscribe(async res => {
        console.log(res);
        if (!res['success']) {
          const alert = await this.alertCtrl.create({
            header: res['message'] ,
            message: res['msg'],
            buttons: ['OK']
          });
          await alert.present();
        }
        else {
         var  payload = {
            to : this.data.to,
            from : this.data.from,
            isfile : true,
            ext: res['ext'],
            file: res['file'],
            original: res['original'],
            message : '  '
          }
          this.socket.emit('send-message', payload);
          this.images.length = 0;
          this.images=[];
          const alert = await this.alertCtrl.create({
            header:   res['ext']+"  "+ res['message'] +"  "+ res['file']+"  "+res['original'],
            message: res['message'],
            buttons: ['OK']
          });
          await alert.present();
         
        }
     
      });
}

///////////////////////////////////////////////////////////////////////

copyFileToLocalDir2(fullPath) {
  let myPath = fullPath;
  // Make sure we copy from the right location
  if (fullPath.indexOf('file://') < 0) {
    myPath = 'file://' + fullPath;
  }

  const ext = myPath.split('.').pop();
  const d = Date.now();
  const newName = `${d}.${ext}`;

  const name = myPath.substr(myPath.lastIndexOf('/') + 1);
  const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
  const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;

  this.file.copyFile(copyFrom, name, copyTo, newName).then(
    success => {
      this.loadFiles();
    },
    error => {
      console.log('error: ', error);
    }
  );
}

recordAudio() {
  this.mediaCapture.captureAudio().then(
    (data: MediaFile[]) => {
      if (data.length > 0) {
        this.copyFileToLocalDir2(data[0].fullPath);
      }
    },
    (err: CaptureError) => console.error(err)
  );
}

recordVideo() {
  this.mediaCapture.captureVideo().then(
    (data: MediaFile[]) => {
      if (data.length > 0) {
        this.copyFileToLocalDir2(data[0].fullPath);
      }
    },
    (err: CaptureError) => console.error(err)
  );
}
deleteFile(f: FileEntry) {
  const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
  this.file.removeFile(path, f.name).then(() => {
    this.loadFiles();
  }, err => console.log('error remove: ', err));
}
openFile(f: FileEntry) {
  if (f.name.indexOf('.wav') > -1  || f.name.indexOf('.mp3') > -1 ) {
    // We need to remove file:/// from the path for the audio plugin to work
    const path =  f.nativeURL.replace(/^file:\/\//, '');
    const audioFile: MediaObject = this.media.create(path);
    audioFile.play();
  } else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
    // E.g: Use the Streaming Media plugin to play a video
    this.streamingMedia.playVideo(f.nativeURL);
  } else if (f.name.indexOf('.jpg') > -1) {
   //
   console.log("error");
  }
}


async uploadFile(f: FileEntry) {
  const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
  const type = this.getMimeType(f.name.split('.').pop());
  const buffer = await this.file.readAsArrayBuffer(path, f.name);
  const fileBlob = new Blob([buffer], type);
  const formData = new FormData();
  formData.append('file', fileBlob, f.name);
  this.deleteFile(f);
  this.uploadVideoData(formData);
}

getMimeType(fileExt) {
  if (fileExt == 'wav') return { type: 'audio/wav' };
  else if (fileExt == 'jpg') return { type: 'image/jpg' };
  else if (fileExt == 'mp4') return { type: 'video/mp4' };
  else if (fileExt == 'MOV') return { type: 'video/quicktime' };
}


async uploadVideoData(formData: FormData) {
  const loading = await this.loadingCtrl.create();
  loading.present();

  this.api.Upload(formData).pipe(
    finalize(() => loading.dismiss())
  )
    .subscribe(async res => {
      console.log(res);
      if (!res['success']) {
        const alert = await this.alertCtrl.create({
          header: res['message'] ,
          message: res['msg'],
          buttons: ['OK']
        });
        await alert.present();
      }
      else {
       var  payload = {
          to : this.data.to,
          from : this.data.from,
          isfile : true,
          ext: res['ext'],
          file: res['file'],
          original: res['original'],
          message : '  '
        }
        this.socket.emit('send-message', payload);
        const alert = await this.alertCtrl.create({
          header:   res['ext']+"  "+ res['message'] +"  "+ res['file']+"  "+res['original'],
          message: res['message'],
          buttons: ['OK']
        });
        await alert.present();
       
      }
   
    });
}


//////////////////////////////////////////////////////////
}

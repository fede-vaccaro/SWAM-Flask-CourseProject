import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Camera } from '@ionic-native/camera/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirebaseDebtTicketPipe } from './pipe/firebase-debt-ticket.pipe';
import { FirebaseTicketPipe } from './pipe/firebase-ticket.pipe';
import { GoogleLoggedUserPipe } from './pipe/google-logged-user.pipe';
import { MessagesRepositoryService } from './repositories/messages-repository.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
    declarations: [AppComponent, FirebaseTicketPipe, FirebaseDebtTicketPipe],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireMessagingModule,
        AngularFireAuthModule,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AngularFirestore,
        GoogleLoggedUserPipe,
        FirebaseTicketPipe,
        FirebaseDebtTicketPipe,
        Camera,
        MessagesRepositoryService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

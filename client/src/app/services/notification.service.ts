import {Injectable} from '@angular/core';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {environment} from '../../environments/environment';
import {mergeMapTo} from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private afMessaging: AngularFireMessaging) {
        afMessaging.usePublicVapidKey('BEtdna4430vl7D_WZvKYcCHxPue1mA4GwDYh6PcQTKyf1SH1Zo-ArxEvUiIYEWIZMIYUnyXQymwDavY5RTMZOSg');

        this.afMessaging.requestPermission
            .pipe(mergeMapTo(this.afMessaging.tokenChanges))
            .subscribe(
                (token) => { console.log('Permission granted! Save to the server!'); console.log(token); },
                (error) => { console.error(error); },
            );
        this.afMessaging.messages.subscribe(payload => console.log('Payload incoming', payload));
    }

}

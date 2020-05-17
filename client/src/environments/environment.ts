// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { firebaseConfig } from '../../firebase-config'
export const environment = {
    production: false,
    serverUrl: 'http://127.0.0.1:5000/api',
    firebaseConfig: firebaseConfig,
    firebaseDB: {
        users: "users",
        user_friends: "user_group",
        ticket_history: "ticket_history",
        owner_ticket: "owner_ticket",
        owner_passed_ticket: "passed_owner_ticket",
        debt_ticket: "debt_ticket",
        paid_debt_ticket: "paid_debt_ticket",
        messages: 'messages'
    },
    markets: [
        { name: "Esselunga", icon: '../assets/icon/Logo_esselunga.png', nameRow: 4 },
        { name: "Coop", icon: '../assets/icon/1200px-Coop_italia_logo.svg.png' },
        { name: "Conad", icon: '../assets/icon/Conad-Logo-1-.svg.png' },
        { name: "Generic", icon: '../assets/icon/icon.png' },
    ],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
  // import 'zone.js/dist/zone-error';  // Included with Angular CLI.

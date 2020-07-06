// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
    production: false,
    serverUrl: 'http://127.0.0.1:5000/api',
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

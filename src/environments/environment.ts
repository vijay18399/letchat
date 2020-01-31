// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import * as process from 'process';
export const environment = {
  production: false,
   apiUrl: 'https://letchats-server.herokuapp.com/api'   || process.env.API,
   apiUrl2: 'https://letchats-services.herokuapp.com/api'   || process.env.API2,
   apiUrl3: 'https://letchat-upload.herokuapp.com'   || process.env.API3,
 // apiUrl: 'https://holidaygift.herokuapp.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

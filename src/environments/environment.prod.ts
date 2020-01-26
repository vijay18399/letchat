
import * as process from 'process';
export const environment = {
  production: true,
  apiUrl: 'https://letchats-server.herokuapp.com/api' || process.env.API,
  apiUrl2: 'https://letchats-services.herokuapp.com/api'   || process.env.API2
  // 'https://letchats-server.herokuapp.com/api', // Use your Heroku or hosting URL instead
};

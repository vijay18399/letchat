
import * as process from 'process';
export const environment = {
  production: true,
  apiUrl: 'https://letchats-server.herokuapp.com/api' || process.env.API,
  // 'https://letchats-server.herokuapp.com/api', // Use your Heroku or hosting URL instead
};

export const environment = {
  production: true,
  // The Node API, served from the api subdomain so the apex domain can serve
  // this app. The /bigbisort-imp-exp path is the backend's BASE_PATH, kept from
  // the original Spring context-path. If this host changes, update CORS_ORIGINS
  // on the API to match this app's origin as well.
  apiBaseUrl: 'https://api.bigbisort.com/bigbisort-imp-exp',
  googleClientId: '1063456149323-1tsum2ug1i536aqnhp1pehuio28ui163.apps.googleusercontent.com'
};

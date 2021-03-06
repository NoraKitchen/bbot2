'use strict';

// LIST OF CONSTANTS

const config = require('config');

module.exports = Object.freeze({

// App Secret can be retrieved from the App Dashboard
    APP_SECRET: (process.env.MESSENGER_APP_SECRET) ? process.env.MESSENGER_APP_SECRET : config.get('appSecret'),

// Generate a page access token for your page from the App Dashboard
    PAGE_ACCESS_TOKEN : (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN) : config.get('pageAccessToken'),

// Arbitrary value used to validate a webhook
    VALIDATION_TOKEN : (process.env.MESSENGER_VALIDATION_TOKEN) ? (process.env.MESSENGER_VALIDATION_TOKEN) : config.get('validationToken'),


// URL where the app is running (include protocol). Used to point to scripts and assets located at this address. 
    SERVER_URL : (process.env.SERVER_URL) ? (process.env.SERVER_URL) : config.get('serverURL'),

// Token for BBB api
    BBB_TOKEN: config.get('bbbToken'),

});
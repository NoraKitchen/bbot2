'use strict';

const config = require('config');
let constants = require('../constants/constants');

// Facebook API request
class CallFBApi {

 // Send message to Facebook API
  sendMessage(messageData) {

    var body = JSON.stringify(messageData)
    var qs = 'access_token=' + encodeURIComponent(constants.PAGE_ACCESS_TOKEN);
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      })
      .then(rsp => rsp.json())
      .then(json => {
        if (json.error && json.error.message) throw new Error(json.error.message);
        return json;
      });
  };
};

module.exports = new CallFBApi;
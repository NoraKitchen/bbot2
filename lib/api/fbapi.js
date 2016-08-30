'use strict';

const config = require('config'),
      request = require('request');
let constants = require('../constants/constants');

// Facebook API request
class CallFBApi {

 // Send message to Facebook API
  sendMessage(messageData) {

    request({
      uri: 'https://graph.facebook.com/v2.7/me/messages',
      qs: { access_token: constants.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData
      }, 
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let recipientId = body.recipient_id;
          let messageId = body.message_id;

          if (messageId) { console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
            } else { console.log("Successfully called Send API for recipient %s", recipientId);
          };
        } else console.error(response.error);
      }
    );
  };
}

module.exports = new CallFBApi;
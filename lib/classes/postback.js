const request = require('request'),
  config = require('config'),
  fms = require('./message');

let fba = require('../api/fbapi');
let constants = require('../constants/constants');

// Handler for postback coming after button click

class Postbacks {

  // Postback from FB after pushing some button

  handlePayload(event, session) {

    let senderID = event.sender.id;
    let payload = event.postback.payload;
    console.log("Received postback for user %d and page %d with payload '%s' at %d", senderID, event.recipient.id, payload, event.timestamp);

    switch (payload) {

      // BUTTON Get start
      case 'GET_START':
        this.startConversation(senderID, (greetings) => {
          fba.sendMessage(greetings);
          fba.sendMessage(this.searchMenu(senderID));
        });
        break;

      case 'SEARCH_BY_STATE':
        session.context = {};
        session.context.searchByState = true;
        fms.createReply(session);
        break;

      case 'SEARCH_BY_ZIP':
        session.context = {};
        session.context.searchByZip = true;
        fms.createReply(session);
        break;
    }
  };


  // Start topic for conversation

  startConversation(recipientID, callback) {
    let greetings;
    request({
      url: 'https://graph.facebook.com/v2.7/' + recipientID,
      qs: { access_token: constants.PAGE_ACCESS_TOKEN },
      method: 'GET'
    }, function (error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      } else {
        let name = JSON.parse(body);
        greetings = {
          recipient: { id: recipientID },
          message: { text: "Hello " + name.first_name + " " + name.last_name + "! I can help you to find businesses in the northwest region." },
        };
      };
      callback(greetings);
    });
  }

  // Send search initial menu
  searchMenu(recipientID) {

    let messageData = {
      recipient: { id: recipientID },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "How would you like to search?",
            buttons: [
              {
                type: "postback",
                title: "By City and State",
                payload: "SEARCH_BY_STATE"
              },
              {
                type: "postback",
                title: "By Zip Code",
                payload: "SEARCH_BY_ZIP"
              }
            ]
          }
        }
      }
    };
    return messageData;
  };

};

module.exports = new Postbacks;
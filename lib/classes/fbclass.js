'use strict';

/* This class can separate incoming event (without message from user) 
 * and show results on the screen or console
 */

let fba = require('../api/fbapi');

// Facebook class
class FBoperations {

  selectOptions(event, session) {
    if(event.read)      this.receivedMessageRead(event);
    if(event.delivery)  this.receivedDeliveryConfirmation(event);
    if(event.postback)  this.receivedPostback(event, session);
  }

// Delivery confirmation
  receivedDeliveryConfirmation(event) {
    let delivery = event.delivery;
    let messageIDs = delivery.mids;
    let watermark = delivery.watermark;

    if (messageIDs) 
    messageIDs.forEach(function (messageID) { 
      console.log("Received delivery confirmation for message ID: %s", messageID) });
      console.log("All message before %d were delivered.", watermark);
  }

// Read confirmation
  receivedMessageRead(event) {
    let watermark = event.read.watermark;
    let sequenceNumber = event.read.seq;
    console.log("Received message read event for watermark %d and sequence number %d", watermark, sequenceNumber);
  }


// Response for reserved words 
  resevedReserved (recipientId, messageText, session) {
    var text = false;
    
    switch(messageText) {

      case 'WELCOME':
        text = 'We are glade to see you too';
      break;

      case 'HELP':
        text = 'If you would like to search just hit the menu in the lower left.'
      break;

      case 'STOP':
        session.context.endSession = true;
        text = 'Thanks for using the BBB chatbot. See you next time.'
      break;

      case 'SOME':
        text = 'Sorry, I do not understand what you mean.'
      break;
    }

    if(text) {
      var messageData = {
        recipient: {
          id: recipientId
        },
        message: {
          text: text,
          metadata: "RESERVED_WORDS"
        }
      };
      fba.sendMessage(messageData);
    };
  };

};

module.exports = new FBoperations;
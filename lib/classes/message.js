const 
    request = require('request'),
    config = require('config');

let fba = require('../api/fbapi');
let constants = require('../constants/constants');

// Handler for postback coming after button click

class Messages {
    
    handleMessage(event, session) {

        var senderID = event.sender.id;
        var message = event.message;

        var messageText = message.text;
        var quickReply = message.quick_reply;

        console.log("Received message for user %d and page %d at %d with message:",senderID, event.recipient.id, event.timestamp);
        console.log(JSON.stringify(message));

    };

};

module.exports = new Messages;
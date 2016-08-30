const
    request = require('request'),
    config = require('config');

let fba = require('../api/fbapi');
let constants = require('../constants/constants');
let validator = require('./locationValidator');
let bbb = require('../api/bbbapi');

// Handler for postback coming after button click

class Messages {

    handleMessage(event, session) {

        var senderID = event.sender.id;
        var messageText = event.message.text;
        var quickReply = event.message.quick_reply;

        console.log("Received message for user %d and page %d at %d with message:", senderID, event.recipient.id, event.timestamp);

        if (!session.context.searchByState && !session.context.searchByZip) {
            //Do not update context with input
        } else if (messageText) {
            if (session.context.searchByZip && !session.context.zip) {
                //Collect zip input
                var validZip = validator.validateZip(messageText);

                if (validZip) {
                    session.context.zip = validZip;
                } else {
                    session.context.badInput = true;
                }
            } else if (session.context.searchByState && !session.context.state) {
                //Collect state input
                var validState = validator.validateState(messageText);

                if (validState) {
                    session.context.state = validState;
                } else {
                    session.context.badInput = true;
                }
            } else if (session.context.searchByState && !session.context.city) {
                //code to collect city input from user here
            } else if (!session.context.name) {
                session.context.name = messageText;
            }
        } else if (quickReply) {
            console.log("Recieved quick reply: " + quickReply)
        }


        this.createReply(session);

    };

    createReply(session) {

        if (session.context.badInput) {
            var reply = "Sorry, I didn't understand that. Could you try saying it another way?";
            delete session.context.badInput;
        } else if (session.context.searchByState && !session.context.state) {
            var reply = "What state would you like to search in?"; //Do we want to prompt for abbr? can set up to handle both
        } else if (session.context.searchByZip && !session.context.zip) {
            var reply = "What zip code would you like to search in?";
        } else if (session.context.searchByState && session.context.state) {
            var reply = "What city would you like to search? You can tell me the full city name or just the first three letters."
        } else if (!session.context.name && session.context.zip || session.context.city) {
            var reply = "What is the name of the business you'd like to find?";
        } else if (session.context.name) {
            var reply = "Great, give me just a sec while I search " + (session.context.zip || session.context.city + ", " + session.context.state) + " for " + session.context.name + "! If you want to search again, just hit the blue menu in the lower left.";
            session.context.endSession = true;
        } else {
            var reply = "To start a search, please select a search option from the blue menu in the lower left."
        }

        var messageData = {
            recipient: { id: session.fbid },
            message: { text: reply },
        }

        fba.sendMessage(messageData);


        if (session.context.endSession) {
            var searchPoint = {
                name: session.context.name,
                zip: session.context.zip,
                city: session.context.city,
                state: session.context.state,
                userId: session.fbid
            }
            bbb.createList(searchPoint, fba.sendMessage)
        }
    }


};



module.exports = new Messages;
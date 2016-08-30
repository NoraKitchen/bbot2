'use strict';

const config = require('config');

let fbo = require('./fbclass'),
    fpb = require('./postback'),
    fms = require('./message'),
    reserved = require('../constants/reservedwords'),
    constants = require('../constants/constants');

class BotManager {

    manageEvent(event, session, callback) {

        if (event.read)     fbo.receivedMessageRead(event);
        if (event.delivery) fbo.receivedDeliveryConfirmation(event);
        if (event.postback) fpb.handlePayload (event, session);
        if (event.message)  fms.handleMessage (event, session);



        // if (event.message) {
        //     if (reserved[event.message.text]) { 
        //         fbo.resevedReserved (event.sender.id, reserved[event.message.text], session);
        //     } else {
        //         if (session.context.findByName || session.context.findByCategory) {
        //             session.context.userInput = event.message.text;
        //             wit.runActions(event.sender.id, event.message.text, session.context).then(function (witUpdatedContext) {
        //                 session.context = witUpdatedContext;
        //                 delete session.context.userInput;
        //             });
        //         } else { 
        //             fbo.resevedReserved (event.sender.id, "SOME", session);
        //         }
        //     };
        // };
        
        callback(session);
    };
};

module.exports = new BotManager();
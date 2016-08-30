var config = require('config');
var helpers = require('./wit-helpers');
var bbb = require('../api/bbbapi');
// var fbo = require('../classes/fbclass');
var fba = require('../api/fbapi');


// SEARCHING OBJECT CONSTUCTOR FROM SERGEY
function SearchPoint() {
    this.name = false;
    this.category = false;
    this.city = false;
    this.state = false;
    this.zip = false;
    this.userId = false;
}

//The Wit actions object - must in include all functions you may call during the conversation
//As well as the 'send' function that says what happens whenever Wit sends a message
var actions = {
    send(request, response) {

        var recipientId = request.sessionId;

        if (recipientId) {
            var reply = {
                recipient: { id: recipientId },
                message: { text: response.text }
            }
            return fba.sendMessage(reply)
                .then(function () {
                    return null;
                }).catch(function (e) {
                    return new Promise(function (resolve, reject) {
                        console.log('user said...', request.text);
                        console.log('sending...', JSON.stringify(response));
                        return resolve();
                    })
                });
        }

    },
    collectNameOrCat({ context, entities }) {
        console.log("Collecting business name or category")
        var collectingValue = context.findByCategory ? "category" : "businessName";

        if (context["POSSIBLE" + collectingValue.toUpperCase()]) {
            var lsq = context["POSSIBLE" + collectingValue.toUpperCase()];
            delete context["POSSIBLE" + collectingValue.toUpperCase()];
            delete context[collectingValue.toUpperCase() + "CONFIRMED"];
        } else if (entities.local_search_query && entities.local_search_query.length === 1) {
            var lsq = helpers.firstEntityValue(entities, "local_search_query");
        }

        if (lsq) {
            context[collectingValue] = lsq;
            context.hasNameOrCategory = true;
            delete context.MISSINGBUSINESSNAME;
            delete context.MISSINGCATEGORY;
            delete context[collectingValue + "WRONG"];
            delete context.needsCategory;
        } else {
            var otherEntityValue = helpers.checkOtherEntities(entities, "local_search_query");
            var rawText = context.userInput.trim();

            if (otherEntityValue) {
                context["POSSIBLE" + collectingValue.toUpperCase()] = otherEntityValue;
                delete context.needsCategory;
            } else if (entities.local_search_query && entities.local_search_query.length > 1 || rawText) {
                //Wit pulled out multiple possible names/categories, or nothing at all
                //Probaby means it broke up the name wrong, just use the raw user input
                context["POSSIBLE" + collectingValue.toUpperCase()] = rawText;
                delete context.needsCategory;
            }
            else {
                context["MISSING" + collectingValue.toUpperCase()] = true;
            }
        }
        return Promise.resolve(context);
    },
    detectLocation({ context, entities }) {
        console.log("Attempting to auto-detect location.")
        //here would attempt to detect user location automatically
        //when retrieved, it would add the location to context

        //pretending these values were returned for testing purposes
        // context.detectedCity = "<detectedCity>"; //for testing
        // context.detectedState = "<detectedState>"; //for testing

        if (context.detectedCity && context.detectedState) {
            console.log("City and state identified.")
            delete context.locationNotDetected;
        } else {
            console.log("Unable to auto-detect location.")
            context.locationNotDetected = true;
        }
        return Promise.resolve(context);
    },
    collectLocation({ context, entities }) {

        if (context.LOCATIONCONFIRMED) {
            var rawLocation = context.POSSIBLELOCATION;
            delete context.POSSIBLELOCATION;
            delete context.LOCATIONCONFIRMED;
        } else {
            var zip = helpers.firstEntityValue(entities, "number")
            var rawLocation = helpers.firstEntityValue(entities, "location")
        }

        if (!zip && !rawLocation) {
            var otherEntityValue = helpers.checkOtherEntities(entities, "location");

            //**REFACTOR: can probably make this whole block (and similar block in business) part of checkOtherEntities
            if (otherEntityValue) {
                context.POSSIBLELOCATION = otherEntityValue;
                delete context.locationNotFound;
            } else { 
                // context.locationNotFound = true;
                context.POSSIBLELOCATION = context.userInput.trim();
            }

        } else if (zip) {
            console.log("Location is zip. Zip collected as location.")
            context.zip = zip;
            context.displayLocation = zip;
            delete context.locationNotFound;
        } else if (rawLocation) {
            //The location collected from the user input was not a zip.
            //Likely it is a city/state combo wit failed to parse and took as a whole ("Boise, Idaho 83709", "Newport, OR", etc.)
            //Check if the address is the required two part address, if so parse it.
            //If the address contains the necessary parts (zip or city and state), update the context.

            var twoPartAddy = helpers.checkTwoPartAddy(rawLocation);

            if (twoPartAddy) {
                var parsedAddy = helpers.parseAddy(rawLocation);
                helpers.updateLocationContext(context, parsedAddy);
            } else {
                //location did not contain a space or comma, so is likely incomplete
                context.locationNotFound = true;
            }
        }

        return Promise.resolve(context);
    },
    executeSearch({ context, entities }) {
        console.log("Searching BBB API.")

        var query = new SearchPoint;
        query.name = context.businessName;
        query.category = context.category;
        query.city = context.city;
        query.state = context.state;
        query.zip = context.zip;
        query.userId = context.fbid;

       var searchEndMessage = {
            recipient: { id: query.userId },
            message: { 
                text: "Thanks for using the BBB chatbot. If you'd like to search again, hit the menu in the lower left.", metadata: "TEXT" }
        }

        bbb.createList(query, function (messageData) {fba.sendMessage(messageData).then(function(){fba.sendMessage(searchEndMessage)})});

        context.endSession = true;
        return Promise.resolve(context);
    },
    confirmUseCurrentLocation({ context, entities }) {
        //process answer to whether user wants to use current location data or not
        //can probably refactor to use yes/no helper function or buttons
        var answer = helpers.firstEntityValue(entities, "yes_no");
        console.log("Answer: " + answer)
        if (answer === "Yes") {
            delete context.retry;
            delete context.doNotUseCL;
            context.city = contxt.detectedCity;
            context.state = context.detectedState;
            context.displayLocation = context.city + ", " + context.state;
            context.useCL = true;
        }
        else if (answer === "No") {
            delete context.retry;
            delete context.useCL;
            delete context.detectedCity;
            delete context.detectedState;
            context.doNotUseCL = true;
        }
        else {
            context.retry = true;
        }
        return Promise.resolve(context);
    },
    confirmBusinessNameOrCategory({ context, entities }) {
        var confirmingValue = context.findByCategory ? "CATEGORY" : "BUSINESSNAME";
        var answer = helpers.firstEntityValue(entities, "yes_no");
        helpers.confirmYesNo(context, answer, confirmingValue);
        return Promise.resolve(context);
    },
    confirmLocation({ context, entities }) {
        var answer = helpers.firstEntityValue(entities, "yes_no");
        helpers.confirmYesNo(context, answer, "LOCATION");
        return Promise.resolve(context);
    },
    restart({context, entities}) {
        for (var key in context) {
            if (key == "fbid" || key == "findByName" || key == "findByCategory") {
                continue;
            }
            delete context[key];
        }
        return Promise.resolve(context);
    }

};

module.exports = {
    actions: actions
}
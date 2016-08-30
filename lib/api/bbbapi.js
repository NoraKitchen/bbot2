'use strict';
const https = require('https'),
      config = require('config');

let constants = require('../constants/constants');

// BBB API searching
// This object take SearchPoint object and return array of businesses

class BBBapi {


// MAKE A LIST WITH OPTIONS FROM SEARCH POINT AND RETURN IT TO BOT
  createList (searchPoint, callback){
    let newList = [];
    let link = '/api/orgs/search?PageSize=10'+this.makeLink(searchPoint)
    
    this.callBBBapi(link, function (list) {

      let count = list.length;
      if (count == 0) { 
          newList = false;
        } else {
            for(let i=0; i < count; i++) {
              let curr = list[i];
              let obj = new Object();
              obj.title = curr.OrganizationName;
              obj.subtitle = curr.Address +" ,"+ curr.City+" ,"+curr.StateProvince;
              obj.buttons = [];
              let secObj = new Object();
                secObj.type = "web_url";
                secObj.url = curr.ReportURL;
                secObj.title = "More information";
                obj.buttons.push(secObj);
                newList.push(obj);
              obj = {};
        }
      };


      let messageData = {};
            if (!newList) {
                messageData = {
                recipient: { id: searchPoint.userId },
                message: { text: "Sorry, I wasn't able to find anything.", metadata: "TEXT" }
                };
            } else {
                messageData = {
                recipient: { id: searchPoint.userId },
                message: { attachment: { type: "template", payload: { template_type: "generic", elements: newList } } }
                };
                console.log("Send list of business to sender " + searchPoint.userId);
            };
        callback(messageData);
    });
  };

// REQUEST TO BBB API
  callBBBapi (path, callback) {

    let options = {
        host: 'api.bbb.org',
        port: 443,
        path: path,
        method: 'GET',
        headers: {
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
        'Authorization': constants.BBB_TOKEN
    }};
    
    let request = https.request(options, function(response){
        console.log('Status: ' + response.statusCode);
        response.setEncoding('utf8');
        let body = '';
        response.on('data', (chunk) => body+=chunk);
        response.on('end', function () {
            let nodes = JSON.parse(body);
            if(nodes.TotalResults)  console.log("Total Results: " + nodes.TotalResults);
            if(nodes.SearchResults) callback(nodes.SearchResults);
    })});

    request.on('error', (error) => {console.log('problem with request: '+error.message)});
    request.end();
  };

// CREATE A NEW PATH FOR REQUEST
  makeLink(searchPoint) {
    var link = '';

      if(searchPoint.name)      link += '&OrganizationName=' + searchPoint.name.trim().replace(/ /ig, '+');
      if(searchPoint.city)      link += '&City=' + searchPoint.city.trim().replace(/ /ig,'+');
      if(searchPoint.category)  link += '&PrimaryCategory='+searchPoint.category.trim().replace(/ /ig,'+');
      if(searchPoint.state)     link += '&StateProvince=' + searchPoint.state.trim();
      if(searchPoint.zip)       link += '&PostalCode='+searchPoint.zip;
      
  return link;
  }

};

module.exports = new BBBapi;
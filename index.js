require('dotenv').config()
const https = require('https');
const querystring = require('querystring');

//these should be defined in envronment variables or in your .env
const TWILIOFROMNUMBER = process.env.TWILIOFROMNUMBER
const TWILIOACCOUNTSID = process.env.TWILIOACCOUNTSID
const TWILIOAUTHTOKEN = process.env.TWILIOAUTHTOKEN

//Update the body of with your custom message. The "To" number will be updated with the values in the array below
var messagetemplate = {
    "From": '+1' + TWILIOFROMNUMBER,
    "To": '+19999999999',
    "Body": `This is 
a multi
line message`
}

//update this array with all of your recipients
var recipients = ['9999999999']

var sendMessage = function(messagedata, callback) {

    var data = [];

    var options = {
        host: 'api.twilio.com',
        port: 443,
        path: '/2010-04-01/Accounts/' + TWILIOACCOUNTSID + '/Messages.json',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + new Buffer.from(TWILIOACCOUNTSID + ':' + TWILIOAUTHTOKEN).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    var req = https.request(options, function(res) {

        res.on('data', function(chunk) {
            data.push(chunk);
        });

        res.on('end', function(){
            var response = JSON.parse(new Buffer.concat(data).toString());
            if(response.error_message) {
                callback(response.error_message, response);
            } else {
                callback(false, response);
            }
        });

        res.on('error', function(e){
            callback(e, false);
        });
    });

    req.write(querystring.stringify(messagedata));

    req.end();
}

var sendMessageHandler = function(recipients, callback, index) {
    if(index===null || index===undefined) {
        index = 0;
    }

    messagetemplate.To = '+1' + recipients[index];

    if(index <= recipients.length - 1) {
        sendMessage(messagetemplate, function(err, resp) {
            if(err) {
                console.log(err);
                console.log(resp);
            } else {
                console.log(resp);
            }
            setTimeout(function() {
                sendMessageHandler(recipients, callback, index + 1);
                index++;
            }, 1100);
        });
    } else {
        callback(false);
    }
}

sendMessageHandler(recipients, function(err) {
    if(err) {
        console.log('Send message handler failed');
    } else {
        console.log('Operation was successful');
    }
})
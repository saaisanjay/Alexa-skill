'use strict';
const AWS = require('aws-sdk');
const Alexa = require("alexa-sdk");
const lambda = new AWS.Lambda();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = "amzn1.ask.skill.b097e44c-6185-40a1-b6de-8da16edee5e2";
  alexa.registerHandlers(handlers);
  alexa.execute();
};


const handlers = {
  'LaunchRequest': function () {
    this.emit('Prompt');
  },
  'Unhandled': function () {
    this.emit('AMAZON.HelpIntent');
  },
  'AddActivity' : function(){
    var activity = this.event.request.intent.slots.Activity.value;
    var category =this.event.request.intent.slots.Category.value;
    var time = this.event.request.intent.slots.Time.value;
    var params = {
      Table: "dailyactivity",
      Item:{
        activityid: uuid.v4(),
        activity: activity,
        category: category,
        time: time
      }
    }
    dynamoDb.put(params).promise()
            .then(data => {
              this.emit(":tell", "Successfully inserted!");
            })
            .catch(err => {
              this.emit(":tell", "ERROR")
            })

  },
  'AMAZON.YesIntent': function () {
    this.emit('Prompt');
  },
  'AMAZON.NoIntent': function () {
    this.emit('AMAZON.StopIntent');
  },
  'Prompt': function () {
    this.emit(':ask', 'Please tell me the amount and category of your expense', 'Please say that again?');
  },
  'NoMatch': function () {
    this.emit(':ask', 'Sorry, I couldn\'t understand.', 'Please say that again?');
  },
  'AMAZON.HelpIntent': function () {
    const speechOutput = 'You need to mention expense amount and a category';
    const reprompt = 'Say hello, to hear me speak.';

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    this.response.speak('See you later!');
    this.emit(':responseReady');
  }
};

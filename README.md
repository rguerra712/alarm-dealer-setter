### Alarm Dealer Setter

This is intended for anyone who has an alarm that can be set at [alarmdealer.com](https://alarmdealder.com).

Because there is no public API for [alarmdealer.com](https://alarmdealder.com), this project uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to automate the web UI clicking to set one's alarm.

NOTE: This code only **sets** the alarm, it does not disarm the alarm (for security reasons), this way it can be easy to set an alarm using services like  [IFTTT](https://ifttt.com/) and Alexa, but not disarm the alarm with just a simple url click.

### To Use
1. First setup the [serverless framework](https://github.com/serverless/serverless) if you have not already done so
1. Next, in the [aws console's SSM parameter store](https://console.aws.amazon.com/systems-manager/parameters), set the variables
    1. `ALARM_DEALER_USERNAME` - your user name for alarmdealer.com
    1. `ALARM_DEALER_PASSWORD` - your password for alarmdealer.com
1. Next, clone this repository
1. Next, run the command `npm install`
1. Next, run the command `serverless deploy`
1. Finally, you can visit the output url of the form `https://<uniqueId>.execute-api.us-east-1.amazonaws.com/dev/setAlarm` to set your alarm
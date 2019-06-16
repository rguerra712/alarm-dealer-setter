const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const sns = new AWS.SNS();

module.exports.get = async () => {
  const params = {
    Message: 'setAlarm',
    TopicArn: process.env.AlarmSetArn,
  };
  console.log('params', params);

  for (let i = 0; i < 3; i++) {
    try {
      await sns.publish(params).promise();
      console.log('message published');
    } catch (error) {
      console.error('error', error);
      return {
        statusCode: 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t add the note due an internal error. Please try again later.',
      };
    }
  }
  return {
    statusCode: 202,
    body: JSON.stringify({
      message: 'Alarm should set',
    })
  };
}

const { setAlarm } = require('./puppeteer/set-alarm');

module.exports.setAlarm = async (event) => {
  try {
    const chromeSettings = await getChrome();
    console.log(JSON.stringify(chromeSettings));
    const content = await setAlarm();
    return {
      statusCode: 200,
      body: JSON.stringify({
        content,
      })
    };
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        error
      )
    };
  }
};
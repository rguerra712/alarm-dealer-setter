const puppeteer = require('puppeteer');
const { getChrome } = require('./chrome-script');

// const url = 'https://alarmdealer.com/index.php?mod=devices&action=keypad';
const url = 'https://www.google.com';

module.exports.setAlarm = async () => {
  try {
    console.log('loading chrome');
    const chrome = await getChrome();
    console.log('chrome loaded');
    const browser = await puppeteer.connect({
      browserWSEndpoint: chrome.endpoint,
    });
    console.log('puppeteer loaded');
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const content = await page.evaluate(() => document.body.innerHTML);
    return {
      statusCode: 200,
      body: JSON.stringify({
        content,
      }),
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}
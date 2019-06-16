const puppeteer = require('puppeteer');
const { getChrome } = require('./chrome-script');

async function login(page) {
  console.log('logging in');
  const usernameInput = await page.$('.FrmText');
  if (!usernameInput) throw Error('usernameInput not found')
  await usernameInput.type(process.env.AlarmDealerUsername);
  const passwordInput = await page.$('.FrmPassword');
  if (!passwordInput) throw Error('passwordInput not found')
  await passwordInput.type(process.env.AlarmDealerPassword);
  const submit = await page.$('.button');
  await submit.click();
  console.log('logged in');
}

module.exports.setAlarm = async () => {
  const url = 'https://alarmdealer.com/index.php?mod=devices&action=keypad';
  const logoutUrl = 'https://alarmdealer.com/index.php?mod=auth&action=logout';
  const chrome = await getChrome();
  const browser = await puppeteer.connect({
    browserWSEndpoint: chrome.endpoint
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Login
  await login(page);

  // Sadly you have to logout otherwise you get a connection error
  console.log('logging out');
  await page.waitFor(10000); // Let it try to connect a little
  await page.goto(logoutUrl, { waitUntil: 'networkidle0' });
  await page.goto(logoutUrl, { waitUntil: 'networkidle0' });
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Login again
  await login(page);

  // Wait for system to be "Ready to Arm"
  let content = '';
  while (!content.includes('Ready to Arm')) {
    console.log('waiting for Ready to Arm');
    try {
      await page.waitFor(10000); // Start with polling, it is SLOW
      content = await page.evaluate(() => document.body.innerHTML);
      if (content.includes('in Away Mode')) {
        console.log('Alarm already set');
        browser.close();
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Alarm Already Set',
          }),
        };
      }
    } catch (error) {
      console.error(error);
      content = await page.evaluate(() => document.body.innerHTML);
      console.log('content', content);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: JSON.stringify(error),
        }),
      };
    }
  }

  console.log('clicking away');
  const awayButton = await page.$('.dsc-button-away');
  await awayButton.click();
  console.log('away clicked');

  await page.waitFor(10000); // Wait a few seconds for it to register
  browser.close();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Alarm Set',
    }),
  };
};

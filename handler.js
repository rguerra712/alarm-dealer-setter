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

module.exports.get = async () => {
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
  await page.goto(logoutUrl, { waitUntil: 'networkidle0' });
  await page.goto(logoutUrl, { waitUntil: 'networkidle0' });
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Login again
  await login(page);

  // Wait for system to be "Ready to Arm"
  const timeoutOptions = { timeout: 300000 }; // Sometimes it is really slow
  let displayText;
  while (displayText !== 'Ready to Arm') {
    console.log('waiting for Ready to Arm');
    const element = await page.waitForSelector('.dsc-lcdtext-2', timeoutOptions);
    displayText = await page.evaluate(element => element.textContent, element);
    console.log('displayText', displayText);
    if (displayText === 'in Away Mode') {
      console.log('Alarm already set');
      browser.close();
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Alarm Already Set',
        }),
      };    
    }
  }

  const awayButton = await page.$('.dsc-button-away');
  await awayButton.click();

  browser.close();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Alarm Set',
    }),
  };
};

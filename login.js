const puppeteer = require('puppeteer');
const data = require('./config.json');
const fs = require('fs');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://store.steampowered.com/login');
    await page.setViewport({ width: 1920, height: 1080 })
    
    await page.type('#input_username', data.username)
    await page.type('#input_password', data.password)
    await page.click('#login_btn_signin > button > span')

    console.log('before waiting');
    await delay(3000);

    const cookies = await page.cookies()
    const cookieJson = JSON.stringify(cookies)
    await fs.writeFileSync('cookie.json', cookieJson);

    console.log('login success');

    await page.screenshot({ path: 'login.png' });
    await browser.close();
})();
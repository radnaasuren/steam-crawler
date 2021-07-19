const RandomId = () => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 15; i++) {
        if (i % 5 == 0 && (i != 15 && i != 0)) {
            result += '-'
        }
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


const puppeteer = require('puppeteer');
const data = require('./config.json');
const fs = require('fs');

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

setInterval(() => {
    // your code goes here...
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const cookies = fs.readFileSync('cookie.json', 'utf8')

        const deserializedCookies = JSON.parse(cookies)
        await page.setCookie(...deserializedCookies)

        await page.goto('https://store.steampowered.com/account/redeemwalletcode')
        await page.setViewport({ width: 1920, height: 1080 })

        await delay(3000);

        const cardCode = RandomId()
        await page.type('#wallet_code', cardCode)
        await page.click('#validate_btn > span')

        // console.log('before waiting -> verify');
        await delay(3000);
        // console.log('after waiting -> verify');

        let element = await page.$('#error_display')
        let value = await page.evaluate(el => el.textContent, element)

        if (value != `There was an error redeeming the entered code.The code may be invalid. Please carefully verify the characters as you re-enter the code and double check to see if you've mistyped your key. I, L, and 1 can look alike, as can V and Y, and 0 and O.The code may not yet have been activated.  It may take several hours after time of purchase before activation is completed by your retailer, please wait and try redeeming the code again in a little while.If the currency of the code you are attempting to redeem is different than the region in which you are located, you may not be able to redeem this gift card to your account.  If this is the case please return this code to the retailer where it was purchased.If the problem persists, please contact Steam Support for further assistance.`) {
            if (!value) {
                let statData = fs.readFileSync('stats.json');
                statData = (JSON.parse(statData))
                statData.push({
                    code: cardCode,
                    status: 'success'
                })
                await fs.writeFileSync('stats.json', JSON.stringify(statData));
            }
            console.log('success: ', cardCode)
            await page.screenshot({ path: 'success.png' });
        } else {
            let statData = fs.readFileSync('stats.json');
            statData = (JSON.parse(statData))
            statData.push({
                code: cardCode,
                status: 'not valid'
            })
            await fs.writeFileSync('stats.json', JSON.stringify(statData));
            console.log('not valid: ')
        }
        // console.log('after waiting -> code');

        await page.screenshot({ path: 'screenshot.png' });
        await browser.close();
    })();
}, 60 * 1000);
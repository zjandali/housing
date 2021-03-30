require('dotenv').config()
const puppeteer = require('puppeteer');
const fs = require('fs');

function base64Encode(file) {
    var bitmap;
    bitmap = fs.readFileSync(file); return new Buffer(bitmap).toString('base64')
}


async function makepdf() {
    await (async () => {
        const browser = await puppeteer.launch({args: ['--allow-file-access-from-files', '--enable-local-file-accesses']});
        const page = await browser.newPage();
        const image = 'data:image/png;base64,' + base64Encode('element.png');
        await page.goto(image, {waitUntil: 'networkidle0'});
        await page.pdf({path: 'page.pdf', format: "a4"})

        await browser.close();
        console.log("done");
    })();


}

(async () => {
    try {
        let browser = await puppeteer.launch({
            args: ['--allow-file-access-from-files', '--enable-local-file-accesses'],
            headless: false,
            slowMo: 20
        });
        const page = await browser.newPage();
        await page.goto('https://www.facebook.com/');
        await page.waitForSelector('#email');
        await page.type("#email", '5109196440');
        await page.type("#pass", process.env.FB_PASSWORD);
        await page.click(`[type="submit"]`);
        await page.waitForNavigation();
        await page.click(`div`);
        await page.waitFor(0b1001110001000)
        await page.goto('https://www.facebook.com/groups/ucberkeleyoffcampushousing');
        await page.waitFor(3000)

        //webpage to pdf to send
        async function shot(options = {}) {
            let padding = options.padding
            let path = options.path
            const selector = options.selector;
            const rect = await page.evaluate(selector => {
                const element = document.querySelector(selector);
                if (!element)
                    return null;
                const {x, y, width, height} = element.getBoundingClientRect();
                return {left: x, top: y, width, height, id: element.id};
            }, selector);

            if (!rect)
                throw Error(`Could not find element that matches selector: ${selector}.`);

            return await page.screenshot({
                path,
                clip: {
                    x: rect.left - padding,
                    y: rect.top - padding,
                    width: rect.width + padding * 2,
                    height: rect.height + padding * 2
                }
            })
        }

            await shot({path: 'element.png', selector: 'header aside', padding: 16});

        await browser.close();
        await makepdf();
    } catch (error) {
        console.log(error)
    }

    })();






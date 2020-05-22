'use strict';

const puppeteer = require("puppeteer");

const {Url} = require("./models");

async function fetchUrlsFromMainCategories() {
    const browser = await puppeteer.launch({headless: false, slowMo:250});
    const page = await browser.newPage();
    await page.goto("https://arbk.rks-gov.net/page.aspx?id=2,1");

    await page.click("#hero > div > div.hero-content-primary > div > div > div:nth-child(5) > span > span.selection > span");

    const listOfMainCategories = await page.$$('#select2-ddlnace-results > li');
    const catLen = listOfMainCategories.length;
    for (let i = 0; i < catLen; i++) {
        const list = await page.$$('#select2-ddlnace-results > li');
        await list[i].click();
        await page.click("#Submit1");
        await page.waitForNavigation({
            waitUntil: 'domcontentloaded',
            timeout: 0
        });
        const listOfUrls = await page.$$eval(
            "#content > article > div > table > tbody > tr > td:nth-child(2) > a",
            e => e.map((a) => a['href']));
        await listOfUrls.forEach((v) => {
            //Url.upsert({url: v, status: 'TO_FETCH'})
        })
        console.log(`Found ${listOfUrls.length} in Category ${i}`);
        await page.click("#hero > div > div.hero-content-primary > div > div > div:nth-child(5) > span > span.selection > span");
    }


}

fetchUrlsFromMainCategories().then(r => console.log('completed'));

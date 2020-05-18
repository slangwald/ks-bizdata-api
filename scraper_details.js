'use strict';

const tabletojson = require('tabletojson').Tabletojson;
require('./models');
const {Url, Business, Shareholder, AuthorizedPeople, Unit, Activity} = require("./models");

async function fetchDetailPage(url) {
    console.log(`processing ${url}`);
    const tables = await tabletojson.convertUrl(url);
    const biz = await extractBusiness(tables[0], url);
    let pipeline = [];
    pipeline.push(extractPersons(tables[1], biz.uniqueId));
    pipeline.push(extractShareholder(tables[2], biz.uniqueId));
    if (!tables[3][0]['Kodi']) {
        pipeline.push(extractUnits(tables[3], biz.uniqueId));
        pipeline.push(extractActivity(tables[4], biz.uniqueId));
    } else {
        pipeline.push(extractActivity(tables[3], biz.uniqueId));
    }
    await Promise.all(pipeline);
}


async function extractShareholder(table, bizId) {
    await Shareholder.destroy({where: {businessUniqueId: bizId}})
    let pipeline = []
    for (let i = 0; i < table.length; i++) {
        pipeline.push(Shareholder.create({
            name: table[i]['Name Surname'],
            capitalInEur: table[i]['Capital in €'],
            capitalInPercent: table[i]['Capital in %'],
            businessUniqueId: bizId
        }))
    }
    await Promise.all(pipeline);
}


async function extractUnits(table, bizId) {
    await Unit.destroy({where: {businessUniqueId: bizId}})
    let pipeline = []
    for (let i = 0; i < table.length; i++) {
        pipeline.push(Unit.create({
            number: table[i]['No.'],
            unitNumber: table[i]['Unit Number'],
            name: table[i]['Name'],
            place: table[i]['Place'],
            businessUniqueId: bizId
        }))
    }
    await Promise.all(pipeline);
}


async function extractActivity(table, bizId) {
    await Activity.destroy({where: {businessUniqueId: bizId}})
    let pipeline = []
    for (let i = 0; i < table.length; i++) {
        pipeline.push(Activity.create({
            code: table[i]['Kodi'],
            description: table[i]['Përshkrimi'],
            type: table[i]['Tipi'],
            businessUniqueId: bizId
        }))
    }
    await Promise.all(pipeline);
}


async function extractPersons(table, bizId) {
    await AuthorizedPeople.destroy({where: {businessUniqueId: bizId}})
    let pipeline = []
    for (let i = 1; i < table.length; i++) {
        pipeline.push(AuthorizedPeople.create({
            firstName: table[i]['0'],
            lastName: table[i]['1'],
            position: table[i]['2'],
            authorizations: table[i]['3'],
            businessUniqueId: bizId
        }))
    }
    await Promise.all(pipeline);
}


async function extractBusiness(table, url) {
    if(isNaN(parseInt(table[3]['1']))){
        throw new Error(`${table[3]['1']} not a number`)
    }
    await Business.upsert({
        businessName: table[0]['1'],
        tradeName: table[1]['1'],
        typeOfBusiness: table[2]['1'],
        uniqueId: table[3]['1'],
        businessNumber: table[4]['1'],
        fiscalNumber: table[5]['1'],
        takCertificationNumber: table[6]['1'],
        numberOfEmployees: table[7]['1'],
        registrationDate: table[8]['1'],
        municipality: table[9]['1'],
        address: table[10]['1'],
        phoneNumber: table[11]['1'],
        email: table[12]['1'],
        capital: table[13]['1'],
        statusInKbra: table[14]['1'],
        statusInTak: table[15]['1'],
        registryUrl: url,
    });
    return Business.findByPk(table[3]['1']);

}

async function doWork() {
    let noneLeft = false;
    while (!noneLeft) {
        console.time("fetch");
        const urls = await Url.findAndCountAll({where: {status: 'TO_FETCH'}, limit: 10});
        let i = 0;

        await Promise.all(urls.rows.map(async (url) => {
            await fetchDetailPage(url.url).then(
                (r) => {
                    i++;
                    console.log(`${url.url} PROCESSED`)
                    url.status = 'PROCESSED';
                    url.save().then();
                }
            ).catch(reason => {
                console.log(`${url.url} FAILED ${reason}`)
                url.status = 'FAILED';
                url.save().then();
            });
        }));
        console.log(`${i} / ${urls.count} DONE`)
        console.timeEnd("fetch");
        noneLeft = urls.count === 0;
    }
}
console.time("totalProcessing")
doWork().then(() => {
    console.log("completed")
    console.timeEnd("totalProcessing")
})

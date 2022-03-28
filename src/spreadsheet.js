const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./json/credentials.json');
var moment = require('moment');

let googleId = "1JXmBj5l5vP3TZMOflqN_YLsjVyFfY2DH7AV48HtdtZo";

async function requestToken(){
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const body = {
        "u":"ernesto.cancho@unmsm.edu.pe",
        "p":"&Bg!d9Xt"
    };

    const response = await fetch('http://ogit.imp.gob.pe/impapi/login', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    
    return data.sesion.token;
}

async function getDataset(token, body){
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    const response = await fetch('http://ogit.imp.gob.pe/impapi/sel_seguridad_incidente', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
    });

    const dataset = await response.json();
    
    return dataset.data;
}

async function dumpGoogleSheet(){
    const documento = new GoogleSpreadsheet(googleId);
    await documento.useServiceAccountAuth(credentials);
    await documento.loadInfo();

    const sheet = documento.sheetsByIndex[0];
    
    const getToken = await requestToken();
    const datasetIteration = await dateIterationDataset(getToken, sheet);

    console.log("Ejecucion Exitosa")
}

async function dateIterationDataset(getToken, sheet){
    const body = {"fecha":""};

    var a = moment('2022-02-27');
    var b = moment('2022-03-01');

    for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
        body.fecha = m.format('YYYY-MM-DD');

        const dataset = await getDataset(getToken, body);
        const datasetInsert = await sheet.addRows(dataset);
    }
}


dumpGoogleSheet();

module.exports = {
    dumpGoogleSheet: dumpGoogleSheet
}
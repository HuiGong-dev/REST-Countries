import fetch from "node-fetch";
globalThis.fetch = fetch;
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";


const app = express();
const baseURL = "https://restcountries.com/v3.1/";
const searchAll = "all";
const searchByName = "name/";
const urlFields = "?fields=name,population,region,capital,subregion,tld,currencies,languages,borders,flags,cca3,independent";
const searchByCode = "https://restcountries.com/v3.1/alpha/";

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    // get all countries
    fetchCountries("all", "all").then(data => {
        const refacted = refact(data);
        res.render("home", {
            searchCountryName: "",
            matchedCountries: refacted
        });
    });
});

app.post("/filter", (req, res) => {
    const region = req.body.region === "" || undefined ? "all" : req.body.region;
    const countryName = req.body.countryName === "" ? "all" : req.body.countryName;
    const countryCode = req.body.detailCountry;
    console.log("search country: " + countryName + " region: " + region + "code: " + countryCode);
    if (countryCode !== undefined) {
        res.redirect(`/country/${countryCode}/detail`);
    } else {
        res.redirect(`/country/${countryName}/region/${region}`);
    }
    
});

app.get("/country/:countryName/region/:region", (req, res) => {
    const countryName = req.params.countryName;
    const region = req.params.region;
    const searchText = countryName === "all" ? "" : countryName;
    fetchCountries(countryName, region)
      .then(data => {
        if(!isNotFound(data)){
            const refacted = refact(data);
            res.render("home", {
                searchCountryName: searchText,
                matchedCountries: refacted
            });
        } else {
            console.log("rendering 404 page");
            res.render("404", {
                searchCountryName:searchText
            });
        }
      });
});

app.post("/detail", (req, res) => {
    const countryCode = req.body.detailCountry;
    console.log(countryCode);
    res.redirect(`/country/${countryCode}/detail`);
})

app.get("/country/:countryCode/detail", (req, res) => {
    const countryCode = req.params.countryCode;
    getCountryByCode(countryCode).then(data => {
                if(!isNotFound(data)){
                    const refacted = refactData(data[0]);  
                    res.render("detail", {
                        country :  refacted
                    });
                } else {
                    console.log("rendering 404 page");
                    res.render("404", {
                        searchCountryName:countryCode
                    });
                }

    })
});


app.listen(3000, () => {
    console.log("server started on port 3000");
});

async function fetchCountries(searchCountry, searchRegion) {
    const url = searchCountry === "all" ? (baseURL + searchAll + urlFields) : (baseURL + searchByName + searchCountry + urlFields);
    console.log(url)
    const response = await fetch(url);
    const data = await response.json();
    const matched = filterRegion(data, searchRegion);
    return matched;

}

function filterRegion(data, region) {
    return region === "all" ? data : _.filter(data, {
        'region': region
    });
}

function isNotFound(data){
    const firstProperty = Object.keys(data)[0];
    const length = Object.keys(data).length;
    return data[firstProperty]=== 404? true : false || length === 0;
}



function refact(dataList){
    let refactDataList = [];
    let length = Object.keys(dataList).length;
    for ( var i = 0; i < length; i++){
        refactDataList.push(refactData(dataList[i]));
    }
    console.log("refactDataList length:"+refactDataList.length);
    return refactDataList;
}

function refactData(data) {
    const capital = data['capital'] === undefined? [] : data['capital'].join(", ");
    const borders = data['borders'] === undefined? [] : data['borders'];
    
    
    const refactedData = {
        'flag' : data['flags']['svg'],
        'name' : data['name']['common'],
        'nativeName' : getNativeName(data['name']['nativeName']),
        'population' : setThoughsandSeperator(data['population']),
        'region' : data['region'],
        'subregion' : data['subregion'],
        //tld is array
        'tld' : data['tld'].join(" "),
        //currency is object
        'currencies' : getCurrencies(data['currencies']),
        // capital is array
        'capital' : capital,
        // languages is object
        'languages' : getLanguages(data['languages']),
        'borders' : borders,
        'cca3' : data['cca3'],
        'independent' : getIndependency(data['independent'])
    }
    return refactedData;
}

function getIndependency(independency){
    return independency === true? 'Yes':'No';
}

function getCurrencies(data) {
    let currencies = [];
    for(var key in data){
        if(data.hasOwnProperty(key)){
            currencies.push(data[key]['name']);
        }
    }
    
    return currencies.join(", ");
}

function getLanguages(data) {
    let languages = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)){
            languages.push(data[key]);
        }
    }
    
    return languages.join(", ");
}

function getNativeName(data) {
    let nativeNames = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)){
            nativeNames.push(data[key]['common']);
        }
    }
    return nativeNames.join(", ");

}

async function getNameByCode(code){
   const response = await fetch(searchByCode + code);
   const country = await response.json();
   const name = country[0]['name']['common'];
   return name;
}
async function getCountryByCode(code){
    const response = await fetch(searchByCode + code);
    const country = await response.json();
    return country;
 }


 async function getBorderName(data){
    let borderNames = [];
    for(let i = 0; i < data.length; i++){
        const name = await getNameByCode(data[i]);
        borderNames.push(name);
    }
    
    return borderNames;

}
function setThoughsandSeperator(number){
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}


import fetch from "node-fetch";
globalThis.fetch = fetch;
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";


const app = express();
const baseURL = "https://restcountries.com/v3.1/";
const searchAll = "all";
const searchByName = "name/";
const urlFields = "?fields=name,population,region,capital,subregion,tld,currencies,languages,borders,flags";

app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    // get all countries
    fetchCountries("all", "all").then(data => {
        const refacted = refact(data);
        console.log("get first country flag: " + refacted[0].flag);
        res.render("home", {
            searchCountryName: "",
            matchedCountries: refacted
        });
    });
});

app.post("/filter", (req, res) => {
    const region = req.body.region === "" ? "all" : req.body.region;
    const countryName = req.body.countryName === "" ? "all" : req.body.countryName;
    console.log("search country: " + countryName + " region: " + region);
    res.redirect(`/country/${countryName}/region/${region}`);
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
    const country = req.body.detailCountry;
    res.redirect(`/country/${country}/detail`);
})

app.get("/country/:country/detail", (req, res) => {
    const country = req.params.country;
    fetchCountries(country, "all").then(data => {
        if(!isNotFound(data)){
            const refacted = refact(data);
            console.log(refacted);
            res.render("detail", {
                country : refacted[0]
            });
        } else {
            console.log("rendering 404 page");
            res.render("404", {
                searchCountryName:country
            });
        }

    })
})


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
    // console.log(refactDataList[0]);
    return refactDataList;
}

function refactData(data) {
    const refactedData = {
        'flag' : data['flags']['svg'],
        'name' : data['name']['common'],
        'nativeName' : getNativeName(data['name']['nativeName']),
        'population' : data['population'],
        'region' : data['region'],
        'subregion' : data['subregion'],
        //tld is array
        'tld' : data['tld'],
        //currency is object
        'currencies' : getCurrencies(data['currencies']),
        // capital is array
        'capital' : data['capital'],
        // languages is object
        'languages' : getLanguages(data['languages']),
        'borders' : data['borders'],
    }
    return refactedData;
}

function getCurrencies(data) {
    let currencies = [];
    for(var key in data){
        if(data.hasOwnProperty(key)){
            currencies.push(data[key]['name']);
        }
    }
    //console.log("currencies:" + currencies);
    return currencies;
}

function getLanguages(data) {
    let languages = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)){
            languages.push(data[key]);
        }
    }
    //console.log("languages:" + languages)
    return languages;
}

function getNativeName(data) {
    let nativeNames = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)){
            nativeNames.push(data[key]['common']);
        }
    }
    return nativeNames;

}



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
    // test call api
    fetchCountries("all", "all").then(data => {
        res.render("home", {
            searchCountryName: "",
            matchedCountries: data
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
            console.log(getNativeName(data[0]));
            res.render("home", {
                searchCountryName: searchText,
                matchedCountries: data
            });
        } else {
            console.log("rendering 404 page");
            res.render("404", {
                searchCountryName:searchText
            });
        }
      });
    
    

    

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
    console.log(Object.keys(matched).length);
    return matched;

}

function filterRegion(data, region) {
    return region === "all" ? data : _.filter(data, {
        'region': region
    });
}

function isNotFound(data){
    const firstProperty = Object.keys(data)[0];
    return data[firstProperty]=== 404? true : false;
}

function getNativeName(country) {
    const firstProperty = Object.keys(country['name']['nativeName'])[0];
    return country['name']['nativeName'][firstProperty]['official'];

}


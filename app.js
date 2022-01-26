

import fetch from "node-fetch";
globalThis.fetch = fetch;
import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
const app = express();
const baseURL = "https://restcountries.com/v3.1/";
const searchAll = "all";
const searchByName = "name/";
const urlFields = "?fields=name,population,region,capital,subregion,tld,currencies,languages,borders";

app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    // test call api
    fetchCountries("belgium");
    res.render("home", {
        searchCountryName: ""
    });
});

app.post("/filter", (req, res) => {
    const region = req.body.region;
    const countryName = req.body.countryName;
    console.log("search country: " + countryName + " region: " + region);
    res.redirect("/" + countryName)
});

app.get("/:countryName", (req, res) => {
    const countryName = req.params.countryName;
    res.render("home", {
        searchCountryName: countryName
    });

});


app.listen(3000, () => {
    console.log("server started on port 3000");
});

function fetchCountries(searchText) {
    console.log("called fetch countries");
    if (searchText === "") {
        fetch(baseURL + searchAll + searchText + urlFields)
            .then(response => response.json())
            .then(data => console.log(data));
    } else {
        fetch(baseURL + searchByName + searchText + urlFields)
            .then(response => response.json())
            .then(data => console.log(data));
    }

}

//https://restcountries.com/v3.1/name/united?fields=name,population,region,capital,subregion,tld,currencies,languages
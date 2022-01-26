const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    // call api to get all countries
    res.render("home");
})

app.listen(3000, ()=>{
    console.log("server started on port 3000");
})
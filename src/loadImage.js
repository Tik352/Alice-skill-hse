var needle = require("needle");

var cheerio = require("cheerio");

url = "https://www.hse.ru/ba/se/";

needle.get(url, function (err, res) {
    if (err) throw (err);


    var $ = cheerio.load(res.body);

    let txt = $("div.js-program__side-info-group")
        .find(".b-program__side-info")
        .text()
    console.log(txt);
});

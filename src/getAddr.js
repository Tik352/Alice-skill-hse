var needle = require("needle");

var cheerio = require("cheerio");

module.exports = function getAddr(url, then) {
    needle.get(url, function (err, res) {
        if (err) throw (err);

        var $ = cheerio.load(res.body);

        let txt = $("div.js-program__side-info-group").text();
        console.log(txt);
        then(txt);
    });
}

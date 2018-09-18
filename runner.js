
let cheerio = require('cheerio');
// let jsonframe = require('jsonframe-cheerio');
var request = require('request');
var fs = require('fs');
// let $ = cheerio.load('http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=1');
// jsonframe($); // initializes the plugin
// ... give time for script to load, then type (or see below for non wait option)

var getLastIndex = function (url, callback) {
    let index = 0;
    request(url, function (err, resp, body) {
        
        if (err) {
            console.err(err);
        }
        console.log("here")
        var $ = cheerio.load(body);
        
        var lastPath = "";
        $('.pager-last').each(function() {
            lastPath = $(this).find('a').attr('href');
            
        });
        console.log(lastPath);
        request('http://www.pnas.org'+lastPath, function (err, resp, b) {
            $ = cheerio.load(b);
            index = parseInt($('.pager-current').text());
            callback(index);
        });
    });
    
}


var getCSV = function (url) {

    return new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {
            var $ = cheerio.load(body);

            let l = "";
            $('.highwire-cite').each(
                function () {
                    let title = $(this).find('.highwire-cite-title').text();
                    title = title.replace(",", ";");
                    let authors = $(this).find('.highwire-cite-authors').text();
                    authors = authors.replace(",", ";");
                    let firstAuthor = $(this).find('.first').text();
                    let date = $(this).find('.highwire-cite-metadata-date').text();
                    date = date.replace(",", ";");
                    l += `${title},${authors},${firstAuthor},${date}\n`

                });
            resolve(l);

        });
    });
}

var pages = []
var text = 'http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page='
getLastIndex(text,function(index) {
    console.log(index);
for (let i = 0; i < index; i++) {
    pages.push(text + i.toString());
}
let scrapers = pages.map(getCSV);


console.log(scrapers);
Promise.all(scrapers).then(function (scrapes) {
    // "scrapes" collects the results from all pages.
    // console.log("Yay ");
    let line = `title,authors,firstAuthor,date\n`
    var stream = fs.createWriteStream("data.csv");
    stream.once('open', function (fd) {
        stream.write(line);

        for (let scrap of scrapes) {
            stream.write(scrap);
        }
        stream.end();
        console.log("done");
    });
}, function (error) {
    // At least one of them went wrong.
    console.log("There has been an error");
});
});
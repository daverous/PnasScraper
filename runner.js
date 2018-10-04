// how to add jquery to chrome:

// var scr = document.createElement("script");
// scr.src = "http://code.jquery.com/jquery-1.9.1.min.js";
// document.body.appendChild(scr);


let cheerio = require('cheerio');
// let jsonframe = require('jsonframe-cheerio');
var request = require('request');
var fs = require('fs');
// let $ = cheerio.load('http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=1');
// jsonframe($); // initializes the plugin
// ... give time for script to load, then type (or see below for non wait option)


var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 100;
https.globalAgent.maxSockets = 100;


http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=3&facet%5Btoc-section-id%5D%5B0%5D=Applied%20Mathematics
var categories = [

    "Agricultural Sciences",
    "Anthropology",
    "Applied Biological Sciences",
    "Biochemistry",
    "Biophysics and Computational Biology",
    "Cell Biology",
    "Developmental Biology",
    "Ecology",
    "Environmental Sciences",
    "Evolution",
    "Genetics",
    "Immunology and Inflammation",
    "Medical Sciences",
    "Microbiology",
    "Neuroscience",
    "Pharmacology",
    "Physiology",
    "Plant Biology",
    "Population Biology",
    "Psychological and Cognitive Sciences",
    "Sustainability Science",
    "Systems Biology",
    "Anthropology",
    "Economic Sciences",
    "Environmental Sciences",
    "Political Sciences",
    "Psychological and Cognitive Sciences",
    "Social Sciences",
    "Sustainability Science",
    "Applied Mathematics",
    "Applied Physical Sciences",
    "Astronomy",
    "Biophysics and Computational Biology",
    "Chemistry",
    "Computer Sciences",
    "Earth, Atmospheric, and Planetary Sciences",
    "Engineering",
    "Mathematics",
    "Physics",
    "Statistics",
    "Sustainability Science"

]

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=3&facet%5Btoc-section-id%5D%5B0%5D=Biophysics%20and%20Computational%20Biology
// http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=3&facet%5Btoc-section-id%5D%5B0%5D=Applied%20Mathematics
// var getLastIndex = function (url, callback) {
//     let index = 0;
//     request(url, function (err, resp, body) {

//         if (err) {
//             console.log(err);
//             console.log("there has been an error")
//         }
//         var $ = cheerio.load(body);

//         var lastPath = "";
//         $('.pager-last').each(function() {
//             lastPath = $(this).find('a').attr('href');

//         });
//         request('http://www.pnas.org'+lastPath, function (err, resp, b) {
//             $ = cheerio.load(b);
//             index = parseInt($('.pager-current').text());
//             if (isNaN(index)) index =1 
//             callback(index);
//         });
//     });

// }


var getLastIndex = function (url) {
    let index = 0;
    return new Promise(function (resolve, reject) {
        request(url, function (err, resp, body) {

            if (err) {
                console.log(err);
                console.log("there has been an error")
                console.log(url)
            }
            var $ = cheerio.load(body);

            var lastPath = "";
            $('.pager-last').each(function () {
                lastPath = $(this).find('a').attr('href');

            });
            request('http://www.pnas.org' + lastPath, function (err, resp, b) {
                $ = cheerio.load(b);
                index = parseInt($('.pager-current').text());
                if (isNaN(index)) index = 0
                // callback(index);

                /*stuff using username, password*/
                if (!err) {
                    resolve(index);
                } else {
                    console.log("Error on index");
                    resolve(0);
                }
            });
        });
    });

}


var getCitations = function(paperInfo) {
    return new Promise(function (resolve, reject) {

        let title = paperInfo[0]
        let authors = paperInfo[1]
        let firstAuthor = paperInfo[2]
        let date = paperInfo[3]
        let cat = paperInfo[4]
        let paperPage =  paperInfo[5]
        let path = 'http://www.pnas.org' + paperPage + '/tab-article-info'
        request(path, function (err, resp, b) {
            if (err) {
                console.log("there has been an error")
                console.log(path)
                let line = `${title},${authors},${firstAuthor},${date},${cat},0\n`
                return resolve(line);
            }
            else {

             $ = cheerio.load(b);
            citeNumber = $(".citing-isi-with-logo").find('.counter').text();
            title =title.replaceAll(" ", "%20")
            let line = `${title},${authors},${firstAuthor},${date},${cat},${citeNumber}\n`
            return resolve(line);
            }
        });
});
}
// TITLE, authors, first author, date, number of citations, field/category
// AUTHOR H-Index


var getCSV = function (arr) {

    let url = arr[0];
    let cat = arr[1];
    return new Promise(function (resolve, reject) {
            request(url, function (err, resp, body) {
                if (err) {
                    console.log("there has been an error")
                    console.log(url)
                    console.log(err)
                }
                var $ = cheerio.load(body);
                let l = "";
                var paperInfo = [];

                $('.highwire-cite').each(
                    function () {
                        let title = $(this).find('.highwire-cite-title').text();

                        title = title.replaceAll(",", ";");
                        let authors = $(this).find('.highwire-cite-authors').text();
                        authors = authors.replaceAll(",", ";");
                        let firstAuthor = $(this).find('.first').text();
                        let date = $(this).find('.highwire-cite-metadata-date').text();
                        date = date.replaceAll(",", ";");

                        let paperPage = $(this).find('.highwire-cite-linked-title').attr('href');
                        
                        let pass = [title,authors,firstAuthor,date,cat,paperPage]
                        paperInfo.push(pass)
                        });

                let citCounts = paperInfo.map(getCitations);
                Promise.all(citCounts).then(function (lines) {
                    return resolve(lines.join(''));
                });

            });
    });
}



// TITLE, authors, first author, date, number of citations, field/category
// AUTHOR H-Index
// let pages = []
// // let text = 'http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page='
// let initUrl ='http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=3&facet%5Btoc-section-id%5D%5B0%5D='
// for (let cat of categories) {
//     let repCat = cat.replaceAll(' ','%20')
//     let text = initUrl+repCat;


function getCategoriesPages(cat) {
            let initUrl = 'http://www.pnas.org/search/pubyear%3A2010%20numresults%3A100%20sort%3Arelevance-rank%20format_result%3Acondensed%20content_type%3Ajournal?page=0&facet%5Btoc-section-id%5D%5B0%5D='
            let pages = []
            let repCat = cat.replaceAll(' ', '%20')
            let text = initUrl + repCat;
            // console.log(text)
            return new Promise(function (resolve, reject) {
                getLastIndex(text).then(function (index) {
                    for (let i = 0; i < index; i++) {
                        let str = text.replace('page=0', 'page=' + i)
                        pages.push([str, cat]);
                    }
                    return resolve(pages);
                });
            })
        }

function searchAllCategories() {

            let catPages = categories.map(getCategoriesPages);

            Promise.all(catPages).then(function (p) {
                p = p.reduce((acc, val) => acc.concat(val), []);
                let scrapers = p.map(getCSV);


                Promise.all(scrapers).then(function (scrapes) {
                    // "scrapes" collects the results from all pages.
                    console.log("Yay ");
                    let line = `title,authors,firstAuthor,date,category,citationNumber\n`
                    var stream = fs.createWriteStream("data.csv");
                    stream.once('open', function (fd) {
                        stream.write(line);
                        for (let scrap of scrapes) {
                            stream.write(scrap);
                        }

                        console.log("done");
                        stream.end();
                    });

                }, function (error) {
                    // At least one of them went wrong.
                    console.log("Some promises have rejected");
                });
            });
        }

searchAllCategories()
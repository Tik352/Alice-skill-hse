const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

module.exports = function getlist(url, then){
    let info = [];
    request(url, (error, response, html) => {
  
        if ((!error) && (response.statusCode === 200)) {
            let $ = cheerio.load(html);
  
            $('.post').each((i, el) => {
                let news_title = $(el).find('.first_child a').text();
                let news_url = $(el).find('.first_child a').attr('href');
            
                let date_day = $(el).find('.post-meta__day').text();
                let date_month = $(el).find('.post-meta__month').text();
                let date_year = $(el).find('.post-meta__year').text();
  
                let date = date_day +":"+date_month+":"+date_year;
                info.push( {
                    description: news_title,
                    url: news_url,
                    date_day: date
                });              
            });          
            then(info);
            // fs.writeFile("./data/news.json", info, err => {
            //     if(err)
            //         throw err;
            // });
          }
    });  
}

  
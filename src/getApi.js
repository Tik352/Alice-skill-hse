const request = require('request')
const fs = require('fs')

const URL = 'https://www.hse.ru/api/education/program_discounts'

// скачиваем .json файл с программами ВШЭ 
request(URL, (err, res, body) => {
    
    if(err)
        throw err;
    fs.writeFile('./data/program_discounts.json', res.body, err => {
        if(err)
            throw err
    })
 //   console.log(res.body)
})


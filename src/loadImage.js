const req = require('request');

///api/v1/skills/AQAAAAAwgtSZAAT7o3rXg48cnEIHs_VwY9-QUp0/images


var options = {
    host: 'https://dialogs.yandex.net',
    path: '/api/v1/skills/AQAAAAAwgtSZAAT7o3rXg48cnEIHs_VwY9-QUp0/images',
    method: 'POST',
    headers: { 
        'content-type' : 'multipart/form-data',
        'Authorization' : 'OAuth AQAAAAAwgtSZAAT7o3rXg48cnEIHs_VwY9-QUp0'
    },

    body: {
        'url' : 'http://umnik.hseinc.ru/images/tild3433-3532-4330-b261-653839346232__1.png'
    }
}

req(options, (err, resp, body) => {
    if(err)
        throw err;

    console.log(resp.body);
    console.log("\n\n"+body);
})


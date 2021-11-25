const express = require('express');
const https = require('https');
const fs = require('fs');

// options
let application = express();
const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};
const PORT = 8080;


application.use(express.static("dist"));
https.createServer(options, application).listen(PORT, () => {
    console.log(`Listening on port ${PORT} ...`);
});

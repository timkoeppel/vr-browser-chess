import * as express from "express";
import {Request, Response} from "express";
import * as https from 'https';
import * as fs from "fs";
import * as path from "path";

let app: express.Application = express();
app.use('/dist', express.static(__dirname));
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '/index.html'));
    console.log(__dirname)
});

const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};


const PORT = 8080;
app.set("port", PORT);
https.createServer(options, app).listen(PORT, () => {
    console.log(`Listening on port ${PORT} ...`);
});
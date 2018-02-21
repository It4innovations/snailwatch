import express from 'express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import {readFile} from 'fs';
import {promisify} from 'util';

const app = express();
const port = process.env.PORT || 3000;
const webDir = process.env.WEB_PATH || path.join(__dirname, 'web');
const apiHost = process.env.SW_API_SERVER || 'http://localhost:5000';

console.log(`Serving from ${webDir} on port ${port}, API address: ${apiHost}`);

const readFileAsync = promisify(readFile);

app.use(expressStaticGzip(webDir));
app.get('/*', async (req, res) =>
{
    const html = await readFileAsync(path.join(webDir, 'index.html'));
    const modified = html.toString().replace('{{API_HOST}}', apiHost);
    res.send(modified);
});

app.listen(port);

import express from 'express';
import path from 'path';
import fs from 'fs';
import {promisify} from 'util';

const app = express();
const port = process.env.PORT || 3000;
const webDir = process.env.WEB_PATH || path.join(__dirname, 'web');
const apiHost = process.env.SW_API_SERVER || 'http://localhost:5000';

console.log(`Serving from ${webDir} on port ${port}, API address: ${apiHost}`);

const readFile = promisify(fs.readFile);

app.use(express.static(webDir));
app.get('/*', async (req, res) =>
{
    const html = await readFile(path.join(webDir, 'index.html'));
    const modified = html.toString().replace('{{API_HOST}}', apiHost);
    res.send(modified);
});

app.listen(port);

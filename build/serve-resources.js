import url from 'url';
import fs from 'fs';
import path from 'path';
import mime from './optional-mime.js';
import { isDirectory, isExistent, isFile, logError, logNote, throwError } from './helpers.js';
/*
    Stream the file
*/
export const outputStream = async (stream, 
// solve error TS2349: This expression is not callable.
// Each member of the union type '[ ]' has signatures,
// but none of those signatures are compatible with each other.
response // http.ServerResponse | http2.Http2ServerResponse,
) => {
    for await (const chunk of stream) {
        if (chunk instanceof Buffer) {
            response.write(chunk);
        }
        else {
            // do we get here?
            const buffered = Buffer.from(chunk);
            response.write(buffered);
        }
    }
};
/*
    Look for index file, returns path to index or undefined
*/
export const tryRedirect = (absPath) => {
    // check for index.html etc.
    const extentions = ['html', 'htm', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'xml'];
    const filePaths = extentions.map(ext => {
        const indexFile = path.resolve(absPath + '/index.' + ext);
        if (isExistent(indexFile) && isFile(indexFile)) {
            return indexFile;
        }
    }).filter(x => x);
    if (filePaths[0]) {
        return filePaths[0];
    }
};
/*
    Serve the stream
*/
export const serveResources = async function (request, 
// solve error TS2349: This expression is not callable.
// Each member of the union type '[ ]' has signatures,
// but none of those signatures are compatible with each other.
response // http.ServerResponse | http2.Http2ServerResponse,
) {
    if (!request.url) {
        return;
    }
    let contentType = false;
    let absolutePath = '';
    try {
        const locator = new url.URL(request.url, `http://localhost:${this.port}`);
        absolutePath = path.resolve(this.root + locator.pathname);
        if (isExistent(absolutePath)) {
            // check for alternative index files
            if (isDirectory(absolutePath)) {
                const indexPath = tryRedirect(absolutePath);
                absolutePath = indexPath ? indexPath : absolutePath;
            }
            contentType = mime.contentType(path.basename(absolutePath));
            if (contentType) {
                response.setHeader('Content-Type', contentType);
            }
            else {
                logNote(`No Content-Type found for ${request.url}`);
            }
            const fileStream = fs.createReadStream(absolutePath);
            response.writeHead(200);
            await outputStream(fileStream, response);
        }
        else if (locator.pathname === '/favicon.ico') {
            response.writeHead(204);
        }
        else {
            response.writeHead(404);
            throwError(`Artefact not found`);
        }
    }
    catch (errTxt) {
        // remaining errors
        logError(errTxt);
        response.write(`<h1>${errTxt}</h1>`);
        response.write('<p>' + absolutePath + '</p>');
    }
    finally {
        response.end();
    }
};

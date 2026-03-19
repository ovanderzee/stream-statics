import * as http from 'http'
import * as https from 'https'
import * as http2 from 'http2'
import url from 'url'
import fs from 'fs'
import path from 'path'
import mime from './optional-mime.js'
import getSecureOptions from './certify-https.js'
import * as types from './types'
import { checkPort, checkRoot, defaultConfig, getLocalUrl } from './configuration.js'
import {isDirectory, isExistent, isFile, logError, logNote, throwError} from './helpers.js'

/*
    Create the server
*/
const createServer = function (config: types.ServerConfig): types.WebServer {
    const srvrsrc = serveResources.bind(config)
    let server

    if (config.protocol === 'http') {
        server = http.createServer(srvrsrc)
    } else if (config.protocol === 'https') {
        server = https.createServer(getSecureOptions(), srvrsrc)
    } else { // if (config.protocol === 'http2') {
        server = http2.createSecureServer(getSecureOptions(), srvrsrc)
    }

    return server
}

/*
    Stream the file
*/
const outputStream = async (
    stream: fs.ReadStream,
    // solve error TS2349: This expression is not callable.
    // Each member of the union type '[ ]' has signatures,
    // but none of those signatures are compatible with each other.
    response: any // http.ServerResponse | http2.Http2ServerResponse,
): Promise<void> => {
    for await (const chunk of stream) {
        if (chunk instanceof Buffer) {
            response.write(chunk)
        } else {
            // do we get here?
            const buffered = Buffer.from(chunk);
            response.write(buffered)
        }
    }
}

/*
    Look for index file, returns path to index or undefined
*/
const tryRedirect = (absPath: string): string | undefined => {
    // check for index.html etc.
    const extentions = ['html', 'htm', 'gif', 'jpg', 'jpeg', 'png', 'svg', 'xml']

    const filePaths = extentions.map(ext => {
        const indexFile = path.resolve(absPath + '/index.' + ext)
        if (isExistent(indexFile) && isFile(indexFile)) {
            return indexFile
        }
    }).filter(x => x)

    if (filePaths[0]) {
        return filePaths[0]
    }
}

/*
    Serve the stream
*/
const serveResources = async function (
    this: types.ServerConfig,
    request: http.IncomingMessage | http2.Http2ServerRequest,
    // solve error TS2349: This expression is not callable.
    // Each member of the union type '[ ]' has signatures,
    // but none of those signatures are compatible with each other.
    response: any // http.ServerResponse | http2.Http2ServerResponse,
): Promise<void> {
    if (!request.url) {
        return
    }

    let contentType: string | false = false;
    let absolutePath: string = ''

    try {
        const locator: url.URL = new url.URL(request.url, `http://localhost:${this.port}`)

        absolutePath = decodeURI(path.resolve(this.root + locator.pathname))

        // cors
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (isExistent(absolutePath)) {

            // check for alternative index files
            if (isDirectory(absolutePath)) {
                const indexPath = tryRedirect(absolutePath)
                absolutePath = indexPath ? indexPath : absolutePath
            }

            contentType = mime.contentType(path.basename(absolutePath))

            if (contentType) {
                response.setHeader('Content-Type', contentType)
            } else {
                logNote(`No Content-Type found for ${request.url}`)
            }

            // force expiry
            const expiresAt = new Date(0)
            response.setHeader('Expires', expiresAt.toUTCString())
            response.setHeader('Cache-Control', 'NO-CACHE')
            response.setHeader('Pragma', 'NO-CACHE')

            const fileStream = fs.createReadStream(absolutePath);

            response.writeHead(200)

            await outputStream(fileStream, response)

        } else if (locator.pathname === '/favicon.ico') {
            response.writeHead(204);
        } else {
            response.writeHead(404);
            throwError(`Artefact not found`)
        }
    }
    catch (errTxt) {
        // remaining errors
        logError(errTxt)
        response.write(`<h1>${errTxt}</h1>`)
        response.write('<p>' + absolutePath + '</p>')
    }
    finally {
        response.end()
    }
}

/*
    Start the serve
*/
export const startServer = async function (inputConfig: types.InputConfig): Promise<types.WebServer> {
    const config: types.ServerConfig = Object.assign(defaultConfig, inputConfig)

    if (!checkRoot(config.root)) {
        throwError(`Path "${path.resolve(config.root)}" can not be found`)
    }

    if (!(await checkPort(config.port))) {
        throwError(`Port "${config.port}" is already in use`)
    }

    const server: types.WebServer = createServer(config)

    try {
        server.listen(config.port)

        logNote(
            `looking at '${config.root}'
            \nlistening to ${getLocalUrl(config)}`
        )
    }
    catch (err) {
        logError(err)
    }

    return server
}

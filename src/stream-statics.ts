import * as http from 'http'
import * as https from 'https'
import * as http2 from 'http2'
import url from 'url'
import fs from 'fs'
import path from 'path'
import mime from './optional-mime.js'

/*
    All possible variables
*/
const defaultConfig: {root: string, protocol: 'http' | 'https' | 'http2', port: number} = {
    root: '.',
    protocol: 'http2',
    port: 9630
}

const secureOptions: {key: Buffer, cert: Buffer} = {
    key: fs.readFileSync('.localhost.key'),
    cert: fs.readFileSync('.localhost.crt'),
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
    Serve the stream
*/
const serveResources = async function (
    this: {root: string, protocol: 'http' | 'https' | 'http2', port: number},
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

    try {
        const locator: url.URL = new url.URL(request.url, `http://localhost:${this.port}`)
        const fileName: string = path.basename(locator.pathname)
        contentType = mime.contentType(fileName)
        const fileStream: fs.ReadStream = fs.createReadStream(this.root + locator.pathname)

        if (contentType) {
            response.setHeader('Content-Type', contentType)
        } else {
            console.log('No Content-Type found for', request.url)
        }

        response.writeHead(200)

        await outputStream(fileStream, response)
    }
    catch (err) {
        // implicit 404
        console.log('err', JSON.stringify(err, null, 2))
        response.write(`<h1>Nothing to serve</h1>`)
        response.write(`<h2>Handling ${request.url}${contentType ? ', content-type: ' + contentType : ''}</h2>`)
        response.write('<p>' + JSON.stringify(err, null, 2) + '</p>')
    }
    finally {
        response.end()
    }
}

/*
    Start the serve
*/
export const startServer = function (
    inputConfig: {root?: string, protocol?: 'http' | 'https' | 'http2', port?: number}
): http.Server | http2.Http2Server
{
    const config: {root: string, protocol: 'http' | 'https' | 'http2', port: number} = Object.assign(defaultConfig, inputConfig)
    const srvrsrc = serveResources.bind(config)
    let protocol, server

    switch (config.protocol) {
        case 'http':
            protocol = 'HTTP'
            server = http.createServer(srvrsrc)
            break
        case 'https':
            protocol = 'HTTPS'
            server = https.createServer(secureOptions, srvrsrc)
            break
        default: // 'http2'
            protocol = 'HTTP/2'
            server = http2.createSecureServer(secureOptions, srvrsrc)
    }

    try {
        server.listen(config.port)

        console.log(
            `\n------------------------------------------------------------------------\n`,
            `stream statics on ${protocol}:\n`,
            `listening to ${protocol === 'HTTP' ? 'http' : 'https'}://localhost:${config.port},`,
            `looking at '${config.root}'`,
            `\n========================================================================\n\n`,
        )
    }
    catch (err) {
        console.log(
            '\n------------------------------------\n',
            `stream statics:`,
            `error ${JSON.stringify(err, null, 2)}`,
            '\n====================================\n\n',
        )
    }

    return server
}

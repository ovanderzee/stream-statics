import * as http from 'http'
import * as https from 'https'
import * as http2 from 'http2'
import path from 'path'
import getSecureOptions from './certify-https.js'
import * as types from './types'
import { checkPort, checkRoot, defaultConfig, getLocalUrl } from './configuration.js'
import { logError, logNote, throwError } from './helpers.js'
import { serveResources } from './serve-resources.js'

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
    Start the serve
*/
export const startServer = async function (inputConfig: types.InputConfig): Promise<types.WebServer> {
    const config: types.ServerConfig = {...defaultConfig, ...inputConfig}

    if (!checkRoot(config.root)) {
        throwError(`Path "${path.resolve(config.root)}" can not be found`)
    }

    if (!(await checkPort(config.port))) {
        logNote(`Port "${config.port}" is already in use`)
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

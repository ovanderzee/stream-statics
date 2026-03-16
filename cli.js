#!/usr/bin/env node

import { startServer } from './build/stream-statics.js'
import { spotPort, spotProtocol, spotRoot } from './build/configuration.js'

if (process.argv && process.argv.length >= 2) {
    // [2, 4, 6] = --port --root etc...
    const cliArgs = process.argv.splice(2)
    const config = {}

    for (let i = 0; i < cliArgs.length; i++) {
        if (cliArgs[i].startsWith('--')) {
            const arg = cliArgs[i].replace(/^--/, '')

            // with key-value pairs, like --port 1234
            switch (cliArgs[i + 1] && arg) {
                case 'port':
                    config.port = Number(cliArgs[i + 1])
                    break
                case 'protocol':
                    config.protocol = cliArgs[i + 1]
                    break
                case 'root':
                    config.root = cliArgs[i + 1]
                    break
            }

            // containing value, --1234 as port
            if (spotPort(arg)) {
                config.port = Number(arg)
            } else if (spotProtocol(arg)) {
                config.protocol = arg
            } else if (spotRoot(arg)) {
                config.root = arg
            }
        }
    }

    await startServer(config)
}

#!/usr/bin/env node

import { spawnSync } from 'child_process'
import { spotPort } from './build/configuration.js'

const killServer = (port) => {
    const lsofOut = spawnSync( 'lsof', ['-t', '-i:' + port], { encoding: 'utf-8' } );
    const pids = lsofOut.stdout.trim()
    if (pids) {
        console.log(`Sending signal "kill" to all listeners at port ${port}.`)
        pids.split('\n').forEach(
            pid => spawnSync('kill', ['-s', 'KILL', pid])
        )
    } else {
        console.log(`Port ${port} was not listened to.`)
    }
}

if (process.argv && process.argv.length >= 2) {
    const cliArgs = process.argv.splice(2)

    for (let i = 0; i < cliArgs.length; i++) {
        if (cliArgs[i].startsWith('--')) {
            const arg = cliArgs[i].replace(/^--/, '')

            // with key-value pairs, like --port 1234
            switch (cliArgs[i + 1] && arg) {
                case 'port':
                    killServer(Number(cliArgs[i + 1]))
                    break
            }

            // containing value, --1234 as port
            if (spotPort(arg)) {
                killServer(Number(arg))
            }
        }
    }
}

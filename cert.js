#!/usr/bin/env node

import { exec } from 'child_process'
import { fileURLToPath } from "node:url";

/*
 *  cli program to create key and certificate next to this file
 */

// path to here, ending with '/'
const here = fileURLToPath(new URL('.', import.meta.url))
const key = here + '.localhost.key'
const crt = here + '.localhost.crt'

const makeCert = `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 3650 -subj '/CN=localhost' -keyout ${key} -out ${crt}`

exec(makeCert, (err, stdout, stderr) => {
    let loggable;

    // openssl command
    loggable = stderr.toString().trim()
    loggable && console.log(loggable)

    // possible output
    loggable = stdout.toString().trim()
    loggable && console.log(loggable)

    // exit code
    err && console.log('openssl exit code:', err)
})

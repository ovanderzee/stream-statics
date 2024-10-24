import assert from 'node:assert';
import esmock from 'esmock';
import { describe, it } from 'node:test';
import { startServer } from '../stream-statics.js';
import * as http from 'http';
import * as https from 'https';
describe('Serving http', async () => {
    it('should bring up an http server', async (t) => {
        const ststMocks = await esmock('../stream-statics.js', {
            http: {
                createServer: (cfg) => {
                    return {};
                }
            }
        });
        const server = await startServer({ protocol: 'http' });
        server.close();
        assert(server instanceof http.Server, `Expected an http.Server instance, but found (other) ${server.constructor.name}`);
    });
});
describe('Serving https', async () => {
    it('should bring up an https server', async (t) => {
        const ststMocks = await esmock('../stream-statics.js', {
            http: {
                createServer: (cfg) => {
                    return {};
                }
            }
        });
        const server = await startServer({ protocol: 'https' });
        server.close();
        assert(server instanceof https.Server, `Expected an https.Server instance, but found (other) ${server.constructor.name}`);
    });
});

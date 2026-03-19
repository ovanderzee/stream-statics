import assert from 'node:assert';
import { describe, it } from 'node:test';
import * as cfg from '../configuration.js';
import { startServer } from '../stream-statics.js';
describe('Spot portnumber', () => {
    it('should accept a port number greater than zero and smaller than 2^16', () => {
        const value = 8080;
        const spot = cfg.spotPort(value);
        assert(spot, `${value} should be approved`);
    });
    it('should convert a string represantation of an approved number', () => {
        const value = '8080';
        const spot = cfg.spotPort(value);
        assert(spot, `"${value}" should be approved`);
    });
    it('should reject a port number smaller than or equal to zero', () => {
        const value = 0;
        const spot = cfg.spotPort(value);
        assert(!spot, `${value} should be to disapproved`);
    });
    it('should reject a port number greater than or equal to 2^16', () => {
        const value = 65536;
        const spot = cfg.spotPort(value);
        assert(!spot, `${value} should be to disapproved`);
    });
    it('should reject anything except numbers', () => {
        const value = 'hundred';
        const spot = cfg.spotPort(value);
        assert(!spot, `${value} should be to disapproved`);
    });
});
describe('Spot webprotocol', () => {
    it('should accept the http protocol name', () => {
        const value = 'http';
        const spot = cfg.spotProtocol(value);
        assert(spot, `${value} should be approved`);
    });
    it('should accept the https protocol name', () => {
        const value = 'https';
        const spot = cfg.spotProtocol(value);
        assert(spot, `${value} should be approved`);
    });
    it('should accept the http2 protocol name', () => {
        const value = 'http2';
        const spot = cfg.spotProtocol(value);
        assert(spot, `${value} should be approved`);
    });
    it('should reject an unknown protocol name', () => {
        const value = 'hallo';
        const spot = cfg.spotProtocol(value);
        assert(!spot, `${value} should be to disapproved`);
    });
});
describe('Spot rootfolder', () => {
    it('should accept a root folder name starting with up dots', () => {
        const value = '../../higher/level';
        const spot = cfg.spotRoot(value);
        assert(spot, `${value} should be approved`);
    });
    it('should accept a root folder name starting with a here dot', () => {
        const value = './this/level';
        const spot = cfg.spotRoot(value);
        assert(spot, `${value} should be approved`);
    });
    it('should accept a root folder name starting with a slash', () => {
        const value = '/disk/root';
        const spot = cfg.spotRoot(value);
        assert(spot, `${value} should be approved`);
    });
    it('should reject an unprefixed path', () => {
        const value = 'unprefixed/path';
        const spot = cfg.spotRoot(value);
        assert(!spot, `${value} should be to disapproved`);
    });
});
describe('Default configuration', () => {
    it('should be valid', () => {
        const port = cfg.spotPort(cfg.defaultConfig.port);
        const protocol = cfg.spotProtocol(cfg.defaultConfig.protocol);
        const root = cfg.spotRoot(cfg.defaultConfig.root);
        assert(port && protocol && root, `${JSON.stringify(cfg.defaultConfig)} should be approved`);
    });
});
describe('Check availability of port', async () => {
    it('should accept an unused port number', async () => {
        const portOk = await cfg.checkPort(cfg.defaultConfig.port);
        assert(portOk, `port ${cfg.defaultConfig.port} is unused and should thus be approved`);
    });
    it('should reject an used port number', async () => {
        const server = await startServer({});
        const portOk = await cfg.checkPort(cfg.defaultConfig.port);
        assert(!portOk, `port ${cfg.defaultConfig.port} is used and should thus be disapproved`);
        server.close();
    });
});
describe('Check existence of root', () => {
    it('should accept an existing root folder', () => {
        const okRoot = './demo';
        const rootOk = cfg.checkRoot(okRoot);
        assert(rootOk, `folder ${okRoot} should be found`);
    });
    it('should reject an non-existing root folder', () => {
        const badRoot = './sbdgbcfjhgs/wbecbjawebfj/ejwebfjxhbemnxcz';
        const rootOk = cfg.checkRoot(badRoot);
        assert(!rootOk, `folder ${badRoot} should not be found`);
    });
});
describe('Generate server url', () => {
    it('should return a http-url when http is served', () => {
        const currentCfg = {
            port: 1234,
            protocol: 'http',
        };
        const config = { ...cfg.defaultConfig, ...currentCfg };
        const foundUrl = cfg.getLocalUrl(config);
        const expectedUrl = 'http://localhost:1234';
        assert(foundUrl === expectedUrl, `url should be '${expectedUrl}', found '${foundUrl}'`);
    });
    it('should return a https-url when http2 is served', () => {
        const currentCfg = {
            port: 1234,
            protocol: 'http2',
        };
        const config = { ...cfg.defaultConfig, ...currentCfg };
        const foundUrl = cfg.getLocalUrl(config);
        const expectedUrl = 'https://localhost:1234';
        assert(foundUrl === expectedUrl, `url should be '${expectedUrl}', found '${foundUrl}'`);
    });
    it('should return a https-url when https is served', () => {
        const currentCfg = {
            port: 1234,
            protocol: 'https',
        };
        const config = { ...cfg.defaultConfig, ...currentCfg };
        const foundUrl = cfg.getLocalUrl(config);
        const expectedUrl = 'https://localhost:1234';
        assert(foundUrl === expectedUrl, `url should be '${expectedUrl}', found '${foundUrl}'`);
    });
});

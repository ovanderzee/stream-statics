import * as http from 'http';
import * as http2 from 'http2';
import fs from 'fs';
import * as types from './types';
export declare const outputStream: (stream: fs.ReadStream, response: any) => Promise<void>;
export declare const tryRedirect: (absPath: string) => string | undefined;
export declare const serveResources: (this: types.ServerConfig, request: http.IncomingMessage | http2.Http2ServerRequest, response: any) => Promise<void>;

import path from "path";
/* @ts-ignore */
import someContentTypes from './mime-light.json' with { type: "json" };

/*
    Select dependency or option
*/
let mime: any
try {
    mime = await import('mime-types')
}
catch (err) {
    mime = {
        contentType: (name: string): string | false => {
            const extention: string = path.extname(name).substring(1)
            const mimeType = (someContentTypes as {[key: string]: string})[extention]
            return mimeType || 'text/plain'
        }
    }
}

export default mime

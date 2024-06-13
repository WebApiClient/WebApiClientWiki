import { viteBundler } from '@vuepress/bundler-vite';
import fs from "fs";

export default viteBundler({
    viteOptions: {
        server: {
            https: {
                key: fs.readFileSync('./devssl/test.key'),
                cert: fs.readFileSync('./devssl/test.crt'),
            },
        },
    },
    vuePluginOptions: {},
});
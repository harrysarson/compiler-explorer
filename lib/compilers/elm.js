// Copyright (c) 2010, Harry Sarson
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

const BaseCompiler = require('../base-compiler'),
    _ = require('underscore'),
    path = require('path'),
    fs = require('fs-extra'),
    ElmGeneratedJsParser = require("./elm-generated-js-parser");
    argumentParsers = require("./argument-parsers");

class ElmCompiler extends BaseCompiler {
    constructor(info, env) {
        super(info, env);
        this.compileFilename = this.compileFilename[0].toUpperCase() + this.compileFilename.slice(1);
        this.asm = new ElmGeneratedJsParser(this.compilerProps);
    }

    optionsForFilter(filters, outputFilename, userOptions) {
        let options = ['make', ...userOptions, '--output', this.filename(outputFilename)];
        return options;
    }

    preProcess(source) {
        const definedThings = _.uniq((source.match(/^\S*/gm) || [])
            .map(s => s.trim())
            .filter(s => s != '')
        );
        return `module Example exposing (..)

import Platform as PlatformImplComplilerExplorer

${source}

main : PlatformImplComplilerExplorer.Program () () a
main =
    let
${definedThings.map(definedThing => `        _ = ${definedThing}`).join('\n')}
    in
    PlatformImplComplilerExplorer.worker
        { init = \\() -> ( (), Cmd.none )
        , update = \\_ () -> ( (), Cmd.none )
        , subscriptions = \\() -> Sub.none
        }
`;
}

    getOutputFilename(dirPath, outputFilebase) {
        return path.join(dirPath, `${outputFilebase}.js`);
    }

    async exec(compiler, args, options) {
        const json = `{
    "type": "application",
    "source-directories": [
        "."
    ],
    "elm-version": "${this.compiler.version}",
    "dependencies": {
        "direct": {
            "elm/browser": "1.0.1",
            "elm/core": "1.0.2",
            "elm/html": "1.0.0"
        },
        "indirect": {
            "elm/json": "1.1.3",
            "elm/time": "1.0.0",
            "elm/url": "1.0.0",
            "elm/virtual-dom": "1.0.2"
        }
    },
    "test-dependencies": {
        "direct": {},
        "indirect": {}
    }
}
`;
        await fs.writeFileSync(path.join(options.customCwd, 'elm.json'), json);
        return await super.exec(compiler, args, options);
    }

    async postProcess(result, outputFilename, filters) {
        let x = await super.postProcess(result, outputFilename, filters);
        return x;
    }

}

module.exports = ElmCompiler;

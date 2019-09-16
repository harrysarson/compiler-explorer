// Copyright (c) 2019, Harry Sarson
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

const _ = require('underscore');

class AsmParser {
    constructor(compilerProps) {
    }

    processJs(js, filters) {

        const frontMatter =
`(function(scope){
'use strict';`;
        const endMatter =
`_Platform_export({'Example':{'init':author$project$Example$main(
	elm$json$Json$Decode$succeed(_Utils_Tuple0))(0)}});}(this));`;

        if (js.startsWith(frontMatter)) {
            js = js.slice(frontMatter.length);
        }
        if (js.endsWith(endMatter)) {
            js = js.slice(0, -endMatter.length);
        }

        if (filters.binary) throw new Error("Cannot handle binary yet");

        if (filters.commentOnly) {
            // Remove any block comments that start and end on a line if we're removing comment-only lines.
            const blockComments = /^\s*\/\*(\*(?!\/)|[^*])*\*\/\s*\r?\n/mg;
            js = js.replace(blockComments, "");
        }

        const userDefinedFunctions = _.uniq(js.match(/author\$project\$Example\$\w*/gm))
            .filter(s => s != 'author$project$Example$main');

        const generatedFunctions = [];
        let matchedKeyword = '';
        let remainingJs = js;

        while(true) {
            const nextDefinitionMatch = remainingJs.match(/^(function|var)/m);
            if (nextDefinitionMatch === null) {
                generatedFunctions.push({text: matchedKeyword + remainingJs, source: null});
                break;
            }
            const nextDefinitionIndex = nextDefinitionMatch.index;
            generatedFunctions.push({text: matchedKeyword + remainingJs.slice(0, nextDefinitionIndex), source: null});
            remainingJs = remainingJs.slice(nextDefinitionIndex + nextDefinitionMatch[0].length);
            matchedKeyword = nextDefinitionMatch[0];
        }

        const result = generatedFunctions.filter(
            str => userDefinedFunctions.some(
                funcName => str.text.startsWith(`var ${funcName}`)
            )
        );

        return result;
    }

    process(asm, filters) {
        return this.processJs(asm, filters);
    }
}

module.exports = AsmParser;

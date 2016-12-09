'use strict';
/* 
 * The MIT License
 *
 * Copyright 2016 Robert Tizzard.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Node specific imports

const path = require('path');

// Handbrake video  processing package

const hbjs = require('handbrake-js');

// Task Process Utils

const TPU = require('./FPE_taskProcessUtil.js');

//
// =========
// MAIN CODE
// =========
//

//  Watch/destination folders and parse allowed file formats JSON

var destinationFolder;
var watchFolder;
var fileFormats;

//
// On first call to message handler setup processing.
//

var onFirstMessage = function () {

    // Setup watch/destination folders and parse allowed file formats to convert JSON

    destinationFolder = process.argv[2];
    watchFolder = process.argv[4];
    fileFormats = TPU.parseJSON(process.argv[3]);

    // Create desination folder if needed

    TPU.createFolder(destinationFolder);

    onFirstMessage = undefined;

};

//
// =====================
// MESSAGE EVENT HANDLER
// =====================
//

//
// Convert video file using handbrake.
//

process.on('message', function (message) {

    // On first call setup process data

    if (onFirstMessage) {
        onFirstMessage();
    }

    let srcFileName = message.fileName;
    let dstFileName = destinationFolder + '\\' + path.parse(message.fileName).name + '.mp4';

    if (fileFormats[path.parse(srcFileName).ext]) {

        console.log('Converting ' + srcFileName + ' to ' + dstFileName);

        hbjs.spawn({input: srcFileName, output: dstFileName, preset: 'Normal'})
                .on('error', function (err) {
                    console.error(err);
                    TPU.sendStatus(TPU.stausSend);  // Failure but send more
                })
                .on('complete', function () {
                    console.log('Conversion complete.');
                    TPU.sendStatus(TPU.stausSend);  // File complete send more
                    if (message.deleteSource) {     // Delete Source if specified
                        TPU.deleteSourceFile(srcFileName);
                    }
                });

    } else {
        TPU.sendStatus(TPU.stausSend);  // File format not supported send another
    }

});

if (global.commandLine) {

    var Handbrake = {

        signature:
                {
                    taskName: 'Video File Conversion',
                    watchFolder: global.commandLine.options.watch,
                    processDetails: {prog: 'node', args: [__filename.slice(__dirname.length + 1), global.commandLine.options.dest, '{ ".mkv" : true, ".avi" : true, ".mp4" : true}']},
                    chokidarOptions: global.commandLine.options.chokidar, // OPTIONAL
                    deleteSource: global.commandLine.options.delete, // OPTIONAL
                    runTask: false                                 // true =  run task (for FPE_MAIN IGNORED BY TASK)
                }
    };

    module.exports = Handbrake;

}
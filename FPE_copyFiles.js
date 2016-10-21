/* 
 * The MIT License
 *
 * Copyright 2016 Robert Tizzard.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Node path module

var path = require("path");

// File systems extra package

var fs = require("fs-extra");

// Setup watch and destination folder

var watchFolder = process.argv[3];
var destinationFolder = process.argv[2];

// Destination is a array of multiple desinations [ dest1, dest2]
// otherwise convert to an array of one element for processin loop

if (destinationFolder.split(",") instanceof Array) {
    destinationFolder = destinationFolder.split(",");
} else {
    destinationFolder[0] = destinationFolder;
}

// Files copied in this pass

var filesCopied=0;

// Copy file to all specified destinations in array

process.on('message', function (message) {

    var srcFileName = message.fileName;
    var dstFileName = destinationFolder[0] + message.fileName.substr(watchFolder.length);

    for (var dest in destinationFolder) {
        
        dstFileName = destinationFolder[dest] + message.fileName.substr(watchFolder.length);

        console.log("Copying file " + srcFileName + " To " + dstFileName + ".");

        fs.copy(srcFileName, dstFileName, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log("File copy complete.")
                filesCopied++;
            }
            if (filesCopied==destinationFolder.length){ // Last file copied siganl for more
                process.send({status: 1});
                filesCopied=0;
            }
        });

    }

});

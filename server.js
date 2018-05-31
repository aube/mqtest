#!/usr/bin/env node
"use strict";
var CONF = require('./config');
var http = require("http"),
        url = require("url"),
        path = require("path"),
        fs = require("fs"),
        dir = "build",
        translates = "translates",
        assets = "assets";


var cluster = require('cluster');
if (cluster.isMaster) {
    cluster.fork();

    cluster.on('exit', function(worker, code, signal) {
        cluster.fork();
    });
}

if (cluster.isWorker) {

    http.createServer(function(request, response) {
        const typesMap = {
                'html': 'text/html',
                'json': 'application/json',
                'js': 'text/javascript',
                'ico': 'image/x-icon',
                'css': 'text/css',
                'txt': 'text/plain',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'wav': 'audio/wav',
                'mp3': 'audio/mpeg',
                'svg': 'image/svg+xml',
                'pdf': 'application/pdf',
                'doc': 'application/msword'
            };
        var uri = url.parse(request.url).pathname,
            filename = path.join(__dirname + '/' + dir + '/', uri),
            ext = filename.split('.'),
            ext = ext[ext.length - 1];

        function found() {
            if (fs.statSync(filename).isDirectory())
                filename += 'index.html';

            fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                    response.writeHead(500, {"Content-Type": "text/plain"});
                    response.write(err + "\n");
                    response.end();
                    return;
                }
                response.writeHead(200, {"Content-Type": typesMap[ext] || "text/html"});
                response.write(file, "binary");
                response.end();
            });
        }

        fs.exists(filename, function(exists) {
            if (exists) {
                found();
            } else { //assets, translates
                if (~uri.indexOf(translates)) {
                    filename = path.join(__dirname + '/', uri);
                } else {
                    filename = path.join(__dirname + '/' + assets + '/', uri);
                }

                fs.exists(filename, function(exists) {
                    if (exists) {
                        found();
                    } else {
                        //index.html always
                        filename = path.join(__dirname + '/' + dir + '/index.html')
                        found();
                        // response.writeHead(404, {"Content-Type": "text/plain"});
                        // response.write("404 Not Found\n");
                        // response.end();
                    }
                });
            }
        });
    }).listen(CONF.server.port, function(err) {
        if (err)
            console.log(err);
        console.log('Listening on port ' + CONF.server.port);
    });

}
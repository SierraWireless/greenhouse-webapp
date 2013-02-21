var colors = require('colors');
var http = require('http');
var path = require('path');
var static = require ('node-static');
var httpProxy = require('http-proxy');

var welcome = [
  '###### #####  ###### ###### #     #        #    # ###### #    #  ##### ######',
  '#      #    # #      #      # #   #        #    # #    # #    # #      #     ',
  '#      #    # #      #      #  #  #        #    # #    # #    # #      #     ',
  '#   ## #####  ####   ####   #   # #        ###### #    # #    # #####  ####  ',
  '#    # #   #  #      #      #     #        #    # #    # #    #      # #     ',
  '###### #    # ###### ###### #     #        #    # ###### ###### #####  ######',
].join('\n');

console.log(welcome.green.bold);

//Create a node-static server instance to serve the './app' folder
var file = new(static.Server)('./app');

// Create Server and run it.
httpProxy.createServer(function (request, response,proxy) {
    var decodedurl = decodeURI(request.url);
    if (decodedurl.indexOf('/api/') === 0)
    {
      // proxify url start with '/api/' to airvantage
      proxy.proxyRequest(request, response, {
      host: 'edge.m2mop.net',
      port: 80
      });
    }
    else
    {
      // serve static resources
      file.serve(request, response);
    }
  }
).listen(80);
console.log ("Server Successfully Launched.".blue)

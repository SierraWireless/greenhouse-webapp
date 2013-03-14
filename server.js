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

//handle port given by argument
var port = 80
if (process.argv[2] !== undefined){
	port = parseInt(process.argv[2], 10)
}

// Create proxy instance
var proxy = new httpProxy.HttpProxy({
    target : {
      port : 80, 
      host : 'edge.m2mop.net'},
    changeOrigin: true, // changes the origin of the host header to the target URL
});


// Create Server and run it.
http.createServer(function (request, response) {
    var decodedurl = decodeURI(request.url);
    if (decodedurl.indexOf('/api/') === 0)
    {
      // proxify url start with '/api/' to airvantage
      proxy.proxyRequest(request, response);
    }
    else
    {
      // serve static resources
      file.serve(request, response);
    }
  }
).listen(port);
console.log ("Server Successfully Launched.".blue.bold)

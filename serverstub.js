var colors = require('colors');
var http = require('http');
var path = require('path');
var static = require ('node-static');
var httpProxy = require('http-proxy');


var welcome = [
  '###### #####  ###### ###### #     #        ###### #    # ##### ',
  '#      #    # #      #      # #   #          #    #    # #    #',
  '#      #    # #      #      #  #  #          #    #    # #    #',
  '#   ## #####  ####   ####   #   # #          #    #    # ##### ',
  '#    # #   #  #      #      #     #          #    #    # #    #',
  '###### #    # ###### ###### #     #          #    ###### ######',
].join('\n');

console.log(welcome.rainbow.bold);

//Create a node-static server instance to serve the './app' folder
var file = new(static.Server)('./app');

// Create Server and run it.
httpProxy.createServer(function (request, response,proxy) {
    var decodedurl = decodeURI(request.url);
    if (decodedurl.indexOf('/api/') === 0)
    {
      // proxify url start with '/api/' to airvantage
    //  proxy.proxyRequest(request, response, {
    //  host: 'edge.m2mop.net',
    //  port: 80
    //  });
	response.writeHead(200, {
         'Content-Type': 'application/json'
     });
    response.end(JSON.stringify(getResponse()));
    }
    else
    {
      // serve static resources
      file.serve(request, response);
    }
  }
).listen(9696);
console.log ("Server Successfully Launched.".bold.blue)

var responseCount = 0;
var toogleBoolean = true;

function getResponse(){
 responseCount = responseCount + 1;
 toogleBoolean = !toogleBoolean;
 return {"modbus.data.luminosity":[{"value":(responseCount % 75 * 2.66).toString(),"timestamp":1359715903713}],
		"modbus.data.temperature":[{"value":(responseCount % 38 * 0.84).toString(),"timestamp":1359715903713}],
		"modbus.data.light":[{"value":toogleBoolean.toString(),"timestamp":1359715903713}],
		"modbus.data.open":[{"value":(!toogleBoolean).toString(),"timestamp":1359715903713}],
		"modbus.data.humidity":[{"value":(responseCount % 24 * 4.16).toString(),"timestamp":1359715903713}]}
}

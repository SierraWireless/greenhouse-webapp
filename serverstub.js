var http = require('http');
var path = require('path');
var static = require ('node-static');
var httpProxy = require('http-proxy');

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
).listen(80);
console.log ("Server Successfully Launched.")

var responseCount = 0;

function getResponse(){
 responseCount = responseCount + 1;
 return {"modbus.data.luminosity":[{"value":(responseCount*4 % 200).toString(),"timestamp":1359715903713}],
		"modbus.data.temperature":[{"value":(responseCount*3 % 45).toString(),"timestamp":1359715903713}],
		"modbus.data.light":[{"value":(responseCount % 2).toString(),"timestamp":1359715903713}],
		"modbus.data.humidity":[{"value":(responseCount*2 % 100).toString(),"timestamp":1359715903713}]}
}

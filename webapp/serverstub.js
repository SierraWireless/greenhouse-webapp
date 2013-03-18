var colors = require('colors');
var http = require('http');
var path = require('path');
var static = require ('node-static');


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

//handle port given by argument
var port = 80;
if (process.argv[2] !== undefined){
	port = parseInt(process.argv[2], 10);
}

// Create Server and run it.
http.createServer(function (request, response) {

	//handle the case of a GET request
	var decodedurl = decodeURI(request.url);
	if (decodedurl.indexOf('/api/') === 0)
   	{
		response.writeHead(200, {
		'Content-Type': 'application/json'
		});
		
		if (request.method === "POST"){
			//listen for data as soon as possible to don't miss it
			request.on('data',function (data){
				console.log ("Command receive: ".bold + data)
				var responseContent = handlePostRequest(JSON.parse(data));
				response.end(JSON.stringify(responseContent));
			});
		} else {
   	
			console.log ("Received request: ".bold + decodedurl);
			var responseContent = null;

			for (var regxp in responsesTable){
				var realregxp = new RegExp(regxp);
				if (realregxp.test(decodedurl)){
					responseContent = responsesTable[regxp]();
					break;
				}
			}

			if (responseContent === null){
				console.log ( "Unable to stub request: ".red.bold + decodedurl.red );
			} else {
				response.end(JSON.stringify(responseContent));
			}
		}
	}
	else
    {
	 	// serve static resources
	 	 file.serve(request, response);
	}
  }
).listen(port);
console.log ("Server Successfully Launched.".bold.blue);

//Hash map of url regexp and function that return the response content
//be aware that the regexp will be evaluated not in the order of declaration
var responsesTable = { "systems\/.*\/data": getDataResponse,
						"systems\\?uid=.*&fields=commStatus,lastCommDate": getStatusResponse,
						"systems\\?fields=commStatus,lastCommDate&uid=.*": getStatusResponse,
						"systems\\?uid=.*&fields=applications": getAppResponse,
						"systems\\?fields=items,applications,uid&uid=.*": getAppResponse
					};

var responseCount = 0;
var toogleLight = false;
var toogleShield = false;

function getDataResponse(){
 responseCount = responseCount + 1;
 var timestamp = new Date().getTime();
 var datas = {"greenhouse.data.luminosity":[{"value":(responseCount % 75 * 2.66).toString(),"timestamp":timestamp}],
		"greenhouse.data.temperature":[{"value":(responseCount % 38 * 1.26).toString(),"timestamp":timestamp}],
		"greenhouse.data.light":[{"value":toogleLight.toString(),"timestamp":timestamp}],
		"greenhouse.data.open":[{"value":toogleShield.toString(),"timestamp":timestamp}],
		"greenhouse.data.humidity":[{"value":(responseCount % 24 * 4.16).toString(),"timestamp":timestamp}]}
 if (responseCount % 100 === 50){
	datas["greenhouse.data.temperatureAlarm"] = true;
 }
 if (responseCount % 100 === 0){
	datas["greenhouse.data.temperatureAlarm"] = false;
 }
 return datas;
}

function getStatusResponse(){
	return {"items":[{"lastCommDate":new Date().getTime(),"commStatus":getCommStatus()}],"count":1,"size":1,"offset":0}
}

function getCommStatus(){
	if (responseCount %4 === 1){
		return "OK"
	} else if (responseCount %4 === 2) {
		return "WARNING"
	} else if (responseCount %4 === 3) {
		return "ERROR"
	} else if (responseCount %4 === 0) {
		return "UNDEFINED"
	}
}

function getAppResponse(){
	return {
    "items": [{
        "applications": [{
            "uid": "171e7e1008f449bc9439745f29a028eb",
            "name": "greenhouse",
            "revision": "0.3",
            "type": "greenhouse",
            "category": "APPLICATION"
        }]
    }],
    "count": 1,
    "size": 1,
    "offset": 0
	}
}

function handlePostRequest(postdata) {	
	if (postdata !== null){
		var commandId = postdata["commandId"]
		if (commandId === "greenhouse.data.switchLight"){
			return getCommandLightResponse(postdata.paramValues[0].value);
		} else if (commandId === "greenhouse.data.switchShield"){
			return getCommandShieldResponse(postdata.paramValues[0].value);
		}
	}
	console.log ("Unable to stub command: ".red.bold + JSON.stringify(postdata));
}

function getCommandLightResponse(param){
	console.log ("Light switched to ".green + param.toString().green.bold)
	toogleLight = param;
	return {"operation":"4b89657f63aac4b299c1d46e98a495326"};
}

function getCommandShieldResponse(param) {
	console.log ("Shield switched to ".green + param.toString().green.bold)
	toogleShield = param;
	return {"operation":"4b89657f63aac4b299c1d46e98a495326"};
}


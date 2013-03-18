'use strict';

// Notification system configuration
var toastrConf = {
	positionClass : 'toast-bottom-full-width'
};

/* Controllers */
function GreenHouseCtrl($scope, $http, $timeout, $credentials) {

	var assetName = "greenhouse";

	//init svg scope
	$scope.dataset = [ ];

	function formatFirstValueFromTable( table ){
		return parseFloat(table[0].value).toFixed(2);
	}

	function tick() {
		$http.get('/api/v1/systems/'+$credentials.system_id+'/data').success(function(data) {

			$timeout(tick, 10000);

			// Detemine button style from fresh values
			$scope.light = data[assetName+".data.light"][0].value === 'true' ? 'on' : 'off';
			$scope.shield = data[assetName+".data.open"][0].value === 'true' ? 'on' : 'off';

			// Round given values
			$scope.luminosity  = formatFirstValueFromTable(data[assetName+".data.luminosity"]);
			$scope.temperature = formatFirstValueFromTable(data[assetName+".data.temperature"]);
			$scope.humidity    = formatFirstValueFromTable(data[assetName+".data.humidity"]);

			// for svg
			
			$scope.dataset.push({
				timestamp: new Date().getTime(),
				humidity: parseFloat(data[assetName+".data.humidity"][0].value),
				temperature: parseFloat(data[assetName+".data.temperature"][0].value),
				luminosity: parseFloat(data[assetName+".data.luminosity"][0].value)
			});
			
		});    
	};
	
	function clock() {
		$scope.currentTime =  new Date().getTime()
		$timeout(clock, 1000);
	}

	var toggleCommand= function(commandId, newStatus, label) {

		// Fetch system info
		$http.get('/api/v1/systems?fields=items,applications,uid&uid=' + $credentials.system_id )
			.success(function(data) {

				// Command identifier as default label
				if ( ! label )
					label = commandId;

				// Extract application UID
				var applicationUID = data.items[0].applications[0].uid;

				/*
				 * Send command
				 */
				var postData = {
					"application" : {
						"uid" : applicationUID
					},
					"commandId"   : commandId,
					"paramValues" : [
						{
							"key"   : "state",
							"value" : newStatus
						}
					],
					"systems" : {
						"uids" : [$credentials.system_id]
					},
				};
				$http.post('/api/v1/operations/systems/command', postData)
					.success(function(data, status) {
						var msg = label + ': ' + (newStatus ? 'on' : 'off') + '.';
						toastr.success(msg, null, toastrConf);
					}).error(function(data, status) {
						var msg = label + ':' + (newStatus ? 'on' : 'off') +'. Unable to send command.';
						toastr.error(msg, null, toastrConf);
						console.log('Unable to change light status.');
						console.log('Error ' + status + ', ' + data.error + '.');
					});

			}).error(function(data, status){
				var msg = 'Unable to send: ' + label +'.';
				toastr.error(msg, null, toastrConf);
				console.log('Unable to fetch application UID.');
				console.log('Error ' + status + ', ' + data.error + '.');
			});
	}

	tick();
	
	clock();
	
	$scope.toggleLight  = function(value) {
		return toggleCommand(
			assetName+".data.switchLight",
			value,
			'Light command'
		);
	};
	$scope.toggleShield = function(value) {
		return toggleCommand(
			assetName+".data.switchShield",
			value,
			'Shield command'
		);
	};
}

function DeviceStatusCtrl($scope, $http, $timeout, $credentials) {

	var communicationClasses = {};
	communicationClasses['Error']     = 'label label-important';
	communicationClasses['Ok']        = 'label';
	communicationClasses['Undefined'] = 'label label-inverse';
	communicationClasses['Warning']   = 'label label-warning';

	function formatDate( date ){

		function makeDateValidString(number){
			if ( number >= 10 )
				return number.toString();
			return '0' + number.toString();
		}

		var formattedDate = date.getFullYear() + '-';
		formattedDate += makeDateValidString( date.getMonth() + 1 ) + '-';
		formattedDate += makeDateValidString( date.getDate() ) + ' ';
		formattedDate += makeDateValidString( date.getHours() ) + ':';
		formattedDate += makeDateValidString( date.getMinutes() ) + ':';
		formattedDate += makeDateValidString( date.getSeconds() );
		return formattedDate;
	}

	function tick() {
		$http.get('/api/v1/systems?fields=commStatus,lastCommDate&uid='+$credentials.system_id).success(function(data) {

			$timeout(tick, 10000);

			var date = new Date( data.items[0]["lastCommDate"] );
			$scope.lastcommdate = formatDate(date);

			var status = data.items[0]["commStatus"];
			status =  status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
			$scope.commstatus = status;
			$scope.commstatusclass = communicationClasses[ status ];

		});    
	};
	tick();
}

function SVGCtrl($scope){
	
	//load SVG background
	d3.xml("img/greenhouse.svg", "image/svg+xml", function(xml) {
  	  $(document).find('#SVGContainer').append(xml.documentElement);
	});
	
	//constants used to draw graphs

	var key = function(d) {
		return d.timestamp;
	};
	
	var innerRadius = 5;
	var minRadius = 50;
	var maxRadius = 175;
	var mMinRadius = 25;
	var mMaxRadius = 75; 
	
	var deg2rad = d3.scale.linear()
		.domain([0, 360])
		.range([0, 2*Math.PI]);
	
	var timeInterval = 60 * 1000; 
	
	var domains = ['humidity','temperature', 'luminosity']
	
	var domainDomains = {
		humidity: [0, 100],
		temperature: [0, 40],
		luminosity: [0, 200]
	}
	
	var domainColors = {
		humidity: ['#000d4f', '#021255', '#05175b', '#081d60', '#0b2366', '#0f296c', '#133072', '#173778', '#1c3e7d', '#214583', '#264d89', '#2b558f', '#315d94', '#37659a', '#3e6ea0', '#4576a6', '#4c7fac', '#5387b1', '#5b90b7', '#6399bd', '#6ca2c3', '#74abc8', '#7eb3ce', '#87bcd4', '#91c5da', '#9bcde0', '#a5d6e5', '#b0deeb', '#bbe6f1', '#c6eef7'],
		temperature: ['#3c0403', '#420504', '#480704', '#4e0905', '#540b06', '#5a0d07', '#600f08', '#671208', '#6d1409', '#73170a', '#791a0b', '#7f1d0c', '#85210e', '#8b240f', '#912810', '#972c11', '#9e2f13', '#a43414', '#aa3815', '#b03c17', '#b64118', '#bc461a', '#c24a1c', '#c84f1d', '#cf551f', '#d55a21', '#db5f23', '#e16524', '#e76b26', '#ed7028'],
		luminosity: ['#3c3503', '#423b04', '#484104', '#4e4705', '#544d06', '#5a5207', '#605808', '#675e08', '#6d6509', '#736b0a', '#79710b', '#7f770c', '#857d0e', '#8b830f', '#918a10', '#979011', '#9e9713', '#a49d14', '#aaa315', '#b0aa17', '#b6b118', '#bcb71a', '#c2be1c', '#c8c41d', '#cfcb1f', '#d5d221', '#dbd923', '#e1df24', '#e7e626', '#eded28']
		
	} 
	
	var domainRadiusScales = {
		humidity: d3.scale.linear().domain(domainDomains.humidity).range([minRadius, maxRadius]),
		temperature: d3.scale.linear().domain(domainDomains.temperature).range([mMinRadius, mMaxRadius]),
		luminosity: d3.scale.linear().domain(domainDomains.luminosity).range([mMinRadius, mMaxRadius])
	}
	
	var domainColorScales = {
		humidity: d3.scale.quantile().domain(domainDomains.humidity).range(domainColors.humidity),
		temperature: d3.scale.quantile().domain(domainDomains.temperature).range(domainColors.temperature),
		luminosity: d3.scale.quantile().domain(domainDomains.luminosity).range(domainColors.luminosity)
		
	}
	
	var angleScale = d3.scale.linear()
		.domain([0, timeInterval])
		.range([0, 360]);

	
	var timeFormat = d3.time.format("%H:%M:%S");
	
	var timeFormatShort = d3.time.format("%S")
	
	var domainNodes = {};
	
	var mainDomain = 'humidity';
}

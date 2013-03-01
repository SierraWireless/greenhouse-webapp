'use strict';

/* Controllers */
function GreenHouseCtrl($scope, $http, $timeout, $credentials) {

	function determineButtonStyle( table ){
		if( table[0].value === 'true' )
			return 'btn';
		return 'btn active';
	}

	var assetName = "greenhouse"

	function formatFirstValueFromTable( table ){
		return parseFloat(table[0].value).toFixed(2);
	}

	function tick() {
		$http.get('/api/v1/systems/'+$credentials.system_id+'/data').success(function(data) {

			$timeout(tick, 10000);

			// Detemine button style from fresh values
			$scope.lightbuttonclass = determineButtonStyle(data[assetName+".data.light"]);
			$scope.shieldbuttonclass = determineButtonStyle(data[assetName+".data.open"]);

			// Round given values
			$scope.luminosity  = formatFirstValueFromTable(data[assetName+".data.luminosity"]);
			$scope.temperature = formatFirstValueFromTable(data[assetName+".data.temperature"]);
			$scope.humidity    = formatFirstValueFromTable(data[assetName+".data.humidity"]);			

		});    
	};
	tick();
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
		$http.get('/api/v1/systems?uid='+$credentials.system_id+'&fields=commStatus,lastCommDate').success(function(data) {

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

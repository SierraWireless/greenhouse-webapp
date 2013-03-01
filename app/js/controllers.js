'use strict';

/* Controllers */
function GreenHouseCtrl($scope, $http, $timeout, $credentials) {

	function formatFirstValueFromTable( table ){
		return parseInt(table[0].value).toFixed(2);
	}

	function tick() {
		$http.get('/api/v1/systems/'+$credentials.system_id+'/data').success(function(data) {
			$timeout(tick, 1000);
			$scope.light = data["modbus.data.light"][0].value === 'true';
			$scope.lighticon = $scope.light ? 'icon-ok' : 'icon-remove';
			$scope.luminosity  = formatFirstValueFromTable(data["modbus.data.luminosity"]);
			$scope.temperature = formatFirstValueFromTable(data["modbus.data.temperature"]);
			$scope.humidity    = formatFirstValueFromTable(data["modbus.data.humidity"]);			
		});    
	};
	tick();
}

function DeviceStatusCtrl($scope, $http, $timeout,$credentials) {

	function tick() {
		$http.get('/api/v1/systems?uid='+$credentials.system_id+'&fields=commStatus,lastCommDate').success(function(data) {
			$timeout(tick, 1000);
			$scope.lastCommDate = data.items[0]["lastCommDate"];
			$scope.commStatus = data.items[0]["commStatus"];
		});    
	};
	tick();
}



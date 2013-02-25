'use strict';

/* Controllers */
function GreenHouseCtrl($scope, $http, $timeout,$credentials) {

	function tick() {
		$http.get('/api/v1/systems/'+$credentials.system_id+'/data').success(function(data) {
			$timeout(tick, 1000);
			$scope.luminosity = data["modbus.data.luminosity"][0].value;
			$scope.temperature = data["modbus.data.temperature"][0].value;
			$scope.light = data["modbus.data.light"][0].value;
			$scope.humidity = data["modbus.data.humidity"][0].value;			
		});    
	};
	tick();
}



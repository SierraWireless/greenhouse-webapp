'use strict';

/* Controllers */

function GreenHouseCtrl($scope, $http, $timeout) {

	function tick() {
       	$http.get('/api/v1/systems/0fba2d873df34f6bb7fa17351aa40e20/data').success(function(data) {
			$scope.luminosity = data["modbus.data.luminosity"][0].value;
			$scope.temperature = data["modbus.data.temperature"][0].value;
			$scope.light = data["modbus.data.light"][0].value;
			$scope.humidity = data["modbus.data.humidity"][0].value;
		});
        $timeout(tick, 1000);
    };
	tick();

}



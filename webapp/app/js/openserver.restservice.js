'use strict';

angular.module('restservice', ['credentials']).factory('$restservice', ['$http', '$credentials', function($http, $credentials) {
  var restservice = {};
  var assetName = "greenhouse";
  var serverurl = "";
  var deviceassetId = "012416005153410";

  restservice.getGreenData = function(successHandler, errorHandler) {
    $http.get(serverurl + '/data/' + deviceassetId).success(function(data) {
      var response = {};

      // Light is not sent by embedded app
      // retreiving booleans
      // response.light = data[assetName + ".data.light"][0].value === 'true' ?
      // 'on' : 'off';
      response.shield = data[assetName + ".data.open"][0].value[0] === 'true' ? 'on' : 'off';

      // Round given values
      response.luminosity = data[assetName + ".data.luminosity"][0].value[0];
      response.temperature = data[assetName + ".data.temperature"][0].value[0];
      response.humidity = data[assetName + ".data.humidity"][0].value[0];

      if (data[assetName + ".data.temperatureAlarm"] !== undefined) {
        response.temperatureAlarm = data[assetName + ".data.temperatureAlarm"][0].value[0];
        response.temperatureTimestamp = parseInt(data[assetName + ".data.timestamp"][0].value[0]);
      }

      return successHandler(response);
    }).error(errorHandler);
  };

  restservice.toggleCommand = function(commandId, newStatus, handleSuccess, handleNoApp, handleCommandError) {

    // TODO not tested
    $http.get(serverurl + '/data/' + deviceassetIdd).success(function(data) {

      // Send command
      var postData = {
        "settings": [{
          "key": "@sys.commands.ReadNode." + commandId,
          "value": newStatus
        }]
      };
      $http.post(serverurl + '/data' + deviceassetId, postData).success(handleSuccess).error(handleCommandError);
    }).error(handleNoApp);
  };

  restservice.getCommStatus = function(handleSuccess, handleError) {
    $http.get(serverurl + '/data/' + deviceassetId).success(function(data) {

      var result = {};
      result.lastCommDate = parseInt(data[assetName + ".data.timestamp"][0].value[0]);

      // WARNING NO comm status on the open server !
      console.log("WARNING NO comm status on 'open server' !");
      // result.status = data.items[0]["commStatus"];

      handleSuccess(result);

    }).error(handleError);

  };

  return restservice;
}]);

'use strict';

angular.module('restservice', ['credentials']).factory('$restservice', ['$http', '$credentials', function($http, $credentials) {
  var restservice = {};
  var assetName = "greenhouse";

  restservice.getGreenData = function(successHandler, errorHandler) {
    $http.get('/api/v1/systems/' + $credentials.system_id + '/data').success(function(data) {
      var response = {};

      // retreiving booleans
      response.light = data[assetName + ".data.light"][0].value === 'true' ? 'on' : 'off';
      response.shield = data[assetName + ".data.open"][0].value === 'true' ? 'on' : 'off';

      // Round given values
      response.luminosity = data[assetName + ".data.luminosity"][0].value;
      response.temperature = data[assetName + ".data.temperature"][0].value;
      response.humidity = data[assetName + ".data.humidity"][0].value;

      return successHandler(response);
    }).error(errorHandler);
  };

  restservice.toggleCommand = function(commandId, newStatus, handleSuccess, handleNoApp, handleCommandError) {

    // Fetch system info
    $http.get('/api/v1/systems?fields=items,applications,uid&uid=' + $credentials.system_id).success(function(data) {

      // Extract application UID
      var applicationUID = data.items[0].applications[0].uid;

      // Send command
      var postData = {
        "application": {
          "uid": applicationUID
        },
        "commandId": commandId,
        "paramValues": [{
          "key": "state",
          "value": newStatus
        }],
        "systems": {
          "uids": [$credentials.system_id]
        },
      };
      $http.post('/api/v1/operations/systems/command', postData).success(handleSuccess).error(handleCommandError);
    }).error(handleNoApp);
  };

  restservice.getCommStatus = function(handleSuccess, handleError) {
    $http.get('/api/v1/systems?fields=commStatus,lastCommDate&uid=' + $credentials.system_id).success(function(data) {

      var result = {};
      result.lastCommDate = data.items[0]["lastCommDate"];
      result.status = data.items[0]["commStatus"];
      handleSuccess(result);

    }).error(handleError);
  };

  return restservice;
}]);

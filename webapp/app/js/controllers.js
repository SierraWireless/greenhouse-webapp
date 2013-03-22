'use strict';

// Notification system configuration
var toastrConf = {
  positionClass: 'toast-bottom-full-width'
};

// utility functions
function formatDate(date) {

  function makeDateValidString(number) {
    if (number >= 10) return number.toString();
    return '0' + number.toString();
  }

  var formattedDate = date.getFullYear() + '-';
  formattedDate += makeDateValidString(date.getMonth() + 1) + '-';
  formattedDate += makeDateValidString(date.getDate()) + ' ';
  formattedDate += makeDateValidString(date.getHours()) + ':';
  formattedDate += makeDateValidString(date.getMinutes()) + ':';
  formattedDate += makeDateValidString(date.getSeconds());
  return formattedDate;
}

/* Controllers */
function GreenHouseCtrl($scope, $restservice, $timeout) {

  var assetName = "greenhouse";
  var lastacknowledge = 0;

  // init svg scope
  $scope.dataset = [];

  // init alert container
  $scope.alerts = [];

  $scope.acknowledgeAlert = function(index) {
    $scope.alerts.splice(index, 1);
    lastacknowledge = new Date().getTime();
  };

  function formatNumber(value) {
    return parseFloat(value).toFixed(2);
  }

  function tick() {
    $restservice.getGreenData(function(data) {

      $timeout(tick, 10000);

      // Detemine button style from fresh values
      $scope.light = data.light;
      $scope.shield = data.shield;

      // Round given values
      $scope.luminosity = formatNumber(data.luminosity);
      $scope.temperature = formatNumber(data.temperature);
      $scope.humidity = formatNumber(data.humidity);

      // manage alarm if it is triggered
      var tempAlarmValue = data.temperatureAlarm;
      var tempAlarmTimestamp = data.temperatureTimestamp;

      if (tempAlarmValue && tempAlarmTimestamp > lastacknowledge) {
        if ($scope.alerts.length > 0) {
          $scope.alerts[0].msg = "Temperature exceeds 40 °C since " + formatDate(new Date(tempAlarmTimestamp));
        } else {
          $scope.alerts[0] = {
            type: "error",
            msg: "Temperature exceeds 40 °C since " + formatDate(new Date(tempAlarmTimestamp))
          };
        }
      } else {
        $scope.alerts.splice(0, 1);
      }

      // for svg
      $scope.dataset.push({
        timestamp: new Date().getTime(),
        humidity: parseFloat(data.humidity),
        temperature: parseFloat(data.temperature),
        luminosity: parseFloat(data.humidity)
      });

    }, function(data, status) {
      // errorHandler
    });
  }
  ;

  function clock() {
    $scope.currentTime = new Date().getTime();
    $timeout(clock, 1000);
  }

  var toggleCommand = function(commandId, newStatus, label) {

    if (!label) label = commandId;

    $restservice.toggleCommand(commandId, newStatus,
    // handle success
    function(data, status) {
      var msg = label + ': ' + (newStatus ? 'on' : 'off') + '.';
      toastr.success(msg, null, toastrConf);
    },
    // handle no app
    function(data, status) {
      var msg = 'Unable to send: ' + label + '.';
      toastr.error(msg, null, toastrConf);
      console.log('Unable to fetch application UID.');
      console.log('Error ' + status + ', ' + data.error + '.');
    },
    // handle command error
    function(data, status) {
      var msg = label + ':' + (newStatus ? 'on' : 'off') + '. Unable to send command.';
      toastr.error(msg, null, toastrConf);
      console.log('Unable to change light status.');
      console.log('Error ' + status + ', ' + data.error + '.');
    });
  };

  tick();

  clock();

  $scope.toggleLight = function(value) {
    return toggleCommand(assetName + ".data.switchLight", value, 'Light command');
  };
  $scope.toggleShield = function(value) {
    return toggleCommand(assetName + ".data.switchShield", value, 'Shield command');
  };
}

function DeviceStatusCtrl($scope, $restservice, $timeout) {

  var communicationClasses = {};
  communicationClasses['Error'] = 'label label-important';
  communicationClasses['Ok'] = 'label';
  communicationClasses['Undefined'] = 'label label-inverse';
  communicationClasses['Warning'] = 'label label-warning';

  function tick() {

    $restservice.getCommStatus(function(data) {
      $timeout(tick, 10000);

      var date = new Date(data.lastCommDate);
      $scope.lastcommdate = formatDate(date);

      var status = data.status;
      status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      $scope.commstatus = status;
      $scope.commstatusclass = communicationClasses[status];

    }, function(data, status) {
      // error handler
    });
  }
  ;
  tick();
}

function SVGCtrl($scope) {

  // load SVG background
  d3.xml("img/greenhouse.svg", "image/svg+xml", function(xml) {
    $(document).find('#SVGContainer').append(xml.documentElement);
    // Init the graph
    initGraph();
    // trig refresh each time currentTime is updated
    $scope.$watch('currentTime', refresh, true);
  });

  // constants used to draw graphs

  var key = function(d) {
    return d.timestamp;
  };

  var innerRadius = 5;
  var minRadius = 50;
  var maxRadius = 175;
  var mMinRadius = 25;
  var mMaxRadius = 75;

  var deg2rad = d3.scale.linear().domain([0, 360]).range([0, 2 * Math.PI]);

  var timeInterval = 60 * 1000;

  var domains = ['humidity', 'temperature', 'luminosity'];

  var domainDomains = {
    humidity: [0, 100],
    temperature: [0, 40],
    luminosity: [0, 200]
  };

  var domainColors = {
    humidity: ['#000d4f', '#021255', '#05175b', '#081d60', '#0b2366', '#0f296c', '#133072', '#173778', '#1c3e7d', '#214583', '#264d89', '#2b558f', '#315d94',
        '#37659a', '#3e6ea0', '#4576a6', '#4c7fac', '#5387b1', '#5b90b7', '#6399bd', '#6ca2c3', '#74abc8', '#7eb3ce', '#87bcd4', '#91c5da', '#9bcde0',
        '#a5d6e5', '#b0deeb', '#bbe6f1', '#c6eef7'],
    temperature: ['#3c0403', '#420504', '#480704', '#4e0905', '#540b06', '#5a0d07', '#600f08', '#671208', '#6d1409', '#73170a', '#791a0b', '#7f1d0c',
        '#85210e', '#8b240f', '#912810', '#972c11', '#9e2f13', '#a43414', '#aa3815', '#b03c17', '#b64118', '#bc461a', '#c24a1c', '#c84f1d', '#cf551f',
        '#d55a21', '#db5f23', '#e16524', '#e76b26', '#ed7028'],
    luminosity: ['#3c3503', '#423b04', '#484104', '#4e4705', '#544d06', '#5a5207', '#605808', '#675e08', '#6d6509', '#736b0a', '#79710b', '#7f770c', '#857d0e',
        '#8b830f', '#918a10', '#979011', '#9e9713', '#a49d14', '#aaa315', '#b0aa17', '#b6b118', '#bcb71a', '#c2be1c', '#c8c41d', '#cfcb1f', '#d5d221',
        '#dbd923', '#e1df24', '#e7e626', '#eded28']
  };

  var domainRadiusScales = {
    humidity: d3.scale.linear().domain(domainDomains.humidity).range([minRadius, maxRadius]),
    temperature: d3.scale.linear().domain(domainDomains.temperature).range([mMinRadius, mMaxRadius]),
    luminosity: d3.scale.linear().domain(domainDomains.luminosity).range([mMinRadius, mMaxRadius])
  };

  var domainColorScales = {
    humidity: d3.scale.quantile().domain(domainDomains.humidity).range(domainColors.humidity),
    temperature: d3.scale.quantile().domain(domainDomains.temperature).range(domainColors.temperature),
    luminosity: d3.scale.quantile().domain(domainDomains.luminosity).range(domainColors.luminosity)
  };

  var angleScale = d3.scale.linear().domain([0, timeInterval]).range([0, 360]);

  var timeFormat = d3.time.format("%H:%M:%S");

  var timeFormatShort = d3.time.format("%S");

  var domainNodes = {};

  var mainDomain = 'humidity';

  // init
  function initGraph() {

    for ( var i = 0; i < domains.length; i++) {

      // define domain nodes
      domainNodes = {
        humidity: d3.select("#humidityChart"),
        temperature: d3.select("#temperatureChart"),
        luminosity: d3.select("#luminosityChart")
      };

      var domain = domains[i];

      domainNodes[domain].append('g').attr("id", "cv");

      var grid = domainNodes[domain].append('g').attr("id", "grid");

      var time = domainNodes[domain].append('g').attr("id", "ct");

      // Test whether it's the main domain that is currently graphed
      if (domain === mainDomain) {

        // Radial grid (value)
        var gr = grid.append("g").attr("class", "r axis").selectAll("g").data(domainRadiusScales[domain].ticks(5)).enter().append("g");

        gr.append("circle").attr("r", domainRadiusScales[domain]);

        gr.append("text").attr("y", function(d) {
          return -domainRadiusScales[domain](d) - 4;
        }).attr("transform", "rotate(15)").style("text-anchor", "middle").text(function(d) {
          return d;
        });

        // Angular grid (time)
        var ga = grid.append("g").attr("class", "a axis").selectAll("g").data(angleScale.ticks(12)).enter().append("g").attr("transform", function(d) {
          return "rotate(" + angleScale(d) + ")";
        });

        ga.append("line").attr("y1", -minRadius).attr("y2", -maxRadius);

        ga.append("text").attr("y", -(maxRadius + 6)).attr("dy", ".35em").style("text-anchor", function(d) {
          return angleScale(d) < 270 && angleScale(d) > 90 ? "end" : null;
        }).attr("transform", function(d) {
          return angleScale(d) < 270 && angleScale(d) > 90 ? "rotate(180 , 0 " + -(maxRadius + 6) + ")" : null;
        }).text(function(d) {
          return timeFormatShort(new Date(d));
        });

        // Current time
        time.append('circle').attr("r", 5).style('fill', 'rgb(51, 51, 51)');
        time.append('line').attr("y1", 0).attr("y2", -(maxRadius - 25)).style("stroke", "rgb(51, 51, 51)").style("stroke-width", 2);
        time.append('circle').attr("r", 25).attr("cy", -maxRadius).attr("cx", 0).style('fill', 'white').style('stroke', 'rgb(51, 51, 51)').style(
                "stroke-width", 2);
        time.append('text').attr("id", "ct-text").attr("y", -maxRadius).attr("dy", ".35em").style("text-anchor", "middle").style("font", "10px sans-serif")
                .style('fill', 'rgb(51, 51, 51)').text(timeFormat(d3.time.second.ceil($scope.currentTime)));

      } else {

        // Radial grid (value)
        var gr = grid.append("g").attr("class", "r axis");

        gr.append('g').append("circle").attr("r", mMaxRadius);

        gr.append('g').append("circle").attr("r", mMinRadius);

        // Current time
        time.append('circle').attr("r", 5).style('fill', 'rgb(51, 51, 51)');
        time.append('line').attr("y1", 0).attr("y2", -mMaxRadius).style("stroke", "rgb(51, 51, 51)").style("stroke-width", 1);

      }
    }
  }

  // update the graph
  function updateGraph() {

    for ( var i = 0; i < domains.length; i++) {

      var domain = domains[i];

      // Generates arc path, radius depend on value and angle on timestamp
      var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(function(d) {
        return domainRadiusScales[domain](d[domain]);
      }).startAngle(function(d, i) {
        if (i == 0) {
          return 0;
        } else {
          return -(deg2rad(angleScale(d.timestamp - $scope.dataset[(i - 1)].timestamp) / 2));
        }
      }).endAngle(function(d, i) {
        if (i == ($scope.dataset.length - 1)) {
          return 0;
        } else {
          return (deg2rad(angleScale($scope.dataset[(i + 1)].timestamp - d.timestamp) / 2));
        }
      });

      // graph current Time

      domainNodes[domain].select("#ct").transition().duration(500).attr("transform", function(d) {
        return "rotate(" + (angleScale(d3.time.second.ceil($scope.currentTime) % timeInterval)) + ")";
      });

      if (domain === mainDomain) {

        domainNodes[domain].select("#ct-text").text(timeFormat(d3.time.second.ceil($scope.currentTime))).transition().duration(500).attr("transform",
                function(d) {
                  return "rotate(" + -(angleScale(d3.time.second.ceil($scope.currentTime) % timeInterval)) + " 0 " + -maxRadius + ")";
                });
      }

      // graph current Values

      var g = domainNodes[domain].select("#cv").selectAll('g').data($scope.dataset, key);

      // New values

      var ng = g.enter().append("g").attr("transform", function(d) {
        return "rotate(" + (angleScale(d.timestamp % timeInterval)) + ")";
      });

      ng.append("path").transition().delay(1000).attr("d", function(d, i) {
        return arc(d, i);
      }).style('fill', function(d) {
        return domainColorScales[domain](d[domain]);
      });

      ng.append("circle").transition().delay(500).attr("r", 5).attr("cx", 0).attr("cy", function(d) {
        return -domainRadiusScales[domain](d[domain]);
      }).style('fill', function(d) {
        return domainColorScales[domain](d[domain]);
      }).style('stroke', 'white').style("stroke-width", 1);

      // update existing values

      g.select('path').transition().delay(1000).attr("d", function(d, i) {
        return arc(d, i);
      }).style('fill', function(d) {
        return domainColorScales[domain](d[domain]);
      });

      // remove values out of window time on graph

      g.exit().transition().duration(0).delay(500).remove();

    }
  }

  // remove data out of time scope and update graph for all domains
  function refresh() {
    for ( var i = 0; i < $scope.dataset.length; i++) {
      if ($scope.dataset[i].timestamp < (d3.time.second.ceil($scope.currentTime + 1000) - timeInterval)) {
        $scope.dataset.splice(i, 1);
      }
    }
    updateGraph();
  }

}

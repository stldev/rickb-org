(function () {
    "use strict";

    var _spPageContextInfo = {
        token: null
    };

     _spPageContextInfo.token = document.getElementById("__REQUESTDIGEST").value;
    //_spPageContextInfo.token = (document.getElementById("__REQUESTDIGEST") as HTMLInputElement).value;
    angular.module("DietDataApp", ["ui.router", "amChartsDirective"])
        .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/home");
        $stateProvider.
            state("home", {
            url: "/home",
            views: {
                header: {
                    template: "<home-header>loading...</home-header>"
                },
                content: {
                    template: "<home-dash>loading...</home-dash>"
                }
            }
        }).state("problem", {
            url: "/problem",
            views: {
                content: {
                    template: "<div>\n\t\t\t\t\t\t\t\t\t\t<p>Hmm... Looks like you ran into an issue.</p>\n\t\t\t\t\t\t\t\t\t\t<p><a ui-sref='home'>Back to the home page</a></p>\n\t\t\t\t\t\t\t\t\t</div>"
                }
            }
        });
    }).constant("DUMMY_DATA", [{
            "Title": "26.4",
            "DietDate": "2015-02-09T06:00:00Z",
            "DietNotes": null,
            "WhoIs": "Gunther",
            "value": 26.4,
            "date": "2015-02-09T06:00:00Z"
        }, {
            "Title": "186.2",
            "DietDate": "2015-02-13T06:00:00Z",
            "DietNotes": "Right before going down to the Lake for V day",
            "WhoIs": "Rick",
            "value": 186.2,
            "date": "2015-02-13T06:00:00Z"
        }, {
            "Title": "25.8",
            "DietDate": "2015-02-17T06:00:00Z",
            "DietNotes": null,
            "WhoIs": "Gunther",
            "value": 25.8,
            "date": "2015-02-17T06:00:00Z"
        }, {
            "Title": "191.6",
            "DietDate": "2015-02-17T06:00:00Z",
            "DietNotes": null,
            "WhoIs": "Rick",
            "value": 191.6,
            "date": "2015-02-17T06:00:00Z"
        }
    ]).constant("CHART_OPTIONS", {
        "type": "serial",
        "creditsPosition": "bottom-left",
        "theme": "dark",
        "marginRight": 30,
        "autoMarginOffset": 10,
        "dataDateFormat": "YYYY-MM-DD",
        "valueAxes": [{
                "axisAlpha": 0,
                "guides": [{
                        "fillAlpha": 0.1,
                        "fillColor": "#888888",
                        "lineAlpha": 0,
                        "toValue": 16,
                        "value": 10
                    }],
                "position": "left",
                "tickLength": 0
            }],
        "graphs": [{
                "balloonText": "[[category]]<br><b><span style='font-size:14px;'>value:[[value]]</span></b>",
                "bullet": "round",
                "dashLength": 3,
                "colorField": "color",
                "valueField": "value"
            }],
        "chartScrollbar": {
            "scrollbarHeight": 9,
            "offset": 33,
            "oppositeAxis": false,
            "backgroundAlpha": 0.1,
            "backgroundColor": "#888888",
            "selectedBackgroundColor": "#67b7dc",
            "selectedBackgroundAlpha": 1
        },
        "chartCursor": {
            "fullWidth": true,
            "valueLineEabled": true,
            "valueLineBalloonEnabled": true,
            "valueLineAlpha": 0.5,
            "cursorAlpha": 0
        },
        "categoryField": "date",
        "categoryAxis": {
            "parseDates": true,
            "axisAlpha": 0,
            "gridAlpha": 0.1,
            "minorGridAlpha": 0.1,
            "minorGridEnabled": true
        }
    }).service("DataService", function ($http, $q, $location, DUMMY_DATA) {
        var baseUrl = "/alexrick/_api/web/lists/GetByTitle('Diet1')/items";
        this.getData = function () {        

            return $http({
                method: "GET",
                url: baseUrl + "?$select=Title,WhoIs,DietNotes,DietDate&$top=5000",
                headers: {
                    "Accept": "application/json;odata=nometadata"
                }
            }).then(function (response) {
                return _.map(response.data.value, function (m) {
                    m.value = m.Title ? parseFloat(m.Title) : 0;
                    m.date = m.DietDate;
                    return m;
                });
            }).catch(function (error) {
                if ($location.host() === "localhost") {
                    return $q.resolve(DUMMY_DATA);
                }
                else {
                    return $q.reject(error);
                }
            });
        };
        this.setData = function (whoIs, weight) {
            var newItem = {};
            newItem["Title"] = weight;
            newItem["WhoIs"] = whoIs;
            newItem["DietDate"] = new Date().toISOString().split("T")[0] + "T12:00:00Z";
            ;
            return $http({
                method: "POST",
                url: "/alexrick/_api/web/lists/GetByTitle('Diet1')/items",
                data: angular.toJson(newItem),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json",
                    "X-RequestDigest": _spPageContextInfo.token
                }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return $q.reject(error);
            });
        };
    }).component("homeHeader", {
        controller: function () {
            var _this = this;
            this.loginUrl = "https://rickb.org/_forms/default.aspx?ReturnUrl=" +
                encodeURIComponent("/_layouts/15/Authenticate.aspx") +
                encodeURIComponent("?Source=/dev1/Pages/15/start.aspx");
            this.$onInit = function () {
                _this.userHasToken = _spPageContextInfo.systemUserKey ? true : false;
                if (_this.userHasToken) {
                    _this.userName = _spPageContextInfo.systemUserKey.substring(_spPageContextInfo.systemUserKey.lastIndexOf("|") + 1, _spPageContextInfo.systemUserKey.length);
                }
                else {
                    _this.userName = "Who are you?";
                }
            };
        },
        template: "<div style='float:left; width:50%;'>\n\t\t\t\t\t\t<a href='../' class='btn btn-primary' style='width:85%;'>Dev Lists</a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div style='float:left; width:50%;'>\n\t\t\t\t\t\t<a ng-hide='{{$ctrl.userHasToken}}' href='javascript:;' class='btn btn-danger' style='float:right; width:85%;'>{{$ctrl.userName}}</a>\n\t\t\t\t\t\t<a ng-show='{{$ctrl.userHasToken}}' href='javascript:;' class='btn btn-success' style='float:right; width:85%;'>Hi, {{$ctrl.userName}}</a>\n\t\t\t\t\t</div>\n\t\t\t\t\t<p style='clear:both;'>&nbsp;</p>"
    }).component("addNewWeight", {
        bindings: {
            whois: "@",
            savemsg: "="
        },
        controller: function (DataService) {
            var _this = this;
            this.availableOptions = [];
            this.btnGo = function () {
                _this.savemsg = "";
                DataService.setData(_this.whois, _this.selectedOption.weight).then(function (data) {
                    _this.savemsg = _this.whois + " item saved! (" + new Date().toLocaleString() + ")";
                }).catch(function (err) {
                    console.log("ERROR");
                    console.log(err);
                });
            };
            this.$onInit = function () {
                if (_this.whois === "Rick") {
                    _this.bgColor = "#3d3d3d";
                    for (var i = 175.0; i < 200.0; i += 0.2) {
                        _this.availableOptions.push({
                            weight: i.toFixed(1)
                        });
                    }
                }
                else {
                    _this.bgColor = "#3498db";
                    for (var ii = 23.0; ii < 29.0; ii += 0.2) {
                        _this.availableOptions.push({
                            weight: ii.toFixed(1)
                        });
                    }
                }
                _this.selectedOption = _this.availableOptions[parseInt((_this.availableOptions.length / 2).toFixed(0))];
            };
        },
        template: "<div>\n\t\t\t\t\t\t\t<h1 style=\"margin-top:0; width:10%; float:left; background-color: {{$ctrl.bgColor}}; text-align:center; border-radius:25px;\">\n\t\t\t\t\t\t\t\t{{$ctrl.whois.substring(0,1)}}\n\t\t\t\t\t\t\t</h1>\n\t\t\t\t\t\t\t<div style=\"width:5%; float:left;\">&nbsp;</div>\n\t\t\t\t\t\t\t<select style=\"width:40%; float:left;\" class=\"form-control\" ng-model=\"$ctrl.selectedOption\"\n\t\t\t\t\t\t\t\tng-options=\"option.weight for option in $ctrl.availableOptions\"></select>\n\t\t\t\t\t\t\t<div style=\"width:5%; float:left;\">&nbsp;</div>\n\t\t\t\t\t\t\t<button style=\"width:40%; float:left;\" class=\"btn btn-success\" type=\"button\" ng-click=\"$ctrl.btnGo()\">Add</button>\n\t\t\t\t\t\t\t<p style=\"height:1px; clear:both;\">&nbsp;</p>\n\t\t\t\t\t\t</div>"
    }).component("homeDash", {
        controller: function (CHART_OPTIONS, DataService, $scope, $timeout) {
            var _this = this;
            this.saveMessage = "";
            this.toggleCollapse = false;
            this.rickDataPoints = null;
            this.guntherDataPoints = null;
            this.$onInit = function () {
                _this.userHasToken = _spPageContextInfo.systemUserKey ? true : false;
                _this.chartOptionsRick = angular.copy(CHART_OPTIONS);
                _this.chartOptionsRick.data = [];
                _this.chartOptionsGunther = angular.copy(CHART_OPTIONS);
                _this.chartOptionsGunther.data = [];
                $scope.$watch("$ctrl.rickDataPoints", function (newValue) {
                    if (newValue) {
                        $scope.$broadcast("amCharts.updateData", newValue, "rickChart1");
                    }
                });
                $scope.$watch("$ctrl.guntherDataPoints", function (newValue) {
                    if (newValue) {
                        $scope.$broadcast("amCharts.updateData", newValue, "guntherChart1");
                    }
                });
                $scope.$watch("$ctrl.saveMessage", function (newValue) {
                    if (newValue) {
                        DataService.getData().then(function (data) {
                            _this.rickDataPoints = _.filter(data, ["WhoIs", "Rick"]);
                            _this.guntherDataPoints = _.filter(data, ["WhoIs", "Gunther"]);
                        }).catch(function (err) {
                            console.log("ERROR");
                            console.log(err);
                        });
                    }
                });

                // DataService.getData().then(function (data) {
                //     _this.rickDataPoints = _.filter(data, ["WhoIs", "Rick"]);
                //     _this.guntherDataPoints = _.filter(data, ["WhoIs", "Gunther"]);
                // }).catch(function (err) {
                //     console.log("ERROR");
                //     console.log(err);
                // });

                firebase.database().ref('/weight/items').on('value', snapshot => {                  
                    
                    $timeout(function(){ 
                        var data = _.map(snapshot.val(), function (m) {
                            m.value = m.weight ? m.weight : 0;
                            m.date = m.datetime;
                            return m;
                        });                      
    
                        _this.rickDataPoints = _.filter(data, ["user", "Rick"]);
                        _this.guntherDataPoints = _.filter(data, ["user", "Gunther"]);
                      });
                });
            };
        },
        template: "<div>\n\t\t\t\t\t\t\t<div ng-show='{{$ctrl.userHasToken}}' class=\"panel panel-success\">\n\t\t\t\t\t\t\t\t<div ng-click=\"$ctrl.toggleCollapse = !$ctrl.toggleCollapse\" class=\"panel-heading hand\">\n\t\t\t\t\t\t\t\t\t<h3 class=\"panel-title\">Do your input fun here!</h3>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div ng-class=\"{'collapse': $ctrl.toggleCollapse}\" class=\"panel-body\">\n\t\t\t\t\t\t\t\t\t<add-new-weight savemsg=\"$ctrl.saveMessage\" whois=\"Rick\"></add-new-weight>\n\t\t\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t\t\t<add-new-weight savemsg=\"$ctrl.saveMessage\" whois=\"Gunther\"></add-new-weight>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<p>{{$ctrl.saveMessage}}<p>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style=\"width:90%; float:left;\">\n\t\t\t\t\t\t\t\t<am-chart style=\"min-height:300px;\" id=\"rickChart1\" options=\"$ctrl.chartOptionsRick\"></am-chart>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style=\"width:10%; height:300px; float:left; background-color: #3d3d3d; text-align:center; border-radius: 25px;\">\n\t\t\t\t\t\t\t\t<h1><br />R<br />I<br />C<br />K</h1>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<p style=\"clear:both;\">&nbsp;</p>\n\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t<div style=\"width:90%; float:left;\">\n\t\t\t\t\t\t\t\t<am-chart style=\"min-height:300px;\" id=\"guntherChart1\" options=\"$ctrl.chartOptionsGunther\"></am-chart>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div style=\"width:10%; height:300px; float:left; background-color: #3498db; text-align:center; border-radius: 25px;\">\n\t\t\t\t\t\t\t\t<h2>G<br />U<br />N<br />T<br />H<br />E<br />R</h2>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t"
    });
})();

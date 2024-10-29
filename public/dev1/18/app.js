// create a custom field/column in a list
// https://rickb.org/dev1/_api/web/lists/GetByTitle('FhTennisList')/fields
// {
// 	"Title" : "MyFieldTitle555",
// 	"FieldTypeKind" : 9,
// 	"SchemaXml" : "<Field Type='Number' DisplayName='MyFieldTitle555' StaticName='MyFieldTitle555' Decimals='0' />"
// }
(function () {
    "use strict";

    var _spPageContextInfo = {
        token: null
    };

    angular.module("TennisSite", ["ngRoute", "angular-loading-bar", "ngAnimate", "ui.bootstrap"])
        .config(function ($routeProvider) {
        $routeProvider.
            when("/problem", {
            template: "<comp-problem-page>compProblemPage</comp-problem-page>"
        }).
            when("/players", {
            template: "<comp-players-page>compPlayersPage</comp-players-page>"
        }).
            when("/schedule", {
            template: "<comp-schedule-page>compSchedulePage</comp-schedule-page>"
        }).
            when("/media", {
            template: "<p>Should we collect some media type stuff here? hmm...</p>"
        }).
            otherwise({
            redirectTo: "/schedule"
        });
    });
    // ***** SHARED *****
    angular.module("TennisSite")
        .constant("SP_API_DATA", (function () {
        var spListPlayers = "FhTennisList";
        var spListSchedule = "FhTennisSchedule";
        var apiUrlBase = "/" + _spPageContextInfo.webTitle + "/_api/web/lists/";
        var apiMethod = "GetByTitle";
        var apiQueryOptsPlayers = "?$select=Id,UserId,Description,flag,IsActive&$orderby=UserId";
        var apiQueryOptsUserIds = "?$select=UserId,IsActive&$filter=IsActive eq 1";
        var apiQueryOptsSchedule = "?$orderby=MatchDate&$select=Id,MatchDate,Location,Temperature,GameType,";
        var SP_API_DATA = {
            headers: Object.freeze({ "Accept": "application/json;odata=nometadata" }),
            headersForSubmit: Object.freeze({
                "Accept": "application/json;odata=nometadata",
                "Content-Type": "application/json",
                "IF-MATCH": "*",
                "X-HTTP-Method": "MERGE",
                "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value
            }),
            urlPlayers: encodeURI(apiUrlBase + apiMethod + "('" + spListPlayers + "')/items" + apiQueryOptsPlayers),
            urlUserIdList: encodeURI(apiUrlBase + apiMethod + "('" + spListPlayers + "')/items" + apiQueryOptsUserIds),
            urlSchedule: encodeURI(apiUrlBase + apiMethod + "('" + spListSchedule + "')/items" + apiQueryOptsSchedule),
            urlSubmitScores: encodeURI(apiUrlBase + apiMethod + "('" + spListSchedule + "')/items"),
            urlSubmitStatus: encodeURI(apiUrlBase + apiMethod + "('" + spListPlayers + "')/items")
        };
        return Object.freeze(SP_API_DATA);
    })())
        .constant("SESSION", (function () {
        _spPageContextInfo.systemUserKey = _spPageContextInfo.systemUserKey || null;
        _spPageContextInfo.token = document.getElementById("__REQUESTDIGEST").value;
        return Object.freeze(_spPageContextInfo);
    })())
        .filter("filterActiveStatus", function () {
        return function (e, currentStatus) {
            if (currentStatus) {
                return _.filter(e, ["IsActive", true]);
            }
            else {
                return e;
            }
        };
    })
        .filter("filterFormatName", function () {
        return function (n) {
            return n[0].toUpperCase() + n.substring(1, n.length - 1) + " " + n[n.length - 1].toUpperCase() + ".";
        };
    });
    // ***** SERVICES *****
    angular.module("TennisSite")
        .service("svcErrors", function () {
        var _this = this;
        this.errors = [];
        this.addError = function (err) { return _this.errors.push(err); };
        this.getErrors = function () { return _this.errors; };
        this.removeError = function (i) { return _this.errors.splice(i, 1); };
        this.clearAllErrors = function () { return _this.errors = []; };
    })
        .service("svcData", function ($http, $q, SP_API_DATA, SESSION) {
        this.getPlayersData = function () {
            return $http({
                method: "GET",
                url: SP_API_DATA.urlPlayers,
                headers: SP_API_DATA.headers
            }).then(function (done) { return done.data; }).catch(function (error) { return $q.reject(error); });
        };
        this.getUserIdsList = function () {
            return $http({
                method: "GET",
                url: SP_API_DATA.urlUserIdList,
                headers: SP_API_DATA.headers
            }).then(function (done) { return done.data; }).catch(function (error) { return $q.reject(error); });
        };
        this.getScheduleData = function (userIds) {
            return $http({
                method: "GET",
                url: SP_API_DATA.urlSchedule + userIds,
                headers: SP_API_DATA.headers
            }).then(function (done) { return done.data; }).catch(function (error) { return $q.reject(error); });
        };
        this.setPlayerScores = function (itemId, changesObj) {
            return $http({
                method: "POST",
                url: SP_API_DATA.urlSubmitScores + "(" + itemId + ")",
                data: angular.toJson(changesObj),
                headers: SP_API_DATA.headersForSubmit
            }).then(function (done) { return done.data; }).catch(function (error) { return $q.reject(error); });
        };
        this.setPlayerStatus = function (itemId, changesObj) {
            return $http({
                method: "POST",
                url: SP_API_DATA.urlSubmitStatus + "(" + itemId + ")",
                data: angular.toJson(changesObj),
                headers: SP_API_DATA.headersForSubmit
            }).then(function (done) { return done.data; }).catch(function (error) { return $q.reject(error); });
        };
    });
    // ***** COMPONENTS *****
    angular.module("TennisSite")
        .component("compNav", {
        controller: function (SESSION, svcErrors) {
            var _this = this;
            this.$onInit = function () {
                _this.errors = svcErrors;
            };
        },
        template: "<div style=\"position:fixed; top:0; left:0; z-index:999;\" class=\"btn-group btn-group-justified\">\n\t\t\t\t\t\t\t<a href=\"#/players\" class=\"btn btn-info\">players</a>\n\t\t\t\t\t\t\t<a href=\"#/schedule\" class=\"btn btn-default\">schedule</a>\n\t\t\t\t\t\t\t<a href=\"#/media\" class=\"btn btn-warning\">media</a>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<p style=\"height:1px; clear:both;\">&nbsp;</p>\t\t\t\t\t\t\n\t\t\t\t\t\t<p style=\"margin-top:15px;\">&nbsp;</p>\n\t\t\t\t\t\t<ol>\n\t\t\t\t\t\t\t<li ng-style=\"{'display': 'inline'}\">&nbsp;</li>\n\t\t\t\t\t\t\t<li ng-style=\"{'display': 'inline'}\" ng-repeat=\"error in $ctrl.errors.getErrors()\">\n\t\t\t\t\t\t\t\t<p class=\"label label-danger\"><span class=\"errorCard\" ng-click=\"$ctrl.errors.removeError($index)\">X</span> {{error.name}}</p>\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t</ol>\n\t\t\t\t\t\t"
    })
        .component("compFooter", {
        controller: function (SESSION, svcErrors) {
            var _this = this;
            this.$onInit = function () {
                _this.errors = svcErrors;
                _this.userName = SESSION.systemUserKey;
                _this.loginUrl = "https://rickb.org/_forms/default.aspx?ReturnUrl=" +
                    encodeURIComponent("/_layouts/15/Authenticate.aspx") +
                    encodeURIComponent("?Source=/dev1/Pages/18/start.aspx");
            };
        },
        template: "<div id=\"Footer\">\n\t\t\t\t\t\t\t<div ng-show=\"$ctrl.userName\">\n\t\t\t\t\t\t\t\t<a style=\"padding:0 5px 0 5px;\" href=\"/dev1/_layouts/15/viewlsts.aspx\" class=\"btn btn-primary\">Lists</a> <span style=\"color:black;\">{{$ctrl.userName}}</span> - \n\t\t\t\t\t\t\t\t<a style=\"padding:0 5px 0 5px;\" ng-href=\"#/problem\" class=\"btn btn-danger\">Problems</a>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div ng-show=\"!$ctrl.userName\">\n\t\t\t\t\t\t\t\t<a style=\"padding:0 5px 0 5px;\" ng-href=\"#\" class=\"btn btn-primary\">home</a>\t- \n\t\t\t\t\t\t\t\t<a style=\"padding:0 5px 0 5px;\" ng-href=\"#/problem\" class=\"btn btn-danger\">Problems</a>\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\t\t\t\t\t\t\n\t\t\t\t\t\t"
    })
        .component("compProblemPage", {
        controller: function (svcErrors) {
            var _this = this;
            this.$onInit = function () {
                _this.errors = svcErrors;
            };
        },
        template: "<div>\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t<a href=\"javascript:;\" ng-click=\"$ctrl.errors.addError({name: 'My Error !!!'})\" class=\"btn btn-danger\">Add an error</a>\n\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t<a href=\"javascript:;\" ng-click=\"$ctrl.errors.clearAllErrors()\" class=\"btn btn-info\">CLEAR ALL ERRORS</a>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t"
    })
        .component("compPlayersPage", {
        controller: function (svcData, svcErrors, SESSION, $timeout) {
            var _this = this;
            var baseImgUrl = "./FhTennisImages/";
            this.activeFilter = true;
            this.$onInit = function () {
                _this.isAnonymousUser = SESSION.systemUserKey ? false : true;

                firebase.database().ref('/tennisSite').on('value', snapshot => {
                    var data = snapshot.val();
                   
                    
                    $timeout(function(){ 
                        _this.players = data.allUsers.map(function (e) {
                            e.profileImgUrl = baseImgUrl + e.UserId + ".png";
                            e.flagImgUrl = baseImgUrl + e.flag + ".png";
                            return e;
                        });
                      });
                });

                // svcData.getPlayersData().then(function (data) {
                //     _this.players = data.value.map(function (e) {
                //         e.profileImgUrl = baseImgUrl + e.UserId + ".png";
                //         e.flagImgUrl = baseImgUrl + e.flag + ".png";
                //         return e;
                //     });
                // }).catch(function (err) {
                //     svcErrors.addError({ name: "ERROR: " + err.statusText + " (" + err.status + ")" });
                // });
            };
        },
        template: "<div class=\"row\">\n\t\t\t\t\t\t\t<div style=\"text-align:center; font-size:22px;\" class=\"checkbox\">\n\t\t\t\t\t\t\t\t<label>\n\t\t\t\t\t\t\t\t\t<input style=\"width:25px; height:25px;\" ng-model=\"$ctrl.activeFilter\" type=\"checkbox\">&nbsp;&nbsp;&nbsp;&nbsp;Active Only\n\t\t\t\t\t\t\t\t</label>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<comp-player-card class=\"animate-repeat\" ng-repeat=\"player in $ctrl.players | filterActiveStatus : $ctrl.activeFilter\" player=\"player\"></comp-player-card>\n\t\t\t\t\t\t</div>"
    })
        .component("compPlayerCard", {
        require: {
            parent: "^compPlayersPage"
        },
        bindings: {
            player: "<"
        },
        controller: function (svcData, svcErrors, $route) {
            var _this = this;
            //this.$onInit = () => {};
            this.setActiveStatus = function (status) {
                svcData.setPlayerStatus(_this.player.Id, { IsActive: status }).then(function (data) {
                    _this.parent.shouldShowModal = false;
                    $route.reload();
                }).catch(function (err) {
                    svcErrors.addError({ name: "ERROR: " + err.statusText + " (" + err.status + ")" });
                });
            };
        },
        template: "<div class=\"col-xs-12 col-sm-6\">\n\t\t\t\t\t\t\t<div class=\"playerCardDiv\">\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<table style=\"width:100%;\">\n\t\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t\t<td style=\"width:100px;\"><img ng-src=\"{{$ctrl.player.profileImgUrl}}\" /></td>\n\t\t\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t\t\t<p>&nbsp;&nbsp; <img ng-src=\"{{$ctrl.player.flagImgUrl}}\" /> &nbsp;&nbsp; {{$ctrl.player.UserId | filterFormatName}} \n\t\t\t\t\t\t\t\t\t\t\t\t&nbsp;&nbsp; ( Active: &nbsp; <i style=\"color:green;\" class=\"fa fa-check-square-o fa-lg\" ng-show=\"$ctrl.player.IsActive\"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t<i class=\"fa fa-square-o fa-lg\" ng-hide=\"$ctrl.player.IsActive\"></i> ) &nbsp;&nbsp;\n\t\t\t\t\t\t\t\t\t\t\t\t<span ng-show=\"!$ctrl.parent.isAnonymousUser\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<a ng-show=\"!$ctrl.player.IsActive\" ng-click=\"$ctrl.setActiveStatus(true)\" style=\"padding:0 5px 0 5px;\" href=\"javascript:;\" class=\"btn btn-success\">Activate</a>\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t<a ng-show=\"$ctrl.player.IsActive\" ng-click=\"$ctrl.setActiveStatus(false)\" style=\"padding:0 5px 0 5px;\" href=\"javascript:;\" class=\"btn btn-danger\">Deactivate</a>\n\t\t\t\t\t\t\t\t\t\t\t\t</span>\t\t\n\t\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t\t\t<hr style=\"margin:5px;\" /> \n\t\t\t\t\t\t\t\t\t\t\t<p style=\"padding:5px 5px 5px 10px;\">{{$ctrl.player.Description}}</p>\n\t\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>"
    })
        .component("compSchedulePage", {
        controller: function (svcData, svcErrors, $sce, $timeout) {
            var _this = this;
            var colsToExclude = ["MatchDate", "Id", "ID", "Location", "Temperature", "GameType", "$$hashKey"];
            this.scheduleObj = {
                dataRows: null,
                totals: null
            };
            this.curSelectedDate = null;
            this.shouldShowModal = false;
            this.processData = function (data) {
                _this.scheduleObj.totals = _.map(Object.keys(data[0]), function (m) {
                    return { player: m, points: 0, highlightRow: false };
                }).filter(function (f) {
                    if (_.indexOf(colsToExclude, f.player) === -1) {
                        return true;
                    }
                });
                _this.scheduleObj.dataRows = _.map(data, function (m) {
                    _.each(_this.scheduleObj.totals, function (e) {
                        e.points += (m[e.player] > -1) ? (m[e.player] == 99) ? 0 : m[e.player] : 0;
                    });
                    return m;
                });
                _this.scheduleObj.totals[_.findIndex(_this.scheduleObj.totals, ["player", _.maxBy(_this.scheduleObj.totals, "points").player])].leader = true;

            };
            this.toggleHighlightRow = function (row) {
                _.each(_this.scheduleObj.totals, function (e) { e.highlightRow = false; });
                row.highlightRow = true;
            };
            this.openModal = function (dateData) {
                _this.shouldShowModal = true;
                _this.curSelectedDate = _.map(Object.keys(dateData), function (m) {
                    return { player: m };
                }).filter(function (f) {
                    if (_.indexOf(colsToExclude, f.player) === -1) {
                        return true;
                    }
                });
                _.each(_this.curSelectedDate, function (e) {
                    e.points = dateData[e.player];
                    e.matchDate = dateData.MatchDate;
                    e.listItemId = dateData.Id;
                });
            };
            this.getSchedule = function (activeUsers) {

                firebase.database().ref('/tennisSite').on('value', snapshot => {
                    var data = snapshot.val();                    
                    $timeout(function(){ 
                        _this.processData(data.stats);
                      });
                });

                // svcData.getScheduleData(activeUsers).then(function (data) {
                //     _this.processData(data.value);
                // }).catch(function (err) {
                //     svcErrors.addError({ name: "ERROR: " + err.statusText + " (" + err.status + ")" });
                // });
            };
            this.$onInit = function () {

                firebase.database().ref('/tennisSite').on('value', snapshot => {
                    var data = snapshot.val();
                    _this.getSchedule(_.map(data.userStatus, "UserId").join(","));
                });

                // svcData.getUserIdsList().then(function (data) {
                //     _this.getSchedule(_.map(data.value, "UserId").join(","));
                // }).catch(function (err) {
                //     svcErrors.addError({ name: "ERROR: " + err.statusText + " (" + err.status + ")" });
                // });
            };
        },
        template: "<div style=\"width:100%; overflow-x:auto;\">\n\t\t\t\t\t\t\t<table id=\"ScheduleTable\">\n\t\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t\t<th class=\"staticTableHeader\">Player</th>\n\t\t\t\t\t\t\t\t\t<th class=\"staticTableHeader\">Totals</th>\n\t\t\t\t\t\t\t\t\t<th class=\"animate-repeat\" ng-repeat=\"col in $ctrl.scheduleObj.dataRows\">\n\t\t\t\t\t\t\t\t\t\t<p style=\"text-align:center; padding:0; margin:0;\">\n\t\t\t\t\t\t\t\t\t\t\t<i class=\"fa fa-info-circle\" tooltip-placement=\"bottom\" uib-tooltip=\"Where: {{col.Location || '?'}} --- Temp: {{col.Temperature || '?'}}\"></i>\n\t\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t\t<div class=\"cursorPointer\" ng-click=\"$ctrl.openModal(col)\">\n\t\t\t\t\t\t\t\t\t\t\t<span style=\"font-size:x-small;\">{{col.MatchDate | date : 'yyyy'}}</span> <br />\n\t\t\t\t\t\t\t\t\t\t\t{{col.MatchDate | date : 'MMM dd'}}\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</th>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t\t<tr ng-click=\"$ctrl.toggleHighlightRow(row)\" ng-class=\"{'highlightRow' : row.highlightRow}\" class=\"animate-repeat\" ng-repeat=\"row in $ctrl.scheduleObj.totals\">\n\t\t\t\t\t\t\t\t\t<td style=\"text-align:right; cursor:pointer;\">\t\t\t\t\t\t\t\t \n\t\t\t\t\t\t\t\t\t\t{{row.player | filterFormatName}} &nbsp;&nbsp;\n\t\t\t\t\t\t\t\t\t\t<i title=\"Current leader\" ng-class=\"{'fa fa-trophy' : row.leader}\"></i> &nbsp;&nbsp;\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t\t<td>{{row.points}}</td>\n\t\t\t\t\t\t\t\t\t<td ng-repeat=\"col in $ctrl.scheduleObj.dataRows\">\n\t\t\t\t\t\t\t\t\t\t<i title=\"Unknown\" ng-class=\"{'fa fa-question-circle-o' : col[row.player] === null}\"></i>\n\t\t\t\t\t\t\t\t\t\t<i title=\"No show\" ng-class=\"{'fa fa-times' : col[row.player] === -1}\"></i>\n\t\t\t\t\t\t\t\t\t\t<i title=\"Planning to be there\" ng-class=\"{'fa fa-check' : col[row.player] === 99}\"></i>\n\t\t\t\t\t\t\t\t\t\t<span ng-show=\"col[row.player] > -1 && col[row.player] < 99\">{{col[row.player]}}</span>\n\t\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<comp-schedule-modal></comp-schedule-modal>\n\t\t\t\t\t\t"
    })
        .component("compScheduleModal", {
        require: {
            parent: "^compSchedulePage"
        },
        controller: function (svcData, svcErrors, SESSION, $route) {
            var _this = this;
            this.$onInit = function () {
                _this.isAnonymousUser = SESSION.systemUserKey ? false : true;
            };
            this.submitScores = function (scores) {
                var listItemChangesObj = {};
                _.each(scores, function (e) { listItemChangesObj[e.player] = e.points; });
                svcData.setPlayerScores(scores[0].listItemId, listItemChangesObj).then(function (data) {
                    _this.parent.shouldShowModal = false;
                    $route.reload();
                }).catch(function (err) {
                    svcErrors.addError({ name: "ERROR: " + err.statusText + " (" + err.status + ")" });
                });
            };
        },
        template: "<div class=\"modal\"  ng-class=\"{'showModal' : $ctrl.parent.shouldShowModal}\">\n\t\t\t\t\t\t\t<div class=\"modal-dialog\">\n\t\t\t\t\t\t\t\t<div class=\"modal-content\">\n\t\t\t\t\t\t\t\t\t<div class=\"modal-header\">\n\t\t\t\t\t\t\t\t\t\t<h4 class=\"modal-title\">{{$ctrl.parent.curSelectedDate[0].matchDate | date}}</h4>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"modal-body\">\n\t\t\t\t\t\t\t\t\t\t<form class=\"form-horizontal\">\n\t\t\t\t\t\t\t\t\t\t\t<fieldset>\n\t\t\t\t\t\t\t\t\t\t\t\t<div ng-repeat=\"player in $ctrl.parent.curSelectedDate\" class=\"form-group\">\t\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class=\"col-xs-4 col-xs-offset-4\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<label for=\"PlayerInputId{{$index}}\" class=\"control-label\">{{player.player | filterFormatName}}</label>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input min=\"-1\" max=\"99\" ng-model=\"player.points\" type=\"number\" class=\"form-control\" id=\"PlayerInputId{{$index}}\" placeholder=\"score\" />\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</fieldset>\n\t\t\t\t\t\t\t\t\t\t</form>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class=\"modal-footer\">\n\t\t\t\t\t\t\t\t\t\t<button type=\"button\" class=\"btn btn-default\" ng-click=\"$ctrl.parent.shouldShowModal = false\">Close</button>\n\t\t\t\t\t\t\t\t\t\t<button type=\"button\" ng-disabled=\"$ctrl.isAnonymousUser\" class=\"btn btn-primary\" ng-click=\"$ctrl.submitScores($ctrl.parent.curSelectedDate)\">Save</button>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>"
    });
})();

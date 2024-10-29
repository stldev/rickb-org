angular.module("rbbCryptoApp", [])
    .service("rbbData", function ($http, $q) {

        this.getNanopoolWorkers = function () {
            var account = "KEY_HERE";
            var apiNanopool = `https://eth.nanopool.org/api/v1/workers/${account}/0/50/id_ASC_all`;

            return $http.get(apiNanopool)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    return $q.reject(error);
                });
        };

        this.getNanopoolBalance = function () {
            var account = "KEY_HERE";
            var apiNanopool = `https://api.nanopool.org/v1/eth/balance/${account}`;

            return $http.get(apiNanopool)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    return $q.reject(error);
                });
        };

        this.getEthereumPrice = function () {

            var apiCoinMarketCap = "https://api.coinmarketcap.com/v1/ticker/ethereum/";

            return $http.get(apiCoinMarketCap)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    return $q.reject(error);
                });
        };

    })
    .component("rbbCryptoWorkers", {
        controller: function ($log, rbbData) {

            var _this = this;
            _this.workers = [];

            this.$onInit = function () {
                _this.getNanopoolWorkers();
            };

            this.getNanopoolWorkers = function () {
                rbbData.getNanopoolWorkers()
                    .then(function (data) {
                        _this.workers = processWorkers(data.data.workers);
                    })
                    .catch(function (err) {
                        $log.error(new Error(err.statusText || "Unknown Error"));
                    });
            };

            function processWorkers(workers) {

                var minutesWarning = 60;
                var minutesDanger = 120;

                try {
                    return workers
                        .map(function (worker) {
                            worker.danger = worker.last_share_minutes > minutesDanger ? true : false;
                            worker.warning = !worker.danger && worker.last_share_minutes > minutesWarning ? true : false;
                            worker.shareHours = (worker.last_share_minutes / 60).toFixed(1);
                            return worker;
                        });
                } catch (ex) {
                    $log.error(new Error(ex));
                    return [];
                }
            }

        },
        template: `<div class="card border-primary"> 
                    <div class="card-header">Rbb Workers</div>
                    <div style="padding:5px;">
                        <table class="table table-hover">
                            <thead>  
                                <tr class="table-info">
                                    <th>Name</th>
                                    <th>Offline?</th>
                                    <th>Hours</th>
                                </tr>
                            </thead>
                            <tbody>                        
                                <tr ng-repeat="worker in $ctrl.workers"
                                        ng-class="{'table-warning': worker.warning, 'table-danger':worker.danger}">
                                    <td>{{worker.id}}</td>
                                    <td>{{worker.last_share_is_old}}</td>
                                    <td>{{worker.shareHours}}</td>
                                </tr>
                            </tbody>
                        <table>
                    </div>
                </div>`
    })
    .component("rbbEthPrice", {
        controller: function ($log, rbbData) {

            var _this = this;
            _this.ethPrice = "";

            this.$onInit = function () {
                _this.getEthereumPrice();
            };

            this.getEthereumPrice = function () {
                rbbData.getEthereumPrice()
                    .then(function (data) {
                        var rawUsd = data[0].price_usd;
                        _this.ethPrice = parseFloat(rawUsd).toFixed(2);
                        _this.eth10Percent = (parseFloat(rawUsd) * .05).toFixed(1);
                    })
                    .catch(function (err) {
                        $log.error(new Error(err.statusText || "Unknown Error"));
                    });
            };

        },
        template: `<div class="card border-primary">
                    <div class="card-header">ETH Price</div>
                    <div style="padding:5px;">
                        <h2 style="text-align:center;" class="card-title">&#36;{{$ctrl.ethPrice}} x 5% = &#36;{{$ctrl.eth10Percent}}</h2>
                    </div>
                </div>`
    })
    .component("rbbEthBalance", {
        controller: function ($log, rbbData) {

            var _this = this;
            _this.nanopoolBalance = "";

            this.$onInit = function () {
                _this.getNanopoolBalance();
            };

            this.getNanopoolBalance = function () {
                rbbData.getNanopoolBalance()
                    .then(function (data) {
                        _this.lastModified = new Date();
                        var percent = data.data * 100;
                        _this.nanopoolBalance = percent.toFixed(2);
                    })
                    .catch(function (err) {
                        $log.error(new Error(err.statusText || "Unknown Error"));
                    });
            };

        },
        template: `<div class="card border-primary">
                    <div class="card-header">ETH Balance ({{$ctrl.lastModified | date:'medium'}})</div>
                    <div style="padding:5px;">
                        <h1 style="text-align:center; font-size:3rem;" class="card-title">{{$ctrl.nanopoolBalance}} %</h1>
                    </div>
                </div>`
    });
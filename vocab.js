!(function(){
    "use strict";

    let vocabUrl = "CHTN-Core-Vocabulary.json"
    let displayFields = [
        "Category",
        "Anatomic Site",
        "Subsite",
        "Diagnosis",
        "Diagnosis Modifier"
    ]

    let v = window.v = {}

    let app = angular.module("vocabularyFilter", [
        "datatables",
        "ngSanitize",
        "ui.select",
        "ui.router",
        "ui.codemirror"]);

    app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state("home", {
                url: "/",
                templateUrl: "templates/vocabulary-home.html"
            })
            .state("filters", {
                url: "/filters",
                controller: "VocabularyFilterController as vcf",
                templateUrl: "templates/vocabulary-filter.html"
            })
            .state("sql", {
                url: "/sql",
                templateUrl: "templates/vocabulary-sql.html",
                controller: "VocabularySQLController"
            })
            .state("requests", {
                url: "/requests",
                templateUrl: "templates/requests.html",
                controller: "RequestController"
            });
    }]);

    /**
     * Promises the JSON version of the CHTN Vocabulary
     */
    app.service("vjson", ["$q", "$http", function ($q, $http) {
        let cache = {};
        return function getvjson(version) {
            version = version || "1.1.0";
            if (cache[version]) {
                return $q.when(cache[version]);
            } else {
                // let url = "https://s3.amazonaws.com/chtn-files/v"+version+"/CHTN-Core-Vocabulary.json"
                let url = vocabUrl;
                return $http.get(url).then(function (response) {
                    cache[version] = response.data
                    return response.data;
                });
            }
        }
    }]);

    /**
     * Promises a set of cross-filter objects for the CHTN Vocabulary
     */
    app.service("vcf", ["$q", "$window", "vjson", function ($q, $window, vjson) {
        let d3 = $window.d3;
        let cfCache;
        return vjson().then(function (data) {
            if (cfCache) {
                return cfCache
            } else {
                v.raw = data;
                // Setup Crossfilters
                v.cf = crossfilter(data);
                v.all = v.cf.groupAll();
                v.d = {
                    byCategory: v.cf.dimension(function (d) { return d["Category"]; }),
                    byAnatomicSite: v.cf.dimension(function (d) { return d["Anatomic Site"]; }),
                    bySubsite: v.cf.dimension(function (d) { return d["Subsite"]; }),
                    byDiagnosis: v.cf.dimension(function (d) { return d["Diagnosis"]; }),
                    byDiagnosisModifier: v.cf.dimension(function (d) { return d["Diagnosis Modifier"]; }),
                };
                v.g = {
                    groupByCategory: v.d.byCategory.group(),
                    groupByAnatomicSite: v.d.byAnatomicSite.group(),
                    groupBySubsite: v.d.bySubsite.group(),
                    groupByDiagnosis: v.d.byDiagnosis.group(),
                    groupByDiagnosisModifier: v.d.byDiagnosisModifier.group(),
                };
                cfCache = {
                    cf: v.cf,
                    d: v.d,
                    g: v.g
                };
                return cfCache;
            }

        })
    }]);

    /**
     * Promises the cross-filtered set of the vocabulary.
     */
    app.service("vfp", ["$q", "vcf", function ($q, vcf) {
        let d;
        return function () {
            if (d) {
                return $q.when(d.d.byCategory.top(Infinity));
            } else {
                return vcf.then(function (data) {
                    d = data;
                    return data;
                }).then(function (data) {
                    return data.d.byCategory.top(Infinity);
                });
            }
        };
    }]);

    app.service("db", ["$window", function ($window) {
        return new $window.loki('db');
    }]);

    app.service("vloki", ["db", "vjson", "$window", function (db, vjson, $window) {
        let vocabulary = db.addCollection("vocabulary");
        vjson().then(function (data) {
            vocabulary.insert(data);
            $window.v = vocabulary;
        })
        return vocabulary;
    }]);

    app.service("rdb", ["db", "vjson", "$window", function (db, vjson, $window) {
        let rdb = db.addCollection("requests");

        let chance = $window.chance;
        let generateRequests = function generateRequests(n) {
            return vjson().then(function (v) {
                n = n || 100;
                for (let i = 0; i<n; i++) {
                    let vocabularyItem = chance.pickone(v)
                    rdb.insert({
                        description: chance.sentence({words: 6}),
                        investigator: chance.name(),
                        annotation: vocabularyItem
                    })
                }
                return rdb;
            })
        }

        rdb.generateRequests = generateRequests;

        return rdb;

    }]);

    app.service("rfp", ["rdb", "$q", function (rdb, $q) {
        return function () {
            return $q.when(rdb.find());
        }
    }]);

    app.service("sql", ["$window", function ($window) {
        return $window.SQL;
    }]);

    app.service("vsql", ["sql", "$http", function (sql, $http) {
        let db = new sql.Database();
        $http.get("CHTN-Core-Vocabulary.sql").then(function (results) {
            // db.exec(results.data);
            console.log("Skipping data load for now.");
        });
        return db;
    }]);

    app.controller("VocabularyFilterController", ["$scope", "vcf", "DTOptionsBuilder", "DTColumnBuilder", "vfp", "vloki", function ($scope, vcf, DTOptionsBuilder, DTColumnBuilder, vfp){
        vcf.then(function (data) {
            angular.extend($scope, data);
            return data;
        });
        $scope.tableInstance = {}
        $scope.tableOptions = DTOptionsBuilder.fromFnPromise(vfp).withPaginationType('full_numbers');
        $scope.columns = displayFields.map(function (field) {
            return DTColumnBuilder.newColumn(field).withTitle(field);
        });

        $scope.$on("chtnvs.changed", function (evt) {
            if (evt.targetScope.data.item) {
                evt.targetScope.dimension.filterExact(evt.targetScope.data.item);
            } else {
                evt.targetScope.dimension.filterAll();
            }
            evt.stopPropagation();
            $scope.tableInstance.changeData(vfp);
        });

    }]);

    app.controller("VocabularySQLController", ["$scope", "vsql", function ($scope, vsql) {
        $scope.editorOptions = {
            mode: "text/x-mysql",
            lineNumbers: true,
        }
        $scope.executeQuery = function (query) {
            console.log("Executing Query:", query);
            $scope.sql.results = vsql.exec(query)
            $scope.updateDatabaseInfo();
        }

        $scope.updateDatabaseInfo = function () {
            $scope.db = $scope.db || {};
            $scope.db.tables = vsql.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")[0].values.map(function (value) { return value[0];});
        }
    }]);

    app.controller("RequestController", ["$scope", "rdb", "rfp", "DTOptionsBuilder", "DTColumnBuilder", function ($scope, rdb, rfp, DTOptionsBuilder, DTColumnBuilder) {
        $scope.tableInstance = {}
        $scope.tableOptions = DTOptionsBuilder.fromFnPromise(rfp).withPaginationType('full_numbers');
        $scope.columns = [
            DTColumnBuilder.newColumn("investigator").withTitle("Investigator"),
            DTColumnBuilder.newColumn("description").withTitle("Description"),
            DTColumnBuilder.newColumn("annotation.Category").withTitle("Category")
        ]
        rdb.generateRequests(10).then(function() {
            $scope.tableInstance.changeData(rfp);
        });

        $scope.addRequest = addRequest;

        function addRequest(request) {
            rdb.insert(request);
            $scope.tableInstance.changeData(rfp);
        }

        function clearNewRequest() {
            $scope.newRequest = {};
        }
    }]);

    app.directive("chtnvs", function () {
        return {
            templateUrl: "templates/chtn-vocabulary-select.html",
            require: "ngModel",
            scope: {
                dimension: "=dimension",
                group: "=group",
                label: "@label"
            },
            link: function (scope, element, attrs, ngModel) {
                scope.notEmpty = function (value) {
                    return value.value !== 0;
                }
                scope.data = {};
                scope.$watch("data.item", function (newValue) {
                    if(ngModel.$viewValue !== newValue) {
                        ngModel.$setViewValue(newValue);
                    }
                })
            }
        };
    });

    app.directive("chtnvb", ["vcf", function (vcf) {
        return {
            templateUrl: "templates/chtn-vocabulary-builder.html",
            require: "ngModel",
            scope: {},
            link: function (scope, element, attrs, ngModel) {
                ngModel.$render = function () { console.log("chtnvb ngModel Rendered")};

                scope.value={}

                vcf.then(function (data) {
                    angular.extend(scope, data);
                });

                scope.$on("chtnvs.changed", function (evt) {
                    if (evt.targetScope.data.item) {
                        evt.targetScope.dimension.filterExact(evt.targetScope.data.item);
                    } else {
                        evt.targetScope.dimension.filterAll();
                    }
                    scope.$evalAsync(updateModel);
                    evt.stopPropagation();
                });

                function updateModel() {
                    ngModel.$setViewValue(scope.value);
                }
            }
        };
    }]);

})();

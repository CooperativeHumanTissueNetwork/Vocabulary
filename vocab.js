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
            });
    }]);

    app.service("vcf", ["$q", "$window", function ($q, $window) {
        let d3 = $window.d3;
        //return function () {
            let defer = $q.defer();
            // Load the Datas
            d3.json(vocabUrl, function (err, data) {
                if (err) {
                    defer.fail(err);
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
                    defer.resolve({
                        cf: v.cf,
                        d: v.d,
                        g: v.g
                    });
                }
            });
            return defer.promise;
        //};
    }]);

    /* Returns the filtered set of all data as a promise. */
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

    app.controller("VocabularyFilterController", ["$scope", "vcf", "DTOptionsBuilder", "DTColumnBuilder", "vfp", function ($scope, vcf, DTOptionsBuilder, DTColumnBuilder, vfp){
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
        }
    }]);

    app.directive("chtnvs", function () {
        return {
            templateUrl: "templates/chtn-vocabulary-select.html",
            scope: {
                dimension: "=dimension",
                group: "=group",
                label: "@label"
            },
            link: function (scope) {
                scope.notEmpty = function (value) {
                    return value.value !== 0;
                }
                scope.data = {};
            }
        };
    });

})();
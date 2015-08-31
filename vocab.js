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

    let app = angular.module("vocabularyFilter", ["datatables", "ngSanitize", "ui.select"]);

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

    app.controller("VocabularFilterController", ["$scope", "vcf", function ($scope, vcf){
        vcf.then(function (data) {
            angular.extend($scope, data);
        });
    }]);

    app.directive("chtnvs", function () {
        return {
            templateUrl: "templates/chtnVocabularySelect.html",
            scope: {
                dimension: "=dimension",
                group: "=group",
                label: "@label"
            }
        };
    });

})();
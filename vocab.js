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

    d3.json(vocabUrl, function (err, data) {

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

        $(".vocab-table").DataTable({
            data: v.d.byCategory.top(Infinity),
            columns: displayFields.map(function (field) {
                return {
                    data: field,
                    title: field
                }
            })
        });

    });

})();
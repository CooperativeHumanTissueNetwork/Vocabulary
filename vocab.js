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

    class vocabularySelect {
        constructor(selector, dimension, group) {
            this.$el = $(selector);
            this.d = dimension;
            this.g = group;
            this.loadOptions();
        }

        selectItemMap(item) {
            return {
                id: item.key,
                text: item.key
            };
        }

        loadOptions() {
            this.$el.select2({
                data: this.g.all().map(this.selectItemMap)
            })
        }

        refresh() {
            this.$el.empty();
            this.loadOptions();
        }
    }


    // Load the Datas
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

        v.initalizeSelects();

    });

    v.initalizeSelects = function () {
        let categorySelect = new vocabularySelect("#category", v.d.byCategory, v.g.groupByCategory);
        let anatomicSiteSelect = new vocabularySelect("#anatomicSite", v.d.byAnatomicSite, v.g.groupByAnatomicSite);
        let subsiteSelect = new vocabularySelect("#subsite", v.d.bySubsite, v.g.groupBySubsite);
        let diagnosisSelect = new vocabularySelect("#diagnosis", v.d.byDiagnosis, v.g.groupByDiagnosis);
        let diagnosisModifierSelect = new vocabularySelect("#diagnosisModifier", v.d.byDiagnosisModifier, v.g.groupByDiagnosisModifier);
    };

})();
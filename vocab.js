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

    class VocabularySelect {
        constructor (selector, dimension, group) {
            this.$el = $(selector);
            this.d = dimension;
            this.g = group;
            this.loadOptions();
        }

        selectItemMap (item) {
            return {
                id: item.key,
                text: item.key
            };
        }

        loadOptions () {
            this.$el.val(this.val).select2({
                data: this.g.all().map(this.selectItemMap)
            })
        }

        refresh () {
            this.val = this.$el.val();
            this.d.filterExact(this.val);
            this.$el.empty();
            this.loadOptions();
        }

        addListener (evt, listener) {
            this.$el.on(evt, listener)
        }

        get $() {
            return this.$el;
        }
    }

    class VocabularyTable {
        constructor (selector, dimension){
            this.$el = $(selector);
            this.d = dimension;
            this.refresh();
        }

        refresh () {
            this.$el.DataTable({
                data: this.d.top(Infinity),
                columns: displayFields.map(function (field) {
                    return {
                        data: field,
                        title: field
                    }
                }),
                destroy: true
            });
        }

        addListener () {}
    }

    class VocabularyFilterUpdater {
        constructor (elements) {
            let that = this;
            this.elements = elements;
            this.elements.forEach(function (element) {
                element.addListener("change", that.refresh.bind(that));
            });
        }

        refresh () {
            this.elements.forEach(function (element) {
                element.refresh();
            });
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

        let vocabularyTable = new VocabularyTable(".vocab-table", v.d.byCategory);
        let categorySelect = new VocabularySelect("#category", v.d.byCategory, v.g.groupByCategory);
        let anatomicSiteSelect = new VocabularySelect("#anatomicSite", v.d.byAnatomicSite, v.g.groupByAnatomicSite);
        let subsiteSelect = new VocabularySelect("#subsite", v.d.bySubsite, v.g.groupBySubsite);
        let diagnosisSelect = new VocabularySelect("#diagnosis", v.d.byDiagnosis, v.g.groupByDiagnosis);
        let diagnosisModifierSelect = new VocabularySelect("#diagnosisModifier", v.d.byDiagnosisModifier, v.g.groupByDiagnosisModifier);

        v.vfu = new VocabularyFilterUpdater([
            vocabularyTable,
            categorySelect,
            anatomicSiteSelect,
            subsiteSelect,
            diagnosisSelect,
            diagnosisModifierSelect
        ]);

    });

})();
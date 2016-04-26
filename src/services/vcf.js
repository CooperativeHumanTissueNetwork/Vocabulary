/**
 * Promises a set of cross-filter objects for the CHTN Vocabulary
 */
module.exports = ["$q", "$window", "vjson", function ($q, $window, vjson) {
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
}]

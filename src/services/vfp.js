/**
 * Promises the cross-filtered set of the vocabulary.
 */
module.exports = ["$q", "vcf", function ($q, vcf) {
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
}]

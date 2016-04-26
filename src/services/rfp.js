module.exports = ["rdb", "$q", function (rdb, $q) {
    return function () {
        return $q.when(rdb.find());
    }
}]

module.exports = ["db", "vjson", "$window", function (db, vjson, $window) {
    let vocabulary = db.addCollection("vocabulary");
    vjson().then(function (data) {
        vocabulary.insert(data);
        $window.v = vocabulary;
    })
    return vocabulary;
}]

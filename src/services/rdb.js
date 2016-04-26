module.exports = ["db", "vjson", "$window", function (db, vjson, $window) {
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

}]

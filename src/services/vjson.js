/**
 * Promises the JSON version of the CHTN Vocabulary
 */
module.exports = ["vSettings", "$q", "$http", function (vSettings, $q, $http) {
    let cache = {};
    return function getvjson(version) {
        version = version || "1.1.0";
        if (cache[version]) {
            return $q.when(cache[version]);
        } else {
            // let url = "https://s3.amazonaws.com/chtn-files/v"+version+"/CHTN-Core-Vocabulary.json"
            let url = vSettings.vocabUrl;
            return $http.get(url).then(function (response) {
                cache[version] = response.data
                return response.data;
            });
        }
    }
}]

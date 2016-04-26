module.exports = ["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state("home", {
            url: "/",
            templateUrl: "templates/vocabulary-home.html"
        })
        .state("filters", {
            url: "/filters",
            controller: require("./controllers/vocabularyFilterController"),
            templateUrl: "templates/vocabulary-filter.html"
        })
        .state("requests", {
            url: "/requests",
            templateUrl: "templates/requests.html",
            controller: require("./controllers/requestController")
        });
}];

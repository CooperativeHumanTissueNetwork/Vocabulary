module.exports = ["$scope", "rdb", "rfp", "DTOptionsBuilder", "DTColumnBuilder", function ($scope, rdb, rfp, DTOptionsBuilder, DTColumnBuilder) {
    $scope.hideRequestForm = true; // Initially hide the request form
    $scope.tableInstance = {}
    $scope.tableOptions = DTOptionsBuilder.fromFnPromise(rfp).withPaginationType('full_numbers');
    $scope.columns = [
        DTColumnBuilder.newColumn("investigator").withTitle("Investigator").withOption("defaultContent", "-"),
        DTColumnBuilder.newColumn("description").withTitle("Description").withOption("defaultContent", "-"),
        DTColumnBuilder.newColumn("annotation.Category").withTitle("Category").withOption("defaultContent", "-")
    ]
    rdb.generateRequests(10).then(function() {
        $scope.tableInstance.changeData(rfp);
    });

    $scope.addRequest = addRequest;

    function addRequest(request) {
        rdb.insert(request);
        $scope.tableInstance.changeData(rfp);
    }

    function clearNewRequest() {
        $scope.newRequest = {};
    }
}]

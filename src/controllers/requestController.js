module.exports = ["$scope", "rdb", "rfp", "DTOptionsBuilder", "DTColumnBuilder", function ($scope, rdb, rfp, DTOptionsBuilder, DTColumnBuilder) {
    $scope.tableInstance = {}
    $scope.tableOptions = DTOptionsBuilder.fromFnPromise(rfp).withPaginationType('full_numbers');
    $scope.columns = [
        DTColumnBuilder.newColumn("investigator").withTitle("Investigator"),
        DTColumnBuilder.newColumn("description").withTitle("Description"),
        DTColumnBuilder.newColumn("annotation.Category").withTitle("Category")
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

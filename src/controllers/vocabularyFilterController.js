module.exports = [
    "$scope", "vcf", "DTOptionsBuilder", "DTColumnBuilder", "vfp", "vloki", function ($scope, vcf, DTOptionsBuilder, DTColumnBuilder, vfp){
    vcf.then(function (data) {
        angular.extend($scope, data);
        return data;
    });
    $scope.tableInstance = {}
    $scope.tableOptions = DTOptionsBuilder.fromFnPromise(vfp).withPaginationType('full_numbers');
    $scope.columns = displayFields.map(function (field) {
        return DTColumnBuilder.newColumn(field).withTitle(field);
    });

    $scope.$on("chtnvs.changed", function (evt) {
        if (evt.targetScope.data.item) {
            evt.targetScope.dimension.filterExact(evt.targetScope.data.item);
        } else {
            evt.targetScope.dimension.filterAll();
        }
        evt.stopPropagation();
        $scope.tableInstance.changeData(vfp);
    });

}]

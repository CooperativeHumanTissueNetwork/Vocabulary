module.exports = ["vcf", function (vcf) {
    return {
        templateUrl: "templates/chtn-vocabulary-builder.html",
        require: "ngModel",
        scope: {},
        link: function (scope, element, attrs, ngModel) {

            scope.value={}

            vcf.then(function (data) {
                angular.extend(scope, data);
            });

            scope.$on("chtnvs.changed", function (evt) {
                if (evt.targetScope.data.item) {
                    evt.targetScope.dimension.filterExact(evt.targetScope.data.item);
                } else {
                    evt.targetScope.dimension.filterAll();
                }
                scope.$evalAsync(updateModel);
                evt.stopPropagation();
            });

            function updateModel() {
                ngModel.$setViewValue(scope.value);
            }
        }
    };
}]

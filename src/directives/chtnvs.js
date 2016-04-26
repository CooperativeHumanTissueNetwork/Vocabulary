module.exports = function () {
    return {
        templateUrl: "templates/chtn-vocabulary-select.html",
        require: "ngModel",
        scope: {
            dimension: "=dimension",
            group: "=group",
            label: "@label"
        },
        link: function (scope, element, attrs, ngModel) {
            scope.notEmpty = function (value) {
                return value.value !== 0;
            }
            scope.data = {};
            scope.$watch("data.item", function (newValue) {
                if(ngModel.$viewValue !== newValue) {
                    ngModel.$setViewValue(newValue);
                }
            })
        }
    };
}

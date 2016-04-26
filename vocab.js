/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	!function () {
	    "use strict";

	    var app = angular.module("vocabularyFilter", ["datatables", "ngSanitize", "ui.select", "ui.router", "ui.codemirror", "ui.bootstrap"]);

	    var vocabUrl = "CHTN-Core-Vocabulary.json";
	    var displayFields = ["Category", "Anatomic Site", "Subsite", "Diagnosis", "Diagnosis Modifier"];
	    app.value("vSettings", {
	        vocabUrl: vocabUrl,
	        displayFields: displayFields
	    });

	    var v = window.v = {};

	    app.config(__webpack_require__(2));

	    var services = ["vjson", "vcf", "vfp", "db", "vdb", "rdb", "rfp"];
	    services.forEach(function (service) {
	        app.service(service, __webpack_require__(5)("./" + service + ".js"));
	    });

	    var directives = ["chtnvs", "chtnvb"];
	    directives.forEach(function (directive) {
	        app.directive(directive, __webpack_require__(13)("./" + directive + ".js"));
	    });
	}();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = ["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
	    $urlRouterProvider.otherwise("/");
	    $stateProvider.state("home", {
	        url: "/",
	        templateUrl: "templates/vocabulary-home.html"
	    }).state("filters", {
	        url: "/filters",
	        controller: __webpack_require__(3),
	        templateUrl: "templates/vocabulary-filter.html"
	    }).state("requests", {
	        url: "/requests",
	        templateUrl: "templates/requests.html",
	        controller: __webpack_require__(4)
	    });
	}];

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["$scope", "vcf", "DTOptionsBuilder", "DTColumnBuilder", "vfp", "vdb", "vSettings", function ($scope, vcf, DTOptionsBuilder, DTColumnBuilder, vfp, vdb, vSettings) {
	    vcf.then(function (data) {
	        angular.extend($scope, data);
	        return data;
	    });
	    $scope.tableInstance = {};
	    $scope.tableOptions = DTOptionsBuilder.fromFnPromise(vfp).withPaginationType('full_numbers');
	    $scope.columns = vSettings.displayFields.map(function (field) {
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
	}];

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["$scope", "rdb", "rfp", "DTOptionsBuilder", "DTColumnBuilder", function ($scope, rdb, rfp, DTOptionsBuilder, DTColumnBuilder) {
	    $scope.hideRequestForm = true; // Initially hide the request form
	    $scope.tableInstance = {};
	    $scope.tableOptions = DTOptionsBuilder.fromFnPromise(rfp).withPaginationType('full_numbers');
	    $scope.columns = [DTColumnBuilder.newColumn("investigator").withTitle("Investigator").withOption("defaultContent", "-"), DTColumnBuilder.newColumn("description").withTitle("Description").withOption("defaultContent", "-"), DTColumnBuilder.newColumn("annotation.Category").withTitle("Category").withOption("defaultContent", "-")];
	    rdb.generateRequests(10).then(function () {
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
	}];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./db.js": 6,
		"./rdb.js": 7,
		"./rfp.js": 8,
		"./vcf.js": 9,
		"./vdb.js": 10,
		"./vfp.js": 11,
		"./vjson.js": 12
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 5;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Wrapper for Loki DB
	 */
	module.exports = ["$window", function ($window) {
	  return new $window.loki('db');
	}];

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["db", "vjson", "$window", function (db, vjson, $window) {
	    var rdb = db.addCollection("requests");

	    var chance = $window.chance;
	    var generateRequests = function generateRequests(n) {
	        return vjson().then(function (v) {
	            n = n || 100;
	            for (var i = 0; i < n; i++) {
	                var vocabularyItem = chance.pickone(v);
	                rdb.insert({
	                    description: chance.sentence({ words: 6 }),
	                    investigator: chance.name(),
	                    annotation: vocabularyItem
	                });
	            }
	            return rdb;
	        });
	    };

	    rdb.generateRequests = generateRequests;

	    return rdb;
	}];

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["rdb", "$q", function (rdb, $q) {
	    return function () {
	        return $q.when(rdb.find());
	    };
	}];

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Promises a set of cross-filter objects for the CHTN Vocabulary
	 */
	module.exports = ["$q", "$window", "vjson", function ($q, $window, vjson) {
	    var d3 = $window.d3;
	    var cfCache = void 0;
	    return vjson().then(function (data) {
	        if (cfCache) {
	            return cfCache;
	        } else {
	            v.raw = data;
	            // Setup Crossfilters
	            v.cf = crossfilter(data);
	            v.all = v.cf.groupAll();
	            v.d = {
	                byCategory: v.cf.dimension(function (d) {
	                    return d["Category"];
	                }),
	                byAnatomicSite: v.cf.dimension(function (d) {
	                    return d["Anatomic Site"];
	                }),
	                bySubsite: v.cf.dimension(function (d) {
	                    return d["Subsite"];
	                }),
	                byDiagnosis: v.cf.dimension(function (d) {
	                    return d["Diagnosis"];
	                }),
	                byDiagnosisModifier: v.cf.dimension(function (d) {
	                    return d["Diagnosis Modifier"];
	                })
	            };
	            v.g = {
	                groupByCategory: v.d.byCategory.group(),
	                groupByAnatomicSite: v.d.byAnatomicSite.group(),
	                groupBySubsite: v.d.bySubsite.group(),
	                groupByDiagnosis: v.d.byDiagnosis.group(),
	                groupByDiagnosisModifier: v.d.byDiagnosisModifier.group()
	            };
	            cfCache = {
	                cf: v.cf,
	                d: v.d,
	                g: v.g
	            };
	            return cfCache;
	        }
	    });
	}];

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["db", "vjson", "$window", function (db, vjson, $window) {
	    var vocabulary = db.addCollection("vocabulary");
	    vjson().then(function (data) {
	        vocabulary.insert(data);
	        $window.v = vocabulary;
	    });
	    return vocabulary;
	}];

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Promises the cross-filtered set of the vocabulary.
	 */
	module.exports = ["$q", "vcf", function ($q, vcf) {
	    var d = void 0;
	    return function () {
	        if (d) {
	            return $q.when(d.d.byCategory.top(Infinity));
	        } else {
	            return vcf.then(function (data) {
	                d = data;
	                return data;
	            }).then(function (data) {
	                return data.d.byCategory.top(Infinity);
	            });
	        }
	    };
	}];

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Promises the JSON version of the CHTN Vocabulary
	 */
	module.exports = ["vSettings", "$q", "$http", function (vSettings, $q, $http) {
	    var cache = {};
	    return function getvjson(version) {
	        version = version || "1.1.0";
	        if (cache[version]) {
	            return $q.when(cache[version]);
	        } else {
	            // let url = "https://s3.amazonaws.com/chtn-files/v"+version+"/CHTN-Core-Vocabulary.json"
	            var url = vSettings.vocabUrl;
	            return $http.get(url).then(function (response) {
	                cache[version] = response.data;
	                return response.data;
	            });
	        }
	    };
	}];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./chtnvb.js": 14,
		"./chtnvs.js": 15
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 13;


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	module.exports = ["vcf", function (vcf) {
	    return {
	        templateUrl: "templates/chtn-vocabulary-builder.html",
	        require: "ngModel",
	        scope: {},
	        link: function link(scope, element, attrs, ngModel) {

	            scope.value = {};

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
	            });

	            function updateModel() {
	                ngModel.$setViewValue(scope.value);
	            }
	        }
	    };
	}];

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function () {
	    return {
	        templateUrl: "templates/chtn-vocabulary-select.html",
	        require: "ngModel",
	        scope: {
	            dimension: "=dimension",
	            group: "=group",
	            label: "@label"
	        },
	        link: function link(scope, element, attrs, ngModel) {
	            scope.notEmpty = function (value) {
	                return value.value !== 0;
	            };
	            scope.data = {};
	            scope.$watch("data.item", function (newValue) {
	                if (ngModel.$viewValue !== newValue) {
	                    ngModel.$setViewValue(newValue);
	                }
	            });
	        }
	    };
	};

/***/ }
/******/ ]);
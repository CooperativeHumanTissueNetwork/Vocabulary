!(function(){
    "use strict";

    let app = angular.module("vocabularyFilter", [
        "datatables",
        "ngSanitize",
        "ui.select",
        "ui.router",
        "ui.codemirror"]);


    let vocabUrl = "CHTN-Core-Vocabulary.json"
    let displayFields = [
        "Category",
        "Anatomic Site",
        "Subsite",
        "Diagnosis",
        "Diagnosis Modifier"
    ]
    app.value("vSettings", {
        vocabUrl,
        displayFields,
    });

    let v = window.v = {}

    app.config(require("./routes"));

    let services = [
        "vjson",
        "vcf",
        "vfp",
        "db",
        "vloki",
        "rdb",
        "rfp",
    ]
    services.forEach((service) => {
        app.service(service, require(`./services/${service}.js`));
    });

    let directives = [
        "chtnvs",
        "chtnvb"
    ]
    directives.forEach((directive) => {
        app.directive(directive, require(`./directives/${directive}.js`));
    });

})();

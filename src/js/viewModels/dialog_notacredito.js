/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

// pedidos page viewModel
'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojprogress'],
function(oj, ko, $, app) {
    function dialogModel(data) {
        var self = this;
        self.isLoading = ko.observable();
        self.conceptos = ko.observableArray();
        self.handleOkClose = function() {
            document.querySelector("#dialog-notacredito").close();
            self.isLoading(true);
            self.body("");
        };
        self.beforeOpen = function() {
            var params = data.paramsDialog();
            self.isLoading(params.isLoading);
            self.conceptos(params.conceptosData);
            self.title(params.dialog.title);
            self.body(params.dialog.body);
        }



        self.timbra = function() {
            $.ajax({
                method: "POST",
                url: "https://198.100.45.73/servicesFacturador/factura.php",
                data: data,
                success: function(response) {
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/factura.php",
                        data: params.dialog.data,
                        success: function(data) {
                            resolve(data);
                            resetValues();
                            self.selectedFactura['tipo'] = data.tipo;
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve("No se pudo timbrar");
                        }
                    });
                }
            });
        }
    self.body = ko.observable("");
    self.title = ko.observable("");

}
return dialogModel;
});
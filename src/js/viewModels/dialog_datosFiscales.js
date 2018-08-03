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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController',  'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojprogress'],
    function(oj, ko, $, app) {
        function dialogModel($promise) {
            var self = this;
            self.isLoading = ko.observable(true);  
            self.handleOkClose = function() {
                document.querySelector("#dialog-timbre").close();
            };
            self.beforeOpen = function() {
                $promise().then((message) => {
                    self.message(message);
                    self.isLoading(false);
                });
            }
            self.message = ko.observable("Se está procesando el timbrado...");

        }
        return dialogModel;
    });
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
            self.handleOkClose = function() {
                document.querySelector("#dialog-timbre").close();
                self.isLoading(true);
                self.body("");
            };
            self.beforeOpen = function() {
                var params = data.paramsDialog();
                self.isLoading(params.isLoading);
                self.title(params.dialog.title);
                self.title(params.dialog.title);
                self.body(params.dialog.body);
                if (params.promise) {
                    params.promise().then((message) => {
                        self.body(message);
                        self.isLoading(false);
                    });
                }
            }
            self.body = ko.observable("");
            self.title = ko.observable("");

        }
        return dialogModel;
    });
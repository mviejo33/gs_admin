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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function reportesViewModel() {
            var self = this;

            self.handleAttached = function() {
                var userLogin = localStorage.getItem("userLogged");
                var privilegeData = app.verifyPermissions();
                self.listViews = privilegeData.reportes.buttonSet;
                if (userLogin == undefined || userLogin == "" || userLogin == null) {
                    app.unauthorized(true);
                }
            }



            self.listViews = undefined;

            self.activelistView = ko.observable("ultimaslecturas");

            self.handleListViewOptionChange = function(event, ui) {
                var value = ui.value;
                switch (value) {
                    case 'ultimaslecturas':
                        self.activelistView("ultimaslecturas");
                        break;
                    case 'valvulas':
                        self.activelistView("valvulas");
                        break;
                    case 'documentos':
                        self.activelistView("docs");
                        break;
                    default:
                }
            }



            self.handleBindingsApplied = function() {
                var ui = { "value": self.activelistView() };
                self.handleListViewOptionChange(null, ui);
            }


        }
        return reportesViewModel;
    });
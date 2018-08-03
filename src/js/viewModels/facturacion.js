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
        function facturacionViewModel() {
            var self = this;

            self.handleAttached = function() {
                var userLogin = localStorage.getItem("userLogged");
                var privilegeData = app.verifyPermissions();
                self.listViews = privilegeData.facturacion.buttonSet;
                if (userLogin == undefined || userLogin == "" || userLogin == null) {
                    app.unauthorized(true);
                }
            }

            self.handleBindingsApplied = function() {
                var ui = { "value": self.activelistView() };
                self.handleListViewOptionChange(null, ui);
            }

            self.listViews = undefined;

            self.activelistView = ko.observable("contado");

            self.handleListViewOptionChange = function(event, ui) {
                var value = ui.value;
                switch (value) {
                    case 'solicitudes':
                        self.activelistView("solicitudes");
                        break;
                    case 'contado':
                        self.activelistView("contado");
                        break;
                    case 'credito':
                        self.activelistView("credito");
                        break;
                    case 'vales':
                        self.activelistView("vales");
                        break;
                    case 'activos':
                        self.activelistView("activos");
                        break;
                    case 'publicogeneral':
                        self.activelistView("publicogeneral");
                        break;
                    case 'notacredito':
                        self.activelistView("notacredito");
                        break;
                    case 'fletes':
                        self.activelistView("fletes");
                        break;
                    case 'historial':
                        self.activelistView("historial");
                        break;
                    default:
                }
            }


        }
        return facturacionViewModel;
    });
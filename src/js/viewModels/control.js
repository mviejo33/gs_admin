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
        function controlViewModel() {
            var self = this;

            self.handleAttached = function() {
                var userLogin = localStorage.getItem("userLogged");
                var privilegeData = app.verifyPermissions();
                if (userLogin == undefined || userLogin == "") {
                    app.unauthorized(true);
                }
            }

            self.listViews = [
                // { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes' },
                { id: 'control_alta_cuentas', label: 'Alta de cuentas', value: 'control_alta_cuentas' },
                { id: 'control_alta_clientes', label: 'Alta de clientes', value: 'control_alta_clientes' },
                { id: 'control_datosfiscales', label: 'Alta/edición de datos fiscales', value: 'control_alta_datosfiscales' }
            ];

            self.activelistView = ko.observable("control_alta_cuentas");

            self.handleListViewOptionChange = function(event, ui) {
                var value = ui.value;
                switch (value) {
                    case 'control_alta_cuentas':
                        self.activelistView(value);
                        break;
                    case 'control_alta_clientes':
                        self.activelistView(value);
                        break;
                    case 'control_alta_datosfiscales':
                        self.activelistView(value);
                        break;
                    default:
                }
            }

            self.handleBindingsApplied = function() {
                var ui = { "value": self.activelistView() };
                self.handleListViewOptionChange(null, ui);
            }
        }
        return controlViewModel;
    });
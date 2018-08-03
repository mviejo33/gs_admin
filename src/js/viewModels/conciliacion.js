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
        function conciliacionViewModel() {
            var self = this;

            self.handleAttached = function() {
                var userLogin = localStorage.getItem("userLogged");
                var privilegeData = app.verifyPermissions();
                self.listViews = privilegeData.conciliacion.buttonSet;
                if (userLogin == undefined || userLogin == "" || userLogin == null) {
                    app.unauthorized(true);
                }
            }



            self.listViews = undefined;

            self.activelistView = ko.observable("bancos");

            self.handleListViewOptionChange = function(event, ui) {
                var value = ui.value;
                switch (value) {
                    case 'bancos':
                        self.activelistView("bancos");
                        break;
                    case 'facturacion':
                        self.activelistView("facturacion");
                        break;
                    default:
                }
            }



            self.handleBindingsApplied = function() {
                var ui = { "value": self.activelistView() };
                self.handleListViewOptionChange(null, ui);
            }

            self.telefono = ko.observable("");

            self.rfc = ko.observable("");
            self.telefono = ko.observable("");
            self.pventa = ko.observable("");
            self.importe = ko.observable("");
            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);
            self.mail = ko.observable("");

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);


            self.tracker = ko.observable();

            /**
             * Determines when the Create button will be disabled, the 
             * method implements best practices 
             * for form submission.
             * 
             * - If there are invalid components currently showing messaages 
             * this method returns true 
             * and the button is disabled. 
             * - If there are no visible errors, this method returns false 
             * and the button is enabled. 
             * E.g., when there are deferred errors on the component the 
             * button is enabled.
             * Note: If you see an error like "Message: Cannot read property 
             * 'invalidShown' of undefined",
             * make sure you have included the 'ojs/ojknockout-validation' 
             * dependency.
             * @return {boolean} 
             */
            self.shouldDisableSubmit = function() {
                var trackerObj = ko.utils.unwrapObservable(self.tracker),
                    hasInvalidComponents = trackerObj ? trackerObj["invalidShown"] : false;
                return hasInvalidComponents;
            };

            // Returns false if there are components showing errors. 
            // Returns true if all components 
            // are valid.
            self._showComponentValidationErrors = function(trackerObj) {
                trackerObj.showMessages();
                if (trackerObj.focusOnFirstInvalid())
                    return false;

                return true;
            };

            /**
             * Validates observable 'obs' using 'validator' and updates the 
             * 'messages' observable if 
             * there are validation errors.
             * @param {Object} obs the observable that is being validated
             * @param {Object} validator instance of the validator used to 
             * run the conditional check.
             * @param {Array} messages the observable used to bind to the
             *  'messagesCustom' option
             */
            self._validateObservable = function(obs, validator, messages) {
                var message, valid = true,
                    msgs = [];
                try {
                    // clear all messages before validating property
                    messages([]);
                    validator.validate(ko.utils.unwrapObservable(obs));
                } catch (e) {
                    if (e instanceof oj.ValidatorError) {
                        message = e.getMessage();
                    } else {
                        var summary =
                            e.message ? e.message : 'jeje';
                        message = new oj.Message(summary);
                    }

                    valid = false;
                    msgs.push(message);
                    messages(msgs);
                }

                return valid;
            };


        }
        return conciliacionViewModel;
    });
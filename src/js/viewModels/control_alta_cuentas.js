/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojknockout', 'ojs/ojcheckboxset', 'ojs/ojvalidation', 'ojs/ojknockout-validation', 'ojs/ojselectcombobox', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function signupViewModel() {
            var self = this;
            self.nombre = ko.observable("");
            self.pwd = ko.observable("");
            self.pwdRepeat = ko.observable("");
            self.numemp = ko.observable("");
            self.mail = ko.observable("");
            self.errorTextPopup = ko.observable();
            self.tracker = ko.observable();
            self.planta = ko.observable();
            self.plantas = ko.observableArray([]);
            self.privilegio = ko.observable();
            self.privilegios = ko.observableArray([
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' }
            ]);
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


            /**
             * When password observable changes, validate the Confirm Password 
             * component if it holds a non-empty value. 
             */
            self.pwd.subscribe(function(newValue) {
                var $cPassword = $("#pwd-textinput"),
                    cpUIVal = $cPassword.val();

                if (newValue && cpUIVal) {
                    $cPassword.ojInputPassword("validate");
                }
            });

            /**
             * A validator associated to the Confirm Password field, that 
             * compares the value in the password observable matches the 
             * value entered in Confirm Password field.
             */
            self.equalToPassword = {
                validate: function(value) {
                    var compareTo = self.pwd.peek();
                    if (!value && !compareTo)
                        return true;
                    else if (value !== compareTo) {
                        throw new Error('Las contraseñas no coinciden!');
                    }
                    return true;
                }
            };

            self.handleAttached = function() {
                var arr = [];
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPlantas.php",
                    success: function(data) {
                        if (typeof data == 'object') {
                            data.forEach(function(planta) {
                                var obj = {};
                                obj['value'] = planta.planta;
                                obj['label'] = planta.nombre;
                                arr.push(obj);
                            })
                            self.plantas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#plantas-select').ojSelect("refresh");
                });
            }



            self.submit = function(event, ui) {


                var trackerObj = ko.utils.unwrapObservable(self.tracker);

                // Step 1
                if (!this._showComponentValidationErrors(trackerObj)) {
                    return;
                }
                var data = {
                    'numemp': self.numemp(),
                    'pwd': self.pwd(),
                    'priv': self.privilegio()[0],
                    'planta': self.planta()[0],
                    'email': self.mail()
                };


                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/createAccount.php",
                    data: data,
                    success: function(data) {
                        if (typeof data == 'object') {
                            $('#success-popup').ojPopup('open', '#submit-button');
                        }
                        if (data.indexOf('web_adminusers_pkey') !== -1) {
                            $('#duplicate-numemp-popup').ojPopup('open', '#submit-button');
                        } else if (data == 'error, no match for numemp') {
                            $('#nomatch-numemp-popup').ojPopup('open', '#submit-button');
                        } else if (data.indexOf('web_adminusers_unique_email') !== -1) {
                            $('#duplicate-email-popup').ojPopup('open', '#submit-button');
                        }
                    }
                });


            }

        }
        return signupViewModel;
    });
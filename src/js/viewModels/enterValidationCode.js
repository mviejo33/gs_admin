    /**
     * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
     * The Universal Permissive License (UPL), Version 1.0
     */
    /**
     * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
     * The Universal Permissive License (UPL), Version 1.0
     */

    // signin page viewModel
    // In a real app, replace it with your authentication and logic
    'use strict';
    define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'viewModels/forgotpwd', 'ojs/ojvalidation', 'ojs/ojknockout-validation',
        'ojs/ojrouter',
        'ojs/ojknockout',
        'ojs/ojcheckboxset',
        'ojs/ojinputtext',
        'ojs/ojbutton',
        'ojs/ojanimation'
    ], function(oj, ko, $, app, resetPwdVM) {
        function enterValidationCodeViewmodel() {
            var self = this;

            self.handleTransitionCompleted = function(info) {
                // invoke fadeIn animation
                var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
                oj.AnimationUtils['fadeIn']($('#panel-container')[0], animateOptions);
            }

            self.handleAttached = function() {
                self.mail(resetPwdVM.mail());
                if (self.mail() == '') {
                    app.unauthorized(true);
                }
            }

            self.handleBindingsApplied = function() {
                $("#reenviarLink").click(function() {
                    $.ajax({
                        method: "POST",
                        url: "https://gaslicuadosabinas.com/accountManagement/resetPwdSendEmail.php",
                        data: {
                            email: self.mail(),
                            remitente: 'admin'
                        },
                        success: function(data) {
                            if (data != "error") {
                                app.router.go('enterValidationCode');
                            } else {
                                $('#email-error-popup').ojPopup('open', '#submit-button');
                            }
                        }
                    })
                })
            }

            self.mail = ko.observable('');
            self.code = ko.observable('');

            self.submit = function() {
                var trackerObj = ko.utils.unwrapObservable(self.tracker);

                if (!this._showComponentValidationErrors(trackerObj)) {
                    return;
                }

                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/accountManagement/resetPwdCompareCodes.php",
                    data: {
                        email: self.mail(),
                        code: self.code(),
                        remitente: 'admin'
                    },
                    success: function(data) {
                        if (typeof data === 'object') {
                            app.router.go('resetpwd');
                        } else {
                            $('#code-error-popup').ojPopup('open', '#submit-button');
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                })
            };


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
        return new enterValidationCodeViewmodel();
    });
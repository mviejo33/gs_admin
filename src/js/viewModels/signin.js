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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController',
    'ojs/ojrouter',
    'ojs/ojknockout',
    'ojs/ojcheckboxset',
    'ojs/ojinputtext',
    'ojs/ojbutton',
    'ojs/ojanimation'
], function(oj, ko, $, app) {
    function signinViewModel() {
        var self = this;
        self.handleTransitionCompleted = function(info) {
            // invoke fadeIn animation
            var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
            oj.AnimationUtils['fadeIn']($('#panel-container')[0], animateOptions);
        }

        // Replace with state save logic for rememberUserName
        self.userName = ko.observable('');
        self.passWord = ko.observable('');



        self.forgotPwd = function() {
            app.router.go('forgotpwd');
        }

        self.signIn = function() {
            $.ajax({
                method: "POST",
                url: "https://gaslicuadosabinas.com/servicesAdmin/signin.php",
                data: {
                    username: self.userName(),
                    password: self.passWord(),
                    remitente: 'admin'
                },
                success: function(data) {
                    if (data) {
                        localStorage.setItem('userLogged', data.id);
                        localStorage.setItem('privilege', data.privilege);
                        localStorage.setItem('planta', data.planta);
                        app.router.go('facturacion');
                        app.userLogin(self.userName());
                        app.isLoggedIn(true);
                    }
                }
            })
        };

        self.pwdOptionChange = function(event, ui) {
            var trigger = ui.optionMetadata.trigger;
            if (trigger == 'enter_pressed') {
                self.signIn();
            }
        }

        self.handleBindingsApplied = function() {
            $('#pwd').keyup(function(e) {
                if (e.keyCode == 13) {
                    self.signIn();
                }
            });
        }

        self.handleAttached = function() {
            app.isLoggedIn(false);
            app.userLogin("");
            localStorage.setItem("userLogged", null);
            localStorage.setItem("privilege", null);
        }

    }
    return signinViewModel;
});
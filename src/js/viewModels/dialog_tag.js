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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojfilepicker', 'ojs/ojradioset', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojprogress'],
    function(oj, ko, $, app) {
        function DialogModel(parentVM) {
            var self = this;

            self.nombre = ko.observable();


            self.handleAttached = function() {

            }

            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
            self.datePicker = {
                numberOfMonths: 1
            };

            self.shouldDisableSubmit = function() {
                if (self.nombre()) {
                    return false;
                } 
                return true;
            };

            self.submit = function() {
               var data = "nombre=" + self.nombre();

                $.ajax({
                    type: 'POST',
                    processData: false, // NEEDED, DON'T OMIT THIS
                    url: "https://gaslicuadosabinas.com/api.php/web_documentos_tags",
                    data: data,
                    success: function(data) {
                        if (data) {
                            $("#dialog-tag").ojDialog("close");
                            $('#success-popup').ojPopup('open', '#okButton-tag');
                        } else {
                            $('#failure-popup').ojPopup('open', '#okButton-tag');

                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {}
                })
            }

            self.beforeOpen = function() {
                self.nombre("");
            }

        }
        return DialogModel;
    });
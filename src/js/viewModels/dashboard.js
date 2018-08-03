/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'promise', 'ojs/ojinputtext', 'ojs/ojinputnumber', 'ojs/ojtable', 'ojs/ojarraytabledatasource'],
    function(oj, ko, $) {

        function DashboardViewModel() {
            var self = this;

            self.ciudadesEdosObservableArray = ko.observableArray([]);
            self.datasource = new oj.ArrayTableDataSource(self.ciudadesEdosObservableArray);

            /**
             * Optional ViewModel method invoked after the View is inserted into the
             * document DOM.  The application can put logic that requires the DOM being
             * attached here.
             * @param {Object} info - An object with the following key-value pairs:
             * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
             * @param {Function} info.valueAccessor - The binding's value accessor.
             * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
             */


            function currentRowListener(event, data) {
                if (data['option'] == 'currentRow' && data['value'] != null) {
                  console.log(data['value']);
                    var keys = data['value']['rowKey'];
                    self.inputCiudadNombre(keys[0]);
                    self.inputEstadoNombre(keys[1]);
                }
            };

            self.handleAttached = function(info) {
                $('#table').on('ojoptionchange', currentRowListener);
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/getCiudades.php",
                    success: function(data) {
                        if (data != undefined) {
                            self.ciudadesEdosObservableArray(data);
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            };

            //add to the observableArray
            self.addRow = function() {
                var dept = {
                    'cnombre': self.inputCiudadNombre(),
                    'enombre': self.inputEstadoNombre()
                };
                self.ciudadesEdosObservableArray.push(dept);
            };

            //used to update the fields based on the selected row
            self.updateRow = function() {
                var currentRow = $('#table').ojTable('option', 'currentRow');

                if (currentRow != null) {
                    self.ciudadesEdosObservableArray.splice(currentRow['rowIndex'], 1, {
                        'cnombre': self.inputCiudadNombre(),
                        'enombre': self.inputEstadoNombre()
                    });
                }
            };

            //used to remove the selected row
            self.removeRow = function() {
                var currentRow = $('#table').ojTable('option', 'currentRow');

                if (currentRow != null) {
                    self.ciudadesEdosObservableArray.splice(currentRow['rowIndex'], 1);
                }
            };

            //intialize the observable values in the forms
            self.inputCiudadNombre = ko.observable();
            self.inputEstadoNombre = ko.observable();

        }

        /*
         * Returns a constructor for the ViewModel so that the ViewModel is constrcuted
         * each time the view is displayed.  Return an instance of the ViewModel if
         * only one instance of the ViewModel is needed.
         */
        return new DashboardViewModel();
    }
);

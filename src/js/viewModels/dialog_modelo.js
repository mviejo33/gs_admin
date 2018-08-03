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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojfilepicker', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojprogress'],
    function(oj, ko, $, app) {
        function DialogModel(data) {
            var self = this;

            self.medidas = ko.observable();
            self.medida = ko.observable();
            self.acciones = ko.observable();
            self.accion = ko.observable();
            self.marcas = ko.observable();
            self.marca = ko.observable();
            self.nombre = ko.observable();


            self.handleAttached = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_accion?transform=1",
                    success: function(data) {
                        var data = data.web_valvulas_accion;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.folio;
                                obj['label'] = data.accion;
                                arr.push(obj);
                            })
                            self.acciones(arr);
                        }
                    }
                }).done(function(data) {
                    $('#acciones-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_medidas?transform=1",
                    success: function(data) {
                        var data = data.web_valvulas_medidas;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.folio;
                                obj['label'] = data.pulgadas;
                                arr.push(obj);
                            })
                            self.medidas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#medidas-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_marcas?transform=1",
                    success: function(data) {
                        var data = data.web_valvulas_marcas;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.folio;
                                obj['label'] = data.marca;
                                arr.push(obj);
                            })
                            self.marcas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#marcas-select').ojSelect("refresh");
                });
            }

            self.shouldDisableSubmit = function() {
                if (self.medida() &&
                    self.marca() &&
                    self.nombre() &&
                    self.accion()
                ) {
                    return false;
                } else {
                    return true;
                }
            };

            self.submit = function() {
                var data = "marca=" + self.marca()[0] + "&medida=" + self.medida()[0] + "&accion=" + self.accion()[0] +
                    "&modelo=" + self.nombre();

                $.ajax({
                    method: "POST",
                    data: data,
                    processData: false, // NEEDED, DON'T OMIT THIS
                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_modelos",
                    success: function(data) {
                        if (data != null) {
                            document.querySelector("#dialog-modelo").close();
                        }
                    }
                })
            }

            self.beforeOpen = function() {

            }

        }
        return DialogModel;
    });
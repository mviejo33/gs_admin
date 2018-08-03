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

            self.fechaFabricacion = ko.observable();
            self.cuentas = ko.observable();
            self.cuenta = ko.observable();
            self.plantas = ko.observable();
            self.planta = ko.observable();
            self.estaciones = ko.observable();
            self.estacion = ko.observable();
            self.pventas = ko.observable();
            self.pventa = ko.observable();
            self.cliente = ko.observable();
            self.modelo = ko.observableArray([]);
            self.modelos = ko.observableArray([]);
            self.medida = ko.observable();
            self.accion = ko.observable();
            self.marca = ko.observable();
            self.currentLocation = ko.observable();
            self.validClient = ko.observable(false);


            self.handleAttached = function() {

            }

            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
            self.datePicker = {
                numberOfMonths: 1
            };

            self.shouldDisableSubmit = function() {
                if (self.currentLocation()) {
                    switch (self.currentLocation()) {
                        case 'estacion':
                            if (self.estacion()) {
                                if (self.fechaFabricacion() &&
                                    self.modelo()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'pventa':
                            if (self.pventa()) {
                                if (self.fechaFabricacion() &&
                                    self.modelo()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'planta':
                            if (self.planta()) {
                                if (self.fechaFabricacion() &&
                                    self.modelo()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'cliente':
                            if (self.validClient() == true) {
                                if (self.fechaFabricacion() &&
                                    self.modelo()
                                ) {
                                    return false;
                                }
                            }
                            break;
                    }
                } else {
                    return true;
                }
            };

            self.resetClienteSearch = function() {
                self.validClient(false);
                self.cliente(undefined);
            }

            self.lookForCliente = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/clientes?filter=telefono,eq," + self.cliente() + "&transform=1",
                    success: function(data) {
                        var data = data.clientes;
                        if (data) {
                            self.validClient(true);
                        }
                    }
                }).done(function(data) {
                    $('#pventas-select').ojSelect("refresh");
                });
            }

            self.submit = function() {
                var data;
                switch (self.currentLocation()) {
                    case 'estacion':
                        data = "estacion=" + self.estacion()[0];
                        break;
                    case 'pventa':
                        data = "pventa=" + self.pventa()[0];
                        break;
                    case 'planta':
                        data = "planta=" + self.planta()[0];
                        break;
                    case 'cliente':
                        data = "cliente=" + self.cliente();
                        break;
                }
                data += "&fecha_fabricacion=" + self.fechaFabricacion() + "&modelo=" + self.modelo()[0] + "&usr_captura=" + app.userLogin();

                $.ajax({
                    method: "POST",
                    data: data,
                    processData: false,
                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_instaladas",
                    success: function(data) {
                        if (data != null) {
                            if (parentVM.isSucesor() == true && parentVM.currentSelectedValvula() != undefined) {
                                var d = "sucesor=" + data;
                                $.ajax({
                                    method: "PUT",
                                    data: d,
                                    processData: false,
                                    url: "https://gaslicuadosabinas.com/api.php/web_valvulas_instaladas/" + parentVM.currentSelectedValvula(),
                                    success: function(dataUpdate) {
                                        console.log(dataUpdate);
                                    }
                                })
                            }
                            parentVM.isSucesor(false);
                            parentVM.getValvulasPaging();
                            document.querySelector("#dialog-valvula").close();
                        }
                    }
                })

            }

            self.beforeOpen = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getModelosMedida.php",
                    success: function(data) {
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.id;
                                obj['label'] = data.modelo + "  ---  " + data.pulgadas;
                                arr.push(obj);
                            })
                            self.modelos(arr);
                        }
                    }
                }).done(function(data) {
                    $('#modelos-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_bancos_cuentas?transform=1",
                    success: function(data) {
                        var data = data.web_bancos_cuentas;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(cuenta) {
                                var obj = {};
                                obj['value'] = cuenta.id;
                                obj['label'] = cuenta.cuenta + " - " + cuenta.nombre;
                                // if(cuenta.tiene_egresos_pdf == ) {
                                //     obj['label'] += "*";
                                // }
                                arr.push(obj);
                            })
                            self.cuentas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#cuentas-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/plantas?transform=1",
                    success: function(data) {
                        var data = data.plantas;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.planta;
                                obj['label'] = data.nombre;
                                arr.push(obj);
                            })
                            self.plantas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#plantas-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/estaciones?transform=1",
                    success: function(data) {
                        var data = data.estaciones;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.estacion;
                                obj['label'] = data.nombre;
                                arr.push(obj);
                            })
                            self.estaciones(arr);
                        }
                    }
                }).done(function(data) {
                    $('#estaciones-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/puntoventa?transform=1",
                    success: function(data) {
                        var data = data.puntoventa;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.numero;
                                obj['label'] = data.numero;
                                arr.push(obj);
                            })
                            self.pventas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#pventas-select').ojSelect("refresh");
                });

            }

        }
        return DialogModel;
    });
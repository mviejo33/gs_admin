/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

'use strict';
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojknockout', 'ojs/ojswitch', 'ojs/ojvalidation', 'ojs/ojarraydataprovider', 'ojs/ojknockout-validation', 'ojs/ojselectcombobox', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function signupViewModel() {
            var self = this;
            self.nombre = ko.observable("");
            self.telefono = ko.observable("");
            self.numero = ko.observable("");
            self.calle = ko.observable("");
            self.entrecalle1 = ko.observable("");
            self.entrecalle2 = ko.observable("");
            self.mails = ko.observable("");
            self.colonia = ko.observable("");
            self.colonias = ko.observableArray([]);
            self.ciudad = ko.observable("");
            self.ciudades = ko.observableArray([]);
            self.estado = ko.observable("");
            self.estados = ko.observableArray([]);
            self.rumbo = ko.observable("");
            self.rumbos = ko.observableArray([
                { value: 'N', label: 'Norte' },
                { value: 'S', label: 'Sur' },
                { value: 'O', label: 'Oriente' },
                { value: 'P', label: 'Poniente' },
            ]);
            self.rumbosDP = new oj.ArrayDataProvider(self.rumbos, { idAttribute: 'value' });
            self.numerointerior = ko.observable("");
            self.formapago = ko.observable("");
            self.formaspago = ko.observable("");
            self.metodopago = ko.observable("");
            self.metodospago = ko.observable("");
            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observable("");
            self.ctabanco = ko.observable("");
            self.rfc = ko.observable("");

            self.errorTextPopup = ko.observable();
            self.tracker = ko.observable();
            self.planta = ko.observable();
            self.plantas = ko.observableArray([]);



            self.includeDatosFiscales = ko.observable(false);

            self.placeHolderCiudadSelect = ko.observable('Primero selecciona un estado');
            self.placeHolderColoniaSelect = ko.observable('Primero selecciona un estado y una ciudad');

            self.estadoOptionChange = function(a, event) {
                if (event.option == 'value') {
                    self.placeHolderCiudadSelect('Selecciona una ciudad');
                    $.ajax({
                        method: "GET",
                        url: "https://gaslicuadosabinas.com/api.php/ciudades?columns=*&transform=1&filter[]=estado,eq," + self.estado()[0] + "&satisfy=any",
                        success: function(data) {
                            var arr = [];
                            data = data.ciudades;
                            if (typeof data == 'object') {
                                data.forEach(function(ciudad) {
                                    var obj = {};
                                    obj['value'] = ciudad.ciudad;
                                    obj['label'] = ciudad.nombre;
                                    arr.push(obj);
                                })
                                self.ciudades(arr);
                            }
                        }
                    }).done(function(data) {
                        $('#ciudades-select').ojSelect("refresh");
                    });
                }
            }

            self.ciudadOptionChange = function(a, event) {
                if (event.option == 'value') {
                    self.placeHolderColoniaSelect('Selecciona una colonia');
                    $.ajax({
                        method: "GET",
                        url: "https://gaslicuadosabinas.com/api.php/colonias?columns=*&transform=1&filter[]=ciudad,eq," + self.ciudad()[0] + "&satisfy=any",
                        success: function(data) {
                            var arr = [];
                            data = data.colonias;
                            if (typeof data == 'object') {
                                data.forEach(function(colonia) {
                                    var obj = {};
                                    obj['value'] = colonia.ciudad;
                                    obj['label'] = colonia.nombre;
                                    arr.push(obj);
                                })
                                self.colonias(arr);
                            }
                        }
                    }).done(function(data) {
                        $('#colonias-select').ojSelect("refresh");
                    });
                }
            }

            self.coloniaOptionChange = function(a, event) {
                if (event.option == 'value') {
                    console.log(self.colonia());
                   
                }
            }

            self.handleAttached = function() {
                var arr = [];
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPlantas.php",
                    success: function(data) {
                        arr = [];
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

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/estados?columns=numero,nombre&transform=1&satisfy=all",
                    success: function(data) {
                        arr = [];
                        data = data.estados;
                        if (typeof data == 'object') {
                            data.forEach(function(estado) {
                                var obj = {};
                                obj['value'] = estado.numero;
                                obj['label'] = estado.nombre;
                                arr.push(obj);
                            })
                            self.estados(arr);
                        }
                    }
                }).done(function(data) {
                    $('#estados-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_cfdi_metodopago?transform=1",
                    success: function(data) {
                        arr = [];
                        data = data.web_cfdi_metodopago;
                        if (typeof data == 'object') {
                            data.forEach(function(metodopago) {
                                var obj = {};
                                obj['value'] = metodopago.metodopago;
                                obj['label'] = metodopago.descripcion;
                                arr.push(obj);
                            })
                            self.metodospago(arr);
                        }
                    }
                }).done(function(data) {
                    $('#metodospago-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/getUsosCFDI.php",
                    success: function(data) {
                        arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(usocfdi) {
                                var obj = {};
                                obj['value'] = usocfdi.usocfdi;
                                obj['label'] = usocfdi.descripcion;
                                arr.push(obj);
                            })
                            self.usosCFDI(arr);
                        }
                    }
                }).done(function(data) {
                    $('#usocfdi-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/getFormasPago.php",
                    success: function(data) {
                        arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(formaPago) {
                                var obj = {};
                                obj['value'] = formaPago.formapago;
                                obj['label'] = formaPago.descripcion;
                                arr.push(obj);
                            })
                            self.formaspago(arr);
                        }
                    }
                }).done(function(data) {
                    $('#formapago-select').ojSelect("refresh");
                });
            }
            //get_conceptos_factura(id)
            self.shouldDisableSubmit = function() {
                if (self.nombre() &&
                    self.telefono() &&
                    self.estado() &&
                    self.ciudad() &&
                    self.calle() &&
                    self.planta() &&
                    self.numero() &&
                    self.ciudad() &&
                    self.colonia()) {
                    if (self.includeDatosFiscales() == true) {
                        if (self.rfc() &&
                            self.formapago() &&
                            self.mails() &&
                            self.metodopago() &&
                            self.usoCFDI()
                        ) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    return false;
                }
                return true;
            };

            self.submit = function(event, ui) {
                var data = {};
                if (self.includeDatosFiscales()) {
                    data = {
                        'email': self.mails(),
                        'nombre': self.nombre(),
                        'telefono': self.telefono(),
                        'numero': self.numero(),
                        'calle': self.calle(),
                        'entrecalle1': self.entrecalle1(),
                        'entrecalle2': self.entrecalle2(),
                        'mails': self.mails(),
                        'colonia': self.colonia()[0],
                        'ciudad': self.ciudad()[0],
                        'estado': self.estado()[0],
                        'rumbo': self.rumbo()[0],
                        'numerointerior': self.numerointerior(),
                        'formapago': self.formapago()[0],
                        'metodopago': self.metodopago()[0],
                        'usoCFDI': self.usoCFDI()[0],
                        'planta': self.planta()[0],
                        'ctabanco': self.ctabanco(),
                        'rfc': self.rfc().toUpperCase(),
                        'includeDatosFiscales': self.includeDatosFiscales()
                    };
                } else {
                    data = {
                        'planta': self.planta()[0],
                        'email': self.mails(),
                        'nombre': self.nombre(),
                        'telefono': self.telefono(),
                        'numero': self.numero(),
                        'calle': self.calle(),
                        'entrecalle1': self.entrecalle1(),
                        'entrecalle2': self.entrecalle2(),
                        'colonia': self.colonia()[0],
                        'ciudad': self.ciudad()[0],
                        'estado': self.estado()[0],
                        'rumbo': self.rumbo()[0],
                        'numerointerior': self.numerointerior(),
                        'includeDatosFiscales': self.includeDatosFiscales()
                    };
                }



                $.ajax({
                    method: "POST",
                    data: data,
                    url: "https://gaslicuadosabinas.com/servicesAdmin/altaClientes.php",
                    success: function(data) {
                        console.log(data);
                        if (data.includes("already exists")) {
                            $('#duplicate-telefono-popup').ojPopup('open', '#submit-button');
                        } else if (data.includes("No se pudo")) {
                            $('#fail-popup').ojPopup('open', '#submit-button');
                        } else {
                            $('#success-popup').ojPopup('open', '#submit-button');
                        }
                    }
                })
            }

        }
        return signupViewModel;
    });
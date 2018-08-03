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
            self.telefono = ko.observable("");
            self.mails = ko.observable("");
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

            self.isCliente = ko.observable(false);

            self.getDatosFiscalesCliente = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_browse_clientes?transform=1&filter[]=telefono,eq," + self.telefono() + "&satisfy=any",
                    success: function(data) {
                        var data = data.web_browse_clientes[0];
                        if ((typeof data === "object") && (data !== null)) {
                            self.isCliente(true);
                        }
                        self.mails(data.correos);
                        self.formapago(data.formapago);
                        self.metodopago(data.metodopago);
                        self.usoCFDI(data.usocfdi);
                        self.rfc(data.rfc);
                    }
                })
            }

            self.handleAttached = function() {
                var arr = [];

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
                if (self.telefono() && self.rfc() &&
                    self.formapago() &&
                    self.mails() &&
                    self.usoCFDI() &&
                    self.metodopago()
                ) {
                    return false;
                }
                return true;
            };

            self.resetValues = function() {
                self.telefono(undefined);
                self.isCliente(false);
                self.mails(undefined);
                self.formapago(undefined);
                self.metodopago(undefined);
                self.usoCFDI(undefined);
                self.rfc(undefined);
            }

            self.submit = function(event, ui) {
                console.log(self.formapago());
                var data = {
                    'mails': self.mails(),
                    'formapago': self.formapago().constructor === Array ? self.formapago()[0] : self.formapago(),
                    'metodopago': self.metodopago().constructor === Array ? self.metodopago()[0] : self.metodopago(),
                    'usoCFDI': self.usoCFDI().constructor === Array ? self.usoCFDI()[0] : self.usoCFDI(),
                    'ctabanco': self.ctabanco(),
                    'rfc': self.rfc().toUpperCase(),
                    'cliente': self.telefono()
                };

                $.ajax({
                    method: "POST",
                    data: data,
                    url: "https://gaslicuadosabinas.com/servicesAdmin/cuDatosFiscales.php",
                    success: function(data) {
                        if(data.includes("Error")) {
                            $('#error-popup').ojPopup('open', '#submit-button');
                        } else if(data.includes("satisfactoriamente")) {
                            $('#success-popup').ojPopup('open', '#submit-button');
                            self.resetValues();
                        }
                    }
                })
            }

        }
        return signupViewModel;
    });
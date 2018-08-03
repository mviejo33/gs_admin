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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata', 'ojs/ojpagingcontrol', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojvalidation', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionPublicoGeneralViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPvas.php",
                    success: function(data) {
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(pva) {
                                var obj = {};
                                obj['value'] = pva.pva;
                                obj['label'] = pva.pva;
                                arr.push(obj);
                            });
                            console.log(arr);
                            self.pvas(arr);
                            $('#pvas-select').ojSelect("refresh");
                        }
                    }
                });

                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_browse_clientes?transform=1&filter[]=telefono,eq,25533544&satisfy=any",
                    success: function(data) {
                        var data = data.web_browse_clientes[0];
                        self.telefono(data.telefono);
                        self.nombre(data.nombre);
                        self.rfc(data.rfc);
                        self.formaPago([data.formapago + "-" + data.formapago_descripcion]);
                        self.usoCFDI([data.usocfdi + "-" + data.usocfdi_descripcion]);
                    }
                })
            }

            self.clientes = ko.observable();

            var today = new Date();
            var twodaysago = new Date();
            twodaysago.setDate(today.getDate() - 30);
            self.dateRangeFromValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(twodaysago));
            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(today));
            self.datePicker = {
                numberOfMonths: 2
            };
            self.dateValue = ko.observable();

            self.telefono = ko.observable();
            self.pvas = ko.observable([]);
            self.pva = ko.observable();
            self.ctaBanco = ko.observable();
            self.rfc = ko.observable();
            self.nombre = ko.observable();
            self.importe = ko.observable();

            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);
            self.paramsDialog = ko.observable();

            self.litros = ko.observable();

            self.facturaPublicoGeneral = function() {
                self.paramsDialog({
                    'isLoading': true,
                    'promise': self.promisePublicoGeneral,
                    'dialog': { 'title': 'Procesando timbrado', 'body': 'Se está procesando el timbrado...' }
                });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promisePublicoGeneral = function() {
                var dateISO = new Date(self.dateValue()).toISOString().slice(0, -5);
                return new Promise((resolve, reject) => {
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'total': self.importe(),
                        'formapago': self.formaPago()[0],
                        'pva': self.pva()[0],
                        'fecha': dateISO,
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'telefono': self.telefono(),
                        'tipo': "publicogeneral",
                        'empresa': 1,
                        'cantidad': self.litros(),
                        'usr_captura': app.userLogin()
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/factura.php",
                        data: data,
                        success: function(data) {
                            resolve(data);
                            resetValues();
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve("No se pudo timbrar");
                        }
                    })
                });
            }

            function resetValues() {
                self.paramsDialog(undefined);
                self.importe(undefined);
                self.dateValue(undefined);
                self.litros(undefined);
            }

            self.shouldDisableSubmit = function() {


                if (self.formaPago() &&
                    self.rfc() &&
                    self.dateValue() &&
                    self.importe() != 0 && self.importe() != undefined &&
                    self.litros() != 0 && self.litros() != undefined &&
                    self.pva() &&
                    self.usoCFDI()) {
                    return false;
                } else {
                    return true;
                }


            };
        }
        return facturacionPublicoGeneralViewModel;
    });
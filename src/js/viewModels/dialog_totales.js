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

            self.id = ko.observable();
            self.numCargos = ko.observable();
            self.numAbonos = ko.observable();
            self.totalCargos = ko.observable();
            self.totalAbonos = ko.observable();
            self.totalComisiones = ko.observable();
            self.totalIntereses = ko.observable();
            self.cuenta = ko.observable();
            self.cuentas = ko.observableArray([]);
            self.fileNameTransferencias = ko.observable();
            self.fileNameEdoCuenta = ko.observable();
            self.diaultimo = ko.observable();
            self.transferenciasBase64 = ko.observable();
            self.edoCuentaBase64 = ko.observable();


            self.handleAttached = function() {
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
            }

            self.filePickerListenerEdoCuenta = function(event) {

                var files = event.detail.files;
                var fileReader = new FileReader();
                self.fileNameEdoCuenta(files[0].name);
                self.edoCuentaBase64(files[0]);
                // fileReader.readAsText(files[0]);
                // // fileReader.readAsText(files[0],  'ISO-8859-1');
                // fileReader.onload = function() {
                //     var data = fileReader.result;
                //     self.edoCuentaBase64 = data/*.replace(/^[^,]*,/, '')*/;
                // };

                // fileReader.readAsDataURL(files[0]);
            }

            self.filePickerListenerTransferencias = function(event) {

                var files = event.detail.files;
                var fileReader = new FileReader();
                self.fileNameTransferencias(files[0].name);
                fileReader.readAsText(files[0]);
                self.transferenciasBase64(files[0]);
                // // fileReader.readAsText(files[0],  'ISO-8859-1');
                // fileReader.onload = function() {
                //     var data = fileReader.result;
                //     self.transferenciasBase64 = data/*.replace(/^[^,]*,/, '')*/;
                // };

                // fileReader.readAsDataURL(files[0]);
            }

            self.shouldDisableSubmit = function() {
                if (self.cuenta() &&
                    self.diaultimo() &&
                    self.totalAbonos() &&
                    self.totalCargos() &&
                    self.totalComisiones() &&
                    self.totalIntereses() &&
                    self.numCargos() &&
                    self.numAbonos()
                    /*&&
                                       self.edoCuentaBase64()*/
                ) {
                    return false;

                    /*if (self.cuenta()[0].split("-")[1] == 't') {
                        if (self.transferenciasBase64()) {
                            return false;
                        } else {
                            return true;
                        }
                        return false;
                    }*/
                } else {
                    return true;
                }
            };

            self.afterClose = function () {
                
            }

            self.submit = function() {
                var formData = new FormData();
                formData.append("cuenta", self.cuenta()[0].split("-")[0]);
                formData.append("id", self.id());
                formData.append("diaultimo", self.diaultimo());
                formData.append("usr_captura", app.userLogin());
                formData.append("totalAbonos", self.totalAbonos());
                formData.append("totalCargos", self.totalCargos());
                formData.append("totalComisiones", self.totalComisiones());
                formData.append("totalIntereses", self.totalIntereses());
                formData.append("numCargos", self.numCargos());
                formData.append("numAbonos", self.numAbonos());
                formData.append("edoCuentaPDF", self.edoCuentaBase64());
                if (self.cuenta()[0].split("-")[1] == 't') {
                    formData.append("transferenciasPDF", self.transferenciasBase64());
                }

                $.ajax({
                    type: 'POST',
                    contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                    processData: false, // NEEDED, DON'T OMIT THIS
                    url: "https://gaslicuadosabinas.com/servicesAdmin/insertTotales.php",
                    data: formData,
                    success: function(data) {
                        if (data == "Se inserto totalesmes") {
                            $("#dialog-totales").ojDialog("close");
                            $('#success-popup').ojPopup('open', '#okButton-totales');
                        } else {
                            $('#failure-popup').ojPopup('open', '#okButton-totales');

                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {}
                })
            }



            var today = new Date();
            var fivedaysago = new Date();
            fivedaysago.setDate(today.getDate() - 5);
            self.dateRangeFromValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(fivedaysago));
            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(today));
            self.datePicker = {
                numberOfMonths: 3
            };

            self.handleOkClose = function() {
                document.querySelector("#dialog-totales").close();
            };
            self.beforeOpen = function() {
                if (data.resumenMesParams()) {
                    var idtotales = data.resumenMesParams().idtotales;
                    $.ajax({
                        method: "GET",
                        url: "https://gaslicuadosabinas.com/api.php/web_bancos_cuentas_totalesmes?transform=1&filter=id,eq," + idtotales,
                        success: function(data) {
                            var data = data.web_bancos_cuentas_totalesmes[0];
                            if (data) {
                                self.cuenta([data.cuenta + ""]);
                                self.diaultimo(data.diaultimo);
                                self.id(data.id);
                                self.totalAbonos(data.total_abonos);
                                self.totalCargos(data.total_cargos);
                                self.totalComisiones(data.total_comisiones);
                                self.totalIntereses(data.total_intereses);
                                self.numCargos(data.num_cargos);
                                self.numAbonos(data.num_abonos);
                            }

                        }
                    }).done(function(data) {
                        $('#cuentas-select').ojSelect("refresh");
                    });
                } else {
                    self.cuenta([]);
                    self.id();
                    self.diaultimo(undefined);
                    self.totalAbonos(undefined);
                    self.totalCargos(undefined);
                    self.totalComisiones(undefined);
                    self.totalIntereses(undefined);
                    self.numCargos(undefined);
                    self.numAbonos(undefined);
                }
            }
            self.body = ko.observable("");
            self.title = ko.observable("");

        }
        return DialogModel;
    });
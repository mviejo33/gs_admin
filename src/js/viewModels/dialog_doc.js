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

            self.empresas = ko.observable();
            self.empresa = ko.observable();
            self.currentLocation = ko.observable();
            self.plantas = ko.observable();
            self.planta = ko.observable();
            self.estaciones = ko.observable();
            self.estacion = ko.observable();
            self.pventas = ko.observable();
            self.pventa = ko.observable();
            self.cliente = ko.observable();
            self.autor = ko.observable();
            self.nombre = ko.observable();
            self.fechaEmision = ko.observable();
            self.fechaVigencia = ko.observable();
            self.doc = ko.observable();
            self.validClient = ko.observable(false);
            self.nombreDocumento = ko.observable();
            self.documentoBase64 = ko.observable();


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
                                if (self.fechaEmision() &&
                                    self.nombre() && self.documentoBase64()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'pventa':
                            if (self.pventa()) {
                                if (self.fechaEmision() &&
                                    self.nombre() && self.documentoBase64()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'planta':
                            if (self.planta()) {
                                if (self.fechaEmision() &&
                                    self.nombre() && self.documentoBase64()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'cliente':
                            if (self.validClient() == true) {
                                if (self.fechaEmision() &&
                                    self.nombre() && self.documentoBase64()
                                ) {
                                    return false;
                                }
                            }
                            break;
                        case 'na':
                            if (self.fechaEmision() &&
                                self.nombre() && self.documentoBase64()
                            ) {
                                return false;
                            }
                            break;
                    }
                    return true;
                } else {
                    return true;
                }
            };

            self.resetClienteSearch = function() {
                self.validClient(false);
                self.cliente(undefined);
            }


            self.filePickerListener = function(event) {
                var files = event.detail.files;
                var fileReader = new FileReader();
                self.nombreDocumento(files[0].name);
                self.documentoBase64(files[0]);
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

                var formData = new FormData();

                formData.append("estacion", self.estacion() ? self.estacion()[0] : null);
                formData.append("pventa", self.pventa() ? self.pventa()[0] : null);
                formData.append("planta", self.planta() ? self.planta()[0] : null);
                formData.append("cliente", self.cliente() ? self.cliente() : null);
                formData.append("fecha_emision", self.fechaEmision());
                formData.append("empresa", self.empresa() ? self.empresa()[0] : null);
                formData.append("fecha_vigencia", self.fechaVigencia());
                formData.append("nombre", self.nombre());
                formData.append("autor", self.autor());
                formData.append("documento", self.documentoBase64());
                formData.append("usr_captura", app.userLogin());

                //get file type
                var re = /(?:\.([^.]+))?$/;
                var mime_type = "";
                var fileType = re.exec(self.nombreDocumento())[1]; // "txt"
                switch (fileType) {
                    case 'txt':
                        mime_type = 'text/plain';
                        break;
                    case 'csv':
                        mime_type = 'application/csv';
                        break;
                    case 'xml':
                        mime_type = 'application/xml';
                        break;
                    case 'pdf':
                        mime_type = 'application/pdf';
                        break;
                    case 'png':
                        mime_type = 'image/png';
                        break;
                    case 'jpeg':
                        mime_type = 'image/jpeg';
                        break;
                    case 'doc':
                    case 'docx':
                    case 'png':
                    case 'xlsx':
                    case 'xlsm':
                    case 'xltx':
                    case 'xltm':
                        mime_type = 'application/octet-stream';
                        break;
                }
                formData.append("mime_type", mime_type);


                $.ajax({
                    type: 'POST',
                    contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                    processData: false, // NEEDED, DON'T OMIT THIS
                    url: "https://gaslicuadosabinas.com/servicesAdmin/insertDocumento.php",
                    data: formData,
                    success: function(data) {
                        if (data == "Se inserto documento") {
                            $('#success-popup').ojPopup('open', '#okButton-documento');
                            $("#dialog-tag").ojDialog("close");
                            parentVM.getDocsPaging();

                        } else {
                            $('#failure-popup').ojPopup('open', '#okButton-documento');

                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {}
                })
            }
            // <label for="tags-select">Tag(s)</label>
            //         <select autocomplete="off" ultimasLecturas id="tags-select" data-bind="ojComponent: {
            //                     component: 'ojSelect',  
            //                     value: tag,
            //                     rootAttributes: {style: 'max-width:100%'},
            //                     placeholder: 'Selecciona un tag...'}">
            //             <!-- ko foreach: tags -->
            //             <option data-bind="value:value, text:label"></option>
            //             <!-- /ko -->
            //         </select>

            self.beforeOpen = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_empresas?transform=1",
                    success: function(data) {
                        var data = data.web_empresas;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(data) {
                                var obj = {};
                                obj['value'] = data.id;
                                obj['label'] = data.nombre;
                                arr.push(obj);
                            })
                            self.empresas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#empresas-select').ojSelect("refresh");
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
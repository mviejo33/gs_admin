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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojmenu', 'ojs/ojoption', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionSolicitudesViewModel() {
            var self = this;

            self.solicitudesFacturaDataArray = ko.observableArray([]);
            self.solicitudesFacturaDataSource = new oj.ArrayTableDataSource(self.solicitudesFacturaDataArray, { idAttribute: 'id' });

            self.solicitudesFacturaOptionChange = function(event, data) {
                if (data['option'] == 'selection') {
                    self.solicitudesFacturaDataSource.get([data['value'][0]]).then(function(obj) {
                        var facturaSeleccionada = obj.data;
                        self.rfc(facturaSeleccionada.rfc);
                        self.pventa(facturaSeleccionada.pva);
                        self.formaPago(facturaSeleccionada.formapago);
                        self.usoCFDI(facturaSeleccionada.usocfdi);
                        self.mail(facturaSeleccionada.correo);
                        self.importe(facturaSeleccionada.importe);

                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/getClienteFromRFC.php",
                            data: { 'rfc': self.rfc() },
                            success: function(data) {
                                self.telefono(data["0"].get_cliente_from_rfc);
                            }
                        })
                    });


                }
            };

            self.handleAttached = function() {
                getSolicitudFacturas();
                getDatosFacturacion();
            }

            function getSolicitudFacturas() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getSolicitudesFactura.php",
                    success: function(data) {
                        if (data != undefined) {
                            self.solicitudesFacturaDataArray(data);
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            };



            function getDatosFacturacion() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/getUsosCFDI.php",
                    success: function(data) {
                        var arr = [];
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
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(formaPago) {
                                var obj = {};
                                obj['value'] = formaPago.formapago;
                                obj['label'] = formaPago.descripcion;
                                arr.push(obj);
                            })
                            self.formasPago(arr);
                        }
                    }
                }).done(function(data) {
                    $('#formadepago-select').ojSelect("refresh");
                });
            };


            self.telefono = ko.observable("");

            self.rfc = ko.observable("");
            self.telefono = ko.observable("");
            self.pventa = ko.observable("");
            self.importe = ko.observable("");
            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);
            self.mail = ko.observable("");

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);


            self.submit = function(event, ui) {

                var data = {
                    'rfc': self.rfc().toUpperCase().trim(),
                    'total': self.importe(),
                    'formapago': self.formaPago()[0],
                    'pva': self.pva()[0],
                    'email': self.mail(),
                    'usocfdi': self.usoCFDI()[0],
                    'planta': localStorage.getItem("planta"),
                    'telefono': self.telefono(),
                    'tipo': "contado",
                    'usr_captura': app.userLogin()
                }


                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/factura.php",
                    data: data,
                    success: function(data) {
                        console.log(data);
                    }
                })
            }
        }
        return facturacionSolicitudesViewModel;
    });
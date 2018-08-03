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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionFletesViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
                table = document.getElementById('fletesCliente-table');
                table.addEventListener('selectionChanged', self.fletesClienteSelectionListener);
                table = document.getElementById('fletesCliente-facturar-table');
                table.addEventListener('selectionChanged', self.fletesClienteFacturarSelectionListener);
                self.getfletesSinDescargas();
            }

            self.handleBindingsApplied = function() {
                // document.getElementById('search').addEventListener('keyup', self.handleKeyUp);
                var clienteCollection, collection, clienteModel, pagingDatasource;
                var fetchSize = 10;
                clienteModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "telefono"
                });
                clienteCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "telefono",
                    model: clienteModel
                });
                self.clientes(new clienteCollection);
                self.datasource(new oj.CollectionTableDataSource(self.clientes()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.clientes().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }


            self.telefono = ko.observable();
            self.pva = ko.observable();
            self.ctaBanco = ko.observable();
            self.rfc = ko.observable();
            self.nombre = ko.observable();
            self.plazo = ko.observable();
            self.mails = ko.observable();
            self.paramsDialog = ko.observable();

            self.facturaFletes = function() {
                self.paramsDialog({ 'isLoading': true, 'promise': self.promiseFletes, 'dialog': { 'title': 'Procesando timbrado', body: 'Se está procesando el timbrado...' } });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseFletes = function() {
                return new Promise((resolve, reject) => {
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'cliente': self.telefono(),
                        'ctabanco': self.ctaBanco(),
                        'email': self.mails(),
                        'nombre': self.nombre(),
                        'formapago': self.formaPago()[0],
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'empresa': 2,
                        'telefono': self.telefono(),
                        'tipo': "fletes",
                        'usr_captura': app.userLogin(),
                        'conceptos': JSON.stringify(ko.toJSON(self.fletesClienteFacturarArray()))
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/factura.php",
                        data: data,
                        success: function(data) {
                            resolve(data); // Yay! Everything went well!
                            self.resetValues();
                        }
                    })
                });
            }


            function resetValues() {
                self.telefono(undefined);
                self.formaPago(undefined);
                self.plazo(undefined);
                self.ctaBanco(undefined);
                self.usoCFDI(undefined);
                self.mails(undefined);
                self.currentSelectedClient(undefined);
                self.fletesClienteFacturarArray([]);
                self.fletesClienteArray([]);
                self.paramsDialog(undefined);
                var clientsTable = document.getElementById('clients-paging-table');
                clientsTable.selection = null;
            }

            self.clientesSelectionListener = function(event, a) {
                var data = event.detail;
                if (data['value'] == null) {
                    resetValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var element = document.getElementById('clients-paging-table');
                    var currentRow = element.currentRow;
                    self.telefono(currentRow.rowKey);
                    self.dataprovider().get(self.telefono()).then(function(obj) {
                        var data = obj.data;
                        self.rfc(data.rfc);
                        self.nombre(data.nombre);
                        self.plazo(data.plazo);
                        self.mails(data.correos);
                        self.formaPago([data.formapago + "-" + data.formapago_descripcion]);
                        self.usoCFDI([data.usocfdi + "-" + data.usocfdi_descripcion]);
                        self.ctaBanco(data.cuenta_bancaria);
                    });
                    getFletesByCliente(self.telefono());
                    self.fletesClienteFacturarArray([]);
                }
            };

            self.shouldDisableSubmit = function() {
                if (self.formaPago() == undefined ||
                    self.rfc() == undefined ||
                    self.usoCFDI() == undefined ||
                    self.fletesClienteFacturarArray().length == 0) {
                    return true;
                } else {
                    return false;
                }
            };

            self.fletesClienteFacturarSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('fletesCliente-facturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.fletesClienteFacturarArray().length > 0) {
                        self.fletesClienteArray.push(self.fletesClienteFacturarArray()[currentRow['rowIndex']]);
                        self.fletesClienteFacturarArray.splice(currentRow['rowIndex'], 1);
                    }
                }
            };

            self.contextmenu_clientes_action = function(event) {
                initializeDialog();
                $("#detalle-cliente-dialog").ojDialog("open");
            }

            self.contextmenu_clientes_beforeOpen = function(event) {
                var target = event.detail.originalEvent.target;
                var context = document.getElementById("clients-paging-table").getContextByNode(target);
                if (self.telefono() == undefined) {
                    event.preventDefault();
                }
            };

            self.currentSelectedClient = ko.observable();

            self.asignarDatosFacturacion = function(data) {
                var data = {
                    'cliente': self.telefono(),
                    'formapago': self.formaPago()[0],
                    'usocfdi': self.usoCFDI()[0],
                    'mails': self.mails(),
                    'cuenta_bancaria': self.ctaBanco(),
                    'mails': self.mails() == undefined ? '' : self.mails()
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/asignarDatosFiscales.php",
                    data: data,
                    success: function(data) {
                        console.log(data);
                    }
                })

                $("#detalle-cliente-dialog").ojDialog("close");
                $("#search").focus();
            }

            self.fletesClienteSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('fletesCliente-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.fletesClienteArray().length > 0) {
                        var rowData = self.fletesClienteArray()[currentRow['rowIndex']];
                        if (!rowData.t_vencida && !rowData.p_vencido) {
                            self.fletesClienteFacturarArray.push(self.fletesClienteArray()[currentRow['rowIndex']]);
                            self.fletesClienteArray.splice(currentRow['rowIndex'], 1);
                        }
                    }
                }
            };

            function getFletesByCliente(cliente) {
                var data = { 'cliente': cliente };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getFletesCliente.php",
                    data: data,
                    success: function(data) {
                        data.forEach(function(obj) {
                            obj.cantidad = 1;
                            obj.descripcion = 'Embarque: ' + obj.embarque + ', Origen: ' + obj.origen + ', Destino: ' + obj.destino + ', Kilos: ' + obj.kilos + ', Flete: ' + obj.flete + ', Peaje: ' + obj.peaje;
                            obj.claveprodserv = 78101807;
                            obj.nombreProducto = 'Servicios de transporte de carga de petroleo o quimicos por carretera';
                            obj.valorUnitario = 0;
                            if(obj.flete)
                                obj.valorUnitario += parseFloat(obj.flete);
                            if(obj.peaje)
                                obj.valorUnitario += parseFloat(obj.peaje);
                        });
                        self.fletesClienteArray(data);
                    }
                })
            }

            self.fletesSinDescargasArray = ko.observableArray([]);
            self.fletesSinDescargasDataProvider = ko.observable(new oj.ArrayDataProvider(self.fletesSinDescargasArray, { idAttribute: 'claveprodserv' }));

            self.fletesSinDescargasColumnArray = [{
                    headerText: "Clave",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "claveprodserv"
                },
                {
                    headerText: "Descripción",
                    sortable: "disabled",
                    width: "400",
                    resizable: "enabled",
                    field: "descripcion"
                }
            ];


            self.getfletesSinDescargas = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_browse_fletes_sindescarga?transform=1",
                    success: function(data) {
                        data = data.web_browse_fletes_sindescarga;
                        self.fletesSinDescargasArray(data);
                        // self.fletesSinDescargasDataProvider(new oj.ArrayDataProvider(self.fletesSinDescargasArray));
                    }
                })
            }


            self.dataprovider = ko.observable();

            self.clientes = ko.observable();
            self.datasource = ko.observable();
            self.clientesArray = ko.observableArray();

            self.clientesColumnArray = [{
                    headerText: "Telefono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "telefono"
                },
                {
                    headerText: "Nombre",
                    field: "nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    width: "100"
                },
                {
                    headerText: "RFC",
                    sortable: "disabled",
                    field: "rfc",
                    resizable: "enabled"
                },
                {
                    headerText: "Calle",
                    sortable: "disabled",
                    field: "calle",
                    resizable: "enabled"
                },
                {
                    headerText: "Numero",
                    sortable: "disabled",
                    field: "numero",
                    resizable: "enabled"
                },
                {
                    headerText: "Método de pago",
                    sortable: "disabled",
                    field: "metodopago_descripcion",
                    resizable: "enabled"
                },
                {
                    headerText: "Forma de pago",
                    sortable: "disabled",
                    field: "formapago_descripcion",
                    resizable: "enabled"
                },

                {
                    headerText: "Uso CFDI",
                    sortable: "disabled",
                    field: "usocfdi_descripcion",
                    resizable: "enabled"
                },
                {
                    headerText: "Cuenta Bco",
                    sortable: "disabled",
                    field: "cuenta_bancaria",
                    resizable: "enabled"
                }
            ];

            self.fletesClienteColumnArray = [{
                    headerText: "Embarque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "embarque"
                },
                {
                    headerText: "Día",
                    field: "diaembarque",
                    sortable: "disabled",
                    resizable: "enabled",
                    width: "100"
                },
                {
                    headerText: "Origen",
                    sortable: "disabled",
                    field: "origen",
                    resizable: "enabled"
                },
                {
                    headerText: "Destino",
                    sortable: "disabled",
                    field: "destino",
                    resizable: "enabled"
                },
                {
                    headerText: "Planta",
                    sortable: "disabled",
                    field: "planta",
                    resizable: "enabled"
                },
                {
                    headerText: "Kilómetros",
                    sortable: "disabled",
                    field: "kms",
                    resizable: "enabled"
                },
                {
                    headerText: "Kilos",
                    sortable: "disabled",
                    field: "kilos",
                    resizable: "enabled"
                },

                {
                    headerText: "Flete",
                    sortable: "disabled",
                    field: "flete",
                    resizable: "enabled"
                },
                {
                    headerText: "Peaje",
                    sortable: "disabled",
                    field: "peaje",
                    resizable: "enabled"
                },
                {
                    headerText: "t_vencida",
                    sortable: "disabled",
                    field: "t_vencida",
                    resizable: "enabled"
                },
                {
                    headerText: "p_vencido",
                    sortable: "disabled",
                    field: "p_vencido",
                    resizable: "enabled"
                }
            ];


            self.fletesClienteArray = ko.observableArray([]);
            self.fletesClienteFacturarArray = ko.observableArray([]);
            self.fletesClienteDataProvider = new oj.ArrayDataProvider(self.fletesClienteArray);
            self.fletesClienteFacturarDataProvider = new oj.ArrayDataProvider(self.fletesClienteFacturarArray);
            self.search_value = ko.observable("");


            var latestFilter = "";
            self.getClientesPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.clientes();
                myCollection.refresh();
                resetValues();
            };

            function filterClientes() {
                var filter = latestFilter;
                if (filter === "") {
                    return "";
                }

                if (!isNaN(filter)) {
                    return "&filter[]=telefono,eq," + filter + "&satisfy=any";
                } else {
                    filter = filter.toUpperCase()
                    return "&filter[]=nombre,cs," + filter +
                        "&filter[]=rfc,cs," +
                        filter + "&filter[]=correos,cs," + filter +
                        "&filter[]=calle,cs," + filter + "&satisfy=any";
                }
            };

            function getUrl(operation, collection, options) {
                var fetchSize = 10;
                var url = "";
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/api.php/web_browse_clientes_fletes?transform=1";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterClientes();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        url += "&order=telefono&page=" + page + ",10";
                    }
                }
                return url;
            }

            function initializeDialog() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/getUsosCFDI.php",
                    success: function(data) {
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(usocfdi) {
                                var obj = {};
                                obj['value'] = usocfdi.usocfdi + "-" + usocfdi.descripcion;
                                obj['label'] = usocfdi.descripcion;
                                arr.push(obj);
                            })
                            self.usosCFDI(arr);
                        }
                    }
                }).done(function(data) {
                    $('#credito-usocfdi-select').ojSelect("refresh");
                });

                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesFacturador/getFormasPago.php",
                    success: function(data) {
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(formaPago) {
                                var obj = {};
                                obj['value'] = formaPago.formapago + "-" + formaPago.descripcion;
                                obj['label'] = formaPago.descripcion;
                                arr.push(obj);
                            })
                            self.formasPago(arr);
                        }
                    }
                }).done(function(data) {
                    $('#credito-formadepago-select').ojSelect("refresh");
                });
            };


            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);

        }
        return facturacionFletesViewModel;
    });
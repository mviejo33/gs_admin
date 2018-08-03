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
        function facturacionCreditoViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
                table = document.getElementById('porFacturar-table');
                table.addEventListener('selectionChanged', self.porFacturarSelectionListener);
                table = document.getElementById('aFacturar-table');
                table.addEventListener('selectionChanged', self.aFacturarSelectionListener);
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


            self.facturaCredito = function() {
                self.paramsDialog({ 'isLoading': true, 'promise': self.promiseCredito, 'dialog': { 'title': 'Procesando timbrado...', body: 'Se está procesando el timbrado...' } });
                $("#dialog-timbre").ojDialog("open");
            }
            self.promiseCredito = function() {
                return new Promise((resolve, reject) => {
                    var totales = getTotales();
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'total': totales.total,
                        'totalRemisionesKg': totales.totalRemisionesKg,
                        'totalRemisionesLt': totales.totalRemisionesLt,
                        'totalDescargas': totales.totalDescargas,
                        "kgDescargas": totales.kgDescargas,
                        "ltRemisiones": totales.ltRemisiones,
                        "kgRemisiones": totales.kgRemisiones,
                        'ctabanco': self.ctaBanco(),
                        'pva': self.pva(),
                        'email': self.mails(),
                        'plazo': self.plazo(),
                        'nombre': self.nombre(),
                        'formapago': self.formaPago()[0],
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'empresa': 1,
                        'telefono': self.telefono(),
                        'tipo': "credito",
                        'usr_captura': app.userLogin(),
                        'remisionesDescargas': JSON.stringify(self.aFacturarArray())
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


            function getTotales() {
                var total = 0,
                    totalDescargas = 0,
                    totalRemisionesKg = 0,
                    totalRemisionesLt = 0,
                    ltRemisiones = 0,
                    kgRemisiones = 0,
                    kgDescargas = 0;
                for (const value of self.aFacturarArray()) {
                    total += parseFloat(value.precio);
                    if (value.turno == undefined) {
                        totalDescargas += parseFloat(value.precio);
                        kgDescargas += parseFloat(value.kgs);
                    } else if (value.lts) {
                        totalRemisionesLt += parseFloat(value.precio);
                        ltRemisiones += parseFloat(value.lts);
                    } else if (value.kgs) {
                        totalRemisionesKg += parseFloat(value.precio);
                        kgRemisiones += parseFloat(value.kgs);
                    }
                }
                return {
                    "total": total,
                    "totalRemisionesKg": totalRemisionesKg,
                    "totalRemisionesLt": totalRemisionesLt,
                    "totalDescargas": totalDescargas,
                    "kgDescargas": kgDescargas,
                    "ltRemisiones": ltRemisiones,
                    "kgRemisiones": kgRemisiones
                };
            }

            function resetValues() {
                self.telefono(undefined);
                self.formaPago(undefined);
                self.plazo(undefined);
                self.ctaBanco(undefined);
                self.usoCFDI(undefined);
                self.mails(undefined);
                self.currentSelectedClient(undefined);
                self.aFacturarArray([]);
                self.paramsDialog(undefined);
                self.porFacturarArray([]);
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
                    getRemisionesDescargasByCliente(self.telefono());
                    self.aFacturarArray([]);
                }
            };

            self.shouldDisableSubmit = function() {
                if (self.formaPago() == undefined ||
                    self.rfc() == undefined ||
                    self.mails() == undefined ||
                    self.usoCFDI() == undefined ||
                    self.aFacturarArray().length == 0) {
                    return true;
                } else {
                    return false;
                }
            };

            var jeje = false;

            self.porFacturarSelectionListener = function(event, aaa) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('porFacturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.porFacturarArray().length > 0 & !jeje) {
                        self.pva(self.porFacturarArray()[currentRow['rowIndex']].pva);
                        self.aFacturarArray.push(self.porFacturarArray()[currentRow['rowIndex']]);
                        self.porFacturarArray.splice(currentRow['rowIndex'], 1);
                        jeje = true;
                    } else {
                        jeje = false;
                        element.selection = null;
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
                if (context != null) {
                    console.log("Cell: [" + context["rowIndex"] + ", " + context["columnIndex"] + "]");
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

            var jaja = false;

            self.aFacturarSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('aFacturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.aFacturarArray().length > 0 && !jaja) {
                        self.porFacturarArray.push(self.aFacturarArray()[currentRow['rowIndex']]);
                        self.aFacturarArray.splice(currentRow['rowIndex'], 1);
                        jaja = true;
                    } else {
                        jaja = false;
                        element.selection = null;
                    }
                }
            };

            function getRemisionesDescargasByCliente(cliente) {
                var data = { 'cliente': cliente };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getRemisionesDescargasByCliente.php",
                    data: data,
                    success: function(data) {
                        if (data) {
                            self.porFacturarArray(data);
                        }
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

            self.porFacturarColumnArray = [{
                    headerText: "Pva",
                    resizable: "enabled",
                    sortable: "disabled",
                    field: "pva"
                },
                {
                    headerText: "Folio",
                    sortable: "disabled",
                    field: "folio",
                    resizable: "enabled"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    field: "dia",
                    resizable: "enabled"
                },
                {
                    headerText: "Turno",
                    sortable: "disabled",
                    field: "turno",
                    resizable: "enabled"
                },
                {
                    headerText: "Lts",
                    sortable: "disabled",
                    field: "lts",
                    resizable: "enabled"
                },
                {
                    headerText: "Kgs",
                    sortable: "disabled",
                    field: "kgs",
                    resizable: "enabled"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    field: "precio",
                    resizable: "enabled"
                }
            ];

            self.porFacturarArray = ko.observableArray([]);
            self.aFacturarArray = ko.observableArray([]);
            self.porFacturarDataProvider = new oj.ArrayDataProvider(self.porFacturarArray);
            self.aFacturarDataProvider = new oj.ArrayDataProvider(self.aFacturarArray);
            self.search_value = ko.observable("");


            self.total = ko.computed(function() {
                var t = 0;
                for (const value of self.aFacturarArray()) {
                    t += parseFloat(value.precio);
                }
                return +t.toFixed(2);
            }, self);

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
                console.log(options);
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/api.php/web_browse_clientes?transform=1";
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
                        console.log(url);
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
        return facturacionCreditoViewModel;
    });
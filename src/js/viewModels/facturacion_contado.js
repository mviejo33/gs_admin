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
        function facturacionContadoViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
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
                            })
                            self.pvas(arr);
                            $('#pvas-select').ojSelect("refresh");
                        }
                    }
                })
            }

            self.clientes = ko.observable();
            self.datasource = ko.observable();

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

            var latestFilter = "";
            self.getClientesPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.clientes();
                myCollection.refresh();
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
                    }
                }
                return url;
            }

            self.telefono = ko.observable();
            self.pvas = ko.observable([]);
            self.pva = ko.observable();
            self.ctaBanco = ko.observable();
            self.rfc = ko.observable();
            self.nombre = ko.observable();
            self.mails = ko.observable();
            self.importe = ko.observable();


            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);
            self.paramsDialog = ko.observable();

            self.facturaContado = function() {
                var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'total': self.importe(),
                        'formapago': self.formaPago()[0],
                        'pva': self.pva()[0],
                        'email': self.mails(),
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'telefono': self.telefono(),
                        'tipo': "contado",
                        'usr_captura': app.userLogin()
                    }

                self.paramsDialog({
                    'isLoading': true,
                    'promise': self.promiseContado,
                    'dialog': { 'title': 'Procesando timbrado', 'body': 'Se está procesando el timbrado...' }
                });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseContado = function() {
                return new Promise((resolve, reject) => {
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'total': self.importe(),
                        'formapago': self.formaPago()[0],
                        'pva': self.pva()[0],
                        'email': self.mails(),
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'telefono': self.telefono(),
                        'tipo': "contado",
                        'empresa': 1,
                        'usr_captura': app.userLogin()
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/dev_factura.php",
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
                self.telefono(undefined);
                self.formaPago(undefined);
                self.ctaBanco(undefined);
                self.currentSelectedClient(undefined);
                self.usoCFDI(undefined);
                self.mails(undefined);
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
                        self.mails(data.correos);
                        self.formaPago([data.formapago + "-" + data.formapago_descripcion]);
                        self.usoCFDI([data.usocfdi + "-" + data.usocfdi_descripcion]);
                        self.ctaBanco(data.cuenta_bancaria);
                    });
                }
            };

            self.shouldDisableSubmit = function() {
                if (self.formaPago() &&
                    self.rfc() &&
                    self.importe() &&
                    self.pva() &&
                    self.mails() &&
                    self.usoCFDI()) {
                    return false;
                } else {
                    return true;
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

            self.asignarDatosFacturacion = function(data) {
                var data = {
                    'cliente': self.telefono(),
                    'formapago': self.formaPago()[0],
                    'usocfdi': self.usoCFDI()[0],
                    'mails': self.mails(),
                    'cuenta_bancaria': self.ctaBanco()
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/asignarDatosFiscales.php",
                    data: data,
                    success: function(data) {
                        self.getClientesPaging();
                    }
                })

                $("#detalle-cliente-dialog").ojDialog("close");
                $("#search").focus();
            }

            self.currentSelectedClient = ko.observable();
            self.dataprovider = ko.observable();
            self.search_value = ko.observable("");



            self.clientesArray = ko.observableArray();

            self.clientesColumnArray = [{
                    headerText: "Telefono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "telefono"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    field: "nombre",
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
        }
        return facturacionContadoViewModel;
    });
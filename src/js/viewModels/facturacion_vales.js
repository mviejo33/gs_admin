/**s
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */

// pedidos page viewModel
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionValesViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
                table = document.getElementById('depositos-table');
                table.addEventListener('selectionChanged', self.depositosSelectionListener);
            }

            self.clientes = ko.observable();
            self.datasource = ko.observable();
            self.dataprovider = ko.observable();
            self.depositosDataProvider = ko.observable();
            self.search_value = ko.observable("");

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
            self.pva = ko.observable();
            self.ctaBanco = ko.observable();
            self.rfc = ko.observable();
            self.nombre = ko.observable();
            self.plazo = ko.observable();
            self.importeDeposito = ko.observable();
            self.mails = ko.observable();
            self.referencia = ko.observable();
            self.diaBanco = ko.observable();
            self.extraDescuento = ko.observable();
            self.remanente = ko.computed(function() {
                var importeDeposito = self.importeDeposito() == undefined ? 0 : parseFloat(self.importeDeposito());
                var extraDescuento = self.extraDescuento() == undefined ? 0 : parseFloat(self.extraDescuento());
                if (importeDeposito + extraDescuento > 0) {
                    var total = 0;
                    self.desgloses().forEach(function(element) {
                        if (element.monto() != null && element.cantidad() != null)
                            total += (element.monto() * element.cantidad());
                    });
                    return (importeDeposito + extraDescuento - total).toFixed(2);
                }
                return "";
            }, self);
            self.paramsDialog = ko.observable();
            self.desgloses = ko.observableArray([
                { monto: ko.observable(), cantidad: ko.observable() }
            ]);

            self.cuentaFilter = ko.observable();
            self.montoFilter = ko.observable();
            var today = new Date();
            var fivedaysago = new Date();
            fivedaysago.setDate(today.getDate() - 5);
            self.dateRangeFromValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(fivedaysago));
            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(today));
            self.datePicker = {
                numberOfMonths: 3
            };
            self.depositosArray = ko.observableArray();


            self.addDesglose = function() {
                self.desgloses.push({ monto: ko.observable(), cantidad: ko.observable() });
            }

            self.facturaVales = function() {
                self.paramsDialog({ 'isLoading': true, 'promise': self.promiseVales, 'dialog': { 'title': 'Procesando timbrado', body: 'Se está procesando el timbrado...' } });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseVales = function() {
                return new Promise((resolve, reject) => {
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'total': self.importeDeposito(),
                        'cliente': self.telefono(),
                        'ctabanco': self.ctaBanco(),
                        'email': self.mails(),
                        'nombre': self.nombre(),
                        'formapago': self.formaPago()[0],
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'telefono': self.telefono(),
                        'empresa': 1,
                        'tipo': "vales",
                        'diaBanco': self.diaBanco(),
                        'referencia': self.referencia(),
                        'usr_captura': app.userLogin(),
                        'desgloseVales': JSON.stringify(ko.toJSON(self.desgloses()))
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/factura.php",
                        data: data,
                        success: function(data) {
                            resolve(data); // Yay! Everything went well!
                            // resetValues();
                            // resetDepositos();
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve("No se pudo timbrar"); // Yay! Everything went well!
                        }
                    })
                });
            }

            function resetValues() {
                self.telefono(undefined);
                self.formaPago(undefined);
                self.ctaBanco(undefined);
                self.mails(undefined);
                self.paramsDialog(undefined);
                self.currentSelectedClient(undefined);
                self.usoCFDI(undefined);
                self.nombre(undefined);
                self.diaBanco(undefined);
                self.desgloses([{ monto: ko.observable(), cantidad: ko.observable() }]);
                self.importeDeposito(undefined);
                var clientsTable = document.getElementById('clients-paging-table');
                clientsTable.selection = null;
            }

            function getDescuento() {
                if (self.importeDeposito() && self.telefono()) {
                    var data = {
                        'cliente': self.telefono(),
                        'planta': localStorage.getItem("planta"),
                        'total': self.importeDeposito()
                    };
                    $.ajax({
                        method: "POST",
                        url: "https://gaslicuadosabinas.com/servicesAdmin/getDescuentoCliente.php",
                        data: data,
                        success: function(data) {
                            data = parseFloat(data);
                            if (data > 0) {
                                self.extraDescuento(parseFloat(data));
                            }
                        }
                    })
                }
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
                    getDescuento();
                    self.dataprovider().get(self.telefono()).then(function(obj) {
                        var data = obj.data;
                        self.telefono(data.telefono);
                        self.nombre(data.nombre);
                        self.rfc(data.rfc);
                        self.mails(data.correos);
                        self.formaPago([data.formapago + "-" + data.formapago_descripcion]);
                        self.usoCFDI([data.usocfdi + "-" + data.usocfdi_descripcion]);
                    });
                }
            };

            self.depositosSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('depositos-table');
                    var index = element.currentRow.rowKey;
                    self.importeDeposito(self.depositosArray()[index].importe);
                    getDescuento();
                    self.diaBanco(self.depositosArray()[index].dia);
                    self.referencia(self.depositosArray()[index].referencia);
                    self.ctaBanco(self.depositosArray()[index].cuenta);
                }
            };

            self.contextmenu_clientes_action = function(event) {
                $("#detalle-cliente-dialog").ojDialog("open");
                initializeDialog();
            }

            self.currentSelectedClient = ko.observable();

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
                    'mails': self.mails(),
                    'usocfdi': self.usoCFDI()[0],
                    'cuenta_bancaria': self.ctaBanco()
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
                    field: "rfc",
                    sortable: "disabled",
                    resizable: "enabled"
                },
                {
                    headerText: "Calle",
                    field: "calle",
                    sortable: "disabled",
                    resizable: "enabled"
                },
                {
                    headerText: "Numero",
                    field: "numero",
                    sortable: "disabled",
                    resizable: "enabled"
                },
                {
                    headerText: "Método de pago",
                    field: "metodopago_descripcion",
                    sortable: "disabled",
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

            self.depositosColumnArray = [{
                    headerText: "Nombre",
                    resizable: "enabled",
                    sortable: "disabled",
                    field: "nombre",
                },
                {
                    headerText: "Referencia",
                    sortable: "disabled",
                    field: "referencia",
                    resizable: "enabled",
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    field: "dia",
                    resizable: "enabled",
                },
                {
                    headerText: "Importe",
                    field: "importe",
                    sortable: "disabled",
                    resizable: "enabled",
                },
                {
                    headerText: "Cuenta",
                    field: "cuenta",
                    sortable: "disabled",
                    resizable: "enabled",
                },
                {
                    headerText: "Comentario",
                    sortable: "disabled",
                    field: "comentario",
                    resizable: "enabled",
                }
            ];


            self.shouldDisableSubmit = function() {
                if (self.remanente() > 0 || self.telefono() == undefined ||
                    self.referencia() == undefined ||
                    self.importeDeposito() == undefined ||
                    self.diaBanco() == undefined ||
                    self.ctaBanco() == undefined ||
                    self.mails() == undefined) {
                    return true;
                } else {
                    return false;
                }
            };

            self.resetDepositos = function() {
                self.cuentaFilter(undefined);
                self.montoFilter(undefined);
                self.referencia(undefined);
                self.importeDeposito(undefined);
                self.dateRangeToValue(undefined);
                self.dateRangeFromValue(undefined);
                self.depositosArray([]);
                var depositosTable = document.getElementById('depositos-table');
                depositosTable.selection = null;
            }

            self.getDepositos = function() {
                var data = {
                    'from': self.dateRangeFromValue(),
                    'to': self.dateRangeToValue(),
                    'cuenta': self.cuentaFilter(),
                    'monto': self.montoFilter(),
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getDepositos.php",
                    data: data,
                    success: function(data) {
                        var depositosTable = document.getElementById('depositos-table');
                        depositosTable.selection = null;
                        if (Array.isArray(data)) {
                            self.depositosArray(data);
                            self.depositosDataProvider(new oj.ArrayDataProvider(self.depositosArray));
                        }
                    }
                })
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
        return new facturacionValesViewModel();
    });
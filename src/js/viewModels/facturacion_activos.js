/**
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
        function facturacionActivosViewModel() {
            var self = this;

            self.handleAttached = function() {
                initializeSelects();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
                table = document.getElementById('unidades-table');
                table.addEventListener('selectionChanged', self.unidadesSelectionListener);
                table = document.getElementById('productos-table');
                table.addEventListener('selectionChanged', self.productosSelectionListener);
            }

            function initializeSelects() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/empresa?transform=1",
                    success: function(data) {
                        var data = data.empresa;
                        var arr = [];
                        if (typeof data == 'object') {
                            data.forEach(function(empresa) {
                                var obj = {};
                                obj['value'] = empresa.empresa;
                                obj['label'] = empresa.nombre;
                                arr.push(obj);
                            })
                            self.empresas(arr);
                        }
                    }
                }).done(function(data) {
                    $('#empresas-select').ojSelect("refresh");
                });

            };

            self.clientes = ko.observable();
            self.datasource = ko.observable();
            self.dataprovider = ko.observable();
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
                self.resetClientesValues();
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
            self.ctaBanco = ko.observable();
            self.rfc = ko.observable();
            self.nombre = ko.observable();
            self.mails = ko.observable();
            self.paramsDialog = ko.observable();
            self.productoFilter = ko.observable();
            self.conceptos = ko.observableArray([]);

            self.facturaActivos = function() {
                self.paramsDialog({ 'isLoading': true, 'promise': self.promiseActivos, 'dialog': { 'title': 'Procesando timbrado', body: 'Se está procesando el timbrado...' } });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseActivos = function() {
                return new Promise((resolve, reject) => {
                    console.log(self.empresa()[0]);
                    var data = {
                        'rfc': self.rfc().toUpperCase().trim(),
                        'cliente': self.telefono(),
                        'ctabanco': self.ctaBanco(),
                        'email': self.mails(),
                        'nombre': self.nombre(),
                        'formapago': self.formaPago()[0],
                        'usocfdi': self.usoCFDI()[0],
                        'planta': localStorage.getItem("planta"),
                        'empresa': 1,
                        'telefono': self.telefono(),
                        'tipo': "activos",
                        'usr_captura': app.userLogin(),
                        'cuentapredial': self.cuentaPredial(),
                        'conceptos_activos': JSON.stringify(ko.toJSON(self.conceptos())),
                        'empresa': self.empresa()[0]
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/factura.php",
                        data: data,
                        success: function(data) {
                            resolve(data); // Yay! Everything went well!
                            self.conceptos([]);
                            self.resetClientesValues();
                            self.resetUnidadesValues();
                            self.resetProductosValues();
                        }
                    })
                });
            }

            self.resetClientesValues = function() {
                self.telefono(undefined);
                self.formaPago(undefined);
                self.ctaBanco(undefined);
                self.mails(undefined);
                self.paramsDialog(undefined);
                self.currentSelectedClient(undefined);
                self.usoCFDI(undefined);
                self.nombre(undefined);
                var clientsTable = document.getElementById('clients-paging-table');
                clientsTable.selection = null;
            }

            self.precioUnitario = ko.observable();
            self.cantidad = ko.observable();
            self.unidad = ko.observable();
            self.unidades = ko.observableArray([]);
            self.empresa = ko.observable();
            self.empresas = ko.observableArray([]);
            self.descripcion = ko.observable();

            self.clientesSelectionListener = function(event, a) {
                var data = event.detail;
                if (data['value'] == null) {
                    self.resetClientesValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var element = document.getElementById('clients-paging-table');
                    var currentRow = element.currentRow;
                    self.telefono(currentRow.rowKey);
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

            self.producto = ko.observable();
            self.nombreProducto = ko.observable();



            self.productosSelectionListener = function(event) {
                var data = event.detail;
                if (data['value'] == null) {
                    self.resetProductosValues();
                    return;
                }

                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('productos-table');
                    var index = element.currentRow.rowKey;
                    self.producto(self.productosArray()[index].claveprodserv);
                    self.nombreProducto(self.productosArray()[index].descripcion);
                    if (self.producto() == 80131500 ||
                        self.producto() == 80131501 ||
                        self.producto() == 80131502 ||
                        self.producto() == 80131503) {
                        self.isArrendamiento(true);
                    }
                }
            };

            self.isArrendamiento = ko.observable(false);
            self.cuentaPredial = ko.observable();

            self.resetUnidadesValues = function() {
                self.unidad(undefined);
                self.unidadesFilter(undefined);
                self.unidadesArray([]);
                self.unidadesDataProvider(new oj.ArrayDataProvider(self.unidadesArray));
                var unidadesTable = document.getElementById('unidades-table');
                unidadesTable.selection = null;
            }

            self.unidadesSelectionListener = function(event) {
                var data = event.detail;
                if (data['value'] == null) {
                    self.resetUnidadesValues();
                    return;
                }
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('unidades-table');
                    var index = element.currentRow.rowKey;
                    self.unidad(self.unidadesArray()[index].claveunidad);
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

            self.productosArray = ko.observableArray([]);
            self.productosDataProvider = ko.observable(new oj.ArrayDataProvider(self.productosArray, { idAttribute: 'claveprodserv' }));

            self.productosColumnArray = [{
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

            self.unidadesFilter = ko.observable();
            self.unidadesArray = ko.observableArray([]);
            self.unidadesDataProvider = ko.observable(new oj.ArrayDataProvider(self.unidadesArray), { idAttribute: 'claveunidad' });

            self.unidadesColumnArray = [{
                    headerText: "Clave",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "claveunidad"
                },
                {
                    headerText: "Descripción",
                    sortable: "disabled",
                    width: "400",
                    resizable: "enabled",
                    field: "nombre"
                }
            ];

            self.deleteConcepto = function(index, data) {
                self.conceptos.splice(index, 1)
            }

            self.shouldDisableSubmitTimbra = function() {
                if (self.conceptos().length > 0 &&
                    self.telefono() &&
                    self.formaPago() &&
                    self.rfc() &&
                    self.mails() &&
                    self.usoCFDI()) {
                    return false;
                } else {
                    return true;
                }
            };

            self.shouldDisableSubmitAddConcepto = function() {
                if (
                    self.cantidad() &&
                    self.empresa() &&
                    self.descripcion() &&
                    self.producto() &&
                    self.unidad() &&
                    self.precioUnitario()
                ) {

                    if (self.isArrendamiento() == true) {
                        if (self.cuentaPredial()) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return true;
                }
            };

            self.resetProductosValues = function() {
                self.productosArray([]);
                self.productosDataProvider(new oj.ArrayDataProvider(self.productosArray));
                self.productoFilter(undefined);
                var productosTable = document.getElementById('productos-table');
                productosTable.selection = null;
            }

            self.getProductos = function() {
                var filter = "";
                if (!isNaN(self.productoFilter())) {
                    filter = "claveprodserv,eq," + self.productoFilter();
                } else {
                    if (self.productoFilter().toString().length < 4) {
                        return;
                    } else {
                        filter = "descripcion,cs," + self.productoFilter();
                    }
                }
                var excludeIds = "&filter[]=claveprodserv,nin,70101801,70101802,70101803,70101804,70101805,70101806,70101807";
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_cfdi_claveprodserv?transform=1&filter[]=" + filter + excludeIds + "&satisfy=all&order=claveprodserv&page=1,50",
                    success: function(data) {
                        data = data.web_cfdi_claveprodserv;
                        var productosTable = document.getElementById('productos-table');
                        productosTable.selection = null;
                        self.productosArray(data);
                        self.productosDataProvider(new oj.ArrayDataProvider(self.productosArray));
                    }
                })
            }

            self.getUnidades = function() {
                var filter = "";
                filter = "&filter[]=claveunidad,cs," + self.unidadesFilter().toUpperCase() + "&filter[]=nombre,cs," + self.unidadesFilter();
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_cfdi_claveunidad?transform=1" + filter + "&satisfy=any&order=claveunidad&page=1,50",
                    success: function(data) {
                        data = data.web_cfdi_claveunidad;
                        var unidadesTable = document.getElementById('unidades-table');
                        unidadesTable.selection = null;
                        self.unidadesArray(data);
                        self.unidadesDataProvider(new oj.ArrayDataProvider(self.unidadesArray));
                    }
                })
            }

            self.agregaConcepto = function() {
                self.conceptos.push({ nombreProducto: self.nombreProducto(), descripcion: self.descripcion(), unidad: self.unidad(), valorUnitario: self.precioUnitario(), cantidad: self.cantidad(), claveprodserv: self.producto() });
                self.resetCapturaConceptoValues();
            }

            self.resetCapturaConceptoValues = function() {
                self.resetProductosValues();
                self.resetUnidadesValues();
                self.precioUnitario(undefined);
                self.cantidad(undefined);
                self.descripcion(undefined);
                $('#empresas-select').ojSelect("refresh");
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
        return new facturacionActivosViewModel();
    });
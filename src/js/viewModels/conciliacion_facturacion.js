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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojswitch', 'ojs/ojpagingcontrol', 'ojs/ojdatacollection-utils', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionFletesViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('clients-paging-table');
                table.addEventListener('selectionChanged', self.clientesSelectionListener);
                table = document.getElementById('pagosPendientes-table');
                table.addEventListener('selectionChanged', self.pagosPendientesSelectionListener);
                table = document.getElementById('facturasPendientes-table');
                table.addEventListener('ojBeforeRowEditEnd', self.beforeRowEditEndListenerFP);
                table.addEventListener('ojBeforeRowEditEnd', self.shouldDisableSubmit);
                table = document.getElementById('remisionesPendientes-table');
                table.addEventListener('ojBeforeRowEditEnd', self.beforeRowEditEndListenerRP);
                table = document.getElementById('facturasConciliadas-table');
                table.addEventListener('selectionChanged', self.facturasConciliadasSelectionListener);
                table = document.getElementById('remisionesConciliadas-table');
                table.addEventListener('selectionChanged', self.remisionesConciliadasSelectionListener);
            }



            self.initializeClientesTable = function(resetAll, event) {
                if (resetAll) {
                    resetAllValues();
                    var table = document.getElementById('clients-paging-table');
                    table.selection = null;
                }
                var clienteCollection, collection, clienteModel, pagingDatasource;
                var fetchSize = 10;
                clienteModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "cliente"
                });
                clienteCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "cliente",
                    model: clienteModel
                });
                self.clientes(new clienteCollection);
                self.clientesDataSource(new oj.CollectionTableDataSource(self.clientes()));
                self.clientesDataProvider(new oj.PagingTableDataSource(self.clientesDataSource()));

                self.clientes().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }

            self.handleBindingsApplied = function() {
                self.initializeClientesTable();
            }

            self.filterPendientes = ko.observable(false);
            self.telefono = ko.observable();
            self.noCheque = ko.observable();
            self.pagoUUID = ko.observable();
            self.pagoId = ko.observable();
            self.dia = ko.observable();
            self.paramsDialog = ko.observable({ 'dialog': { 'title': 'Procesando...' } });


            self.contextmenu_clientes_action = function(event) {
                var element = document.getElementById('clients-paging-table');
                var currentRow = element.currentRow;
                self.clientesDataProvider().get(currentRow.rowKey).then(function(obj) {
                    var cliente = obj.data;
                    var data = {
                        'cliente': cliente.cliente,
                        'nombre': cliente.nombre.trim(),
                        'pendiente': self.filterPendientes() ? 1 : 0
                    };
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/descargaXMLCredito.php",
                        responseType: 'blob',
                        data: data,
                        success: function(data) {
                            var blob = new Blob([data], { type: "application/csv" });
                            var link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            var dateString = new Date(Date.now()).toLocaleString();
                            link.download = "credito_" + self.telefono() + "_" + dateString + ".csv";
                            link.click();
                        }
                    })
                })
            }

            self.contextmenu_clientes_beforeOpen = function(event) {
                var target = event.detail.originalEvent.target;
                var context = document.getElementById("clients-paging-table").getContextByNode(target);
                if (self.telefono() == undefined) {
                    event.preventDefault();
                }
            };

            self.downloadClientsSheet = function() {
                var data = {
                    'pendiente': self.filterPendientes() ? 1 : 0
                };
                $.ajax({
                    method: "POST",
                    url: "https://198.100.45.73/servicesFacturador/descargaXMLCreditoSumatoria.php",
                    responseType: 'blob',
                    data: data,
                    success: function(data) {
                        var blob = new Blob([data], { type: "application/csv" });
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        var dateString = new Date(Date.now()).toLocaleString();
                        link.download = "credito_sumatoria" + "_" + dateString + ".csv";
                        link.click();
                    }
                })

            }

            function resetAllValues() {
                self.dia(undefined);
                self.noCheque(undefined);
                self.pagoId(undefined);
                self.pagoUUID(undefined);
                var table = document.getElementById('pagosPendientes-table');
                table.selection = null;
                table = document.getElementById('facturasPendientes-table');
                table.selection = null;
                table = document.getElementById('remisionesPendientes-table');
                table.selection = null;
                table = document.getElementById('facturasConciliadas-table');
                table.selection = null;
                table = document.getElementById('remisionesConciliadas-table');
                table.selection = null;
                self.pagosPendientesArray([]);
                self.facturasPendientesArray([]);
                self.facturasPendientesArrayOriginal([]);
                self.remisionesPendientesArray([]);
                self.remisionesPendientesArrayOriginal([]);
                self.facturasConciliadasArray([]);
                self.remisionesConciliadasArray([]);
            }

            self.pagosPendientesSelectionListener = function(event, a) {
                var data = event.detail;
                var element = document.getElementById('pagosPendientes-table');
                var currentRow = element.currentRow;
                if (currentRow == null || data['value'].length == 0) {
                    self.noCheque(undefined);
                    self.pagoId(undefined);
                    self.dia(undefined);
                    self.pagoUUID(undefined);
                    var table = document.getElementById('pagosPendientes-table');
                    table.selection = null;
                    table = document.getElementById('facturasPendientes-table');
                    table.selection = null;
                    table = document.getElementById('remisionesPendientes-table');
                    table.selection = null;
                    table = document.getElementById('facturasConciliadas-table');
                    table.selection = null;
                    table = document.getElementById('remisionesConciliadas-table');
                    table.selection = null;
                    self.facturasPendientesArray([]);
                    self.facturasPendientesArrayOriginal([]);
                    self.remisionesPendientesArray([]);
                    self.remisionesPendientesArrayOriginal([]);
                    self.facturasConciliadasArray([]);
                    self.remisionesConciliadasArray([]);
                    return;
                }
                if (event.type == 'selectionChanged') {
                    self.pagosPendientesDataProvider().fetchByOffset({ offset: currentRow.rowIndex }).then(function(value) {
                        $("#dialog-loading").ojDialog("open");

                        var row = value['results'][0]['data'];
                        self.noCheque(row.nocheque);
                        self.pagoId(row.pago_id);
                        self.pagoUUID(row.uuid);
                        self.dia(row.dia);
                        var d1 = $.Deferred();
                        var d2 = $.Deferred();
                        var d3 = $.Deferred();
                        var d4 = $.Deferred();

                        $.when(d1, d2, d3, d4).done(function(v1, v2, v3, v4) {
                            $("#dialog-loading").ojDialog("close");
                        });

                        getRemisionesPorConciliarByCliente(row, d1);
                        getFacturasPorConciliarByCliente(row, d2);


                        getFacturasConciliadasByPago(row, d3);
                        getRemisionesConciliadasByPago(row, d4);

                    });


                }
            };

            self.clientesSelectionListener = function(event, a) {
                var data = event.detail;
                if (data['value'] == null) {
                    resetAllValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    resetAllValues();
                    $("#dialog-loading").ojDialog("open");
                    var element = document.getElementById('clients-paging-table');
                    var currentRow = element.currentRow;
                    var d1 = $.Deferred();

                    $.when(d1).done(function(v1) {
                        $("#dialog-loading").ojDialog("close");
                    });

                    self.telefono(currentRow.rowKey);
                    getPagosPendientesByCliente(self.telefono(), d1);
                }
            };

            function getRemisionesPorConciliarByCliente(row, d1) {
                var data = {
                    'privilege': app.privilege(),
                    'pago_id': self.pagoId(),
                    'dia': row.dia
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getRemisionesPorConciliarByCliente.php",
                    data: data,
                    success: function(data) {
                        var tableId = "remisionesPendientes-table";
                        var table = document.getElementById(tableId);
                        if (Array.isArray(data)) {

                            var dataClone = Array.prototype.slice.call(data);
                            self.remisionesPendientesArrayOriginal(data.slice(0));
                            self.remisionesPendientesArray(JSON.parse(JSON.stringify(data)));
                            table.selection = null;
                        } else {
                            self.remisionesPendientesArrayOriginal([]);
                            self.remisionesPendientesArray([]);
                        }
                        d1.resolve();
                    }
                });
            }

            function getFacturasPorConciliarByCliente(row, d1) {
                var data = {
                    'privilege': app.privilege(),
                    'pago_id': self.pagoId(),
                    'dia': row.dia
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getFacturasPorConciliarByCliente.php",
                    data: data,
                    success: function(data) {
                        var tableId = "facturasPendientes-table";
                        var table = document.getElementById(tableId);
                        if (Array.isArray(data)) {
                            var dataClone = Array.prototype.slice.call(data);
                            self.facturasPendientesArrayOriginal(data.slice(0));
                            self.facturasPendientesArray(JSON.parse(JSON.stringify(data)));
                            table.selection = null;
                        } else {
                            self.facturasPendientesArrayOriginal([]);
                            self.facturasPendientesArray([]);
                        }
                        d1.resolve();
                    }
                });
            }

            function getPagosPendientesByCliente(cliente, d1) {
                var data = {
                    'cliente': cliente,
                    'filterpendientes': self.filterPendientes() ? 1 : 0
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPagosPendientesByCliente.php",
                    data: data,
                    success: function(data) {
                        var tableId = "pagosPendientes-table";
                        var table = document.getElementById(tableId);
                        // table.selection = null;
                        self.pagosPendientesArray(data);
                        d1.resolve();
                    }
                });
            }

            function getFacturasConciliadasByPago(row, d1) {
                var data = {
                    'id_pago': self.pagoId()
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getFacturasConciliadasByPago.php",
                    data: data,
                    success: function(data) {
                        var tableId = "facturasConciliadas-table";
                        var table = document.getElementById(tableId);
                        table.selection = null;
                        if (Array.isArray(data)) {
                            self.facturasConciliadasArray(data);
                        } else {
                            self.facturasConciliadasArray([]);
                        }
                        d1.resolve();
                    }
                });
            }

            function getRemisionesConciliadasByPago(row, d1) {
                var data = {
                    'id_pago': self.pagoId()
                };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getRemisionesConciliadasByPago.php",
                    data: data,
                    success: function(data) {
                        var table = document.getElementById('remisionesConciliadas-table');
                        table.selection = null;
                        if (Array.isArray(data)) {
                            self.remisionesConciliadasArray(data);
                        } else {
                            self.remisionesConciliadasArray([]);
                        }
                        d1.resolve();
                    }
                });
            }

            self.shouldDisableSubmit = function() {
                // if () {
                //     return true;
                // } else {
                //     return false;
                // }
            };

            self.isEditableFP = ko.computed(function() {
                if (self.telefono() && self.noCheque()) {
                    return 'rowEdit';
                } else {
                    return 'none';
                }
            });

            self.beforeRowEditEndListenerFP = function(event) {
                if (event.detail.originalEvent.key == "Enter") {
                    var rowIdx = event.detail.rowContext.status.rowIndex;

                    self.facturasPendientesDataProvider().fetchByOffset({ offset: rowIdx }).then(function(value) {
                        var data = event.detail;
                        var row = value['results'][0]['data'];

                        var table = document.getElementById('pagosPendientes-table');
                        var currentRow = table.currentRow;


                        //default es el menor entre el x_asignar pago y el x_asignar de remision y no pasarse de ese num
                        var upperLimit = Math.min(self.facturasPendientesArrayOriginal()[rowIdx].x_asignar, self.pagosPendientesArray()[currentRow.rowIndex].x_asignar);

                        if (row.x_asignar > upperLimit || row.x_asignar <= 0) {
                            self.facturasPendientesArray()[rowIdx].x_asignar = self.facturasPendientesArrayOriginal()[rowIdx].x_asignar;
                            return;
                        }


                        if (oj.DataCollectionEditUtils.basicHandleRowEditEnd(event, data) === false || self.telefono() == undefined || self.noCheque() == undefined) {
                            self.facturasPendientesArray()[rowIdx].total = self.facturasPendientesArrayOriginal()[rowIdx].total;
                            event.preventDefault();
                            return;
                        }

                        var element = document.getElementById('pagosPendientes-table');
                        var currentRow = element.currentRow;
                        var data = {
                            cliente: self.telefono(),
                            nocheque: self.noCheque(),
                            pago_id: self.pagoId(),
                            dia: self.pagosPendientesArray()[currentRow.rowIndex].dia,
                            serie: row.serie,
                            pventa: row.pva,
                            remision: row.remision,
                            factura: row.id,
                            abono: row.x_asignar,
                            usr_captura: app.userLogin(),
                            tipo: 3
                        }
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/conciliacionFacturacion.php",
                            data: data,
                            success: function(data) {
                                if (data.includes("allgood")) {
                                    $("#dialog-loading").ojDialog("open");
                                    var d1 = $.Deferred();
                                    var d2 = $.Deferred();
                                    var d3 = $.Deferred();
                                    var d4 = $.Deferred();

                                    $.when(d1, d2, d3, d4).done(function(v1, v2, v3, v4) {
                                        $("#dialog-loading").ojDialog("close");
                                    });

                                    getPagosPendientesByCliente(self.telefono(), d1);
                                    var element = document.getElementById('pagosPendientes-table');
                                    var currentRow = element.currentRow;
                                    getFacturasPorConciliarByCliente(self.pagosPendientesArray()[currentRow.rowIndex], d2);
                                    getFacturasConciliadasByPago(self.pagosPendientesArray()[currentRow.rowIndex], d3);
                                    self.getClientesPaging(undefined, d4);
                                }
                                // self.resetAllValues();
                            }
                        });
                    });
                }
            };


            self.beforeRowEditEndListenerRP = function(event) {
                if (event.detail.originalEvent.key == "Enter") {
                    var rowIdx = event.detail.rowContext.status.rowIndex;
                    self.remisionesPendientesDataProvider().fetchByOffset({ offset: rowIdx }).then(function(value) {
                        var data = event.detail;
                        var row = value['results'][0]['data'];

                        var table = document.getElementById('pagosPendientes-table');
                        var currentRow = table.currentRow;

                        var upperLimit = Math.min(self.remisionesPendientesArrayOriginal()[rowIdx].x_asignar, self.pagosPendientesArray()[currentRow.rowIndex].x_asignar);




                        if (row.x_asignar > upperLimit || row.x_asignar <= 0) {
                            self.remisionesPendientesArray()[rowIdx].x_asignar = self.remisionesPendientesArrayOriginal()[rowIdx].x_asignar;
                            return;
                        }


                        if (oj.DataCollectionEditUtils.basicHandleRowEditEnd(event, data) === false ||
                            self.telefono() == undefined ||
                            self.noCheque() == undefined) {
                            event.preventDefault();
                            return;
                        }
                        var element = document.getElementById('pagosPendientes-table');
                        var currentRow = element.currentRow;

                        var data = {
                            cliente: self.telefono(),
                            nocheque: self.noCheque(),
                            dia: self.pagosPendientesArray()[currentRow.rowIndex].dia,
                            pva: row.pventa,
                            remision: row.remision,
                            folio: row.folio,
                            rem_id: row.rem_id,
                            pago_id: self.pagoId(),
                            usr_captura: app.userLogin(),
                            abono: row.x_asignar,
                            tipo: 4
                        }
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/conciliacionFacturacion.php",
                            data: data,
                            success: function(data) {
                                if (data.includes("allgood")) {
                                    var d1 = $.Deferred();
                                    var d2 = $.Deferred();
                                    var d3 = $.Deferred();
                                    var d4 = $.Deferred();
                                    $("#dialog-loading").ojDialog("open");

                                    $.when(d1, d2, d3, d4).done(function(v1, v2, v3, v4) {

                                        $("#dialog-loading").ojDialog("close");
                                    });

                                    self.getClientesPaging(undefined, d1);
                                    getPagosPendientesByCliente(self.telefono(), d2);
                                    var element = document.getElementById('pagosPendientes-table');
                                    var currentRow = element.currentRow;
                                    getRemisionesPorConciliarByCliente(self.pagosPendientesArray()[currentRow.rowIndex], d3);
                                    // getFacturasPorConciliarByCliente(self.telefono());

                                    getRemisionesConciliadasByPago(self.pagosPendientesArray()[currentRow.rowIndex], d4);
                                }
                            }
                        })
                    });
                } else {
                    event.detail.cancelEdit = true;
                }
            };

            self.facturasConciliadasSelectionListener = function(event) {
                var data = event.detail;
                var element = document.getElementById('facturasConciliadas-table');
                var currentRow = element.currentRow;

                if (data['value'] == null) {
                    return;
                }

                if (event.type == 'selectionChanged' && !self.pagoUUID()) {
                    self.facturasConciliadasDataProvider().fetchByOffset({ offset: currentRow.rowIndex }).then(function(value) {
                        var row = value['results'][0]['data'];
                        var data = {
                            'id': row.id,
                            // 'cliente': self.telefono(),
                            // 'nocheque': self.noCheque(),
                            // 'dia': self.dia(),
                            // 'factura': row.factura,
                            'tipo': 5
                        }
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/conciliacionFacturacion.php",
                            data: data,
                            success: function(data) {
                                $("#dialog-loading").ojDialog("open");

                                var d1 = $.Deferred();
                                var d2 = $.Deferred();
                                var d3 = $.Deferred();

                                $.when(d1, d2, d3).done(function(v1, v2, v3) {
                                    $("#dialog-loading").ojDialog("close");
                                });
                                self.getClientesPaging(undefined, d1);
                                var table = document.getElementById('facturasConciliadas-table');
                                table.selection = null;
                                var element = document.getElementById('pagosPendientes-table');
                                var currentRow = element.currentRow;
                                getPagosPendientesByCliente(self.telefono(), d2);
                                getFacturasPorConciliarByCliente(self.pagosPendientesArray()[currentRow.rowIndex], d3);

                            }
                        });
                    });
                }
            };
            self.remisionesConciliadasSelectionListener = function(event) {
                var data = event.detail;
                var element = document.getElementById('remisionesConciliadas-table');
                var currentRow = element.currentRow;

                if (data['value'] == null) {
                    return;
                }

                if (event.type == 'selectionChanged') {

                    self.remisionesConciliadasDataProvider().fetchByOffset({ offset: currentRow.rowIndex }).then(function(value) {
                        var row = value['results'][0]['data'];
                        var data = {
                            'id': row.id,
                            // 'cliente': self.telefono(),
                            // 'nocheque': self.noCheque(),
                            // 'remision': row.remsion,
                            // 'dia': self.dia(),
                            // 'pva': row.pva,
                            // 'factura': row.factura,
                            'tipo': 6
                        }
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/conciliacionFacturacion.php",
                            data: data,
                            success: function(data) {
                                $("#dialog-loading").ojDialog("open");

                                var d1 = $.Deferred();
                                var d2 = $.Deferred();
                                var d3 = $.Deferred();

                                $.when(d1, d2, d3).done(function(v1, v2, v3) {
                                    $("#dialog-loading").ojDialog("close");
                                });
                                self.getClientesPaging(undefined, d1);
                                var table = document.getElementById('remisionesConciliadas-table');
                                table.selection = null;
                                getPagosPendientesByCliente(self.telefono(), d2);
                                var element = document.getElementById('pagosPendientes-table');
                                var currentRow = element.currentRow;
                                getRemisionesPorConciliarByCliente(self.pagosPendientesArray()[currentRow.rowIndex], d3);
                            }
                        });
                    });
                }
            };



            self.currentSelectedClient = ko.observable();

            self.pagosPendientesArray = ko.observableArray([]);
            self.pagosPendientesDataProvider = ko.observable(new oj.ArrayDataProvider(self.pagosPendientesArray));

            self.facturasPendientesArray = ko.observableArray([]);
            self.facturasPendientesArrayOriginal = ko.observableArray([]);
            self.facturasPendientesDataProvider = ko.observable(new oj.ArrayDataProvider(self.facturasPendientesArray));

            self.remisionesPendientesArray = ko.observableArray([]);
            self.remisionesPendientesArrayOriginal = ko.observableArray([]);
            self.remisionesPendientesDataProvider = ko.observable(new oj.ArrayDataProvider(self.remisionesPendientesArray));

            self.facturasConciliadasArray = ko.observableArray([]);
            self.facturasConciliadasDataProvider = ko.observable(new oj.ArrayDataProvider(self.facturasConciliadasArray));

            self.remisionesConciliadasArray = ko.observableArray([]);
            self.remisionesConciliadasDataProvider = ko.observable(new oj.ArrayDataProvider(self.remisionesConciliadasArray));

            self.pagosPendientesColumnArray = [{
                    headerText: "Id",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pago_id"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Num cheque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nocheque"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "mnac"
                },
                {
                    headerText: "Abono remisiones",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abonos_r"
                },
                {
                    headerText: "Abono facturas",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abonos_f"
                },
                {
                    headerText: "Ref Bancaria",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "rbancaria"
                },
                {
                    headerText: "Por asignar",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_asignar"
                }
            ];

            self.rowRendererFP = function(context) {
                var mode = context['rowContext']['mode'];

                if (mode === 'edit') {
                    self._editRowRendererFP(context);
                } else if (mode === 'navigation') {
                    self._navRowRendererFP(context);
                }
            };
            self._editRowRendererFP = oj.KnockoutTemplateUtils.getRenderer('editRowTemplateFP', true);
            self._navRowRendererFP = oj.KnockoutTemplateUtils.getRenderer('rowTemplateFP', true);

            self.rowRendererRP = function(context) {
                var mode = context['rowContext']['mode'];

                if (mode === 'edit') {
                    self._editRowRendererRP(context);
                } else if (mode === 'navigation') {
                    self._navRowRendererRP(context);
                }
            };
            self._editRowRendererRP = oj.KnockoutTemplateUtils.getRenderer('editRowTemplateRP', true);
            self._navRowRendererRP = oj.KnockoutTemplateUtils.getRenderer('rowTemplateRP', true);

            self.facturasPendientesColumnArray = [{
                    headerText: "Factura",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    field: "factura",
                    resizable: "enabled"
                },
                {
                    headerText: "Día",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    field: "dia",
                    resizable: "enabled"
                },
                {
                    headerText: "Total",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "total"
                },
                {
                    headerText: "Por asignar",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_asignar"
                }
            ];

            self.remisionesPendientesColumnArray = [{
                    headerText: "Remision",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    resizable: "enabled",
                    sortable: "disabled",
                    field: "remision"
                },
                {
                    headerText: "Día",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    field: "dia",
                    resizable: "enabled"
                },
                {
                    headerText: "Precio",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    field: "precio",
                    resizable: "enabled"
                },
                {
                    headerText: "Por asignar",
                    headerStyle: "min-width: 8em; max-width: 8em; width: 8em",
                    style: "min-width: 8em; max-width: 8em; width: 8em",
                    sortable: "disabled",
                    field: "x_asignar",
                    resizable: "enabled"
                }
            ];

            self.facturasConciliadasColumnArray = [{
                    headerText: "Factura",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "factura"
                },
                {
                    headerText: "Serie",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "serie"
                },

                {
                    headerText: "Abono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abono"
                }, {
                    headerText: "Por factura",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_factura"
                }, {
                    headerText: "Por pago",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_pago"
                }
            ];

            self.remisionesConciliadasColumnArray = [{
                    headerText: "Remisión",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "remsion"
                },
                {
                    headerText: "Pva",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pva"
                },
                {
                    headerText: "Abono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abono"
                },
                {
                    headerText: "Por factura",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_factura"
                },
                {
                    headerText: "Por remisión",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_remision"
                }
            ];

            self.clientesDataProvider = ko.observable();

            self.clientes = ko.observable();
            self.clientesDataSource = ko.observable();

            self.clientesColumnArray = [{
                    headerText: "Cliente",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cliente"
                },
                {
                    headerText: "Nombre",
                    field: "nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                },
                {
                    headerText: "Pagos",
                    sortable: "disabled",
                    field: "pagos",
                    resizable: "enabled"
                },
                {
                    headerText: "Num Pagos",
                    sortable: "disabled",
                    field: "nopagos",
                    resizable: "enabled"
                },
                {
                    headerText: "Facturas",
                    sortable: "disabled",
                    field: "numero",
                    resizable: "enabled"
                },
                {
                    headerText: "Remisiones",
                    sortable: "disabled",
                    field: "metodopago_descripcion",
                    resizable: "enabled"
                },
                {
                    headerText: "Por asignar",
                    sortable: "disabled",
                    field: "x_asignar",
                    resizable: "enabled"
                }
            ];



            self.search_value = ko.observable('');


            var latestFilter = "";
            self.getClientesPaging = function(event, d1) {
                latestFilter = self.search_value();
                var myCollection = self.clientes();
                myCollection.refresh();
                console.log(d1);

                if (typeof d1 === "function") {
                    d1.resolve();
                }
                // resetAllValues();
            };

            function filterClientes() {
                var filter = latestFilter;
                if (filter === "") {
                    return "";
                }

                if (!isNaN(filter)) {
                    return "&filter[]=cliente,eq," + filter + "&satisfy=any";
                } else {
                    filter = filter.toUpperCase()
                    return "&filter[]=nombre,cs," + filter +
                        "&satisfy=any";
                }
            };

            function getUrl(operation, collection, options) {
                var fetchSize = 10;
                var url = "";
                if (operation === "read") {
                    if (self.filterPendientes()) {
                        // url = "https://gaslicuadosabinas.com/api.php/web_browse_clientes_xasignar?transform=1";
                        url = "https://gaslicuadosabinas.com/api.php/web_browse_clientes_conciliacion_pendientes?transform=1";
                    } else {
                        url = "https://gaslicuadosabinas.com/api.php/web_browse_clientes_conciliacion?transform=1";
                        // url = "https://gaslicuadosabinas.com/api.php/web_browse_creditos_conciliacion?transform=1";
                    }
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterClientes();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        url += "&order=cliente&page=" + page + ",10";
                    }
                }
                return url;
            }
        }
        return facturacionFletesViewModel;
    });
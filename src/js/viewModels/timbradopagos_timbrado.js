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
                var table = document.getElementById('pagos-paging-table');
                table.addEventListener('selectionChanged', self.pagosSelectionListener);
            }

            self.pagos = ko.observable();
            self.datasource = ko.observable();

            self.handleBindingsApplied = function() {
                // document.getElementById('search').addEventListener('keyup', self.handleKeyUp);
                var pagosCollection, collection, pagoModel, pagingDatasource;
                var fetchSize = 10;
                pagoModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });
                pagosCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: pagoModel
                });
                self.pagos(new pagosCollection);
                self.datasource(new oj.CollectionTableDataSource(self.pagos()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.pagos().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }

            var latestFilter = "";
            self.getPagosPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.pagos();
                myCollection.refresh();
            };

            function filterPagos() {
                var filter = latestFilter;
                if (filter === "") {
                    return "";
                }

                if (!isNaN(filter)) {
                    return "&filter[]=cliente,eq," + filter + "&filter[]=nocheque,eq," + filter + "&satisfy=any";
                } else {
                    filter = filter.toUpperCase()
                    return "&filter[]=nombre,cs," + filter + "&satisfy=any";
                }
            };

            function getUrl(operation, collection, options) {
                var fetchSize = 10;
                var url = "";
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/servicesAdmin/apiFunctions.php?function=web_bancos_pagos_timbre_browse";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterPagos();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        url += "&order=dia_corte&page=" + page + ",10";
                    }
                }
                return url;
            }

            self.pagosData = ko.observable();

            self.formaPago = ko.observable("");
            self.formasPago = ko.observableArray([]);

            self.usoCFDI = ko.observable("");
            self.usosCFDI = ko.observableArray([]);

            self.paramsDialog = ko.observable();


            self.timbraPago = function() {
                self.paramsDialog({
                    'isLoading': true,
                    'promise': self.promiseTimbradoPago,
                    'dialog': { 'title': 'Procesando timbrado', 'body': 'Se está procesando el timbrado...' }
                });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseTimbradoPago = function() {
                return new Promise((resolve, reject) => {
                    var data = {
                        'cliente': self.pagosData().cliente(),
                        'diaBanco': self.pagosData().diaBanco2(),
                        'diaCorte': self.pagosData().diaCorte(),
                        'facturasPorTimbrar': self.pagosData().facturasPorTimbrar(),
                        'facturasTimbradas': self.pagosData().facturas_timbradas(),
                        'nocheque': self.pagosData().nocheque(),
                        'rfc': self.pagosData().rfc(),
                        'id': self.pagosData().id(),
                        'nombre': self.pagosData().nombre(),
                        'formapago': self.pagosData().formaPago(),
                        'planta': localStorage.getItem("planta"),
                        'pventa': self.pagosData().pventa(),
                        'refBancaria': self.pagosData().refBancaria(),
                        'saldoPorAsignar': self.pagosData().saldoPorAsignar(),
                        'usr_captura': app.userLogin()
                    }
                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/pagos/timbra.php",
                        data: data,
                        success: function(data) {
                            resolve(data);
                            resetValues();
                            self.getPagosPaging();
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve("No se pudo timbrar");
                        }
                    })
                });
            }

            function resetValues() {
                self.pagosData(undefined);
                var table = document.getElementById('pagos-paging-table');
                table.selection = null;
            }

            self.pagosSelectionListener = function(event, a) {
                var data = event.detail;
                if (!Array.isArray(data['value']) || !data['value'].length) {
                    resetValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var element = document.getElementById('pagos-paging-table');
                    var currentRow = element.currentRow;
                    self.dataprovider().get(currentRow.rowKey).then(function(obj) {
                        var data = obj.data;
                        self.pagosData({
                            cliente: ko.observable(data.cliente),
                            rfc: ko.observable(data.rfc),
                            nombre: ko.observable(data.nombre),
                            formaPago: ko.observable(data.formapago),
                            diaBanco: ko.observable(data.dia_banco),
                            id: ko.observable(data.id),
                            diaBanco2: ko.observable(data.dia_banco2),
                            diaCorte: ko.observable(data.dia_corte),
                            nocheque: ko.observable(data.nocheque),
                            facturasPorTimbrar: ko.observable(data.facturas_x_timbrar),
                            facturasTimbradas: ko.observable(data.facturas_tmbradas),
                            pventa: ko.observable(data.pventa),
                            refBancaria: ko.observable(data.ref_bancaria),
                            saldoPorAsignar: ko.observable(data.saldo_x_asignar)
                        });
                    });
                }
            };

            self.shouldDisableSubmit = function() {
                if (self.pagosData() !== undefined) {
                    if (self.pagosData().diaBanco() && self.pagosData().facturasPorTimbrar() > 0) {
                        return false;
                    }
                } else {
                    return true;
                }
                return true;

            };

            self.dataprovider = ko.observable();
            self.search_value = ko.observable("");

            self.pagosArray = ko.observableArray();

            self.pagosColumnArray = [{
                    headerText: "Cliente",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cliente"
                },
                {
                    headerText: "NoCheque",
                    sortable: "disabled",
                    field: "nocheque",
                    resizable: "enabled"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    field: "nombre",
                    resizable: "enabled"
                },
                {
                    headerText: "DíaBanco",
                    sortable: "disabled",
                    field: "dia_banco",
                    resizable: "enabled",
                    width: "100"
                },
                {
                    headerText: "DíaCorte",
                    sortable: "disabled",
                    field: "dia_corte",
                    resizable: "enabled",
                    width: "100"
                },
                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    field: "pventa",
                    resizable: "enabled"
                },
                {
                    headerText: "RefBancaria",
                    sortable: "disabled",
                    field: "refBancaria",
                    resizable: "enabled"
                },
                {
                    headerText: "FacturasTimbradas",
                    sortable: "disabled",
                    field: "facturas_tmbradas",
                    resizable: "enabled"
                },
                {
                    headerText: "FacturasPorTimbrar",
                    sortable: "disabled",
                    field: "facturas_x_timbrar",
                    resizable: "enabled"
                },



                {
                    headerText: "SaldoPorAsignar",
                    sortable: "disabled",
                    field: "saldo_x_asignar",
                    resizable: "enabled"
                }
            ];

        }
        return facturacionContadoViewModel;
    });
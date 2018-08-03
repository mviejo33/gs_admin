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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojswitch', 'ojs/ojarraydataprovider', 'ojs/ojpagingcontrol', 'ojs/ojcheckboxset', 'ojs/ojdatacollection-utils', 'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojknockout', 'promise', 'ojs/ojlistview', 'ojs/ojselectcombobox', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function facturacionHistorialViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('facturas-paging-table');
                table.addEventListener('selectionChanged', self.facturasSelectionListener);
                table = document.getElementById('conceptos-table');
                table.addEventListener('ojBeforeRowEditEnd', self.beforeRowEditEndListener);
                table.addEventListener('ojBeforeRowEdit', self.beforeRowEditListener);
                table = document.getElementById('porFacturar-table');
                table.addEventListener('selectionChanged', self.porFacturarSelectionListener);
                table = document.getElementById('aFacturar-table');
                table.addEventListener('selectionChanged', self.aFacturarSelectionListener);


                var facturaCollection, collection, facturaModel, pagingDatasource;
                var fetchSize = 10;
                facturaModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });
                facturaCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: facturaModel
                });
                self.facturas(new facturaCollection);
                self.datasource(new oj.CollectionTableDataSource(self.facturas()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.facturas().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }



            self.folio = ko.observable();
            self.rfc = ko.observable();
            self.mails = ko.observable();
            self.nombre = ko.observable();
            self.telefono = ko.observable();
            self.formapago = ko.observable();
            self.metodopago = ko.observable();
            self.usocfdi = ko.observable();
            self.uuid = ko.observable();
            self.pva = ko.observable();
            self.id = ko.observable();
            self.tipo = ko.observable();
            self.desglose_vales = ko.observable();
            self.serie = ko.observable();
            self.paramsDialog = ko.observable();

            self.porFacturarArray = ko.observableArray([]);
            self.aFacturarArray = ko.observableArray([]);
            self.porFacturarDataProvider = new oj.ArrayDataProvider(self.porFacturarArray);
            self.aFacturarDataProvider = new oj.ArrayDataProvider(self.aFacturarArray);

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

            self.facturas = ko.observable();
            self.descripcion = ko.observable();

            self.showRemisiones = ko.observable(false);

            self.datasource = ko.observable();
            self.dataprovider = ko.observable();

            self.conceptosArrayOriginal = ko.observableArray([]);

            self.conceptosArray = ko.observableArray([]);
            self.conceptosDataProvider = ko.observable(new oj.ArrayDataProvider(self.conceptosArray));




            self.rowRenderer = function(context) {
                var mode = context['rowContext']['mode'];

                if (mode === 'edit') {
                    self._editRowRenderer(context);
                } else if (mode === 'navigation') {
                    self._navRowRenderer(context);
                }
            };
            self._editRowRenderer = oj.KnockoutTemplateUtils.getRenderer('editRowTemplate', true);
            self._navRowRenderer = oj.KnockoutTemplateUtils.getRenderer('rowTemplate', true);

            self.porFacturarSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('porFacturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.porFacturarArray().length > 0) {
                        self.pva(self.porFacturarArray()[currentRow['rowIndex']].pva);
                        self.aFacturarArray.push(self.porFacturarArray()[currentRow['rowIndex']]);
                        self.porFacturarArray.splice(currentRow['rowIndex'], 1);
                    }
                }
            };


            self.beforeRowEditEndListener = function(event) {
                var data = event.detail;
                var rowIdx = data.rowContext.status.rowIndex;
                // self.conceptosDataProvider().at(rowIdx).then(function(rowObj) {
                //     $('#rowDataDump').val(JSON.stringify(rowObj['data']));
                // });
                if (oj.DataCollectionEditUtils.basicHandleRowEditEnd(event, data) === false) {
                    event.preventDefault();
                }

                var concepto = self.conceptosArray()[rowIdx];
                if (parseFloat(concepto.originalValorUnitario) > parseFloat(self.previousValorUnitario)) {
                    concepto.importeCalculado = Math.round(concepto.cantiidad * concepto.valorunitario * 100) / 100;
                } else {
                    concepto.importeCalculado = concepto.importe;
                    concepto.valorunitario = self.previousValorUnitario;
                }
                // self.shouldDisableSubmit();
                // document.getElementById("notacredito-button").disabled = self.shouldDisableSubmit();
                // $("#notacredito-button").ojButton("refresh");
            }

            self.aFacturarSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('aFacturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.aFacturarArray().length > 0) {
                        self.porFacturarArray.push(self.aFacturarArray()[currentRow['rowIndex']]);
                        self.aFacturarArray.splice(currentRow['rowIndex'], 1);
                    }
                }
            };

            self.handleBindingsApplied = function() {
                // document.getElementById('search').addEventListener('keyup', self.handleKeyUp);

            }

            self.facturaNotaCredito = function() {
                self.paramsDialog({
                    'isLoading': true,
                    'promise': self.promiseNotaCredito,
                    'dialog': { 'title': 'Procesando timbrado', 'body': 'Se está procesando el timbrado...' }
                });
                $("#dialog-timbre").ojDialog("open");
            }

            self.promiseNotaCredito = function() {
                return new Promise((resolve, reject) => {
                    var data;
                    if (!self.showRemisiones()) {
                        data = {
                            'rfc': self.selectedFactura.rfc.toUpperCase().trim(),
                            'email': self.selectedFactura.mails,
                            'nombre': self.selectedFactura.nombre,
                            'formapago': self.selectedFactura.formapago,
                            'usocfdi': self.selectedFactura.usocfdi,
                            'metodopago': self.selectedFactura.metodopago,
                            'planta': localStorage.getItem("planta"),
                            'uuid': self.selectedFactura.uuid,
                            'telefono': self.selectedFactura.telefono,
                            'uuid_factura': self.uuid,
                            "descripcion": self.descripcion(),
                            'tipo': "notacredito",
                            'uuid_factura': self.selectedFactura.uuid,
                            'conceptos_notacredito': JSON.stringify(ko.toJSON(self.conceptosArray())),
                            'id_factura': self.selectedFactura.id,
                            'contieneRemisiones': self.showRemisiones(),
                            'usr_captura': app.userLogin()
                        }
                    } else {
                        var totales = getTotales();
                        data = {
                            'rfc': self.selectedFactura.rfc.toUpperCase().trim(),
                            'email': self.selectedFactura.mails,
                            'nombre': self.selectedFactura.nombre,
                            'formapago': self.selectedFactura.formapago,
                            'usocfdi': self.selectedFactura.usocfdi,
                            'metodopago': self.selectedFactura.metodopago,
                            'planta': localStorage.getItem("planta"),
                            'uuid': self.selectedFactura.uuid,
                            'telefono': self.selectedFactura.telefono,
                            'tipo': "notacredito",
                            'total': totales.total,
                            'totalRemisionesKg': totales.totalRemisionesKg,
                            'totalRemisionesLt': totales.totalRemisionesLt,
                            'totalDescargas': totales.totalDescargas,
                            "kgDescargas": totales.kgDescargas,
                            "ltRemisiones": totales.ltRemisiones,
                            "kgRemisiones": totales.kgRemisiones,
                            "pva": self.pva(),
                            "descripcion": self.descripcion(),
                            'remisionesDescargas': JSON.stringify(self.aFacturarArray()),
                            'id_factura': self.selectedFactura.id,
                            'uuid_factura': self.selectedFactura.uuid,
                            'contieneRemisiones': self.showRemisiones(),
                            'usr_captura': app.userLogin()
                        }
                    }

                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/dev_factura.php",
                        data: data,
                        success: function(response) {
                            if (self.showRemisiones() == true) {
                                var data = {
                                    'rfc': self.selectedFactura.rfc.toUpperCase().trim(),
                                    'email': self.selectedFactura.mails,
                                    'nombre': self.selectedFactura.nombre,
                                    'formapago': self.selectedFactura.formapago,
                                    'usocfdi': self.selectedFactura.usocfdi,
                                    'metodopago': self.selectedFactura.metodopago,
                                    'planta': localStorage.getItem("planta"),
                                    'uuid': self.selectedFactura.uuid,
                                    'telefono': self.selectedFactura.telefono,
                                    'tipo': "credito",
                                    'empresa': 1,
                                    'total': totales.total,
                                    'totalRemisionesKg': totales.totalRemisionesKg,
                                    'totalRemisionesLt': totales.totalRemisionesLt,
                                    'totalDescargas': totales.totalDescargas,
                                    "kgDescargas": totales.kgDescargas,
                                    "ltRemisiones": totales.ltRemisiones,
                                    "kgRemisiones": totales.kgRemisiones,
                                    "pva": self.pva(),
                                    'remisionesDescargas': JSON.stringify(self.aFacturarArray()),
                                    'id_factura': self.selectedFactura.id,
                                    'uuid_factura': self.selectedFactura.uuid,
                                    'contieneRemisiones': self.showRemisiones(),
                                    'isNotaCredito': 'virtual',
                                    'usr_captura': app.userLogin()
                                }
                                $.ajax({
                                    method: "POST",
                                    url: "https://198.100.45.73/servicesFacturador/factura.php",
                                    data: data,
                                    success: function(data) {
                                        resolve(data);
                                        resetValues();
                                        self.selectedFactura['tipo'] = data.tipo;
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                                        resolve("No se pudo timbrar");
                                    }
                                })
                            } else {
                                resolve(data);
                                resetValues();
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve("No se pudo timbrar");
                        }
                    })
                });
            }

            function getTotales() {
                if (self.showRemisiones() == true) {
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
                } else {
                    var total = 0,
                        totalDescargas = 0,
                        totalRemisionesKg = 0,
                        totalRemisionesLt = 0,
                        ltRemisiones = 0,
                        kgRemisiones = 0,
                        kgDescargas = 0;
                    for (const value of self.conceptosArray()) {
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

            }

            self.porFacturarSelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('porFacturar-table');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.porFacturarArray().length > 0) {
                        self.pva(self.porFacturarArray()[currentRow['rowIndex']].pva);
                        self.aFacturarArray.push(self.porFacturarArray()[currentRow['rowIndex']]);
                        self.porFacturarArray.splice(currentRow['rowIndex'], 1);
                    }
                }
            };

            var latestFilter = "";

            self.search_value = ko.observable("");

            self.getFacturasPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.facturas();
                myCollection.refresh();
                resetValues();
            };

            function filterfacturas() {
                var filter = latestFilter;
                if (filter === "") {
                    return "";
                }

                if (!isNaN(filter)) {
                    return "&filter[]=folio,eq," + filter +
                        // "&filter[]=usr_captura,eq," + filter +
                        // "&filter[]=total,eq," + encodeURIComponent(filter) +
                        /*"&filter[]=usr_cancelacion,eq," + filter +*/
                        "&satisfy=any";
                } else {
                    filter = filter.toUpperCase()
                    return "&filter[]=nombre,cs," + filter +
                        // "&filter[]=dia,eq," + encodeURIComponent(filter) +
                        "&filter[]=rfc,cs," + filter +
                        /*"&filter[]=correos,cs," + encodeURIComponent(filter) +*/
                        "&satisfy=any";
                }
            };

            function getRemisionesDescargasByFactura(id) {
                var data = { 'factura': id };
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getRemisionesDescargasByFactura.php",
                    data: data,
                    success: function(data) {
                        self.porFacturarArray(data);
                    }
                })
            }

            function getUrl(operation, collection, options) {
                var fetchSize = 10;
                var url = "";
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/api.php/web_browse_historial_ncredito?transform=1";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterfacturas();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        url += "&order=id,desc&page=" + page + ",10";
                    }
                }
                return url;
            }

            self.shouldDisableSubmit = function() {
                var shouldDisable = false;
                if (self.conceptosArrayOriginal().length > 0) {
                    self.conceptosArray().forEach(function(concepto, i) {
                        var totalConcepto = concepto.cantiidad * concepto.valorunitario;
                        var totalConceptoOriginal = self.conceptosArrayOriginal()[i].cantiidad * self.conceptosArrayOriginal()[i].valorunitario;
                        if (totalConcepto > totalConceptoOriginal ||
                            concepto.cantiidad > self.conceptosArrayOriginal()[i].cantiidad ||
                            concepto.valorunitario > self.conceptosArrayOriginal()[i].valorunitario) {
                            // self.shouldDisableSubmit(true);
                            shouldDisable = true;
                        }
                    });
                } else {
                    // self.shouldDisableSubmit(true);
                    shouldDisable = true;
                }
                return shouldDisable;
            };

            self.currentSelectedFactura = ko.observable();
            self.facturasSelectionListener = function(event, a) {
                var data = event.detail;
                if (data['value'] == null) {
                    resetValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    resetValues();
                    var element = document.getElementById('facturas-paging-table');
                    var currentRow = element.currentRow;
                    self.selectedFactura['folio'] = currentRow.rowKey;
                    self.dataprovider().get(self.selectedFactura['folio']).then(function(obj) {
                        var data = obj.data;
                        self.selectedFactura['tipo'] = data.tipo;
                        self.selectedFactura['id'] = data.id;
                        self.selectedFactura['uuid'] = data.uuid;
                        self.selectedFactura['mails'] = data.correos;
                        self.selectedFactura['telefono'] = data.telefono;
                        self.selectedFactura['nombre'] = data.nombre;
                        self.selectedFactura['telefono'] = data.nombre;
                        self.selectedFactura['serie'] = data.serie;
                        self.selectedFactura['usocfdi'] = data.usocfdi + "-" + data.descripcionusocfdi;
                        self.selectedFactura['formapago'] = data.formapago + "-" + data.descripcionformapago;
                        self.selectedFactura['rfc'] = data.rfc;
                        self.selectedFactura['folio'] = data.folio;
                        getConceptosFactura();
                        self.showRemisiones(false);
                        getRemisionesDescargasByFactura(data.id);
                    });
                }
            };

            function resetValues() {
                console.log("q");
                self.conceptosArray([]);
                self.aFacturarArray([]);
                self.porFacturarArray([]);
            }


            self.esActivo = ko.observable(false);

            function getConceptosFactura() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getConceptosFactura.php",
                    data: { factura: self.selectedFactura.id },
                    success: function(data) {
                        data.forEach(function(obj) {
                            obj.incluirEnNC = [''];
                            obj.originalValorUnitario = obj.valorunitario;
                            obj.importeCalculado = Math.round(obj.cantiidad * obj.valorunitario * 100) / 100;
                            if (obj.claveprodserv != 15111510) {
                                self.esActivo(true);
                            } else {
                                self.esActivo(false);
                            }
                        });
                        var dataClone = Array.prototype.slice.call(data);
                        self.conceptosArrayOriginal(data.slice(0));
                        self.conceptosArray(JSON.parse(JSON.stringify(data)));
                        self.shouldDisableSubmit();
                    }
                })
            }

            self.selectedFactura = {};

            self.facturasArray = ko.observableArray();


            self.conceptosColumnArray = [{
                    headerText: "Descripción",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "descripcion",
                    style: "min-width: 8em; max-width: 8em; width: 8em"
                },
                {
                    headerText: "Valor unitario",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "valorunitario",
                    style: "min-width: 8em; max-width: 8em; width: 8em"
                },
                {
                    headerText: "Cantidad",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cantiidad",
                    style: "min-width: 8em; max-width: 8em; width: 8em"
                },
                {
                    headerText: "Unidad",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "unidad",
                    style: "min-width: 8em; max-width: 8em; width: 8em"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "importe",
                    style: "min-width: 8em; max-width: 8em; width: 8em"
                }
            ];

            self.facturasColumnArray = [{
                    headerText: "Folio",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "folio"
                },
                {
                    headerText: "Tipo",
                    sortable: "disabled",
                    field: "tipo",
                    resizable: "enabled",
                    width: "50"
                },
                {
                    headerText: "Serie",
                    sortable: "disabled",
                    field: "serie",
                    resizable: "enabled",
                    width: "70"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    field: "nombre",
                    width: "200",
                    resizable: "enabled"
                },
                {
                    headerText: "RFC",
                    sortable: "disabled",
                    field: "rfc",
                    width: "100",
                    resizable: "enabled"
                },
                {
                    headerText: "Correo(s)",
                    sortable: "disabled",
                    field: "correos",
                    width: "200",
                    resizable: "enabled"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    field: "dia",
                    width: "100",
                    resizable: "enabled"
                },
                {
                    headerText: "Total",
                    sortable: "disabled",
                    width: "110",
                    field: "total",
                    resizable: "enabled"
                },
                {
                    headerText: "Facturado por",
                    sortable: "disabled",
                    width: "90",
                    field: "usr_captura",
                    resizable: "enabled"
                },
                {
                    headerText: "Cancelado por",
                    sortable: "disabled",
                    width: "110",
                    field: "usr_cancelacion",
                    resizable: "enabled"
                }
            ];

        }
        return facturacionHistorialViewModel;
    });
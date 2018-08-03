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
        function facturacionHistorialViewModel() {
            var self = this;

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('facturas-paging-table');
                table.addEventListener('selectionChanged', self.facturasSelectionListener);
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
            self.uuid = ko.observable();
            self.id = ko.observable();
            self.tipo = ko.observable();
            self.desglose_vales = ko.observable();
            self.serie = ko.observable();
            self.paramsDialog = ko.observable();

            self.facturas = ko.observable();
            self.datasource = ko.observable();
            self.dataprovider = ko.observable();

            self.handleBindingsApplied = function() {
                // document.getElementById('search').addEventListener('keyup', self.handleKeyUp);

            }

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

            function getUrl(operation, collection, options) {
                var fetchSize = 10;
                var url = "";
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/api.php/web_browse_historial_facturas?transform=1";
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

            self.promiseCancelacion = function() {
                return new Promise((resolve, reject) => {
                    var data = {
                        'uuid': self.uuid(),
                        'rfc': self.rfc(),
                        'usr': app.userLogin(),
                        'id': self.id(),
                        'serie': self.serie(),
                        'folio': self.folio(),
                        'tipo': self.tipo()
                    }

                    $.ajax({
                        method: "POST",
                        url: "https://198.100.45.73/servicesFacturador/cancela.php",
                        data: data,
                        success: function(data) {
                            resolve(data);
                            self.getFacturasPaging();
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            resolve(XMLHttpRequest.responseText);
                        }
                    })
                });
            }

            function resetValues() {
                self.tipo(undefined);
                self.id(undefined);
                self.desglose_vales(undefined);
                self.uuid(undefined);
                self.mails(undefined);
                self.rfc(undefined);
                self.serie(undefined);
                self.folio(undefined);
                self.paramsDialog(undefined);
                var facturasTable = document.getElementById('facturas-paging-table');
                facturasTable.selection = null;
            }

            self.facturasSelectionListener = function(event, a) {
                var data = event.detail;
                if (data['value'] == null) {
                    resetValues();
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var element = document.getElementById('facturas-paging-table');
                    var currentRow = element.currentRow;
                    self.dataprovider().get(currentRow.rowKey).then(function(obj) {
                        var data = obj.data;
                        self.tipo(data.tipo);
                        self.id(data.id);
                        self.uuid(data.uuid);
                        self.mails(data.correos);
                        self.serie(data.serie);
                        self.rfc(data.rfc);
                        self.folio(data.folio);
                        self.desglose_vales(data.desglose);
                    });
                }
            };

            self.contextmenu_facturas_action = function(event) {
                var selection = event.target.textContent;
                switch (selection) {
                    case "Cancelar":
                        self.paramsDialog({ 'isLoading': true, 'promise': self.promiseCancelacion, 'dialog': { 'title': 'Procesando cancelación', body: 'Se está procesando la cancelación...' } });
                        $("#dialog-timbre").ojDialog("open");
                        break;
                    case "Descargar PDF":
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', 'https://198.100.45.73/servicesFacturador/descargaPDF.php', true);
                        xhr.responseType = 'blob';
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        xhr.onload = function(e) {
                            if (this.status == 200) {
                                var blob = new Blob([this.response], { type: "application/pdf" });
                                var link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                link.download = "factura_" + self.folio() + ".pdf";
                                link.click();
                            }
                        };
                        xhr.send("id=" + self.id());
                        break;
                    case "Descargar XML":
                        $.ajax({
                            method: "POST",
                            url: "https://198.100.45.73/servicesFacturador/descargaXML.php",
                            responseType: 'blob',
                            data: {folio: self.folio(), serie: self.serie()},
                            success: function(data) {
                                var blob = new Blob([data], { type: "application/xml" });
                                var link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                link.download = "factura_" + self.folio() + ".xml";
                                link.click();
                            }
                        })
                        break;
                    case "Ver desglose de vale":
                        self.paramsDialog({ 'dialog': { 'isLoading': false, 'title': "Desglose de vales de factura " + self.folio(), body: self.desglose_vales() } });
                        $("#dialog-timbre").ojDialog("open");

                        break;
                    default:
                }
            }

            self.contextmenu_facturas_beforeOpen = function(event) {
                var target = event.detail.originalEvent.target;
                var context = document.getElementById("facturas-paging-table").getContextByNode(target);
                if (self.folio() == undefined) {
                    event.preventDefault();
                }
                if (context != null) {
                    console.log("Cell: [" + context["rowIndex"] + ", " + context["columnIndex"] + "]");
                }
            };

            self.currentSelectedFactura = ko.observable();

            self.facturasArray = ko.observableArray();

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

            function initializeDialog() {

            };
        }
        return facturacionHistorialViewModel;
    });
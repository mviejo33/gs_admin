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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojswitch', 'ojs/ojknockout', 'ojs/ojmenu', 'ojs/ojfilepicker'],
    function(oj, ko, $, app) {
        function docsViewModel() {
            var self = this;

            self.documentos = ko.observable();
            self.datasource = ko.observable();
            self.selectedDoc = ko.observable();

            self.handleAttached = function() {
                app.verifyPermissions();

            }


            self.handleBindingsApplied = function() {
                var docsCollection, collection, docsModel, pagingDatasource;
                var fetchSize = 10;
                docsModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });
                docsCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: docsModel
                });
                self.documentos(new docsCollection);
                self.datasource(new oj.CollectionTableDataSource(self.documentos()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.documentos().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }


            self.currentSelectedValvula = ko.observable();
            self.dataprovider = ko.observable();
            self.search_value = ko.observable("");


            self.openDocDialog = function() {
                $("#dialog-doc").ojDialog('open');
            };
            self.openTagDialog = function() {
                $("#dialog-tag").ojDialog('open');
            };

            self.contextmenu_action = function(event) {
                var element = document.getElementById('documentos-paging-table');
                var currentRow = element.currentRow;
                self.dataprovider().get(currentRow.rowKey).then(function(obj) {
                    self.selectedDoc(obj.data);
                });
                switch (event.target.value) {
                    case "Detalle cliente":
                        $("#dialog-doc-tag").ojDialog("open");
                        break;
                    case "Descargar":
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', 'https://198.100.45.73/servicesFacturador/descargaDoc.php', true);
                        xhr.responseType = 'blob';
                        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        xhr.onload = function(e) {
                            if (this.status == 200) {
                                var blob = new Blob([this.response], { type: selectedDoc().mime_type });
                                // var blob = new Blob([this.response], { type: selectedDoc().mime_type"application/pdf" });
                                var link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                link.download = "factura_" + self.folio() + ".pdf";
                                link.click();
                            }
                        };
                        xhr.send("id=" + self.selectedDoc().id);
                        break;
                }


            }

            self.contextmenu2_action = function(event) {
                var data;
                switch (event.target.value) {
                    case "documentos":
                        data = {
                            table: "web_browse_valvulas_instaladas",
                            title: "valvulas_instaladas"
                        };
                        break;
                    case "acciones":
                        data = {
                            table: "web_browse_valvulas_acciones",
                            title: "valvulas_acciones"
                        };
                        break;
                    case "modelos":
                        data = {
                            table: "web_browse_valvulas_modelos",
                            title: "valvulas_modelos"
                        };
                        break;

                }
                $.ajax({
                    method: "POST",
                    url: "https://198.100.45.73/descargaAExcel.php",
                    responseType: 'blob',
                    data: data,
                    success: function(response) {
                        var blob = new Blob([response], { type: "application/csv" });
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        var dateString = new Date(Date.now()).toLocaleString();
                        link.download = data.title + new Date().toISOString() + ".csv";
                        link.click();
                    }
                })

            }


            self.contextmenu_beforeOpen = function(event) {
                // var target = event.detail.originalEvent.target;
                // var context = document.getElementById("clients-paging-table").getContextByNode(target);
                // if (self.telefono() == undefined) {
                //     event.preventDefault();
                // }
            };

            var latestFilter = "";
            self.getDocsPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.documentos();
                myCollection.refresh();
            };

            function filterDocs() {
                var filter = latestFilter;
                if (filter === "") {
                    return "";
                }

                if (!isNaN(filter)) {
                    return "&filter[]=cajero,eq," + filter + "&satisfy=any";
                } else {
                    filter = filter.toUpperCase()
                    return "&filter[]=nombrec,cs," + filter +
                        "&filter[]=nombrev,cs," + filter + "&satisfy=any";
                }
            };

            function getUrl(operation, collection, options) {
                var fetchSize = 15;
                var url = "";
                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/api.php/web_documentos?transform=1";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterDocs();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        // url += "desc&order=dias&page=" + page + ",20";
                    }
                }
                return url;
            }


            self.docsColumnArray = [{
                    headerText: "Id",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "id"
                },
                {
                    headerText: "Empresa",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "empresa"
                },
                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "Estación",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "estacion"
                },
                {
                    headerText: "Planta",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "planta"
                },
                {
                    headerText: "Cliente",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cliente"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Autor",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "autor"
                },
                {
                    headerText: "FechaEmisión",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "fecha_emision"
                },
                {
                    headerText: "FechaVigencia",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "fecha_vigencia"
                },
                {
                    headerText: "CapturadoPor",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "usr_captura"
                }
            ];

        }
        return docsViewModel;
    });
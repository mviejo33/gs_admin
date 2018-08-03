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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojswitch', 'ojs/ojknockout', 'ojs/ojfilepicker'],
    function(oj, ko, $, app) {
        function ultimasLecturasViewModel() {
            var self = this;

            self.ultimasLecturas = ko.observable();
            self.datasource = ko.observable();

            self.handleBindingsApplied = function() {
                // document.getElementById('search').addEventListener('keyup', self.handleKeyUp);
                var clienteCollection, collection, clienteModel, pagingDatasource;
                var fetchSize = 10;
                clienteModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });
                clienteCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: clienteModel
                });
                self.ultimasLecturas(new clienteCollection);
                self.datasource(new oj.CollectionTableDataSource(self.ultimasLecturas()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.ultimasLecturas().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }

            self.currentSelectedLectura = ko.observable();
            self.dataprovider = ko.observable();
            self.search_value = ko.observable("");

            var latestFilter = "";
            self.getultimasLecturasPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.ultimasLecturas();
                myCollection.refresh();
            };

            function filterultimasLecturas() {
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
                    url = "https://gaslicuadosabinas.com/api.php/web_ultimas_lecturas?transform=1";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterultimasLecturas();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        // url += "desc&order=dias&page=" + page + ",20";
                    }
                }
                return url;
            }

            self.contextmenu_action = function(event, a) {
                var data = {
                    table: event.target.value,
                    title: "ultimas_lecturas"
                };
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


            self.ultimasLecturasArray = ko.observableArray();

            self.ultimasLecturasColumnArray = [{
                    headerText: "Días",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dias"
                },
                {
                    headerText: "Planta",
                    sortable: "disabled",
                    field: "pta",
                    resizable: "enabled"
                },

                {
                    headerText: "TipoPventa",
                    sortable: "disabled",
                    field: "tpva",
                    resizable: "enabled"
                },

                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    field: "pva",
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
                    headerText: "Vendedor",
                    sortable: "disabled",
                    field: "vendedor",
                    resizable: "enabled"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    field: "nombrev",
                    resizable: "enabled"
                },
                {
                    headerText: "TipoLectura",
                    sortable: "disabled",
                    field: "tipol",
                    resizable: "enabled"
                },
                {
                    headerText: "Lectura",
                    sortable: "disabled",
                    field: "lectura",
                    resizable: "enabled"
                },
                {
                    headerText: "PorDepositar",
                    sortable: "disabled",
                    field: "nodep",
                    resizable: "enabled"
                },
                {
                    headerText: "Cajero",
                    sortable: "disabled",
                    field: "cajero",
                    resizable: "enabled"
                },
                {
                    headerText: "NombreCajero",
                    sortable: "disabled",
                    field: "nombrec",
                    resizable: "enabled"
                },
                {
                    headerText: "LitrosTotales",
                    sortable: "disabled",
                    field: "ltotales",
                    resizable: "enabled"
                },
                {
                    headerText: "LitrosContado",
                    sortable: "disabled",
                    field: "lcontado",
                    resizable: "enabled"
                },
                {
                    headerText: "LitrosCredito",
                    sortable: "disabled",
                    field: "lcredito",
                    resizable: "enabled"
                },
                {
                    headerText: "LitrosCorridos",
                    sortable: "disabled",
                    field: "lcorridos",
                    resizable: "enabled"
                },
                {
                    headerText: "LitrosTransferencias",
                    sortable: "disabled",
                    field: "ltrans",
                    resizable: "enabled"
                }
            ];

        }
        return ultimasLecturasViewModel;
    });
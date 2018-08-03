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
        function valvulasViewModel() {
            var self = this;

            self.valvulas = ko.observable();
            self.datasource = ko.observable();

            self.handleAttached = function() {
                app.verifyPermissions();
            }

            self.handleBindingsApplied = function() {
                var clienteCollection, collection, clienteModel, pagingDatasource;
                var fetchSize = 10;
                clienteModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "folio"
                });
                clienteCollection = oj.Collection.extend({
                    customURL: getUrl,
                    fetchSize: fetchSize,
                    comparator: "folio",
                    model: clienteModel
                });
                self.valvulas(new clienteCollection);
                self.datasource(new oj.CollectionTableDataSource(self.valvulas()));
                self.dataprovider(new oj.PagingTableDataSource(self.datasource()));

                self.valvulas().fetch({
                    success: function(collection, response, options) {
                        // collection = fetched objects
                    },
                    error: function(collection, xhr, options) {}
                });
            }

            self.isSucesor = ko.observable(false);

            self.currentSelectedValvula = ko.observable();
            self.dataprovider = ko.observable();
            self.search_value = ko.observable("");


            self.openValvulaDialog = function openDialog() {
                self.isSucesor(false);
                $("#dialog-valvula").ojDialog('open');
            };
            self.openModeloDialog = function openDialog() {
                $("#dialog-modelo").ojDialog('open');
            };

            self.contextmenu_action = function(event) {
                self.isSucesor(true);
                var element = document.getElementById('valvulas-paging-table');
                var currentRow = element.currentRow;
                self.currentSelectedValvula(currentRow.rowKey);
                $("#dialog-valvula").ojDialog("open");

            }

            self.contextmenu2_action = function(event) {
                var data;
                switch (event.target.value) {
                    case "valvulas":
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
            self.getValvulasPaging = function(event) {
                latestFilter = self.search_value();
                var myCollection = self.valvulas();
                myCollection.refresh();
            };

            function filterValvulas() {
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
                    url = "https://gaslicuadosabinas.com/api.php/web_browse_valvulas_instaladas?transform=1";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var q = filterValvulas();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }

                        // url += "desc&order=dias&page=" + page + ",20";
                    }
                }
                return url;
            }

            self.valvulasArray = ko.observableArray();

            self.valvulasColumnArray = [{
                    headerText: "Folio",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "folio"
                },
                {
                    headerText: "Fecha fabricación",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "fecha_fabricacion"
                },
                {
                    headerText: "Planta",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "planta"
                },
                {
                    headerText: "Estación",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "estacion"
                },
                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "Cliente",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cliente"
                },
                {
                    headerText: "Modelo",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "modelo"
                },
                {
                    headerText: "Medida",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "medida"
                },
                {
                    headerText: "Acción",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "accion"
                },
                {
                    headerText: "Marca",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "marca"
                }
            ];

        }
        return valvulasViewModel;
    });
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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojswitch', 'ojs/ojdatacollection-utils', 'promise', 'ojs/ojarraytabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojcollectiontabledatasource', 'ojs/ojpagingtabledatasource', 'ojs/ojknockout', 'ojs/ojfilepicker', 'ojs/ojarraydataprovider', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata'],
    function(oj, ko, $, app) {
        function conciliacionBancosViewModel() {
            var self = this;
            self.userRating = ko.observable(undefined);

            self.paramsDialog = ko.observable({ 'dialog': { 'title': 'Procesando...' } });

            self.tables = ko.observableArray([
                { id: ko.observable('cortes'), disabled: ko.observable(true), label: ko.observable('Cortes'), value: ko.observable('cortes') },
                { id: ko.observable('dolares'), disabled: ko.observable(true), label: ko.observable('Dolares'), value: ko.observable('dolares') },
                { id: ko.observable('pagos'), disabled: ko.observable(true), label: ko.observable('Pagos'), value: ko.observable('pagos') },
                { id: ko.observable('polizas'), disabled: ko.observable(true), label: ko.observable('Polizas'), value: ko.observable('polizas') },
                { id: ko.observable('traspasos'), disabled: ko.observable(true), label: ko.observable('Traspasos'), value: ko.observable('traspasos') }
            ]);


            self.activeTable = ko.observable("cortes");

            self.banco = undefined;
            self.acceptArr = ko.pureComputed(function() {
                var accept = self.acceptStr();
                return accept ? accept.split(",") : [];
            }, self);

            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
            self.datePicker = {
                numberOfMonths: 1
            };

            self.file = ko.observable();
            self.fileName = ko.observable();
            self.anos = ko.observableArray([]);
            self.ano = ko.observable();

            self.handleAttached = function() {
                app.verifyPermissions();
                // var d1 = $.Deferred();

                initializeResumenMesTable();
                initializeDetalleMesTable();

                var table = document.getElementById('resumenmes-paging-table');
                table.addEventListener('selectionChanged', self.resumenMesSelectionListener);
                table = document.getElementById('detallemes-paging-table');
                table.addEventListener('selectionChanged', self.detalleMesSelectionListener);

                table = document.getElementById('cortesTable');
                // table = document.getElementById('cortes-paging-table');
                table.addEventListener('ojBeforeRowEdit', self.beforeRowEditListener);
                table.addEventListener('ojBeforeRowEditEnd', self.beforeRowEditEndListener);
                table.addEventListener('selectionChanged', self.tableSelectionListener);
                table = document.getElementById('dolaresTable');
                table.addEventListener('selectionChanged', self.tableSelectionListener);
                table = document.getElementById('pagosTable');
                table.addEventListener('selectionChanged', self.tableSelectionListener);
                table = document.getElementById('traspasosTable');
                table.addEventListener('selectionChanged', self.tableSelectionListener);
                table = document.getElementById('polizasTable');
                table.addEventListener('selectionChanged', self.tableSelectionListener);

                table = document.getElementById('cortesTable2');
                table.addEventListener('selectionChanged', self.table2SelectionListener);
                table = document.getElementById('polizasTable2');
                table.addEventListener('selectionChanged', self.table2SelectionListener);
                table = document.getElementById('dolaresTable2');
                table.addEventListener('selectionChanged', self.table2SelectionListener);
                table = document.getElementById('pagosTable2');
                table.addEventListener('selectionChanged', self.table2SelectionListener);
                table = document.getElementById('traspasosTable2');
                table.addEventListener('selectionChanged', self.table2SelectionListener);

                var i, j, obj, year = (new Date()).getFullYear(),
                    month = (new Date()).getMonth() + 1;
                for (i = 0; i < 10; i++) {
                    var lastMonth = i == 0 ? month : 12;
                    for (j = 0; j < lastMonth; j++) {
                        // var value = 3;
                        var value = ((year - i) + "-" + (lastMonth - j));
                        obj = { value: value, label: value };
                        self.anos().push(obj);
                    }
                }



            }



            function initializeDetalleMesTable() {
                var detalleMesCollection, collection, detalleMesModel, pagingDatasource;
                var fetchSize = 10;

                detalleMesModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });

                detalleMesCollection = oj.Collection.extend({
                    customURL: getUrlDetalleMes,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: detalleMesModel
                });

                self.collectionDetalleMes(new detalleMesCollection);
                self.datasourceDetalleMes(new oj.CollectionTableDataSource(self.collectionDetalleMes()));
                self.dataproviderDetalleMes(new oj.PagingTableDataSource(self.datasourceDetalleMes()));

                // self.collectionDetalleMes().fetch({
                //     success: function(collection, response, options) {},
                //     error: function(collection, xhr, options) {}
                // });
            }

            self.collectionCortes = ko.observable();
            self.dataproviderCortes = ko.observable();
            self.datasourceCortes = ko.observable();

            function initializeCortesTable() {
                var cortesCollection, collection, cortesModel, pagingDatasource;
                var fetchSize = 10;

                cortesModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });

                cortesCollection = oj.Collection.extend({
                    customURL: getUrlCortes,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: cortesModel
                });
                self.collectionCortes(new cortesCollection);
                self.datasourceCortes(new oj.CollectionTableDataSource(self.collectionCortes()));
                self.dataproviderCortes(new oj.PagingTableDataSource(self.datasourceCortes()));

                // self.collectionCortes().fetch({
                //     success: function(collection, response, options) {},
                //     error: function(collection, xhr, options) {}
                // });
            }

            var latestParamsCortes = "";
            self.getCortesPaging = function(event, d1) {
                // latestParamsCortes = filterCortes();
                var myCollection = self.collectionCortes();
                myCollection.refresh();
                if (d1)
                    d1.resolve();
            };

            function filterCortes() {
                var d = new Date(),
                    cMonth = d.getMonth(),
                    cYear = d.getFullYear(),
                    res;

                if (self.ano()) {
                    res = self.ano()[0].split("-");
                    d = new Date(res[0], parseInt(res[1]), 0);
                } else {
                    d = new Date(cYear, cMonth, 0);
                }
                var filter = "&params[]=" + encodeURI(self.detalleMesParams.id);
                if (self.searchCortesPva().trim() != '') {
                    filter += "&filter[]=" + encodeURI("pventa*&" + self.searchCortesPva());
                }
                if (self.searchCortesTurno().trim() != '') {
                    filter += "&filter[]=" + encodeURI("turno*&" + self.searchCortesTurno());
                }
                if (self.searchCortesDia() != null) {
                    if (self.searchCortesDia().trim() != '') {
                        filter += "&filter[]=" + encodeURI("dia*&" + self.searchCortesDia());
                    }
                }

                return filter;
            };

            function getUrlCortes(operation, collection, options) {
                var fetchSize = 10;
                var url = "";

                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/servicesAdmin/apiFunctions.php?function=web_bancos_cortes_xcon";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var offset = (page - 1) * fetchSize;
                        var q = filterCortes();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }
                        url += "&orderby=id&desc=1";
                        url += "&offset=" + offset + "&limit=" + fetchSize;
                    }
                }
                console.log(url);
                return url;
            }


            self.collectionResumenMes = ko.observable();
            self.dataproviderResumenMes = ko.observable();
            self.datasourceResumenMes = ko.observable();

            function initializeResumenMesTable() {
                var resumenMesCollection, collection, resumenMesModel, pagingDatasource;
                var fetchSize = 30;
                resumenMesModel = oj.Model.extend({
                    url: "",
                    fetchSize: fetchSize,
                    idAttribute: "id"
                });
                resumenMesCollection = oj.Collection.extend({
                    customURL: getUrlResumenMes,
                    fetchSize: fetchSize,
                    comparator: "id",
                    model: resumenMesModel
                });

                self.collectionResumenMes(new resumenMesCollection);
                self.datasourceResumenMes(new oj.CollectionTableDataSource(self.collectionResumenMes()));
                self.dataproviderResumenMes(new oj.PagingTableDataSource(self.datasourceResumenMes()));

                // self.collectionResumenMes().fetch({
                //     success: function(collection, response, options) {},
                //     error: function(collection, xhr, options) {}
                // });
            }

            self.collectionDetalleMes = ko.observable();
            self.dataproviderDetalleMes = ko.observable();
            self.datasourceDetalleMes = ko.observable();

            self.searchValueDetalleMes = ko.observable('');
            self.searchValueResumenMes = ko.observable();
            self.searchCortesPva = ko.observable('');
            self.searchCortesTurno = ko.observable('');
            self.searchCortesDia = ko.observable('');


            var latestParamsResumenMes = "";
            self.getResumenMesPaging = function(event, d1) {
                latestParamsDetalleMes = self.searchValueResumenMes();
                var myCollection = self.collectionResumenMes();
                myCollection.refresh();
                d1.resolve();
            };

            function filterResumenMes() {
                var d = new Date(),
                    cMonth = d.getMonth(),
                    cYear = d.getFullYear(),
                    res;

                if (self.ano()) {
                    res = self.ano()[0].split("-");
                    d = new Date(res[0], parseInt(res[1]), 0);
                } else {
                    d = new Date(cYear, cMonth, 0);
                }
                var filter = "&params[]=" + encodeURI((d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) +
                    "&params[]=" + encodeURI((d.getFullYear() + "-" + (d.getMonth() + 1) + "-01"));
                return filter;
            };

            var latestParamsDetalleMes = "";
            self.getDetalleMesPaging = function(event, d1) {
                latestParamsDetalleMes = self.searchValueDetalleMes();
                var myCollection = self.collectionDetalleMes();
                myCollection.refresh();
                d1.resolve();
            };

            function filterDetalleMes() {
                // resetValues(234);
                // resetSelections(234);

                var params = latestParamsDetalleMes;
                if (self.resumenMesParams().ano === undefined) {
                    return "";
                }
                var filter = "&params[]=" + encodeURI(self.resumenMesParams().cuenta) +
                    "&params[]=" + encodeURI(self.resumenMesParams().ano) +
                    "&params[]=" + encodeURI(self.resumenMesParams().mes) +
                    "&params[]=" + encodeURI(self.resumenMesParams().pendiente);

                if (self.searchValueDetalleMes().trim().includes("-")) {
                    filter += "&filter[]=" + "dia*|" + self.searchValueDetalleMes();
                    return filter;
                }

                if (self.searchValueDetalleMes().trim() != '') {
                    filter += "&filter[]=" + "cargo*|" + self.searchValueDetalleMes();
                    filter += "&filter[]=" + "abono*|" + self.searchValueDetalleMes();
                    filter += "&filter[]=" + "id*|" + self.searchValueDetalleMes();
                }

                return filter;
            };



            function getUrlDetalleMes(operation, collection, options) {
                var fetchSize = 10;
                var url = "";

                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/servicesAdmin/apiFunctions.php?function=web_bancos_concilia_mes";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var offset = (page - 1) * fetchSize;
                        var q = filterDetalleMes();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }
                        url += "&orderby=id&desc=1";
                        url += "&offset=" + offset + "&limit=" + fetchSize;
                    }
                }
                return url;
            }

            function getUrlResumenMes(operation, collection, options) {
                var fetchSize = 30;
                var url = "";

                if (operation === "read") {
                    url = "https://gaslicuadosabinas.com/servicesAdmin/apiFunctions.php?function=web_bancos_concilia_ano";
                    if (options["fetchSize"]) {
                        var page = 1;
                        if (options["startIndex"] > 0) {
                            page = Math.ceil(options["startIndex"] / fetchSize + 1);
                        }
                        var offset = (page - 1) * fetchSize;
                        var q = filterResumenMes();
                        if (q !== undefined && q !== "") {
                            url += q;
                        }
                        url += "&offset=" + offset + "&limit=" + fetchSize;
                    }
                }
                return url;
            }

            self.resumenMesParams = ko.observable({});



            self.resumenMesSelectionListener = function(event) {
                var data = event.detail;
                var element = document.getElementById('resumenmes-paging-table');
                var currentRow = element.currentRow;
                if (currentRow == null || data['value'].length == 0) {
                    resetValues(1);
                    self.resumenMesParams(undefined);
                    return;
                }
                if (event.type == 'selectionChanged') {
                    resetValues(1);
                    self.collectionResumenMes().get(currentRow.rowKey).then(function(obj) {
                        obj = obj.attributes;
                        var d1 = $.Deferred();
                        openLoadingDialog(d1);
                        self.resumenMesParams({
                            id: obj.id,
                            cuenta: obj.idcuenta,
                            nombre: obj.nombre,
                            mes: obj.mes,
                            pendiente: 0,
                            ano: self.ano()["0"].split("-")[0],
                            moneda: obj.moneda,
                            abonos: obj.abonos,
                            idtotales: obj.idtotales
                        });
                        resetValues();
                        self.getDetalleMesPaging(undefined, d1);
                        var table = document.getElementById('detallemes-paging-table');
                        table.selection = null;
                        self.detalleMesParams = {};
                    });
                }
            }


            // solo dolares: moneda = 2
            // cortes, pagos, traspasos: moneda = 1 and abono
            // polizas: moneda = 1 and cargos  = 1

            function disableButtonSet() {
                if (self.resumenMesParams().moneda == 2) {
                    self.tables()[0].disabled(true);
                    self.tables()[1].disabled(false);
                    self.activeTable("dolares");
                    self.tables()[2].disabled(true);
                    self.tables()[3].disabled(true);
                    self.tables()[4].disabled(true);
                    return;
                }
                if (self.detalleMesParams.abono > 0) {
                    self.tables()[0].disabled(false);
                    self.activeTable("cortes");
                    self.tables()[1].disabled(true);
                    self.tables()[2].disabled(false);
                    self.tables()[3].disabled(true);
                    self.tables()[4].disabled(false);
                }
                if (self.detalleMesParams.cargo > 0) {
                    self.tables()[0].disabled(true);
                    self.tables()[1].disabled(true);
                    self.tables()[2].disabled(true);
                    self.tables()[3].disabled(false);
                    self.activeTable("polizas");
                    self.tables()[4].disabled(true);
                }
            }

            function openLoadingDialog(defArray) {
                $("#dialog-loading").ojDialog("open");

                $.when.apply($, defArray).then(function() {
                    $("#dialog-loading").ojDialog("close");
                });
            }

            self.detalleMesParams = ko.observable();

            self.detalleMesSelectionListener = function(event) {
                var element = document.getElementById('detallemes-paging-table');
                var currentRow = element.currentRow;
                if (event.type == 'selectionChanged' && currentRow != null && currentRow.rowKey != self.detalleMesParams.id) {
                    resetSelections();
                    self.collectionDetalleMes().get(currentRow.rowKey).then(function(obj) {
                        if (obj) {
                            openLoadingDialog(d1);
                            var d1 = $.Deferred();
                            self.detalleMesParams = obj.attributes;
                            disableButtonSet();
                            fillDynamicTable(d1);
                        }
                    });
                }
            }

            self.descargaPdf = function() {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://198.100.45.73/servicesFacturador/descargaPDFPrueba.php', true);
                xhr.responseType = 'blob';
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.onload = function(e) {
                    if (this.status == 200) {
                        var blob = new Blob([this.response], { type: "application/pdf" });
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = "factura_" + ".pdf";
                        link.click();
                    }
                };
                xhr.send();
            }

            self.handleAnoOptionChange = function(event, data) {
                if (data.option == 'value' && Array.isArray(data.value) && data.previousValue != null) {
                    var d1 = $.Deferred();
                    openLoadingDialog(d1);
                    var value = data.value;
                    var data = {
                        'ano': value[0]
                    }
                    resetValues(1);
                    resetSelections(1234);
                    self.getResumenMesPaging(undefined, d1);
                    // getResumenAnoByAno(value[0], d1);
                }

            }

            self.uploadFile = function() {
                var formData = new FormData();
                formData.append("content", self.file());
                formData.append("tipo", self.banco);
                formData.append("usr_captura", app.userLogin());
                formData.append("cuenta_bancomer", self.dialog.cuentaBancomer() ? self.dialog.cuentaBancomer()[0] : undefined);

                $.ajax({
                    type: 'POST',
                    contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                    processData: false, // NEEDED, DON'T OMIT THIS
                    url: "https://198.100.45.73/servicesFacturador/conciliacion_bancos.php",
                    data: formData,
                    success: function(data) {
                        if (data.includes("noerror")) {
                            $('#success-popup').ojPopup('open', '#fileupload');
                        } else {
                            $('#fail-popup').ojPopup('open', '#fileupload');
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Error, no se pudieron subir los datos");
                    }
                })
            }

            self.shouldDisableSubmit = function(event, a) {
                console.log(event, a);
                // return true;  
            }

            self.filePickerListener = function(event) {
                var files = event.detail.files;
                var fileReader = new FileReader();
                self.file(files[0]);
                self.fileName(files[0].name);

                fileReader.readAsText(files[0], "UTF-8");
                fileReader.onload = function(fileLoadedEvent) {
                    self.dialog.cuentaBancomer(undefined);
                    if (fileReader.result.includes("Concepto / Referencia,cargo,Abono,Saldo")) {
                        self.banco = 'bancomer';
                        openDialog();
                        return;
                    } else if (fileReader.result.includes("HISTORIAL DE MOVIMIENTOS")) {
                        self.banco = 'famsa';
                        self.uploadFile();
                    } else if (fileReader.result.includes("Cuenta,Fecha Operaci")) {
                        self.banco = 'azteca';
                        self.uploadFile();
                    } else {
                        self.banco = 'scotia';
                        self.uploadFile();
                    }
                }
            }

            function resetValues(ref) {
                if (ref == 1) {
                    if (self.collectionDetalleMes()) {
                        //workaround for ojcollection reset
                        self.searchValueDetalleMes('');
                        $('#detallemes-paging-table').find('.oj-table-body').html('');
                    }
                }
                if (self.collectionCortes()) {
                    //workaround for ojcollection reset
                    $('#cortesTable').find('.oj-table-body').html('');
                    self.collectionCortes(undefined);
                }
                self.table2CoArray([]);
                self.tablePaArray([]);
                self.table2PaArray([]);
                self.tableTrArray([]);
                self.table2TrArray([]);
                self.tableDoArray([]);
                self.table2DoArray([]);
                self.tablePoArray([]);
                self.table2PoArray([]);
            }

            function resetValues1(ref) {
                if (ref == 1) {
                    if (self.collectionDetalleMes()) {
                        //workaround for ojcollection reset
                        self.searchValueDetalleMes('');
                        $('#detallemes-paging-table').find('.oj-table-body').html('');
                    }
                }
                if (self.collectionCortes()) {
                    //workaround for ojcollection reset
                    $('#cortesTable').find('.oj-table-body').html('');
                    self.collectionCortes(undefined);
                }
                self.tablePaArray([]);
                self.tableTrArray([]);
                self.tableDoArray([]);
                self.tablePoArray([]);
            }

            function resetValues2(ref) {
                if (ref == 1) {
                    if (self.collectionDetalleMes()) {
                        //workaround for ojcollection reset
                        self.searchValueDetalleMes('');
                        $('#detallemes-paging-table').find('.oj-table-body').html('');
                    }
                }

                self.table2CoArray([]);
                self.table2PaArray([]);
                self.table2TrArray([]);
                self.table2DoArray([]);
                self.table2PoArray([]);
            }

            function resetSelections(ref) {
                var table;
                switch (ref) {
                    case 1234:
                        table = document.getElementById('resumenmes-paging-table');
                        table.selection = null;
                        self.resumenMesParams({});
                    case 234:
                        // console.log("s");
                        // table = document.getElementById('detallemes-paging-table');
                        // table.selection = null;
                        // self.detalleMesParams = {};
                    default:
                        table = document.getElementById('cortesTable');
                        table.selection = null;
                        table = document.getElementById('cortesTable2');
                        table.selection = null;

                        table = document.getElementById('dolaresTable');
                        table.selection = null;
                        table = document.getElementById('dolaresTable2');
                        table.selection = null;

                        table = document.getElementById('pagosTable');
                        table.selection = null;
                        table = document.getElementById('pagosTable2');
                        table.selection = null;

                        table = document.getElementById('traspasosTable');
                        table.selection = null;
                        table = document.getElementById('traspasosTable2');
                        table.selection = null;

                }
            }

            self.openTotalesDialog = function openDialog() {
                $("#dialog-totales").ojDialog('open');
            };


            function openDialog() {
                self.dialog.cuentaBancomer(undefined);
                $("#dialog-bancomer").ojDialog('open');
            }

            self.handleOkClose = function() {
                document.querySelector("#dialog-bancomer").close();
                self.uploadFile();
            };

            self.dialog = {
                body: 'Se detectó un estado de cuenta de Bancomer, por favor selecciona la cuenta correspondiente:',
                title: 'Cuenta bancomer',
                cuentasBancomer: ko.observableArray([
                    { label: 'GLS - Escobedo - 162975440', value: '162975440,19' },
                    { label: 'GLS - Sabinas - 162975130', value: '162975130,18' },
                    { label: 'GLS - Acuña - 163077713', value: '163077713,21' },
                    { label: 'KOKE - 163077713', value: '163077713,23' },
                    { label: 'PEPE - 165339421', value: '165339421,27' }
                    // { label: 'IBM - 165339421', value: '165339421,27' }
                ]),
                cuentaBancomer: ko.observable()
            }



            self.rowRenderer = function(context) {
                var mode = context['rowContext']['mode'];

                if (mode === 'edit') {
                    self._editRowRenderer(context);
                } else if (mode === 'navigation') {
                    self._navRowRenderer(context);
                }
            };

            self._editRowRenderer = oj.KnockoutTemplateUtils.getRenderer('editRowTemplate', true);
            self._navRowRenderer = oj.KnockoutTemplateUtils.getRenderer('rowTemplateCortes', true);


            self.tableCoArray = ko.observableArray([]);
            self.tableCoArrayOriginal = ko.observableArray([]);
            self.tableCoDataProvider = ko.observable(new oj.ArrayDataProvider(self.tableCoArray));

            self.tablePaArray = ko.observableArray([]);
            self.tablePaDataProvider = ko.observable(new oj.ArrayDataProvider(self.tablePaArray));

            self.tablePoArray = ko.observableArray([]);
            self.tablePoDataProvider = ko.observable(new oj.ArrayDataProvider(self.tablePoArray));


            self.tableDoArray = ko.observableArray([]);
            self.tableDoDataProvider = ko.observable(new oj.ArrayDataProvider(self.tableDoArray));
            self.tableTrArray = ko.observableArray([]);
            self.tableTrDataProvider = ko.observable(new oj.ArrayDataProvider(self.tableTrArray));

            self.table2PoArray = ko.observableArray([]);
            self.table2PoDataProvider = ko.observable(new oj.ArrayDataProvider(self.table2PoArray));

            self.table2CoArray = ko.observableArray([]);
            self.table2CoDataProvider = ko.observable(new oj.ArrayDataProvider(self.table2CoArray));

            self.table2PaArray = ko.observableArray([]);
            self.table2PaDataProvider = ko.observable(new oj.ArrayDataProvider(self.table2PaArray));

            self.table2DoArray = ko.observableArray([]);
            self.table2DoDataProvider = ko.observable(new oj.ArrayDataProvider(self.table2DoArray));
            self.table2TrArray = ko.observableArray([]);
            self.table2TrDataProvider = ko.observable(new oj.ArrayDataProvider(self.table2TrArray));

            self.currentSelectedDetalleMes = ko.observable();

            function fillDynamicTable(d1) {
                var element = document.getElementById('detallemes-paging-table');
                var currentRow = element.currentRow;
                if (!currentRow) {
                    return;
                }
                var data = {
                    type: self.activeTable(),
                    ref: self.detalleMesParams.id
                }

                $.when($.ajax({
                        method: "POST",
                        url: "https://gaslicuadosabinas.com/servicesAdmin/getDynamicTableData.php",
                        data: data,
                        success: function(data) {
                            var tableId = self.activeTable() + "Table";
                            var table = document.getElementById(tableId);
                            if (Array.isArray(data)) {
                                switch (self.activeTable()) {
                                    case 'cortes':
                                        // if (self.collectionCortes()) {
                                        // self.getCortesPaging();
                                        // } else {
                                        // self.collectionCortes(undefined);
                                        // self.datasourceCortes(undefined);
                                        // self.dataproviderCortes(undefined);
                                        initializeCortesTable();
                                        // }
                                        // var dataClone = Array.prototype.slice.call(data);
                                        // self.tableCoArrayOriginal(data.slice(0));
                                        // self.tableCoArray(JSON.parse(JSON.stringify(data)));
                                        // table.selection = null;
                                        break;
                                    case 'dolares':
                                        self.tableDoArray(data);
                                        table.selection = null;
                                        break;
                                    case 'pagos':
                                        self.tablePaArray(data);
                                        table.selection = null;
                                        break;
                                    case 'polizas':
                                        self.tablePoArray(data);
                                        table.selection = null;
                                        break;
                                    case 'traspasos':
                                        self.tableTrArray(data);
                                        table.selection = null;
                                        break;
                                }
                            } else {
                                resetValues1();
                            }
                        }
                    }), $.ajax({
                        method: "POST",
                        url: "https://gaslicuadosabinas.com/servicesAdmin/getDynamicTable2Data.php",
                        data: data,
                        success: function(data) {
                            var tableId = self.activeTable() + "Table2";
                            var table = document.getElementById(tableId);
                            if (Array.isArray(data)) {
                                switch (self.activeTable()) {
                                    case 'cortes':
                                        self.table2CoArray(data);
                                        table.selection = null;
                                        break;
                                    case 'dolares':
                                        self.table2DoArray(data);
                                        table.selection = null;
                                        break;
                                    case 'pagos':
                                        self.table2PaArray(data);
                                        table.selection = null;
                                        break;
                                    case 'polizas':
                                        self.table2PoArray(data);
                                        table.selection = null;
                                        break;
                                    case 'traspasos':
                                        self.table2TrArray(data);
                                        table.selection = null;
                                        break;
                                }
                            } else {
                                resetValues2();
                            }
                        }
                    })

                ).then(function() {
                    d1.resolve();
                });



            }

            self.handleSelectionMode = function() {
                if (self.activeTable() != 'cortes') {
                    return { "row": "single", "column": "multiple" };
                } else {
                    return { "row": "single", "column": "multiple" };
                }
            }

            self.table2SelectionListener = function(event) {
                var data = event.detail;
                var tableId = self.activeTable() + "Table2";
                var element = document.getElementById(tableId);
                var currentRow = element.currentRow;

                if (data['value'] == null) {
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var row;
                    switch (self.activeTable()) {
                        case 'cortes':
                            row = self.table2CoArray()[currentRow['rowIndex']];
                            break;
                        case 'dolares':
                            row = self.table2DoArray()[currentRow['rowIndex']];
                            break;
                        case 'pagos':
                            row = self.table2PaArray()[currentRow['rowIndex']];
                            break;
                        case 'polizas':
                            row = self.table2PoArray()[currentRow['rowIndex']];
                            // data = "rbancaria=" + self.detalleMesParams.id + "&empresa=" + row.pventa +
                            //     "&poliza=" + row.dia + "&usr_captura=" + app.userLogin();
                            break;
                        case 'traspasos':
                            row = self.table2TrArray()[currentRow['rowIndex']];
                            break;
                    }

                    var data = {
                        'id': row.id,
                        type: self.activeTable()
                    }
                    deleteDynamicTable2Row(data);
                }
            }

            self.downloadDetalleMes = function(event, a) {
                if (self.resumenMesParams().cuenta == undefined) return;
                var data = {
                    table: "web_bancos_concilia_mes",
                    params: [
                        self.resumenMesParams().cuenta, self.resumenMesParams().ano,
                        self.resumenMesParams().mes, self.resumenMesParams().pendiente
                    ],
                    title: "Depósitos de cuenta " + self.resumenMesParams().nombre +
                        " - " + self.resumenMesParams().id + " del mes de " + self.ano()[0]
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

            function deleteDynamicTable2Row(data) {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/deleteDynamicTable2Row.php",
                    data: data,
                    success: function(data) {
                        if (data.includes("allgood")) {
                            var d1 = $.Deferred(),
                                d3 = $.Deferred(),
                                d2 = $.Deferred();
                            openLoadingDialog([d1, d2, d3]);
                            // getResumenAnoByAno(self.ano()["0"], d1);
                            self.getResumenMesPaging(undefined, d3);
                            self.getDetalleMesPaging(undefined, d2);
                            fillDynamicTable(d1);
                        }
                    }
                });
            }

            self.tableSelectionListener = function(event, data) {
                var data = event.detail;
                var tableId = self.activeTable() + "Table";
                var element = document.getElementById(tableId);
                var currentRow = element.currentRow;

                if (data['value'] == null) {
                    return;
                }

                if (event.type == 'selectionChanged') {
                    var row;
                    switch (self.activeTable()) {
                        // case 'cortes':
                        //     row = self.tableCoArray()[currentRow['rowIndex']];
                        //     data = "rbancaria=" + self.detalleMesParams.id + "&corte_id=" + row.id +
                        //         "&importe=" + row.x_asignar + "&turno=" + row.turno + "&usr_captura=" + app.userLogin();
                        //     break;
                        //dolares listo
                        case 'dolares':
                            row = self.tableDoArray()[currentRow['rowIndex']];
                            data = "rbancaria=" + self.detalleMesParams.id + "&corte_id=" + row.id +
                                "&usr_captura=" + app.userLogin();
                            break;
                        case 'pagos':
                            row = self.tablePaArray()[currentRow['rowIndex']];
                            data = "rbancaria=" + self.detalleMesParams.id + "&pago_id=" + row.id + "&usr_captura=" + app.userLogin();
                            break;
                        case 'polizas':
                            row = self.tablePoArray()[currentRow['rowIndex']];
                            data = "rbancaria=" + self.detalleMesParams.id +
                                "&poliza_id=" + row.id + "&usr_captura=" + app.userLogin();
                            break;
                        case 'traspasos':
                            row = self.tableTrArray()[currentRow['rowIndex']];
                            var rbancaria_abono, rbancaria_cargo;
                            if (self.detalleMesParams.abono > 0) {
                                rbancaria_abono = self.detalleMesParams.abono;
                                rbancaria_cargo = row.cargo;
                            } else {
                                rbancaria_abono = row.cargo;
                                rbancaria_cargo = self.detalleMesParams.cargo;
                            }
                            data = "rbancaria_abono=" + rbancaria_abono + "&rbancaria_cargo=" + rbancaria_cargo +
                                "&usr_captura=" + app.userLogin();
                            break;
                    }

                    $.ajax({
                        method: "POST",
                        data: data,
                        processData: false,
                        url: "https://gaslicuadosabinas.com/api.php/web_bancos_" + self.activeTable(),
                        success: function(data) {
                            console.log(data);
                            if (data != null) {
                                var d1 = $.Deferred();
                                var d2 = $.Deferred();
                                var d3 = $.Deferred();
                                openLoadingDialog([d1, d2, d3]);

                                // getResumenAnoByAno(self.ano()["0"], d1);
                                self.getResumenMesPaging(undefined, d1);
                                self.getDetalleMesPaging(undefined, d2);
                                fillDynamicTable(d3);
                            }
                        }
                    });


                } //cortes con
            }
            self.previousEditValue = undefined;
            self.beforeRowEditListener = function(event) {
                var rowKey = event.detail.rowContext.status.rowKey;
                var rowIdx = event.detail.rowContext.status.rowIndex;

                self.collectionCortes().get(rowKey).then(function(value) {
                    self.previousEditValue = value.attributes.x_asignar;
                });
            }

            self.beforeRowEditEndListener = function(event) {
                if (event.detail.originalEvent.key == "Enter") {
                    var rowKey = event.detail.rowContext.status.rowKey;
                    var rowIdx = event.detail.rowContext.status.rowIndex;

                    self.collectionCortes().get(rowKey).then(function(value) {
                        var row = value.attributes;

                        //default es el menor entre el x_asignar pago y el x_asignar de remision y no pasarse de ese num
                        var upperLimit = Math.min(self.previousEditValue, self.detalleMesParams.x_concilar);

                        if (row.x_asignar > upperLimit || row.x_asignar <= 0) {
                            row.x_asignar = self.previousEditValue;
                            return;
                        }


                        // if (oj.DataCollectionEditUtils.basicHandleRowEditEnd(event, data) === false) {
                        //     row.x_asignar = self.previousEditValue;
                        //     event.preventDefault();
                        //     return;
                        // }

                        var data = "rbancaria=" + self.detalleMesParams.id + "&corte_id=" + row.id +
                            "&importe=" + row.x_asignar + "&turno=" + row.turno + "&usr_captura=" + app.userLogin();

                        $.ajax({
                            method: "POST",
                            data: data,
                            processData: false,
                            url: "https://gaslicuadosabinas.com/api.php/web_bancos_" + self.activeTable(),
                            success: function(data) {
                                console.log(data);
                                if (data != null) {
                                    var d1 = $.Deferred();
                                    var d2 = $.Deferred();
                                    var d3 = $.Deferred();
                                    openLoadingDialog([d1, d2, d3]);

                                    // getResumenAnoByAno(self.ano()["0"], d1);
                                    self.getResumenMesPaging(undefined, d1);
                                    self.getDetalleMesPaging(undefined, d2);
                                    fillDynamicTable(d3);
                                }
                            }
                        })
                    });
                }
            };

            self.activeTable.subscribe(function(value) {
                var d1 = $.Deferred();
                // self.activeTable(value);
                openLoadingDialog();

                self.searchCortesPva('');
                self.searchCortesTurno('');
                self.searchCortesDia('');
                // switch (value) {
                //     case 'cortes':
                //         resetValues();
                //         self.dynamicTableColumnArray(self.cortesColumnArray);
                //         self.dynamicTable2ColumnArray(self.cortesColumnArray2);
                //         break;
                //     case 'dolares':
                //         resetValues();
                //         self.dynamicTableColumnArray(self.dolaresColumnArray);
                //         self.dynamicTable2ColumnArray(self.dolaresColumnArray2);
                //         break;
                //     case 'pagos':
                //         resetValues();
                //         self.dynamicTableColumnArray(self.pagosColumnArray);
                //         self.dynamicTable2ColumnArray(self.pagosColumnArray2);
                //         break;
                //     case 'polizas':
                //         self.dynamicTableColumnArray(self.polizasColumnArray);
                //         self.dynamicTable2ColumnArray(self.polizasColumnArray2);
                //         break;
                //     case 'traspasos':
                //         self.dynamicTableColumnArray(self.traspasosColumnArray);
                //         self.dynamicTable2ColumnArray(self.traspasosColumnArray2);
                //         break;
                //     default:
                // }
                fillDynamicTable(d1, value);

            });

            self.handleTableOptionChange = function(event, ui) {

            }

            self.handleBindingsApplied = function() {
                self.activeTable("cortes");
                // var ui = { "value":  };
                // self.handleTableOptionChange(null, ui);
            }


            self.detalleMesColumnArray = [{
                    headerText: "Id",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "id"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Cargo",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cargo"
                },
                {
                    headerText: "Abono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abono"
                },
                {
                    headerText: "Por conciliar",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_concilar"
                },
                {
                    headerText: "Comentario",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cometario"
                }

            ];


            self.resumenMesColumnArray = [{
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Cuenta",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cuenta"
                },

                {
                    headerText: "Mes",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "mes"
                },
                {
                    headerText: "NoAbonos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nabono"
                },
                {
                    headerText: "NoAbonosPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nabonopdf"
                },
                {
                    headerText: "Abonos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abonos"
                },
                {
                    headerText: "PorConciliarAbonos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "xcon_abono"
                },

                {
                    headerText: "DifAbonosPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "xpdf_abono"
                },

                {
                    headerText: "NoCargos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "ncargo"
                },
                {
                    headerText: "NoCargosPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "ncargopdf"
                },
                {
                    headerText: "Cargos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cargos"
                },
                {
                    headerText: "PorConciliarCargos",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "xcon_cargo"
                },

                {
                    headerText: "DifCargosPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "xpdf_cargo"
                },
                {
                    headerText: "Comisiones",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "comisiones"
                },
                {
                    headerText: "Intereses",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "intereses"
                },
                {
                    headerText: "TieneEdoCuentaPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pdf_ecuenta"
                },
                {
                    headerText: "TieneSpeiPDF",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pdf_spei"
                },
                {
                    headerText: "Moneda",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "moneda"
                }
            ];

            self.table2PoColumnArray = [{
                    headerText: "Poliza",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "poliza"
                },
                {
                    headerText: "Cheque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cheque"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Beneficiario",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "beneficiario"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "importe"
                }
            ];

            self.tablePoColumnArray = [{
                    headerText: "Poliza",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "poliza"
                },
                {
                    headerText: "Cheque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cheque"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Beneficiario",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "beneficiario"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "importe"
                }
            ];

            self.tableCoColumnArray = [{
                    headerText: "Dia",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "Turno",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "turno"
                },
                {
                    headerText: "PorAsignar",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_asignar"
                }
            ];

            self.tableCo2ColumnArray = [{
                    headerText: "Corte",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "corte"
                },
                {
                    headerText: "Importe",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "importe"
                },
                {
                    headerText: "PorCorte",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_corte"
                },
                {
                    headerText: "PorDepósito",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_deposito"
                }
            ];

            self.tablePaColumnArray = [{
                    headerText: "Cliente",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cliente"
                },
                {
                    headerText: "Pva",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "NoCheque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nocheque"
                },
                {
                    headerText: "Por conciliar",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_conciliar"
                }
            ];

            self.table2PaColumnArray = [{
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Pva",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "NoCheque",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nocheque"
                },
                {
                    headerText: "Conciliado",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "conciliado"
                }
            ];


            self.tableDoColumnArray = [{
                    headerText: "Corte",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "corte"
                },
                {
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "dia"
                },
                {
                    headerText: "Pventa",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "pventa"
                },
                {
                    headerText: "Turno",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "turno"
                },
                {
                    headerText: "Por asignar",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_asignar"
                }
            ];


            self.table2DoColumnArray = [{
                    headerText: "Corte",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "corte"
                },
                {
                    headerText: "PorCorte",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_corte"
                },
                {
                    headerText: "PorDepósito",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "x_depsoto"
                }
            ];

            self.tableTrColumnArray = [{
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "diabanco"
                },
                {
                    headerText: "Cuenta",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cuenta"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Abono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abono"
                },
                {
                    headerText: "Cargo",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cargo"

                }
            ];

            self.table2TrColumnArray = [{
                    headerText: "Día",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "diabanco"
                },
                {
                    headerText: "Cuenta",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cuenta"
                },
                {
                    headerText: "Nombre",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "nombre"
                },
                {
                    headerText: "Abono",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "abono"
                },
                {
                    headerText: "Cargo",
                    sortable: "disabled",
                    resizable: "enabled",
                    field: "cargo"

                }
            ];

            //polizas
            //traspasos


        }
        return conciliacionBancosViewModel;
    });
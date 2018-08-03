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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojfilepicker', 'ojs/ojradioset', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojvalidation-datetime', 'ojs/ojtimezonedata', 'ojs/ojbutton', 'ojs/ojdialog', 'ojs/ojprogress'],
    function(oj, ko, $, app) {
        function DialogModel(parentVM) {
            var self = this;

            self.tagsArray = ko.observableArray([]);
            self.tags2Array = ko.observableArray([]);
            self.tagsDataProvider = new oj.ArrayDataProvider(self.tagsArray);
            self.tags2DataProvider = new oj.ArrayDataProvider(self.tags2Array);

            self.handleAttached = function() {
                app.verifyPermissions();
                var table = document.getElementById('table-tags-2');
                table.addEventListener('selectionChanged', self.tags2SelectionListener);
                table = document.getElementById('table-tags');
                table.addEventListener('selectionChanged', self.tagsSelectionListener);
            }

            self.dateRangeToValue = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
            self.datePicker = {
                numberOfMonths: 1
            };

            self.shouldDisableSubmit = function() {
                if (self.tags2Array().length > 0) {
                    return false;
                }
                return true;
            };

            self.addTag = function() {
                console.log(self.tag());
                self.tagsToSend().push(self.tag());
            }

            self.submit = function() {
                for (var i = 0; i < self.tagsToSend().length; i++) {
                    var data = "id_documento=" + parentVM.id() + "&id_tag=" + self.tagsToSend()[i][0];
                    $.ajax({
                        type: 'POST',
                        processData: false, // NEEDED, DON'T OMIT THIS
                        url: "https://gaslicuadosabinas.com/api.php/web_documentos_tags_relation",
                        data: data,
                        success: function(data) {
                            if (data) {
                                $("#dialog-tag").ojDialog("close");
                                $('#success-popup').ojPopup('open', '#okButton-tag');
                            } else {
                                $('#failure-popup').ojPopup('open', '#okButton-tag');

                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {}
                    })
                }


            }

            self.beforeOpen = function() {
                $.ajax({
                    method: "GET",
                    url: "https://gaslicuadosabinas.com/api.php/web_documentos_tags?transform=1",
                    success: function(data) {
                        var data = data.web_documentos_tags;
                        var arr = [];
                        self.tagsArray(data);
                    }
                }).done(function(data) {
                    $('#tags-select').ojSelect("refresh");
                });
            }
            var jeje = false;

            self.tagsSelectionListener = function(event, aaa) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('table-tags');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.tagsArray().length > 0 & !jeje) {
                        self.tags2Array.push(self.tagsArray()[currentRow['rowIndex']]);
                        self.tagsArray.splice(currentRow['rowIndex'], 1);
                        jeje = true;
                    } else {
                        jeje = false;
                        element.selection = null;
                    }
                }
            };

            var jaja = false;

            self.tags2SelectionListener = function(event) {
                var data = event.detail;
                if (event.type == 'selectionChanged' && data['value'] != null) {
                    var element = document.getElementById('table-tags-2');
                    var currentRow = element.currentRow;
                    if (currentRow != null && self.tags2Array().length > 0 && !jaja) {
                        self.tagsArray.push(self.tags2Array()[currentRow['rowIndex']]);
                        self.tags2Array.splice(currentRow['rowIndex'], 1);
                        jaja = true;
                    } else {
                        jaja = false;
                        element.selection = null;
                    }
                }
            };

            self.tagsColumnArray = [{
                headerText: "Nombre",
                sortable: "disabled",
                resizable: "enabled",
                field: "nombre"
            }];

        }
        return DialogModel;
    });
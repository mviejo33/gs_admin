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
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojknockout', 'promise', 'ojs/ojtable', 'ojs/ojinputtext', 'ojs/ojlistview', 'ojs/ojarraytabledatasource', 'ojs/ojbutton', 'ojs/ojdialog'],
    function(oj, ko, $, app) {
        function pedidosViewModel() {
            var self = this;
            self.pedidosPendientesArray = ko.observableArray([]);
            self.pedidosPendientesDataSource = new oj.ArrayTableDataSource(self.pedidosPendientesArray, { idAttribute: 'pedido' });
            self.pedidoHistorialArray = ko.observableArray([]);
            self.pedidoHistorialDataSource = new oj.ArrayTableDataSource(self.pedidoHistorialArray);

            self.pvasArray = ko.observableArray([]);
            self.originalPvasArray = ko.observableArray([]);

            self.pvasDataSource = new oj.ArrayTableDataSource(self.pvasArray, { idAttribute: 'pva' });
            self.canEndSelectedPedido = ko.observable(false);

            self.pedidoSeleccionado = ko.observable('');
            self.pvaAsignado = ko.observable('Sin asignar');
            self.currentTitle = ko.observable('Pedidos pendientes');

            self.listViewQueries = [
                { id: 'pendientes', label: 'Pendientes', value: 'pendientes' },
                { id: 'terminados', label: 'Terminados', value: 'terminados' },
                { id: 'todos', label: 'Todos', value: 'todos' }
            ];

            self.activelistViewQuery = "pendientes";

            self.rightClickedPedidoData = ko.observable();

            self.pedidosPendientesOptionChange = function(event, data) {
                if (data['option'] == 'selection') {
                    var element = data.items.addClass("listview-selected");
                    var selectionObj = data['value'];
                    self.pedidoSeleccionado(selectionObj[0]);
                    var element = $("#pedido-asignado");
                    doWaggle(element);
                    var data = {
                        'pedido': self.pedidoSeleccionado(),
                    }
                    getHistorialPedido(data);

                }
            }

            function getHistorialPedido(data) {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getHistorialPedido.php",
                    data: data,
                    success: function(data) {
                        self.pedidoHistorialArray(data);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }

            self.handleListViewQueryOptionChange = function(event, ui) {
                var value = ui.value;
                self.pedidosPendientesArray([]);
                switch (value) {
                    case 'pendientes':
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/getPedidosPendientes.php",
                            success: function(data) {
                                if (data != undefined) {
                                    self.pedidosPendientesArray(data);
                                    self.pedidoHistorialArray([]);
                                    self.currentTitle('Pedidos pendientes');
                                    self.pedidoSeleccionado('');
                                    self.activelistViewQuery = 'pendientes';
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                console.log("Status: " + textStatus);
                                console.log("Error: " + errorThrown);
                            }
                        });
                        break;
                    case 'terminados':
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/getPedidosTerminados.php",
                            success: function(data) {
                                if (data != undefined) {
                                    self.pedidosPendientesArray(data);
                                    self.pedidoHistorialArray([]);
                                    self.currentTitle('Pedidos terminados');
                                    self.pedidoSeleccionado('');
                                    self.activelistViewQuery = 'terminados';
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                console.log("Status: " + textStatus);
                                console.log("Error: " + errorThrown);
                            }
                        });
                        break;
                    case 'todos':
                        $.ajax({
                            method: "POST",
                            url: "https://gaslicuadosabinas.com/servicesAdmin/getPedidosTodos.php",
                            success: function(data) {
                                if (data != undefined) {
                                    self.pedidosPendientesArray(data);
                                    self.pedidoHistorialArray([]);
                                    self.currentTitle('Pedidos pendientes y terminados');
                                    self.pedidoSeleccionado('');
                                    self.activelistViewQuery = 'todos';
                                }
                            },
                            error: function(XMLHttpRequest, textStatus, errorThrown) {
                                console.log("Status: " + textStatus);
                                console.log("Error: " + errorThrown);
                            }
                        });
                        break;
                    default:
                }
            }

            self.pedidosContextMenuFunction = function(event, ui) {
                var choice = ui.item.children("a").text();
                if (choice == 'Asignar a punto de venta') {
                    $("#asignarpedido-dialog").ojDialog("open");
                    getPvas();
                } else if (choice == 'Finalizar') {
                    finalizarPedido();

                }
            };

            self.pvasOptionChange = function(event, data) {
                if (data['option'] == 'selection') {
                    var selectionObj = data['value'];
                    self.pvaAsignado(self.pvasArray()[selectionObj[0].startIndex.row].pva);
                    var element = $("#pva-asignado");
                    doWaggle(element);
                }
            }

            self.beforeOpenContextMenu = function(event, ui) {
                var target = event.originalEvent.target;
                var context = $("#pedidos-listview").ojListView("getContextByNode", target);
                if (context != null) {
                    self.pedidosPendientesDataSource.get(context["key"]).then(function(obj) {
                        self.canEndSelectedPedido((obj.data.pva != '' && obj.data.pva != null && self.activelistViewQuery == 'pendientes') ? true : false);
                        self.rightClickedPedidoData(obj.data);
                        self.pedidoSeleccionado(obj.data.pedido);
                        $("#pedidos-contextmenu").ojMenu("refresh");
                        var data = {
                            'pedido': self.pedidoSeleccionado(),
                        }
                        getHistorialPedido(data);
                    });
                }
            }

            self.filterPvaValue = ko.observable();

            function doWaggle(element) {
                element.removeClass("waggle");
                setTimeout(function() {
                    element.offsetWidth = element.offsetWidth;
                    element.addClass("waggle");
                }, 1);
            }

            self.asignarPedido = function() {
                if (self.pvaAsignado() != 'Sin asignar') {



                    insertPedidoPva();

                    $("#asignarpedido-dialog").ojDialog("close");
                }

            }

            self.filterPva = ko.computed(function() {
                if (!self.filterPvaValue()) {
                    return self.originalPvasArray();
                } else {
                    return ko.utils.arrayFilter(self.originalPvasArray(), function(obj) {
                        return obj.pva.includes(self.filterPvaValue());
                    });
                }
            });



            self.handleKeyUp = function() {
                self.pvasArray(self.filterPva());
            };

            self.nameFilter = function(model, attr, value) {
                var deptName = model.get("numero    ");
                return (deptName.toLowerCase().indexOf(value.toLowerCase()) > -1);
            };

            function getPvas() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPvas.php",
                    success: function(data) {
                        if (data != undefined) {
                            console.log(data);
                            self.pvasArray(data);
                            self.originalPvasArray(data);

                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }

            function finalizarPedido() {
                var timestamp = new Date();
                timestamp = timestamp.toISOString().slice(0, -5).replace("T", " ");
                var data = {
                    'pedido': self.rightClickedPedidoData().pedido,
                    'tsfin': timestamp,
                }
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/finalizarPedido.php",
                    data: data,
                    success: function(data) {
                        console.log(data);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }

            function getPedidosListView() {
                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/getPedidosPendientes.php",
                    success: function(data) {
                        if (data != undefined) {
                            self.pedidosPendientesArray(data);
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }

            function insertPedidoPva() {
                var timestamp = new Date();
                timestamp = timestamp.toISOString().slice(0, -5).replace("T", " ");
                var data = {
                    'pedido': self.pedidoSeleccionado(),
                    'pva': self.pvaAsignado(),
                    'tsini': timestamp
                }

                $.ajax({
                    method: "POST",
                    url: "https://gaslicuadosabinas.com/servicesAdmin/insertPedidoPva.php",
                    data: data,
                    success: function(data) {
                        var options = {
                            body: 'Se agregó una entrada al historial de asignaciones',
                            icon: 'css/images/green-mark.png'
                        }


                        if (Notification.permission === "granted") {
                            var notification = new Notification("Pedido Asignado", options);
                        }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("Status: " + textStatus);
                        console.log("Error: " + errorThrown);
                    }
                });
            }



            self.handleAttached = function() {
                var userLogin = localStorage.getItem("userLogged");
                if (userLogin == undefined || userLogin == "") {
                    app.unauthorized(true);
                }
                app.verifyPermissions();
                var source = new EventSource("https://gaslicuadosabinas.com/notifications.php");
                source.onmessage = function(event) {
                    var options = {
                        body: 'Refresca la pagina',
                        icon: 'css/images/light-bulb.png'
                    }

                    if (Notification.permission === "granted") {
                        var notification = new Notification("Nuevo pedido!", options);
                    }
                };

                if (Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }

                getPedidosListView();
            }

        }
        return pedidosViewModel;
    });

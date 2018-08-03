/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojrouter', 'ojs/ojknockout', 'ojs/ojarraytabledatasource',
        'ojs/ojoffcanvas'
    ],
    function(oj, ko) {
        function ControllerViewModel() {
            var self = this;
            var userLogin = localStorage.getItem("userLogged");
            var privilege = localStorage.getItem("privilege");
            self.isLoggedIn = ko.observable((userLogin == 'null' || userLogin == '') ? false : true);

            // Media queries for repsonsive layouts
            var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
            self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
            var mdQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
            self.mdScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
            self.unauthorized = ko.observable(false);


            // Router setup
            self.router = oj.Router.rootInstance;
            self.router.configure({
                'signin': { label: 'Sign In', isDefault: true },
                'resetpwd': { label: 'Reset Pwd' },
                'conciliacion': { label: 'Conciliacion' },
                'timbradopagos': { label: 'Timbrado de pagos' },
                'reportes': { label: 'Reportes' },
                'forgotpwd': { label: 'Forgot Pwd' },
                'enterValidationCode': { label: 'Enter Validation Code' },
                'signup': { label: 'Sign up' },
                'historial': { label: 'Historial' },
                'control': { label: 'Control' },
                'facturacion': { label: 'Facturación' }
            });
            oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

            // Navigation setup

            self.verifyPermissions = function() {
                var userLogin = localStorage.getItem("userLogged");
                if (userLogin == undefined || userLogin == "" || userLogin == 'null') {
                    self.unauthorized(true);
                    return;
                }
                var privilege = localStorage.getItem("privilege");
                self.privilege(privilege);
                var navData = [];
                var facturacionButtonSet = [];
                var conciliacionButtonSet = [];
                if (self.privilege() == 1) {
                    navData = [{
                            name: 'Facturación',
                            id: 'facturacion'
                        },
                        {
                            name: 'Timbrado de pagos',
                            id: 'timbradopagos'
                        },
                        {
                            name: 'Concilación',
                            id: 'conciliacion'
                        },
                        {
                            name: 'Reportes',
                            id: 'reportes'
                        },
                        {
                            name: 'Control',
                            id: 'control'
                        }
                    ];

                    facturacionButtonSet = [
                        // { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes' },
                        { id: 'contado', label: 'Contado', value: 'contado', disabled: false },
                        { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes', disabled: false },
                        { id: 'credito', label: 'Crédito', value: 'credito', disabled: false },
                        { id: 'vales', label: 'Vales', value: 'vales', disabled: false },
                        { id: 'activos', label: 'Activos', value: 'activos', disabled: false },
                        { id: 'notacredito', label: 'Nota de crédito', value: 'notacredito', disabled: false },
                        { id: 'publicogeneral', label: 'Público general', value: 'publicogeneral', disabled: false },
                        { id: 'fletes', label: 'Fletes', value: 'fletes', disabled: false },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    timbradoPagosButtonSet = [
                        { id: 'timbrado', label: 'Timbrado', value: 'timbrado', disabled: false },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    conciliacionButtonSet = [
                        { id: 'bancos', label: 'Bancos', value: 'bancos', disabled: false },
                        { id: 'facturacion', label: 'Creditos', value: 'facturacion', disabled: false }
                    ];

                    reportesButtonSet = [
                        { id: 'ultimaslecturas', label: 'Últimas lecturas', value: 'ultimaslecturas', disabled: false },
                        { id: 'valvulas', label: 'Válvulas', value: 'valvulas', disabled: false },
                        { id: 'docs', label: 'Documentos', value: 'docs', disabled: false }
                    ];


                } else if (self.privilege() == 2) {
                    navData = [{
                            name: 'Facturación',
                            id: 'facturacion'
                        },
                        {
                            name: 'Concilación',
                            id: 'conciliacion'
                        },
                        {
                            name: 'Reportes',
                            id: 'reportes'
                        }
                    ];

                    facturacionButtonSet = [
                        // { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes' },
                        { id: 'contado', label: 'Contado', value: 'contado', disabled: false },
                        { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes', disabled: false },
                        { id: 'credito', label: 'Credito', value: 'credito', disabled: false },
                        { id: 'vales', label: 'Vales', value: 'vales', disabled: false },
                        { id: 'activos', label: 'Activos', value: 'activos', disabled: false },
                        { id: 'notacredito', label: 'Nota de crédito', value: 'notacredito', disabled: true },
                        { id: 'publicogeneral', label: 'Publico general', value: 'publicogeneral', disabled: true },
                        { id: 'fletes', label: 'Fletes', value: 'fletes', disabled: false },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    conciliacionButtonSet = [
                        { id: 'bancos', label: 'Bancos', value: 'bancos', disabled: false },
                        { id: 'facturacion', label: 'Creditos', value: 'facturacion', disabled: false }
                    ];

                    timbradoPagosButtonSet = [
                        { id: 'timbrado', label: 'Timbrado', value: 'timbrado', disabled: false },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    reportesButtonSet = [
                        { id: 'ultimaslecturas', label: 'Últimas lecturas', value: 'ultimaslecturas', disabled: false },
                        { id: 'valvulas', label: 'Válvulas', value: 'valvulas', disabled: false },
                        { id: 'docs', label: 'Documentos', value: 'docs', disabled: false }
                    ];
                } else if (self.privilege() == 3) {
                    navData = [{
                            name: 'Facturación',
                            id: 'facturacion'
                        },
                        {
                            name: 'Concilación',
                            id: 'conciliacion'
                        }
                    ];

                    facturacionButtonSet = [
                        // { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes' },
                        { id: 'contado', label: 'Contado', value: 'contado', disabled: false },
                        { id: 'solicitudes', label: 'Solicitudes', value: 'solicitudes', disabled: false },
                        { id: 'credito', label: 'Credito', value: 'credito', disabled: false },
                        { id: 'vales', label: 'Vales', value: 'vales', disabled: false },
                        { id: 'activos', label: 'Activos', value: 'activos', disabled: true },
                        { id: 'notacredito', label: 'Nota de crédito', value: 'notacredito', disabled: true },
                        { id: 'publicogeneral', label: 'Publico general', value: 'publicogeneral', disabled: true },
                        { id: 'fletes', label: 'Fletes', value: 'fletes', disabled: true },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    conciliacionButtonSet = [
                        { id: 'bancos', label: 'Bancos', value: 'bancos', disabled: false },
                        { id: 'facturacion', label: 'Creditos', value: 'facturacion', disabled: false }
                    ];

                    timbradoPagosButtonSet = [
                        { id: 'timbrado', label: 'Timbrado', value: 'timbrado', disabled: false },
                        { id: 'historial', label: 'Historial', value: 'historial', disabled: false }
                    ];

                    reportesButtonSet = [
                        { id: 'ultimaslecturas', label: 'Últimas lecturas', value: 'ultimaslecturas', disabled: true },
                        { id: 'valvulas', label: 'Válvulas', value: 'valvulas', disabled: true },
                        { id: 'docs', label: 'Documentos', value: 'docs', disabled: true }
                    ];

                }

                self.navDataSource(new oj.ArrayTableDataSource(navData, { idAttribute: 'id' }));
                $("#navlist").ojNavigationList("refresh");

                return {
                    facturacion: {
                        buttonSet: facturacionButtonSet
                    },
                    conciliacion: {
                        buttonSet: conciliacionButtonSet
                    },
                    timbradoPagos: {
                        buttonSet: timbradoPagosButtonSet
                    },
                    reportes: {
                        buttonSet: reportesButtonSet
                    }
                };
            }

            self.handleAttached = function() {
                self.verifyPermissions();
            }

            self.navDataSource = ko.observable();

            // Drawer
            // Close offcanvas on medium and larger screens
            self.mdScreen.subscribe(function() { oj.OffcanvasUtils.close(self.drawerParams); });
            self.drawerParams = {
                displayMode: 'push',
                selector: '#navDrawer',
                content: '#pageContent'
            };
            // Called by navigation drawer toggle button and after selection of nav drawer item
            self.toggleDrawer = function() {
                return oj.OffcanvasUtils.toggle(self.drawerParams);
            }
            // Add a close listener so we can move focus back to the toggle button when the drawer closes
            $("#navDrawer").on("ojclose", function() { $('#drawerToggleButton').focus(); });

            // Header
            // Application Name used in Branding Area
            self.appName = ko.observable("Gas Licuado de Sabinas");
            // User Info used in Global Navigation area
            self.userLogin = ko.observable(userLogin);
            self.privilege = ko.observable(privilege);

            self.signOut = function() {
                localStorage.setItem("userLogged", '');
                localStorage.setItem("privilege", '');
                self.isLoggedIn(false);
                self.userLogin('');
                self.router.go("signin");
            }

            // Footer
            function footerLink(name, id, linkTarget) {
                this.name = name;
                this.linkId = id;
                this.linkTarget = linkTarget;
            }
            self.footerLinks = ko.observableArray([
                new footerLink('pedidos Oracle', 'pedidosOracle', 'http://www.oracle.com/us/corporate/index.html#menu-pedidos'),
                new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
                new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
                new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
                new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
            ]);
        }

        return new ControllerViewModel();
    }
);
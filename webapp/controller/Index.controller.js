sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";


	return Controller.extend("PortalPortal.controller.Index", {
		onInit: function() {
			
			window.console.log("Index initialized");
		},
		
	
		maintanencePortal: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Maintanence");
		},
		shopfloorPortal: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Shopfloor");
		},
		ehsmPortal: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Ehsm");
		},
		qualityPortal: function(oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Quality");
		}
		
		

	});
});
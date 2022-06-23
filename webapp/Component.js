sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"PortalPortal/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("PortalPortal.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			//enable routing
			this.getRouter().initialize();
		},
		
		destroy: function(){
			this._oErrorHandler.destroy();
			if(this.oRouteHandler){
				this.oRouteHandler.destroy();
			}
			// call the base component's destroy function
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
		}
		
		
		
	});
});
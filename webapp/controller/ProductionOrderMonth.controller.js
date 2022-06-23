sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, History, JSONModel, MessageBox, MessageToast,Filter,FilterOperator) {
	"use strict";

	return Controller.extend("PortalPortal.controller.ProductionOrderMonth", {

		onInit: function() {
			this.setFilteredData();
			this.getView().addEventDelegate({                
				// not added the controller as delegate to avoid controller functions with similar names as the events                
				onBeforeShow : jQuery.proxy(function(evt) {                          
					this.onBeforeShow(evt);                
					
				}, this)   		 
				
			});   		 		 	
			
		}, 	 	 	
		onBeforeShow : function(evt) {           
			this.setFilteredData();
		},
		
		
		onFilterProdMonth: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("OrderNumber", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("productionOrderFilterMnthTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		onProductionFilterMnthSelect : function(){
			this._getprodOrderDialog().open();
			
			var ooModelData = this.getView().byId("productionOrderFilterMnthTable").getModel("productionOrderFilterMnth");
			var rr = this.getView().byId("productionOrderFilterMnthTable")._aSelectedPaths[0].split("/")[2];
			var aaRows = ooModelData.getProperty("/");
			
			sap.ui.getCore().byId("pr_OrderType").setText(aaRows.results[rr].OrderType);
			sap.ui.getCore().byId("pr_Material").setText(aaRows.results[rr].Material);
			sap.ui.getCore().byId("pr_MaterialText").setText(aaRows.results[rr].MaterialText);
			sap.ui.getCore().byId("pr_MrpController").setText(aaRows.results[rr].MrpController);
			sap.ui.getCore().byId("pr_TargetQuantity").setText(aaRows.results[rr].TargetQuantity.toLocaleString());
			sap.ui.getCore().byId("pr_Unit").setText(aaRows.results[rr].Unit);
			sap.ui.getCore().byId("pr_ReservationNumber").setText(aaRows.results[rr].ReservationNumber);
			sap.ui.getCore().byId("pr_RoutingNo").setText(aaRows.results[rr].RoutingNo);
			sap.ui.getCore().byId("pr_ProductionStartDate").setText(aaRows.results[rr].ProductionStartDate.toLocaleString());
			sap.ui.getCore().byId("pr_ProductionFinishDate").setText(aaRows.results[rr].ProductionFinishDate.toLocaleString());
			sap.ui.getCore().byId("pr_SchedReleaseDate").setText(aaRows.results[rr].SchedReleaseDate.toLocaleString());
			sap.ui.getCore().byId("pr_ActualReleaseDate").setText(aaRows.results[rr].ActualReleaseDate.toLocaleString());
			sap.ui.getCore().byId("pr_SystemStatus").setText(aaRows.results[rr].SystemStatus);
			
			
			sap.ui.getCore().byId("ProductionOrderDetail").setTitle("Order Number : " + aaRows.results[rr].OrderNumber);

		
		},
		
			
		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;
			
		},

		
		_getprodOrderDialog: function() {
			if (!this._oDialog) {
				// "PortalMaintanencePortalMaintanence.view.Fragments.detail"
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.prodorder", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		setFilteredData : function(){
			var jsonModelprodmnth = new JSONModel();
			
			window.console.log("Planned Order Filter page Initialized");
			var oDataprodfilter = sap.ui.getCore().getModel("prodorderFilter").getData();
			jsonModelprodmnth.setData(oDataprodfilter);
		
			this.getView().setModel(jsonModelprodmnth, "productionOrderFilterMnth");
			
		},

		onBack: function() {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
			this.getOwnerComponent().getRouter().navTo("ShopfloorDashboard");
			}

		},
		
		onHomelogout: function() {
			this.logoutAndNavigateTo("Index", -2);

		},
		
		logoutAndNavigateTo: function(whichPage, step) {
			MessageBox.warning("Are you sure, You want to logout ?", {
				title: "Logout ?",
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],

				onClose: function(sButton) {
					if (sButton === MessageBox.Action.OK) {
						var oHistory, sPreviousHash;
						oHistory = History.getInstance();
						sPreviousHash = oHistory.getPreviousHash();
						if (sPreviousHash !== undefined) {
							window.history.go(step);
							this._getDialog("PortalPortal.view.Fragments.BusyDialogsf").close();
						} else {
							this.getOwnerComponent().getRouter().navTo(whichPage,{}, true);
							this._getDialog("PortalPortal.view.Fragments.BusyDialogsf").close();
						}
						MessageToast.show("Logged out !");
					}
				}
			});
		}
		

	});

});
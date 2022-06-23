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

	return Controller.extend("PortalPortal.controller.PlannedOrderMonth", {

		onInit: function() {
			this.setFilteredData();
			this.getView().addEventDelegate({                
				// not added the controller as delegate to avoid controller functions with similar names as the events                
				onBeforeShow : jQuery.proxy(function(evt) {                          
					this.onBeforeShow(evt);                
					
				}, this)   		 
				
			});   		 		 	
			
		}, 
		
		onFilterPlnMonth: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("PlannedorderNum", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("plannedOrderFilterMnthTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		onBeforeShow : function(evt) {           
			this.setFilteredData();
			
		},
		
		onPlannedFilterMnthSelect : function(){
			this._getplanOrderDialog().open();
			
			var oModelData = this.getView().byId("plannedOrderFilterMnthTable").getModel("plannedOrderFilterMnth");
		
			var r = this.getView().byId("plannedOrderFilterMnthTable")._aSelectedPaths[0].split("/")[2];
			
			var aRows = oModelData.getProperty("/");
			
			sap.ui.getCore().byId("pl_OrderType").setText(aRows.results[r].OrderType);
			sap.ui.getCore().byId("pl_MrpController").setText(aRows.results[r].MrpController);
			sap.ui.getCore().byId("pl_Material").setText(aRows.results[r].Material);
			sap.ui.getCore().byId("pl_OrderFinDate").setText(aRows.results[r].OrderFinDate.toLocaleString());
			sap.ui.getCore().byId("pl_PlanOpenDate").setText(aRows.results[r].PlanOpenDate.toLocaleString());
			sap.ui.getCore().byId("pl_OrderStartDate").setText(aRows.results[r].OrderStartDate.toLocaleString());
			sap.ui.getCore().byId("pl_ProdPlant").setText(aRows.results[r].ProdPlant);
			sap.ui.getCore().byId("pl_SpecialprocType").setText(aRows.results[r].SpecialprocType);
			sap.ui.getCore().byId("pl_TotalPlordQty").setText(aRows.results[r].TotalPlordQty);
			sap.ui.getCore().byId("PlannedOrderDetail").setTitle("Order Number : " + aRows.results[r].PlannedorderNum);
		},
		
			
		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;
			
		},

		
		_getplanOrderDialog: function() {
			if (!this._oDialog) {
				// "PortalMaintanencePortalMaintanence.view.Fragments.detail"
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.planorder", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		setFilteredData : function(){
			var jsonModelplyr = new JSONModel();
			var jsonProfile = new JSONModel();
			window.console.log("Planned Order Filter page Initialized");
			var oDataplnfilter = sap.ui.getCore().getModel("planorderFilter").getData();
			// var yearda = oDataplnfilter.results[0].OrderStartDate.getFullYear();
			
			jsonModelplyr.setData(oDataplnfilter);
		
			this.getView().setModel(jsonModelplyr, "plannedOrderFilterMnth");
			
			
		},

		onBack: function() {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
			this.getOwnerComponent().getRouter().navTo("PlannedOrderMonth");
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
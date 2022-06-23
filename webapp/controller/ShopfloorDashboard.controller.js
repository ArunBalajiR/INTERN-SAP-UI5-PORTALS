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
	
	var plancount,prodcount,planfilterCount,prodfilterCount;

	return Controller.extend("PortalPortal.controller.ShopfloorDashboard", {
		
		onInit : function(){
			window.console.log("Shopfloor Dashboard Initialized");
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var surlMain = "/sap/opu/odata/sap/ZARUNSHOPFLOORSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			
			this._initialProfilefetch(surl,profileData);
			this._initialPlannedOrderFetch(surlMain,profileData);
			this._initialProdOrderFetch(surlMain,profileData);
			
			
			//count
			this.getView().byId("chartplan").setValue(plancount);
			this.getView().byId("chartplant").setValue(plancount);
			this.getView().byId("chartprodt").setValue(prodcount);
			
			
		},
		
		refresh:function(){
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var surlMain = "/sap/opu/odata/sap/ZARUNSHOPFLOORSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			
			this._initialProfilefetch(surl,profileData);
			this._initialPlannedOrderFetch(surlMain,profileData);
			this._initialProdOrderFetch(surlMain,profileData);
			MessageToast.show("Reloaded Data Successfully");
		},
		
		toPlanorder: function() {
			var tab = this.byId("icontabsf");
			tab.setSelectedKey("planorder");
		},

		toProdorder: function() {
			var tab = this.byId("icontabsf");
			tab.setSelectedKey("prodorder");
		},
		
		
		_initialProfilefetch: function(surl,profileData){
			//USER PROFILE
			var jsonUser = new JSONModel();
			var oModelUser = new sap.ui.model.odata.ODataModel(surl, true);
			var uriUser = "Userid='" + profileData.uId + "',Password='" + profileData.uPwd + "'";

			oModelUser.read("/userSet(" + uriUser + ")", {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("User Detailsfetched");
					jsonUser.setData(oData);

				}
			});
			this.getView().setModel(jsonUser);
		
		},
		
		_initialPlannedOrderFetch : function(surl,profileData){
			var jsonModel = new JSONModel();
			var oModel = new sap.ui.model.odata.ODataModel(surl, true);

			
			var uri = "?$filter=WaPlanorder eq '" + profileData.uPlant + "'&$format=json";
			oModel.read("/planorderListSet" + uri, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("PlannedOrder List fetched");
					plancount = oData.results.length;
					jsonModel.setData(oData);

				}
			});
			this.getView().setModel(jsonModel, "plannedorderList");
			
		},
		
		onFilterPlanorder: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("PlannedorderNum", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("plannedOrderListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		_initialProdOrderFetch : function(surl,profileData){
				var jsonModell = new JSONModel();
				var oModell = new sap.ui.model.odata.ODataModel(surl, true);
				//prodorderListSet?$filter=Plant eq '0001'
				var urii = "?$filter=Plant eq '" + profileData.uPlant + "'";
				oModell.read("/prodorderListSet" + urii, {
					context: null,
					urlParameters: null,
					async: false,
					success: function(oData, oResponse) {
						window.console.log("Prodorder list fetched");
						jsonModell.setData(oData);
						prodcount = oData.results.length;


				}
			});
			this.getView().setModel(jsonModell, "prodorderList");
		},
		
		onFilterProdorder: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("OrderNumber", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("productionOrderListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		onlogoutAndBack : function(){
			this.logoutAndNavigateTo("Shopfloor",-1);
		},
		
		toHome : function(){
			this.logoutAndNavigateTo("Index",-2);
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
		},
		
		_getplanOrderDialog: function() {
			if (!this._oDialog) {
				// "PortalMaintanencePortalMaintanence.view.Fragments.detail"
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.planorder", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		_getprodOrderDialog: function() {
			if (!this._oDialog) {
				// "PortalMaintanencePortalMaintanence.view.Fragments.detail"
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.prodorder", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;
			
		},

		onPlannedSelect : function(){
			this._getplanOrderDialog().open();
			
			var oModelData = this.getView().byId("plannedOrderListTable").getModel("plannedorderList");
			var r = this.getView().byId("plannedOrderListTable")._aSelectedPaths[0].split("/")[2];
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
		
		onProductionSelect : function(){
			this._getprodOrderDialog().open();
			
			var ooModelData = this.getView().byId("productionOrderListTable").getModel("prodorderList");
			var rr = this.getView().byId("productionOrderListTable")._aSelectedPaths[0].split("/")[2];
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
		
		
		//PLANNED ORDER FILTER
		getplnFilterYr : function(){
			this._getplnFilter("plYr","YEAR");
		},
		
		getplnFilterMnth : function(){
			this._getplnFilter("plMn","MONTH");
		},
		_getplnFilter: function(id,yrOrmn) {
			var surlFilter = "/sap/opu/odata/sap/ZARUNSHOPFLOORSERVICE_SRV/";
			var profileDataFilter = sap.ui.getCore().getModel("userprofile").getData();
			var plnFilter = this.getView().byId(id).getValue();
			window.console.log(plnFilter);

			//proceed if not empty
			if (plnFilter !== "") {
				var jsonModelplnFilter = new JSONModel();
				var oModelplnFilter = new sap.ui.model.odata.ODataModel(surlFilter, true);
				//planorderFilterSet?$filter=Plant eq '0001' and PType eq 'MONTH' and PValue eq '6'
				var uriplnFilter =  "?$filter=Plant eq '" + profileDataFilter.uPlant + "' and PType eq '"+yrOrmn+"' and PValue eq'"+plnFilter+"'";
				window.console.log(uriplnFilter);
				
				

				oModelplnFilter.read("/planorderFilterSet" + uriplnFilter, {
					context: null,
					urlParameters: null,
					async: false,
					success: function(oData, oResponse) {
						window.console.log("Planorder filter list fetched");
						window.console.log(oData);
						jsonModelplnFilter.setData(oData);
						planfilterCount = oData.results.length;						

					}
				});
				
				
				
				sap.ui.getCore().setModel(jsonModelplnFilter, "planorderFilter");
				window.console.log(planfilterCount);
				
				
				if(planfilterCount === 0){
					MessageBox.information("No Entries on that particular Period");
					
				}
				else if (planfilterCount !== null || planfilterCount !== undefined) {
					
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					if(yrOrmn === "YEAR"){
						oRouter.navTo("PlannedOrderYear");	
					}else if(yrOrmn === "MONTH"){
						oRouter.navTo("PlannedOrderMonth");
					}
					
				
				} else {
					
					MessageToast.show("UID or Password incorrect");
				}

			} else {
				
				MessageToast.show("Please fill field");
			}
		},
		
		//PRODUCTION ORDER FILTER
		getProdFilterYr : function(){
			this._getprodFilter("pdYr","YEAR");
		},
		
		getProdFilterMnth : function(){
			this._getprodFilter("pdMn","MONTH");
		},
		
		_getprodFilter: function(id,yrOrmn) {
			var surlFilter = "/sap/opu/odata/sap/ZARUNSHOPFLOORSERVICE_SRV/";
			var prodFilter = this.getView().byId(id).getValue();
			window.console.log(prodFilter);

			//proceed if not empty
			if (prodFilter !== "") {
				var jsonModelprodFilter = new JSONModel();
				var oModelprodFilter = new sap.ui.model.odata.ODataModel(surlFilter, true);
				// prodorderFilterSet?$filter=Moryr eq 'YEAR' and Value eq '2022'
				var uriprodFilter =  "?$filter=Moryr eq '"+yrOrmn+"' and Value eq'"+prodFilter+"'";
				window.console.log(uriprodFilter);
				
				oModelprodFilter.read("/prodorderFilterSet" + uriprodFilter, {
					context: null,
					urlParameters: null,
					async: false,
					success: function(oData, oResponse) {
						window.console.log("Prodorder filter list fetched");
						window.console.log(oData);
						jsonModelprodFilter.setData(oData);
						prodfilterCount = oData.results.length;						

					}
				});
				
				sap.ui.getCore().setModel(jsonModelprodFilter, "prodorderFilter");
				window.console.log(prodfilterCount);
				
				if(prodfilterCount === 0){
					MessageBox.information("No Entries on that particular Period");
					
				}
				else if (prodfilterCount !== null || prodfilterCount !== undefined) {
					
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					if(yrOrmn === "YEAR"){
						oRouter.navTo("ProductionOrderYear");	
					}else if(yrOrmn === "MONTH"){
						oRouter.navTo("ProductionOrderMonth");
					}
					
				} else {
					
					MessageToast.show("UID or Password incorrect");
				}

			} else {
				
				MessageToast.show("Please fill field");
			}
		}

	});

});
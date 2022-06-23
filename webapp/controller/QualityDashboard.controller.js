sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, History, JSONModel, MessageBox, MessageToast,formatter,Filter,FilterOperator) {
	"use strict";

	

	var decAccepted = 0,
		decRejected = 0,
		decPending = 0,
		usagedcount,
		insplotcount, resreccount;

	return Controller.extend("PortalPortal.controller.QualityDashboard", {
		formatter: formatter,
		onInit: function() {
			window.console.log("Quality Dashboard Initialized");
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var qualityUrl = "/sap/opu/odata/sap/ZARUNQMSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			
			this._initialProfilefetch(surl,profileData);
			this._initialInspectionsFetch(qualityUrl,profileData);
			this._initialResultRecordFetch(qualityUrl,profileData);
			this._initialUsageDecisionFetch(qualityUrl,profileData);
			
			//HOME PAGE STATISTICS
			this.getView().byId("insplotcount").setValue(insplotcount);
			this.getView().byId("resreccount").setValue(resreccount);
			this.getView().byId("decAccepted").setValue(decAccepted);
			this.getView().byId("decRejected").setValue(decRejected);
			this.getView().byId("decPending").setValue(decPending);

		},
		
		refresh: function(){
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var qualityUrl = "/sap/opu/odata/sap/ZARUNQMSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			decAccepted = 0;decRejected=0;decPending=0;insplotcount=0;resreccount=0;usagedcount=0;
			this._initialProfilefetch(surl,profileData);
			this._initialInspectionsFetch(qualityUrl,profileData);
			this._initialUsageDecisionFetch(qualityUrl,profileData);
			this._initialResultRecordFetch(qualityUrl,profileData);
			MessageToast.show("Reloaded Data Successfully");
		},
		
		toInspection: function() {
			var tab = this.byId("icontabQuality");
			tab.setSelectedKey("inspectionlot");
		},

		toResultrec: function() {
			var tab = this.byId("icontabQuality");
			tab.setSelectedKey("resultrecords");
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
		
		//iNSPECTION LOT LISTS
		_initialInspectionsFetch: function(surl,profileData){
			var jsonModel = new JSONModel();
			var oModel = new sap.ui.model.odata.ODataModel(surl, true);

			//?$filter=Plant eq '0001'
			var uri = "?$filter=Plant eq '" + profileData.uPlant + "'";
			oModel.read("/inspectionlotSet" + uri, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Inspection lot fetched");
					insplotcount = oData.results.length;
					jsonModel.setData(oData);
					
						
					var jsonNCount = oData;
					for (var i in jsonNCount.results) {
						if (jsonNCount.results[i].UsageDecision === "APPROVED") decAccepted = decAccepted + 1;
						if (jsonNCount.results[i].UsageDecision === "REJECTED") decRejected = decRejected + 1;
						if (jsonNCount.results[i].UsageDecision === "PENDING") decPending = decPending + 1;
					}

					
				}
			});
			this.getView().setModel(jsonModel, "inspectionsList");
		},
		
		onFilterInspLot: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Insplot", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("inspectionlotTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		//result record list 
		_initialResultRecordFetch: function(surl,profileData){
			var jsonModell = new JSONModel();
			var oModell = new sap.ui.model.odata.ODataModel(surl, true);
			var urii = "?$filter=Plant eq '" + profileData.uPlant + "'";
		
			oModell.read("/resultrecordsSet" + urii, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Result Records list fetched");
					jsonModell.setData(oData);
					resreccount = oData.results.length;

				}
			});
			this.getView().setModel(jsonModell, "resrecordList");
		},
		
		onFilterResRecLot: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Prueflos", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("resrecordTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		//usage decision
		_initialUsageDecisionFetch : function(surl,profileData){
			var jsonModelud = new JSONModel();
			var oModelud = new sap.ui.model.odata.ODataModel(surl, true);
			var uriud = "?$filter=Plant eq '" + profileData.uPlant + "'";
		
			oModelud.read("/usagedecisionSet" + uriud, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Usage decision list fetched");
					jsonModelud.setData(oData);

				}
			});
			this.getView().setModel(jsonModelud, "usageDecisionList");
		},
		
		onFilterUsageDec: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Insplot", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("usageDecisionTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},

		toHome: function() {
			this.logoutAndNavigateTo("Index",-2);
		},
		onBack: function(){
			this.logoutAndNavigateTo("Quality",-1);
		},


		toNotification: function() {
			var tab = this.byId("idIconTabBar");
			tab.setSelectedKey("notification");
		},

		toWorkorder: function() {
			var tab = this.byId("idIconTabBar");
			tab.setSelectedKey("workorder");
		},
		
		
		_getInspectionDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.InspectionDetail", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},


		onInspectionSelect: function() {
			this._getInspectionDetailDialog().open();
			var oModelData = this.getView().byId("inspectionlotTable").getModel("inspectionsList");
			var r = this.getView().byId("inspectionlotTable")._aSelectedPaths[0].split("/")[2];
			var aRows = oModelData.getProperty("/");
			
			sap.ui.getCore().byId("InspectionDetail").setTitle("Lot Number : " + aRows.results[r].Insplot);
			sap.ui.getCore().byId("ins_InspType").setText(aRows.results[r].InspType);
			sap.ui.getCore().byId("ins_CodeValuation").setText(aRows.results[r].CodeValuation === "" ? "Not defined" : aRows.results[r].CodeValuation);
			sap.ui.getCore().byId("ins_CreatedByUser").setText(aRows.results[r].CreatedByUser);
			sap.ui.getCore().byId("ins_Material").setText(aRows.results[r].Material);
			sap.ui.getCore().byId("ins_Losmenge").setText(aRows.results[r].Losmenge);
			sap.ui.getCore().byId("ins_QualityScore").setText(aRows.results[r].QualityScore);
			sap.ui.getCore().byId("ins_CreatDat").setText(aRows.results[r].CreatDat.toLocaleString());
			sap.ui.getCore().byId("ins_ShortText").setText(aRows.results[r].ShortText === "" ? "Not defined" : aRows.results[r].ShortText);
			sap.ui.getCore().byId("ins_TxtMat").setText(aRows.results[r].TxtMat);
			sap.ui.getCore().byId("ins_UdCodeGroup").setText(aRows.results[r].UdCodeGroup);
			sap.ui.getCore().byId("ins_UdRecordedByUser").setText(aRows.results[r].UdRecordedByUser === "" ? "Not defined" : aRows.results[r].UdRecordedByUser);
			sap.ui.getCore().byId("ins_UdRecordedOnDate").setText(aRows.results[r].UdRecordedOnDate === "" ? "Not defined" : aRows.results[r].UdRecordedOnDate.toLocaleString());
			sap.ui.getCore().byId("ins_UsageDecision").setText(aRows.results[r].UsageDecision);
			sap.ui.getCore().byId("ins_Vendor").setText(aRows.results[r].Vendor === "" ? "Not defined" : aRows.results[r].Vendor);
			

		},
		
		_getResultDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.ResultDetail", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onResultRecordSelect: function() {
			this._getResultDetailDialog().open();
			var oModelData_rr = this.getView().byId("resrecordTable").getModel("resrecordList");
			var rr = this.getView().byId("resrecordTable")._aSelectedPaths[0].split("/")[2];
			var aRowss = oModelData_rr.getProperty("/");
		
			sap.ui.getCore().byId("ResultRecordDetail").setTitle("Inspection Lot : " + aRowss.results[rr].Prueflos);
			sap.ui.getCore().byId("rr_Pruefer").setText(aRowss.results[rr].Pruefer);
			sap.ui.getCore().byId("rr_Pruefdatuv").setText(aRowss.results[rr].Pruefdatuv.toLocaleString());
			sap.ui.getCore().byId("rr_Merknr").setText(aRowss.results[rr].Merknr);
			sap.ui.getCore().byId("rr_Vorglfnr").setText(aRowss.results[rr].Vorglfnr);
			sap.ui.getCore().byId("rr_Satzstatus").setText(aRowss.results[rr].Satzstatus);
			sap.ui.getCore().byId("rr_Mbewertg").setText(aRowss.results[rr].Mbewertg === "" ? "Not defined" : aRowss.results[rr].Mbewertg);
			sap.ui.getCore().byId("rr_Iststpumf").setText(aRowss.results[rr].Iststpumf);
			sap.ui.getCore().byId("rr_Anzwertg").setText(aRowss.results[rr].Anzwertg);
			sap.ui.getCore().byId("rr_Katalgart1").setText(aRowss.results[rr].Katalgart1 === "" ? "Not defined" : aRowss.results[rr].Katalgart1);
			sap.ui.getCore().byId("rr_Anzfehleh").setText(aRowss.results[rr].Anzfehleh);
			sap.ui.getCore().byId("rr_Qergdath").setText(aRowss.results[rr].Qergdath === "" ? "Not defined" : aRowss.results[rr].Qergdath);
			sap.ui.getCore().byId("rr_Dbewertg").setText(aRowss.results[rr].Dbewertg === "" ? "Not defined" : aRowss.results[rr].Dbewertg);
			sap.ui.getCore().byId("rr_Ersteller").setText(aRowss.results[rr].Ersteller);
			sap.ui.getCore().byId("rr_Erstelldat").setText(aRowss.results[rr].Erstelldat.toLocaleString());
			
		},
		
		_getUDDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.UsageDecision", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		onUDSelect : function(){
			this._getUDDialog().open();
			var oModelData_ud = this.getView().byId("usageDecisionTable").getModel("usageDecisionList");
			var rr = this.getView().byId("usageDecisionTable")._aSelectedPaths[0].split("/")[2];
			var aRowss = oModelData_ud.getProperty("/");
		
			sap.ui.getCore().byId("UsageDecisionDetail").setTitle("Inspection Lot : " + aRowss.results[rr].Insplot);
			sap.ui.getCore().byId("ud_IndAutomaticUd").setText(aRowss.results[rr].IndAutomaticUd );
			sap.ui.getCore().byId("ud_FollowUpAction").setText(aRowss.results[rr].FollowUpAction === "" ? "Not defined" : aRowss.results[rr].FollowUpAction);
			sap.ui.getCore().byId("ud_CodeValuation").setText(aRowss.results[rr].CodeValuation === "" ? "Not defined" : aRowss.results[rr].CodeValuation);
			sap.ui.getCore().byId("ud_UdCode").setText(aRowss.results[rr].UdCode);
			sap.ui.getCore().byId("ud_UdCode").setText(aRowss.results[rr].UdCode === "" ? "Pending" : aRowss.results[rr].UdCode);
			sap.ui.getCore().byId("ud_QualityScore").setText(aRowss.results[rr].QualityScore);
			sap.ui.getCore().byId("ud_UdCatalogType").setText(aRowss.results[rr].UdCatalogType === "" ? "Not defined" : aRowss.results[rr].UdCatalogType);
			sap.ui.getCore().byId("ud_UdCodeGroup").setText(aRowss.results[rr].UdCodeGroup === "" ? "Not defined" : aRowss.results[rr].UdCodeGroup);
			sap.ui.getCore().byId("ud_UdPlant").setText(aRowss.results[rr].UdPlant === "" ? "Not defined" : aRowss.results[rr].UdPlant);
			sap.ui.getCore().byId("ud_UdSelectedSet").setText(aRowss.results[rr].UdSelectedSet === "" ? "Not defined" : aRowss.results[rr].UdSelectedSet);
			sap.ui.getCore().byId("ud_UdRecordedByUser").setText(aRowss.results[rr].UdRecordedByUser === "" ? "Not defined" : aRowss.results[rr].UdRecordedByUser);
			sap.ui.getCore().byId("ud_UdRecordedOnDate").setText(aRowss.results[rr].UdRecordedOnDate === "" ? "Not defined" : aRowss.results[rr].UdRecordedOnDate.toLocaleString());

		},

		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;
			
		},
		
		onLogout : function(){
			this.logoutAndNavigateTo("Quality",-1);
		},
		
		logoutAndNavigateTo: function(whichPage,step) {

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
							this._getDialog("PortalPortal.view.Fragments.BusyDialogquality").close();
						} else {
							this.getOwnerComponent().getRouter().navTo(whichPage,{}, true);
							this._getDialog("PortalPortal.view.Fragments.BusyDialogquality").close();
						}
						MessageToast.show("Logged out !");
					}
				}
			});

		}
		

	

	});

});
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

	

	var maxRisk = 0,
		medRisk = 0,
		lowRisk = 0,
		oneRisk = 0,
		reportableCount = 0,
		inspcount, riskcount;

	return Controller.extend("PortalPortal.controller.EhsmDashboard", {
		formatter:formatter,
		onInit: function() {
			window.console.log("EHSM Dashboard Initialized");
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var ehsmurl = "/sap/opu/odata/sap/ZARUNEHSMSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			
			this._initialProfilefetch(surl,profileData);
			this._initialInspectionFetch(ehsmurl,profileData);
			this._initialRiskAssmntFetch(ehsmurl,profileData);
			
			//HOME PAGE STATISTICS
			this.getView().byId("inspcount").setValue(inspcount);
			this.getView().byId("reportableCount").setValue(reportableCount);
			this.getView().byId("riskcount").setValue(riskcount);
			this.getView().byId("severityCount").setValue(maxRisk);

		},
		
		refresh : function(){
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var ehsmurl = "/sap/opu/odata/sap/ZARUNEHSMSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			
			maxRisk = 0;medRisk = 0;lowRisk = 0;oneRisk = 0;reportableCount = 0;
			
			this._initialProfilefetch(surl,profileData);
			this._initialInspectionFetch(ehsmurl,profileData);
			this._initialRiskAssmntFetch(ehsmurl,profileData);
			MessageToast.show("Reloaded Data Successfully");
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
		
		//INSPECTION LIST FETCH
		_initialInspectionFetch: function(surl,profileData){
			var jsonModel = new JSONModel();
			var oModel = new sap.ui.model.odata.ODataModel(surl, true);

			// /sap/opu/odata/sap/ZARUNEHSMSERVICE_SRV/incidentsSet?$filter=Plant eq '0001'
			var uri = "?$filter=Plant eq '" + profileData.uPlant + "'";
			
			oModel.read("/incidentsSet" + uri, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Incident list fetched");
					inspcount = oData.results.length;
					jsonModel.setData(oData);
					window.console.log(oData);

					//counting reportable
					var jsonNCount = oData;
					for (var i in jsonNCount.results) {
						if (jsonNCount.results[i].Iarephdflg  === true) reportableCount = reportableCount + 1;
						
					}

					
				}
			});
			this.getView().setModel(jsonModel, "inspectionList");
			
			
		},
		
		onFilterIncident: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Recn", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("inspectionListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		
		//Risk Assessment list
		_initialRiskAssmntFetch: function(surl,profileData){
			var jsonModell = new JSONModel();
			var ssModel = new JSONModel();
			var oModell = new sap.ui.model.odata.ODataModel(surl, true);
			

			// /sap/opu/odata/sap/ZARUNEHSMSERVICE_SRV/risksSet?$filter=Plant eq '0001'
			var urii = "?$filter=Plant eq '" + profileData.uPlant + "'";
			
			oModell.read("/risksSet" + urii, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Risk assessment list fetched");
					jsonModell.setData(oData);
					riskcount = oData.results.length;
					window.console.log(oData);

					//max siverity risk
					var jsonPCount = oData;
					for (var i in jsonPCount.results) {
						if (jsonPCount.results[i].Severe === "MAX") maxRisk = maxRisk + 1;
						if (jsonPCount.results[i].Severe === "LOW") lowRisk = lowRisk + 1;
						if (jsonPCount.results[i].Severe === "MED") medRisk = medRisk + 1;
						if (jsonPCount.results[i].Severe === "001") oneRisk = oneRisk + 1;
					}
					
					var aData = {
						Severity: [{
							"Risk": "MAX",
							"Count": maxRisk
						}, {
							"Risk": "MED",
							"Count": medRisk
						},{
							"Risk": "LOW",
							"Count": lowRisk
						},{
							"Risk": "001",
							"Count": oneRisk
						}
						]
					};
					
					ssModel.setData(aData);

				}
			});
			this.getView().setModel(jsonModell, "riskassesList");
			this.getView().setModel(ssModel, "riskSeverity");
		},
		
		onFilterRiskass: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Recn", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("riskassesListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},

		toHome: function() {
			this.logoutAndNavigateTo("Index",-2);
		},
		onBack: function(){
			this.logoutAndNavigateTo("Ehsm",-1);
		},


		toIncident: function() {
			var tab = this.byId("idIconTabBarEHSM");
			tab.setSelectedKey("incident");
		},

		toRisk: function() {
			var tab = this.byId("idIconTabBarEHSM");
			tab.setSelectedKey("riskassmnt");
		},
		
		_getRiskDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.Risk", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		
		_getIncidentDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.Incident", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},


		onIncidentSelect: function() {
			this._getIncidentDetailDialog().open();
			var oModelData = this.getView().byId("inspectionListTable").getModel("inspectionList");
			var r = this.getView().byId("inspectionListTable")._aSelectedPaths[0].split("/")[2];
			var aRows = oModelData.getProperty("/");
			
			var isReportable = sap.ui.getCore().byId("inc_Iarephdflg") ? "Yes" : "No";

			sap.ui.getCore().byId("inc_Acloc").setText(aRows.results[r].Acloc);
			sap.ui.getCore().byId("inc_Aclocdesc").setText(aRows.results[r].Aclocdesc);
			sap.ui.getCore().byId("inc_Eqdesc").setText(aRows.results[r].Eqdesc);
			sap.ui.getCore().byId("inc_Equnr").setText(aRows.results[r].Equnr);
			sap.ui.getCore().byId("inc_Evdat").setText(aRows.results[r].Evdat.toLocaleString());
			sap.ui.getCore().byId("inc_Evdesc").setText(aRows.results[r].Evdesc);
			
			sap.ui.getCore().byId("inc_Tplnr").setText(aRows.results[r].Tplnr);
			sap.ui.getCore().byId("inc_Valfr").setText(aRows.results[r].Valfr.toLocaleString());
			sap.ui.getCore().byId("inc_Valto").setText(aRows.results[r].Valto.toLocaleString());
			sap.ui.getCore().byId("inc_Iastatus").setText(aRows.results[r].Iastatus);
			sap.ui.getCore().byId("inc_Ialid").setText(aRows.results[r].Ialid);
			sap.ui.getCore().byId("inc_Iarephdflg").setText(isReportable);
			sap.ui.getCore().byId("inc_Crdat").setText(aRows.results[r].Crdat.toLocaleString());
			sap.ui.getCore().byId("inc_Crnam").setText(aRows.results[r].Crnam);
			sap.ui.getCore().byId("IncidentDetail").setTitle("Record Number : " + aRows.results[r].Recn);

		},
		
		
		onRiskSelect: function() {
			this._getRiskDetailDialog().open();
			var oModelData_wo = this.getView().byId("riskassesListTable").getModel("riskassesList");
			var rr = this.getView().byId("riskassesListTable")._aSelectedPaths[0].split("/")[2];
			var aRowss = oModelData_wo.getProperty("/");
			
			var isDataRecordInactive = 	sap.ui.getCore().byId("risk_Parkflg") ? "Yes" : "No";
			
			sap.ui.getCore().byId("RiskDetail").setTitle("Record No : " + aRowss.results[rr].Recn);
			sap.ui.getCore().byId("risk_Riskassetnum").setText(aRowss.results[rr].Riskassetnum);
			sap.ui.getCore().byId("risk_Recntwah").setText(aRowss.results[rr].Recntwah);
			sap.ui.getCore().byId("risk_Objnr").setText(aRowss.results[rr].Objnr);
			sap.ui.getCore().byId("risk_Assctrper").setText(aRowss.results[rr].Assctrper);
			sap.ui.getCore().byId("risk_Severe").setText(aRowss.results[rr].Severe);
			sap.ui.getCore().byId("risk_Actn").setText(aRowss.results[rr].Actn);
			sap.ui.getCore().byId("risk_Valfr").setText(aRowss.results[rr].Valfr.toLocaleString());
			sap.ui.getCore().byId("risk_Valto").setText(aRowss.results[rr].Valto.toLocaleString());
			sap.ui.getCore().byId("risk_Parkflg").setText(isDataRecordInactive);
			sap.ui.getCore().byId("risk_Crdat").setText(aRowss.results[rr].Crdat.toLocaleString());
			sap.ui.getCore().byId("risk_Crnam").setText(aRowss.results[rr].Crnam);
			sap.ui.getCore().byId("risk_Upddat").setText(aRowss.results[rr].Upddat.toLocaleString());
			sap.ui.getCore().byId("risk_Updnam").setText(aRowss.results[rr].Updnam);
			sap.ui.getCore().byId("risk_Srsid").setText(aRowss.results[rr].Srsid);
			sap.ui.getCore().byId("risk_Eptype").setText(aRowss.results[rr].Eptype);
			sap.ui.getCore().byId("risk_Epid").setText(aRowss.results[rr].Epid);
			sap.ui.getCore().byId("risk_Erstatus").setText(aRowss.results[rr].Erstatus);
			sap.ui.getCore().byId("risk_Erinitstatus").setText(aRowss.results[rr].Erinitstatus);
			sap.ui.getCore().byId("risk_Rem").setText(aRowss.results[rr].Rem);
			sap.ui.getCore().byId("risk_Ratingcat").setText(aRowss.results[rr].Ratingcat);
			sap.ui.getCore().byId("risk_Rainvresult").setText(aRowss.results[rr].Rainvresult);
			sap.ui.getCore().byId("risk_Problty").setText(aRowss.results[rr].Problty);
			sap.ui.getCore().byId("risk_Actenddat").setText(aRowss.results[rr].Actenddat.toLocaleString());
			
		},

		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;
			
		},
		
		onLogout : function(){
			this.logoutAndNavigateTo("Ehsm",-1);
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
							this._getDialog("PortalPortal.view.Fragments.BusyDialog").close();
						} else {
							this.getOwnerComponent().getRouter().navTo(whichPage,{}, true);
							this._getDialog("PortalPortal.view.Fragments.BusyDialog").close();
						}
						MessageToast.show("Logged out !");
					}
				}
			});

		}
		

	

	});

});
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"../model/formatter",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, History, JSONModel, MessageBox, MessageToast, formatter,Filter,FilterOperator) {
	"use strict";

	var ssOSNOcount = 0,
		ssNOCOcount = 0,
		ssNOPRcount = 0,
		npcount = 0,
		nwcount = 0,
		ncount, wcount;

	return Controller.extend("PortalPortal.controller.MaintenanceDashboard", {
		formatter: formatter,
		onInit: function() {
			window.console.log("Dashboard Initialized");
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();

			this._initialProfilefetch(surl, profileData);
			this._initialNotificationFetch(surl, profileData);
			this._initialWorkorderFetch(surl, profileData);

			//HOME PAGE STATISTICS
			this.getView().byId("nvalue").setValue(ncount);
			this.getView().byId("wvalue").setValue(wcount);
			this.getView().byId("npvalue").setValue(npcount);
			this.getView().byId("wpvalue").setValue(nwcount);

		},

		refresh: function() {
			var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
			var profileData = sap.ui.getCore().getModel("userprofile").getData();
			ssOSNOcount = 0;
			ssNOCOcount = 0;
			ssNOPRcount = 0;
			npcount = 0;
			nwcount = 0;
			this._initialProfilefetch(surl, profileData);
			this._initialNotificationFetch(surl, profileData);
			this._initialWorkorderFetch(surl, profileData);
			MessageToast.show("Reloaded Data Successfully");
		},

		_initialProfilefetch: function(surl, profileData) {
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

		//NOTIFICATION LIST
		_initialNotificationFetch: function(surl, profileData) {
			var jsonModel = new JSONModel();
			var ssModel = new JSONModel();
			var oModel = new sap.ui.model.odata.ODataModel(surl, true);

			// ?$filter=Planningplant eq '0001' and Plannergroup eq '010' and Date eq datetime'1999-01-01T00:00:00'
			var uri = "?$filter=Planningplant eq '" + profileData.uPlant + "' and Plannergroup eq '" + profileData.uPlantGrp +
				"' and Date eq datetime'1999-01-01T00:00:00'&$format=json";

			oModel.read("/notificationsSet" + uri, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Notification list fetched");
					ncount = oData.results.length;
					jsonModel.setData(oData);

					//counting notification priority, ss OSNO, ss NOCO ORAS
					var jsonNCount = oData;
					for (var i in jsonNCount.results) {
						if (jsonNCount.results[i].Priority === "1") npcount = npcount + 1;
						if (jsonNCount.results[i].SStatus === "OSNO") ssOSNOcount = ssOSNOcount + 1;
						if (jsonNCount.results[i].SStatus === "NOPR ORAS") ssNOPRcount = ssNOPRcount + 1;
						if (jsonNCount.results[i].SStatus === "NOCO ORAS") ssNOCOcount = ssNOCOcount + 1;
					}

					var aData = {
						Items: [{
							SystemStatus: "OSNO",
							Count: ssOSNOcount
						}, {
							SystemStatus: "NOCO ORAS",
							Count: ssNOCOcount
						}, {
							SystemStatus: "NOPR ORAS",
							Count: ssNOPRcount
						}]
					};

					ssModel.setData(aData);
				}
			});
			this.getView().setModel(jsonModel, "notificationList");
			this.getView().setModel(ssModel, "systemStatus");

		},

		onFilterNotification: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Notificat", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("notificationListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},

		//workorder list 
		_initialWorkorderFetch: function(surl, profileData) {
			var jsonModell = new JSONModel();
			var oModell = new sap.ui.model.odata.ODataModel(surl, true);

			// ?$filter=Planningplant eq '0001' and Plannergroup eq '010'
			var urii = "?$filter=Planningplant eq '" + profileData.uPlant + "' and Plannergroup eq '" + profileData.uPlantGrp + "'";

			oModell.read("/workorderSet" + urii, {
				context: null,
				urlParameters: null,
				async: false,
				success: function(oData, oResponse) {
					window.console.log("Wordorder list fetched");
					jsonModell.setData(oData);
					wcount = oData.results.length;

					//counting workorder priority
					var jsonPCount = oData;
					for (var i in jsonPCount.results) {
						if (jsonPCount.results[i].Priority === "1") nwcount = nwcount + 1;
					}

				}
			});
			this.getView().setModel(jsonModell, "workorderList");
		},
		
		onFilterWorkorder: function(oEvent) {
			
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				aFilter.push(new Filter("Orderid", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("workorderListTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},


		toHome: function() {
			this.logoutAndNavigateTo("Index", -2);
		},
		onBack: function() {
			this.logoutAndNavigateTo("Maintanence", -1);
		},

		toNotification: function() {
			var tab = this.byId("idIconTabBar");
			tab.setSelectedKey("notification");
		},

		toWorkorder: function() {
			var tab = this.byId("idIconTabBar");
			tab.setSelectedKey("workorder");
		},

		_getWorkorderDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.wodetail", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		_getNotificationDetailDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("PortalPortal.view.Fragments.detail", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onNotificationSelect: function() {
			this._getNotificationDetailDialog().open();
			var oModelData = this.getView().byId("notificationListTable").getModel("notificationList");
			var r = this.getView().byId("notificationListTable")._aSelectedPaths[0].split("/")[2];
			var aRows = oModelData.getProperty("/");

			sap.ui.getCore().byId("Descript").setText(aRows.results[r].Descript);
			sap.ui.getCore().byId("Equipment").setText(aRows.results[r].Equipment);
			sap.ui.getCore().byId("Equidescr").setText(aRows.results[r].Equidescr);
			sap.ui.getCore().byId("Funcloc").setText(aRows.results[r].Funcloc);
			sap.ui.getCore().byId("Funcldescr").setText(aRows.results[r].Funcldescr);
			sap.ui.getCore().byId("NotifType").setText(aRows.results[r].NotifType);
			sap.ui.getCore().byId("Notifdate").setText(aRows.results[r].Notifdate.toLocaleString());
			sap.ui.getCore().byId("Priority").setText(aRows.results[r].Priority);
			sap.ui.getCore().byId("Priotype").setText(aRows.results[r].Priotype);
			sap.ui.getCore().byId("SStatus").setText(aRows.results[r].SStatus);
			sap.ui.getCore().byId("NotificationDetail").setTitle("Notification : " + aRows.results[r].Notificat);

		},

		onWorkorderSelect: function() {
			this._getWorkorderDetailDialog().open();
			var oModelData_wo = this.getView().byId("workorderListTable").getModel("workorderList");
			var rr = this.getView().byId("workorderListTable")._aSelectedPaths[0].split("/")[2];
			var aRowss = oModelData_wo.getProperty("/");

			sap.ui.getCore().byId("wo_OrderType").setText(aRowss.results[rr].OrderType);
			sap.ui.getCore().byId("wo_Priority").setText(aRowss.results[rr].Priority);
			sap.ui.getCore().byId("wo_Priotype").setText(aRowss.results[rr].Priotype);
			sap.ui.getCore().byId("wo_PriotypeDesc").setText(aRowss.results[rr].PriotypeDesc);
			sap.ui.getCore().byId("wo_Activity").setText(aRowss.results[rr].Activity);
			sap.ui.getCore().byId("wo_ControlKey").setText(aRowss.results[rr].ControlKey);
			sap.ui.getCore().byId("wo_Equipment").setText(aRowss.results[rr].Equipment);
			sap.ui.getCore().byId("wo_Equidescr").setText(aRowss.results[rr].Equidescr);
			sap.ui.getCore().byId("wo_Funcloc").setText(aRowss.results[rr].Funcloc);
			sap.ui.getCore().byId("wo_Funcldescr").setText(aRowss.results[rr].Funcldescr);
			sap.ui.getCore().byId("wo_WorkCntr").setText(aRowss.results[rr].Priority);
			sap.ui.getCore().byId("wo_ConfNo").setText(aRowss.results[rr].ConfNo);
			sap.ui.getCore().byId("wo_SStatus").setText(aRowss.results[rr].SStatus);
			sap.ui.getCore().byId("WorkorderDetail").setTitle("Order ID : " + aRowss.results[rr].Orderid);
		},

		onCancelDialog: function() {
			this._oDialog.close();
			this._oDialog.destroy();
			delete this._oDialog;

		},

		onLogout: function() {
			this.logoutAndNavigateTo("Maintanence", -1);
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
							this._getDialog("PortalPortal.view.Fragments.BusyDialog").close();
						} else {
							this.getOwnerComponent().getRouter().navTo(whichPage, {}, true);
							this._getDialog("PortalPortal.view.Fragments.BusyDialog").close();
						}
						MessageToast.show("Logged out !");
					}
				}
			});

		}

	});

});
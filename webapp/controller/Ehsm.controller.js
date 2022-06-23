sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/routing/History"
], function(Controller, MessageBox, MessageToast,History) {
	"use strict";

	return Controller.extend("PortalPortal.controller.Ehsm", {

		onInit: function() {
			window.console.log("EHSM Loginpage initialized");
		},

		onBack: function() {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getOwnerComponent().getRouter().navTo("Login");
			}
		},

		_getDialog: function(fragment) {
			if (!this._oDialog) {
				// "PortalMaintanencePortalMaintanence.view.Fragments.detail"
				this._oDialog = sap.ui.xmlfragment(fragment, this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onLogin: function() {
			this._getDialog("PortalPortal.view.Fragments.BusyDialogehsm").open();
			var uid = this.getView().byId("uid").getValue();
			var pwd = this.getView().byId("pwd").getValue();

			//checking emptyfields
			if (uid !== "" || pwd !== "") {

				var surl = "/sap/opu/odata/sap/ZARUN_MAINTSERVICE_SRV/";
				var oModel = new sap.ui.model.odata.ODataModel(surl, true);
				var uri = "Userid='" + uid + "',Password='" + pwd + "'";

				var id, name, designation, plant, plantGrp, status, password;
				oModel.read("/userSet(" + uri + ")", {
					context: null,
					urlParameters: null,
					async: false,
					success: function(oData, oResponse) {
						status = oData["StatusCode"];
						id = oData["Userid"];
						name = oData["Name"];
						designation = oData["Designation"];
						plant = oData["Plant"];
						plantGrp = oData["PlanGroup"];
						password = oData["Password"];

					}
				});

				var user = {
					"uId": id,
					"uName": name,
					"uDesignation": designation,
					"uPlant": plant,
					"uPlantGrp": plantGrp,
					"uPwd": password

				};

				var sampleModel = new sap.ui.model.json.JSONModel(user);
				sap.ui.getCore().setModel(sampleModel, "userprofile");

				if (status === 'TRUE') {

					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					jQuery.sap.intervalCall(2000, this._getDialog("PortalPortal.view.Fragments.BusyDialogehsm").close(), this);
					MessageToast.show("Login Successful !");

					oRouter.navTo("EhsmDashboard");

				} else {
					jQuery.sap.intervalCall(2000, this._getDialog("PortalPortal.view.Fragments.BusyDialogehsm").close(), this);
					MessageToast.show("UID or Password incorrect");
				}

			} else {
				jQuery.sap.intervalCall(2000, this._getDialog("PortalPortal.view.Fragments.BusyDialogehsm").close(), this);
				MessageBox.information("Please fill all the fields");
			}
		},

		onClear: function() {
			this.getView().byId("uid").setValue("");
			this.getView().byId("pwd").setValue("");
		}

	});

});
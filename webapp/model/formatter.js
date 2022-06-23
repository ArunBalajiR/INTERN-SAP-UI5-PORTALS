sap.ui.define([], function () {
	"use strict";
	return {
		usageDecision: function (sStatus) {
			switch (sStatus) {
				case "APPROVED":
					return "Success";
				case "A":
					return "Success";
				case "REJECTED":
					return "Error";
				case "R":
					return "Error";
				case "LOW":
					return "Success";
				case "MAX":
				case "HIG":
					return "Error";
				default:
					return "Warning";
			}
		},
		
		usageDText: function (sStatus) {
			switch (sStatus) {
				case "A":
					return "Approved";
				case "R":
					return "Rejected";
				default:
					return "Pending";
			}
		},
		
		usageDecisionIcon: function(sStatus){
			switch (sStatus) {
				case "APPROVED":
				case "A":
					return "sap-icon://sys-enter";
				case "REJECTED":
				case "R":
					return "sap-icon://sys-cancel";
				default:
					return "sap-icon://sys-help";
			}
		},
		
		removeEmpty: function(sStatus){
			switch (sStatus) {
				case "":
					return "Not Defined";
				default:
					return sStatus;
			}
		}
	};
});
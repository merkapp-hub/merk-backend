const response = require("../responses");
const Setting = require("@models/Setting");
const Charge = require("@models/Charges");
const Tax = require("@models/Tax");
const Servicefee = require("@models/Servicefee");

module.exports = {
  createSetting: async (req, res) => {
    try {
      const notify = new Setting(req.body);
      const noti = await notify.save();
      return res.status(201).json({
        success: true,
        message: "Data Saved successfully!",
        data: noti,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getSetting: async (req, res) => {
    try {
      const notifications = await Setting.find({});

      res.status(200).json({
        success: true,
        message: "Fetched all carosal successfully",
        setting: notifications,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  updateSetting: async (req, res) => {
    try {
      const payload = req?.body || {};
      let category = await Setting.findByIdAndUpdate(payload?.id, payload, {
        new: true,
        upsert: true,
      });
      return res.status(200).json({
        success: true,
        message: "Updated successfully",
        setting: category,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  addDeliveryCharge: async (req, res) => {
    try {
      const { deliveryCharge } = req.body;

      if (deliveryCharge == null || isNaN(deliveryCharge)) {
        return res.status(400).json({
          success: false,
          message: "Valid deliveryCharge is required",
        });
      }

      // Always update the single document
      const updated = await Charge.findOneAndUpdate(
        {},
        { $set: { deliveryCharge } },
        { upsert: true, new: true } // create if not exists
      );

      return response.success(res, {
        message: "Delivery charge updated successfully",
        deliveryCharge: updated.deliveryCharge,
      });
    } catch (error) {
      console.error("Error in addDeliveryCharge:", error);
      return response.error(res, {
        message: "Server error while adding delivery charge",
      });
    }
  },

  addDeliveryPartnerTips: async (req, res) => {
    try {
      let { tips } = req.body; // Expecting an array: [10, 20, 30]

      if (!Array.isArray(tips) || tips.some((t) => isNaN(t))) {
        return res.status(400).json({
          success: false,
          message: "An array of valid numeric tips is required",
        });
      }

      const updated = await Charge.findOneAndUpdate(
        {},
        { $addToSet: { deliveryPartnerTip: { $each: tips } } }, // avoid duplicates
        { upsert: true, new: true }
      );

      return response.success(res, {
        message: "Delivery partner tips added successfully",
        deliveryPartnerTip: updated.deliveryPartnerTip,
      });
    } catch (error) {
      console.error("Error adding partner tips:", error);
      return response.error(res, {
        message: "Server error while adding delivery partner tips",
      });
    }
  },

  deleteDeliveryPartnerTips: async (req, res) => {
    try {
      let { tips } = req.body; // Expecting an array: [10, 20]

      if (!Array.isArray(tips) || tips.some((t) => isNaN(t))) {
        return res.status(400).json({
          success: false,
          message: "An array of valid numeric tips is required for deletion",
        });
      }

      const updated = await Charge.findOneAndUpdate(
        {},
        { $pull: { deliveryPartnerTip: { $in: tips } } },
        { new: true }
      );

      return response.success(res, {
        message: "Delivery partner tips deleted successfully",
        deliveryPartnerTip: updated.deliveryPartnerTip,
      });
    } catch (error) {
      console.error("Error deleting partner tips:", error);
      return response.error(res, {
        message: "Server error while deleting delivery partner tips",
      });
    }
  },

  getDeliveryCharge: async (req, res) => {
    try {
      const charge = await Charge.findOne({});
      if (!charge) {
        return res.status(404).json({
          success: false,
          message: "No delivery charge found",
        });
      }
      return response.success(res, {
        message: "Fetched delivery charge successfully",
        deliveryCharge: charge.deliveryCharge,
      });
    } catch (error) {
      console.error("Error fetching delivery charge:", error);
      return response.error(res, {
        message: "Server error while fetching delivery charge",
      });
    }
  },
  getDeliveryPartnerTips: async (req, res) => {
    try {
      const charge = await Charge.findOne({});
      if (!charge) {
        return res.status(404).json({
          success: false,
          message: "No delivery partner tips found",
        });
      }
      return response.success(res, {
        message: "Fetched delivery partner tips successfully",
        deliveryPartnerTip: charge.deliveryPartnerTip,
      });
    } catch (error) {
      console.error("Error fetching delivery partner tips:", error);
      return response.error(res, {
        message: "Server error while fetching delivery partner tips",
      });
    }
  },

  // Tax APIs
  getTax: async (req, res) => {
    try {
      let tax = await Tax.findOne({});
      
      // If no tax exists, create default one
      if (!tax) {
        tax = await Tax.create({ taxRate: 15 });
      }
      
      return res.status(200).json({
        success: true,
        message: "Tax rate fetched successfully",
        data: tax,
        taxRate: tax.taxRate,
      });
    } catch (error) {
      console.error("Error fetching tax:", error);
      return response.error(res, {
        message: "Server error while fetching tax rate",
      });
    }
  },

  updateTax: async (req, res) => {
    try {
      const { taxRate } = req.body;

      if (taxRate == null || isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        return res.status(400).json({
          success: false,
          message: "Valid tax rate (0-100) is required",
        });
      }

      const updated = await Tax.findOneAndUpdate(
        {},
        { $set: { taxRate } },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Tax rate updated successfully",
        data: updated,
        taxRate: updated.taxRate,
      });
    } catch (error) {
      console.error("Error updating tax:", error);
      return response.error(res, {
        message: "Server error while updating tax rate",
      });
    }
  },

  // Service Fee APIs
  getServiceFee: async (req, res) => {
    try {
      let fee = await Servicefee.findOne({});
      
      // If no fee exists, create default one
      if (!fee) {
        fee = await Servicefee.create({ Servicefee: 0 });
      }
      
      return res.status(200).json({
        success: true,
        message: "Service fee fetched successfully",
        data: fee,
        serviceFee: fee.Servicefee,
      });
    } catch (error) {
      console.error("Error fetching service fee:", error);
      return response.error(res, {
        message: "Server error while fetching service fee",
      });
    }
  },

  updateServiceFee: async (req, res) => {
    try {
      const { serviceFee } = req.body;

      if (serviceFee == null || isNaN(serviceFee) || serviceFee < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid service fee (>= 0) is required",
        });
      }

      const updated = await Servicefee.findOneAndUpdate(
        {},
        { $set: { Servicefee: serviceFee } },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Service fee updated successfully",
        data: updated,
        serviceFee: updated.Servicefee,
      });
    } catch (error) {
      console.error("Error updating service fee:", error);
      return response.error(res, {
        message: "Server error while updating service fee",
      });
    }
  },
};

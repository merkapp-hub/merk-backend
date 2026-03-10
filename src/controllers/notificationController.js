const mongoose = require("mongoose");
const response = require("../responses");
const mailNotification = require("../services/mailNotification");
const Notification = require("@models/Notification");

module.exports = {
  getnotification: async (req, res) => {
    try {
      const ids = req.user.id;
      const data = await Notification.find({ for: { $in: ids } }).sort({
        createdAt: -1,
      });
      console.log("data fetched");
      return response.success(res, data);
      // res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return response.error(res, err);
      // res.status(500).json({error:'Internal Server Error'});
    }
  },
  //   sendNotification: async (req, res) => {
  //     try {
  //       const { title, description, userIds = [] } = req.body;

  //       const batchSize = 20;

  //       for (let i = 0; i < userIds.length; i += batchSize) {
  //         const batch = userIds.slice(i, i + batchSize);

  //         await mailNotification.sendNotification(batch, title, description);
  //       }

  //       //   const notification = new Notification({
  //       //     title,
  //       //     message,
  //       //     for: userIds,
  //       //   });

  //       //   await notification.save();
  //       return response.success(res, "Notification sent successfully");
  //     } catch (err) {
  //       console.log(err);
  //       return response.error(res, err);
  //       // res.status(500).json({error:'Internal Server Error'});
  //     }
  //   },
  sendNotification: async (req, res) => {
    try {
      const { title, description, userIds } = req.body;

      response.success(res, "Emails are being sent");

      process.nextTick(async () => {
        try {
          await mailNotification.sendNotification(userIds, title, description);
          console.log("All emails sent.");
        } catch (emailErr) {
          console.error("Error sending emails:", emailErr);
        }
      });
    } catch (err) {
      console.log(err);
      return response.error(res, err);
    }
  },

  getSellerNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ 
        for: { $in: [userId] } 
      })
        .populate("orderId", "orderId status total")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const unreadCount = await Notification.countDocuments({
        for: { $in: [userId] },
        readBy: { $nin: [userId] }
      });

      return res.status(200).json({
        status: true,
        data: notifications,
        unreadCount
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Failed to fetch notifications"
      });
    }
  },

  markNotificationRead: async (req, res) => {
    try {
      const { notificationId } = req.body;
      const userId = req.user.id;

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({
          status: false,
          message: "Notification not found"
        });
      }

      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
        await notification.save();
      }

      return res.status(200).json({
        status: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      console.error("Mark notification read error:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Failed to mark notification as read"
      });
    }
  },
};

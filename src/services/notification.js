const OneSignal = require("@onesignal/node-onesignal");
const mongoose = require("mongoose");
const Device = require("@models/Device");
const Notification = mongoose.model("Notification");
const User = mongoose.model("User");
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

const ONESIGNAL_REST_API_KEY = {
  getToken() {
    return process.env.ONESIGNAL_REST_API_KEY;
  }
};
const configuration = OneSignal.createConfiguration({

  restApiKey: process.env.ONESIGNAL_REST_API_KEY,
  authMethods: {
    rest_api_key: { tokenProvider: ONESIGNAL_REST_API_KEY }
  }
});
const client = new OneSignal.DefaultApi(configuration);

async function sendNotification(content, player_ids, title) {
  try {
    // Skip if no player IDs
    if (!player_ids || player_ids.length === 0) {
      console.log("⚠️ No player IDs found, skipping notification");
      return null;
    }

    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.include_subscription_ids = player_ids;
    notification.contents = {
      en: content,
    };
    if (title) {
      notification.headings = {
        en: title,
      };
    }
    notification.name = "Merk";
    
    const response = await client.createNotification(notification);
    console.log("✅ Notification sent successfully");
    return response;
  } catch (err) {
    console.log("⚠️ Notification failed (non-critical):", content);
    console.error("OneSignal error:", err.message || err);
    // Don't throw - notification failure shouldn't break order flow
    return null;
  }
}
async function findDevices(user) {
  const devices = await Device.find({ user });
  return devices.map((d) => d.player_id);
}

module.exports = {
  notify: async (user, title, content) => {
    const player_ids = await findDevices(user);
    // console.log('player_ids====>', player_ids)
    const notObj = { for: user, description: content, title: title };
    console.log('notobj', notObj)
    await Notification.create(notObj);
    return sendNotification(content, player_ids, title);
  },
  notifyAllUser: async (users, content, job = null, title) => {

    // if (!title) {
    //   const offer = await OFFER.findById(job);
    //   title = offer.offername;
    // }
    const devices = await User.find();
    console.log("devices===========>", devices);
    const player_ids = devices.map((d) => d._id);

    const notObj = { for: player_ids, description: content, title: title };
    if (job) notObj.invited_for = job;
    await Notification.create(notObj);

    return;
    // sendNotification(content, player_ids, title);
  },
};

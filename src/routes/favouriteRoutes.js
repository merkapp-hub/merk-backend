const express = require('express');
const favourite = require('@controllers/favouriteController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post("/addremovefavourite", authMiddleware(["user", "admin", "seller"]), favourite.AddFavourite);
router.get("/getFavourite", authMiddleware(["user", "admin", "seller"]), favourite.getFavourite);

module.exports = router;
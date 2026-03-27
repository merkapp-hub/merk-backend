const express = require('express');
const {
  getCards,
  addCard,
  updateCard,
  deleteCard,
  setDefaultCard,
  updateCardByToken
} = require('@controllers/cardController');

const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();

router.get('/user/cards', authMiddleware(["user", "admin", "seller"]), getCards);
router.post('/user/cards/add', authMiddleware(["user", "admin", "seller"]), addCard);
router.post('/user/cards/update', authMiddleware(["user", "admin", "seller"]), updateCard);
router.post('/user/cards/delete', authMiddleware(["user", "admin", "seller"]), deleteCard);
router.post('/user/cards/set-default', authMiddleware(["user", "admin", "seller"]), setDefaultCard);
router.post('/cards/updateCardByToken', authMiddleware(["user", "admin", "seller"]), updateCardByToken);

module.exports = router;
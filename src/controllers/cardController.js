const Card = require('../models/Card');
const response = require('@responses/index');

const cardController = {
  getCards: async (req, res) => {
    try {
      const userId = req.user._id;

      const cards = await Card.find({ userId })
        .sort({ isDefault: -1, createdAt: -1 });

      const safeCards = cards.map(card => card.toSafeObject());

      return response.success(res, safeCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      return response.error(res, error);
    }
  },

  addCard: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        cardType,
        isDefault
      } = req.body;

      if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
        return response.badReq(res, { message: 'Required fields are missing' });
      }

      const cleanCardNumber = cardNumber.toString().replace(/\s+/g, '');

      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        return response.badReq(res, { message: 'Invalid card number' });
      }

      if (!isValidCardNumber(cleanCardNumber)) {
        return response.badReq(res, { message: 'Invalid card number' });
      }

      const existingCard = await Card.findOne({
        userId,
        lastFour: cleanCardNumber.slice(-4),
        expiryMonth,
        expiryYear
      });

      if (existingCard) {
        return response.conflict(res, { message: 'Card already exists' });
      }

      const cardData = {
        userId,
        cardNumber: cleanCardNumber,
        lastFour: cleanCardNumber.slice(-4),
        maskedCardNumber: `**** **** **** ${cleanCardNumber.slice(-4)}`,
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear,
        cvv,
        cardholderName: cardholderName.trim(),
        cardType: cardType || getCardType(cleanCardNumber),
        isDefault: isDefault || false
      };

      console.log(cardData)

      if (isDefault) {
        await Card.updateMany(
          { userId },
          { isDefault: false }
        );
      }

      const newCard = new Card(cardData);
      await newCard.save();

      return response.success(res, newCard.toSafeObject());
    } catch (error) {
      console.error('Error adding card:', error);
      return response.error(res, error);
    }
  },

  updateCard: async (req, res) => {
    try {
      const userId = req.user._id;
      const { cardId, cardholderName, isDefault } = req.body;

      if (!cardId) {
        return response.badReq(res, { message: 'Card ID is required' });
      }

      const card = await Card.findOne({ _id: cardId, userId });
      if (!card) {
        return response.notFound(res, { message: 'Card not found' });
      }

      if (isDefault) {
        await Card.updateMany(
          { userId, _id: { $ne: cardId } },
          { isDefault: false }
        );
      }

      const updateData = {};
      if (cardholderName) updateData.cardholderName = cardholderName.trim();
      if (typeof isDefault === 'boolean') updateData.isDefault = isDefault;

      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        updateData,
        { new: true, runValidators: true }
      );

      return response.success(res, updatedCard.toSafeObject());
    } catch (error) {
      console.error('Error updating card:', error);
      return response.error(res, error);
    }
  },

  deleteCard: async (req, res) => {
    try {
      const userId = req.user._id;
      const { cardId } = req.body;

      if (!cardId) {
        return response.badReq(res, { message: 'Card ID is required' });
      }

      const card = await Card.findOne({ _id: cardId, userId });
      if (!card) {
        return response.notFound(res, { message: 'Card not found' });
      }

      await Card.findByIdAndDelete(cardId);

      if (card.isDefault) {
        const firstCard = await Card.findOne({ userId }).sort({ createdAt: 1 });
        if (firstCard) {
          firstCard.isDefault = true;
          await firstCard.save();
        }
      }

      return response.success(res, { message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Error deleting card:', error);
      return response.error(res, error);
    }
  },

  setDefaultCard: async (req, res) => {
    try {
      const userId = req.user._id;
      const { cardId } = req.body;

      if (!cardId) {
        return response.badReq(res, { message: 'Card ID is required' });
      }

      const card = await Card.findOne({ _id: cardId, userId });
      if (!card) {
        return response.notFound(res, { message: 'Card not found' });
      }

      await Card.updateMany(
        { userId },
        { isDefault: false }
      );

      card.isDefault = true;
      await card.save();

      return response.success(res, card.toSafeObject());
    } catch (error) {
      console.error('Error setting default card:', error);
      return response.error(res, error);
    }
  }
};

function isValidCardNumber(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
}

function getCardType(cardNumber) {
  const patterns = {
    'Visa': /^4/,
    'Mastercard': /^5[1-5]/,
    'American Express': /^3[47]/,
    'Discover': /^6/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type;
    }
  }

  return 'Card';
}

module.exports = cardController;
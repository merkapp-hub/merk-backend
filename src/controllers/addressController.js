const Address = require('../models/Address');
const response = require('@responses/index');

const addressController = {
  getAddresses: async (req, res) => {
    try {
      const userId = req.user._id;
      
      const addresses = await Address.find({ userId })
        .sort({ isDefault: -1, createdAt: -1 });
      
      return response.success(res, addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return response.error(res, error);
    }
  },

  addAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const {
        title,
        fullName,
        phone,
        address,
        apartment,
        city,
        state,
        country,
        pinCode,
        isDefault
      } = req.body;

      if (!title || !fullName || !phone || !address || !city || !state) {
        return response.badReq(res, { message: 'Required fields are missing' });
      }

      const addressData = {
        userId,
        title: title.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        apartment: apartment?.trim() || '',
        city: city.trim(),
        state: state.trim(),
        country: country?.trim() || 'Honduras',
        pinCode: pinCode?.trim() || '',
        isDefault: isDefault || false
      };

      if (isDefault) {
        await Address.updateMany(
          { userId },
          { isDefault: false }
        );
      }

      const newAddress = new Address(addressData);
      await newAddress.save();

      return response.success(res, newAddress);
    } catch (error) {
      console.error('Error adding address:', error);
      return response.error(res, error);
    }
  },

  updateAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const { addressId, ...updateData } = req.body;

      if (!addressId) {
        return response.badReq(res, { message: 'Address ID is required' });
      }

      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return response.notFound(res, { message: 'Address not found' });
      }

      if (updateData.isDefault) {
        await Address.updateMany(
          { userId, _id: { $ne: addressId } },
          { isDefault: false }
        );
      }

      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        { ...updateData },
        { new: true, runValidators: true }
      );

      return response.success(res, updatedAddress);
    } catch (error) {
      console.error('Error updating address:', error);
      return response.error(res, error);
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.body;

      if (!addressId) {
        return response.badReq(res, { message: 'Address ID is required' });
      }

      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return response.notFound(res, { message: 'Address not found' });
      }

      await Address.findByIdAndDelete(addressId);

      if (address.isDefault) {
        const firstAddress = await Address.findOne({ userId }).sort({ createdAt: 1 });
        if (firstAddress) {
          firstAddress.isDefault = true;
          await firstAddress.save();
        }
      }

      return response.success(res, { message: 'Address deleted successfully' });
    } catch (error) {
      console.error('Error deleting address:', error);
      return response.error(res, error);
    }
  },

  setDefaultAddress: async (req, res) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.body;

      if (!addressId) {
        return response.badReq(res, { message: 'Address ID is required' });
      }

      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        return response.notFound(res, { message: 'Address not found' });
      }

      await Address.updateMany(
        { userId },
        { isDefault: false }
      );

      address.isDefault = true;
      await address.save();

      return response.success(res, address);
    } catch (error) {
      console.error('Error setting default address:', error);
      return response.error(res, error);
    }
  }
};

module.exports = addressController;
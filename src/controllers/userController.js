const User = require('@models/User');
const ProductRequest = require('@models/ProductRequest');
const response = require('@responses/index');

const testUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}).select('firstName lastName email role isDeleted');
    console.log('All users in database:', allUsers);
    
    const userRoleUsers = await User.find({ role: 'user' }).select('firstName lastName email role isDeleted');
    console.log('Users with role "user":', userRoleUsers);
    
    return response.success(res, {
      allUsers,
      userRoleUsers,
      totalCount: allUsers.length,
      userRoleCount: userRoleUsers.length
    });
  } catch (error) {
    console.error('Error in test:', error);
    return response.error(res, error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', startDate = '', endDate = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { 
      role: { $in: ['user', 'seller'] },  // Include both users and sellers
      isDeleted: false 
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filtering with proper timezone handling
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        // Parse date string and set to start of day in UTC
        const start = new Date(startDate + 'T00:00:00.000Z');
        query.createdAt.$gte = start;
      }
      if (endDate) {
        // Parse date string and set to end of day in UTC
        const end = new Date(endDate + 'T23:59:59.999Z');
        query.createdAt.$lte = end;
      }
    }

    console.log('User query:', query);
    console.log('Date filter - Start:', query.createdAt?.$gte, 'End:', query.createdAt?.$lte);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    console.log('Found users:', users.length);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum);

    const result = {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };

    console.log('Sending result:', result);
    return response.success(res, result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return response.error(res, error.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('getUserById called with userId:', userId);
    
    if (!userId || userId === 'undefined') {
      console.log('Invalid userId provided:', userId);
      return response.error(res, 'Invalid user ID provided');
    }
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return response.error(res, 'User not found');
    }

    const userOrders = await ProductRequest.find({ 
      user: userId,
      isDeleted: { $ne: true }
    }).populate('productDetail.product').sort({ createdAt: -1 });

    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.finalAmount || order.total || 0), 0);

    const userData = {
      ...user.toObject(),
      orderStats: {
        totalOrders,
        totalSpent,
        orders: userOrders
      }
    };

    return response.success(res, userData);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return response.error(res, error.message);
  }
};

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ 
      role: { $in: ['user', 'seller'] },  // Include both users and sellers
      isDeleted: false 
    });

    console.log('Total users count:', totalUsers);

    const recentUsers = await User.find({ 
      role: { $in: ['user', 'seller'] },  // Include both users and sellers
      isDeleted: false 
    }).select('-password').sort({ createdAt: -1 }).limit(5);

    const stats = {
      totalUsers,
      recentUsers
    };

    console.log('User stats:', stats);
    return response.success(res, stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return response.error(res, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('deleteUser called with userId:', userId);
    
    if (!userId || userId === 'undefined') {
      console.log('Invalid userId provided:', userId);
      return response.error(res, 'Invalid user ID provided');
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return response.error(res, 'User not found');
    }

    // Soft delete - set isDeleted flag to true
    user.isDeleted = true;
    await user.save();

    console.log('User soft deleted successfully:', userId);
    return response.success(res, { message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return response.error(res, error.message);
  }
};

module.exports = {
  testUsers,
  getAllUsers,
  getUserById,
  getUserStats,
  deleteUser
};
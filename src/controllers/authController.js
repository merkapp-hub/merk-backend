const User = require('@models/User');
const bcrypt = require('bcryptjs');
const response = require('@responses/index');
const userHelper = require('../helper/user');
const Verification = require('@models/Verification');
const jwt = require("jsonwebtoken");

module.exports = {
   register: async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

     
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ 
          message: 'First name, last name, email, and password are required' 
        });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 6 characters long' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = new User({
        firstName,
        lastName,
        email,
        role,
      });
      
      newUser.password = newUser.encryptPassword(password);
      await newUser.save();

      const userResponse = await User.findById(newUser._id).select('-password');

      response.created(res, {
        message: 'User registered successfully',
        user: userResponse,
      });
    } catch (error) {
      console.error(error);
      response.error(res, error);
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });

      console.log(user)
      if (!user)
        return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await user.isValidPassword(password);
      if (!isMatch)
        return res.status(401).json({ message: 'Invalid email or password' });

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'secret123',
        {
          expiresIn: '7d',
        },
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          token
        },
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  sendOTP: async (req, res) => {
    try {
      const email = req.body.email;

      const user = await User.findOne({ email });

      console.log('ssssss', user);
      if (!user) {
        return response.badReq(res, { message: 'Email does exist.' });
      }
      // OTP is fixed for Now: 0000
      let ran_otp = '0000';
      // let ran_otp = Math.floor(1000 + Math.random() * 9000);
      // await mailNotification.sendOTPmail({
      //   code: ran_otp,
      //   email: email
      // });
      let ver = new Verification({
        //email: email,
        user: user._id,
        otp: ran_otp,
        expiration_at: userHelper.getDatewithAddedMinutes(5),
      });
      await ver.save();
      let token = await userHelper.encode(ver._id);

      return response.success(res, { message: 'OTP sent.', token });
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: 'OTP and token required.' });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ':' + userHelper.getDatewithAddedMinutes(5).getTime(),
        );
        ver.verified = true;
        await ver.save();
        return response.success(res, { message: 'OTP verified', token });
      } else {
        return response.notFound(res, { message: 'Invalid OTP' });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(':');
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: 'Session expired.' });
      }
      let otp = await Verification.findById(verID);
      if (!otp?.verified) {
        return response?.forbidden(res, { message: 'unAuthorize' });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: 'unAuthorize' });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.success(res, {
        message: 'Password changed ! Login now.',
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  fileUpload: async (req, res) => {
    try {
      return response.success(res, {
        message: "File uploaded.",
        file: req.file.path,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProfile: async (req, res) => {
    try {
      const u = await User.findById(req.user.id, "-password");
      return response.success(res, u);
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateProfile : async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    const updatedUser = await user.save();

    const userWithoutPassword = updatedUser.toObject();
    delete userWithoutPassword.password;

    return response.success(res, userWithoutPassword);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return response.error(res, error);
  }
},
updatePassword : async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    return response.error(res, error);
  }
}
}

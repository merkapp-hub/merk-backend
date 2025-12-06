
const Contact = require('../models/contact')
const response = require('../responses')

exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    await newContact.save();

    res.status(201).json({
      message: "Contact form submitted successfully",
      data: newContact,
    });
  } catch (error) {
    console.error("Error in createContact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



exports.getAllContacts = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build search query
    const query = {};

    // Search by name (case-insensitive)
    if (req.query.name) {
      query.name = { $regex: req.query.name, $options: 'i' };
    }

    // Search by email (case-insensitive)
    if (req.query.Email) {
      query.Email = { $regex: req.query.Email, $options: 'i' };
    }

    // Filter by date
    if (req.query.curDate) {
      const searchDate = new Date(req.query.curDate);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      
      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    console.log('Contact Query:', query);
    console.log('Pagination:', { page, limit, skip });

    // Get total count for pagination
    const totalContacts = await Contact.countDocuments(query);
    const totalPages = Math.ceil(totalContacts / limit);

    // Fetch contacts with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Found contacts:', contacts.length);

    return res.status(200).json({
      status: true,
      data: contacts,
      pagination: {
        totalItems: totalContacts,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).json({ 
      status: false,
      message: "Internal Server Error",
      error: error.message 
    });
  }
};


exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
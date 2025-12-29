const Inquiry = require('../models/Inquiry');

/**
 * Create a new inquiry
 * Accepts: name, email, contact, inquiry_type, message
 */
exports.createInquiry = (req, res) => {
  try {
    const { name, email, contact, inquiry_type, message } = req.body;

    // Validate required fields
    if (!name || (typeof name === 'string' && name.trim() === '')) {
      return res.status(400).json({
        error: 'name is required'
      });
    }

    if (!email || (typeof email === 'string' && email.trim() === '')) {
      return res.status(400).json({
        error: 'email is required'
      });
    }

    if (!inquiry_type || (typeof inquiry_type === 'string' && inquiry_type.trim() === '')) {
      return res.status(400).json({
        error: 'inquiry_type is required'
      });
    }

    if (!message || (typeof message === 'string' && message.trim() === '')) {
      return res.status(400).json({
        error: 'message is required'
      });
    }

    // Validate email format (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Prepare inquiry data
    const inquiryData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contact: contact ? contact.trim() : null,
      inquiry_type: inquiry_type.trim(),
      message: message.trim(),
      status: 'new'
    };

    // Save inquiry
    Inquiry.create(inquiryData, (err, inquiry) => {
      if (err) {
        console.error('Error creating inquiry:', err);
        return res.status(500).json({
          error: 'Failed to create inquiry',
          details: err.message
        });
      }

      // Return success response
      res.status(201).json({
        success: true,
        inquiry_id: inquiry.id,
        message: 'Inquiry created successfully'
      });
    });
  } catch (error) {
    console.error('Unexpected error in createInquiry:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};


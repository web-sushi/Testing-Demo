const Booking = require('../models/Booking');
const BookingDetail = require('../models/BookingDetail');

// Maximum capacity per date (easy to change)
const MAX_CAPACITY_PER_DATE = 2;

/**
 * Validate required booking fields
 */
function validateBookingData(data) {
  const requiredFields = ['name', 'email', 'contact', 'people', 'booking_type', 'selected_date'];
  const missingFields = [];

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  // Validate booking_type
  const validBookingTypes = ['regional', 'specialized', 'customized'];
  if (!validBookingTypes.includes(data.booking_type)) {
    return {
      isValid: false,
      error: `Invalid booking_type. Must be one of: ${validBookingTypes.join(', ')}`
    };
  }

  // Validate people is a positive integer
  const people = parseInt(data.people, 10);
  if (isNaN(people) || people < 1) {
    return {
      isValid: false,
      error: 'people must be a positive integer'
    };
  }

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  return { isValid: true };
}

exports.getAllBookings = (req, res) => {
  Booking.findAll((err, bookings) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({
        error: 'Failed to fetch bookings',
        details: err.message
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  });
};

exports.getBookingById = (req, res) => {
  const bookingId = parseInt(req.params.id, 10);

  // Validate booking ID
  if (isNaN(bookingId) || bookingId < 1) {
    return res.status(400).json({
      error: 'Invalid booking ID'
    });
  }

  // Fetch booking by id
  Booking.findById(bookingId, (err, booking) => {
    if (err) {
      console.error('Error fetching booking:', err);
      return res.status(500).json({
        error: 'Failed to fetch booking',
        details: err.message
      });
    }

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    // Fetch booking details by booking_id
    BookingDetail.findByBookingId(bookingId, (detailErr, bookingDetail) => {
      if (detailErr) {
        console.error('Error fetching booking details:', detailErr);
        // Return booking even if details fetch fails
        return res.status(200).json({
          success: true,
          booking: booking,
          details: null,
          warning: 'Booking found but details could not be retrieved'
        });
      }

      // Combine booking and details
      const response = {
        success: true,
        booking: booking,
        details: bookingDetail ? bookingDetail.details_json : null
      };

      res.status(200).json(response);
    });
  });
};

exports.createBooking = (req, res) => {
  try {
    // Validate required fields
    const validation = validateBookingData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error
      });
    }

    // Extract core booking fields for the bookings table
    const bookingData = {
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      contact: req.body.contact ? req.body.contact.trim() : null,
      people: parseInt(req.body.people, 10),
      booking_type: req.body.booking_type,
      selected_date: req.body.selected_date,
      estimated_price: req.body.estimated_price ? parseFloat(req.body.estimated_price) : null,
      status: 'pending'
    };

    // Check availability before creating booking
    if (bookingData.selected_date) {
      // Convert selected_date to YYYY-MM-DD format for database storage and availability check
      let dateToCheck = bookingData.selected_date;
      
      // Try to parse if it's not in YYYY-MM-DD format (might be "Month Day" format)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToCheck)) {
        // If it's in "Month Day" format, convert to YYYY-MM-DD
        const dateMatch = dateToCheck.match(/(\w+)\s+(\d+)/);
        if (dateMatch) {
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          const monthName = dateMatch[1];
          const day = parseInt(dateMatch[2]);
          const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
          
          if (monthIndex !== -1) {
            const currentYear = new Date().getFullYear();
            const dateObj = new Date(currentYear, monthIndex, day);
            dateToCheck = dateObj.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
          } else {
            // Invalid date format
            return res.status(400).json({
              error: 'Invalid date format'
            });
          }
        } else {
          // Invalid date format
          return res.status(400).json({
            error: 'Invalid date format'
          });
        }
      }

      // Update bookingData with normalized date format
      bookingData.selected_date = dateToCheck;

      // Check availability for the date
      Booking.countByDate(dateToCheck, (availabilityErr, confirmedCount) => {
        if (availabilityErr) {
          console.error('Error checking availability:', availabilityErr);
          return res.status(500).json({
            error: 'Failed to check availability',
            details: availabilityErr.message
          });
        }

        const count = confirmedCount || 0;
        if (count >= MAX_CAPACITY_PER_DATE) {
          return res.status(400).json({
            error: `This date is fully booked. Maximum capacity (${MAX_CAPACITY_PER_DATE} bookings) has been reached.`
          });
        }

        // Capacity available, proceed with booking creation
        createBookingRecord(bookingData, req.body, res);
      });
    } else {
      // No date selected, proceed with booking creation
      createBookingRecord(bookingData, req.body, res);
    }
  } catch (error) {
    console.error('Unexpected error in createBooking:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

/**
 * Helper function to create booking record
 */
function createBookingRecord(bookingData, originalRequestBody, res) {
  // Create booking
  Booking.create(bookingData, (err, booking) => {
      if (err) {
        console.error('Error creating booking:', err);
        return res.status(500).json({
          error: 'Failed to create booking',
          details: err.message
        });
      }

      const bookingId = booking.id;

      // Create booking details with full form payload as JSON
      BookingDetail.create(bookingId, originalRequestBody, (detailErr, bookingDetail) => {
        if (detailErr) {
          console.error('Error creating booking details:', detailErr);
          // Note: Booking was created but details failed
          // In production, you might want to rollback or handle this differently
          return res.status(500).json({
            error: 'Booking created but failed to save details',
            booking_id: bookingId,
            details: detailErr.message
          });
        }

        // Success - return booking_id
        res.status(201).json({
          success: true,
          booking_id: bookingId
        });
      });
    });
}

exports.updateBooking = (req, res) => {
  res.status(200).json({ message: 'Update booking - to be implemented', id: req.params.id });
};

/**
 * Check availability for a specific date
 */
exports.checkAvailability = (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        error: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Count confirmed bookings for this date
    Booking.countByDate(date, (err, confirmedCount) => {
      if (err) {
        console.error('Error checking availability:', err);
        return res.status(500).json({
          error: 'Failed to check availability',
          details: err.message
        });
      }

      const count = confirmedCount || 0;
      const available = count < MAX_CAPACITY_PER_DATE;

      res.status(200).json({
        success: true,
        date: date,
        confirmed_count: count,
        capacity: MAX_CAPACITY_PER_DATE,
        available: available
      });
    });
  } catch (error) {
    console.error('Unexpected error in checkAvailability:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const { status } = req.body;

    // Validate booking ID
    if (isNaN(bookingId) || bookingId < 1) {
      return res.status(400).json({
        error: 'Invalid booking ID'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'contacted', 'confirmed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Update booking status
    Booking.update(bookingId, { status }, (err, result) => {
      if (err) {
        console.error('Error updating booking status:', err);
        return res.status(500).json({
          error: 'Failed to update booking status',
          details: err.message
        });
      }

      if (result.changes === 0) {
        return res.status(404).json({
          error: 'Booking not found'
        });
      }

      res.status(200).json({
        success: true,
        status: status
      });
    });
  } catch (error) {
    console.error('Unexpected error in updateStatus:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};

exports.deleteBooking = (req, res) => {
  res.status(200).json({ message: 'Delete booking - to be implemented', id: req.params.id });
};

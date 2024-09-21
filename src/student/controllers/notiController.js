const pool = require('../../../db');
const queries = require('../queries');
const jwt = require('jsonwebtoken');


const sendNotification = async (req, res) => {
  const { recipient, message } = req.body;

  console.log('Recipient:', recipient);
  console.log('Message:', message);
  
  if (!message || !recipient) {
    return res.status(400).json({ error: 'Recipient and message are required' });
  }

  try {
    let query;
    let values = [message, new Date(), new Date().toTimeString().split(' ')[0]];

    if (recipient === 'all_students') {
      query = `
        INSERT INTO notifications ("UID", message, date, time, is_read)
        SELECT "UID", $1, $2, $3, FALSE
        FROM users
        WHERE role = 'student';
      `;
    } else if (recipient === 'all_doctors') {
      query = `
        INSERT INTO notifications ("UID", message, date, time, is_read)
        SELECT "UID", $1, $2, $3, FALSE
        FROM users
        WHERE role = 'doctor';
      `;
    } else {
      // Fetch user ID based on email
      const emailQuery = 'SELECT "UID" FROM users WHERE email = $1';
      const emailResult = await pool.query(emailQuery, [recipient]);

      if (emailResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = emailResult.rows[0].UID;
      query = `
        INSERT INTO notifications ("UID", message, date, time, is_read)
        VALUES ($1, $2, $3, $4, FALSE);
      `;
      values.unshift(userId); // Add user ID to the beginning of the values array
    }

    await pool.query(query, values);

    res.status(201).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getnots = (req, res) => {
    pool.query(queries.getnots, (error, results) => {
        if (error) throw error;
        res.status(200).json(results.rows);
    });
};

const getNotificationsByUser = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    // Verify the token and extract the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.userId; // Ensure userId is correctly retrieved from the token payload
   
     console.log('Received Token:', token); // Log the received token

       console.log('Decoded Token:', decodedToken); // Log the decoded token

    if (!userId) {
      console.log('Invalid token: userId is missin');
    }
     console.log('Fetching notifications for userId:', userId);

   
    const query = `
      SELECT * FROM notifications
      WHERE "UID" = $1
      ORDER BY date DESC, time DESC;
    `;
    const values = [userId];
    const results = await pool.query(query, values);

    res.status(200).json(results.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authorizationHeader.split(' ')[1];
  console.log('Received Token:', token); // Log the received token

  try {
    // Verify the token and extract the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken); // Log the decoded token

    const userId = decodedToken.userId; // Ensure userId is correctly retrieved from the token payload
    if (!userId) {
      console.log('Invalid token: userId is missin');
    }
     console.log('Fetching notifications for userId:', userId);

    await pool.query(`UPDATE notifications SET is_read = true WHERE "UID" = $1`, [userId]);
    res.status(200).json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const deleteNotification = async (req, res) => {
  const { NID } = req.params; // Extract the notification ID from the route parameter
  console.log('Received:', NID); // Log the received notification ID

  // Ensure NID is a valid number (if applicable)
  if (isNaN(NID)) {
    return res.status(400).json({ message: 'Invalid notification ID' });
  }

  try {
    // Check if notification exists
    const notification = await pool.query('SELECT * FROM notifications WHERE "NID" = $1', [NID]);

    if (notification.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Delete the notification
    await pool.query('DELETE FROM notifications WHERE "NID" = $1', [NID]);

    // Send a success response
    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Error deleting notification' });
  }
};



const submitContactForm = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact (name, email, subject, message, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [name, email, subject, message]
    );

    res.status(201).json({
      message: 'Contact form submitted successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error inserting contact form:', error);
    res.status(500).json({ error: 'An error occurred while submitting the contact form.' });
  }
};

const getcontacts = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM contact ORDER BY created_at DESC');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
const deleteContact = async (req, res) => {
  const { cid } = req.params; // Assume you're passing the ID of the entry to delete in the URL

  if (!cid) {
    return res.status(400).json({ error: 'Contact form entry ID is required.' });
  }

  console.log("Received CID to delete:", cid); // Log the CID

  try {
    const result = await pool.query(
      `DELETE FROM contact WHERE "CID" = $1 RETURNING *`,
      [cid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Contact form entry not found.' });
    }

    res.status(200).json({
      message: 'Contact form entry deleted successfully.',
      deletedEntry: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting contact form entry:', error.message); // Log the error message
    res.status(500).json({ error: 'An error occurred while deleting the contact form entry.' });
  }
};

module.exports = {
  sendNotification,
  getnots,
  getNotificationsByUser,
  markAllAsRead,
  deleteNotification,
  submitContactForm,
  getcontacts,
  deleteContact
};




const jwt = require('jsonwebtoken');
const pool = require('../../../db');

// Get office hours for the logged-in doctor


exports.getOfficeHours = async (req, res) => {
    const { did } = req.params; // Extract DID from the request parameters

    try {
        // Use pool.query to get the office hours for the doctor
        const result = await pool.query('SELECT * FROM office_hours WHERE "DID" = $1', [did]);

        // Return the retrieved office hours as a JSON response
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving office hours:', error);
        res.status(500).json({ error: 'Error retrieving office hours' });
    }
};


// Function to check for conflicts
const checkTimeConflict = async (doctorId, day, startTime, endTime) => {
    const query = `
        SELECT * FROM office_hours
        WHERE doctorId = $1 AND day = $2
        AND (
            (start_time < $4 AND end_time > $3) OR
            (start_time BETWEEN $3 AND $4) OR
            (end_time BETWEEN $3 AND $4)
        )
    `;

    const values = [doctorId, day, startTime, endTime];

    try {
        const res = await pool.query(query, values);
        return res.rows.length > 0; // Return true if there are conflicts
    } catch (error) {
        console.error('Error checking time conflict:', error);
        throw new Error('Database error during conflict check.');
    }
};


// Add new office hour
exports. addOfficeHour = async (req, res) => {
  const { doctorId, day, startTime, endTime, location } = req.body;

  // Log the received request body to see what data is being sent
  console.log('Received office hour data:', req.body);

  // Check for missing fields
  if (!doctorId || !day|| !startTime || !endTime || !location) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const conflictExists = await checkTimeConflict(doctorId, day, startTime, endTime);
    
  if (conflictExists) {
      return res.status(409).json({ error: 'Time conflict exists for this office hour.' });
  }


  try {
      // SQL query to insert data into the office_hours table
      const query = `
          INSERT INTO office_hours ("DID", day, start_time, end_time, location)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
      `;
      const values = [doctorId, day, startTime, endTime, location];

      // Log the query being executed
      console.log('Executing query:', query, values);

      const { rows } = await pool.query(query, values);
      console.log('Office hour added:', rows[0]);

      return res.status(201).json(rows[0]);  // Return the newly added office hour
  } catch (error) {
      console.error('Error adding office hour:', error);
      return res.status(500).json({ error: 'Failed to add office hour' });
  }
};




// Delete office hour using pool
exports.deleteOfficeHour = async (req, res) => {
    const { id } = req.params;
console.log('wassal');
    try {
        // Execute the delete query
        const result = await pool.query('DELETE FROM office_hours WHERE "OID" = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Office hour not found' });
        }

        res.json({ message: 'Office hour deleted' });
    } catch (error) {
        console.error('Error deleting office hour:', error);
        res.status(500).json({ error: 'Error deleting office hour' });
    }
};
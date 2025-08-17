const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Database setup
const dbPath = path.join(__dirname, 'metro_booking.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    const createBookingsTable = `
        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            from_station TEXT NOT NULL,
            to_station TEXT NOT NULL,
            travel_date TEXT NOT NULL,
            travel_time TEXT NOT NULL,
            passengers INTEGER NOT NULL,
            ticket_type TEXT NOT NULL,
            total_price REAL NOT NULL,
            qr_code TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createStationsTable = `
        CREATE TABLE IF NOT EXISTS stations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            position INTEGER NOT NULL,
            active BOOLEAN DEFAULT 1
        )
    `;

    const createPricesTable = `
        CREATE TABLE IF NOT EXISTS prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_type TEXT UNIQUE NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            active BOOLEAN DEFAULT 1
        )
    `;

    db.run(createBookingsTable, (err) => {
        if (err) console.error('Error creating bookings table:', err);
    });

    db.run(createStationsTable, (err) => {
        if (err) console.error('Error creating stations table:', err);
        else insertInitialStations();
    });

    db.run(createPricesTable, (err) => {
        if (err) console.error('Error creating prices table:', err);
        else insertInitialPrices();
    });
}

// Insert initial station data
function insertInitialStations() {
    const stations = [
        { code: 'central', name: 'Central Station', position: 1 },
        { code: 'downtown', name: 'Downtown', position: 2 },
        { code: 'university', name: 'University', position: 3 },
        { code: 'mall', name: 'Shopping Mall', position: 4 },
        { code: 'hospital', name: 'City Hospital', position: 5 },
        { code: 'airport', name: 'Airport', position: 6 },
        { code: 'stadium', name: 'Sports Stadium', position: 7 },
        { code: 'park', name: 'City Park', position: 8 }
    ];

    const insertStation = db.prepare(`
        INSERT OR IGNORE INTO stations (code, name, position) 
        VALUES (?, ?, ?)
    `);

    stations.forEach(station => {
        insertStation.run(station.code, station.name, station.position);
    });

    insertStation.finalize();
}

// Insert initial pricing data
function insertInitialPrices() {
    const prices = [
        { ticket_type: 'regular', price: 2.50, description: 'Standard fare' },
        { ticket_type: 'student', price: 1.50, description: 'Student discount fare' },
        { ticket_type: 'senior', price: 1.75, description: 'Senior citizen fare' },
        { ticket_type: 'day-pass', price: 8.00, description: 'Unlimited rides for one day' }
    ];

    const insertPrice = db.prepare(`
        INSERT OR IGNORE INTO prices (ticket_type, price, description) 
        VALUES (?, ?, ?)
    `);

    prices.forEach(price => {
        insertPrice.run(price.ticket_type, price.price, price.description);
    });

    insertPrice.finalize();
}

// Utility function to generate QR code
async function generateQRCode(bookingData) {
    const qrData = {
        bookingId: bookingData.id,
        from: bookingData.from,
        to: bookingData.to,
        date: bookingData.date,
        time: bookingData.time,
        passengers: bookingData.passengers,
        type: bookingData.ticketType
    };

    try {
        const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
}

// API Routes

// Get all stations
app.get('/api/stations', (req, res) => {
    const query = 'SELECT * FROM stations WHERE active = 1 ORDER BY position';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Get ticket prices
app.get('/api/prices', (req, res) => {
    const query = 'SELECT * FROM prices WHERE active = 1';
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            from,
            to,
            date,
            time,
            passengers,
            ticketType,
            totalPrice
        } = req.body;

        // Validate required fields
        if (!from || !to || !date || !time || !passengers || !ticketType || !totalPrice) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate stations are different
        if (from === to) {
            return res.status(400).json({ error: 'From and to stations must be different' });
        }

        // Validate date is not in the past
        const bookingDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (bookingDate < today) {
            return res.status(400).json({ error: 'Booking date cannot be in the past' });
        }

        // Generate booking ID
        const bookingId = `MB${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);

        // Generate QR code
        const qrCode = await generateQRCode({
            id: bookingId,
            from,
            to,
            date,
            time,
            passengers,
            ticketType
        });

        // Insert booking into database
        const insertQuery = `
            INSERT INTO bookings (
                id, from_station, to_station, travel_date, travel_time,
                passengers, ticket_type, total_price, qr_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [
            bookingId, from, to, date, time, passengers, ticketType, totalPrice, qrCode
        ], function(err) {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Failed to create booking' });
                return;
            }

            res.status(201).json({
                success: true,
                booking: {
                    id: bookingId,
                    from,
                    to,
                    date,
                    time,
                    passengers,
                    ticketType,
                    totalPrice,
                    qrCode,
                    status: 'active'
                }
            });
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const query = 'SELECT * FROM bookings WHERE id = ?';

    db.get(query, [bookingId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }

        res.json(row);
    });
});

// Get all bookings (for admin purposes)
app.get('/api/bookings', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
        SELECT * FROM bookings 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM bookings';

    db.get(countQuery, [], (err, countResult) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }

            res.json({
                bookings: rows,
                pagination: {
                    page,
                    limit,
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// Cancel booking
app.put('/api/bookings/:id/cancel', (req, res) => {
    const bookingId = req.params.id;
    const updateQuery = `
        UPDATE bookings 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND status = 'active'
    `;

    db.run(updateQuery, [bookingId], function(err) {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Failed to cancel booking' });
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Booking not found or already cancelled' });
            return;
        }

        res.json({ 
            success: true, 
            message: 'Booking cancelled successfully' 
        });
    });
});

// Validate ticket (for QR code scanning)
app.post('/api/tickets/validate', (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID is required' });
    }

    const query = `
        SELECT * FROM bookings 
        WHERE id = ? AND status = 'active'
    `;

    db.get(query, [bookingId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (!row) {
            res.status(404).json({ 
                valid: false, 
                error: 'Invalid or expired ticket' 
            });
            return;
        }

        // Check if ticket is for today or future
        const travelDate = new Date(row.travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (travelDate < today) {
            res.status(400).json({ 
                valid: false, 
                error: 'Ticket has expired' 
            });
            return;
        }

        res.json({
            valid: true,
            booking: {
                id: row.id,
                from: row.from_station,
                to: row.to_station,
                date: row.travel_date,
                time: row.travel_time,
                passengers: row.passengers,
                ticketType: row.ticket_type
            }
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve the main HTML file for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT. Graceful shutdown...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Metro Booking Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});

module.exports = app;

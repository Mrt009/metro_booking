# Metro Ticket Booking System

A fully responsive, full-stack web application for booking metro tickets online. Built with modern web technologies and featuring a clean, mobile-first design.

## Features

### Frontend
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Interactive Route Map**: Visual representation of metro stations
- **Real-time Price Calculation**: Dynamic pricing based on ticket type and passenger count
- **QR Code Generation**: Digital tickets with QR codes for easy validation
- **Progressive Web App (PWA)**: Can be installed on mobile devices
- **Offline Support**: Basic functionality works without internet connection

### Backend
- **RESTful API**: Well-structured API endpoints for all operations
- **SQLite Database**: Lightweight database for storing bookings and system data
- **Data Validation**: Comprehensive input validation and error handling
- **Security Features**: Rate limiting, CORS protection, and helmet security
- **QR Code Generation**: Server-side QR code creation for tickets
- **Booking Management**: Full CRUD operations for ticket bookings

### Technical Features
- **Mobile-First Design**: Optimized for mobile devices first
- **Cross-Browser Compatibility**: Works on all modern browsers
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Accessible**: WCAG compliant with proper ARIA labels
- **Fast Loading**: Optimized images and minified assets

## Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with Flexbox/Grid, animations, and media queries
- **JavaScript ES6+**: Modern JavaScript with async/await and modules
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Poppins font family for typography

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web framework for building the API
- **SQLite**: Lightweight database for data storage
- **QRCode**: Library for generating QR codes
- **Security Middleware**: Helmet, CORS, rate limiting

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Instructions

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd ticket\ booking\ metro
   
   # Or download and extract the files to the project directory
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - The `.env` file is already configured with default values
   - Modify the `.env` file if you need to change ports or other settings

4. **Start the Application**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application should be running and ready to use

## Usage Guide

### Booking a Ticket

1. **Navigate to the Booking Section**
   - Click on "Book Now" or scroll to the booking form

2. **Fill in Travel Details**
   - Select departure station (From)
   - Select destination station (To)
   - Choose travel date and time
   - Select number of passengers
   - Choose ticket type (Regular, Student, Senior, or Day Pass)

3. **Review and Confirm**
   - Check the total price calculation
   - Click "Book Ticket" to proceed

4. **Get Your Digital Ticket**
   - A confirmation modal will appear with your ticket details
   - Save the QR code for station entry
   - Your booking is automatically saved

### API Endpoints

The backend provides several API endpoints:

- `GET /api/stations` - Get all metro stations
- `GET /api/prices` - Get ticket pricing information
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/:id` - Get specific booking details
- `GET /api/bookings` - Get all bookings (paginated)
- `PUT /api/bookings/:id/cancel` - Cancel a booking
- `POST /api/tickets/validate` - Validate a ticket by QR code
- `GET /api/health` - Health check endpoint

### Database Schema

The application uses SQLite with the following tables:

- **bookings**: Stores all ticket bookings
- **stations**: Metro station information
- **prices**: Ticket pricing configuration

## File Structure

```
ticket booking metro/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # Frontend JavaScript functionality
├── server.js           # Backend Express.js server
├── package.json        # Node.js dependencies and scripts
├── sw.js              # Service Worker for PWA functionality
├── .env               # Environment configuration
├── README.md          # This documentation file
└── metro_booking.db   # SQLite database (created automatically)
```

## Responsive Design

The application is designed with a mobile-first approach:

- **Mobile (320px - 768px)**: Optimized for smartphones
- **Tablet (768px - 1024px)**: Adapted for tablets
- **Desktop (1024px+)**: Full desktop experience

### Key Responsive Features
- Collapsible navigation menu on mobile
- Stacked form layout on smaller screens
- Touch-friendly buttons and inputs
- Optimized typography and spacing
- Responsive route map visualization

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers

## Performance Optimizations

- **Compressed Assets**: Gzip compression enabled
- **Caching Strategy**: Browser and service worker caching
- **Optimized Images**: Proper image sizing and formats
- **Minimal Dependencies**: Lightweight libraries only
- **Lazy Loading**: Images and components loaded as needed

## PWA Features

- **Installable**: Can be installed on mobile devices
- **Offline Support**: Basic functionality works offline
- **Service Worker**: Caches resources for faster loading
- **Responsive**: Adapts to any screen size
- **App-like Experience**: Full-screen, native-like feel

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or kill the process using the port

2. **Database Connection Issues**
   - Ensure write permissions in the project directory
   - Database file will be created automatically

3. **Module Not Found Errors**
   - Run `npm install` to install all dependencies
   - Ensure Node.js version is 14 or higher

### Support

For technical support or questions:
- Email: support@metrobook.com
- Check the console for error messages
- Ensure all dependencies are properly installed

## Future Enhancements

Potential features for future versions:
- User authentication and profiles
- Payment gateway integration
- Real-time train tracking
- Push notifications
- Multi-language support
- Admin dashboard
- Analytics and reporting
- Email confirmations
- SMS notifications

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Metro Ticket Booking System v1.0.0**  
Built with ❤️ for seamless metro travel experience.

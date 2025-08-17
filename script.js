// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navList = document.querySelector('.nav-list');
const bookingForm = document.getElementById('bookingForm');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const passengersSelect = document.getElementById('passengers');
const ticketTypeSelect = document.getElementById('ticketType');
const totalPriceElement = document.getElementById('totalPrice');
const modal = document.getElementById('confirmationModal');
const closeModal = document.querySelector('.close');

// Price configuration
const ticketPrices = {
    regular: 2.50,
    student: 1.50,
    senior: 1.75,
    'day-pass': 8.00
};

// Station names mapping
const stationNames = {
    central: 'Central Station',
    downtown: 'Downtown',
    airport: 'Airport',
    university: 'University',
    mall: 'Shopping Mall',
    hospital: 'City Hospital',
    stadium: 'Sports Stadium',
    park: 'City Park'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    // Set default time
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    timeInput.value = currentTime;

    // Add event listeners
    addEventListeners();
    
    // Calculate initial price
    calculatePrice();
}

function addEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Form event listeners
    passengersSelect.addEventListener('change', calculatePrice);
    ticketTypeSelect.addEventListener('change', calculatePrice);
    fromSelect.addEventListener('change', validateStations);
    toSelect.addEventListener('change', validateStations);
    
    // Form submission
    bookingForm.addEventListener('submit', handleBookingSubmission);
    
    // Modal event listeners
    closeModal.addEventListener('click', closeConfirmationModal);
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeConfirmationModal();
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                navList.classList.remove('active');
            }
        });
    });

    // Station hover effects
    document.querySelectorAll('.station').forEach(station => {
        station.addEventListener('click', function() {
            const stationValue = this.dataset.station;
            highlightStationRoute(stationValue);
        });
    });
}

function toggleMobileMenu() {
    navList.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function calculatePrice() {
    const passengers = parseInt(passengersSelect.value) || 1;
    const ticketType = ticketTypeSelect.value;
    const basePrice = ticketPrices[ticketType] || 0;
    
    let totalPrice;
    if (ticketType === 'day-pass') {
        // Day pass price doesn't multiply by passenger count
        totalPrice = basePrice;
    } else {
        totalPrice = basePrice * passengers;
    }
    
    totalPriceElement.textContent = totalPrice.toFixed(2);
}

function validateStations() {
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    
    if (fromValue && toValue && fromValue === toValue) {
        alert('Please select different stations for departure and destination.');
        toSelect.value = '';
    }
}

function handleBookingSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData);
    
    // Validate form
    if (!validateBookingForm(bookingData)) {
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.book-button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<div class="loading"></div> Processing...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        processBooking(bookingData);
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function validateBookingForm(data) {
    // Check if all required fields are filled
    const requiredFields = ['from', 'to', 'date', 'time', 'passengers', 'ticketType'];
    
    for (let field of requiredFields) {
        if (!data[field]) {
            alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
            return false;
        }
    }
    
    // Check if from and to stations are different
    if (data.from === data.to) {
        alert('Please select different stations for departure and destination.');
        return false;
    }
    
    // Check if date is not in the past
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('Please select a date that is today or in the future.');
        return false;
    }
    
    return true;
}

async function processBooking(bookingData) {
    try {
        // Generate booking ID
        const bookingId = generateBookingId();
        
        // Calculate total price
        const passengers = parseInt(bookingData.passengers);
        const ticketType = bookingData.ticketType;
        const basePrice = ticketPrices[ticketType];
        
        let totalPrice;
        if (ticketType === 'day-pass') {
            totalPrice = basePrice;
        } else {
            totalPrice = basePrice * passengers;
        }
        
        // Prepare booking object
        const booking = {
            id: bookingId,
            from: bookingData.from,
            to: bookingData.to,
            date: bookingData.date,
            time: bookingData.time,
            passengers: passengers,
            ticketType: ticketType,
            totalPrice: totalPrice,
            timestamp: new Date().toISOString()
        };
        
        // Send to backend
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });
        
        if (response.ok) {
            const result = await response.json();
            showBookingConfirmation(booking);
            
            // Store booking in localStorage as backup
            storeBookingLocally(booking);
            
            // Reset form
            bookingForm.reset();
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            calculatePrice();
        } else {
            throw new Error('Booking failed');
        }
    } catch (error) {
        console.error('Booking error:', error);
        
        // Fallback: store locally and show confirmation
        const bookingId = generateBookingId();
        const passengers = parseInt(bookingData.passengers);
        const ticketType = bookingData.ticketType;
        const basePrice = ticketPrices[ticketType];
        
        let totalPrice;
        if (ticketType === 'day-pass') {
            totalPrice = basePrice;
        } else {
            totalPrice = basePrice * passengers;
        }
        
        const booking = {
            id: bookingId,
            from: bookingData.from,
            to: bookingData.to,
            date: bookingData.date,
            time: bookingData.time,
            passengers: passengers,
            ticketType: ticketType,
            totalPrice: totalPrice,
            timestamp: new Date().toISOString()
        };
        
        storeBookingLocally(booking);
        showBookingConfirmation(booking);
        
        // Reset form
        bookingForm.reset();
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        calculatePrice();
        
        // Show offline message
        alert('Booking processed offline. Your ticket is saved locally.');
    }
}

function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `MB${timestamp}${random}`.slice(-10);
}

function storeBookingLocally(booking) {
    try {
        const existingBookings = JSON.parse(localStorage.getItem('metroBookings') || '[]');
        existingBookings.push(booking);
        localStorage.setItem('metroBookings', JSON.stringify(existingBookings));
    } catch (error) {
        console.error('Failed to store booking locally:', error);
    }
}

function showBookingConfirmation(booking) {
    // Populate modal with booking details
    document.getElementById('bookingId').textContent = booking.id;
    document.getElementById('ticketFrom').textContent = stationNames[booking.from];
    document.getElementById('ticketTo').textContent = stationNames[booking.to];
    document.getElementById('ticketDate').textContent = formatDate(booking.date);
    document.getElementById('ticketTime').textContent = booking.time;
    document.getElementById('ticketPassengers').textContent = booking.passengers;
    document.getElementById('ticketTotal').textContent = `$${booking.totalPrice.toFixed(2)}`;
    
    // Show modal
    modal.style.display = 'block';
}

function closeConfirmationModal() {
    modal.style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function highlightStationRoute(stationValue) {
    // Remove existing highlights
    document.querySelectorAll('.station').forEach(station => {
        station.classList.remove('highlighted');
    });
    
    // Add highlight to clicked station
    const clickedStation = document.querySelector(`[data-station="${stationValue}"]`);
    if (clickedStation) {
        clickedStation.classList.add('highlighted');
        
        // Auto-fill form if possible
        if (!fromSelect.value) {
            fromSelect.value = stationValue;
        } else if (!toSelect.value && fromSelect.value !== stationValue) {
            toSelect.value = stationValue;
            calculatePrice();
        }
    }
}

// Utility function to get all local bookings
function getLocalBookings() {
    try {
        return JSON.parse(localStorage.getItem('metroBookings') || '[]');
    } catch (error) {
        console.error('Failed to retrieve local bookings:', error);
        return [];
    }
}

// Function to sync local bookings with server when online
async function syncLocalBookings() {
    const localBookings = getLocalBookings();
    const unsyncedBookings = localBookings.filter(booking => !booking.synced);
    
    for (const booking of unsyncedBookings) {
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(booking)
            });
            
            if (response.ok) {
                booking.synced = true;
            }
        } catch (error) {
            console.error('Failed to sync booking:', error);
        }
    }
    
    // Update localStorage with synced status
    localStorage.setItem('metroBookings', JSON.stringify(localBookings));
}

// Check network status and sync when online
window.addEventListener('online', syncLocalBookings);

// Add CSS for highlighted stations
const style = document.createElement('style');
style.textContent = `
    .station.highlighted .station-dot {
        background: #ffd700;
        border-color: #ffd700;
        animation: pulse 1s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .station.highlighted span {
        color: #ffd700;
        font-weight: 700;
    }
`;
document.head.appendChild(style);

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.booking-form, .booking-info, .info-card, .contact-item');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

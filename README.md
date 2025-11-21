#🎪 Lesotho Events Calendar - Event Management System
A comprehensive event management platform built for Lesotho, featuring M-Pesa mobile payments, digital ticketing, and social sharing capabilities.

🌟 Features
🎫 Event Management
Event Creation & Publishing - Organizers can create and manage events

Event Discovery - Users can browse events with advanced filtering

Real-time Availability - Live ticket count updates

Event Categories - Music, Sports, Cultural, Business, Educational

💳 M-Pesa Payment Integration
Seamless Mobile Payments - Integrated with Safaricom M-Pesa Daraja API

STK Push - Users receive payment prompts directly on their phones

Payment Confirmation - Real-time payment status updates

Secure Transactions - End-to-end encrypted payment processing

🎟️ Digital Ticketing System
QR Code Tickets - Unique QR codes for each registration

Ticket Validation - Organizers can scan and verify tickets

Digital Access - No need for physical tickets

Ticket Sharing - Easy sharing with friends and family

📱 Social Features
Social Media Sharing - Share events on Facebook, Twitter, WhatsApp, Email

Event Reviews & Ratings - Attendees can rate and review events

Comments System - Discussion and Q&A for each event

Event Promotion - Built-in tools for event marketing

👥 User Management
Role-based Access - Attendees, Organizers, and Administrators

User Profiles - Personalized dashboards

Registration History - Track past and upcoming events

Secure Authentication - JWT-based authentication system

🛠️ Tech Stack
Frontend
React 18 - Modern React with hooks

Vite - Fast build tool and dev server

TailwindCSS - Utility-first CSS framework

React Router - Client-side routing

Axios - HTTP client for API calls

Lucide React - Beautiful icons

Backend
Node.js - Runtime environment

Express.js - Web application framework

JWT - JSON Web Tokens for authentication

bcryptjs - Password hashing

Database & Services
Supabase - PostgreSQL database with real-time capabilities

M-Pesa Daraja API - Mobile payment processing

Render - Backend hosting platform

Netlify - Frontend hosting platform

🚀 Quick Start
Prerequisites
Node.js (v18 or higher)

npm or yarn

Supabase account

M-Pesa Daraja API credentials

Installation
Clone the repository

bash
git clone https://github.com/yourusername/lesotho-events-calendar.git
cd lesotho-events-calendar
Backend Setup

bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials
Frontend Setup

bash
cd client
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API URL
Database Setup

Create a new project in Supabase

Run the SQL schema from database/schema.sql

Configure Row Level Security (RLS) policies

M-Pesa Configuration

Register at Safaricom Daraja

Create a sandbox app for testing

Update environment variables with your credentials

Running Locally
Start Backend

bash
cd server
npm run dev
# Server runs on https://lesotho-events-backend.onrender.com
Start Frontend

bash
cd client
npm run dev
# Application runs on https://lesothoevents.netlify.app/
📁 Project Structure
text
lesotho-events-calendar/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── database/             # Database schema and migrations
└── docs/                # Documentation
🔧 Configuration
Environment Variables
Backend (.env)

env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=your_callback_url

# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
Frontend (.env)

env
VITE_API_BASE_URL=http://localhost:5000/api

# Screenshots
<img width="1256" height="665" alt="image" src="https://github.com/user-attachments/assets/1812f0b1-1b26-48fe-887f-841f44cf3e28" />

<img width="1246" height="641" alt="image" src="https://github.com/user-attachments/assets/d334ec59-6d76-4c5f-876c-ebf8a61065f9" />

<img width="1254" height="655" alt="image" src="https://github.com/user-attachments/assets/cdcdb33d-17a2-419c-979d-1bcc349c546d" />

<img width="1241" height="658" alt="image" src="https://github.com/user-attachments/assets/d71aaec5-3ba9-49c7-937e-4478810c451c" />

# Video Url
-

🎯 API Endpoints
Authentication
POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/auth/me - Get current user

Events
GET /api/events - Get all events (with filtering)

GET /api/events/:id - Get single event

POST /api/events - Create new event (Organizers only)

PUT /api/events/:id - Update event

GET /api/events/user/my-events - Get user's events

Payments
POST /api/payments/initiate - Initiate M-Pesa payment

POST /api/payments/callback - M-Pesa callback endpoint

GET /api/payments/status/:id - Check payment status

GET /api/payments/history - Get payment history

Reviews
GET /api/reviews/event/:eventId - Get event reviews

POST /api/reviews - Create or update review

DELETE /api/reviews/:id - Delete review

📱 Usage Guide
For Event Attendees
Browse Events - Explore events by category, location, or date

Register - Create an account or login

Book Tickets - Select tickets and pay via M-Pesa

Receive Digital Ticket - Get QR code ticket via email and in app

Attend Event - Present QR code for scanning at venue

Share Experience - Rate and review the event

For Event Organizers
Create Account - Register as an organizer

Create Events - Add event details, tickets, and pricing

Manage Registrations - View attendee list and payment status

Scan Tickets - Use QR scanner to validate tickets at event

Analyze Performance - View registration stats and revenue

🚀 Deployment
Backend Deployment (Render)
Connect GitHub repository to Render

Set root directory to server

Configure environment variables

Deploy automatically on git push

Frontend Deployment (Netlify)
Connect GitHub repository to Netlify

Set build directory to client

Set build command: npm run build

Set publish directory: client/dist

Configure environment variables

Production Checklist
Update all environment variables for production

Configure CORS origins in Supabase

Set up production M-Pesa credentials

Test payment flow end-to-end

Configure custom domains (optional)

Set up monitoring and error tracking

🔒 Security Features
JWT Authentication - Secure token-based auth

Password Hashing - bcrypt password encryption

CORS Protection - Configured cross-origin requests

Input Validation - Server-side validation

SQL Injection Protection - Parameterized queries

XSS Protection - Content Security Policy

📊 Database Schema
Key Tables
users - User accounts and profiles

events - Event information and details

registrations - Event registrations and tickets

payments - Payment records and status

event_reviews - User reviews and ratings

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

🐛 Troubleshooting
Common Issues
M-Pesa Payment Failures

Check Daraja API credentials

Verify callback URL configuration

Ensure phone number formatting (+254...)

QR Code Generation

Verify qrcode.react installation

Check React version compatibility

Ensure proper import statements

Database Connection

Verify Supabase project URL and keys

Check network connectivity

Review RLS policies

Getting Help
Check the issues page

Create a new issue with detailed description

Include error logs and environment details

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Safaricom for M-Pesa Daraja API

Supabase for excellent backend-as-a-service

React Community for amazing tools and libraries

Lesotho Tech Community for inspiration and support

📞 Support
For support and questions:

📧 Email: support@lesothoevents.com

🐛 Issues: GitHub Issues

📚 Documentation: Project Wiki

Built with ❤️ for the Lesotho Events Community

Making event discovery and management seamless across the Mountain Kingdom 🏔️



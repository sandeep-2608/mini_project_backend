# Description
This project is a backend system designed to track user onboarding sessions, monitor dropoff points, and provide comprehensive analytics on user engagement and completion rates. It includes a background job for marking abandoned sessions and supports detailed analytics endpoints for data-driven insights.

# Features
1. Session Management: Start and track user sessions through multiple onboarding screens.
2. Dropoff Tracking: Identify where users drop off during the onboarding process based on actual user journey.
3. Background Job: Automatically marks inactive sessions as abandoned after a timeout period.
4. View Tracking: Records screen views to improve accuracy of engagement metrics.
5. Comprehensive Analytics: Provides endpoints to retrieve dropoff statistics, screen-specific analytics, and overall summaries.
6. Authentication: Secure API endpoints with JWT-based authentication.

# Technologies Used
1. Node.js with Express.js for the server
2. MongoDB with Mongoose for database and data modeling
3. JWT for authentication
4. Node Schedule for background job scheduling
5. UUID for session ID generation
6. dotenv for environment variable management

# Installation
Clone the repository:

bash
git clone <repository-url>
cd <repository-folder>
Install dependencies:

bash
npm install
Create a .env file in the root folder with the following variables:

MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
PORT=5000
Start the development server:

bash
npm run dev

# API Endpoints
## Authentication
POST /api/v1/auth/register - Register a new user

POST /api/v1/auth/login - Login and receive a JWT token

## Onboarding Sessions
POST /api/v1/session/start - Start a new onboarding session (authenticated)

POST /api/v1/session/respond - Record a response for a screen in a session (authenticated)

GET /api/v1/session/:sessionId/next - Get the next screen for a session (authenticated)

## Screens Management
POST /api/v1/screen/ - Create a new screen (authenticated)

GET /api/v1/screen/all - Get all active screens (authenticated)

PUT /api/v1/screen/:screenId - Update a screen (authenticated)

DELETE /api/v1/screen/:screenId - Delete a screen (authenticated)

## Analytics
GET /api/v1/analytics/dropoff/:screenId - Get dropoff statistics across individual screens (authenticated)

# Data Models
1. User: Stores user credentials and roles.

2. Session: Tracks individual user sessions with current screen, responses, and status (active, completed, abandoned).

3. Screen: Represents onboarding screens with order and question types.

4. Analytics: Stores daily aggregated metrics for views, completions, and dropoffs per screen.

# Background Job
A scheduled background job runs every 15 minutes to mark sessions as abandoned if inactive for more than 10 minutes.

This job updates dropoff counts and helps maintain accurate session statuses.


# Development Notes
Ensure the background job file (markAbandonedSessions.js) is imported in index.js to start automatically.

Use JWT tokens to authenticate all protected routes.

The system tracks both screen views and responses to accurately calculate dropoff points.

Dropoff logic considers sequential screen views and unanswered screens to identify where users abandon the onboarding flow.


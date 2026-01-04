# Holiday Planner Dashboard

A responsive web dashboard to help you plan and track your annual leave holidays, sick days, bank holidays and unpaid leave. Built with Node.js, Express, MongoDB, and Firebase Authentication.

## Features
- Google Authentication (Firebase)
- Cloud data storage (MongoDB Atlas)
- Interactive calendar with month and year views
- Assign holidays, sick days and unpaid leave to any date
- Color-coded days and custom labels
- UK bank holidays automatically highlighted
- Attendance tracking with statistics
- Multi-select mode for bulk assignment
- Export your schedule to a text file

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free tier available)
- Firebase project (free tier available)

## Setup Instructions

### 1. Clone and Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and create a free account
2. Create a new cluster (free M0 tier works fine)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Add your IP address to the Network Access whitelist

### 3. Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Google" provider
4. Get Web App Config:
   - Go to Project Settings → Your apps → Add app → Web
   - Copy the `firebaseConfig` object
   - Update `client/script.js` with your config
5. Get Admin SDK Credentials:
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Use the values in your `.env` file

### 4. Configure Environment Variables
Edit the `.env` file with your credentials:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/annual-leave-calendar
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
```

### 5. Update Firebase Config in Frontend
Edit `client/script.js` and replace the `firebaseConfig` object (around line 12):
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 6. Run the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure
```
annual-leave-calendar/
├── client/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── script.js          # JavaScript with Firebase auth
│   ├── styles.css         # Styles
│   └── images/            # Assets
├── server/                 # Backend files
│   ├── index.js           # Express server
│   ├── config/
│   │   └── firebase.js    # Firebase Admin SDK setup
│   ├── middleware/
│   │   └── auth.js        # Auth middleware
│   ├── models/
│   │   └── User.js        # MongoDB User model
│   └── routes/
│       ├── auth.js        # Auth routes
│       └── data.js        # Data API routes
├── .env                    # Environment variables (not in git)
├── .env.example           # Example env file
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Create/get user after Firebase login |
| GET | /api/auth/me | Get current user info |
| GET | /api/data | Get all user data |
| POST | /api/data | Save all user data |
| PUT | /api/data/holidays | Update holidays only |
| PUT | /api/data/attendance | Update attendance only |
| PUT | /api/data/settings | Update settings only |

## Day Types
- **Holiday**: Counts toward your allowance
- **Sick Day**: Does not count toward allowance
- **Unpaid Leave**: Does not count toward allowance
- **Bank Holiday**: UK public holidays (auto-highlighted)

## License
MIT


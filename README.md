# Student E-Voting System

A modern, secure, and user-friendly digital voting platform built with React and Firebase for student elections.

## 🚀 Features

- **Secure Authentication**: Email/password authentication with Firebase Auth
- **Role-based Access**: Separate interfaces for voters and administrators
- **Real-time Voting**: Live vote counting and results display
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Admin Dashboard**: Comprehensive management tools for candidates and voters
- **Vote Security**: One vote per user with secure data storage
- **Live Results**: Real-time charts and statistics
- **Timer System**: Countdown timer for voting sessions

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📁 Project Structure

```
src/
├── assets/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Voting/
│   │   ├── VoteCard.jsx
│   │   └── Timer.jsx
│   └── Results/
│       └── ResultChart.jsx
├── pages/
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── VotingPage.jsx
│   ├── ResultPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AddCandidate.jsx
│   ├── VoterList.jsx
│   └── NotFound.jsx
├── context/
│   └── AuthContext.jsx
├── firebase/
│   └── config.js
├── routes/
│   └── AppRoutes.jsx
├── hooks/
│   └── useAuth.js
├── styles/
│   └── main.css
├── App.jsx
└── main.jsx
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase config object
5. Replace the placeholder values in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 3. Firestore Security Rules

Add these security rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read candidates
    match /candidates/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can write their own vote, admins can read all votes
    match /votes/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Create Admin User

After setting up, register a user and manually change their role to 'admin' in Firestore:

1. Register a new user through the app
2. Go to Firestore Console
3. Find the user document in the 'users' collection
4. Change the 'role' field from 'voter' to 'admin'

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗃️ Database Structure

### Users Collection (`/users`)
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  studentId: "STU001",
  role: "voter", // or "admin"
  hasVoted: false,
  createdAt: timestamp,
  votedAt: timestamp // optional
}
```

### Candidates Collection (`/candidates`)
```javascript
{
  name: "Jane Smith",
  position: "President",
  description: "Experienced leader...",
  voteCount: 0,
  createdAt: timestamp
}
```

### Votes Collection (`/votes`)
```javascript
{
  userId: {
    "President": "candidateId1",
    "Vice President": "candidateId2"
  }
}
```

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Build the project:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy
```

## 🔐 Security Features

- Firebase Authentication for secure user management
- Firestore security rules to prevent unauthorized access
- One vote per user enforcement
- Role-based access control
- Secure vote storage and counting

## 🎨 UI Features

- Responsive design for all devices
- Modern gradient backgrounds
- Interactive vote cards
- Real-time countdown timer
- Beautiful charts and statistics
- Toast notifications for user feedback
- Loading states and error handling

## 📱 User Roles

### Voter
- Register and login
- View dashboard with voting status
- Cast votes for candidates
- View real-time results

### Admin
- All voter capabilities
- Add new candidates
- View voter management dashboard
- Monitor voting statistics
- Delete candidates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for transparent and secure student elections**
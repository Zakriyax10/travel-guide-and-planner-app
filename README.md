# RIHLA — Travel & Food Guide Application

RIHLA (رحلة) is a mobile travel and food guide application designed to help users discover nearby cafes and restaurants, explore places through an interactive map, navigate to selected locations, create trip plans, and get assistance from an AI-powered travel planning chatbot.

The application is built as a full-stack mobile solution using React Native and Expo for the frontend, Express.js for the backend, and MongoDB for data storage.

---

## ✨ Features

* 📍 **Nearby Places Discovery**

  * Discover nearby cafes, restaurants, and other places.
  * View locations directly on an interactive map.

* 🗺️ **Interactive Map**

  * Display places using custom map markers.
  * Select a location to view its details.
  * Open navigation for a selected location.

* 🍽️ **Place Details**

  * Explore information about discovered places.
  * View places through dedicated place cards and detail screens.

* 🧳 **Trip Planning**

  * Add locations to a personal trip plan.
  * Organize selected destinations for a planned trip.

* 🤖 **AI Travel Assistant**

  * Chat with an AI-powered travel assistant.
  * Get travel-planning assistance and suggestions through the chatbot.

* 🔐 **User Authentication**

  * User registration and login.
  * Protected authentication using JWT.
  * Passwords are securely hashed before storage.

* 👤 **User Profile**

  * Access user account information through the profile section.

* 🌓 **Theme Support**

  * Application theme management through a dedicated theme context.

---

## 🛠️ Tech Stack

### Frontend

* React Native
* Expo
* JavaScript
* React Context API
* Expo / React Native ecosystem

### Backend

* Node.js
* Express.js
* JavaScript
* REST APIs
* JWT Authentication
* bcrypt
* Mongoose

### Database

* MongoDB
* MongoDB Atlas

### External Services

* Geoapify — places/location data
* Anthropic API — AI travel assistant

---

### Technologies

```text
React Native
Expo
JavaScript
Node.js
Express.js
MongoDB
Mongoose
Geoapify
Anthropic API
```

---

## Project Structure

RIHLA/

├── assets/

├── components/

├── constants/

├── context/

├── screens/

├── AppBackend/

           ├── models/

           ├── routes/

           └── server.js

├── App.js

├── package.json

└── .env.example


---

# 🚀 Getting Started

Follow the instructions below to run RIHLA locally.

## Prerequisites

Before running the project, make sure you have:

* Node.js installed
* npm installed
* Git installed
* MongoDB Atlas account or a MongoDB database
* Expo Go installed on your Android/iOS device
* A Geoapify API key
* An Anthropic API key
* A computer and mobile device connected to the same local network for physical-device testing


---

# 📥 1. Clone the Repository

Clone the project:

```bash
git clone https://github.com/Zakriyax10/travel-and-food-guide-app.git
```

Move into the project directory:

```bash
cd travel-and-food-guide-app
```

---

# 📦 2. Install Frontend Dependencies

From the project root:

```bash
npm install
```

This installs the React Native / Expo application dependencies.

---

# ⚙️ 3. Configure Frontend Environment Variables

Create **.env** files using the provided **.env.example** files.

**Frontend .env:**

EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:5000
EXPO_PUBLIC_GEOAPIFY_KEY=YOUR_GEOAPIFY_KEY

**Backend .env:**

PORT=5000
JWT_SECRET=YOUR_JWT_SECRET
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
MONGO_URI=YOUR_MONGODB_URI

# 🖥️ 4. Configure the Backend

Move into the backend directory:

```bash
cd AppBackend
```

Install backend dependencies:

```bash
npm install
```


# 🗄️ 5. Configure MongoDB

RIHLA uses MongoDB for database storage.

After creating your database, obtain your MongoDB connection string and place it in:

```env
MONGO_URI=your-mongodb-connection-string-here
```

Make sure your MongoDB deployment allows your development environment to connect.

---



# ▶️ 7. Start the Backend

Open a terminal in the project root and move into the backend:

```bash
cd AppBackend
```

Start the backend:

```bash
node server.js
```

---

# 📱 8. Start the React Native Application

Open another terminal.

Make sure you are in the project root:

```bash
cd ..
```

Then start Expo:

```bash
npx expo start
```

Expo will display a QR code.

Open **Expo Go** on your mobile device and scan the QR code.

 Open the application using Expo Go.

If the mobile application cannot communicate with the backend, check that:

* Both devices are connected to the same network.
* The backend is running.
* The IP address in `.env` is correct.
* Port `5000` is accessible through your computer's firewall.

---

# 📖 User Guide

## 1. Create an Account

Open RIHLA and create an account using the signup screen.

After registration, log in using your account credentials.

---

## 2. Explore Nearby Places

Use the map screen to explore nearby locations.

The application displays available places using custom map markers.

Select a marker to view information about the location.

---

## 3. View Place Details

Select a place from the map or available place cards.

The place details screen provides additional information and available actions.

---

## 4. Navigate to a Place

After selecting a location, users can open navigation to the selected place using the available map/navigation functionality.

---

## 5. Plan a Trip

Users can select locations and add them to their trip plan.

The trip planner allows users to keep track of destinations they want to visit.

---

## 6. Use the AI Travel Assistant

Open the chatbot from the application.

Users can interact with the AI travel assistant to receive travel-planning assistance and suggestions.

The chatbot communicates with the backend, which handles the Anthropic API integration.

---

## 7. Manage Your Profile

The profile screen provides access to the user's account information and application-related options.


---

# 🔮 Future Improvements

Potential future improvements include:

* Enhanced trip management
* More detailed place information
* Additional travel categories
* Improved AI trip planning
* Offline functionality
* Push notifications
* More advanced user preferences
* Expanded destination coverage
* Improved testing and automated deployment

---

# 👥 Project

**RIHLA — Travel & Food Guide Application**

_Developed as a university Final Year Project for Bachelors of Science in Information Technology (BS IT)_





---

## 📄 License

This project was developed as a university Final Year Project.

If you intend to reuse, modify, or distribute the project, please contact the project authors first.

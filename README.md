# EArena 🎮

**EArena** is an Esports Tournament Management System designed to help tournament organizers manage esports competitions in one place.

It provides a platform where **organizers can create and manage tournaments**, while **players and teams can register and participate** in them.

---

## 🚀 Features

* 🔐 User Registration & Login
* 🏆 Create and Manage Tournaments
* 👥 Player & Team Management
* 📝 Tournament Registration
* ⚔️ Match Management
* 📊 Match Results & Standings
* 📢 Tournament Announcements
* 👨‍💼 Admin Management

---

## 👥 User Roles

### Admin

* Manage users
* Manage tournaments
* Monitor the platform

### Organizer

* Create tournaments
* Manage registrations
* Manage teams and matches
* Update results

### Player / Team

* Create profile
* Join teams
* Register for tournaments
* View matches and results

### Spectator

* View tournaments
* View schedules, matches, and results

---

## 🛠️ Tech Stack

**Frontend**

* React.js
* Tailwind CSS
* React Router
* Axios

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose

**Authentication & Other Tools**

* JWT
* bcrypt
* Cloudinary
* Nodemailer

---

## 📂 Project Structure

```text
EArena/
│
├── client/          # React frontend
│
├── server/          # Node.js + Express backend
│
├── docs/            # Project documentation
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/EArena.git
cd EArena
```

### 2. Install dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd ../server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Run the project

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

---

## 🎯 Project Goal

The main goal of **EArena** is to replace the traditional use of **Google Forms, WhatsApp groups, and spreadsheets** for managing college-level esports tournaments with a single centralized platform.

---

## 🔮 Future Enhancements

* Real-time match updates
* Online tournament payments
* Live tournament brackets
* Player rankings
* Advanced analytics
* Live streaming integration

---

## 👨‍💻 Developer

**Vikrant Salunkhe**

MCA — Pimpri Chinchwad College of Engineering, Pune

---

### ⭐ EArena

**One Platform. Every Tournament.**

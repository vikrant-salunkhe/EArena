# System Architecture

## Introduction

The Esports Tournament Management System follows a **Three-Tier Architecture** with a **Modular MVC + Service Layer** design pattern. This architecture separates the application into independent layers, making the system scalable, maintainable, secure, and easy to extend.

The application consists of:

- React Frontend (Presentation Layer)
- Express Backend (Application Layer)
- MongoDB Database & Cloudinary (Data Layer)

This architecture ensures a clear separation of concerns and follows modern full-stack development best practices.

---

# Architectural Goals

The architecture is designed to achieve the following objectives:

- Modular development
- Clean code organization
- High maintainability
- Scalability
- Secure authentication
- Easy deployment
- Reusable business logic
- Separation of responsibilities

---

# High-Level Architecture

```text
                    User
                      │
                      ▼
        ┌──────────────────────────┐
        │     React Frontend        │
        │ React + Tailwind + Axios  │
        └──────────────────────────┘
                      │
                 HTTPS (REST APIs)
                      │
                      ▼
        ┌──────────────────────────┐
        │    Express Backend        │
        │ Controllers + Services    │
        └──────────────────────────┘
              │              │
              ▼              ▼
      MongoDB Atlas     Cloudinary
       (Database)      (Image Storage)
```

---

# Three-Tier Architecture

## 1. Presentation Layer

Responsible for the user interface.

### Technologies

- React.js
- Tailwind CSS
- React Router
- Axios

### Responsibilities

- Display UI
- Form validation
- API requests
- Route navigation
- State management
- User interaction

---

## 2. Application Layer

Responsible for processing business logic.

### Technologies

- Node.js
- Express.js

### Responsibilities

- Authentication
- Authorization
- Request validation
- Business logic
- API responses
- Error handling

---

## 3. Data Layer

Responsible for storing and retrieving data.

### Technologies

- MongoDB Atlas
- Mongoose
- Cloudinary

### Responsibilities

- Store application data
- Store image URLs
- Data validation
- Indexing
- Query optimization

---

# Complete Request Flow

Every request follows the same processing pipeline.

```text
User
 │
 ▼
React Component
 │
 ▼
Axios API Request
 │
 ▼
Express Route
 │
 ▼
Authentication Middleware
 │
 ▼
Authorization Middleware
 │
 ▼
Validation Middleware
 │
 ▼
Controller
 │
 ▼
Service Layer
 │
 ▼
Mongoose Model
 │
 ▼
MongoDB
 │
 ▼
JSON Response
 │
 ▼
React UI Update
```

---

# Backend Architecture

The backend follows the **Modular MVC + Service Layer** architecture.

```text
Request
 │
 ▼
Routes
 │
 ▼
Middlewares
 │
 ▼
Controllers
 │
 ▼
Services
 │
 ▼
Models
 │
 ▼
MongoDB
```

---

# Layer Responsibilities

## Routes

Routes define API endpoints and apply middleware.

### Example

```text
POST /api/tournaments
GET  /api/tournaments
PUT  /api/tournaments/:id
DELETE /api/tournaments/:id
```

Responsibilities:

- API endpoint definition
- Middleware registration
- Controller mapping

---

## Controllers

Controllers receive requests and return responses.

Responsibilities:

- Read request data
- Call service methods
- Return standardized responses

Controllers should **not contain business logic**.

---

## Service Layer

The Service Layer contains all business logic.

Example responsibilities:

- Tournament creation
- Team registration
- Match scheduling
- Bracket generation
- Leaderboard calculation

Benefits:

- Reusable logic
- Easier testing
- Thin controllers
- Better maintainability

---

## Models

Models interact directly with MongoDB.

Responsibilities:

- Database queries
- Schema validation
- Relationships
- Indexes

---

# Authentication Architecture

Authentication uses JWT with secure HTTP-only cookies.

```text
User Login
      │
      ▼
Validate Credentials
      │
      ▼
Generate JWT
      │
      ▼
Store Secure Cookie
      │
      ▼
Future API Requests
      │
      ▼
JWT Middleware
      │
      ▼
Authenticated User
```

---

# Authorization Flow

Authorization is based on Role-Based Access Control (RBAC) and ownership validation.

```text
Authenticated User
       │
       ▼
Check User Role
       │
       ▼
Check Resource Ownership
       │
       ▼
Access Granted / Denied
```

---

# Image Upload Architecture

Images are stored in Cloudinary instead of MongoDB.

```text
React
 │
 ▼
Image Selection
 │
 ▼
FormData
 │
 ▼
Express
 │
 ▼
Multer
 │
 ▼
Cloudinary
 │
 ▼
Image URL
 │
 ▼
MongoDB
```

Only the Cloudinary URL is stored in the database.

---

# Error Handling Architecture

A centralized error handler processes all application errors.

```text
API Request
      │
      ▼
Application Error
      │
      ▼
Global Error Middleware
      │
      ▼
Standard JSON Response
```

Example:

```json
{
    "success": false,
    "message": "Tournament not found"
}
```

---

# Frontend Architecture

The frontend follows a **feature-based structure**.

```text
src/
│
├── app/
├── assets/
├── components/
├── context/
├── features/
│   ├── auth/
│   ├── teams/
│   ├── tournaments/
│   ├── matches/
│   ├── dashboard/
│   └── notifications/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
└── App.jsx
```

Benefits:

- Better scalability
- Easier maintenance
- Feature isolation
- Reusable components

---

# Backend Architecture

```text
server/
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── jobs/
│   ├── uploads/
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env
```

Each directory has a single responsibility, following the **Single Responsibility Principle (SRP)**.

---

# Deployment Architecture

The application will be deployed across multiple cloud services.

```text
                    User
                      │
                      ▼
             Vercel (Frontend)
                      │
                 HTTPS Requests
                      │
                      ▼
             Render (Backend)
                │           │
                ▼           ▼
        MongoDB Atlas   Cloudinary
```

---

# Security Architecture

Security measures include:

- JWT Authentication
- HTTP-only Cookies
- bcrypt Password Hashing
- Role-Based Access Control (RBAC)
- Ownership Validation
- Input Validation
- Helmet
- CORS
- Environment Variables
- Centralized Error Handling

---

# Technology Responsibilities

| Technology | Responsibility |
|------------|----------------|
| React.js | User Interface |
| Tailwind CSS | Styling |
| React Router | Client-side Routing |
| Axios | API Communication |
| Node.js | JavaScript Runtime |
| Express.js | REST API Framework |
| MongoDB | Primary Database |
| Mongoose | Object Data Modeling |
| JWT | Authentication |
| bcrypt | Password Security |
| Cloudinary | Image Storage |
| Nodemailer | Email Services |
| Chart.js | Dashboard Charts |
| Vercel | Frontend Deployment |
| Render | Backend Deployment |

---

# Architecture Principles

The project follows these software engineering principles:

## Separation of Concerns (SoC)

Each layer performs only one responsibility.

---

## Single Responsibility Principle (SRP)

Each module has one clearly defined purpose.

---

## Don't Repeat Yourself (DRY)

Reusable services and utility functions prevent code duplication.

---

## Modular Design

Each feature is isolated and independently maintainable.

---

## RESTful API Design

APIs follow standard HTTP methods and REST conventions.

---

## Scalability

The architecture supports adding new features without major restructuring.

---

## Maintainability

Clean folder organization and reusable modules simplify long-term maintenance.

---

# Design Decisions

The following architectural decisions have been finalized:

- Three-Tier Architecture
- Modular MVC Backend
- Dedicated Service Layer
- Feature-Based Frontend Structure
- RESTful API Design
- JWT Authentication using Secure HTTP-only Cookies
- Role-Based Access Control (RBAC)
- Ownership-Based Authorization
- Cloudinary for Image Storage
- MongoDB Atlas as the Primary Database
- Centralized Error Handling
- Standardized API Responses
- Modular Folder Structure

---

# Summary

The Esports Tournament Management System follows a scalable, secure, and modular architecture designed using modern software engineering principles. By separating presentation, business logic, and data storage into independent layers, the application becomes easier to develop, maintain, test, and scale. This architecture also provides a strong foundation for future enhancements such as real-time updates, payment integration, and advanced tournament formats.
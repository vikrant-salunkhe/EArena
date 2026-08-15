# 09. Project Structure & Coding Standards

## Introduction

This document defines the official project structure, coding standards, naming conventions, and development guidelines for **EArena**.

The objective of this document is to ensure that the codebase remains clean, scalable, maintainable, and easy to understand as the project grows.

---

# Project Overview

Project Name

```text
EArena
```

Description

EArena is a full-stack Esports Tournament Management System that enables organizers to create and manage tournaments while allowing players and teams to register, compete, and track tournament progress through a modern web platform.

---

# Technology Stack

## Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Framer Motion
- React Hot Toast

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- Nodemailer

---

# Repository Structure

```text
EArena/

│
├── client/
│
├── server/
│
├── docs/
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# Frontend Structure

```text
client/

src/

├── api/
│
├── assets/
│
├── components/
│
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── cards/
│   ├── tables/
│   ├── modals/
│   └── ui/
│
├── features/
│
│   ├── auth/
│   ├── users/
│   ├── teams/
│   ├── tournaments/
│   ├── matches/
│   ├── notifications/
│   └── admin/
│
├── hooks/
│
├── layouts/
│
├── pages/
│
├── routes/
│
├── context/
│
├── services/
│
├── utils/
│
├── constants/
│
├── schemas/
│
├── styles/
│
├── App.jsx
└── main.jsx
```

---

# Backend Structure

```text
server/

src/

├── config/
│
├── controllers/
│
├── routes/
│
├── middleware/
│
├── models/
│
├── services/
│
├── validators/
│
├── utils/
│
├── constants/
│
├── uploads/
│
├── jobs/
│
├── database/
│
├── app.js
└── server.js
```

---

# Feature-Based Organization

Each major module should remain independent.

Example

```text
features/

auth/

team/

tournament/

match/

notification/

admin/
```

Each feature owns:

- API calls
- Components
- Hooks
- Validation
- Business logic

---

# Naming Conventions

## Files

Components

```text
TournamentCard.jsx

Navbar.jsx

LoginForm.jsx
```

Pages

```text
HomePage.jsx

LoginPage.jsx

DashboardPage.jsx
```

Hooks

```text
useAuth.js

useTournament.js

useTeams.js
```

Services

```text
authService.js

teamService.js

tournamentService.js
```

Utilities

```text
formatDate.js

generateBracket.js

uploadImage.js
```

---

# Folder Naming

Use lowercase.

```text
components

features

hooks

services

middleware

controllers
```

Never

```text
Components

Features

Hooks
```

---

# Variable Naming

Use camelCase.

```javascript
userProfile

teamMembers

currentTournament

registrationDeadline
```

Avoid

```javascript
user_profile

UserProfile

TEAMMEMBERS
```

---

# Component Naming

Use PascalCase.

```text
Navbar

Sidebar

TournamentCard

MatchTable
```

---

# Function Naming

Use descriptive camelCase.

```javascript
createTournament()

registerTeam()

generateBracket()

uploadAvatar()

calculateLeaderboard()
```

---

# API Naming

RESTful endpoints only.

Good

```text
GET /api/v1/tournaments

POST /api/v1/teams

PATCH /api/v1/users/profile
```

Avoid

```text
/getTournament

/createUser

/updateProfile
```

---

# Import Order

Maintain consistent import order.

```javascript
// React

// Third-party Libraries

// API

// Components

// Hooks

// Utilities

// Styles
```

Example

```javascript
import { useState } from "react";

import { Link } from "react-router-dom";

import Button from "../components/Button";

import useAuth from "../hooks/useAuth";

import "../styles/index.css";
```

---

# Component Guidelines

Each component should have a single responsibility.

Good

```text
TournamentCard

MatchCard

UserAvatar

NotificationItem
```

Avoid

```text
DashboardEverything.jsx
```

---

# Component Size

Recommended

- 50–150 lines

Acceptable

- Up to 250 lines

If larger, split into smaller components.

---

# State Management Rules

Use

- useState
- useReducer
- Context API
- TanStack Query

Avoid unnecessary global state.

---

# API Layer Rules

Never call Axios directly inside components.

Good

```text
Component

↓

Hook

↓

Service

↓

Axios
```

Bad

```text
Component

↓

Axios
```

---

# Validation Rules

Frontend

- React Hook Form
- Zod

Backend

- Zod / Express Validation Middleware

Validation must exist on both client and server.

---

# Error Handling

Every API should return

```json
{
    "success": false,
    "message": "Error message"
}
```

Never expose

- Stack traces
- Database errors
- Internal implementation details

---

# Authentication Rules

Use

- JWT
- HTTP-only Cookies

Never

- Store JWT in localStorage
- Store passwords
- Expose secrets

---

# Environment Variables

Never hardcode secrets.

Frontend

```text
VITE_API_URL

VITE_CLOUDINARY_CLOUD_NAME
```

Backend

```text
PORT

MONGODB_URI

JWT_SECRET

JWT_EXPIRES_IN

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

EMAIL_USER

EMAIL_PASSWORD
```

---

# CSS Guidelines

Prefer

- Tailwind CSS

Avoid

- Inline styles
- Excessive custom CSS

Reusable styling should become reusable components.

---

# Responsive Design Rules

Support

- Mobile
- Tablet
- Laptop
- Desktop

Use Tailwind responsive utilities.

Example

```text
sm:

md:

lg:

xl:

2xl:
```

---

# Git Workflow

Branches

```text
main

develop

feature/auth

feature/team

feature/tournament

feature/admin
```

---

# Commit Convention

```text
feat:

fix:

docs:

style:

refactor:

test:

chore:
```

Examples

```text
feat: implement team creation

fix: resolve login validation

docs: update API documentation

refactor: optimize tournament service
```

---

# Code Formatting

Use

- ESLint
- Prettier

Rules

- 2-space indentation
- Single quotes or project-wide consistent style
- Semicolons consistently
- No unused imports
- No unused variables

---

# Logging

Development

```javascript
console.log();
```

Production

- Remove unnecessary console logs.
- Log errors using centralized logging middleware.

---

# Comments

Write comments only when necessary.

Good

```javascript
// Generate next tournament round
```

Avoid

```javascript
// Increment i

i++;
```

---

# Security Guidelines

Always

- Validate input
- Sanitize data
- Verify ownership
- Check user roles
- Limit uploads
- Hash passwords
- Protect routes

Never trust client-side validation alone.

---

# Performance Guidelines

Frontend

- Lazy Loading
- Code Splitting
- Memoization
- Pagination
- Image Optimization

Backend

- Database Indexes
- Query Optimization
- Pagination
- Efficient Aggregation
- Caching (future)

---

# Documentation Standards

Every feature should include:

- Description
- API Endpoint
- Validation Rules
- Business Rules
- Error Responses

Complex logic should include inline documentation where appropriate.

---

# Development Workflow

Follow this sequence for every feature:

```text
Requirement

↓

Database Model

↓

Validation Schema

↓

Backend API

↓

Frontend API Service

↓

UI Components

↓

Pages

↓

Testing

↓

Documentation Update

↓

Git Commit
```

---

# Project Development Order

The recommended implementation sequence for EArena is:

```text
1. Project Setup

2. Authentication

3. User Module

4. Team Module

5. Tournament Module

6. Registration Module

7. Match Module

8. Bracket Module

9. Leaderboard

10. Notifications

11. Dashboard

12. Admin Panel

13. Testing

14. Deployment
```

---

# Code Review Checklist

Before merging any feature, verify:

- Code follows project structure.
- Naming conventions are respected.
- Validation is implemented.
- Error handling is complete.
- API responses are consistent.
- Responsive design is tested.
- Unused code is removed.
- Documentation is updated.

---

# Best Practices

- Follow the Single Responsibility Principle (SRP).
- Prefer reusable components over duplication.
- Keep business logic out of UI components.
- Keep controllers thin and move complex logic into services.
- Use constants instead of hardcoded values.
- Write meaningful commit messages.
- Test features before merging.
- Keep functions small and focused.
- Maintain consistent folder organization.
- Update documentation whenever architecture or APIs change.

---

# Summary

This document serves as the official development handbook for **EArena**. By following the defined project structure, naming conventions, coding standards, Git workflow, and best practices, the project will remain organized, scalable, and easy to maintain. Adhering to these guidelines ensures consistent development across the frontend and backend, reduces technical debt, and provides a strong foundation for future enhancements and collaboration.
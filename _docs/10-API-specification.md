# 07. API Specification

## Introduction

### Purpose

This document defines the complete REST API specification for the **Esports Tournament Management System**. It serves as the communication contract between the React frontend and the Express backend.

The API specification ensures:

- Consistent API design
- Standard request and response formats
- Proper authentication and authorization
- Predictable error handling
- Easier frontend-backend integration
- Better maintainability

---

# API Overview

The backend exposes RESTful APIs that allow clients to perform CRUD operations on users, teams, tournaments, registrations, matches, notifications, and administrative resources.

The API follows REST principles:

- Resource-based URLs
- Proper HTTP methods
- Stateless communication
- JSON request/response bodies
- Standard HTTP status codes
- Versioned endpoints

---

# Base URL

Development

```text
http://localhost:5000/api/v1
```

Production

```text
https://api.esports.example.com/api/v1
```

Every endpoint in this document assumes the following prefix:

```text
/api/v1
```

---

# API Versioning

API versioning is implemented using the URL.

Example

```text
/api/v1/auth/login
/api/v1/tournaments
/api/v1/teams
```

Future versions can coexist without breaking existing clients.

Example

```text
/api/v2/tournaments
```

---

# Content Type

All requests and responses use JSON unless otherwise specified.

Request Header

```http
Content-Type: application/json
Accept: application/json
```

For file uploads:

```http
Content-Type: multipart/form-data
```

---

# Authentication

The application uses **JWT Authentication** stored in **HTTP-only Cookies**.

Authentication flow:

```text
User Login
      │
      ▼
JWT Generated
      │
      ▼
Stored in HTTP-only Cookie
      │
      ▼
Browser sends Cookie automatically
      │
      ▼
Backend verifies JWT
      │
      ▼
Access Granted
```

Advantages:

- Better security
- No localStorage token exposure
- CSRF protection (with proper configuration)
- Automatic browser cookie handling

---

# Authorization

Authorization is implemented using **Role-Based Access Control (RBAC)**.

Supported roles:

| Role | Description |
|------|-------------|
| Guest | Unauthenticated visitor |
| Player | Registered player |
| Organizer | Tournament organizer |
| Admin | System administrator |

---

# HTTP Methods

The API follows standard REST conventions.

| Method | Purpose |
|---------|----------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace a resource |
| PATCH | Partially update a resource |
| DELETE | Remove a resource |

---

# Standard Request Headers

Authenticated requests should include:

```http
Content-Type: application/json
Accept: application/json
Cookie: accessToken=<JWT_TOKEN>
```

---

# Standard Success Response

Every successful response follows the same structure.

```json
{
    "success": true,
    "message": "Operation completed successfully.",
    "data": {}
}
```

---

# Success Response Fields

| Field | Description |
|--------|-------------|
| success | Indicates whether the request succeeded |
| message | Human-readable message |
| data | Requested or created resource |

---

# Standard Error Response

All failed requests follow this structure.

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": []
}
```

---

# Validation Error Example

```json
{
    "success": false,
    "message": "Validation failed.",
    "errors": [
        {
            "field": "email",
            "message": "Email is required."
        },
        {
            "field": "password",
            "message": "Password must contain at least 8 characters."
        }
    ]
}
```

---

# HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 500 | Internal Server Error |

---

# Pagination Standard

Collection APIs support pagination.

Example

```http
GET /tournaments?page=1&limit=10
```

Response

```json
{
    "success": true,
    "data": {
        "items": [],
        "pagination": {
            "page": 1,
            "limit": 10,
            "totalPages": 8,
            "totalItems": 73
        }
    }
}
```

---

# Sorting

Supported using the **sort** query parameter.

Example

```http
GET /tournaments?sort=startDate
```

Descending

```http
GET /tournaments?sort=-createdAt
```

---

# Searching

Resources can be searched using:

```http
GET /teams?search=phoenix
```

---

# Filtering

Example

```http
GET /tournaments?game=BGMI&status=UPCOMING
```

---

# API Naming Conventions

Resources use plural nouns.

Correct

```text
/users
/teams
/tournaments
/matches
```

Avoid

```text
/getUsers
/createTournament
/deleteMatch
```

---

# Authentication APIs

Authentication endpoints handle user registration, login, logout, password management, and session validation.

Base URL

```text
/api/v1/auth
```

---

# Register User

### Endpoint

```http
POST /api/v1/auth/register
```

### Description

Creates a new user account.

### Authentication

Not Required

### Authorized Roles

Guest

### Request Body

```json
{
    "name": "Vikrant Salunkhe",
    "email": "vikrant@example.com",
    "password": "Password@123",
    "role": "PLAYER"
}
```

### Validation Rules

- Name is required
- Email is required
- Email must be unique
- Password must be at least 8 characters
- Password must contain uppercase, lowercase, number, and special character
- Role must be valid

### Success Response

```json
{
    "success": true,
    "message": "Account created successfully.",
    "data": {
        "id": "665ad71d93b",
        "name": "Vikrant Salunkhe",
        "email": "vikrant@example.com",
        "role": "PLAYER"
    }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Invalid Request|
|409|Email Already Exists|
|422|Validation Failed|

### Business Rules

- Email must be unique.
- Password is hashed before storage.
- Default account status is Active.

---

# Login

### Endpoint

```http
POST /api/v1/auth/login
```

### Description

Authenticates a user and issues a JWT.

### Authentication

Not Required

### Request Body

```json
{
    "email": "vikrant@example.com",
    "password": "Password@123"
}
```

### Validation Rules

- Email required
- Password required

### Success Response

```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "user": {
            "id": "665ad71d93b",
            "name": "Vikrant Salunkhe",
            "role": "PLAYER"
        }
    }
}
```

### Cookies

```text
accessToken=<JWT>
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Missing Credentials|
|401|Invalid Email or Password|

### Business Rules

- JWT is stored in an HTTP-only cookie.
- Cookie expiration is configurable.
- Login activity may be logged for auditing.

---

# Logout

### Endpoint

```http
POST /api/v1/auth/logout
```

### Description

Logs out the current user.

### Authentication

Required

### Authorized Roles

- Player
- Organizer
- Admin

### Success Response

```json
{
    "success": true,
    "message": "Logged out successfully."
}
```

### Business Rules

- Authentication cookie is cleared.
- JWT is invalidated if token blacklisting is implemented.

---

# Get Current User

### Endpoint

```http
GET /api/v1/auth/me
```

### Description

Returns the currently authenticated user's details.

### Authentication

Required

### Success Response

```json
{
    "success": true,
    "data": {
        "id": "665ad71d93b",
        "name": "Vikrant Salunkhe",
        "email": "vikrant@example.com",
        "role": "PLAYER",
        "avatar": "https://..."
    }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|401|Unauthorized|

---

# Change Password

### Endpoint

```http
PATCH /api/v1/auth/change-password
```

### Authentication

Required

### Request Body

```json
{
    "currentPassword": "OldPassword@123",
    "newPassword": "NewPassword@123"
}
```

### Validation Rules

- Current password required
- New password must satisfy password policy
- New password cannot match the current password

### Success Response

```json
{
    "success": true,
    "message": "Password updated successfully."
}
```

---

# Forgot Password

### Endpoint

```http
POST /api/v1/auth/forgot-password
```

### Description

Generates a password reset token and sends a reset email.

### Request Body

```json
{
    "email": "vikrant@example.com"
}
```

### Success Response

```json
{
    "success": true,
    "message": "Password reset instructions sent."
}
```

---

# Reset Password

### Endpoint

```http
POST /api/v1/auth/reset-password
```

### Request Body

```json
{
    "token": "<RESET_TOKEN>",
    "password": "NewPassword@123"
}
```

### Validation Rules

- Token must be valid
- Token must not be expired
- Password must satisfy password policy

### Success Response

```json
{
    "success": true,
    "message": "Password reset successfully."
}
```

---

# Summary

This section establishes the global API conventions and documents all authentication-related endpoints. It defines the request and response standards, authentication mechanism, authorization model, HTTP status codes, pagination, filtering, and validation rules that will be consistently followed across the remaining API specification.

---

---

# User APIs

## Overview

User APIs allow authenticated users to manage their personal profile, avatar, account settings, and account information.

Base URL

```text
/api/v1/users
```

Authentication Required: **Yes**

Accessible Roles:

- Player
- Organizer
- Admin

---

# Get User Profile

### Endpoint

```http
GET /api/v1/users/profile
```

### Description

Returns the complete profile information of the currently authenticated user.

### Authentication

Required

### Authorized Roles

- Player
- Organizer
- Admin

### Headers

```http
Cookie: accessToken=<JWT>
```

### Success Response

```json
{
    "success": true,
    "message": "Profile fetched successfully.",
    "data": {
        "_id": "665ad71d93b",
        "name": "Vikrant Salunkhe",
        "email": "vikrant@example.com",
        "role": "PLAYER",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "bio": "Competitive BGMI Player",
        "country": "India",
        "createdAt": "2026-07-01T12:00:00Z"
    }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|401|Unauthorized|
|404|User Not Found|

### Business Rules

- Returns only the logged-in user's profile.
- Password is never returned.
- Sensitive fields are excluded.

---

# Update Profile

### Endpoint

```http
PATCH /api/v1/users/profile
```

### Description

Updates editable user profile information.

### Authentication

Required

### Request Body

```json
{
    "name": "Vikrant Salunkhe",
    "bio": "Professional Esports Player",
    "country": "India"
}
```

### Validation Rules

- Name cannot be empty.
- Bio maximum 300 characters.
- Country must be valid.

### Success Response

```json
{
    "success": true,
    "message": "Profile updated successfully.",
    "data": {}
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Invalid Data|
|401|Unauthorized|
|422|Validation Failed|

### Business Rules

- Email cannot be changed from this endpoint.
- Role cannot be updated.

---

# Upload Avatar

### Endpoint

```http
PATCH /api/v1/users/avatar
```

### Description

Uploads or replaces the user's profile picture.

### Authentication

Required

### Headers

```http
Content-Type: multipart/form-data
```

### Request Body

```text
avatar : image file
```

### Validation Rules

- Only image files allowed.
- Maximum size: 5 MB.
- Supported formats:
  - JPG
  - JPEG
  - PNG
  - WEBP

### Success Response

```json
{
    "success": true,
    "message": "Avatar uploaded successfully.",
    "data": {
        "avatar": "https://cloudinary.com/avatar.jpg"
    }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Invalid File|
|413|File Too Large|
|415|Unsupported Media Type|

### Business Rules

- Previous avatar is removed from Cloudinary.
- Default avatar cannot be deleted.

---

# Delete Avatar

### Endpoint

```http
DELETE /api/v1/users/avatar
```

### Description

Removes the current avatar and restores the default profile image.

### Authentication

Required

### Success Response

```json
{
    "success": true,
    "message": "Avatar removed successfully."
}
```

---

# Team APIs

## Overview

Team APIs manage the creation, modification, membership, and administration of esports teams.

Base URL

```text
/api/v1/teams
```

---

# Create Team

### Endpoint

```http
POST /api/v1/teams
```

### Description

Creates a new esports team.

### Authentication

Required

### Authorized Roles

- Player

### Request Body

```json
{
    "name": "Team Phoenix",
    "tag": "TPX",
    "game": "BGMI",
    "description": "Professional BGMI Team"
}
```

### Validation Rules

- Team name required.
- Team name must be unique.
- Team tag maximum 5 characters.
- Game required.

### Success Response

```json
{
    "success": true,
    "message": "Team created successfully.",
    "data": {
        "_id": "66ab234",
        "name": "Team Phoenix"
    }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Invalid Request|
|409|Team Already Exists|

### Business Rules

- Creator automatically becomes Captain.
- Player can own only one team.
- Team starts with one member.

---

# Get All Teams

### Endpoint

```http
GET /api/v1/teams
```

### Description

Returns a paginated list of teams.

### Query Parameters

| Parameter | Description |
|------------|-------------|
|page|Current page|
|limit|Items per page|
|search|Search team|
|game|Filter by game|

Example

```http
GET /api/v1/teams?page=1&limit=10&game=BGMI
```

### Success Response

```json
{
    "success": true,
    "data": {
        "items": [],
        "pagination": {}
    }
}
```

---

# Get Team Details

### Endpoint

```http
GET /api/v1/teams/:teamId
```

### Description

Returns complete team information.

### URL Parameters

| Parameter | Description |
|------------|-------------|
|teamId|Team ID|

### Success Response

```json
{
    "success": true,
    "data": {
        "_id": "66ab234",
        "name": "Team Phoenix",
        "captain": {},
        "members": [],
        "game": "BGMI"
    }
}
```

---

# Update Team

### Endpoint

```http
PATCH /api/v1/teams/:teamId
```

### Description

Updates team information.

### Authentication

Required

### Authorized Roles

- Team Captain
- Admin

### Request Body

```json
{
    "description": "Updated Description",
    "logo": "https://..."
}
```

### Business Rules

- Only Captain or Admin can update.
- Team name remains unique.

---

# Delete Team

### Endpoint

```http
DELETE /api/v1/teams/:teamId
```

### Description

Deletes a team.

### Authorized Roles

- Team Captain
- Admin

### Business Rules

- Tournament registrations must be removed first.
- Team logo deleted from Cloudinary.
- Team cannot be deleted while participating in an active tournament.

---

# Join Team

### Endpoint

```http
POST /api/v1/teams/:teamId/join
```

### Description

Sends a request to join a team.

### Authentication

Required

### Success Response

```json
{
    "success": true,
    "message": "Join request sent successfully."
}
```

### Business Rules

- Player cannot join multiple teams.
- Duplicate requests are not allowed.

---

# Leave Team

### Endpoint

```http
POST /api/v1/teams/:teamId/leave
```

### Description

Leaves the current team.

### Business Rules

- Captain cannot leave until captaincy is transferred.
- Team must always have one captain.

---

# Transfer Captain

### Endpoint

```http
PATCH /api/v1/teams/:teamId/captain
```

### Description

Transfers captain role to another team member.

### Request Body

```json
{
    "newCaptainId": "665ab234"
}
```

### Business Rules

- New captain must already belong to the team.
- Current captain loses captain privileges.

---

# Remove Team Member

### Endpoint

```http
DELETE /api/v1/teams/:teamId/members/:userId
```

### Description

Removes a member from the team.

### Authorized Roles

- Captain
- Admin

### Business Rules

- Captain cannot remove themselves.
- Removed player becomes teamless.
- Tournament eligibility may change.

---

# Upload Team Logo

### Endpoint

```http
PATCH /api/v1/teams/:teamId/logo
```

### Description

Uploads or updates the team's logo.

### Headers

```http
Content-Type: multipart/form-data
```

### Validation Rules

- Image only
- Maximum 5 MB
- JPG, PNG, WEBP

### Business Rules

- Previous logo removed from Cloudinary.
- Only Captain or Admin.

---

# Team Dashboard

### Endpoint

```http
GET /api/v1/teams/:teamId/dashboard
```

### Description

Returns team statistics.

### Response

```json
{
    "success": true,
    "data": {
        "members": 5,
        "tournamentsPlayed": 18,
        "wins": 11,
        "losses": 7,
        "winRate": 61.1
    }
}
```

---

# Summary

This section defines all **User** and **Team** APIs used by the Esports Tournament Management System. It covers profile management, avatar handling, team creation, team administration, membership management, logo uploads, and team statistics while enforcing authentication, authorization, validation, and business rules consistently across all endpoints.

---

---

# Tournament APIs

## Overview

Tournament APIs manage the complete lifecycle of an esports tournament, including creation, publishing, registration, scheduling, and completion.

Base URL

```text
/api/v1/tournaments
```

Authentication Required: **Yes (Except Public Endpoints)**

Authorized Roles:

- Organizer
- Admin

Public users can view tournaments but cannot modify them.

---

# Create Tournament

### Endpoint

```http
POST /api/v1/tournaments
```

### Description

Creates a new tournament.

### Authentication

Required

### Authorized Roles

- Organizer
- Admin

### Headers

```http
Content-Type: application/json
Cookie: accessToken=<JWT>
```

### Request Body

```json
{
  "title": "BGMI Championship 2026",
  "game": "BGMI",
  "format": "Single Elimination",
  "maxTeams": 32,
  "entryFee": 0,
  "prizePool": 100000,
  "registrationDeadline": "2026-08-15",
  "startDate": "2026-08-20",
  "rules": "Standard BGMI Tournament Rules"
}
```

### Validation Rules

- Title is required.
- Tournament title must be unique for the organizer.
- Game is required.
- Supported formats only.
- Max teams must be greater than 1.
- Registration deadline must be before the start date.
- Prize pool cannot be negative.

### Success Response

```json
{
  "success": true,
  "message": "Tournament created successfully.",
  "data": {
    "_id": "665abc123",
    "status": "DRAFT"
  }
}
```

### Possible Errors

| Status | Reason |
|---------|--------|
|400|Invalid Request|
|401|Unauthorized|
|403|Forbidden|
|409|Tournament Already Exists|
|422|Validation Failed|

### Business Rules

- Creator automatically becomes the organizer.
- Tournament starts in **DRAFT** status.
- Registrations remain closed until published.

---

# Get All Tournaments

### Endpoint

```http
GET /api/v1/tournaments
```

### Description

Returns a paginated list of tournaments.

### Query Parameters

| Parameter | Description |
|-----------|-------------|
|page|Current page|
|limit|Items per page|
|search|Search by title|
|game|Filter by game|
|status|Upcoming / Live / Completed|
|sort|Sort field|

Example

```http
GET /api/v1/tournaments?page=1&limit=10&game=BGMI&status=UPCOMING
```

### Success Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {}
  }
}
```

---

# Get Tournament Details

### Endpoint

```http
GET /api/v1/tournaments/:tournamentId
```

### Description

Returns detailed tournament information.

### URL Parameters

| Parameter | Description |
|-----------|-------------|
|tournamentId|Tournament ID|

### Success Response

```json
{
  "success": true,
  "data": {
    "title": "BGMI Championship",
    "game": "BGMI",
    "format": "Single Elimination",
    "status": "UPCOMING",
    "registeredTeams": 16
  }
}
```

---

# Update Tournament

### Endpoint

```http
PATCH /api/v1/tournaments/:tournamentId
```

### Description

Updates tournament information.

### Authorized Roles

- Organizer (Owner)
- Admin

### Business Rules

- Tournament cannot be edited after it starts.
- Organizer can update only their own tournaments.

---

# Delete Tournament

### Endpoint

```http
DELETE /api/v1/tournaments/:tournamentId
```

### Business Rules

- Only Draft or Cancelled tournaments can be deleted.
- Active tournaments cannot be removed.

---

# Publish Tournament

### Endpoint

```http
PATCH /api/v1/tournaments/:tournamentId/publish
```

### Description

Publishes a tournament and opens registrations.

### Business Rules

- Tournament must contain all required information.
- Status changes from **DRAFT** → **UPCOMING**.

---

# Start Tournament

### Endpoint

```http
PATCH /api/v1/tournaments/:tournamentId/start
```

### Description

Starts the tournament.

### Business Rules

- Registration must be closed.
- Minimum required teams must be registered.
- Automatically generates the bracket.
- Status changes to **LIVE**.

---

# End Tournament

### Endpoint

```http
PATCH /api/v1/tournaments/:tournamentId/end
```

### Business Rules

- All matches must be completed.
- Status changes to **COMPLETED**.

---

# Upload Tournament Banner

### Endpoint

```http
PATCH /api/v1/tournaments/:tournamentId/banner
```

### Headers

```http
Content-Type: multipart/form-data
```

### Validation Rules

- JPG
- PNG
- WEBP
- Maximum 10 MB

---

# Tournament Registration APIs

Base URL

```text
/api/v1/registrations
```

---

# Register Team

### Endpoint

```http
POST /api/v1/registrations
```

### Description

Registers a team for a tournament.

### Request Body

```json
{
  "teamId": "665abc",
  "tournamentId": "998xyz"
}
```

### Business Rules

- Registration deadline must not have passed.
- Team cannot register twice.
- Team members must satisfy tournament rules.

### Success Response

```json
{
  "success": true,
  "message": "Registration successful."
}
```

---

# Get Registrations

### Endpoint

```http
GET /api/v1/registrations
```

### Query Parameters

- tournamentId
- teamId
- page
- limit

---

# Cancel Registration

### Endpoint

```http
DELETE /api/v1/registrations/:registrationId
```

### Business Rules

- Registration can only be cancelled before the deadline.
- Organizer can remove any registration.

---

# Match APIs

Base URL

```text
/api/v1/matches
```

---

# Get Matches

### Endpoint

```http
GET /api/v1/matches
```

### Query Parameters

- tournamentId
- round
- status
- page
- limit

---

# Get Match Details

### Endpoint

```http
GET /api/v1/matches/:matchId
```

### Description

Returns complete match details.

---

# Update Match

### Endpoint

```http
PATCH /api/v1/matches/:matchId
```

### Authorized Roles

- Organizer
- Admin

### Request Body

```json
{
  "scheduledAt": "2026-08-20T15:00:00Z",
  "map": "Erangel"
}
```

---

# Submit Match Result

### Endpoint

```http
PATCH /api/v1/matches/:matchId/result
```

### Request Body

```json
{
  "winner": "665team1",
  "scoreA": 2,
  "scoreB": 1
}
```

### Validation Rules

- Winner must be one of the participating teams.
- Scores cannot be negative.

### Business Rules

- Match status changes to **COMPLETED**.
- Winner advances automatically.
- Bracket updates automatically.

---

# Bracket APIs

Base URL

```text
/api/v1/brackets
```

---

# Get Tournament Bracket

### Endpoint

```http
GET /api/v1/brackets/:tournamentId
```

### Description

Returns the generated tournament bracket.

### Success Response

```json
{
  "success": true,
  "data": {
    "rounds": []
  }
}
```

---

# Regenerate Bracket

### Endpoint

```http
POST /api/v1/brackets/:tournamentId/regenerate
```

### Authorized Roles

- Organizer
- Admin

### Business Rules

- Only allowed before the tournament starts.
- Existing bracket is replaced.

---

# Leaderboard APIs

Base URL

```text
/api/v1/leaderboards
```

---

# Get Tournament Leaderboard

### Endpoint

```http
GET /api/v1/leaderboards/:tournamentId
```

### Description

Returns tournament standings.

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "team": "Team Phoenix",
      "wins": 6,
      "losses": 0
    }
  ]
}
```

### Business Rules

- Rankings are generated dynamically from match results.
- Completed matches only are considered.

---

# Tournament Dashboard

### Endpoint

```http
GET /api/v1/tournaments/:tournamentId/dashboard
```

### Description

Returns organizer dashboard statistics.

### Success Response

```json
{
  "success": true,
  "data": {
    "registeredTeams": 32,
    "completedMatches": 28,
    "pendingMatches": 4,
    "completion": 87.5
  }
}
```

---

# Summary

This section defines all APIs related to tournaments, registrations, matches, brackets, and leaderboards. It covers the complete tournament lifecycle—from creation and publishing to team registration, bracket generation, match result submission, and leaderboard calculation—while enforcing authentication, authorization, validation, and business rules consistently.

---

---

# Notification APIs

## Overview

Notification APIs allow the system to deliver important updates to users such as tournament invitations, registration confirmations, match schedules, results, and announcements.

Base URL

```text
/api/v1/notifications
```

Authentication Required: **Yes**

Authorized Roles

- Player
- Organizer
- Admin

---

# Get Notifications

### Endpoint

```http
GET /api/v1/notifications
```

### Description

Returns all notifications for the authenticated user.

### Query Parameters

| Parameter | Description |
|-----------|-------------|
| page | Current page |
| limit | Items per page |
| unread | true / false |

Example

```http
GET /api/v1/notifications?page=1&limit=20&unread=true
```

### Success Response

```json
{
    "success": true,
    "data": {
        "items": [
            {
                "_id": "665abc",
                "title": "Registration Approved",
                "message": "Your team has been registered successfully.",
                "type": "REGISTRATION",
                "isRead": false,
                "createdAt": "2026-08-15T10:00:00Z"
            }
        ]
    }
}
```

---

# Mark Notification as Read

### Endpoint

```http
PATCH /api/v1/notifications/:notificationId/read
```

### Description

Marks a single notification as read.

### URL Parameters

| Parameter | Description |
|-----------|-------------|
| notificationId | Notification ID |

### Success Response

```json
{
    "success": true,
    "message": "Notification marked as read."
}
```

---

# Mark All Notifications as Read

### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

### Description

Marks every notification of the current user as read.

### Success Response

```json
{
    "success": true,
    "message": "All notifications marked as read."
}
```

---

# Delete Notification

### Endpoint

```http
DELETE /api/v1/notifications/:notificationId
```

### Description

Deletes a notification.

### Business Rules

- Users can delete only their own notifications.
- Admin can delete any notification if required.

---

# Dashboard APIs

## Overview

Dashboard APIs provide summary statistics and recent activity for different user roles.

Base URL

```text
/api/v1/dashboard
```

---

# Player Dashboard

### Endpoint

```http
GET /api/v1/dashboard/player
```

### Description

Returns player-specific dashboard information.

### Success Response

```json
{
    "success": true,
    "data": {
        "teams": 1,
        "registeredTournaments": 6,
        "upcomingMatches": 2,
        "notifications": 5
    }
}
```

---

# Organizer Dashboard

### Endpoint

```http
GET /api/v1/dashboard/organizer
```

### Description

Returns organizer statistics.

### Success Response

```json
{
    "success": true,
    "data": {
        "tournaments": 4,
        "activeTournaments": 2,
        "registeredTeams": 76,
        "matchesPending": 8
    }
}
```

---

# Admin Dashboard

### Endpoint

```http
GET /api/v1/dashboard/admin
```

### Description

Returns system-wide statistics.

### Success Response

```json
{
    "success": true,
    "data": {
        "users": 1580,
        "teams": 322,
        "tournaments": 51,
        "activeTournaments": 7
    }
}
```

---

# Admin APIs

## Overview

Admin APIs are available only to system administrators.

Base URL

```text
/api/v1/admin
```

Authentication Required: **Yes**

Authorized Roles

- Admin

---

# Get All Users

### Endpoint

```http
GET /api/v1/admin/users
```

### Description

Returns all registered users.

### Query Parameters

- page
- limit
- role
- search

---

# Get User Details

### Endpoint

```http
GET /api/v1/admin/users/:userId
```

### Description

Returns complete information about a user.

---

# Update User Status

### Endpoint

```http
PATCH /api/v1/admin/users/:userId/status
```

### Request Body

```json
{
    "status": "ACTIVE"
}
```

Supported Status

- ACTIVE
- BLOCKED
- SUSPENDED

### Business Rules

- Blocked users cannot log in.
- Suspended users cannot participate in tournaments.

---

# Delete User

### Endpoint

```http
DELETE /api/v1/admin/users/:userId
```

### Business Rules

- Soft delete preferred.
- Admin cannot delete their own account.
- Users participating in active tournaments cannot be deleted.

---

# Get All Tournaments

### Endpoint

```http
GET /api/v1/admin/tournaments
```

### Description

Returns every tournament in the system.

---

# Delete Tournament

### Endpoint

```http
DELETE /api/v1/admin/tournaments/:tournamentId
```

### Description

Allows administrator to remove inappropriate or cancelled tournaments.

---

# Reports API

### Endpoint

```http
GET /api/v1/admin/reports
```

### Description

Returns system reports.

Examples

- Total Users
- Active Players
- Tournament Statistics
- Revenue (Future)
- Monthly Growth

---

# Search Standards

Most collection endpoints support searching.

Example

```http
GET /api/v1/teams?search=phoenix
```

```http
GET /api/v1/tournaments?search=bgmi
```

---

# Pagination Standards

Collection endpoints support pagination.

Example

```http
GET /api/v1/users?page=2&limit=20
```

Response

```json
{
    "pagination": {
        "page": 2,
        "limit": 20,
        "totalPages": 15,
        "totalItems": 287
    }
}
```

---

# Sorting Standards

Ascending

```http
GET /api/v1/tournaments?sort=startDate
```

Descending

```http
GET /api/v1/tournaments?sort=-createdAt
```

---

# Filtering Standards

Examples

```http
GET /api/v1/tournaments?game=BGMI
```

```http
GET /api/v1/tournaments?status=LIVE
```

```http
GET /api/v1/users?role=PLAYER
```

---

# File Upload Standards

Supported Resources

- User Avatar
- Team Logo
- Tournament Banner

Supported Formats

- JPG
- JPEG
- PNG
- WEBP

Maximum File Size

- Avatar : 5 MB
- Team Logo : 5 MB
- Banner : 10 MB

Storage

- Cloudinary

---

# Error Codes

| Status | Description |
|---------|-------------|
|200|Success|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|413|Payload Too Large|
|415|Unsupported Media Type|
|422|Validation Failed|
|429|Too Many Requests|
|500|Internal Server Error|

---

# Authorization Matrix

| API | Guest | Player | Organizer | Admin |
|-----|:-----:|:------:|:----------:|:-----:|
| Register | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ❌ | ❌ | ❌ |
| View Tournaments | ✅ | ✅ | ✅ | ✅ |
| Create Team | ❌ | ✅ | ❌ | ❌ |
| Update Team | ❌ | Captain | ❌ | ✅ |
| Create Tournament | ❌ | ❌ | ✅ | ✅ |
| Publish Tournament | ❌ | ❌ | ✅ | ✅ |
| Register Team | ❌ | ✅ | ❌ | ✅ |
| Submit Match Result | ❌ | ❌ | ✅ | ✅ |
| View Notifications | ❌ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |

---

# API Security Best Practices

The backend follows the following security practices:

- JWT Authentication using HTTP-only Cookies
- Password Hashing using bcrypt
- Role-Based Access Control (RBAC)
- Ownership Validation
- Input Validation using Zod
- Rate Limiting
- Helmet Security Headers
- CORS Configuration
- Secure File Upload Validation
- Environment Variables for Secrets
- Request Logging
- Error Logging
- Soft Delete for Critical Resources

---

# API Design Best Practices

The API follows these design principles:

- RESTful Resource Naming
- Versioned Endpoints (`/api/v1`)
- Consistent Response Format
- Standard HTTP Status Codes
- Stateless Requests
- JSON Communication
- Pagination for Collections
- Search and Filtering Support
- Partial Updates using `PATCH`
- Proper Validation
- Centralized Error Handling

---

# API Workflow

The overall request lifecycle is shown below.

```text
Client Request
      │
      ▼
Express Router
      │
      ▼
Authentication Middleware
      │
      ▼
Authorization Middleware
      │
      ▼
Request Validation
      │
      ▼
Controller
      │
      ▼
Service Layer
      │
      ▼
Database
      │
      ▼
Response Formatter
      │
      ▼
JSON Response
```

---

# Summary

This document defines the complete REST API specification for the **Esports Tournament Management System**. It establishes consistent standards for endpoint design, request and response formats, authentication, authorization, validation, pagination, filtering, file uploads, and error handling.

The APIs cover all major modules of the application, including authentication, user management, team management, tournaments, registrations, matches, brackets, leaderboards, notifications, dashboards, and administration. Following this specification ensures that the React frontend and Express backend communicate through a well-defined contract, making development, testing, and future maintenance more efficient.

---

# Conclusion

With the completion of this API Specification, the project planning phase is complete. The following documents now provide a comprehensive blueprint for development:

```text
docs/
├── 01-project-overview.md
├── 02-requirements.md
├── 03-system-design.md
├── 04-database-design.md
├── 05-backend-design.md
├── 06-frontend-design.md
├── 07-api-specification.md
├── 08-deployment.md
└── 09-development-roadmap.md
```

These documents define the architecture, database, backend, frontend, and API contract, providing a solid foundation for implementing the Esports Tournament Management System using the MERN stack.
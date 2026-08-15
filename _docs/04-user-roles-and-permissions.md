# User Roles & Permissions (RBAC)

## Introduction

The Esports Tournament Management System follows a **Role-Based Access Control (RBAC)** model to manage user permissions. Every authenticated user belongs to a single role, and each role has a predefined set of permissions.

In addition to role-based authorization, the system also uses **ownership-based authorization** to ensure users can only manage resources they own (unless they are administrators).

---

# Authentication vs Authorization

| Authentication | Authorization |
|---------------|---------------|
| Verifies the identity of a user | Determines what a user is allowed to do |
| Performed during login | Checked on every protected request |
| Uses JWT | Uses RBAC and ownership rules |

---

# User Model

The application uses a **single User collection** for all authenticated users.

## User Schema (Simplified)

```text
User
-----
_id
name
email
password
role
avatar
status
createdAt
updatedAt
```

## Available Roles

- `admin`
- `organizer`
- `player`

> **Note:** Team Captain is **not** a separate role. A captain is simply a player who owns a team.

---

# System Actors

## 1. Guest

Guest users are not authenticated.

### Permissions

- View Home Page
- Browse Tournaments
- Search Tournaments
- View Public Team Profiles
- View Tournament Details
- View Leaderboards
- Register
- Login

### Restrictions

- Cannot create teams
- Cannot join teams
- Cannot register for tournaments
- Cannot access dashboards

---

## 2. Player

Players are authenticated users.

### Permissions

- View Dashboard
- Edit Profile
- Upload Avatar
- Join Team
- Leave Team
- Accept Team Invitation
- Reject Team Invitation
- View Team Details
- Browse Tournaments
- View Match Schedule
- View Match Results
- View Leaderboards
- Receive Notifications

### Restrictions

- Cannot create tournaments
- Cannot approve registrations
- Cannot generate brackets
- Cannot manage other users

---

## 3. Team Captain

A Team Captain is a player who has created a team.

### Permissions

- Create Team
- Edit Own Team
- Delete Own Team
- Upload Team Logo
- Invite Players
- Remove Team Members
- Register Team for Tournament
- Cancel Tournament Registration
- View Team Statistics

### Restrictions

- Cannot manage other teams
- Cannot create tournaments
- Cannot approve tournament registrations
- Cannot generate brackets

---

## 4. Tournament Organizer

Organizers are responsible for managing tournaments.

### Permissions

- Access Organizer Dashboard
- Create Tournament
- Edit Own Tournament
- Delete Own Tournament
- Publish Tournament
- Close Registration
- Cancel Tournament
- Approve Team Registrations
- Reject Team Registrations
- Generate Tournament Brackets
- Schedule Matches
- Update Match Results
- Manage Tournament Leaderboards
- View Tournament Analytics
- Send Tournament Notifications

### Restrictions

- Cannot modify tournaments created by other organizers
- Cannot manage users
- Cannot access admin dashboard

---

## 5. Admin

Administrators have complete platform control.

### Permissions

- Access Admin Dashboard
- View All Users
- Search Users
- Suspend Users
- Activate Users
- Delete Users
- Manage Organizers
- Manage All Tournaments
- Manage Reports
- View Platform Analytics
- View All Teams
- Moderate Platform Content
- Access All Features

### Restrictions

- Cannot bypass authentication
- Cannot access deleted resources

---

# Ownership Rules

Role-based permissions alone are not sufficient. The system also enforces **ownership rules**.

---

## Team Ownership

Only the team captain can manage their team.

### Allowed

- Edit Team
- Delete Team
- Invite Members
- Remove Members
- Register Team

### Not Allowed

- Edit another team's information
- Remove members from another team
- Delete another team

---

## Tournament Ownership

Only the organizer who created a tournament can manage it.

### Allowed

- Edit Tournament
- Delete Tournament
- Publish Tournament
- Schedule Matches
- Update Results

### Not Allowed

- Modify another organizer's tournament

---

## Match Ownership

An organizer can only manage matches that belong to tournaments they created.

---

## Admin Override

Administrators have permission to access and manage all resources regardless of ownership.

---

# Authorization Flow

```text
Client Request
       │
       ▼
JWT Authentication Middleware
       │
       ▼
Verify JWT Token
       │
       ▼
Load User
       │
       ▼
Role Authorization
       │
       ▼
Ownership Validation
       │
       ▼
Business Logic
       │
       ▼
API Response
```

---

# Backend Authorization Strategy

## Authentication Middleware

Responsible for:

- Reading JWT token
- Verifying token
- Loading authenticated user
- Attaching user to request object

Example:

```javascript
authenticateUser()
```

---

## Role Authorization Middleware

Responsible for:

- Checking user role
- Allowing only permitted roles

Example:

```javascript
authorizeRoles("admin")
```

Multiple roles:

```javascript
authorizeRoles("admin", "organizer")
```

---

## Ownership Validation

Ownership checks will generally be performed inside the **service layer** because they depend on the specific resource being accessed.

Example:

```javascript
if (
    tournament.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
) {
    throw new ForbiddenError("Access denied.");
}
```

This ensures:

- Organizers manage only their tournaments
- Captains manage only their teams
- Admins retain full access

---

# Dashboard Access

| Dashboard | Accessible By |
|-----------|---------------|
| Admin Dashboard | Admin |
| Organizer Dashboard | Organizer |
| Captain Dashboard | Team Captain |
| Player Dashboard | Player |

> The Captain Dashboard is shown only when a player is the captain of at least one team. It is **not** a separate login role.

---

# Security Principles

The authorization system follows these principles:

- Least Privilege Access
- Role-Based Access Control (RBAC)
- Ownership-Based Authorization
- Secure JWT Authentication
- Protected API Endpoints
- Centralized Authorization Middleware

---

# Design Decisions

The following architectural decisions have been finalized for this project:

- A single **User** collection will be used.
- Available roles are **admin**, **organizer**, and **player**.
- Team Captain is treated as a responsibility, not a separate role.
- JWT will be used for authentication.
- RBAC will control access to protected resources.
- Ownership validation will prevent unauthorized modifications.
- Administrators will have full platform access.
- Organizers can manage only their own tournaments.
- Team Captains can manage only their own teams.

---

# Future Enhancements

The authorization system can be extended with:

- Fine-Grained Permissions
- Custom Roles
- Moderator Role
- Referee Role
- Tournament Staff Role
- Permission Groups
- Audit Logs
- Multi-Tenant Organization Support

---

# Summary

The Esports Tournament Management System implements a secure and scalable authorization model by combining **JWT Authentication**, **Role-Based Access Control (RBAC)**, and **Ownership-Based Authorization**. This approach provides strong security while keeping the architecture modular, maintainable, and aligned with industry best practices.
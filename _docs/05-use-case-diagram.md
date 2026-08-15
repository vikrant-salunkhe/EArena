# Use Case Diagram

## Introduction

A **Use Case Diagram** is a UML (Unified Modeling Language) diagram that illustrates the interactions between users (actors) and the Esports Tournament Management System. It helps identify the functionalities available to each type of user and serves as the foundation for designing APIs, database models, and application workflows.

---

# Purpose

The Use Case Diagram helps to:

- Identify all system actors.
- Define system functionalities.
- Understand user interactions.
- Establish system boundaries.
- Serve as the foundation for API and database design.

---

# System Actors

The Esports Tournament Management System has five primary actors:

| Actor | Description |
|--------|-------------|
| Guest | Unauthenticated user who can browse public information. |
| Player | Registered user who participates in tournaments and teams. |
| Team Captain | Player who owns and manages a team. |
| Tournament Organizer | User responsible for creating and managing tournaments. |
| Admin | Platform administrator with complete system access. |

---

# Guest Use Cases

A guest can access only public features.

### Available Use Cases

- Register
- Login
- Browse Tournaments
- Search Tournaments
- View Tournament Details
- View Team Profiles
- View Leaderboards

---

# Player Use Cases

Players can participate in tournaments and teams.

### Available Use Cases

- Manage Profile
- Join Team
- Leave Team
- Accept Team Invitation
- Reject Team Invitation
- View Team Details
- Browse Tournaments
- View Match Schedule
- View Match Results
- View Leaderboards
- View Notifications
- Access Player Dashboard

---

# Team Captain Use Cases

A Team Captain inherits all Player capabilities and can additionally manage a team.

### Available Use Cases

- Create Team
- Edit Team
- Delete Team
- Upload Team Logo
- Invite Players
- Remove Members
- Register Team for Tournament
- Cancel Tournament Registration
- View Team Statistics

---

# Tournament Organizer Use Cases

Organizers manage tournaments throughout their lifecycle.

### Available Use Cases

- Access Organizer Dashboard
- Create Tournament
- Edit Tournament
- Delete Tournament
- Publish Tournament
- Close Tournament Registration
- Cancel Tournament
- Approve Team Registration
- Reject Team Registration
- Generate Tournament Brackets
- Schedule Matches
- Update Match Results
- Update Tournament Leaderboard
- Send Tournament Notifications
- View Tournament Analytics

---

# Admin Use Cases

Administrators manage the entire platform.

### Available Use Cases

- Access Admin Dashboard
- Manage Users
- Manage Organizers
- Manage Tournaments
- Manage Teams
- Suspend Users
- Activate Users
- Delete Users
- View Reports
- View Platform Analytics
- Moderate Platform Content

---

# System Use Cases

Some operations are performed automatically by the system.

### Automatic Operations

- Validate JWT Token
- Validate Tournament Registration
- Generate Tournament Brackets
- Advance Winning Teams
- Update Leaderboards
- Send Notifications
- Upload Images to Cloudinary
- Store Match Results

---

# Use Case Relationships

## Authentication

Most protected features require successful authentication.

```text
Login
   │
   ▼
Generate JWT
   │
   ▼
Access Protected Features
```

---

## Tournament Registration

```text
Register Team
      │
      ├── Validate Team Eligibility
      ├── Check Registration Deadline
      └── Prevent Duplicate Registration
```

---

## Tournament Creation

```text
Create Tournament
        │
        ├── Validate Tournament Details
        ├── Upload Banner
        └── Save Tournament
```

---

## Match Result

```text
Update Match Result
        │
        ├── Determine Winner
        ├── Advance Winner
        └── Update Leaderboard
```

---

# Actor Relationships

The Team Captain is not a separate user role. It is a Player with additional responsibilities.

```text
Player
   ▲
   │
Team Captain
```

The Admin is modeled as an independent actor because it has platform-wide responsibilities beyond tournament management.

---

# High-Level Use Case Overview

```text
                           +--------------------------------------------------+
                           |      Esports Tournament Management System         |
                           +--------------------------------------------------+

 Guest
 ├── Register
 ├── Login
 ├── Browse Tournaments
 ├── Search Tournaments
 ├── View Tournament Details
 └── View Leaderboards


 Player
 ├── Manage Profile
 ├── Join Team
 ├── Accept Invitation
 ├── Reject Invitation
 ├── View Matches
 ├── View Notifications
 └── View Dashboard


 Team Captain
 ├── Create Team
 ├── Edit Team
 ├── Invite Players
 ├── Remove Members
 ├── Register Team
 └── Cancel Registration


 Tournament Organizer
 ├── Create Tournament
 ├── Edit Tournament
 ├── Publish Tournament
 ├── Manage Registrations
 ├── Generate Brackets
 ├── Schedule Matches
 ├── Update Results
 ├── Update Leaderboard
 └── View Analytics


 Admin
 ├── Manage Users
 ├── Manage Organizers
 ├── Manage Tournaments
 ├── Manage Teams
 ├── View Reports
 ├── Suspend Users
 └── Platform Analytics
```

---

# UML Use Case Diagram

```text
                               +------------------------------------------------------+
                               |       Esports Tournament Management System           |
                               |------------------------------------------------------|
                               |                                                      |
Guest ------------------------>| Register                                            |
Guest ------------------------>| Login                                               |
Guest ------------------------>| Browse Tournaments                                  |
Guest ------------------------>| Search Tournaments                                  |
Guest ------------------------>| View Tournament Details                             |
Guest ------------------------>| View Leaderboard                                    |
                               |                                                      |
Player ----------------------->| Manage Profile                                      |
Player ----------------------->| Join Team                                           |
Player ----------------------->| Leave Team                                          |
Player ----------------------->| Accept Team Invitation                              |
Player ----------------------->| Reject Team Invitation                              |
Player ----------------------->| View Matches                                        |
Player ----------------------->| View Notifications                                  |
                               |                                                      |
Captain ---------------------->| Create Team                                         |
Captain ---------------------->| Edit Team                                           |
Captain ---------------------->| Invite Players                                      |
Captain ---------------------->| Remove Members                                      |
Captain ---------------------->| Register Team                                       |
                               |                                                      |
Organizer -------------------->| Create Tournament                                   |
Organizer -------------------->| Manage Tournament                                   |
Organizer -------------------->| Approve Registrations                               |
Organizer -------------------->| Generate Brackets                                   |
Organizer -------------------->| Schedule Matches                                    |
Organizer -------------------->| Update Match Results                                |
Organizer -------------------->| Manage Leaderboard                                  |
                               |                                                      |
Admin ------------------------>| Manage Users                                        |
Admin ------------------------>| Manage Organizers                                   |
Admin ------------------------>| Manage Tournaments                                  |
Admin ------------------------>| View Reports                                        |
Admin ------------------------>| Platform Analytics                                  |
                               +------------------------------------------------------+
```

---

# Design Decisions

The following architectural decisions have been finalized:

- Five primary actors are supported:
  - Guest
  - Player
  - Team Captain
  - Tournament Organizer
  - Admin

- Team Captain is an extension of the Player role and is **not** stored as a separate user role.

- Authentication is mandatory for all protected use cases.

- Automatic system operations such as bracket generation and leaderboard updates are modeled as system use cases.

- Admin has unrestricted platform-level access, while Organizers and Team Captains are limited by ownership rules.

---

# Summary

The Use Case Diagram defines every interaction between users and the Esports Tournament Management System. It serves as the functional blueprint for the application and provides a clear understanding of how each actor interacts with the platform before moving to system architecture, database design, and API development.
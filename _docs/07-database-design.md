# Database Design

## Introduction

The Esports Tournament Management System uses **MongoDB** as its primary database and **Mongoose** as the Object Data Modeling (ODM) library.

Unlike relational databases, MongoDB stores data as **documents** inside **collections**. The database design focuses on scalability, efficient querying, reduced duplication, and clean relationships between entities.

This document defines:

- Database entities
- Collection design
- Relationships
- Embedding vs Referencing strategy
- Database optimization principles
- Future scalability considerations

---

# Database Design Goals

The database is designed to achieve the following objectives:

- Scalable architecture
- High performance
- Minimal data duplication
- Easy maintenance
- Efficient querying
- Simple relationship management
- Support for future feature expansion

---

# Database Technology

| Component | Technology |
|-----------|------------|
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Database Type | NoSQL Document Database |

---

# Core Collections

The MVP consists of the following collections:

| Collection | Purpose |
|------------|---------|
| Users | Stores all registered users |
| Teams | Stores esports teams |
| Tournaments | Stores tournament information |
| Registrations | Stores tournament registrations |
| Matches | Stores match schedules and results |
| Notifications | Stores in-app notifications |

---

# Entity Overview

## 1. Users

Stores information about every registered user.

Examples:

- Admin
- Organizer
- Player

---

## 2. Teams

Stores esports team information.

Each team has:

- Captain
- Members
- Logo
- Statistics

---

## 3. Tournaments

Stores tournament details created by organizers.

Examples:

- BGMI Championship
- Valorant Cup
- CS2 League

---

## 4. Registrations

Represents the registration of a team in a tournament.

This collection resolves the **many-to-many relationship** between Teams and Tournaments.

---

## 5. Matches

Stores tournament matches including:

- Participating teams
- Schedule
- Scores
- Winner
- Match status

---

## 6. Notifications

Stores notifications sent to users.

Examples:

- Team Invitation
- Registration Approved
- Match Scheduled
- Tournament Started

---

# Entity Relationships

## User → Team

Relationship:

```text
One User
      │
      │
      ├────────────► Can Captain One Team
      │
      └────────────► Can Be Member of One Team
```

Type:

- One-to-One (Captain)
- One-to-Many (Members)

Implementation:

- `captain` → ObjectId(User)
- `members[]` → Array<ObjectId(User)>

---

## Organizer → Tournament

Relationship

```text
Organizer

1

▼

Many Tournaments
```

Implementation:

```text
createdBy → ObjectId(User)
```

---

## Team ↔ Tournament

Relationship

```text
Many Teams

⇅

Many Tournaments
```

MongoDB Implementation

This relationship is resolved using the **Registrations** collection.

```text
Registration

teamId

tournamentId

status
```

---

## Tournament → Match

Relationship

```text
Tournament

1

▼

Many Matches
```

Implementation

```text
tournamentId → ObjectId(Tournament)
```

---

## Team → Match

Each match contains two participating teams.

```text
teamA

teamB
```

Both are references to the Team collection.

---

## User → Notification

Relationship

```text
One User

▼

Many Notifications
```

Implementation

```text
userId → ObjectId(User)
```

---

# High-Level ER Diagram

```text
                        +----------------------+
                        |        Users         |
                        +----------------------+
                        | _id                 |
                        | name                |
                        | email               |
                        | role                |
                        +----------------------+
                          ▲              ▲
                          │              │
                 captain  │              │ createdBy
                          │              │
                          │              │
                +----------------------+  │
                |        Teams         |  │
                +----------------------+  │
                | _id                 |  │
                | captain             |──┘
                | members[]           |
                | logo                |
                +----------------------+
                          │
                          │
                          ▼
               +-------------------------+
               |     Registrations       |
               +-------------------------+
               | teamId                  |
               | tournamentId            |
               | status                  |
               +-------------------------+
                          ▲
                          │
                          │
                +------------------------+
                |     Tournaments        |
                +------------------------+
                | _id                   |
                | createdBy             |
                | title                 |
                | game                  |
                +------------------------+
                          │
                          ▼
                 +----------------------+
                 |       Matches        |
                 +----------------------+
                 | tournamentId         |
                 | teamA               |
                 | teamB               |
                 | winner              |
                 | scoreA              |
                 | scoreB              |
                 +----------------------+

Users
   │
   ▼
+----------------------+
|   Notifications      |
+----------------------+
| userId               |
| title                |
| message              |
+----------------------+
```

---

# Embedding vs Referencing Strategy

MongoDB provides two ways to model relationships:

- Embedded Documents
- Referenced Documents

This project primarily uses **referencing** because entities are shared across multiple modules.

---

## Reference Relationships

| Source | Target | Reason |
|---------|--------|--------|
| Team | User | Users are shared across teams and modules |
| Tournament | Organizer (User) | Organizer information is reusable |
| Registration | Team | Team data changes independently |
| Registration | Tournament | Tournament data changes independently |
| Match | Tournament | Matches belong to tournaments |
| Match | Team | Teams participate in multiple matches |
| Notification | User | Notifications belong to users |

---

## Embedded Data

Small pieces of tightly coupled data may be embedded.

Examples:

- Team member roles (future)
- Tournament rules
- Match history summary (future)

Large or frequently updated data should remain in separate collections.

---

# Why No Separate Result Collection?

Each match already contains:

- Score
- Winner
- Match Status

Creating a separate **Results** collection would introduce unnecessary complexity.

Instead, match results are stored directly in the **Matches** collection.

Example:

```json
{
  "teamA": "...",
  "teamB": "...",
  "scoreA": 2,
  "scoreB": 1,
  "winner": "...",
  "status": "completed"
}
```

---

# Why No Leaderboard Collection?

Leaderboards can be generated from:

- Registrations
- Matches

Advantages:

- No duplicate data
- Always up-to-date
- Easier maintenance

If future performance requires it, leaderboard snapshots can be cached or stored separately.

---

# Data Flow

```text
User
 │
 ▼
Team
 │
 ▼
Tournament Registration
 │
 ▼
Tournament
 │
 ▼
Match Generation
 │
 ▼
Match Results
 │
 ▼
Leaderboard Calculation
```

---

# Database Design Principles

The database follows these principles:

- Normalize shared data using references.
- Avoid unnecessary duplication.
- Keep collections independent.
- Store only required information.
- Generate derived data instead of duplicating it.
- Design for future scalability.

---

# Future Database Enhancements

Future versions of the project may introduce additional collections such as:

| Collection | Purpose |
|------------|---------|
| MatchResults | Detailed per-round statistics |
| Payments | Tournament entry fee records |
| AuditLogs | User activity history |
| TournamentStaff | Referees and moderators |
| ChatMessages | Team communication |
| LiveMatchEvents | Real-time match updates |

---

# Design Decisions

The following database design decisions have been finalized:

- MongoDB Atlas will be the primary database.
- Mongoose will be used for schema modeling.
- Six core collections are sufficient for the MVP.
- Relationships will primarily use ObjectId references.
- Match results will be stored inside the Matches collection.
- Leaderboards will be calculated dynamically.
- The Registrations collection will resolve the many-to-many relationship between Teams and Tournaments.
- Database design prioritizes scalability, maintainability, and efficient querying.

---

# Summary

The database design provides a scalable foundation for the Esports Tournament Management System by using a small set of well-defined collections, reference-based relationships, and normalized data structures. This approach minimizes redundancy while allowing the application to efficiently support team management, tournament organization, registrations, match scheduling, notifications, and future feature expansion.

> **Note:** This document defines the overall database structure. The detailed schema design (fields, data types, validation rules, indexes, and Mongoose models) will be added in the next planning phase.

---

# MongoDB Collections & Schema Design

This section defines every MongoDB collection used in the project, along with its purpose, primary fields, relationships, validation rules, and indexing strategy.

---

# 1. Users Collection

## Purpose

Stores all registered users including Admins, Organizers, and Players.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| name | String | Yes | Full Name |
| username | String | Yes | Unique Username |
| email | String | Yes | Unique Email |
| password | String | Yes | Hashed Password |
| role | String (Enum) | Yes | admin, organizer, player |
| avatar | String | No | Cloudinary Image URL |
| bio | String | No | User Bio |
| status | String | Yes | active, suspended |
| createdAt | Date | Auto | Creation Timestamp |
| updatedAt | Date | Auto | Update Timestamp |

---

### Relationships

- One User can create many tournaments.
- One User can captain one team.
- One User can receive many notifications.
- One User may belong to one team.

---

### Indexes

```javascript
email: unique
username: unique
role
status
```

---

# 2. Teams Collection

## Purpose

Stores esports team information.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| name | String | Yes | Team Name |
| logo | String | No | Cloudinary URL |
| captain | ObjectId(User) | Yes | Team Captain |
| members | [ObjectId(User)] | Yes | Team Members |
| description | String | No | Team Description |
| createdAt | Date | Auto | Creation Timestamp |
| updatedAt | Date | Auto | Update Timestamp |

---

### Relationships

- One Team has one Captain.
- One Team has many Players.
- One Team can register for many tournaments.

---

### Indexes

```javascript
name
captain
```

---

# 3. Tournaments Collection

## Purpose

Stores tournament information.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| title | String | Yes | Tournament Name |
| game | String | Yes | Game Name |
| banner | String | No | Banner URL |
| description | String | No | Tournament Description |
| organizer | ObjectId(User) | Yes | Organizer |
| entryFee | Number | Yes | Tournament Fee |
| prizePool | Number | Yes | Prize Pool |
| teamSize | Number | Yes | Players per Team |
| maxTeams | Number | Yes | Maximum Teams |
| tournamentType | Enum | Yes | Single Elimination |
| registrationDeadline | Date | Yes | Registration End |
| startDate | Date | Yes | Tournament Start |
| status | Enum | Yes | Draft, Published, Ongoing, Completed, Cancelled |
| createdAt | Date | Auto | Creation Timestamp |
| updatedAt | Date | Auto | Update Timestamp |

---

### Relationships

- One Organizer creates many tournaments.
- One Tournament has many registrations.
- One Tournament has many matches.

---

### Indexes

```javascript
game
status
startDate
organizer
```

---

# 4. Registrations Collection

## Purpose

Stores team registrations for tournaments.

This collection resolves the many-to-many relationship between Teams and Tournaments.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| team | ObjectId(Team) | Yes | Registered Team |
| tournament | ObjectId(Tournament) | Yes | Tournament |
| status | Enum | Yes | Pending, Approved, Rejected |
| registeredAt | Date | Auto | Registration Time |

---

### Relationships

- One Team can register in many tournaments.
- One Tournament has many registered teams.

---

### Compound Index

```javascript
team + tournament (unique)
```

This prevents duplicate registrations.

---

# 5. Matches Collection

## Purpose

Stores every tournament match.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| tournament | ObjectId(Tournament) | Yes | Tournament |
| round | Number | Yes | Tournament Round |
| matchNumber | Number | Yes | Match Number |
| teamA | ObjectId(Team) | Yes | First Team |
| teamB | ObjectId(Team) | Yes | Second Team |
| scoreA | Number | No | Score |
| scoreB | Number | No | Score |
| winner | ObjectId(Team) | No | Winning Team |
| scheduledAt | Date | Yes | Match Time |
| status | Enum | Yes | Scheduled, Live, Completed |

---

### Relationships

- Belongs to one Tournament.
- References two Teams.
- Winner references Team.

---

### Indexes

```javascript
tournament
round
status
scheduledAt
```

---

# 6. Notifications Collection

## Purpose

Stores notifications for users.

## Schema

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| _id | ObjectId | Yes | Primary Key |
| user | ObjectId(User) | Yes | Recipient |
| title | String | Yes | Notification Title |
| message | String | Yes | Notification Message |
| type | Enum | Yes | Invitation, Match, Tournament |
| isRead | Boolean | Yes | Read Status |
| createdAt | Date | Auto | Timestamp |

---

### Relationships

- One User receives many notifications.

---

### Indexes

```javascript
user
isRead
createdAt
```

---

# Database Relationship Summary

| Collection | Relationship |
|------------|--------------|
| User → Team | One Captain, One Member |
| User → Tournament | One-to-Many |
| Team → Tournament | Many-to-Many (via Registration) |
| Tournament → Match | One-to-Many |
| Match → Team | Many-to-One |
| User → Notification | One-to-Many |

---

# Validation Rules

The database enforces the following validations:

## Users

- Email must be unique.
- Username must be unique.
- Password must be hashed.
- Role must be one of:
  - admin
  - organizer
  - player

---

## Teams

- Team name must be unique.
- Captain is required.
- Team must have at least one member.

---

## Tournaments

- Registration deadline must be before the start date.
- Prize pool cannot be negative.
- Entry fee cannot be negative.
- Max teams must be greater than zero.

---

## Registrations

- Duplicate registrations are not allowed.
- Team size must match tournament requirements.

---

## Matches

- Team A and Team B cannot be the same.
- Winner must be either Team A or Team B.
- Scores cannot be negative.

---

## Notifications

- User reference is required.
- Notification type must be valid.

---

# Final Database Statistics

| Item | Count |
|------|------:|
| Collections | 6 |
| Relationships | 8+ |
| Compound Indexes | 1 |
| Unique Indexes | 4 |
| Reference Fields | 10+ |
| Embedded Arrays | Members |

---

# Final Database Design

The database follows a **reference-first approach**, ensuring data consistency and scalability while avoiding unnecessary duplication. Relationships are modeled using ObjectId references, with embedding reserved only for tightly coupled, lightweight data.
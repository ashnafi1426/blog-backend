# BLOG_POST Project: Project README

## Description

This repository contains the codebase for the YourAppName, a modern social content platform designed to streamline user interaction, content creation, and engagement through posts, comments, claps, bookmarks, and topic-based organization.

**Goal:** To provide a comprehensive, secure, and user-friendly platform that handles user authentication, content management, social engagement, and personalized feeds, driving user retention and community growth.
**Technology Stack:** Built using a standard MERN-like stack architecture (PostgreSQL, Express, React, Node.js) to ensure scalability and developer familiarity.
**Key Features:** User profiles persistence, post and comment management, clap/bookmark/follow systems, topic organization, and role-based protected routes.

## Prerequisites

- Node.js
- React
- Git / Github
- PostgreSQL

## Getting Started

### Installation Steps

Clone the Repository:

`Bash`
git clone https://github.com/ashu_sela/BLOG_POST
Install Dependencies (frontend and backend):

`Bash`

### Install backend dependencies

cd backend
npm install

### Install frontend (Vite React app) dependencies

cd ../frontend
npm install
Configure Environment Variables (backend):
Create a file named .env in the backend/ directory.
Add the necessary configurations, including the PostgreSQL database connection string.

### .env file content

PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_app_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=YOUR_SECURE_JWT_SECRET

### (Add any external API keys here if needed)

Running the Application
Start the Backend (Server):
nodemon app.js

`Bash`
cd backend
nodemon app.js

### The server will run on http://localhost:5000 (or the port specified in .env)

Start the Frontend (Client):

`Bash`
cd ../frontend
npm run dev

### The client will open automatically in your terminal, typically at http://localhost:5173. Open it in your browser

### Contribution Guidelines

We welcome contributions! Please follow the standard development workflow:

1. **Sync your Repo**: Pull the latest changes from the main branch.
2. **Create a new branch**: Create a new branch with the same name as your task. Command to create a branch and switch to your new branch:
   git checkout -b <your-branch-name>3. **Work on Task**: Implement the changes or fixes related to your task.
3. **Commit Changes**: Once you've completed your work, commit your changes to the branch. Command to add and commit your changes:
git add .
git commit -m "Your commit message (e.g., feat: added clap counter to post)" make sure your commit message perfectly describes what you have done

5. **Push Changes**: Push the changes to your branch on the remote repository. Command to push your changes:
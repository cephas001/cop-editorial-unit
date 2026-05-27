# Chapel Editorial Unit Platform

## Overview

The Chapel Editorial Unit Platform is a centralized web-based application designed to foster collaboration and community among writers[cite: 3, 10]. It replaces fragmented communication with a dedicated space where team members can brainstorm, share suggestions, and collaboratively review articles. The platform features a highly intuitive, modern UI inspired by top-tier productivity tools.

## Core Features

- **Collaborative Editing:** Users can create articles, leave comments, and highlight specific areas within existing drafts to provide targeted feedback.
- **Brainstorming Hub:** Team members can create and participate in brainstorming sessions based on new ideas or active article drafts.
- **Task Management & Planning:** A visual writing calendar allows users to plan, schedule tasks, and set reminders.
- **Role-Based Access Control:** Distinct privileges are enforced for the unit head and assistant unit head, enabling them to assign topics, tasks, and brainstorming sessions to specific team members.
- **User Profiles:** Every user maintains a unique profile to track their writeups, assigned tasks, and comments.
- **Automated Notifications:** The system sends professionally styled emails to notify users of critical actions, assignments, and activities.

## Tech Stack

- **Frontend:** Nuxt.js (Vue 3) and Tailwind CSS for a responsive, minimalist, and accessible user interface (with full light/dark mode support).
- **Backend:** Express.js for handling specialized server-side logic and automated email dispatches.
- **Database & Authentication:** Supabase for secure profile management, role-based access, and real-time database syncing.
- **Rich-Text Editor:** Tiptap (Headless) for building the custom collaborative editing canvas.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm, yarn, or pnpm
- Supabase project credentials

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/editorial-unit-app.git](https://github.com/your-username/editorial-unit-app.git)
    cd editorial-unit-app
    ```
2.  Enter frontend folder:

    ```bash
    cd frontend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Enter backend folder:
    ```bash
    cd backend
    ```
6.  Install dependencies:
    ```bash
    npm install
    ```
7.  Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add your Supabase and backend API keys:
      ```env
      SUPABASE_URL=your_supabase_url
      SUPABASE_ANON_KEY=your_supabase_anon_key
      EXPRESS_BACKEND_URL=your_backend_url
      ```
8.  Start the development server:
    ```bash
    npm run dev
    ```

## Author

**Peter Okodugha**

# Chapel Editorial Unit Platform

## Overview

[cite_start]The Chapel Editorial Unit Platform is a centralized web-based application designed to foster collaboration and community among writers[cite: 3, 10]. [cite_start]It replaces fragmented communication with a dedicated space where team members can brainstorm, share suggestions, and collaboratively review articles[cite: 4]. [cite_start]The platform features a highly intuitive, modern UI inspired by top-tier productivity tools[cite: 20].

## Core Features

- [cite_start]**Collaborative Editing:** Users can create articles, leave comments, and highlight specific areas within existing drafts to provide targeted feedback[cite: 16].
- [cite_start]**Brainstorming Hub:** Team members can create and participate in brainstorming sessions based on new ideas or active article drafts[cite: 17].
- [cite_start]**Task Management & Planning:** A visual writing calendar allows users to plan, schedule tasks, and set reminders[cite: 19, 21].
- [cite_start]**Role-Based Access Control:** Distinct privileges are enforced for the unit head and assistant unit head, enabling them to assign topics, tasks, and brainstorming sessions to specific team members[cite: 8, 15].
- [cite_start]**User Profiles:** Every user maintains a unique profile to track their writeups, assigned tasks, and comments[cite: 6, 14].
- [cite_start]**Automated Notifications:** The system sends professionally styled emails to notify users of critical actions, assignments, and activities[cite: 18].

## Tech Stack

- [cite_start]**Frontend:** Nuxt.js (Vue 3) and Tailwind CSS for a responsive, minimalist, and accessible user interface (with full light/dark mode support)[cite: 10].
- [cite_start]**Backend:** Express.js for handling specialized server-side logic and automated email dispatches[cite: 10].
- [cite_start]**Database & Authentication:** Supabase for secure profile management, role-based access, and real-time database syncing[cite: 10].
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
    cd frontend

    ```

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
    cd backend
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

# 🌊 FocusFlow

![FocusFlow Hero Mockup](file:///E:/Projects/Projects/FocusFlow/public/image.png)

**FocusFlow** is a premium, high-performance focus and productivity application designed to help you reclaim your flow state. Built with **React 19**, **Vite**, and **Firebase**, it combines a sophisticated Pomodoro-inspired timer with robust task management and deep analytics.

---

## ✨ Key Features

-   **⏱️ Smart Flow Timer**: Fully customizable focus and break intervals with intelligent auto-start logic.
-   **📝 Integrated Task Management**: Organize your deep-work sessions around specific tasks with estimated "Pomodoro" targets.
-   **📊 Insightful Analytics**: Track your focus trends, daily goals, and session history with interactive visualizations powered by Recharts.
-   **🧘 Guided Breaks**: Access curated activities for short and long breaks to ensure optimal recovery and prevent burnout.
-   **☁️ Real-time Cloud Sync**: Secure Google Authentication and instant data synchronization across devices using Firebase Firestore.
-   **🎨 Premium UI/UX**: A stunning, responsive interface featuring dark mode, glassmorphism, and fluid animations with Framer Motion and Tailwind CSS 4.

---

## 🛠️ Tech Stack

-   **Frontend Framework**: [React 19](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Backend & Auth**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
-   **Data Visualization**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.0.0 or higher)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Arya14-coder/FocusFlow.git
    cd FocusFlow
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📖 Usage

1.  **Sign In**: Use your Google account to sync your tasks and sessions securely.
2.  **Set Goals**: Define your daily focus target in the **Settings** panel.
3.  **Focus**: Select a task, start the timer, and dive into your flow.
4.  **Analyze**: Visit the **Dashboard** to review your progress and maintain your streaks.

---

## 📁 Project Structure

```text
FocusFlow/
├── src/
│   ├── components/       # UI Components (Timer, Dashboard, Todo, etc.)
│   ├── FlowContext.jsx   # Global State Management (Timer logic, Firestore sync)
│   ├── firebase.js       # Firebase Configuration
│   ├── hooks/            # Custom React Hooks
│   ├── assets/           # Static Assets (Images, Icons)
│   └── index.css         # Global Styles & Tailwind Directives
├── firestore.rules       # Database Security Rules
├── firestore.indexes.json# Firestore Search Indexes
└── vite.config.js        # Vite Configuration
```




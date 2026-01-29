# Client - pupapers.com

The frontend application for **pupapers.com**, a comprehensive mock test and study platform for Panjab University Common Entrance Test (PU CET). Built with Next.js 16 and TypeScript, designed for performance, SEO, and a premium user experience.

## 🚀 Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: CSS Modules (Vanilla CSS for maximum control)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Authentication**: Custom JWT Auth (integrated with Server)

## 🛠️ Project Structure

*   **/src/app**: App Router pages and layouts.
    *   `/admin`: Secured admin dashboard for content management.
    *   `/dashboard`: User dashboard for progress tracking and history.
    *   `/mock-tests`: Quiz interface and listing.
*   **/src/components**: Reusable UI components.
*   **/src/middleware.ts**: Route protection and auth redirection.

## 📦 Installation & Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root of the `client` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5001/api
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🌟 Key Features

*   **Responsive Design**: Fully optimized for mobile and desktop.
*   **SEO Optimized**: Dynamic metadata, sitemap, and JSON-LD structured data.
*   **Interactive Quizzes**: Real-time feedback, timers, and result analysis.
*   **Leaderboard**: Global rankings for top performers.
*   **Admin Panel**: Full CRUD operations for Subjects, Chapters, and Questions.

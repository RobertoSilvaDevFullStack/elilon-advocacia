# Product Requirements Document (PRD)
## Elilon Lopes Advogados Web Platform

### 1. Product Overview
The Elilon Lopes Advogados web platform is a modern, full-stack legal services portal. It aims to showcase the law firm's legal expertise, highlight its professionals, provide engaging legal content through a blog, and capture potential client leads via specialized landing pages.

### 2. Architecture & Tech Stack
-   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router.
-   **Backend:** Node.js, Express.js.
-   **Database:** PostgreSQL (with Supabase for authentication and managed DB).
-   **Content Editor:** React-Quill (Rich Text) for Admin usage.

### 3. Core Features & User Workflows

#### 3.1 Public User Facing Features
-   **Home Page:** Introduction to the firm, highlighting core services and quick contact access.
-   **Practice Areas (/areas):** Detailed description of legal services offered (e.g., Civil, Labor, Tax, Corporate law).
-   **Professionals (/profissionais):** Roster of lawyers and partners with their credentials and specialized areas.
-   **Blog (/blog):** Read legal articles, news, and guides created by the firm to establish authority.
-   **Landing Pages:** Specialized marketing funnels for specific legal demands (e.g., /bpc, /imposto-de-renda) designed for lead generation.
-   **Contact (/contato):** Direct contact forms and WhatsApp redirection to interact with the firm.

#### 3.2 Admin Features (Protected Routes)
-   **Authentication:** Secure login for administrators using Supabase Auth.
-   **Content Management System (CMS):**
    -   Create, edit, and delete Blog Posts using a rich text editor.
    -   Manage Professionals (add new lawyers, edit profiles, remove ex-employees).
-   **Lead Management:** View and manage form submissions from the public site and landing pages.

### 4. Non-Functional Requirements
-   **Security:** Prevention against XSS (mitigated Quill dependencies), secure API endpoints with CORS configuration restricted to authorized origins.
-   **Performance:** Fast load times (< 2 seconds) on mobile, high Core Web Vitals, pre-compressed assets natively handled by Vite.
-   **SEO:** Server-side hints or optimized meta-tags for web crawlers.

### 5. Testing Requirements (For TestSprite)
Ensure that the core navigation, public-facing information display, and the lead capture workflows function correctly without breaking.
For the backend, API responses (especially for content fetching and authentication validation) must return correct status codes and payloads.

# PTP Reefer Department Website

This repository contains a reefer website frontend grouped under `reefer/` and a Node.js/Express backend in the project root that provides authentication, API endpoints, and protected document access.

## Current Structure

```text
WEBSITE/
├── reefer/
│   ├── reefer-website/
│   │   ├── index.html
│   │   ├── css/
│   │   ├── js/
│   │   │   ├── api.js
│   │   │   ├── ui.js
│   │   │   └── main.js
│   │   └── assets/
│   │       └── images/
│   ├── login-page/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── internal.css
│   │   └── js/
│   │       └── internal.js
│   └── docs/
├── server.js
├── generatePDF.js
├── package.json
├── package-lock.json
└── README.md
```

## Route Map

- `/` serves the public page from `reefer/reefer-website/index.html`.
- `/internal.html` serves the internal resources page from `reefer/login-page/index.html`.
- `/docs` and `/docs/iso` serve protected files from `reefer/docs`.
- `/api/images`, `/api/team`, `/api/docs`, `/me`, `/login`, and `/logout` remain unchanged.

## Setup

1. **Install dependencies**
   ```bash
   cd "c:\Users\LUFTINYER\PROJECTS\WEBSITE"
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

   The site will be available at `http://localhost:3000`.

## Authentication

- The `server.js` file originally defined an in-memory `users` object, but now uses a MySQL database for credential storage. The `users` table should have columns `id` (VARCHAR PRIMARY KEY) and `password` (VARCHAR).
- Example SQL to create the table:

  ```sql
  CREATE DATABASE IF NOT EXISTS ptpdb;
  USE ptpdb;
  
  CREATE TABLE users (
      id VARCHAR(50) PRIMARY KEY,
      password VARCHAR(255) NOT NULL
  );
  
  INSERT INTO users (id, password) VALUES
    ('admin', 'password123'),
    ('user1', 'pass1');
  ```

  (In production, store hashed passwords and use a secure connection.)

- If the database lookup fails or the user is not found, the server still falls back to the in-memory object for quick testing.
- Login form on the public landing page POSTs to `/login`.
- Upon successful authentication, a session cookie is stored and the user is redirected to `/internal.html`.
- The `/logout` endpoint destroys the session and sends the user back to the public landing page.
- Access to `/internal.html` and any files under `/docs` is restricted; unauthenticated requests are redirected to the home page with an error query parameter.

### Extending
- For a production-grade system, replace the in-memory store with a database and use HTTPS.
- Consider hashing passwords, implementing rate-limiting, and using helmet/other security middleware.

### Image Management

To store image file paths in the database for dynamic management:

```sql
USE ptpdb;

CREATE TABLE images (   
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing images
INSERT INTO images (filename, path, alt_text, category) VALUES
('home-bg.jpg', '/IMG/home-bg.jpg', 'PTP Reefer Department Hero Background', 'hero'),
('zoom_out.jpg', '/IMG/zoom_out.jpg', 'Operational Excellence Overview', 'about'),
('termnal.jpg', '/IMG/termnal.jpg', 'Terminal Operations', 'gallery'),
('terminal_1.jpg', '/IMG/terminal_1.jpg', 'Terminal Facility', 'gallery'),
('aerial.jpg', '/IMG/aerial.jpg', 'Aerial View of Port', 'gallery'),
('15B.jpg', '/IMG/15B.jpg', 'Container Operations', 'gallery'),
('lufti_exec.jpg', '/IMG/STAFF/lufti_exec.jpg', 'Lufti Misri - Duty Executive', 'team'),
('omar_exec.jpg', '/IMG/STAFF/omar_exec.jpg', 'Omar Hitam - Duty Executive', 'team'),
('ptp logo.jpg', '/IMG/ptp logo.jpg', 'PTP Logo', 'branding'),
('ptp-prime.jpg', '/IMG/ptp-prime.jpg', 'PTP Prime Operations', 'operations'),
('ptp-reeferstack.jpg', '/IMG/ptp-reeferstack.jpg', 'Reefer Container Stack', 'operations'),
('img.fakrul.jpg', '/IMG/STAFF/img.fakrul.jpg', 'Team Member Fakrul', 'team');
```

Use public paths such as `/IMG/...` so the existing frontend and API normalization continue to work after the refactor.

You can then query images by category, e.g., `SELECT * FROM images WHERE category = 'gallery';` and use them in templates or APIs.

### Document Management

To store document file paths in the database for dynamic loading:

```sql
USE ptpdb;

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing documents
INSERT INTO documents (filename, path, title, category) VALUES
('training_beginner.pdf', '/docs/training_beginner.pdf', 'Complete training module – Beginner', 'training'),
('training_intermediate.pdf', '/docs/training_intermediate.pdf', 'Complete training module – Intermediate', 'training'),
('training_advanced.pdf', '/docs/training_advanced.pdf', 'Complete training module – Advanced', 'training'),
('sops_procedure.pdf', '/docs/sops_procedure.pdf', 'SOPs & Procedures', 'procedures'),
('iso_documents.pdf', '/docs/iso_documents.pdf', 'ISO Documents', 'compliance'),
('job_description.pdf', '/docs/job_description.pdf', 'Job Description', 'hr');
```

You can then query documents by category, e.g., `SELECT * FROM documents WHERE category = 'training';` and use them in the internal page.

## Documents

Place PDF resources inside `reefer/docs/` and store public URLs using the `/docs/...` prefix so existing protected links continue to work:

- `training_beginner.pdf`
- `training_intermediate.pdf`
- `training_advanced.pdf`
- `sops_procedure.pdf`
- `iso_documents.pdf`
- `job_description.pdf`

## SEO & Accessibility

- Meta tags and `aria-label` attributes have been added for better SEO and screen-reader support.

## Notes

- The public page now lives at `reefer/reefer-website/index.html`, but users still access it at `/`.
- The internal page now lives at `reefer/login-page/index.html`, but users still access it at `/internal.html`.
- The login form displays an error message if credentials are invalid.
- The internal page greets the user with their staff ID fetched from the `/me` endpoint.

Feel free to expand the site with contact forms, client testimonials, or analytics as needed.

# PTP Reefer Department Website

This repository contains a static landing page with a simple Node.js/Express server providing basic authentication for internal resources.

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
- Login form on the home page POSTs to `/login`.
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
('home-bg.jpg', 'img/home-bg.jpg', 'PTP Reefer Department Hero Background', 'hero'),
('zoom_out.jpg', 'img/zoom_out.jpg', 'Operational Excellence Overview', 'about'),
('termnal.jpg', 'img/termnal.jpg', 'Terminal Operations', 'gallery'),
('terminal_1.jpg', 'img/terminal_1.jpg', 'Terminal Facility', 'gallery'),
('aerial.jpg', 'img/aerial.jpg', 'Aerial View of Port', 'gallery'),
('15B.jpg', 'img/15B.jpg', 'Container Operations', 'gallery'),
('lufti_exec.jpg', 'img/lufti_exec.jpg', 'Lufti Misri - Duty Executive', 'team'),
('omar_exec.jpg', 'img/omar_exec.jpg', 'Omar Hitam - Duty Executive', 'team'),
('ptp logo.jpg', 'img/ptp logo.jpg', 'PTP Logo', 'branding'),
('ptp-prime.jpg', 'img/ptp-prime.jpg', 'PTP Prime Operations', 'operations'),
('ptp-reeferstack.jpg', 'img/ptp-reeferstack.jpg', 'Reefer Container Stack', 'operations'),
('img.fakrul.jpg', 'img/img.fakrul.jpg', 'Team Member Fakrul', 'team');
```

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
('training_beginner.pdf', 'docs/training_beginner.pdf', 'Complete training module – Beginner', 'training'),
('training_intermediate.pdf', 'docs/training_intermediate.pdf', 'Complete training module – Intermediate', 'training'),
('training_advanced.pdf', 'docs/training_advanced.pdf', 'Complete training module – Advanced', 'training'),
('sops_procedure.pdf', 'docs/sops_procedure.pdf', 'SOPs & Procedures', 'procedures'),
('iso_documents.pdf', 'docs/iso_documents.pdf', 'ISO Documents', 'compliance'),
('job_description.pdf', 'docs/job_description.pdf', 'Job Description', 'hr');
```

You can then query documents by category, e.g., `SELECT * FROM documents WHERE category = 'training';` and use them in the internal page.

## Documents

Place PDF resources inside the `docs/` directory with the following names or update the links in `internal.html`:

- `training_beginner.pdf`
- `training_intermediate.pdf`
- `training_advanced.pdf`
- `sops_procedure.pdf`
- `iso_documents.pdf`
- `job_description.pdf`

## SEO & Accessibility

- Meta tags and `aria-label` attributes have been added for better SEO and screen-reader support.

## Notes

- The login form now displays an error message if credentials are invalid.
- Internal page greets the user with their staff ID fetched from the `/me` endpoint.

Feel free to expand the site with contact forms, client testimonials, or analytics as needed.

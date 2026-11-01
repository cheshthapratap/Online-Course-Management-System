# BrightPath Coaching: online coaching classes (Java full stack)

Spring Boot 3 (Java 17) + JPA + JWT security on the backend, React 18 + Vite on the frontend.
Database: H2 file database by default (no setup), MySQL by environment variables.

```
ocms-fullstack/
  backend/    Spring Boot REST API (port 8080)
  frontend/   React app (port 5173, proxies /api to the backend)
```

## Requirements
Java 17+, Maven 3.9+, Node 18+. (Internet access is needed once to download dependencies.)

## Run
```bash
# Terminal 1 - backend
cd backend
mvn spring-boot:run

# Terminal 2 - frontend
cd frontend
npm install
npm run dev          # open http://localhost:5173
```

## Accounts
| Role    | Email              | Password     | How it is created |
|---------|--------------------|--------------|-------------------|
| Admin   | admin@ocms.com     | Admin@123    | Created on first start from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. No public admin registration exists. |
| Teacher | teacher@ocms.com   | Teacher@123  | Demo data (`DEMO_DATA=true`) |
| Student | student@ocms.com   | Student@123  | Demo data |

Teachers who register publicly stay PENDING until an admin approves them in Admin > Users.
**Before deploying:** set `DEMO_DATA=false`, a strong `ADMIN_PASSWORD`, and a random `JWT_SECRET` (32+ chars). See `backend/.env.example`.

## Reset demo data
Delete `backend/data/` while the backend is stopped, then start it again.

## Use MySQL
```bash
export DB_URL="jdbc:mysql://localhost:3306/ocms?createDatabaseIfNotExist=true"
export DB_USER=root DB_PASS=yourpassword
mvn spring-boot:run
```
Tables are created automatically (`spring.jpa.hibernate.ddl-auto=update`).

## Features included
- Student/teacher registration (teacher needs approval), JWT login, role-based access enforced on the backend and in the UI, BCrypt password hashing, duplicate-email prevention, suspended/pending account blocking.
- Admin: dashboard stats, approve/reject/suspend/activate users, publish/unpublish/delete courses, assign teachers, all test results, announcements.
- Teacher: create/edit courses, lessons with chapter, recorded video link (YouTube embeds inline), notes, file links, live class (Meet/Zoom link + date/time), MCQ tests (4 options, correct answer, explanation, marks, negative marking, pass marks, duration), view results, student progress, announcements.
- Student: browse/search courses, enroll, watch lessons, join live classes, mark lessons complete (progress bar), timed quizzes with auto-submit, scoring, review with explanations, test history.
- Answer keys are never sent to students before submission. Course content is only served to enrolled students, the owning teacher, or admins.

## Not included yet (honest scope)
Forgot-password email flow, file upload to the server (materials are links today), certificates, payments, feedback form, per-user notifications (announcements exist), server-side enforcement of the quiz timer. These are natural next additions.

## Main API routes
`POST /api/auth/register|login`, `GET /api/courses`, `GET /api/courses/{id}/content`, `/api/student/**`, `/api/teacher/**`, `/api/admin/**`, `/api/announcements`.

# TaskFlow — Real-Time Team Task Manager

A full-stack project management app where teams create workspaces, invite members, organize work into projects, and manage tasks on a real-time drag-and-drop Kanban board.

**Live app:** https://task-manager-sepia-theta-48.vercel.app
**Backend API:** https://task-manager-yvkj.onrender.com/api/health

> Note: the backend is hosted on Render's free tier, which spins down after inactivity — the first request after idle time may take 20–30 seconds to respond.

---

## Features

- **Authentication** — JWT-based auth with email OTP verification, and forgot/reset password flow
- **Workspaces** — multi-tenant structure; a user can belong to multiple workspaces
- **Role-based access** — admin/member roles per workspace, enforced on every membership-gated route
- **Email invites** — invite teammates by email (via Brevo API); invite links expire after 7 days
- **Projects & Tasks** — organize tasks by project, with priority, due date, and assignee
- **Real-time Kanban board** — drag-and-drop task management powered by `@dnd-kit`, synced live across all connected clients via Socket.io
- **Activity audit log** — every task creation, status change, and reassignment is logged with a timestamp and actor

---

## Tech Stack

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, `@dnd-kit`, `socket.io-client`, Axios
**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, `bcryptjs`, Socket.io
**Infra:** MongoDB Atlas · Render (backend) · Vercel (frontend) · Brevo (transactional email)

---

## Architecture

```
Workspace (team)
  └─ Members (user + role: admin | member)
  └─ Projects
        └─ Tasks
              ├─ status: todo → in-progress → review → done
              ├─ priority, dueDate, assignee
              └─ Audit log (create / status change / reassignment)
```

Auth uses a JWT stored client-side and sent via `Authorization: Bearer` header on every request. Real-time updates use Socket.io rooms scoped per project — clients join a room when they open a board and receive live `task-created` / `task-updated` / `task-deleted` events from other members working in the same project.

---

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Brevo](https://www.brevo.com) account + API key (for sending OTP/invite emails)

### 1. Clone and install

```bash
git clone https://github.com/SumitKumar3030/task-manager.git
cd task-manager

cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
JWT_SECRET=a_long_random_string
EMAIL_USER=your_verified_brevo_sender_email
BREVO_API_KEY=your_brevo_api_key
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run both servers

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Visit `http://localhost:3000`.

---

## Project Structure

```
task-manager/
├── backend/
│   └── src/
│       ├── models/        # User, Workspace, Invite, Project, Task, Audit
│       ├── controllers/   # business logic per resource
│       ├── routes/        # Express route definitions
│       ├── middleware/    # JWT auth middleware
│       └── server.js      # entry point, HTTP + Socket.io server
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages
        ├── components/     # Kanban board components (Column, TaskCard)
        └── lib/axios.ts    # configured API client with auth interceptor
```

---

## Roadmap / Possible Next Steps

- Task comments (real-time)
- In-app audit log viewer
- Mobile responsiveness pass
- Notification center for assignments and due dates

---

## Author

Built by [Sumit Kumar](https://github.com/SumitKumar3030).
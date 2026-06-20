# FUT Confession MVP

Anonymous confession/community board for FUT Minna built with React + Express + MongoDB.

## Monorepo Structure

- `client/` - React (Vite) frontend
- `server/` - Node.js/Express API with MongoDB

## Quick Start

### 1) Backend

```bash
cd /home/runner/work/fut-confession/fut-confession/server
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend

```bash
cd /home/runner/work/fut-confession/fut-confession/client
cp .env.example .env
npm install
npm run dev
```

## Root Scripts

From `/home/runner/work/fut-confession/fut-confession`:

- `npm run dev:client` - run frontend
- `npm run dev:server` - run backend
- `npm run lint` - lint client
- `npm run build` - build client
- `npm run start` - start backend in production mode

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /health` - health check
- `GET /confessions?sort=newest|trending` - list confessions
- `POST /confessions` - create anonymous confession
  - body: `{ "text": "your confession" }`
- `PATCH /confessions/:id/vote` - vote on confession
  - body: `{ "direction": "up" | "down" }`
- `PATCH /confessions/:id/flag` - flag confession
- `GET /confessions/admin` - flagged confessions (admin dashboard)

## MVP Features Implemented

- Anonymous confession posting (no user accounts or tracking)
- Live/near real-time feed (polling every 10s)
- Upvote/downvote with trending/newest sorting
- Basic moderation via flagging + admin dashboard toggle

## Deployment Notes

- Frontend: Vercel (`client` root)
- Backend: Railway/Heroku (`server` root)
- Set `VITE_API_URL` on frontend to your deployed backend `/api` URL
- Set `MONGODB_URI`, `CLIENT_ORIGIN`, and `PORT` on backend

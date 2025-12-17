Firebase Hosting deployment — quick guide

This project uses Next.js and Firebase (Auth, Firestore, Storage). There are two common ways to host a Next.js app with Firebase:

1) Static export (no SSR) — easiest
   - Run `next export` (after `next build`) to produce a static `out/` directory and host it on Firebase Hosting.
   - Limitations: server-side rendering (SSR) and API routes are not available.

2) Production SSR (recommended) — Firebase Hosting + Cloud Run
   - Build and containerize the Next.js app, deploy the container to Cloud Run, and configure Firebase Hosting rewrites to forward requests to the Cloud Run service.
   - This preserves SSR and API behavior.

This repo includes `firebase.json`, `firestore.rules`, and `storage.rules` samples. Follow the steps below.

Prerequisites
- Node.js (LTS)
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project with Firestore and Storage enabled

Deploying (Option 1: static export)
1. Install and build:
   ```powershell
   cd d:/ReactApp/communicationsystem
   npm install
   npm run build
   npx next export
   ```
   This creates an `out/` folder.

2. Initialize and deploy hosting (if not done already):
   ```powershell
   firebase login
   firebase init hosting
   # choose your Firebase project and set 'public' to 'out'
   firebase deploy --only hosting
   ```

Deploying (Option 2: SSR via Cloud Run) — recommended if you need SSR
1. Build a production image and push to Container Registry (or Artifact Registry).
   Example (gcloud):
   ```powershell
   # Build the app
   npm install
   npm run build

   # Create Dockerfile (example below) and build image
   docker build -t gcr.io/YOUR_PROJECT_ID/next-app:latest .
   docker push gcr.io/YOUR_PROJECT_ID/next-app:latest
   ```

   Minimal Dockerfile (example):
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app .
   ENV NODE_ENV=production
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

2. Deploy to Cloud Run (gcloud):
   ```powershell
   gcloud run deploy next-app --image gcr.io/YOUR_PROJECT_ID/next-app:latest --region=us-central1 --platform=managed --allow-unauthenticated
   ```

3. Configure Firebase Hosting to rewrite to Cloud Run (this repo's `firebase.json` already includes a `run` rewrite to `next-app` in `us-central1`).
   ```powershell
   firebase deploy --only hosting
   ```

Deploy Firestore and Storage rules
1. To upload the rules files included here:
   ```powershell
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

Environment variables
- In Cloud Run (or wherever you host), set your Firebase environment variables (the ones in `.env.local`) so the frontend can use Firestore/Auth/Storage. For client-side usage, values must start with `NEXT_PUBLIC_`.

Security
- Review `firestore.rules` and `storage.rules` and tailor them for your access model. Test rules in the Firebase Console before deploy for safety.

If you'd like, I can:
- Add a `Dockerfile` to the repo (I can create one here).
- Create a step-by-step script to build & push the container and configure Cloud Run.
- Help you connect the GitHub repo to Firebase Hosting or set up a GitHub Action to deploy automatically.

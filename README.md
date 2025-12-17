# Academic Collaboration & Research Platform (Demo)

This repository contains a demo MVP scaffold for an Academic Collaboration & Research Platform inspired by WhatsApp, Notion, Google Classroom and ResearchGate.

Quick start (Windows PowerShell):

```powershell
cd d:/ReactApp/communicationsystem
npm install
npm run dev
```



What is included:
- Next.js + TypeScript scaffold
- TailwindCSS for styling
- Sample pages: Landing, Login (role selection), Role Dashboard, Chat
- Basic components: `Header`, `Sidebar`, `ChatWindow`
- Firebase config placeholder at `lib/firebase.ts` for realtime integration

Next steps / recommended enhancements:
- Implement role-based authentication (Firebase Auth / Supabase / JWT)
- Integrate Firestore or Supabase Realtime for chat and threads
- Build assignment & submission workflows, course spaces, project Kanban boards
- Add AI-powered study assistant and discussion summarization (optional)

This is a demo scaffold to iterate on. Want me to wire up Firebase realtime chat, or add the Assignments module next?

## Preparing for GitHub

Follow these steps to create a new GitHub repository and push this project.

1. Create a new repository on GitHub (do not initialize with a README or .gitignore)
2. From PowerShell run:

```powershell
cd d:/ReactApp/communicationsystem
git init
git add .
git commit -m "Initial scaffold: Next.js + Tailwind academic collab MVP"
git branch -M main
# Replace the URL below with your GitHub repo URL
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Notes:
- Rename the remote URL to your repository's URL before pushing.
- Fill in `.env.local` from `.env.example` with your Firebase/Supabase credentials.
- `.gitignore` excludes sensitive files like `.env` and `node_modules`.

Firestore setup notes (for chat demo):

1. In the Firebase Console enable Firestore in your project.
2. Set the following values in `.env.local` (or your CI secrets):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

3. (Optional) For local quick demo without Firebase, leave the env values empty — the chat falls back to a local in-memory mode.

4. For production, set appropriate Firestore rules. The demo uses collection `rooms/{roomId}/messages` with documents containing `{ text, author, createdAt }`.

Auth notes:

- This scaffold supports Google Sign-in via Firebase Auth. To enable it:
	1. Enable "Google" sign-in provider in the Firebase Console under Authentication -> Sign-in method.
	2. Add the Firebase config values to `.env.local` as shown in `.env.example`.
	3. The login page will show a "Continue with Google" button that signs the user in and preserves the selected role in localStorage.

Role persistence:

- After a successful Google sign-in the demo persists the selected role to Firestore in `users/{uid}` (merged). This lets a user's role be available across devices. This is a best-effort write — the UI still works if the write fails.
- You can inspect user documents under `users/` in the Firestore console. Documents include `{ role, displayName, email, updatedAt }`.

Security:

- After enabling Auth, update Firestore rules to only allow authenticated users to read/write messages and to validate the message schema.

Firestore rules example

This repo includes an example Firestore rules file at `firestore.rules`. It demonstrates a minimal security posture for the demo:

- User role lookup: rules read the user's profile document at `users/{uid}` and use the stored `role` (teacher/student) to make authorization decisions.
- Users: only the authenticated user can create/update their own `users/{uid}` profile.
- Rooms/messages: authenticated users may read messages and create messages with basic field validation.
- Assignments: only users whose `users/{uid}.role == 'teacher'` may create/update/delete assignments.
- Submissions: students may create submissions for themselves; teachers may read and grade submissions.

Important: these example rules assume you persist a `role` field on the user's Firestore profile (this scaffold writes the selected role to `users/{uid}` on sign-in).

Deploying rules with Firebase CLI

1. Install and login to the Firebase CLI: `npm install -g firebase-tools` then `firebase login`.
2. From the project root run:

```powershell
# copy example rules to firebase project, or reference it from firebase.json
firebase deploy --only firestore:rules
```

Or configure `firebase.json` to point to `firestore.rules` and run `firebase deploy`.

Security notes

- In production you may prefer to set roles as Auth custom claims and check `request.auth.token` in rules for faster checks. If you do, ensure your backend sets these claims securely.
- Always test your rules in the Firebase Console's Rules Playground before deploying to production.


If you want, I can also add a GitHub Actions workflow for CI (lint & build) and a `CODE_OF_CONDUCT.md`.

---

Assignments module

- A simple Assignments module has been added to this scaffold.
- Pages:
	- `pages/assignments` — list assignments (real-time)
	- `pages/assignments/create` — create assignment (teacher)
	- `pages/assignments/[id]` — assignment view, submit (student), and grade submissions (teacher)
- Firestore collections used:
	- `assignments` (documents with `{ title, description, dueDate, createdAt }`)
	- `assignments/{assignmentId}/submissions` (documents with `{ author, text, createdAt, grade, feedback }`)

Notes:
- The module uses Firestore via `lib/assignments.ts`. If Firebase is not configured the UI will still work but writes/listens will be no-ops.
- For production, add Firestore security rules to restrict create/grade actions to teachers and only allow students to create their own submissions.


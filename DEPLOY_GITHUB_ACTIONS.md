Deploy via GitHub Actions (Firebase)

This repo includes a GitHub Actions workflow (`.github/workflows/deploy-firebase.yml`) that will:

- run `npm ci` and `npm run build`
- attempt a `next export` to produce a static `out/` folder
- install the Firebase CLI and run `firebase deploy` (hosting + firestore rules + storage rules)

Required GitHub secrets
- `FIREBASE_TOKEN`: a CI token created with `firebase login:ci` (run this locally while logged into the desired Firebase account).
- `FIREBASE_PROJECT_ID`: the Firebase project id to deploy to (the same id you use with `firebase use --add`).

How to create the `FIREBASE_TOKEN`:

1. Install the Firebase CLI locally: `npm install -g firebase-tools`.
2. Run `firebase login` and sign in to the account that owns the target Firebase project.
3. Run `firebase login:ci` — it will print a token string. Copy it.
4. In your GitHub repository settings → Secrets → Actions, add a new secret named `FIREBASE_TOKEN` with that token value.
5. Add `FIREBASE_PROJECT_ID` as a secret too (value example: `my-firebase-project-123`).

Notes & caveats
- The workflow uses `next export` and deploys the exported `out/` folder. If your app needs SSR (server-side rendering) or API routes you should instead deploy using Cloud Run or Firebase Functions and update the workflow accordingly. I can help add a Cloud Run-based workflow if you want SSR.
- The workflow also deploys Firestore and Storage rules from the repo. Make sure `firestore.rules` and `storage.rules` are correct for production before enabling auto-deploy.

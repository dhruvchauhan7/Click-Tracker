# Click Tracker

Tiny full-stack app demonstrating frontend, auth, tracking, backend, and deployment.

- **Frontend:** React (Vite)
- **Auth:** Firebase Authentication (email/password)
- **Tracking:** Per-user click counts in Firestore (`usage/{uid}`)
- **Backend:** Node/Express with Firebase Admin, deployed to Cloud Run
- **Hosting:** Firebase Hosting
- **Infra:** Cloud Build builds the container

---

## Live URLs

- **Web (Hosting):** https://click-tracker-eb57a.web.app/
- **API (Cloud Run):** https://click-tracker-api-ux3oempsmq-uc.a.run.app


---

## Local Development

### Frontend
cd miniapp/web
npm install

### Backend
cd ../api
npm install
npm run dev

## Environment variables (Vite)


**`.env.local`** (dev) and **`.env.production`** (build):
```ini
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=click-tracker-eb57a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=click-tracker-eb57a
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_API_BASE_URL=https://click-tracker-api-ux3oempsmq-uc.a.run.app


## Deployment

A) API → Cloud Run

## from miniapp/api
PROJECT_ID=$(gcloud config get-value project)
REGION=us-central1
SERVICE=click-tracker-api
TAG=$(date +%Y%m%d-%H%M%S)
IMAGE=gcr.io/$PROJECT_ID/$SERVICE:$TAG

gcloud builds submit --tag $IMAGE
gcloud run deploy $SERVICE \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --max-instances=1 \
  --set-env-vars FIREBASE_PROJECT_ID=$PROJECT_ID

##Test:

curl -s https://<SERVICE_URL>/ | jq
## Get a fresh ID token in the web app console: await window._testGetToken(true)
curl -s https://<SERVICE_URL>/me -H "Authorization: Bearer <ID_TOKEN>" | jq

B) Web -> Firebase Hosting

## .env.production should contain the same Firebase values + VITE_API_BASE_URL
cd miniapp/web
npm run build
firebase deploy --only hosting


## Firestore Security Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usage/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}


## Backend Security Notes

*Auth check: Every protected route uses Authorization: Bearer <Firebase ID token> and verifies with Firebase Admin (verifyIdToken). Tokens are audience/issuer bound to the Firebase project.
*Public routes: / (and optionally /healthz) are public for health checks. Business routes like /me, /ping require a valid token.
*CORS: cors({ origin: true }) for simplicity in demo; restrict to your Hosting origin in production if desired.
*Least access: Firestore rules isolate per-user access to usage/{uid}.
*Secrets: No service account keys are committed. Cloud Run uses ADC (workload identity).





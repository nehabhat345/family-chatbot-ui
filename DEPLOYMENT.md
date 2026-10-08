# Deployment Guide

## Live services

- Frontend: https://nehabhat345.github.io/family-chatbot-ui/
- Backend API: https://family-chatbot.onrender.com
- Chat endpoint: `POST /api/chatbot/message`

The frontend calls the Render backend from `src/App.jsx`. Deploy the backend first when backend code or recipe data changes, then deploy the frontend when UI code changes.

## Backend: Render

Backend source repository: `https://github.com/nehabhat345/family-chatbot`

1. Commit and push the intended backend code and data changes to the branch connected to the Render service (currently `main`).
2. Open the `family-chatbot` web service in the Render dashboard.
3. Choose **Manual Deploy** > **Deploy latest commit**, unless automatic deployment is enabled for that branch.
4. Wait for the deploy to finish successfully in the Render Events/Logs view.
5. Smoke-test the chat endpoint:

```powershell
$body = @{ message = 'pumpkin' } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri 'https://family-chatbot.onrender.com/api/chatbot/message' `
  -ContentType 'application/json' `
  -Body $body
```

The API does not define a root route, so a `404` at `https://family-chatbot.onrender.com/` is expected. Test `/api/chatbot/message` instead.

If configuring a new Render web service, use the backend repository, install dependencies from `requirements.txt`, and run the FastAPI app with a command such as `uvicorn main:app --host 0.0.0.0 --port $PORT`. Keep any credentials in Render environment settings, never in source control.

## Frontend: GitHub Pages

Frontend source repository: `https://github.com/nehabhat345/family-chatbot-ui`

1. Commit and push the intended frontend changes to `main`.
2. From the frontend repository directory, run:

```powershell
npm run deploy
```

The `predeploy` script runs `npm run build` first; `gh-pages -d build` then publishes the generated site to the `gh-pages` branch. Wait briefly for GitHub Pages to serve the update, then open https://nehabhat345.github.io/family-chatbot-ui/ and hard-refresh if the browser has cached old assets.

## Hosting note

The live frontend calls the Render API above. The backend repository also contains Fly.io configuration, but Fly is not the active API target for this frontend. Use Fly only for an intentional hosting migration, and ensure the Fly account is able to deploy before switching the frontend API URL.

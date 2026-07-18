# Google Calendar setup (for Google Meet links on bookings)

When a patient books a session, Mindcarter tries to create a Google Meet link
automatically. To make that work, **each psychologist connects their own Google
Calendar once**, and someone with access to the project's Google Cloud project does
a one-time configuration. This guide covers both.

You do **not** need a new Google project or a new set of API keys — we reuse the same
OAuth client that already powers "Sign in with Google" for patients.

---

## Part A — One-time Google Cloud Console setup (admin/developer)

Do this once for the whole app.

1. Go to <https://console.cloud.google.com/> and select the project that holds the
   existing Mindcarter OAuth client (the one whose ID/secret are in
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).

2. **Enable the Google Calendar API**
   - Left menu → **APIs & Services → Library**.
   - Search for **"Google Calendar API"**, open it, click **Enable**.

3. **Add the Calendar scope to the consent screen**
   - Left menu → **APIs & Services → OAuth consent screen → Data access** (or
     **Scopes**).
   - Click **Add or remove scopes**, and add:
     `https://www.googleapis.com/auth/calendar.events`
   - Save.

4. **Add the new redirect URI to the OAuth client**
   - Left menu → **APIs & Services → Credentials**.
   - Open the existing OAuth 2.0 Client (the Web application one).
   - Under **Authorized redirect URIs**, add BOTH the development and production
     versions of the new callback (keep the existing `/auth/google/callback` URIs):
     - Dev: `http://localhost:3000/psychologist/settings/connect-calendar/callback`
     - Prod: `https://YOUR-PRODUCTION-DOMAIN/psychologist/settings/connect-calendar/callback`
   - Save. (Changes can take a few minutes to take effect.)

5. **Set publishing status to "Testing" and add the psychologists as test users**
   - Left menu → **APIs & Services → OAuth consent screen**.
   - Ensure **Publishing status** is **Testing** (fine for the 10-clinician rollout;
     a Testing app doesn't need Google verification).
   - Under **Test users**, click **Add users** and add the Google email address of
     **every psychologist** who will connect a calendar — all 10. Only listed test
     users can complete the connection while the app is in Testing.

6. **Environment variables** — no new secrets are needed:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — already set; now also used for
     Calendar.
   - `SESSION_SECRET` — must be a real, stable value in every environment. It now
     also encrypts each psychologist's stored Calendar refresh token, so if it
     changes, previously-connected calendars must be reconnected.
   - `APP_ORIGIN` — used as the fallback origin when refreshing Calendar tokens
     outside a browser request; set it to your production URL in prod.

---

## Part B — How a psychologist connects their calendar

Each clinician does this once, from their own account:

1. Sign in to the psychologist portal and go to **Profile**.
2. In the **Google Calendar** card, click **Connect Google Calendar**.
3. Choose the Google account whose calendar should host the sessions, and grant the
   "See, edit, share, and permanently delete all the calendars you can access"
   (calendar.events) permission when prompted.
4. You'll be returned to the Profile page with a green **Connected** indicator.

After this, any new booking with that psychologist automatically gets a Google Meet
link, the patient is added as an attendee, and the patient receives a confirmation
email with the join link.

### If a booking shows "Meet link pending"

If a session was booked **before** the psychologist connected their calendar (or the
calendar wasn't connected), the booking has no Meet link. The psychologist sees a
"Meet link pending — add manually" note on that meeting in **Meetings → (open the
meeting)**. Connecting the calendar fixes this for all **future** bookings; existing
ones need a link shared manually (automatic backfill is out of scope for now).

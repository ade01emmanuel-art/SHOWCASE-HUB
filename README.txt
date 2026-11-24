SHOWCASE HUB — WEBSITE + BOOKING SYSTEM
========================================

WHAT'S INCLUDED
- Responsive portfolio website for SHOWCASE HUB.
- Founder/about section using the supplied portrait.
- Services, concept portfolio, process, contact and booking sections.
- Consultation and project booking request form.
- Node.js + Express backend.
- SQLite database for booking records.
- Admin page to review requests and change their status.

RUN LOCALLY
1. Install Node.js 18 or newer.
2. Extract this ZIP.
3. Open a terminal in the extracted folder.
4. Run: npm install
5. Copy .env.example to .env and set ADMIN_KEY to a long, private value.
6. Run: npm start
7. Open http://localhost:3000

ADMIN
- Open http://localhost:3000/admin
- Enter the ADMIN_KEY from your server environment.
- Review incoming requests and mark them confirmed, declined or completed.

BOOKING BEHAVIOUR
- Consultation and project requests are stored in SQLite.
- The API prevents two pending/confirmed consultation requests for the same date and time.
- A booking request is NOT automatically a confirmed appointment. Contact the client and confirm it.
- The demo form offers hourly slots from 09:00 to 16:00. Adjust these in public/index.html.
- Project requests record a preferred date/time; they do not reserve a delivery deadline.

IMPORTANT BEFORE PUBLIC LAUNCH
- Deploy to a Node.js host (not static-only hosting).
- Set ADMIN_KEY securely in the host's environment variables.
- Use HTTPS and configure persistent storage/volume for the SQLite database.
- Set up regular database backups.
- Add email notifications, CAPTCHA/rate limiting and privacy/terms pages before accepting significant public traffic.
- This starter does not yet sync with Google Calendar, process payments, send automatic email/SMS, or provide live calendar availability. Those can be added in a later integration.
- Concept portfolio cards are illustrative sample work, not completed client projects.

CONTACT DETAILS
Email: emmanueloluwadunmininu3@gmail.com
WhatsApp: https://wa.me/qr/A4Y663F3IGZBN1

// Twilio SMS notification handler for Fly Fishing Guru bookings
export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
    }
    const { name, phone, email, preferredContact, bestTime, technique, notes, requestType } = req.body;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber   = process.env.MY_PHONE_NUMBER;
    if (!accountSid || !authToken || !fromNumber || !toNumber) {
          return res.status(500).json({ error: 'Twilio env vars not configured' });
    }
    const message = [
          'New Fly Fishing Guru Booking!',
          'Type: ' + (requestType || 'General Inquiry'),
          'Name: ' + name,
          'Phone: ' + (phone || 'not provided'),
          'Email: ' + email,
          'Preferred: ' + preferredContact,
          'Best Time: ' + (bestTime || 'not specified'),
          'Technique: ' + (technique || 'not specified'),
          notes ? 'Notes: ' + notes : null,
        ].filter(Boolean).join('\n');
    try {
          const creds = Buffer.from(accountSid + ':' + authToken).toString('base64');
          const r = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
                  method: 'POST',
                  headers: { 'Authorization': 'Basic ' + creds, 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({ From: fromNumber, To: toNumber, Body: message }).toString(),
          });
          const d = await r.json();
          if (!r.ok) return res.status(500).json({ error: d.message || 'Twilio failed' });
          return res.status(200).json({ success: true, sid: d.sid });
    } catch (err) {
          return res.status(500).json({ error: err.message });
    }
}

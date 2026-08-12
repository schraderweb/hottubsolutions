const path = require('path');
const fs = require('fs');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Hot-tub-solutions@fastgrowth.top';
const TO_EMAILS = (process.env.TO_EMAILS || 'info@hottubsolutions.com').split(',').map(s => s.trim());
const RESEND_API = 'https://api.resend.com/emails';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      firstName = '', lastName = '', phone = '', email = '',
      zip = '', referral = '', message = '', appointment = '',
    } = req.body || {};

    const labels = {
      firstName: 'First Name', lastName: 'Last Name', phone: 'Phone Number',
      email: 'Email Address', zip: 'Zip Code', referral: 'How Did You Hear About Us?',
      appointment: 'Book An Appointment?', message: 'Message',
    };

    const values = { firstName, lastName, phone, email, zip, referral, message, appointment };

    // On Vercel the working dir is the project root
    const templatePath = path.join(process.cwd(), 'form-mail.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, label] of Object.entries(labels)) {
      html = html.replaceAll(`{{label_${key}}}`, label);
      html = html.replaceAll(`{{value_${key}}}`, values[key] || '—');
    }

    const resendRes = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAILS,
        subject: `New Service Enquiry from ${firstName} ${lastName}`,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendData);
      return res.status(500).json({ success: false, error: resendData.error?.message || 'Failed to send' });
    }

    console.log('Email sent:', resendData?.id);
    return res.json({ success: true, message: 'Enquiry sent successfully' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

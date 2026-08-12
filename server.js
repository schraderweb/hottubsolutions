const express = require('express');
const path = require('path');
const fs = require('fs');

// Load .env variables locally if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      const envKey = key.trim();
      if (envKey && !process.env[envKey]) {
        process.env[envKey] = valParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Hot-tub-solutions@fastgrowth.top';
const TO_EMAILS = (process.env.TO_EMAILS || 'info@hottubsolutions.com').split(',').map(s => s.trim());
const RESEND_API = 'https://api.resend.com/emails';

app.use(express.json());

const STATIC_CACHE = { maxAge: '365d', setHeaders: (res, filePath) => {
  if (filePath.endsWith('.webp') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.svg')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (filePath.endsWith('.mp4')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}};

app.use(express.static(__dirname, STATIC_CACHE));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/send-enquiry', async (req, res) => {
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

    const templatePath = path.join(__dirname, 'form-mail.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, label] of Object.entries(labels)) {
      html = html.replaceAll(`{{label_${key}}}`, label);
      html = html.replaceAll(`{{value_${key}}}`, values[key] || '\u2014');
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
        subject: `New Enquiry from ${firstName} ${lastName}`,
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
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Static files: http://localhost:${PORT}/`);
  console.log(`API: http://localhost:${PORT}/api/send-enquiry`);
});

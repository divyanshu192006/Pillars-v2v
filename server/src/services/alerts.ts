import nodemailer from 'nodemailer';

interface AlertPayload {
  pregnancyId: string;
  womanName: string;
  riskLevel: string;
  message: string;
  recipients?: { name: string; role: string; contact: string }[];
}

const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

export async function sendEmailAlert(payload: AlertPayload) {
  const recipients = payload.recipients || [
    { name: 'PHC Admin', role: 'PHC', contact: process.env.ALERT_EMAIL || 'alerts@maaraksha.demo' },
    { name: 'Family Contact', role: 'Family', contact: process.env.FAMILY_ALERT_EMAIL || 'family@maaraksha.demo' },
  ];

  const alert: {
    id: string;
    pregnancyId: string;
    womanName: string;
    riskLevel: string;
    type: 'email';
    message: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    createdAt: string;
    recipients: { name: string; role: string; contact: string; status: 'pending' | 'sent' | 'delivered' | 'failed' }[];
  } = {
    id: `alert-${Date.now()}`,
    pregnancyId: payload.pregnancyId,
    womanName: payload.womanName,
    riskLevel: payload.riskLevel,
    type: 'email' as const,
    message: payload.message,
    status: 'sent' as const,
    createdAt: new Date().toISOString(),
    recipients: recipients.map(r => ({
      ...r,
      status: transporter ? 'sent' as const : 'delivered' as const,
    })),
  };

  if (transporter && payload.riskLevel === 'RED') {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'MaaRaksha <alerts@maaraksha.in>',
        to: recipients.map(r => r.contact).join(','),
        subject: `🚨 MaaRaksha RED ALERT: ${payload.womanName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">MaaRaksha Emergency Alert</h1>
            <p><strong>Patient:</strong> ${payload.womanName}</p>
            <p><strong>Risk Level:</strong> ${payload.riskLevel}</p>
            <p><strong>Message:</strong> ${payload.message}</p>
            <p style="color: #666;">This is an automated alert from MaaRaksha Maternal Health Network.</p>
          </div>
        `,
      });
      alert.status = 'delivered';
      alert.recipients = alert.recipients.map(r => ({ ...r, status: 'delivered' }));
    } catch (err) {
      console.error('Email send failed:', err);
      alert.status = 'failed';
    }
  } else {
    console.log(`[DEMO ALERT] ${payload.riskLevel}: ${payload.womanName} - ${payload.message}`);
    alert.status = 'delivered';
  }

  return alert;
}

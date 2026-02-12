# Configure Email with Custom Domain (GoDaddy/Azure)

Setup email like `noreply@yourdomain.com` and `admin@yourdomain.com` with your custom domain.

---

## 📧 Option 1: GoDaddy Email Hosting (Easiest)

### 1. Purchase Email Plan

1. **GoDaddy Dashboard** → Your domain
2. Click **Email** section
3. Choose plan:
   - **Basic Email**: 1 user, $1.99/month
   - **Professional Email**: 5 users, $3.99/month
   - **Business Class Email**: 50 users, $5.99/month

4. Click the email plan → **Add to Cart** → **Checkout**

### 2. Create Email Address

1. GoDaddy Dashboard → **Email** → **Manage**
2. Click **Create Email Address**
3. Fill in:
   ```
   Username: noreply
   Email:    noreply@yourdomain.com
   Password: [Create strong password]
   ```
4. Click **Create**

**Create additional addresses:**
- admin@yourdomain.com
- support@yourdomain.com
- contact@yourdomain.com

### 3. Configure Application

Update `.env.local`:
```env
# Use SendGrid to send emails from custom domain
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Or use Gmail/SMTP
SMTP_HOST=smtp.godaddy.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-email-password
```

### 4. Update Azure Settings

```powershell
az webapp config appsettings set `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --settings `
    SENDGRID_API_KEY="your-key" `
    SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

---

## 📧 Option 2: Gmail (Google Workspace) - Recommended

### 1. Set Up Google Workspace

1. Visit: https://workspace.google.com
2. Click **Sign up now**
3. Enter your domain: `yourdomain.com`
4. Select plan (starting at $6/user/month)
5. Create super admin account:
   ```
   Email: admin@yourdomain.com
   Password: [Strong password]
   ```

### 2. Verify Domain Ownership

Google provides DNS records to add to GoDaddy:

#### Add TXT Record (Domain Verification)
1. GoDaddy Dashboard → **DNS Records**
2. Click **Add**
3. Fill in verification TXT record from Google
4. Save

#### Add MX Records (Mail Routing)
Add 5 MX records from Google (they provide these):
```
Priority 5:  gmail-smtp-in.l.google.com
Priority 10: alt1.gmail-smtp-in.l.google.com
Priority 20: alt2.gmail-smtp-in.l.google.com
Priority 30: alt3.gmail-smtp-in.l.google.com
Priority 40: alt4.gmail-smtp-in.l.google.com
```

**In GoDaddy DNS Records:**
```
Type:     MX
Priority: 5
Value:    gmail-smtp-in.l.google.com
```
(Repeat for all 5 MX records)

### 3. Configure SPF & DKIM (Optional but Recommended)

**SPF Record (Prevent email spoofing):**
```
Type:  TXT
Name:  @
Value: v=spf1 include:_spf.google.com ~all
```

**DKIM Records:** (Google provides these)
1. Google Workspace Admin → Security → Authenticate Email
2. Copy DKIM records
3. Add to GoDaddy DNS

### 4. Create Email Addresses

1. Google Workspace Admin Console
2. Users & accounts → Add user
3. Create:
   - noreply@yourdomain.com
   - support@yourdomain.com
   - admin@yourdomain.com

### 5. Configure Application

```env
# Using SendGrid (recommended for applications)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Or use Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com
```

**Generate Gmail App Password:**
1. Google Account → Security
2. Enable 2-Factor Authentication
3. Generate "App Password" for Mail
4. Use this in SMTP_PASSWORD

### 6. Test Email

```powershell
# Test from Azure
az webapp config appsettings set `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --settings `
    SENDGRID_API_KEY="your-key" `
    SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

---

## 📧 Option 3: SendGrid (Best for Production)

### 1. Create SendGrid Account

1. Visit: https://sendgrid.com
2. Sign up for free account (100 emails/day)
3. Verify email
4. Click **Create → API Key**
5. Name: "JobSphere App"
6. Copy the API key

### 2. Verify Sender Identity

1. SendGrid Dashboard → Sender Authentication
2. Click **Verify Single Sender** (or Domain)
3. For domain verification:
   - Enter: yourdomain.com
   - SendGrid provides CNAME records
   - Add to GoDaddy DNS

### 3. Add DNS Records (GoDaddy)

SendGrid provides CNAME records:
```
Name:  em1234.yourdomain.com
Value: sendgrid.net.
```

Add to GoDaddy DNS Records

### 4. Configure Application

```env
SENDGRID_API_KEY=SG.your-entire-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=JobSphere
```

### 5. Update Azure Settings

```powershell
az webapp config appsettings set `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --settings `
    SENDGRID_API_KEY="SG.your-key" `
    SENDGRID_FROM_EMAIL="noreply@yourdomain.com" `
    SENDGRID_FROM_NAME="JobSphere"
```

---

## 🛠️ Email Configuration in Next.js

### 1. Install Email Library

```bash
npm install nodemailer
```

### 2. Create Email Service

Create `lib/email.ts`:

```typescript
import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  // Option A: SendGrid
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey', // Always 'apikey'
    pass: process.env.SENDGRID_API_KEY,
  },
  
  // Option B: Gmail
  // service: 'gmail',
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASSWORD,
  // },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SENDGRID_FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });
    
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}
```

### 3. Use in API Routes

Example: Password reset email

```typescript
// app/api/auth/forgot-password/route.ts

import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();
  
  const resetToken = generateToken(); // Your token generation
  
  await sendEmail({
    to: email,
    subject: 'Reset Your Password - JobSphere',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="https://yourdomain.com/reset-password?token=${resetToken}">
        Reset Password
      </a>
      <p>Link expires in 1 hour.</p>
    `,
  });
  
  return Response.json({ success: true });
}
```

### 4. Welcome Email Example

```typescript
// On successful registration
await sendEmail({
  to: email,
  subject: `Welcome to JobSphere, ${name}!`,
  html: `
    <h2>Welcome to JobSphere!</h2>
    <p>Hello ${name},</p>
    <p>Your account has been created successfully.</p>
    <p>Start exploring job opportunities now:</p>
    <a href="https://yourdomain.com/jobs/search">Browse Jobs</a>
    <hr>
    <p><strong>Need help?</strong> Contact us at support@yourdomain.com</p>
  `,
});
```

---

## 🧪 Test Email Configuration

### Test SendGrid Connection

```bash
npm install --save-dev nodemailer

# Create test file
cat > test-email.js << 'EOF'
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

transporter.sendMail({
  from: process.env.SENDGRID_FROM_EMAIL,
  to: 'your-email@gmail.com',
  subject: 'Test Email from JobSphere',
  html: '<h1>If you see this, email is working!</h1>',
}, (err, info) => {
  if (err) console.log('Error:', err);
  else console.log('Email sent:', info.response);
  process.exit(0);
});
EOF

# Run test
SENDGRID_API_KEY=your-key SENDGRID_FROM_EMAIL=noreply@yourdomain.com node test-email.js
```

---

## ✅ Email Setup Checklist

### GoDaddy Email Hosting
- [ ] Email plan purchased
- [ ] Email addresses created (noreply@, admin@, support@)
- [ ] SMTP credentials obtained
- [ ] Application configured with SMTP settings
- [ ] Azure settings updated
- [ ] Test email sent successfully

### Gmail/Google Workspace
- [ ] Google Workspace domain verified
- [ ] MX records added to GoDaddy DNS
- [ ] SPF record added
- [ ] DKIM records added
- [ ] Email addresses created
- [ ] Gmail app password generated
- [ ] Application configured
- [ ] Test email sent successfully

### SendGrid
- [ ] SendGrid account created
- [ ] API key generated
- [ ] Sender identity verified
- [ ] CNAME records added to GoDaddy DNS (if domain verification)
- [ ] Application configured with API key
- [ ] Test email sent successfully

---

## 📋 Environment Variables Template

```env
# ==========================================
# Email Configuration (SendGrid)
# ==========================================
SENDGRID_API_KEY=SG.your-entire-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=JobSphere

# ==========================================
# Alternative: SMTP Configuration
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
SMTP_FROM_NAME=JobSphere

# ==========================================
# Email Settings
# ==========================================
EMAIL_SUPPORT=support@yourdomain.com
EMAIL_ADMIN=admin@yourdomain.com
```

---

## 🔍 Email Deliverability Tips

1. **Use SPF Records**
   ```
   v=spf1 include:sendgrid.net ~all
   ```

2. **Add DKIM Signature**
   - Sendgrid/Google provides this
   - Improves email delivery rate

3. **Monitor Email Reputation**
   - Visit: https://mxtoolbox.com
   - Check your IP reputation
   - Monitor bounce rates

4. **Handle Bounces**
   - Setup webhook to log bounced emails
   - Remove from future sends

5. **Test with Gmail**
   - Gmail is strictest on authentication
   - If it delivers to Gmail, it works everywhere

---

## 🚨 Common Issues

### Email Not Sending

**Check:**
1. API key is correct
2. From email is verified in SendGrid
3. Domain DNS records propagated
4. NEXTAUTH_URL uses custom domain
5. Check Azure app logs

### Emails Going to Spam

**Fix:**
1. Add SPF record
2. Add DKIM records
3. Verify domain in SendGrid
4. Use consistent from email
5. Add unsubscribe link (for bulk email)

### SendGrid 401 Unauthorized

**Fix:**
```bash
# Verify API key is correct
echo $SENDGRID_API_KEY

# Should output: SG.xxx...
# If empty, it's not set properly
```

---

## 📊 Cost Estimates

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **GoDaddy Email** | - | $1.99-5.99/user/month |
| **Google Workspace** | - | $6-18/user/month |
| **SendGrid** | 100/day | $19.95+ (5,000/month) |
| **AWS SES** | 62,000/month | $0.10 per 1,000 |

---

## 📚 Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Google Workspace Setup](https://support.google.com/a/answer/60218)
- [GoDaddy Email Help](https://www.godaddy.com/help/email)
- [Nodemailer Guide](https://nodemailer.com/smtp/)
- [SPF Record Setup](https://www.mail-tester.com/)

---

**Last Updated**: February 12, 2026  
**Status**: Ready for Email Configuration

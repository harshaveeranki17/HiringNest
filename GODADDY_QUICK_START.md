# GoDaddy + Azure Custom Domain - Quick Start

Visual step-by-step guide for connecting GoDaddy domain to Azure App Service.

## ⚡ 10-Minute Setup

### Step 1️⃣: Get Azure IP Address (2 minutes)

Run in PowerShell:
```powershell
az webapp show `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --query outboundIpAddresses `
  -o tsv
```

**Copy the first IP address from output**
Example: `20.95.123.45`

---

### Step 2️⃣: Configure GoDaddy DNS (5 minutes)

#### A. Open GoDaddy Dashboard
1. Visit: https://www.godaddy.com/
2. Click **Sign In** → Enter credentials
3. Click **Account** at top right

#### B. Find Your Domain
1. Look for "**My Products**" or "**Manage**"
2. Find your domain in the list (e.g., `yourdomain.com`)
3. Click **▼ Manage DNS** button next to domain

#### C. Add A Record
You'll see the DNS Records section:

1. Look for existing records (usually @ and www entries)
2. Click **Add** (or find the @ record and Edit it)
3. Fill in:
   ```
   Type:    A
   Name:    @ (means root domain, not www)
   Value:   20.95.123.45 (your Azure IP)
   TTL:     600
   ```
4. Click **Save**

**Visual Map:**
```
┌─────────────────────────────────────────┐
│ DNS Records                             │
├─────────────────────────────────────────┤
│ Type │ Name │ Value           │ TTL     │
├──────┼──────┼─────────────────┼─────────┤
│ A    │ @    │ 20.95.123.45    │ 600     │ ← ADD THIS
│ CNAME│ www  │ jobsphere-app...│ 3600    │ (already exists)
└─────────────────────────────────────────┘
```

#### D. (Optional) Add www CNAME
1. Click **Add**
2. Fill in:
   ```
   Type:    CNAME
   Name:    www
   Value:   jobsphere-app.azurewebsites.net
   TTL:     600
   ```
3. Click **Save**

**Wait 5 minutes for DNS to propagate**

---

### Step 3️⃣: Azure Portal Setup (2 minutes)

#### A. Open Azure Portal
1. Visit: https://portal.azure.com
2. Search for: **App Services**
3. Click **jobsphere-app**

#### B. Add Custom Domain
1. Left sidebar → **Settings** → **Custom domains**
2. Click **+ Add custom domain**
3. Enter: `yourdomain.com` (without www or https://)
4. Click **Next: Validate**

#### C. Validate Domain
Azure auto-detects your A record ✅

If it says "Invalid":
1. Wait 2-3 minutes for DNS propagation
2. Click **Validate** again

Once validated, click **Next: Bind SSL**

#### D. Bind SSL Certificate
1. Choose **Managed Certificate** (free, auto-renews) ✅
2. Click **Add binding**

**Done!** Azure creates SSL certificate automatically

---

### Step 4️⃣: Test Your Domain (1 minute)

Open browser and visit:
```
https://yourdomain.com
```

✅ Should show your JobSphere application!

---

## 🔍 DNS Propagation Check

If domain doesn't work immediately:

1. Visit: https://www.whatsmydns.net
2. Enter: `yourdomain.com`
3. Wait for all DNS servers to show your Azure IP ✅

**Visual:**
```
DNSNameServer        Status
───────────────────────────────────────
ns1.p03.godaddy.com   ✅ 20.95.123.45
ns2.p03.godaddy.com   ✅ 20.95.123.45
ns3.p03.godaddy.com   ✅ 20.95.123.45
ns4.p03.godaddy.com   ✅ 20.95.123.45
8.8.8.8              ✅ 20.95.123.45
1.1.1.1              ✅ 20.95.123.45
```

Once all show ✅, domain is live!

---

## 🔐 Update Application Settings

After custom domain is live:

```powershell
# Update NEXTAUTH_URL to custom domain
az webapp config appsettings set `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --settings NEXTAUTH_URL="https://yourdomain.com"
```

---

## 💻 GoDaddy Dashboard - Screenshots

### Finding DNS Records
```
GoDaddy.com
├── Account (top right)
│
├── My Products
│   └── yourdomain.com
│       └── ▼ Manage DNS ← CLICK HERE
│
└── You'll see:
    ┌─────────────────────────────────┐
    │ DNS Records                     │
    ├─────────────────────────────────┤
    │ (list of existing records)      │
    │                                 │
    │ [+ Add]  [Edit]  [Delete]       │
    └─────────────────────────────────┘
```

### Adding A Record
```
┌─────────────────────────────────┐
│ Add A Record                    │
├─────────────────────────────────┤
│                                 │
│ Type:    A            ▼         │
│ Name:    @                      │
│ Value:   20.95.123.45           │
│ TTL:     600          ▼         │
│                                 │
│         [Save]  [Cancel]        │
└─────────────────────────────────┘
```

---

## ✅ Verification Checklist (Before Going Live)

```
PRE-DEPLOYMENT
├── [ ] Can access: https://yourdomain.com
├── [ ] Can access: https://www.yourdomain.com
├── [ ] SSL shows valid (🔒 green padlock)
├── [ ] Azure Portal shows domain as verified
├── [ ] NEXTAUTH_URL updated to custom domain
├── [ ] Google OAuth URLs updated (if using)
└── [ ] DNS shows correct IP (whatsmydns.net)

LIVE VERIFICATION
├── [ ] Login page works: https://yourdomain.com/login
├── [ ] Register page works: https://yourdomain.com/register
├── [ ] Job search works: https://yourdomain.com/jobs/search
├── [ ] Dashboard accessible after login
├── [ ] No SSL warnings
├── [ ] No redirect loops
└── [ ] API endpoints responding
```

---

## 🚨 Common Issues

### Domain Shows "ERR_NAME_NOT_RESOLVED"
**Cause**: DNS not propagated yet
**Fix**: 
- Wait 5-15 minutes
- Clear browser cache: `Ctrl+Shift+Delete`
- Try incognito window

### Azure Portal Says "Domain Not Verified"
**Cause**: A record not detected yet
**Fix**:
- Go to GoDaddy and double-check A record
- Wait 2-3 minutes
- Click "Validate" again in Azure

### SSL Certificate Won't Bind
**Cause**: Domain not verified
**Fix**:
- Ensure domain is verified FIRST
- Delete domain binding and re-add
- Use Azure-managed certificate (free)

### www. Not Working
**Cause**: Missing CNAME record
**Fix**:
- Add CNAME record in GoDaddy:
  ```
  Name:  www
  Type:  CNAME
  Value: jobsphere-app.azurewebsites.net
  ```
- Add domain binding in Azure for www.yourdomain.com

### Login Keeps Redirecting
**Cause**: NEXTAUTH_URL points to old URL
**Fix**:
```powershell
az webapp config appsettings set `
  --resource-group jobsphere-rg `
  --name jobsphere-app `
  --settings NEXTAUTH_URL="https://yourdomain.com"
```

---

## 🎯 DNS Record Reference Table

| What to Add | GoDaddy Field | Value |
|-------------|---------------|-------|
| Root domain points to Azure | Type: A, Name: @ | 20.95.123.45 |
| www subdomain works | Type: CNAME, Name: www | jobsphere-app.azurewebsites.net |
| Email (optional) | Type: MX, Name: @ | mail.yourdomain.com |

---

## 🔗 Useful Links

- **GoDaddy DNS Help**: https://www.godaddy.com/help/manage-dns-for-your-domain-680
- **Check DNS Propagation**: https://www.whatsmydns.net
- **Azure Custom Domain Docs**: https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain
- **Azure Portal**: https://portal.azure.com

---

## 🎓 Understanding the Setup

```
Internet User visits: https://yourdomain.com
        ↓
GoDaddy DNS resolves: yourdomain.com → 20.95.123.45
        ↓
Routes to Azure IP: 20.95.123.45
        ↓
Azure App Service recognizes domain binding
        ↓
Loads JobSphere application ✅
        ↓
SSL certificate validates (Azure-managed)
        ↓
Shows green 🔒 padlock
```

---

## ✨ Pro Tips

1. **Keep Azure default URL working too**
   - Both URLs work: yourdomain.com + jobsphere-app.azurewebsites.net
   - Good for internal testing

2. **Always use www**
   - `yourdomain.com` + `www.yourdomain.com`
   - Better SEO and redundancy

3. **Monitor SSL expiration**
   - Azure auto-renews (check yearly)
   - Portal shows status in Custom domains section

4. **Use TTL 600 for DNS**
   - Faster propagation during testing
   - Change to 3600 for production

5. **Test OAuth immediately**
   - Login/register should still work
   - Check Google OAuth callback URL updated

---

## 📱 Final Checklist

- [ ] Domain purchased from GoDaddy
- [ ] A record added in GoDaddy (@ → Azure IP)
- [ ] CNAME record added in GoDaddy (www → Azure URL)
- [ ] Domain verified in Azure Portal
- [ ] SSL certificate bound in Azure
- [ ] NEXTAUTH_URL updated to custom domain
- [ ] Google OAuth callback updated (if applicable)
- [ ] `https://yourdomain.com` loads successfully
- [ ] `https://www.yourdomain.com` loads successfully
- [ ] Login/register works on custom domain
- [ ] No SSL warnings or errors

---

**You're all set!** 🚀 Your JobSphere app is now live on your custom domain!

**Last Updated**: February 12, 2026

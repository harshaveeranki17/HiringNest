# Domain Configuration for HiringNest

Complete guide to set up your custom domain for Azure App Service deployment.

## 📋 Prerequisites

- Azure App Service already running (e.g., `jobsphere-app.azurewebsites.net`)
- Custom domain purchased (GoDaddy, Namecheap, Route53, etc.)
- Domain registrar admin access
- Azure Portal access

---

## 🎯 Step 1: Get Your Azure App Service IP Address

### 1.1 Find Virtual IP Address
```bash
# Get the IP address of your App Service
az webapp show \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --query outboundIpAddresses \
  -o tsv
```

**Output example**: `20.95.123.45, 20.94.200.10, ...`

The first IP is your primary address.

### 1.2 Alternative: Using Azure Portal
1. Go to Azure Portal → App Services → jobsphere-app
2. Left sidebar → Settings → Properties
3. Look for **Virtual IP Address** or **Inbound IP Addresses**
4. Copy the first IP address

---

## 🌐 Step 2: Configure GoDaddy DNS (Most Popular)

### 2.1 Login to GoDaddy
1. Visit: https://www.godaddy.com
2. Sign in to your account
3. Click "Products" → Select your domain

### 2.2 Add A Record (Points domain to Azure IP)

1. Select domain → **Manage DNS**
2. Find **DNS Records** section
3. Click **Add** and select type **A**

**Configure as follows:**
```
Type:     A
Name:     @ (or leave blank - means root domain)
Value:    20.95.123.45 (your Azure IP from Step 1)
TTL:      600 (or default)
```

**Click Save**

### 2.3 Add www Subdomain (Optional but Recommended)

1. Click **Add** and select type **CNAME**

**Configure as follows:**
```
Type:     CNAME
Name:     www
Value:    jobsphere-app.azurewebsites.net (your Azure app name)
TTL:      600 (or default)
```

**Click Save**

### 2.4 Complete DNS Records Example

| Type | Name | Value |
|------|------|-------|
| A | @ | 20.95.123.45 |
| CNAME | www | jobsphere-app.azurewebsites.net |
| TXT | @ | (Azure verification token - see Step 3) |

---

## 🌐 Step 3: Add Custom Domain to Azure App Service

### 3.1 Via Azure Portal

1. **Azure Portal** → App Services → jobsphere-app
2. Left sidebar → **Settings** → **Custom domains**
3. Click **+ Add custom domain**

### 3.2 Enter Domain Name
```
Enter: yourdomain.com
(without www or https://)
```

### 3.3 Verify Domain Ownership

Azure will show a dialog with verification options:

**Option A: A Record (Recommended)**
- Your domain already points to Azure IP ✅
- Click **Validate**
- Azure should auto-detect and validate

**Option B: TXT Record**
If A record validation fails:
1. Copy the TXT token provided by Azure
2. Go to GoDaddy → DNS Records
3. Click **Add** → Type: **TXT**
```
Type:  TXT
Name:  @ (or blank)
Value: (paste Azure's TXT token)
TTL:   600
```
4. Click Save and wait 5-10 minutes for propagation
5. Return to Azure and click **Validate**

### 3.4 Bind SSL Certificate

Once domain is verified:
1. Azure shows your domain in the list
2. Select domain and click **Add binding**
3. Choose **HTTPS/SSL**
4. For certificate, select:
   - **Azure-managed certificate** (free, auto-renews) ✅ **RECOMMENDED**
   - Or upload your own if you have one

### 3.5 Click Add Binding

Azure will:
- Generate SSL certificate automatically
- Apply to your custom domain
- Redirect HTTP to HTTPS

---

## 🔄 Step 4: DNS Propagation & Testing

### 4.1 Check DNS Propagation

Use online tools:
- https://www.whatsmydns.net
- https://dnschecker.org

**Search for your domain**: yourdomain.com

Wait until all nameservers show your Azure IP ✅

### 4.2 Test Your Domain

```bash
# Via Windows PowerShell
nslookup yourdomain.com

# Via macOS/Linux Terminal
dig yourdomain.com

# Check CNAME for www
nslookup www.yourdomain.com
```

**Expected output:**
```
yourdomain.com      IN      A      20.95.123.45
www.yourdomain.com  IN      CNAME  jobsphere-app.azurewebsites.net
```

### 4.3 Test in Browser

1. Open browser
2. Visit: `https://yourdomain.com` ✅
3. Should load your JobSphere app
4. Check SSL certificate (click 🔒 padlock)
5. Should show green checkmark ✅

---

## 📧 Step 5: Update Application Settings

### 5.1 Configure NEXTAUTH_URL

Update environment variable to use custom domain:

```bash
az webapp config appsettings set \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --settings \
    NEXTAUTH_URL="https://yourdomain.com"
```

### 5.2 Update Google OAuth Callback URL

If using Google OAuth:

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click your OAuth 2.0 Client ID
5. Update **Authorized redirect URIs**:

**Remove old:**
```
https://jobsphere-app.azurewebsites.net/api/auth/callback/google
```

**Add new:**
```
https://yourdomain.com/api/auth/callback/google
https://www.yourdomain.com/api/auth/callback/google
```

6. Click **Save**

### 5.3 Update Other OAuth Providers

Do the same for:
- LinkedIn OAuth
- GitHub OAuth
- Any other social login providers

---

## 🔐 Step 6: HTTPS & Security Configuration

### 6.1 Force HTTPS Redirect

```bash
az webapp update \
  --resource-group jobsphere-rg \
  --name jobsphere-app \
  --set httpsOnly=true
```

### 6.2 Set Security Headers

Update `web.config`:

```xml
<httpProtocol>
  <customHeaders>
    <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
    <add name="X-Frame-Options" value="SAMEORIGIN" />
    <add name="X-Content-Type-Options" value="nosniff" />
  </customHeaders>
</httpProtocol>
```

### 6.3 Configure CORS for Custom Domain

In your Next.js API routes (`api/` folder):

```typescript
// Add to API route handlers
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

## 🌍 Other Domain Registrars Configuration

### Namecheap
1. Login → Dashboard → Manage
2. Go to **Advanced DNS**
3. Add A Record pointing to Azure IP
4. Add CNAME record for www
5. Same Azure verification steps

### GoDaddy with NameServers (Alternative Method)
1. In GoDaddy, change **Nameservers** to Azure DNS:
   - ns1-01.azure-dns.com
   - ns2-01.azure-dns.net
   - ns3-01.azure-dns.org
   - ns4-01.azure-dns.info

2. Create Azure DNS Zone:
   ```bash
   az network dns zone create \
     --resource-group jobsphere-rg \
     --name yourdomain.com
   ```

3. Create A record in Azure DNS:
   ```bash
   az network dns record-set a add-record \
     --resource-group jobsphere-rg \
     --zone-name yourdomain.com \
     --record-set-name @ \
     --ipv4-address 20.95.123.45
   ```

### Route53 (AWS)
1. Create hosted zone for your domain
2. Add A record pointing to Azure IP
3. Update Route53 nameservers in domain registrar
4. Same Azure verification steps

---

## 📝 DNS Record Reference

### Standard Setup (GoDaddy Example)

| Type | Name | TTL | Value |
|------|------|-----|-------|
| A | @ | 600 | 20.95.123.45 |
| CNAME | www | 600 | jobsphere-app.azurewebsites.net |

### With Email (Optional)

| Type | Name | TTL | Value |
|------|------|-----|-------|
| A | @ | 600 | 20.95.123.45 |
| CNAME | www | 600 | jobsphere-app.azurewebsites.net |
| MX | @ | 3600 | mail.yourdomain.com (or email provider) |
| TXT | @ | 3600 | v=spf1 include:_spf.google.com ~all |

---

## 🆘 Troubleshooting

### Issue: "Domain Not Verified"

**Solution:**
1. Check A record points to correct Azure IP
2. Wait 15-30 minutes for DNS propagation
3. Clear browser cache (Ctrl+Shift+Delete)
4. Use incognito/private window
5. Try TXT record verification method

### Issue: "SSL Certificate Not Working"

**Solution:**
```bash
# Check HTTPS binding
az webapp config ssl list \
  --resource-group jobsphere-rg \
  --name jobsphere-app

# If needed, delete and re-add domain
az webapp config hostname delete \
  --resource-group jobsphere-rg \
  --webapp-name jobsphere-app \
  --hostname yourdomain.com

# Then re-add with Create Custom Domain process
```

### Issue: "Redirects Loop (HTTP to HTTPS)"

**Solution:**
1. Disable HTTP redirect if enabled double
2. Check only ONE redirect rule in web.config
3. Verify NEXTAUTH_URL uses https://

### Issue: "Domain Shows 'Not Found' Error"

**Solution:**
1. Verify A record in DNS
2. Run: `nslookup yourdomain.com`
3. Check it returns Azure IP
4. Wait for DNS cache clear (5-30 minutes)

### Issue: "www Not Working"

**Solution:**
1. Ensure CNAME record for www exists:
   ```
   Name:  www
   Value: jobsphere-app.azurewebsites.net
   ```
2. Add www domain to Azure (separate binding):
   ```bash
   az webapp config hostname add \
     --resource-group jobsphere-rg \
     --webapp-name jobsphere-app \
     --hostname www.yourdomain.com
   ```

### Issue: "Can't Access via Azure Domain After Custom Domain"

**Solution:**
Both URLs will work:
- ✅ `https://yourdomain.com` (custom domain)
- ✅ `https://jobsphere-app.azurewebsites.net` (Azure domain)

This is normal. Update only environment variables to custom domain.

---

## ✅ Verification Checklist

- [ ] Domain purchased from GoDaddy (or other registrar)
- [ ] A record pointing to Azure IP
- [ ] CNAME record for www pointing to Azure default URL
- [ ] Azure Portal shows custom domain verified
- [ ] SSL certificate auto-generated or uploaded
- [ ] HTTPS enforced in App Service
- [ ] `https://yourdomain.com` loads successfully
- [ ] `https://www.yourdomain.com` loads successfully
- [ ] SSL certificate shows valid (🔒 padlock shows green)
- [ ] NEXTAUTH_URL updated to custom domain
- [ ] Google OAuth redirect URI updated
- [ ] Email notifications configured (if applicable)
- [ ] Security headers configured
- [ ] DNS propagation complete (all servers show correct IP)

---

## 🚀 Quick Summary

1. **Get Azure IP**: `az webapp show ... --query outboundIpAddresses`
2. **GoDaddy DNS**:
   - Add A record: `@ → 20.95.123.45`
   - Add CNAME record: `www → jobsphere-app.azurewebsites.net`
3. **Azure Portal**: Custom domains → Add domain → Validate → Bind HTTPS
4. **Update Settings**: NEXTAUTH_URL, OAuth, Security headers
5. **Test**: `https://yourdomain.com` should work ✅

---

## 💡 Pro Tips

1. **Use www subdomain too**: Adds redundancy and better SEO
2. **Enable HTTP → HTTPS redirect**: Already done with httpsOnly=true
3. **Monitor SSL certificate expiration**: Azure auto-renews, but monitor anyway
4. **Update DNS slowly**: Don't change multiple records at once
5. **Use TTL 3600** (1 hour) for production, 600 (10 min) for testing
6. **Test OAuth login** immediately after setup
7. **Configure email domain records** if adding email (SPF, DKIM, DMARC)

---

## 📚 Additional Resources

- [Azure Custom Domain Documentation](https://learn.microsoft.com/azure/app-service/app-service-web-tutorial-custom-domain)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-for-your-domain-680)
- [SSL/TLS Certificates](https://learn.microsoft.com/azure/app-service/configure-ssl-certificate)
- [Azure DNS Zones](https://learn.microsoft.com/azure/dns/dns-zones-records)

---

## 📞 Support

- **GoDaddy Support**: https://www.godaddy.com/help
- **Azure Support**: https://support.microsoft.com/azure
- **DNS Checker**: https://dnschecker.org/

---

**Last Updated**: February 12, 2026  
**Status**: Ready for Custom Domain Deployment

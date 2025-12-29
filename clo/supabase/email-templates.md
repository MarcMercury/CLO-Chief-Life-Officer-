# CLO Supabase Email Templates

Go to your **Supabase Dashboard** → **Authentication** → **Email Templates** and paste these templates.

> **Note**: Supabase uses `{{ .Variable }}` syntax for template variables.

---

## 1. Confirm Signup

**Subject Line:**
```
Welcome to CLO — Confirm your email ✨
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your CLO account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🌟</div>
              <h1 style="margin: 0; color: #e0e0e0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                Welcome to CLO
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                You're one step away from becoming the <strong style="color: #e17055;">Chief Life Officer</strong> of your own life.
              </p>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                Confirm your email to start managing your relationships, home, and personal growth — all in one beautiful place.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e17055; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Confirm Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Features Preview -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" style="background-color: rgba(255,255,255,0.03); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">
                      What awaits you
                    </p>
                    <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.8;">
                      💝 Nurture your relationships<br>
                      🏠 Manage your home & life<br>
                      ✨ Grow into your best self
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you didn't create a CLO account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Logo -->
        <table width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="color: #444; font-size: 12px; margin: 0;">
                CLO — Chief Life Officer
              </p>
              <p style="color: #333; font-size: 11px; margin: 4px 0 0;">
                Take command of your life
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Invite User (Nest Invitations)

**Subject Line:**
```
You've been invited to connect on CLO 💌
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to CLO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">💌</div>
              <h1 style="margin: 0; color: #e0e0e0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                You're Invited to Connect
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                Someone special wants to create a private <strong style="color: #e17055;">Nest</strong> with you on CLO — Chief Life Officer.
              </p>
              
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                A Nest is a shared space where you can stay connected, share memories, track shared tasks, and nurture your relationship together.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e17055; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- What is CLO -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" style="background-color: rgba(225,112,85,0.1); border-radius: 12px; border: 1px solid rgba(225,112,85,0.2);">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #e17055; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                      What is CLO?
                    </p>
                    <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.6;">
                      CLO helps you nurture the relationships that matter most. Create shared spaces, track memories, and stay connected with the people you love.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Logo -->
        <table width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="color: #444; font-size: 12px; margin: 0;">
                CLO — Chief Life Officer
              </p>
              <p style="color: #333; font-size: 11px; margin: 4px 0 0;">
                Nurturing the relationships that matter most
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Magic Link

**Subject Line:**
```
Your CLO login link 🔐
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to CLO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
              <h1 style="margin: 0; color: #e0e0e0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                Sign in to CLO
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                Click the button below to securely sign in to your CLO account. No password needed!
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e17055; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Sign In to CLO
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Security Note -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" style="background-color: rgba(255,255,255,0.03); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 8px;">
                      🛡️ Security Note
                    </p>
                    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.5;">
                      This link expires in 24 hours and can only be used once. If you didn't request this, someone may have entered your email by mistake.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Logo -->
        <table width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="color: #444; font-size: 12px; margin: 0;">
                CLO — Chief Life Officer
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Change Email Address

**Subject Line:**
```
Confirm your new email address 📧
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">📧</div>
              <h1 style="margin: 0; color: #e0e0e0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                Confirm Your New Email
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 16px; line-height: 1.6; margin: 0 0 24px; text-align: center;">
                You requested to change your CLO email address. Click below to confirm this change.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e17055; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Warning -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" style="background-color: rgba(231, 76, 60, 0.1); border-radius: 12px; border: 1px solid rgba(231, 76, 60, 0.2);">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #e74c3c; font-size: 12px; margin: 0 0 8px;">
                      ⚠️ Didn't request this?
                    </p>
                    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.5;">
                      If you didn't request this email change, please secure your account immediately by changing your password.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                This link will expire in 24 hours.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Logo -->
        <table width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="color: #444; font-size: 12px; margin: 0;">
                CLO — Chief Life Officer
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Reset Password

**Subject Line:**
```
Reset your CLO password 🔑
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🔑</div>
              <h1 style="margin: 0; color: #e0e0e0; font-size: 24px; font-weight: 300; letter-spacing: 0.5px;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 16px; line-height: 1.6; margin: 0 0 8px; text-align: center;">
                No worries, it happens to the best of us!
              </p>
              <p style="color: #888; font-size: 14px; line-height: 1.6; margin: 0 0 30px; text-align: center;">
                Click the button below to set a new password for your CLO account.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #e17055; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Security Tips -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" style="background-color: rgba(255,255,255,0.03); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #666; font-size: 12px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">
                      🛡️ Password Tips
                    </p>
                    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6; text-align: left;">
                      • Use at least 8 characters<br>
                      • Mix letters, numbers & symbols<br>
                      • Avoid common words or patterns
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px; border-top: 1px solid #333;">
              <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Footer Logo -->
        <table width="100%" style="max-width: 500px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="color: #444; font-size: 12px; margin: 0;">
                CLO — Chief Life Officer
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## How to Apply These Templates

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your CLO project
3. Navigate to **Authentication** → **Email Templates**
4. For each template type:
   - Copy the **Subject Line** into the "Subject" field
   - Copy the **HTML Body** into the "Body" field (make sure HTML is enabled)
5. Click **Save** for each template

## Template Variables Reference

Supabase provides these variables you can use:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The link the user clicks to confirm |
| `{{ .Token }}` | The raw token (if you need to build custom URLs) |
| `{{ .TokenHash }}` | Hashed version of the token |
| `{{ .SiteURL }}` | Your configured site URL |
| `{{ .Email }}` | The user's email address |

---

## Design Notes

- **Color Palette**: Dark theme matching the CLO app
  - Background: `#0a0a0a`
  - Card: `#1a1a1a`
  - Accent: `#e17055` (coral/orange)
  - Text: `#e0e0e0` (light), `#888` (muted), `#666` (subtle)
  
- **Typography**: System fonts for maximum compatibility
- **Responsive**: Works on all email clients and devices
- **Accessible**: Good contrast ratios and readable font sizes

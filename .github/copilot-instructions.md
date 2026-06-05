# GitHub Copilot Instructions for VIXUAL

## Project Overview

**VIXUAL** is a TypeScript/Next.js application with premium profile management, admin controls, and multiple interface versions (V1, V2, V3). The project prioritizes stability, user experience, and seamless admin workflows.

**Repository**: `Joceles3r/VIXUAL_080426`  
**Tech Stack**: TypeScript (94.1%), JavaScript (2.8%), PL/pgSQL (1.8%), CSS (1.3%)

---

## Core Principles

1. **Stability First**: Never break existing modules or features without explicit requirements.
2. **Targeted Fixes Only**: Apply only what is required; avoid unnecessary refactoring or scope creep.
3. **Backward Compatibility**: Ensure all changes maintain compatibility with V1, V2, and V3.
4. **Clear Intent**: Every change should have a specific business purpose documented in commits.

---

## Project Context & Recent Developments

### Current Status (05/06/2026)

VIXUAL is progressing well with the following active initiatives:

- **Admin Direct Access**: ADMIN/PATRON accounts should redirect to `/admin` immediately after login.
- **Visual Consistency**: CTA buttons in V1 must use the VIXUAL logo gradient.
- **V2 Profile Management**: "Créateurs V2" terminology replaced with "Profils V2".
- **Media Management**: Drag & drop functionality for homepage media, with temporary support for Render deployments (awaiting Bunny configuration).

### Key Deployment: Render

The application is deployed on Render. Note:
- `/public` directory changes may not persist across redeploys.
- Environment variables control feature availability (e.g., Bunny configuration).
- Use `dataUrl` fallbacks for images when external storage is unavailable.

---

## Code Conventions

### File Structure

```
app/                    # Next.js app directory
  login/page.tsx       # Login page (handles ADMIN redirect)
  admin/               # Admin module
  api/admin/           # Admin-related API routes
components/
  vixual-logo.tsx      # Logo with official gradient
  vixual-header.tsx    # Header with conditionally rendered tabs
  home/
    home-v1-premium.tsx     # V1 CTA buttons
    home-v2-preserved.tsx   # V2 interface
  admin/
    media-dropzone.tsx      # Drag & drop interface
lib/
  homepage-config.ts   # Homepage configuration fallbacks
```

### Styling & Gradients

**Official VIXUAL Logo Gradient**:
```css
linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)
```

All V1 primary CTA buttons must use this gradient with shadow:
```typescript
const VIXUAL_LOGO_GRADIENT = "linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)"

style={{
  backgroundImage: VIXUAL_LOGO_GRADIENT,
  boxShadow: "0 12px 40px -8px rgba(168, 85, 247, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
}}
```

### Environment Variables

**Render Deployment**:
- `NEXT_PUBLIC_ADMIN_EMAIL`: Admin account email (defaults to `jocelyndru@gmail.com`)
- `BUNNY_STORAGE_API_KEY`, `BUNNY_CDN_HOSTNAME`: When configured, enable production-grade media storage

**Bunny Integration Status**: Not yet fully configured; temporary client-side `dataUrl` fallbacks are acceptable for images ≤ 2 MB.

---

## Critical Features & Gotchas

### ⚠️ ADMIN Direct Redirect (Recent Fix)

**Issue**: After ADMIN login, the redirect to `/dashboard` sometimes causes an error: "La page d'accueil rencontre un problème"

**Solution** (`app/login/page.tsx`):
```typescript
await login(formData.email, formData.password)

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() || "jocelyndru@gmail.com"
const nextRoute = formData.email.trim().toLowerCase() === adminEmail ? "/admin" : "/dashboard"

router.replace(nextRoute)
```

**Why**: ADMIN accounts must bypass the homepage on initial login to avoid instability.

### ⚠️ CTA V1 Gradient Consistency

**Issue**: V1 CTA buttons inconsistent with the logo gradient.

**Solution**: Update all primary buttons in `components/home/home-v1-premium.tsx` to match the official gradient. Do not change the logo itself.

### ⚠️ V2 Terminology & Icons

**Issue**: "Créateurs V2" and Crown icon inappropriate for profile management.

**Solution**:
- Replace "Créateurs V2" → "Profils V2" everywhere in V2 components.
- Replace `Crown` icon → `UserCircle` for profile-related tabs.
- Primary file: `components/home/home-v2-preserved.tsx`

### ⚠️ Drag & Drop Behavior on Render (Before Bunny)

**Issue**: Media upload API fails on Render when Bunny is not configured.

**Solution** (`components/admin/media-dropzone.tsx`):
- For images ≤ 2 MB: Fall back to client-side `dataUrl` conversion.
- Display user message: *"Image appliquée en mode temporaire Render. Bunny prendra le relais dès configuration."*
- For videos: Display error message requiring Bunny configuration.

```typescript
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// In handleConfirm catch block:
if (file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024) {
  const dataUrl = await fileToDataUrl(file)
  setUploaded(true)
  onUploaded(dataUrl, false)
  setError(null)
  return
}
```

### ⚠️ Homepage Config Fallback

**Rule**: Never remove or break the fallback in `lib/homepage-config.ts`:
```typescript
remoteOrLocalConfig ?? DEFAULT_HOMEPAGE_CONFIG
```

**Why**: Ensures the homepage never breaks with a blank page.

---

## Modules NOT to Modify

These areas are stable and out-of-scope unless explicitly required:

- ❌ Stripe integration
- ❌ Full Bunny.net configuration (use fallbacks only)
- ❌ Auth API (except login redirect)
- ❌ Global ADMIN module structure
- ❌ Employee management
- ❌ Security policies
- ❌ Financial/billing rules
- ❌ V1/V2/V3 deep refactoring

---

## Testing Checklist

After making changes, verify:

- [ ] Admin login redirects to `/admin` without errors
- [ ] No homepage error appears for ADMIN accounts
- [ ] V1 CTA buttons display the exact VIXUAL gradient
- [ ] "Profils V2" label is present; "Créateurs V2" is absent
- [ ] V2 tabs use `UserCircle` icon, not Crown
- [ ] Drag & drop images work on Render (dataUrl fallback)
- [ ] Video uploads display Bunny requirement message
- [ ] Existing ADMIN modules remain functional
- [ ] Stripe, Auth, and other modules unaffected

---

## Commit Message Format

Use clear, targeted commit messages referencing the specific fix:

```bash
git commit -m "fix: admin redirect to /admin on login, gradient CTA V1, V2 profiles tab, media fallback"
```

For related commits:
```bash
git commit -m "fix(admin): direct /admin redirect for ADMIN accounts post-login"
git commit -m "fix(cta): apply VIXUAL gradient to V1 primary buttons"
git commit -m "fix(v2): rename 'Créateurs V2' to 'Profils V2' with UserCircle icon"
git commit -m "fix(media): fallback dataUrl for images on Render before Bunny"
```

---

## Deployment Notes

**Build & Deploy on Render**:
```bash
pnpm install
pnpm lint
pnpm build
git add .
git commit -m "fix: [targeted description]"
git push
```

Render will automatically redeploy from the GitHub repository.

**Environment Variables on Render**:
- Ensure `NEXT_PUBLIC_ADMIN_EMAIL` is set to admin email.
- When Bunny is ready, add `BUNNY_STORAGE_API_KEY`, `BUNNY_CDN_HOSTNAME`, and update the upload API.

---

## When to Ask for Clarification

Before proceeding, ask the user if:

1. A change affects production behavior (security, payment, data).
2. Multiple versions (V1/V2/V3) are involved and unclear which to modify.
3. A feature intersects with Stripe, Bunny, or Auth APIs.
4. The scope seems to exceed the stated requirements.

---

## Quick Reference: Key Files

| File | Purpose | Modify If |
|------|---------|-----------|
| `app/login/page.tsx` | Authentication & routing | ADMIN redirect needed |
| `components/vixual-logo.tsx` | Official branding | Gradient reference only |
| `components/vixual-header.tsx` | Navigation & tabs | Admin visibility rules |
| `components/home/home-v1-premium.tsx` | V1 interface & CTAs | Button styling or copy |
| `components/home/home-v2-preserved.tsx` | V2 interface | V2 labels or tabs |
| `components/admin/media-dropzone.tsx` | Drag & drop upload | Media handling logic |
| `app/api/admin/upload-homepage-media/route.ts` | Upload endpoint | Error handling or fallback rules |
| `lib/homepage-config.ts` | Config fallback | Config merge logic only |

---

## Final Directive

Apply only the corrections explicitly stated in your requirements. VIXUAL is progressing well; use targeted fixes to maintain momentum without introducing unnecessary risk or complexity.

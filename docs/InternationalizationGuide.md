# Internationalization Guide

This document describes the internationalization (i18n) implementation in Votive, covering the frontend React application with react-i18next.

## Overview

Votive supports **English** and **Polish** languages using:
- **react-i18next** - React bindings for i18next
- **i18next-browser-languagedetector** - Automatic language detection
- **Feature-based namespaces** - Translations organized by application area

## Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | Default, fallback |
| `pl` | Polish | Full support |

---

## Project Structure

```
app/src/i18n/
├── config.ts                    # i18next configuration
├── index.ts                     # Barrel export
└── resources/
    ├── en/                      # English translations
    │   ├── common.json          # Shared UI strings
    │   ├── landing.json         # Landing page
    │   ├── header.json          # Navigation/header
    │   ├── assessment.json      # Assessment wizard
    │   ├── insights.json        # AI analysis display
    │   ├── auth.json            # Authentication flows
    │   └── profile.json         # User profile/settings
    └── pl/                      # Polish translations (mirror structure)
        ├── common.json
        ├── landing.json
        ├── header.json
        ├── assessment.json
        ├── insights.json
        ├── auth.json
        └── profile.json
```

---

## Namespaces

Translations are split by feature area to:
- Keep files manageable
- Enable code-splitting potential
- Clarify ownership of translation keys

| Namespace | Purpose | Key Sections |
|-----------|---------|--------------|
| `common` | Shared strings across features | progress, dates, view modes |
| `landing` | Landing page | nav, hero, philosophy, journey, insights, cta, footer |
| `header` | Navigation/header | nav, buttons, viewOnly, errors, theme |
| `assessment` | Assessment wizard | welcome, phases, synthesis, navigation |
| `insights` | AI analysis display | noAssessment, ready, loading, error, tabs, cards, synthesis |
| `auth` | Authentication | login, register, forgotPassword, resetPassword, verifyEmail, validation |
| `profile` | User profile/settings | tabs, profileTab, passwordTab, assessmentsTab, analysesTab, dangerTab |

---

## Configuration

The i18next configuration in `app/src/i18n/config.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation resources
import enCommon from '@/i18n/resources/en/common.json';
import enLanding from '@/i18n/resources/en/landing.json';
// ... other imports

const resources = {
  en: {
    common: enCommon,
    landing: enLanding,
    // ... other namespaces
  },
  pl: {
    common: plCommon,
    landing: plLanding,
    // ... other namespaces
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'landing', 'header', 'assessment', 'insights', 'auth', 'profile'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'votive-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Key Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `fallbackLng` | `'en'` | Use English when translation missing |
| `defaultNS` | `'common'` | Default namespace when not specified |
| `lookupLocalStorage` | `'votive-language'` | localStorage key for persistence |
| `escapeValue` | `false` | React handles XSS protection |

---

## Usage in Components

### Single Namespace

When a component uses translations from one namespace:

```typescript
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation('auth');

  return (
    <form>
      <h1>{t('login.title')}</h1>
      <label>{t('login.email')}</label>
      <input placeholder={t('login.emailPlaceholder')} />
      <button>{t('login.submit')}</button>
    </form>
  );
}
```

### Multiple Namespaces

When a component needs translations from multiple namespaces:

```typescript
import { useTranslation } from 'react-i18next';

function ProfilePage() {
  // First namespace is default, others require prefix
  const { t, i18n } = useTranslation(['profile', 'auth']);

  return (
    <div>
      {/* 'profile' is default - no prefix needed */}
      <h1>{t('tabs.profile')}</h1>

      {/* 'auth' requires namespace prefix */}
      <p>{t('auth:validation.emailRequired')}</p>
    </div>
  );
}
```

### Language Switching

```typescript
import { useTranslation } from 'react-i18next';

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pl' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button onClick={toggleLanguage}>
      {i18n.language === 'en' ? 'PL' : 'EN'}
    </button>
  );
}
```

---

## Translation File Structure

### Hierarchical Keys

Translations use nested objects for organization:

```json
// auth.json
{
  "login": {
    "title": "Welcome Back",
    "subtitle": "Sign in to continue your journey",
    "email": "Email",
    "emailPlaceholder": "your@email.com",
    "password": "Password",
    "submit": "Sign In"
  },
  "register": {
    "title": "Create Account",
    "submit": "Create Account"
  },
  "validation": {
    "emailRequired": "Email is required",
    "passwordTooShort": "Password must be at least 8 characters"
  }
}
```

Access with dot notation: `t('login.title')`, `t('validation.emailRequired')`

### Interpolation

Use `{{variable}}` syntax for dynamic values:

```json
{
  "progress": {
    "stepOf": "{{current}} / {{total}}"
  },
  "validation": {
    "birthYearRange": "Birth year must be between {{min}} and {{max}}"
  }
}
```

```typescript
t('progress.stepOf', { current: 2, total: 5 })
// Output: "2 / 5"

t('validation.birthYearRange', { min: 1920, max: 2010 })
// Output: "Birth year must be between 1920 and 2010"
```

---

## Adding New Translations

### Step 1: Add to English File

Add the translation key to the appropriate namespace in `resources/en/`:

```json
// resources/en/assessment.json
{
  "newFeature": {
    "title": "New Feature Title",
    "description": "Description of the new feature"
  }
}
```

### Step 2: Add to Polish File

Mirror the same structure in `resources/pl/`:

```json
// resources/pl/assessment.json
{
  "newFeature": {
    "title": "Tytuł Nowej Funkcji",
    "description": "Opis nowej funkcji"
  }
}
```

### Step 3: Use in Component

```typescript
const { t } = useTranslation('assessment');

<h2>{t('newFeature.title')}</h2>
<p>{t('newFeature.description')}</p>
```

---

## Best Practices

### DO

- **Add translations to the feature-specific file**, not `common.json`
- **Specify namespaces explicitly** in `useTranslation()` for clarity
- **Mirror structure exactly** in both `en/` and `pl/` directories
- **Use hierarchical keys** for organization (e.g., `login.title` not `loginTitle`)
- **Include context in key names** (e.g., `button.submit` not just `submit`)

### DON'T

- **Don't put everything in common.json** - keep it minimal (truly shared strings only)
- **Don't use the namespace prefix** when using a single namespace
- **Don't hardcode user-facing strings** in components
- **Don't forget Polish diacritics** (ą, ć, ę, ł, ń, ó, ś, ź, ż)

---

## Polish Character Support

All fonts in the design system (Shippori Mincho, IBM Plex Sans/Mono) include full Polish diacritics support. No special handling is required.

---

## Testing with i18n

Mock the `useTranslation` hook in tests:

```typescript
// In test file
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en'
    }
  })
}));
```

This returns the translation key as-is, making assertions straightforward:

```typescript
expect(screen.getByText('login.title')).toBeInTheDocument();
```

---

## Language Detection Order

The browser language detector uses this priority:

1. **localStorage** (`votive-language` key) - User's explicit choice
2. **navigator** - Browser's language setting

Once detected, the language is cached in localStorage for persistence across sessions.

---

## Adding a New Language

To add support for a new language (e.g., German):

1. **Create resource directory**: `app/src/i18n/resources/de/`

2. **Copy all JSON files** from `en/` to `de/` and translate

3. **Update config.ts**:
   ```typescript
   import deCommon from '@/i18n/resources/de/common.json';
   // ... import all de files

   const resources = {
     en: { ... },
     pl: { ... },
     de: {
       common: deCommon,
       // ... other namespaces
     },
   };
   ```

4. **Update SUPPORTED_LANGUAGES**:
   ```typescript
   export const SUPPORTED_LANGUAGES = ['en', 'pl', 'de'] as const;
   ```

5. **Update language toggle UI** to include the new language option

---

## Related Documentation

- [Ink & Stone Design System](votive-ink-design-system.md) - Typography and Polish character support
- [AI Agent Codebase Instructions](AI-Agent-Codebase-Instructions.md) - Import conventions and module system

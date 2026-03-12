---
description: "Security best practices — Always active"
globs: 
alwaysApply: true
---

# Security Rules

## XSS Prevention

### dangerouslySetInnerHTML
```typescript
// ❌ NEVER — Raw HTML from user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ If absolutely needed — Sanitize first
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
```

### User Input
- Always validate and sanitize user input
- Use controlled components for forms
- Escape HTML entities in dynamic content
- Never construct HTML from string concatenation

## Authentication & Authorization

### JWT Handling
- Store tokens in `httpOnly` cookies (preferred) or memory
- **Never store tokens in `localStorage`** — XSS vulnerable
- Include token expiry check before API calls
- Implement automatic token refresh

```typescript
// ✅ Good — Token refresh interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Route Protection
```typescript
// ✅ Protected route pattern
const PrivateRoute: React.FC<IPrivateRouteProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};
```

## Secrets & Credentials

### ❌ NEVER DO
```typescript
const API_KEY = 'sk-abc123xyz789';  // NEVER hardcode
const DB_PASSWORD = 'admin123';      // NEVER hardcode
```

### ✅ ALWAYS DO
- Use environment variables: `process.env.REACT_APP_API_KEY`
- Store in `.env.local` (gitignored)
- Document required env vars in `.env.example`
- Use different keys for dev/staging/production

## Forbidden Functions
| Function | Risk | Alternative |
|----------|------|-------------|
| `eval()` | Code injection | Parse JSON, use mapping |
| `Function()` constructor | Code injection | Named functions |
| `document.write()` | XSS | React rendering |
| `innerHTML` (direct DOM) | XSS | React JSX |
| `window.open()` with user data | Open redirect | Validate URL first |

## Dependency Security
- Run `yarn audit` regularly
- Update vulnerable dependencies promptly
- Use `npm audit fix` for auto-fixable issues
- Review new dependencies before adding:
  - Check GitHub stars, maintenance status
  - Check for known vulnerabilities
  - Prefer well-maintained, popular packages

## Sensitive Data
- Never log sensitive data (passwords, tokens, PII)
- Mask sensitive data in error messages
- Clear sensitive data from Redux store on logout
- Clean up sessionStorage/localStorage on logout

## HTTP Security
- Always use HTTPS for API calls
- Set proper CORS headers
- Include CSRF protection for state-changing requests
- Use `Content-Security-Policy` headers

# Authentication System

This React admin dashboard now includes a complete authentication system with the following features:

## Features

### 🔐 Authentication
- **Login Page**: Clean, responsive sign-in form with username/password fields
- **Logout Functionality**: Clear session and redirect to login
- **Route Protection**: All dashboard routes require authentication
- **Session Management**: Uses sessionStorage (or localStorage with "Remember me")

### 👥 Test Users
For development/testing, use these hardcoded credentials:
- **Username**: `diego` | **Password**: `md2025!`
- **Username**: `partner` | **Password**: `md2025!`

### 🛡️ Security Features
- Form validation (both fields required)
- Password visibility toggle
- Clear error messages (no technical stack traces)
- Automatic token attachment to API requests
- Session cleanup on logout
- Redirect preservation (returns to intended page after login)

### 🎨 UI Features
- Responsive design that works on mobile and desktop
- Loading states during authentication
- "Remember me" checkbox (uses localStorage instead of sessionStorage)
- Clean admin styling with gradient background
- Footer branding: "Menina Dourada — Admin Dashboard"

## File Structure

```
src/
├── auth/
│   ├── AuthContext.jsx      # Authentication context provider
│   └── RequireAuth.jsx      # Route protection component
├── pages/
│   ├── Login.jsx           # Sign-in page
│   ├── Login.css           # Login page styles
│   └── Logout.jsx          # Logout page/component
├── services/
│   └── api.js              # Axios instance with auto auth headers
└── App.js                  # Updated with routing and auth provider
```

## How It Works

### 1. Authentication Flow
1. User visits any protected route → redirected to `/login`
2. User enters credentials → validated against hardcoded users
3. On success → fake token stored in sessionStorage/localStorage
4. User redirected to intended page (or `/dashboard` by default)

### 2. Route Protection
- `<RequireAuth>` wrapper checks authentication status
- Unauthenticated users redirected to login with return URL preserved
- Loading state shown while checking authentication

### 3. API Integration
- Axios instance automatically attaches `Authorization: Bearer <token>` header
- 401 responses automatically clear session and redirect to login
- Ready for backend integration (just update the base URL)

## Usage

### Starting the App
```bash
npm start
```

### Testing Authentication
1. Go to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Use test credentials: `diego` / `md2025!`
4. You'll be redirected to the dashboard
5. Click "Sair" (logout) in the top-right to test logout

### Customization
- Update `VALID_USERS` in `AuthContext.jsx` to change test credentials
- Modify `api.js` base URL when connecting to real backend
- Customize login page styling in `Login.css`

## Next Steps for Production

1. **Backend Integration**: Replace hardcoded users with real API calls
2. **JWT Handling**: Implement proper JWT token refresh logic
3. **Password Reset**: Add forgot password functionality
4. **User Roles**: Add role-based access control
5. **Security**: Add CSRF protection and other security measures

The authentication system is now fully functional and ready for development and testing!
# Authentication System Documentation

## Overview

The authentication system is implemented for the **admin panel only**. The client app remains public and read-only.

## Architecture

### Admin App Authentication Flow

1. **AuthProvider** - Wraps the entire admin app and manages authentication state
2. **ProtectedRoute** - Wrapper component that checks authentication before rendering
3. **LoginPage** - Email/password login form
4. **useAuth Hook** - Provides access to auth state and methods

## Components

### AuthContext (`apps/admin/src/contexts/auth-context.tsx`)

Provides authentication state and methods to the entire app:

- `user` - Current authenticated user (null if not authenticated)
- `session` - Current Supabase session
- `loading` - Loading state during auth checks
- `signIn(email, password)` - Sign in method
- `signOut()` - Sign out method

### ProtectedRoute (`apps/admin/src/components/auth/protected-route.tsx`)

- Checks if user is authenticated
- Shows loading spinner during auth check
- Redirects to `/login` if not authenticated
- Preserves attempted URL for redirect after login

### LoginPage (`apps/admin/src/components/auth/login-page.tsx`)

- Email/password login form
- Error handling and display
- Loading state during sign-in
- Redirects to attempted page after successful login

## Usage

### Accessing Auth State

```typescript
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protecting Routes

Routes are automatically protected by wrapping them in `ProtectedRoute`:

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Signing In

The login page handles sign-in automatically. To sign in programmatically:

```typescript
const { signIn } = useAuth();

const handleLogin = async () => {
  const { error } = await signIn(email, password);
  if (error) {
    console.error("Login failed:", error.message);
  }
};
```

## Session Management

- Sessions are stored in **localStorage** by default (Supabase standard)
- Sessions automatically refresh when they expire
- Auth state is synced across browser tabs
- Session persists across page refreshes

### Note on httpOnly Cookies

The current implementation uses Supabase's default session storage (localStorage). For httpOnly cookies, you would need:

1. A backend proxy/server
2. Custom session management
3. Server-side cookie handling

For most admin panels, localStorage is secure enough. For enhanced security with httpOnly cookies, consider implementing a backend API proxy.

## Environment Variables

Both apps use the same Supabase project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Client App

The client app (`apps/client`) is **public and read-only**:

- No authentication required
- Uses Supabase client for read operations only
- All RLS policies allow public read access

## Security

### Row Level Security (RLS)

Database tables have RLS policies:

- **Public read access** - Anyone can read data
- **Authenticated write access** - Only authenticated users can write

### Admin Access

To create admin users:

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user or invite via email
3. Users can then sign in via the admin login page

## Testing Authentication

1. **Start the admin app:**

   ```bash
   npm run dev:admin
   ```

2. **Navigate to admin panel:**
   - You'll be redirected to `/login`
   - Enter admin credentials
   - After login, redirected to dashboard

3. **Test logout:**
   - Click "Sign Out" in header
   - Redirected back to login page

4. **Test protected routes:**
   - Try accessing `/` without being logged in
   - Should redirect to `/login`
   - After login, redirects back to original page

## File Structure

```
apps/admin/src/
├── contexts/
│   └── auth-context.tsx       # Auth context and provider
├── hooks/
│   └── use-auth.ts            # useAuth hook export
├── components/
│   ├── auth/
│   │   ├── login-page.tsx     # Login form
│   │   └── protected-route.tsx # Route protection
│   └── layout/
│       └── header.tsx         # Header with logout button
├── lib/
│   └── supabase.ts            # Supabase client config
└── App.tsx                     # Routes with auth protection
```

## Next Steps

- Add password reset functionality
- Add user profile page
- Add role-based access control (if needed)
- Implement httpOnly cookies (if required for production)

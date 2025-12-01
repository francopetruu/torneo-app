import { useAuth } from "@/contexts/auth-context";

export default function Header() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tournament Admin</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-sm">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-3 py-1.5 text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

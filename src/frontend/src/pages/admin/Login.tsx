import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { createActorWithConfig } from "../../config";
import { setAdminSession } from "../../utils/adminSession";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const actor = await createActorWithConfig();
      const valid = await actor.verifyAdminCredentials(username, password);
      if (valid) {
        setAdminSession();
        navigate({ to: "/admin/dashboard" });
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/assets/generated/gmck-seal-transparent.dim_200x200.png"
            alt="GMC Khammam"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold font-display text-navy">
            GMC Khammam
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Admin Portal Login
          </p>
        </div>

        <Card className="shadow-nav">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy">
              <Lock size={20} />
              Secure Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  data-ocid="admin_login.input"
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div
                  data-ocid="admin_login.error_state"
                  className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md"
                >
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <Button
                data-ocid="admin_login.submit_button"
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Signing
                    in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link
                to="/admin/request-access"
                className="text-sm text-primary hover:underline"
              >
                Request Admin Access
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Student Portal
          </Link>
        </div>
      </div>
    </main>
  );
}

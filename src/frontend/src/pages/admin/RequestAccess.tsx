import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitAdminAccessRequest } from "../../hooks/useQueries";

export default function RequestAccess() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dept: "",
    reason: "",
    requestedUsername: "",
    requestedPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutateAsync: submitRequest, isPending } =
    useSubmitAdminAccessRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.requestedUsername.trim()) {
      toast.error("Please enter a desired login username.");
      return;
    }
    if (!form.requestedPassword.trim()) {
      toast.error("Please enter a desired login password.");
      return;
    }
    try {
      const fullReason = `${form.reason}\n\n[ADMIN_CREDENTIALS: username=${form.requestedUsername}, password=${form.requestedPassword}]`;
      await submitRequest({
        name: form.name,
        email: form.email,
        dept: form.dept,
        reason: fullReason,
      });
      setSuccess(true);
      toast.success("Access request submitted!");
    } catch {
      toast.error("Failed to submit request.");
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle size={48} className="text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display mb-2">
            Request Submitted!
          </h2>
          <p className="text-muted-foreground mb-6">
            Your admin access request is pending review. The current admin will
            be notified.
          </p>
          <Link to="/admin/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <ShieldCheck size={40} className="text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold font-display">
            Request Admin Access
          </h1>
          <p className="text-muted-foreground text-sm">
            Fill in your details. The admin will review your request.
          </p>
        </div>
        <Card className="shadow-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    data-ocid="request_access.input"
                    placeholder="Dr. Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@gmck.edu.in"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  placeholder="e.g. Anatomy, Physiology"
                  value={form.dept}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dept: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Reason for Access</Label>
                <Textarea
                  data-ocid="request_access.textarea"
                  placeholder="Explain why you need admin access..."
                  rows={3}
                  value={form.reason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Desired Login Credentials
                </p>
                <div className="space-y-2">
                  <Label>Desired Login Username</Label>
                  <Input
                    data-ocid="request_access.username_input"
                    placeholder="Choose a username"
                    value={form.requestedUsername}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        requestedUsername: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desired Login Password</Label>
                  <div className="relative">
                    <Input
                      data-ocid="request_access.password_input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a password"
                      value={form.requestedPassword}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          requestedPassword: e.target.value,
                        }))
                      }
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <Button
                data-ocid="request_access.submit_button"
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link
            to="/admin/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

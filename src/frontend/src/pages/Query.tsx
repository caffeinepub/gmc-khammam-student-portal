import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitStudentQuery } from "../hooks/useQueries";

export default function Query() {
  const [form, setForm] = useState({
    reg: "",
    name: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);
  const { mutateAsync: submitQuery, isPending } = useSubmitStudentQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitQuery({
        reg: form.reg,
        name: form.name,
        subject: form.subject,
        message: form.message,
      });
      setSuccess(true);
      toast.success("Query submitted successfully!");
    } catch {
      toast.error("Failed to submit query. Please try again.");
    }
  };

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">
          Query Submitted!
        </h2>
        <p className="text-muted-foreground">
          Your query has been submitted. The admin team will respond shortly.
        </p>
        <Button
          data-ocid="query.secondary_button"
          variant="outline"
          className="mt-6"
          onClick={() => setSuccess(false)}
        >
          Submit Another Query
        </Button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <MessageSquare size={22} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Submit a Query</h1>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground font-normal">
            Fill in the form below to contact the academic office
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reg">Registration Number</Label>
                <Input
                  data-ocid="query.input"
                  id="reg"
                  placeholder="2021-MBBS-0001"
                  value={form.reg}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reg: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject / Department</Label>
              <Input
                id="subject"
                placeholder="e.g. Anatomy, Physiology"
                value={form.subject}
                onChange={(e) =>
                  setForm((p) => ({ ...p, subject: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                data-ocid="query.textarea"
                id="message"
                placeholder="Describe your query or concern..."
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setForm((p) => ({ ...p, message: e.target.value }))
                }
                required
              />
            </div>
            <Button
              data-ocid="query.submit_button"
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Query"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { BarChart3, Bell, BookOpen, Info, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Home() {
  const [regNo, setRegNo] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (regNo.trim()) {
      navigate({ to: `/student/${regNo.trim()}` });
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Subject-wise Attendance",
      desc: "Track theory & practical attendance with visual progress indicators",
    },
    {
      icon: BookOpen,
      title: "Internal Marks",
      desc: "View marks out of 100 for theory and practical components",
    },
    {
      icon: Bell,
      title: "Announcements",
      desc: "Stay updated with academic announcements and exam schedules",
    },
    {
      icon: Info,
      title: "CBME Curriculum",
      desc: "Subjects aligned with Competency-Based Medical Education circulars",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-navy to-navy-dark text-white py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="text-sm font-medium text-white/60 uppercase tracking-widest mb-4">
            Government Medical College, Khammam
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Student Tracking Portal
          </h1>
          <p className="text-white/70 text-lg mb-10">
            Access your attendance, marks, and academic progress. Enter your
            registration number to get started.
          </p>

          <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  data-ocid="search.input"
                  type="text"
                  placeholder="Enter Registration Number (e.g. 2021-MBBS-0001)"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="flex-1 text-foreground text-base h-12"
                />
                <Button
                  data-ocid="search.primary_button"
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-6 h-12"
                  disabled={!regNo.trim()}
                >
                  <Search size={18} className="mr-2" />
                  Search Student
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold font-display text-center mb-10 text-foreground">
          What You Can Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
            >
              <Card className="h-full shadow-card hover:shadow-nav transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <f.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

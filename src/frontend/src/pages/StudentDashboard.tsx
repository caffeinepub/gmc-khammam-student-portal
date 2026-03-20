import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, BookOpen, MessageSquare, User } from "lucide-react";
import { motion } from "motion/react";
import type { SubjectAttendance } from "../backend.d";
import { useStudentDashboard } from "../hooks/useQueries";

const MBBS_YEARS: Record<string, string> = {
  "1": "1st MBBS",
  "2": "2nd MBBS",
  "3": "3rd MBBS",
  "4": "Final MBBS",
};

function calcPct(
  attended: bigint | undefined,
  conducted: bigint | undefined,
): number | null {
  if (!attended || !conducted || conducted === 0n) return null;
  return Number((Number(attended) / Number(conducted)) * 100);
}

function AttendanceBar({
  label,
  attended,
  conducted,
  threshold,
}: {
  label: string;
  attended: bigint | undefined;
  conducted: bigint | undefined;
  threshold: number;
}) {
  const pct = calcPct(attended, conducted);
  if (pct === null)
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-muted-foreground">N/A</span>
        </div>
      </div>
    );
  const isLow = pct < threshold;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={`font-semibold ${isLow ? "text-destructive" : "text-success"}`}
        >
          {pct.toFixed(1)}%
          {isLow && <span className="ml-1 text-xs">(Below {threshold}%)</span>}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isLow ? "bg-destructive" : "bg-success"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MarksDisplay({
  label,
  marks,
  max = 100,
}: { label: string; marks: bigint | undefined; max?: number }) {
  if (marks === undefined)
    return <div className="text-xs text-muted-foreground">{label}: N/A</div>;
  const val = Number(marks);
  const isLow = val < 50;
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
        isLow
          ? "bg-destructive/10 text-destructive"
          : "bg-success/10 text-success"
      }`}
    >
      {label}: {val}/{max}
    </div>
  );
}

function SubjectCard({ sa, index }: { sa: SubjectAttendance; index: number }) {
  const theoryAtt = sa.theoryAttendance;
  const practAtt = sa.practicalAttendance;
  const theoryPct = calcPct(
    theoryAtt?.attendedClasses,
    theoryAtt?.conductedClasses,
  );
  const practPct = calcPct(
    practAtt?.attendedClasses,
    practAtt?.conductedClasses,
  );
  const isAtRisk =
    (theoryPct !== null && theoryPct < 75) ||
    (practPct !== null && practPct < 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`subject.item.${index + 1}`}
    >
      <Card
        className={`shadow-card hover:shadow-nav transition-shadow ${
          isAtRisk
            ? "border-l-4 border-l-destructive"
            : "border-l-4 border-l-success"
        }`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              {sa.subject.name}
            </span>
            {isAtRisk && (
              <Badge variant="destructive" className="text-xs">
                At Risk
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceBar
            label="Theory Attendance"
            attended={theoryAtt?.attendedClasses}
            conducted={theoryAtt?.conductedClasses}
            threshold={75}
          />
          <AttendanceBar
            label="Practical Attendance"
            attended={practAtt?.attendedClasses}
            conducted={practAtt?.conductedClasses}
            threshold={80}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <MarksDisplay label="Theory Marks" marks={sa.theoryMarks?.marks} />
            <MarksDisplay
              label="Practical Marks"
              marks={sa.practicalMarks?.marks}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { reg } = useParams({ from: "/student-layout/student/$reg" });
  const { data: dashboard, isLoading, isError } = useStudentDashboard(reg);

  if (isLoading) {
    return (
      <main
        className="max-w-6xl mx-auto px-6 py-8"
        data-ocid="dashboard.loading_state"
      >
        <Skeleton className="h-24 w-full mb-6 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (isError || !dashboard) {
    return (
      <main
        className="max-w-2xl mx-auto px-6 py-16 text-center"
        data-ocid="dashboard.error_state"
      >
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
        <p className="text-muted-foreground mb-6">
          No student found with registration number <strong>{reg}</strong>.
          Please check and try again.
        </p>
        <Link to="/">
          <Button data-ocid="dashboard.secondary_button" variant="outline">
            Go Back to Search
          </Button>
        </Link>
      </main>
    );
  }

  const { student, subjects } = dashboard;
  const yearLabel =
    MBBS_YEARS[student.year.toString()] ?? `Year ${student.year}`;

  const totalTheoryPct: number[] = [];
  for (const s of subjects) {
    const pct = calcPct(
      s.theoryAttendance?.attendedClasses,
      s.theoryAttendance?.conductedClasses,
    );
    if (pct !== null) totalTheoryPct.push(pct);
  }
  const avgTheory =
    totalTheoryPct.length > 0
      ? (
          totalTheoryPct.reduce((a, b) => a + b, 0) / totalTheoryPct.length
        ).toFixed(1)
      : "N/A";

  const totalPractPct: number[] = [];
  for (const s of subjects) {
    const pct = calcPct(
      s.practicalAttendance?.attendedClasses,
      s.practicalAttendance?.conductedClasses,
    );
    if (pct !== null) totalPractPct.push(pct);
  }
  const avgPract =
    totalPractPct.length > 0
      ? (
          totalPractPct.reduce((a, b) => a + b, 0) / totalPractPct.length
        ).toFixed(1)
      : "N/A";
  const atRiskCount = subjects.filter((s) => {
    const tp = calcPct(
      s.theoryAttendance?.attendedClasses,
      s.theoryAttendance?.conductedClasses,
    );
    const pp = calcPct(
      s.practicalAttendance?.attendedClasses,
      s.practicalAttendance?.conductedClasses,
    );
    return (tp !== null && tp < 75) || (pp !== null && pp < 80);
  }).length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Student identity */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-navy text-white shadow-nav mb-6">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              <User size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-display">
                {student.name}
              </h1>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="text-white/70 text-sm">
                  Reg: {student.registrationNumber}
                </span>
                <Badge className="bg-primary/80 text-white border-0">
                  {yearLabel}
                </Badge>
                <span className="text-white/70 text-sm">
                  Batch: {student.batch}
                </span>
              </div>
            </div>
            <Link to="/query">
              <Button
                data-ocid="dashboard.primary_button"
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10 bg-transparent"
              >
                <MessageSquare size={16} className="mr-2" />
                Submit Query
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Avg Theory Attendance",
            value: avgTheory !== "N/A" ? `${avgTheory}%` : "N/A",
            low: avgTheory !== "N/A" && Number(avgTheory) < 75,
          },
          {
            label: "Avg Practical Attendance",
            value: avgPract !== "N/A" ? `${avgPract}%` : "N/A",
            low: avgPract !== "N/A" && Number(avgPract) < 80,
          },
          {
            label: "Total Subjects",
            value: subjects.length.toString(),
            low: false,
          },
          {
            label: "At Risk Subjects",
            value: atRiskCount.toString(),
            low: atRiskCount > 0,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`shadow-card ${stat.low ? "border-destructive/50" : ""}`}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`text-2xl font-bold font-display ${stat.low ? "text-destructive" : "text-primary"}`}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Subject cards */}
      <h2 className="text-xl font-bold font-display mb-4">
        Subject-wise Report
      </h2>
      {subjects.length === 0 ? (
        <Card className="shadow-card" data-ocid="subject.empty_state">
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p>No subject data available yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sa, i) => (
            <SubjectCard key={sa.subject.id} sa={sa} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

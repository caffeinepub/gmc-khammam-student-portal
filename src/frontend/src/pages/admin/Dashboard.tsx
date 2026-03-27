import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookMarked,
  BookOpen,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  MessageSquare,
  Pencil,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AnnouncementCategory,
  AttendanceType,
  RequestStatus,
  SubjectType,
} from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import {
  useAddSecondaryAdmin,
  useAddStudent,
  useAdminAccessRequests,
  useAnnouncements,
  useApproveAccessRequest,
  useBulkUpsertAttendance,
  useBulkUpsertMarks,
  useBulkUpsertStudents,
  useCollegeInfo,
  useCreateAnnouncement,
  useCreateNotification,
  useCreateSubject,
  useDeleteAnnouncement,
  useDeleteAttendance,
  useDeleteMarks,
  useDeleteNotification,
  useDeleteStudent,
  useDeleteSubject,
  useListAllMarks,
  useListAttendance,
  useListStudents,
  useNotifications,
  useRejectAccessRequest,
  useReplyToQuery,
  useStudentDashboard,
  useStudentQueryList as useStudentQueries,
  useSubjects,
  useUpdateAnnouncement,
  useUpdateAttendance,
  useUpdateCollegeInfo,
  useUpdateMarks,
  useUpdateNotification,
  useUpdateStudent,
} from "../../hooks/useQueries";
import type {
  Announcement,
  Notification,
  Subject,
} from "../../hooks/useQueries";
import { clearAdminSession, isAdminLoggedIn } from "../../utils/adminSession";
import { parseExcelFile } from "../../utils/excelParser";

type Section =
  | "overview"
  | "students"
  | "attendance"
  | "marks"
  | "subjects"
  | "announcements"
  | "notifications"
  | "collegeinfo"
  | "queries"
  | "accessrequests"
  | "reportcard"
  | "settings"
  | "studentoverview";

const NAV_ITEMS: { id: Section; label: string; icon: React.FC<any> }[] = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "students", label: "Manage Students", icon: Users },
  { id: "attendance", label: "Manage Attendance", icon: ClipboardList },
  { id: "marks", label: "Manage Marks", icon: BookMarked },
  { id: "subjects", label: "Manage Subjects", icon: BookOpen },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "collegeinfo", label: "College Info", icon: Building2 },
  { id: "queries", label: "Student Queries", icon: MessageSquare },
  { id: "accessrequests", label: "Admin Access Requests", icon: ShieldCheck },
  { id: "reportcard", label: "Report Card", icon: FileText },
  { id: "studentoverview", label: "Student Overview", icon: Eye },
  { id: "settings", label: "Settings", icon: Settings2 },
];

const YEAR_LABELS: Record<string, string> = {
  "1": "1st MBBS",
  "2": "2nd MBBS",
  "3": "3rd MBBS",
  "4": "Final MBBS",
};

function ExcelUploadCard({
  title,
  instructions,
  columns,
  onUpload,
  loading,
}: {
  title: string;
  instructions: string;
  columns: string[];
  onUpload: (data: any[]) => void;
  loading: boolean;
}) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseExcelFile<any>(file);
      onUpload(data);
    } catch {
      toast.error("Failed to parse Excel file.");
    }
    e.target.value = "";
  };
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Required Excel Columns:</p>
          <div className="flex flex-wrap gap-2">
            {columns.map((c) => (
              <code
                key={c}
                className="bg-background border px-2 py-0.5 rounded text-xs"
              >
                {c}
              </code>
            ))}
          </div>
          <p className="text-muted-foreground mt-2">{instructions}</p>
        </div>
        <Label htmlFor={`upload-${title}`} className="cursor-pointer">
          <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center transition-colors">
            <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              Click to upload Excel file (.xlsx)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Or drag and drop here
            </p>
          </div>
        </Label>
        <input
          data-ocid="admin.upload_button"
          id={`upload-${title}`}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
          disabled={loading}
        />
        {loading && (
          <div
            data-ocid="admin.loading_state"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 size={16} className="animate-spin" /> Uploading...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Overview() {
  const { data: subjects } = useSubjects();
  const { data: queries } = useStudentQueries();
  const { data: requests } = useAdminAccessRequests();
  const { data: announcements } = useAnnouncements();

  const pendingQueries =
    queries?.filter((q) => q.status === "pending").length ?? 0;
  const pendingRequests =
    requests?.filter((r) => r.status === RequestStatus.pending).length ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">
        Dashboard Overview
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Subjects",
            value: subjects?.length ?? 0,
            color: "text-primary",
          },
          {
            label: "Announcements",
            value: announcements?.length ?? 0,
            color: "text-primary",
          },
          {
            label: "Pending Queries",
            value: pendingQueries,
            color: pendingQueries > 0 ? "text-destructive" : "text-success",
          },
          {
            label: "Pending Access Requests",
            value: pendingRequests,
            color: pendingRequests > 0 ? "text-amber-600" : "text-success",
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-card">
            <CardContent className="p-5 text-center">
              <div className={`text-3xl font-bold font-display ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-foreground/80">
          <strong>Welcome, Admin!</strong> Use the sidebar to manage students,
          attendance, marks, subjects, announcements, and more. You can change
          your login credentials anytime from the Settings section.
        </p>
      </div>
    </div>
  );
}

function ManageStudents() {
  const { mutateAsync: bulkUpsert, isPending: bulkPending } =
    useBulkUpsertStudents();
  const { mutateAsync: addOne, isPending: addPending } = useAddStudent();
  const { data: allStudents, isLoading: studentsLoading } = useListStudents();
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    year: "1",
    batch: "",
  });

  const handleBulkUpload = async (rows: any[]) => {
    const students = rows.map((r) => ({
      registrationNumber: String(r.registrationNumber ?? ""),
      name: String(r.name ?? ""),
      year: BigInt(r.year ?? 1),
      batch: String(r.batch ?? ""),
    }));
    setPreviewRows(students);
    try {
      await bulkUpsert(students);
      toast.success(`${students.length} student(s) uploaded successfully!`);
    } catch {
      toast.error("Failed to upload students.");
    }
  };

  const handleAddOne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.registrationNumber || !form.name || !form.batch) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await addOne({
        registrationNumber: form.registrationNumber,
        name: form.name,
        year: BigInt(form.year),
        batch: form.batch,
      });
      toast.success("Student added successfully!");
      setForm({ registrationNumber: "", name: "", year: "1", batch: "" });
    } catch {
      toast.error("Failed to add student.");
    }
  };

  const [editingReg, setEditingReg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    year: string;
    batch: string;
  }>({ name: "", year: "1", batch: "" });
  const { mutateAsync: updateStudent, isPending: updatePending } =
    useUpdateStudent();
  const { mutateAsync: deleteStudent } = useDeleteStudent();

  const handleDeleteStudent = async (reg: string) => {
    if (!confirm(`Delete student ${reg}? This cannot be undone.`)) return;
    try {
      await deleteStudent(reg);
      toast.success("Student deleted.");
    } catch {
      toast.error("Failed to delete student.");
    }
  };

  const handleEditSave = async () => {
    if (!editingReg) return;
    try {
      await updateStudent({
        registrationNumber: editingReg,
        name: editForm.name,
        year: BigInt(editForm.year),
        batch: editForm.batch,
      });
      toast.success("Student updated successfully!");
      setEditingReg(null);
    } catch {
      toast.error("Failed to update student.");
    }
  };

  const filteredStudents = (allStudents ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Manage Students</h2>
      <Tabs defaultValue="individual">
        <TabsList className="mb-6">
          <TabsTrigger value="individual">Add Individual</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="viewall">View All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Add Student</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddOne}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <Label>Registration Number</Label>
                  <Input
                    data-ocid="students.input"
                    placeholder="e.g. 2023001"
                    value={form.registrationNumber}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        registrationNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Student Name</Label>
                  <Input
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Year</Label>
                  <Select
                    value={form.year}
                    onValueChange={(v) => setForm((f) => ({ ...f, year: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Batch</Label>
                  <Input
                    placeholder="e.g. 2023-2024"
                    value={form.batch}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, batch: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    data-ocid="students.submit_button"
                    disabled={addPending}
                    className="w-full md:w-auto"
                  >
                    {addPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Student"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <ExcelUploadCard
            title="Bulk Upload Students"
            instructions="Each row represents one student. Year should be 1, 2, 3, or 4."
            columns={["registrationNumber", "name", "year", "batch"]}
            onUpload={handleBulkUpload}
            loading={bulkPending}
          />
          {previewRows.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  Upload Preview ({previewRows.length} students)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Reg. Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((s, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: preview table index is stable
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{String(s.registrationNumber)}</TableCell>
                          <TableCell>{String(s.name)}</TableCell>
                          <TableCell>{String(s.year)}</TableCell>
                          <TableCell>{String(s.batch)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="viewall">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle>All Students</CardTitle>
                <Badge variant="secondary" className="text-sm">
                  Total Students: {allStudents?.length ?? 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  data-ocid="students.search_input"
                  placeholder="Search by name or registration number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {studentsLoading ? (
                <div data-ocid="students.loading_state" className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <div
                  data-ocid="students.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  {searchQuery
                    ? "No students match your search."
                    : "No students uploaded yet."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="students.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Reg. Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((s, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: list index is stable for display
                        <TableRow key={i} data-ocid={`students.item.${i + 1}`}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{s.registrationNumber}</TableCell>
                          {editingReg === s.registrationNumber ? (
                            <>
                              <TableCell>
                                <Input
                                  data-ocid="students.input"
                                  value={editForm.name}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editForm.year}
                                  onValueChange={(v) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      year: v,
                                    }))
                                  }
                                >
                                  <SelectTrigger
                                    className="h-8 w-16"
                                    data-ocid="students.select"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {["1", "2", "3", "4"].map((y) => (
                                      <SelectItem key={y} value={y}>
                                        {y}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  data-ocid="students.input"
                                  value={editForm.batch}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      batch: e.target.value,
                                    }))
                                  }
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    data-ocid={`students.save_button.${i + 1}`}
                                    size="sm"
                                    onClick={handleEditSave}
                                    disabled={updatePending}
                                  >
                                    {updatePending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    data-ocid={`students.cancel_button.${i + 1}`}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingReg(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{s.name}</TableCell>
                              <TableCell>{String(s.year)}</TableCell>
                              <TableCell>{s.batch}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    data-ocid={`students.edit_button.${i + 1}`}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingReg(s.registrationNumber);
                                      setEditForm({
                                        name: s.name,
                                        year: String(s.year),
                                        batch: s.batch,
                                      });
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    data-ocid={`students.delete_button.${i + 1}`}
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteStudent(s.registrationNumber)
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManageAttendance() {
  const { mutateAsync: bulkUpsert, isPending } = useBulkUpsertAttendance();
  const { mutateAsync: bulkUpsertSingle, isPending: singlePending } =
    useBulkUpsertAttendance();
  const { data: subjects } = useSubjects();
  const { data: allAttendance } = useListAttendance();
  const { mutateAsync: updateAttendance } = useUpdateAttendance();
  const { mutateAsync: deleteAttendance } = useDeleteAttendance();
  const [attSearch, setAttSearch] = useState("");
  const [editingAttKey, setEditingAttKey] = useState<string | null>(null);
  const [editAttForm, setEditAttForm] = useState({
    attendedClasses: "",
    conductedClasses: "",
  });
  const [batchNote, setBatchNote] = useState("");
  const [attForm, setAttForm] = useState({
    registrationNumber: "",
    subjectId: "",
    type: "theory",
    conductedClasses: "",
    attendedClasses: "",
  });

  const [attTypeFilter, setAttTypeFilter] = useState("all");
  const [attPage, setAttPage] = useState(1);
  const ATT_PAGE_SIZE = 20;

  type AttPreviewRow = {
    studentName: string;
    subject: string;
    type: string;
    attendedClasses: string;
    totalClasses: string;
    percentage: string;
    subjectFound: boolean;
  };
  type AttParsedRecord = {
    studentReg: string;
    subjectId: string;
    attendanceType: AttendanceType;
    conductedClasses: bigint;
    attendedClasses: bigint;
  };

  const [attPreviewRows, setAttPreviewRows] = useState<AttPreviewRow[]>([]);
  const [attParsedRecords, setAttParsedRecords] = useState<AttParsedRecord[]>(
    [],
  );
  const [attConfirming, setAttConfirming] = useState(false);

  const handleUpload = (rows: any[]) => {
    const subjectList = subjects ?? [];
    const preview: AttPreviewRow[] = [];
    const records: AttParsedRecord[] = [];

    for (const r of rows) {
      const studentName = String(
        r["Student Name"] ?? r["STUDENT NAME"] ?? r.studentName ?? "",
      );
      const subjectName = String(
        r.Subject ?? r["SUBJECT NAME"] ?? r.subjectName ?? "",
      );
      const typeVal = String(r.Type ?? r.type ?? "theory").toLowerCase();
      const attended = String(
        r["Attended Classes"] ??
          r["ATTENDED CLASSES"] ??
          r.attendedClasses ??
          "0",
      );
      const total = String(
        r["Total Classes"] ?? r["TOTAL CLASSES"] ?? r.conductedClasses ?? "0",
      );
      const percentage = String(
        r.Percentage ??
          r.percentage ??
          (Number(total) > 0
            ? ((Number(attended) / Number(total)) * 100).toFixed(1)
            : "0"),
      );

      const matched = subjectList.find(
        (s) => s.name.toLowerCase() === subjectName.toLowerCase(),
      );

      preview.push({
        studentName,
        subject: subjectName,
        type: typeVal,
        attendedClasses: attended,
        totalClasses: total,
        percentage,
        subjectFound: !!matched,
      });
      records.push({
        studentReg: studentName,
        subjectId: matched ? matched.id : subjectName,
        attendanceType:
          typeVal === "practical"
            ? AttendanceType.practical
            : AttendanceType.theory,
        conductedClasses: BigInt(Math.round(Number(total))),
        attendedClasses: BigInt(Math.round(Number(attended))),
      });
    }

    setAttPreviewRows(preview);
    setAttParsedRecords(records);
  };

  const handleConfirmAttUpload = async () => {
    setAttConfirming(true);
    try {
      await bulkUpsert(attParsedRecords);
      toast.success(
        `${attParsedRecords.length} attendance record(s) uploaded successfully!`,
      );
      setAttPreviewRows([]);
      setAttParsedRecords([]);
    } catch {
      toast.error("Failed to upload attendance.");
    } finally {
      setAttConfirming(false);
    }
  };

  const handleCancelAttPreview = () => {
    setAttPreviewRows([]);
    setAttParsedRecords([]);
  };

  const handleAddIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !attForm.registrationNumber ||
      !attForm.subjectId ||
      !attForm.conductedClasses ||
      !attForm.attendedClasses
    ) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await bulkUpsertSingle([
        {
          studentReg: attForm.registrationNumber,
          subjectId: attForm.subjectId,
          attendanceType:
            attForm.type === "practical"
              ? AttendanceType.practical
              : AttendanceType.theory,
          conductedClasses: BigInt(attForm.conductedClasses),
          attendedClasses: BigInt(attForm.attendedClasses),
        },
      ]);
      toast.success("Attendance record added successfully!");
      setAttForm({
        registrationNumber: "",
        subjectId: "",
        type: "theory",
        conductedClasses: "",
        attendedClasses: "",
      });
    } catch {
      toast.error("Failed to add attendance record.");
    }
  };

  const downloadAttTemplate = () => {
    const XL = (window as any).XLSX;
    if (!XL) {
      toast.error("Template download not ready yet. Try again in a moment.");
      return;
    }
    const ws = XL.utils.aoa_to_sheet([
      [
        "Student Name",
        "Subject",
        "Type",
        "Attended Classes",
        "Total Classes",
        "Percentage",
      ],
      ["John Doe", "Anatomy", "theory", 45, 60, 75],
    ]);
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, "Attendance Template");
    XL.writeFile(wb, "attendance_template.xlsx");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">
        Manage Attendance
      </h2>
      <Tabs defaultValue="individual">
        <TabsList className="mb-6">
          <TabsTrigger value="individual">Add Individual</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="viewall">View All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Add Attendance Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddIndividual}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <Label>Registration Number</Label>
                  <Input
                    data-ocid="attendance.input"
                    placeholder="e.g. 2023001"
                    value={attForm.registrationNumber}
                    onChange={(e) =>
                      setAttForm((f) => ({
                        ...f,
                        registrationNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Subject</Label>
                  <Select
                    value={attForm.subjectId}
                    onValueChange={(v) =>
                      setAttForm((f) => ({ ...f, subjectId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="attendance.select">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {(subjects ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select
                    value={attForm.type}
                    onValueChange={(v) =>
                      setAttForm((f) => ({ ...f, type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Conducted Classes</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 40"
                    value={attForm.conductedClasses}
                    onChange={(e) =>
                      setAttForm((f) => ({
                        ...f,
                        conductedClasses: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Attended Classes</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 35"
                    value={attForm.attendedClasses}
                    onChange={(e) =>
                      setAttForm((f) => ({
                        ...f,
                        attendedClasses: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    data-ocid="attendance.submit_button"
                    disabled={singlePending}
                    className="w-full md:w-auto"
                  >
                    {singlePending ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Record"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="shadow-card mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Label className="shrink-0">Batch Reference:</Label>
                <Input
                  className="w-48"
                  placeholder="e.g. 2022-Batch"
                  value={batchNote}
                  onChange={(e) => setBatchNote(e.target.value)}
                />
                {batchNote && (
                  <span className="text-sm text-muted-foreground">
                    Tip: Ensure the Excel file contains students from batch:{" "}
                    <strong>{batchNote}</strong>
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAttTemplate}
              data-ocid="attendance.upload_button"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <ExcelUploadCard
            title="Bulk Upload Attendance"
            instructions="Type should be 'theory' or 'practical'. Subject must match an added subject name."
            columns={[
              "Student Name",
              "Subject",
              "Type",
              "Attended Classes",
              "Total Classes",
              "Percentage",
            ]}
            onUpload={handleUpload}
            loading={isPending}
          />
          {attPreviewRows.length > 0 && (
            <Card className="mt-6" data-ocid="attendance.preview.card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Upload Preview ({attPreviewRows.length} rows)
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAttPreview}
                    disabled={attConfirming}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmAttUpload}
                    disabled={attConfirming}
                  >
                    {attConfirming ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      "Confirm Upload"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">#</th>
                        <th className="px-3 py-2 text-left font-medium">
                          Student Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Subject
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Attended
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Total
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Percentage
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attPreviewRows.map((row, i) => {
                        const pct = Number(row.percentage);
                        const threshold = row.type === "practical" ? 80 : 75;
                        const lowAtt = !Number.isNaN(pct) && pct < threshold;
                        return (
                          <tr
                            key={`${row.studentName}-${row.subject}-${i}`}
                            className="border-b last:border-0 hover:bg-muted/30"
                          >
                            <td className="px-3 py-2 text-muted-foreground">
                              {i + 1}
                            </td>
                            <td className="px-3 py-2">{row.studentName}</td>
                            <td className="px-3 py-2">{row.subject}</td>
                            <td className="px-3 py-2 capitalize">{row.type}</td>
                            <td className="px-3 py-2">{row.attendedClasses}</td>
                            <td className="px-3 py-2">{row.totalClasses}</td>
                            <td
                              className={`px-3 py-2 font-medium ${lowAtt ? "text-red-600" : ""}`}
                            >
                              {row.percentage}%
                            </td>
                            <td className="px-3 py-2">
                              {!row.subjectFound && (
                                <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                                  ⚠ Subject not found
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="viewall">
          <Card>
            <CardHeader>
              <CardTitle>All Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-3">
                <Input
                  data-ocid="attendance.search_input"
                  placeholder="Search by registration number or subject..."
                  value={attSearch}
                  onChange={(e) => {
                    setAttSearch(e.target.value);
                    setAttPage(1);
                  }}
                  className="flex-1 min-w-[200px]"
                />
                <Select
                  value={attTypeFilter}
                  onValueChange={(v) => {
                    setAttTypeFilter(v);
                    setAttPage(1);
                  }}
                >
                  <SelectTrigger className="w-40" data-ocid="attendance.select">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!allAttendance ? (
                <div
                  data-ocid="attendance.loading_state"
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = allAttendance.filter((r) => {
                      const subjectName =
                        (subjects ?? []).find((s) => s.id === r.subjectId)
                          ?.name ?? r.subjectId;
                      const search = attSearch.toLowerCase();
                      const matchesSearch =
                        r.studentReg.toLowerCase().includes(search) ||
                        subjectName.toLowerCase().includes(search);
                      const matchesType =
                        attTypeFilter === "all" ||
                        r.attendanceType === attTypeFilter;
                      return matchesSearch && matchesType;
                    });
                    const totalPages = Math.max(
                      1,
                      Math.ceil(filtered.length / ATT_PAGE_SIZE),
                    );
                    const paginated = filtered.slice(
                      (attPage - 1) * ATT_PAGE_SIZE,
                      attPage * ATT_PAGE_SIZE,
                    );
                    return (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          Showing {paginated.length} of {filtered.length}{" "}
                          records
                        </p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Reg</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Attended</TableHead>
                              <TableHead>Conducted</TableHead>
                              <TableHead>Percentage</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginated.map((r, i) => {
                              const subjectName =
                                (subjects ?? []).find(
                                  (s) => s.id === r.subjectId,
                                )?.name ?? r.subjectId;
                              const key = `${r.studentReg}|${r.subjectId}|${r.attendanceType}`;
                              const pct =
                                Number(r.conductedClasses) > 0
                                  ? (Number(r.attendedClasses) /
                                      Number(r.conductedClasses)) *
                                    100
                                  : 0;
                              const threshold =
                                r.attendanceType === "practical" ? 80 : 75;
                              const isLow = pct < threshold;
                              const isEditing = editingAttKey === key;
                              return (
                                <TableRow
                                  key={key}
                                  data-ocid={`attendance.item.${i + 1}`}
                                  className={isLow ? "bg-destructive/5" : ""}
                                >
                                  <TableCell>{r.studentReg}</TableCell>
                                  <TableCell>{subjectName}</TableCell>
                                  <TableCell className="capitalize">
                                    {r.attendanceType}
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        min={0}
                                        value={editAttForm.attendedClasses}
                                        onChange={(e) =>
                                          setEditAttForm((f) => ({
                                            ...f,
                                            attendedClasses: e.target.value,
                                          }))
                                        }
                                        className="h-8 w-20"
                                      />
                                    ) : (
                                      String(r.attendedClasses)
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        min={0}
                                        value={editAttForm.conductedClasses}
                                        onChange={(e) =>
                                          setEditAttForm((f) => ({
                                            ...f,
                                            conductedClasses: e.target.value,
                                          }))
                                        }
                                        className="h-8 w-20"
                                      />
                                    ) : (
                                      String(r.conductedClasses)
                                    )}
                                  </TableCell>
                                  <TableCell
                                    className={
                                      isLow
                                        ? "text-destructive font-semibold"
                                        : ""
                                    }
                                  >
                                    {pct.toFixed(1)}%
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          data-ocid={`attendance.save_button.${i + 1}`}
                                          onClick={async () => {
                                            try {
                                              await updateAttendance({
                                                ...r,
                                                attendedClasses: BigInt(
                                                  editAttForm.attendedClasses,
                                                ),
                                                conductedClasses: BigInt(
                                                  editAttForm.conductedClasses,
                                                ),
                                              });
                                              toast.success("Updated!");
                                              setEditingAttKey(null);
                                            } catch {
                                              toast.error("Failed to update.");
                                            }
                                          }}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          data-ocid={`attendance.cancel_button.${i + 1}`}
                                          onClick={() => setEditingAttKey(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          data-ocid={`attendance.edit_button.${i + 1}`}
                                          onClick={() => {
                                            setEditingAttKey(key);
                                            setEditAttForm({
                                              attendedClasses: String(
                                                r.attendedClasses,
                                              ),
                                              conductedClasses: String(
                                                r.conductedClasses,
                                              ),
                                            });
                                          }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive hover:text-destructive"
                                          data-ocid={`attendance.delete_button.${i + 1}`}
                                          onClick={async () => {
                                            if (
                                              !confirm(
                                                "Delete this attendance record?",
                                              )
                                            )
                                              return;
                                            try {
                                              await deleteAttendance(key);
                                              toast.success("Deleted!");
                                            } catch {
                                              toast.error("Failed to delete.");
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {filtered.length === 0 && (
                              <div
                                data-ocid="attendance.empty_state"
                                className="text-center py-8 text-muted-foreground"
                              >
                                No attendance records yet.
                              </div>
                            )}
                          </TableBody>
                        </Table>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAttPage((p) => Math.max(1, p - 1))
                              }
                              disabled={attPage === 1}
                              data-ocid="attendance.pagination_prev"
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {attPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAttPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={attPage === totalPages}
                              data-ocid="attendance.pagination_next"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManageMarks() {
  const { mutateAsync: bulkUpsert, isPending } = useBulkUpsertMarks();
  const { mutateAsync: bulkUpsertSingle, isPending: singlePending } =
    useBulkUpsertMarks();
  const { data: subjects } = useSubjects();
  const { data: allMarks } = useListAllMarks();
  const { mutateAsync: updateMarks } = useUpdateMarks();
  const { mutateAsync: deleteMarks } = useDeleteMarks();
  const [marksSearch, setMarksSearch] = useState("");
  const [editingMarksKey, setEditingMarksKey] = useState<string | null>(null);
  const [editMarksForm, setEditMarksForm] = useState({
    paper1: "",
    paper2: "",
    examinationName: "",
  });
  const [marksForm, setMarksForm] = useState({
    registrationNumber: "",
    subjectId: "",
    type: "theory",
    paper1: "",
    paper2: "",
    examinationName: "",
  });

  const [marksTypeFilter, setMarksTypeFilter] = useState("all");
  const [marksPage, setMarksPage] = useState(1);
  const MARKS_PAGE_SIZE = 20;

  type PreviewRow = {
    studentName: string;
    registrationNumber: string;
    subject: string;
    examinationName: string;
    theoryPaper1: string;
    theoryPaper2: string;
    practicalMarks: string;
    subjectFound: boolean;
  };
  type ParsedRecord = {
    studentReg: string;
    subjectId: string;
    marksType: AttendanceType;
    paper1: bigint;
    paper2: bigint;
    examinationName: string;
  };

  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [confirming, setConfirming] = useState(false);

  const handleUpload = (rows: any[]) => {
    const subjectList = subjects ?? [];
    const preview: PreviewRow[] = [];
    const records: ParsedRecord[] = [];

    for (const r of rows) {
      const studentName = String(r["Student Name"] ?? r["STUDENT NAME"] ?? "");
      const registrationNumber = String(
        r["Registration Number"] ?? r["REGISTRATION NUMBER"] ?? studentName,
      );
      const subjectName = String(r.Subject ?? r.SUBJECT ?? "");
      const examinationName = String(
        r["Examination Name"] ?? r["EXAMINATION NAME"] ?? "",
      );
      const theoryP1 = String(
        r["Theory Paper 1"] ?? r["THEORY PAPER 1"] ?? "-",
      );
      const theoryP2 = String(
        r["Theory Paper 2"] ?? r["THEORY PAPER 2"] ?? "-",
      );
      const practicalM = String(
        r["Practical Marks"] ?? r["PRACTICAL MARKS"] ?? "-",
      );

      const matched = subjectList.find(
        (s) => s.name.toLowerCase() === subjectName.toLowerCase(),
      );

      preview.push({
        studentName,
        registrationNumber,
        subject: subjectName,
        examinationName,
        theoryPaper1: theoryP1,
        theoryPaper2: theoryP2,
        practicalMarks: practicalM,
        subjectFound: !!matched,
      });
      const subjectId = matched ? matched.id : subjectName;
      const studentReg = registrationNumber || studentName;

      if (theoryP1 !== "-" || theoryP2 !== "-") {
        records.push({
          studentReg,
          subjectId,
          marksType: AttendanceType.theory,
          paper1: BigInt(theoryP1 !== "-" ? Math.round(Number(theoryP1)) : 0),
          paper2: BigInt(theoryP2 !== "-" ? Math.round(Number(theoryP2)) : 0),
          examinationName,
        });
      }
      if (practicalM !== "-") {
        records.push({
          studentReg,
          subjectId,
          marksType: AttendanceType.practical,
          paper1: BigInt(
            practicalM !== "-" ? Math.round(Number(practicalM)) : 0,
          ),
          paper2: BigInt(0),
          examinationName,
        });
      }
    }

    setPreviewRows(preview);
    setParsedRecords(records);
  };

  const handleConfirmUpload = async () => {
    setConfirming(true);
    try {
      await bulkUpsert(
        parsedRecords.map((r) => ({
          ...r,
          examinationName: r.examinationName ?? "",
        })),
      );
      toast.success(`${parsedRecords.length} marks record(s) uploaded!`);
      setPreviewRows([]);
      setParsedRecords([]);
    } catch {
      toast.error("Failed to upload marks.");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewRows([]);
    setParsedRecords([]);
  };

  const handleAddIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !marksForm.registrationNumber ||
      !marksForm.subjectId ||
      (!marksForm.paper1 && !marksForm.paper2)
    ) {
      toast.error("Please fill all fields.");
      return;
    }
    try {
      await bulkUpsertSingle([
        {
          studentReg: marksForm.registrationNumber,
          subjectId: marksForm.subjectId,
          marksType:
            marksForm.type === "practical"
              ? AttendanceType.practical
              : AttendanceType.theory,
          paper1: BigInt(marksForm.paper1 || "0"),
          paper2: BigInt(marksForm.paper2 || "0"),
          examinationName: marksForm.examinationName,
        },
      ]);
      toast.success("Marks added successfully!");
      setMarksForm({
        registrationNumber: "",
        subjectId: "",
        type: "theory",
        paper1: "",
        paper2: "",
        examinationName: "",
      });
    } catch {
      toast.error("Failed to add marks.");
    }
  };

  const downloadMarksTemplate = () => {
    const XL = (window as any).XLSX;
    if (!XL) {
      toast.error("Template download not ready yet. Try again in a moment.");
      return;
    }
    const ws = XL.utils.aoa_to_sheet([
      [
        "Student Name",
        "Registration Number",
        "Subject",
        "Examination Name",
        "Theory Paper 1",
        "Theory Paper 2",
        "Practical Marks",
      ],
      ["John Doe", "2023001", "Anatomy", "Internal 1", 75, 80, 85],
    ]);
    const wb = XL.utils.book_new();
    XL.utils.book_append_sheet(wb, ws, "Marks Template");
    XL.writeFile(wb, "marks_template.xlsx");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Manage Marks</h2>
      <Tabs defaultValue="individual">
        <TabsList className="mb-6">
          <TabsTrigger value="individual">Add Individual</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="viewall">View All Students</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Add Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddIndividual}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <Label>Registration Number</Label>
                  <Input
                    data-ocid="marks.input"
                    placeholder="e.g. 2023001"
                    value={marksForm.registrationNumber}
                    onChange={(e) =>
                      setMarksForm((f) => ({
                        ...f,
                        registrationNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Subject</Label>
                  <Select
                    value={marksForm.subjectId}
                    onValueChange={(v) =>
                      setMarksForm((f) => ({ ...f, subjectId: v }))
                    }
                  >
                    <SelectTrigger data-ocid="marks.select">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {(subjects ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select
                    value={marksForm.type}
                    onValueChange={(v) =>
                      setMarksForm((f) => ({ ...f, type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theory">Theory</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Paper 1 (0-100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 75"
                    value={marksForm.paper1}
                    onChange={(e) =>
                      setMarksForm((f) => ({ ...f, paper1: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Paper 2 (0-100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 80"
                    value={marksForm.paper2}
                    onChange={(e) =>
                      setMarksForm((f) => ({ ...f, paper2: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    data-ocid="marks.submit_button"
                    disabled={singlePending}
                    className="w-full md:w-auto"
                  >
                    {singlePending ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Marks"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="flex justify-end mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadMarksTemplate}
              data-ocid="marks.upload_button"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <ExcelUploadCard
            title="Bulk Upload Marks"
            instructions="Each row = one student + subject. Theory has Paper 1 and Paper 2 (each out of 100). Practical Marks is a single value out of 100."
            columns={[
              "Student Name",
              "Registration Number",
              "Subject",
              "Examination Name",
              "Theory Paper 1",
              "Theory Paper 2",
              "Practical Marks",
            ]}
            onUpload={handleUpload}
            loading={isPending}
          />
          {previewRows.length > 0 && (
            <Card className="mt-6" data-ocid="marks.preview.card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Upload Preview ({previewRows.length} rows)
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="marks.preview.cancel_button"
                    onClick={handleCancelPreview}
                    disabled={confirming}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    data-ocid="marks.preview.confirm_button"
                    onClick={handleConfirmUpload}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      "Confirm Upload"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">#</th>
                        <th className="px-3 py-2 text-left font-medium">
                          Student Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Registration No.
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Subject
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Exam Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Theory P1
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Theory P2
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Practical Marks
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, i) => (
                        <tr
                          key={`${row.registrationNumber}-${row.subject}-${i}`}
                          className="border-b last:border-0 hover:bg-muted/30"
                          data-ocid={`marks.preview.item.${i + 1}`}
                        >
                          <td className="px-3 py-2 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2">{row.studentName}</td>
                          <td className="px-3 py-2">
                            {row.registrationNumber}
                          </td>
                          <td className="px-3 py-2">{row.subject}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {row.examinationName || "-"}
                          </td>
                          <td
                            className={`px-3 py-2 font-medium ${row.theoryPaper1 !== "-" && Number(row.theoryPaper1) < 40 ? "text-red-600" : ""}`}
                          >
                            {row.theoryPaper1}
                          </td>
                          <td
                            className={`px-3 py-2 font-medium ${row.theoryPaper2 !== "-" && Number(row.theoryPaper2) < 40 ? "text-red-600" : ""}`}
                          >
                            {row.theoryPaper2}
                          </td>
                          <td className="px-3 py-2">{row.practicalMarks}</td>
                          <td className="px-3 py-2">
                            {!row.subjectFound && (
                              <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                                ⚠ Subject not found
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="viewall">
          <Card>
            <CardHeader>
              <CardTitle>All Marks Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-3">
                <Input
                  data-ocid="marks.search_input"
                  placeholder="Search by registration number or subject..."
                  value={marksSearch}
                  onChange={(e) => {
                    setMarksSearch(e.target.value);
                    setMarksPage(1);
                  }}
                  className="flex-1 min-w-[200px]"
                />
                <Select
                  value={marksTypeFilter}
                  onValueChange={(v) => {
                    setMarksTypeFilter(v);
                    setMarksPage(1);
                  }}
                >
                  <SelectTrigger className="w-40" data-ocid="marks.select">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="theory">Theory</SelectItem>
                    <SelectItem value="practical">Practical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!allMarks ? (
                <div
                  data-ocid="marks.loading_state"
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = allMarks.filter((r) => {
                      const subjectName =
                        (subjects ?? []).find((s) => s.id === r.subjectId)
                          ?.name ?? r.subjectId;
                      const search = marksSearch.toLowerCase();
                      const matchesSearch =
                        r.studentReg.toLowerCase().includes(search) ||
                        subjectName.toLowerCase().includes(search);
                      const matchesType =
                        marksTypeFilter === "all" ||
                        r.marksType === marksTypeFilter;
                      return matchesSearch && matchesType;
                    });
                    const totalPages = Math.max(
                      1,
                      Math.ceil(filtered.length / MARKS_PAGE_SIZE),
                    );
                    const paginated = filtered.slice(
                      (marksPage - 1) * MARKS_PAGE_SIZE,
                      marksPage * MARKS_PAGE_SIZE,
                    );
                    return (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">
                          Showing {paginated.length} of {filtered.length}{" "}
                          records
                        </p>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Reg</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Exam Name</TableHead>
                              <TableHead>Paper 1</TableHead>
                              <TableHead>Paper 2 / Practical</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginated.map((r, i) => {
                              const subjectName =
                                (subjects ?? []).find(
                                  (s) => s.id === r.subjectId,
                                )?.name ?? r.subjectId;
                              const key = `${r.studentReg}|${r.subjectId}|${r.marksType}`;
                              const isEditing = editingMarksKey === key;
                              const isTheory = r.marksType === "theory";
                              const p1Low = Number(r.paper1) < 40;
                              const p2Low = isTheory && Number(r.paper2) < 40;
                              return (
                                <TableRow
                                  key={key}
                                  data-ocid={`marks.item.${i + 1}`}
                                >
                                  <TableCell>{r.studentReg}</TableCell>
                                  <TableCell>{subjectName}</TableCell>
                                  <TableCell className="capitalize">
                                    {r.marksType}
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <Input
                                        value={editMarksForm.examinationName}
                                        onChange={(e) =>
                                          setEditMarksForm((f) => ({
                                            ...f,
                                            examinationName: e.target.value,
                                          }))
                                        }
                                        className="h-8 w-40"
                                      />
                                    ) : (
                                      r.examinationName || (
                                        <span className="text-muted-foreground text-xs">
                                          —
                                        </span>
                                      )
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={editMarksForm.paper1}
                                        onChange={(e) =>
                                          setEditMarksForm((f) => ({
                                            ...f,
                                            paper1: e.target.value,
                                          }))
                                        }
                                        className="h-8 w-20"
                                      />
                                    ) : (
                                      <span
                                        className={
                                          p1Low
                                            ? "text-destructive font-semibold"
                                            : ""
                                        }
                                      >
                                        {String(r.paper1)}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isTheory ? (
                                      isEditing ? (
                                        <Input
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={editMarksForm.paper2}
                                          onChange={(e) =>
                                            setEditMarksForm((f) => ({
                                              ...f,
                                              paper2: e.target.value,
                                            }))
                                          }
                                          className="h-8 w-20"
                                        />
                                      ) : (
                                        <span
                                          className={
                                            p2Low
                                              ? "text-destructive font-semibold"
                                              : ""
                                          }
                                        >
                                          {String(r.paper2)}
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        N/A
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {isEditing ? (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          data-ocid={`marks.save_button.${i + 1}`}
                                          onClick={async () => {
                                            try {
                                              await updateMarks({
                                                ...r,
                                                paper1: BigInt(
                                                  editMarksForm.paper1 || "0",
                                                ),
                                                paper2: BigInt(
                                                  editMarksForm.paper2 || "0",
                                                ),
                                                examinationName:
                                                  editMarksForm.examinationName,
                                              });
                                              toast.success("Updated!");
                                              setEditingMarksKey(null);
                                            } catch {
                                              toast.error("Failed to update.");
                                            }
                                          }}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          data-ocid={`marks.cancel_button.${i + 1}`}
                                          onClick={() =>
                                            setEditingMarksKey(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          data-ocid={`marks.edit_button.${i + 1}`}
                                          onClick={() => {
                                            setEditingMarksKey(key);
                                            setEditMarksForm({
                                              paper1: String(r.paper1),
                                              paper2: String(r.paper2),
                                              examinationName:
                                                r.examinationName,
                                            });
                                          }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive hover:text-destructive"
                                          data-ocid={`marks.delete_button.${i + 1}`}
                                          onClick={async () => {
                                            if (
                                              !confirm(
                                                "Delete this marks record?",
                                              )
                                            )
                                              return;
                                            try {
                                              await deleteMarks(key);
                                              toast.success("Deleted!");
                                            } catch {
                                              toast.error("Failed to delete.");
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {filtered.length === 0 && (
                              <div
                                data-ocid="marks.empty_state"
                                className="text-center py-8 text-muted-foreground"
                              >
                                No marks records yet.
                              </div>
                            )}
                          </TableBody>
                        </Table>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setMarksPage((p) => Math.max(1, p - 1))
                              }
                              disabled={marksPage === 1}
                              data-ocid="marks.pagination_prev"
                            >
                              Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Page {marksPage} of {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setMarksPage((p) => Math.min(totalPages, p + 1))
                              }
                              disabled={marksPage === totalPages}
                              data-ocid="marks.pagination_next"
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManageSubjects() {
  const { data: subjects, isLoading } = useSubjects();
  const { mutateAsync: createSubject, isPending: creating } =
    useCreateSubject();
  const { mutateAsync: deleteSubject } = useDeleteSubject();
  const [form, setForm] = useState({
    name: "",
    year: "1",
    type: SubjectType.both,
  });

  const { actor: subjectActor } = useActor();
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await subjectActor!.generateId("subj");
      await createSubject({
        id,
        name: form.name,
        year: BigInt(form.year),
        subjectType: form.type as SubjectType,
      });
      setForm({
        name: "",
        year: "1",
        type: SubjectType.both,
      });
      toast.success("Subject created!");
    } catch {
      toast.error("Failed to create subject.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubject(id);
      toast.success("Subject deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const grouped = (subjects ?? []).reduce(
    (acc, s) => {
      const yr = s.year.toString();
      if (!acc[yr]) acc[yr] = [];
      acc[yr].push(s);
      return acc;
    },
    {} as Record<string, Subject[]>,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Manage Subjects</h2>

      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add New Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap">
            <Input
              data-ocid="subjects.input"
              placeholder="Subject Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="flex-1 min-w-40"
            />
            <Select
              value={form.year}
              onValueChange={(v) => setForm((p) => ({ ...p, year: v }))}
            >
              <SelectTrigger data-ocid="subjects.select" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4"].map((y) => (
                  <SelectItem key={y} value={y}>
                    {YEAR_LABELS[y]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={form.type}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  type: v as SubjectType,
                }))
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubjectType.both}>Both</SelectItem>
                <SelectItem value={SubjectType.theory}>Theory Only</SelectItem>
                <SelectItem value={SubjectType.practical}>
                  Practical Only
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              data-ocid="subjects.submit_button"
              type="submit"
              disabled={creating}
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span className="ml-1">Add</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([yr, subs]) => (
              <div key={yr}>
                <h3 className="font-semibold text-primary mb-2">
                  {YEAR_LABELS[yr] ?? `Year ${yr}`}
                </h3>
                <Card className="shadow-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-16">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subs.map((s, i) => (
                        <TableRow
                          key={s.id}
                          data-ocid={`subjects.item.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.subjectType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              data-ocid={`subjects.delete_button.${i + 1}`}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            ))}
          {(!subjects || subjects.length === 0) && (
            <div
              data-ocid="subjects.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              No subjects yet. Add subjects using the form above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function parseAnnouncementContent(content: string): {
  text: string;
  pdfData?: string;
} {
  try {
    if (content.startsWith('{"text":')) {
      const parsed = JSON.parse(content);
      return { text: parsed.text || "", pdfData: parsed.pdfData };
    }
  } catch {
    // ignore
  }
  return { text: content };
}

function ManageAnnouncements() {
  const { data: announcements, isLoading } = useAnnouncements();
  const { mutateAsync: create, isPending: creating } = useCreateAnnouncement();
  const { mutateAsync: update } = useUpdateAnnouncement();
  const { mutateAsync: del } = useDeleteAnnouncement();
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: AnnouncementCategory.general,
  });
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [editingPdf, setEditingPdf] = useState<string | null>(null);
  const [editingPdfFileName, setEditingPdfFileName] = useState<string>("");

  const handlePdfSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEditing: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      if (isEditing) {
        setEditingPdf(data);
        setEditingPdfFileName(file.name);
      } else {
        setPdfFile(data);
        setPdfFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const { actor: annActor } = useActor();
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await annActor!.generateId("ann");
      let finalContent = form.content;
      if (pdfFile) {
        finalContent = JSON.stringify({ text: form.content, pdfData: pdfFile });
      }
      await create({
        id,
        title: form.title,
        content: finalContent,
        category: form.category,
        date: BigInt(Date.now() * 1_000_000),
      });
      setForm({
        title: "",
        content: "",
        category: AnnouncementCategory.general,
      });
      setPdfFile(null);
      setPdfFileName("");
      toast.success("Announcement created!");
    } catch {
      toast.error("Failed to create.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      let finalEditing = { ...editing };
      if (editingPdf) {
        const parsed = parseAnnouncementContent(editing.content);
        finalEditing = {
          ...editing,
          content: JSON.stringify({ text: parsed.text, pdfData: editingPdf }),
        };
      }
      await update(finalEditing);
      setEditing(null);
      setEditingPdf(null);
      setEditingPdfFileName("");
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Announcements</h2>
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {editing ? "Edit Announcement" : "Add New Announcement"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={editing ? handleUpdate : handleCreate}
            className="space-y-3"
          >
            <Input
              data-ocid="announcements.input"
              placeholder="Title"
              value={editing ? editing.title : form.title}
              onChange={(e) =>
                editing
                  ? setEditing((p) => p && { ...p, title: e.target.value })
                  : setForm((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
            <Textarea
              data-ocid="announcements.textarea"
              placeholder="Content / Text"
              rows={4}
              value={
                editing
                  ? parseAnnouncementContent(editing.content).text
                  : form.content
              }
              onChange={(e) =>
                editing
                  ? setEditing((p) => {
                      if (!p) return p;
                      const parsed = parseAnnouncementContent(p.content);
                      const newContent = parsed.pdfData
                        ? JSON.stringify({
                            text: e.target.value,
                            pdfData: parsed.pdfData,
                          })
                        : e.target.value;
                      return { ...p, content: newContent };
                    })
                  : setForm((p) => ({ ...p, content: e.target.value }))
              }
              required
            />
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Attach PDF (optional)
              </Label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    data-ocid="announcements.upload_button"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handlePdfSelect(e, !!editing)}
                  />
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md hover:bg-muted cursor-pointer">
                    <Upload size={12} /> Upload PDF
                  </span>
                </label>
                {editing ? (
                  editingPdfFileName ? (
                    <span className="text-xs text-muted-foreground">
                      {editingPdfFileName}
                    </span>
                  ) : parseAnnouncementContent(editing.content).pdfData ? (
                    <span className="text-xs text-success">PDF attached</span>
                  ) : null
                ) : pdfFileName ? (
                  <span className="text-xs text-muted-foreground">
                    {pdfFileName}
                  </span>
                ) : null}
              </div>
            </div>
            <Select
              value={editing ? editing.category : form.category}
              onValueChange={(v) =>
                editing
                  ? setEditing(
                      (p) =>
                        p && {
                          ...p,
                          category: v as AnnouncementCategory,
                        },
                    )
                  : setForm((p) => ({
                      ...p,
                      category: v as AnnouncementCategory,
                    }))
              }
            >
              <SelectTrigger data-ocid="announcements.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AnnouncementCategory).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                data-ocid="announcements.submit_button"
                type="submit"
                disabled={creating}
              >
                {creating ? (
                  <Loader2 size={16} className="mr-1 animate-spin" />
                ) : null}
                {editing ? "Save Changes" : "Create Announcement"}
              </Button>
              {editing && (
                <Button
                  data-ocid="announcements.cancel_button"
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {(announcements ?? []).map((ann, i) => (
            <Card
              key={ann.id}
              className="shadow-card"
              data-ocid={`announcements.item.${i + 1}`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{ann.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {ann.category} ·{" "}
                    {new Date(
                      Number(ann.date) / 1_000_000,
                    ).toLocaleDateString()}
                  </div>
                  {(() => {
                    const parsed = parseAnnouncementContent(ann.content);
                    return (
                      <>
                        <p className="text-sm mt-2 text-foreground/80 line-clamp-2">
                          {parsed.text}
                        </p>
                        {parsed.pdfData && (
                          <button
                            type="button"
                            className="mt-1 text-xs text-primary underline flex items-center gap-1"
                            onClick={() =>
                              window.open(parsed.pdfData, "_blank")
                            }
                          >
                            📄 Download PDF
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    data-ocid={`announcements.edit_button.${i + 1}`}
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(ann)}
                  >
                    Edit
                  </Button>
                  <Button
                    data-ocid={`announcements.delete_button.${i + 1}`}
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      del(ann.id)
                        .then(() => toast.success("Deleted"))
                        .catch(() => toast.error("Failed"))
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!announcements || announcements.length === 0) && (
            <div
              data-ocid="announcements.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              No announcements yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ManageNotifications() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutateAsync: create, isPending: creating } = useCreateNotification();
  const { mutateAsync: update } = useUpdateNotification();
  const { mutateAsync: del } = useDeleteNotification();
  const [form, setForm] = useState({ title: "", message: "" });
  const [editing, setEditing] = useState<Notification | null>(null);

  const { actor: notifActor } = useActor();
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await notifActor!.generateId("notif");
      await create({ id, ...form, date: BigInt(Date.now() * 1_000_000) });
      setForm({ title: "", message: "" });
      toast.success("Notification created!");
    } catch {
      toast.error("Failed to create.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await update(editing);
      setEditing(null);
      toast.success("Updated!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Notifications</h2>
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {editing ? "Edit Notification" : "Add Notification"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={editing ? handleUpdate : handleCreate}
            className="space-y-3"
          >
            <Input
              data-ocid="notifications.input"
              placeholder="Title"
              value={editing ? editing.title : form.title}
              onChange={(e) =>
                editing
                  ? setEditing((p) => p && { ...p, title: e.target.value })
                  : setForm((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
            <Textarea
              data-ocid="notifications.textarea"
              placeholder="Message"
              rows={3}
              value={editing ? editing.message : form.message}
              onChange={(e) =>
                editing
                  ? setEditing((p) => p && { ...p, message: e.target.value })
                  : setForm((p) => ({ ...p, message: e.target.value }))
              }
              required
            />
            <div className="flex gap-2">
              <Button
                data-ocid="notifications.submit_button"
                type="submit"
                disabled={creating}
              >
                {editing ? "Save" : "Create"}
              </Button>
              {editing && (
                <Button
                  data-ocid="notifications.cancel_button"
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          {(notifications ?? []).map((n, i) => (
            <Card
              key={n.id}
              data-ocid={`notifications.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-4 flex justify-between gap-4">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <p className="text-sm mt-1 text-foreground/80">{n.message}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(n)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() =>
                      del(n.id)
                        .then(() => toast.success("Deleted"))
                        .catch(() => toast.error("Failed"))
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!notifications || notifications.length === 0) && (
            <div
              data-ocid="notifications.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              No notifications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CollegeInfoSection() {
  const { data: info, isLoading } = useCollegeInfo();
  const { mutateAsync: updateInfo, isPending } = useUpdateCollegeInfo();
  const [form, setForm] = useState({
    about: "",
    contact: "",
    principalName: "",
  });

  useEffect(() => {
    if (info)
      setForm({
        about: info.about,
        contact: info.contact,
        principalName: info.principalName,
      });
  }, [info]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateInfo(form);
      toast.success("College info updated!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  if (isLoading) return <Skeleton className="h-48" />;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">College Info</h2>
      <Card className="shadow-card">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Principal Name</Label>
              <Input
                data-ocid="college_info.input"
                value={form.principalName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, principalName: e.target.value }))
                }
                placeholder="Dr. Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <Input
                value={form.contact}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value }))
                }
                placeholder="Phone, email, address"
              />
            </div>
            <div className="space-y-2">
              <Label>About the College</Label>
              <Textarea
                data-ocid="college_info.textarea"
                rows={6}
                value={form.about}
                onChange={(e) =>
                  setForm((p) => ({ ...p, about: e.target.value }))
                }
                placeholder="About text..."
              />
            </div>
            <Button
              data-ocid="college_info.save_button"
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : null}{" "}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentQueries() {
  const { data: queries, isLoading } = useStudentQueries();
  const { mutateAsync: reply } = useReplyToQuery();
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleReply = async (id: string) => {
    const text = replies[id]?.trim();
    if (!text) return;
    try {
      await reply({ id, reply: text });
      setReplies((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      toast.success("Reply sent!");
    } catch {
      toast.error("Failed to send reply.");
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Student Queries</h2>
      {!queries?.length ? (
        <div
          data-ocid="queries.empty_state"
          className="text-center py-8 text-muted-foreground"
        >
          No queries submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((q, i) => (
            <Card
              key={q.id}
              data-ocid={`queries.item.${i + 1}`}
              className="shadow-card"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">
                      {q.studentName}{" "}
                      <span className="text-muted-foreground font-normal">
                        ({q.studentReg})
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {q.subject}
                    </div>
                  </div>
                  <Badge
                    variant={q.status === "resolved" ? "default" : "outline"}
                    className={
                      q.status === "resolved"
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                  >
                    {q.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 mb-3">{q.message}</p>
                {q.adminReply && (
                  <div className="bg-primary/5 border-l-2 border-primary p-3 rounded text-sm mb-3">
                    <span className="font-medium">Admin Reply: </span>
                    {q.adminReply}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    data-ocid={"queries.input"}
                    placeholder="Type reply..."
                    value={replies[q.id] ?? ""}
                    onChange={(e) =>
                      setReplies((p) => ({ ...p, [q.id]: e.target.value }))
                    }
                    className="flex-1"
                  />
                  <Button
                    data-ocid={"queries.submit_button"}
                    size="sm"
                    onClick={() => handleReply(q.id)}
                    disabled={!replies[q.id]?.trim()}
                  >
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function parseRequestCredentials(reason: string): {
  cleanReason: string;
  username?: string;
  password?: string;
} {
  const match = reason.match(
    /\[ADMIN_CREDENTIALS: username=([^,]+), password=([^\]]+)\]/,
  );
  if (match) {
    const cleanReason = reason
      .replace(/\s*\[ADMIN_CREDENTIALS:.*?\]/, "")
      .trim();
    return { cleanReason, username: match[1], password: match[2] };
  }
  return { cleanReason: reason };
}

function CredentialsCell({
  username,
  password,
}: { username?: string; password?: string }) {
  const [show, setShow] = useState(false);
  if (!username)
    return <TableCell className="text-xs text-muted-foreground">—</TableCell>;
  return (
    <TableCell className="text-xs">
      <div>
        <span className="font-medium">User:</span> {username}
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium">Pass:</span>
        <span>{show ? password : "••••••"}</span>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground ml-1"
          onClick={() => setShow((s) => !s)}
        >
          {show ? <Eye size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </TableCell>
  );
}

function AccessRequests() {
  const { data: requests, isLoading } = useAdminAccessRequests();
  const { mutateAsync: approve } = useApproveAccessRequest();
  const { mutateAsync: reject } = useRejectAccessRequest();
  const { mutateAsync: addSecondaryAdmin } = useAddSecondaryAdmin();

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">
        Admin Access Requests
      </h2>
      {!requests?.length ? (
        <div
          data-ocid="access_requests.empty_state"
          className="text-center py-8 text-muted-foreground"
        >
          No access requests yet.
        </div>
      ) : (
        <Card className="shadow-card">
          <Table data-ocid="access_requests.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Credentials</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r, i) => {
                const creds = parseRequestCredentials(r.reason);
                return (
                  <TableRow
                    key={r.id}
                    data-ocid={`access_requests.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {r.requestorName}
                    </TableCell>
                    <TableCell className="text-sm">{r.email}</TableCell>
                    <TableCell className="text-sm">{r.department}</TableCell>
                    <TableCell className="text-sm max-w-40 truncate">
                      {creds.cleanReason}
                    </TableCell>
                    <CredentialsCell
                      username={creds.username}
                      password={creds.password}
                    />
                    <TableCell>
                      <Badge
                        className={
                          r.status === RequestStatus.approved
                            ? "bg-success text-success-foreground"
                            : r.status === RequestStatus.rejected
                              ? "bg-destructive text-destructive-foreground"
                              : ""
                        }
                        variant={
                          r.status === RequestStatus.pending
                            ? "outline"
                            : "default"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === RequestStatus.pending && (
                        <div className="flex gap-2">
                          <Button
                            data-ocid={`access_requests.confirm_button.${i + 1}`}
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/90"
                            onClick={() =>
                              (async () => {
                                try {
                                  await approve(r.id);
                                  if (creds.username && creds.password) {
                                    await addSecondaryAdmin({
                                      username: creds.username,
                                      password: creds.password,
                                    });
                                  }
                                  toast.success(
                                    "Approved! Credentials registered — they can now log in.",
                                  );
                                } catch {
                                  toast.error("Failed to approve request.");
                                }
                              })()
                            }
                          >
                            <CheckCircle size={14} className="mr-1" /> Approve
                          </Button>
                          <Button
                            data-ocid={`access_requests.delete_button.${i + 1}`}
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() =>
                              reject(r.id)
                                .then(() => toast.success("Rejected."))
                                .catch(() => toast.error("Failed"))
                            }
                          >
                            <XCircle size={14} className="mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function StudentOverview() {
  const { data: students, isLoading } = useListStudents();
  const { mutateAsync: deleteStudent } = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [selectedReg, setSelectedReg] = useState<string | null>(null);

  const handleDelete = async (reg: string, name: string) => {
    if (!confirm(`Delete student "${name}" (${reg})? This cannot be undone.`))
      return;
    try {
      await deleteStudent(reg);
      if (selectedReg === reg) setSelectedReg(null);
      toast.success("Student deleted.");
    } catch {
      toast.error("Failed to delete student.");
    }
  };

  const filtered = (students ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Student Overview</h2>
      <div className="mb-4">
        <Input
          data-ocid="student_overview.search_input"
          placeholder="Search by name or reg number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <div
          data-ocid="student_overview.empty_state"
          className="text-center py-8 text-muted-foreground"
        >
          No students found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student, i) => (
            <div
              key={student.registrationNumber}
              data-ocid={`student_overview.item.${i + 1}`}
            >
              <Card className="shadow-card">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex gap-6">
                    <div>
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.registrationNumber}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Year {String(student.year)} · {student.batch}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-ocid={`student_overview.edit_button.${i + 1}`}
                      size="sm"
                      variant={
                        selectedReg === student.registrationNumber
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setSelectedReg((prev) =>
                          prev === student.registrationNumber
                            ? null
                            : student.registrationNumber,
                        )
                      }
                    >
                      <Eye size={14} className="mr-1" />
                      {selectedReg === student.registrationNumber
                        ? "Close"
                        : "View/Edit"}
                    </Button>
                    <Button
                      data-ocid={`student_overview.delete_button.${i + 1}`}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        handleDelete(student.registrationNumber, student.name)
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {selectedReg === student.registrationNumber && (
                <StudentDetailEditor reg={student.registrationNumber} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDetailEditor({ reg }: { reg: string }) {
  const { data: dashboard, isLoading } = useStudentDashboard(reg);
  const { mutateAsync: upsertAttendance, isPending: savingAtt } =
    useBulkUpsertAttendance();
  const { mutateAsync: upsertMarks, isPending: savingMarks } =
    useBulkUpsertMarks();

  type EditRow = {
    subjectId: string;
    subjectName: string;
    theoryAttended: string;
    theoryConducted: string;
    practAttended: string;
    practConducted: string;
    theoryPaper1: string;
    theoryPaper2: string;
    practMarks: string;
  };

  const [rows, setRows] = useState<EditRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && dashboard) {
    const initial = dashboard.subjects.map((s) => ({
      subjectId: s.subject.id,
      subjectName: s.subject.name,
      theoryAttended: String(s.theoryAttendance?.attendedClasses ?? 0),
      theoryConducted: String(s.theoryAttendance?.conductedClasses ?? 0),
      practAttended: String(s.practicalAttendance?.attendedClasses ?? 0),
      practConducted: String(s.practicalAttendance?.conductedClasses ?? 0),
      theoryPaper1: String(s.theoryMarks?.paper1 ?? 0),
      theoryPaper2: String(s.theoryMarks?.paper2 ?? 0),
      practMarks: String(s.practicalMarks?.paper1 ?? 0),
    }));
    setRows(initial);
    setInitialized(true);
  }

  const calcPct = (attended: string, conducted: string) => {
    const a = Number(attended);
    const c = Number(conducted);
    if (!c) return null;
    return Math.round((a / c) * 100);
  };

  const handleSave = async () => {
    try {
      const attRecords = rows.flatMap((row) => [
        {
          studentReg: reg,
          subjectId: row.subjectId,
          attendanceType: AttendanceType.theory,
          attendedClasses: BigInt(Number(row.theoryAttended) || 0),
          conductedClasses: BigInt(Number(row.theoryConducted) || 0),
        },
        {
          studentReg: reg,
          subjectId: row.subjectId,
          attendanceType: AttendanceType.practical,
          attendedClasses: BigInt(Number(row.practAttended) || 0),
          conductedClasses: BigInt(Number(row.practConducted) || 0),
        },
      ]);
      const marksRecords = rows.flatMap((row) => [
        {
          studentReg: reg,
          subjectId: row.subjectId,
          marksType: AttendanceType.theory,
          paper1: BigInt(Number(row.theoryPaper1) || 0),
          paper2: BigInt(Number(row.theoryPaper2) || 0),
          examinationName: "",
        },
        {
          studentReg: reg,
          subjectId: row.subjectId,
          marksType: AttendanceType.practical,
          paper1: BigInt(Number(row.practMarks) || 0),
          paper2: BigInt(0),
          examinationName: "",
        },
      ]);
      await Promise.all([
        upsertAttendance(attRecords),
        upsertMarks(marksRecords),
      ]);
      toast.success("Saved successfully!");
    } catch {
      toast.error("Failed to save.");
    }
  };

  if (isLoading)
    return (
      <div className="p-4">
        <Skeleton className="h-32" />
      </div>
    );
  if (!dashboard) return null;

  return (
    <Card className="shadow-card mt-1 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">
            {dashboard.student.name} — Attendance & Marks
          </h3>
          <Button
            data-ocid="student_overview.save_button"
            size="sm"
            onClick={handleSave}
            disabled={savingAtt || savingMarks}
          >
            {savingAtt || savingMarks ? (
              <Loader2 size={14} className="mr-1 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Theory Att %</TableHead>
                <TableHead>Practical Att %</TableHead>
                <TableHead>Theory Marks</TableHead>
                <TableHead>Practical Marks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => {
                const theoryPct = calcPct(
                  row.theoryAttended,
                  row.theoryConducted,
                );
                const practPct = calcPct(row.practAttended, row.practConducted);
                const theoryLow = theoryPct !== null && theoryPct < 75;
                const practLow = practPct !== null && practPct < 80;
                return (
                  <TableRow key={row.subjectId}>
                    <TableCell className="font-medium text-sm">
                      {row.subjectName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <Input
                            className="w-16 h-7 text-xs"
                            value={row.theoryAttended}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, theoryAttended: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            placeholder="att"
                          />
                          <span className="text-xs self-center">/</span>
                          <Input
                            className="w-16 h-7 text-xs"
                            value={row.theoryConducted}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, theoryConducted: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            placeholder="tot"
                          />
                        </div>
                        {theoryPct !== null && (
                          <span
                            className={`text-xs font-medium ${theoryLow ? "text-destructive" : "text-success"}`}
                          >
                            {theoryPct}%{theoryLow ? " ⚠" : ""}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          <Input
                            className="w-16 h-7 text-xs"
                            value={row.practAttended}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, practAttended: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            placeholder="att"
                          />
                          <span className="text-xs self-center">/</span>
                          <Input
                            className="w-16 h-7 text-xs"
                            value={row.practConducted}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r, i) =>
                                  i === idx
                                    ? { ...r, practConducted: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            placeholder="tot"
                          />
                        </div>
                        {practPct !== null && (
                          <span
                            className={`text-xs font-medium ${practLow ? "text-destructive" : "text-success"}`}
                          >
                            {practPct}%{practLow ? " ⚠" : ""}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Input
                          className="w-20 h-7 text-xs"
                          value={row.theoryPaper1}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? { ...r, theoryPaper1: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          placeholder="P1"
                        />
                        <Input
                          className="w-20 h-7 text-xs"
                          value={row.theoryPaper2}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? { ...r, theoryPaper2: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          placeholder="P2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Input
                          className="w-20 h-7 text-xs"
                          value={row.practMarks}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? { ...r, practMarks: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          placeholder="Marks"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard() {
  const [regInput, setRegInput] = useState("");
  const [batch, setBatch] = useState("");
  const [year, setYear] = useState("all");

  const handleViewReport = () => {
    const reg = regInput.trim();
    if (!reg) return;
    window.open(`/student/${reg}`, "_blank");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Report Card</h2>

      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">View Student Report Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a student registration number to open their full report card
            (attendance + marks) in a new tab.
          </p>
          <div className="flex gap-3 flex-wrap items-end">
            <div className="space-y-2 flex-1 min-w-48">
              <Label>Registration Number</Label>
              <Input
                data-ocid="reportcard.input"
                placeholder="e.g. 22-001"
                value={regInput}
                onChange={(e) => setRegInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleViewReport()}
              />
            </div>
            <div className="space-y-2 w-44">
              <Label>Year (optional)</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger data-ocid="reportcard.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Year</SelectItem>
                  {["1", "2", "3", "4"].map((y) => (
                    <SelectItem key={y} value={y}>
                      {YEAR_LABELS[y]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-44">
              <Label>Batch (optional)</Label>
              <Input
                placeholder="e.g. 2022-Batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
            </div>
            <Button
              data-ocid="reportcard.primary_button"
              onClick={handleViewReport}
              disabled={!regInput.trim()}
            >
              <FileText size={16} className="mr-2" />
              View Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Batch &amp; Year Reference</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["1", "2", "3", "4"].map((y) => (
              <div key={y} className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Year {y}</div>
                <div className="font-semibold text-sm mt-1">
                  {YEAR_LABELS[y]}
                </div>
              </div>
            ))}
          </div>
          {batch && (
            <p className="text-sm text-muted-foreground mt-3">
              Filtering reference batch: <strong>{batch}</strong>
              {year !== "all" && ` | Year: ${YEAR_LABELS[year]}`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSettings() {
  const { actor } = useActor();
  const [currentUsername, setCurrentUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!currentUsername.trim()) {
      setError("Current username cannot be empty.");
      return;
    }
    if (!oldPassword) {
      setError("Current password is required.");
      return;
    }
    if (!newUsername.trim()) {
      setError("New username cannot be empty.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!actor) {
      setError("Not connected to backend.");
      return;
    }
    setLoading(true);
    try {
      const success = await actor.changeAdminCredentials(
        currentUsername.trim(),
        oldPassword,
        newUsername.trim(),
        newPassword,
      );
      if (success) {
        setCurrentUsername("");
        setOldPassword("");
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success(
          "Credentials updated! Use the new credentials on next login.",
        );
      } else {
        setError("Invalid current credentials. Please try again.");
      }
    } catch {
      setError("Failed to update credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-display mb-6">Settings</h2>
      <Card className="shadow-card max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Change Admin Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-username">Current Username</Label>
              <Input
                data-ocid="settings.input"
                id="current-username"
                placeholder="Enter current username"
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-username">New Username</Label>
              <Input
                id="new-username"
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {error && (
              <div
                data-ocid="settings.error_state"
                className="text-destructive text-sm bg-destructive/10 p-3 rounded-md"
              >
                {error}
              </div>
            )}
            <Button
              data-ocid="settings.save_button"
              type="submit"
              className="w-full"
              disabled={loading || !actor}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                  Updating...
                </>
              ) : (
                "Update Credentials"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    if (!isAdminLoggedIn()) navigate({ to: "/admin/login" });
  }, [navigate]);

  const handleLogout = () => {
    clearAdminSession();
    navigate({ to: "/admin/login" });
  };

  const SECTION_COMPONENTS: Record<Section, React.FC> = {
    overview: Overview,
    students: ManageStudents,
    attendance: ManageAttendance,
    marks: ManageMarks,
    subjects: ManageSubjects,
    announcements: ManageAnnouncements,
    notifications: ManageNotifications,
    collegeinfo: CollegeInfoSection,
    queries: StudentQueries,
    accessrequests: AccessRequests,
    reportcard: ReportCard,
    studentoverview: StudentOverview,
    settings: AdminSettings,
  };

  const ActiveSection = SECTION_COMPONENTS[section];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0 shadow-nav">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/gmck-seal-transparent.dim_200x200.png"
              alt=""
              className="w-9 h-9 rounded-full bg-white/10"
            />
            <div>
              <div className="font-bold text-sm font-display">GMCK Admin</div>
              <div className="text-xs text-sidebar-foreground/60">
                Portal Control
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`admin_nav.${item.id}.link`}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${
                section === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon size={16} />
              <span className="flex-1">{item.label}</span>
              {section === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button
            type="button"
            data-ocid="admin_nav.logout_button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <ActiveSection />
      </main>
    </div>
  );
}

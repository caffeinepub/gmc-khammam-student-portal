import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SubjectAttendance {
    theoryMarks?: MarksRecord;
    subject: Subject;
    practicalAttendance?: AttendanceRecord;
    practicalMarks?: MarksRecord;
    theoryAttendance?: AttendanceRecord;
}
export interface StudentQuery {
    id: string;
    status: QueryStatus;
    adminReply?: string;
    studentName: string;
    subject: string;
    submittedAt: Time;
    studentReg: string;
    message: string;
}
export interface AdminAccessRequest {
    id: string;
    status: RequestStatus;
    submittedAt: Time;
    email: string;
    requestorName: string;
    department: string;
    reason: string;
}
export type Time = bigint;
export interface CollegeInfo {
    contact: string;
    about: string;
    principalName: string;
}
export interface MarksRecord {
    paper1: bigint;
    paper2: bigint;
    marksType: AttendanceType;
    studentReg: string;
    subjectId: string;
    examinationName: string;
}
export interface Notification {
    id: string;
    title: string;
    date: Time;
    message: string;
}
export interface Dashboard {
    subjects: Array<SubjectAttendance>;
    student: Student;
}
export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: Time;
    category: AnnouncementCategory;
}
export interface AttendanceRecord {
    conductedClasses: bigint;
    studentReg: string;
    attendedClasses: bigint;
    attendanceType: AttendanceType;
    subjectId: string;
}
export interface Subject {
    id: string;
    subjectType: SubjectType;
    name: string;
    year: bigint;
}
export interface UserProfile {
    name: string;
    registrationNumber?: string;
}
export interface Student {
    name: string;
    year: bigint;
    registrationNumber: string;
    batch: string;
}
export enum AnnouncementCategory {
    exam = "exam",
    academic = "academic",
    urgent = "urgent",
    general = "general"
}
export enum AttendanceType {
    practical = "practical",
    theory = "theory"
}
export enum QueryStatus {
    resolved = "resolved",
    pending = "pending"
}
export enum RequestStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum SubjectType {
    practical = "practical",
    both = "both",
    theory = "theory"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSecondaryAdmin(username: string, password: string): Promise<void>;
    addStudent(student: Student): Promise<void>;
    approveAdminAccessRequest(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkUpsertAttendance(records: Array<AttendanceRecord>): Promise<void>;
    bulkUpsertMarks(records: Array<MarksRecord>): Promise<void>;
    bulkUpsertStudents(studentsArray: Array<Student>): Promise<void>;
    changeAdminCredentials(oldUsername: string, oldPassword: string, newUsername: string, newPassword: string): Promise<boolean>;
    createAnnouncement(announcement: Announcement): Promise<void>;
    createNotification(notification: Notification): Promise<void>;
    createSubject(subject: Subject): Promise<void>;
    deleteAnnouncement(id: string): Promise<void>;
    deleteAttendance(key: string): Promise<void>;
    deleteMarks(key: string): Promise<void>;
    deleteNotification(id: string): Promise<void>;
    deleteStudent(registrationNumber: string): Promise<void>;
    deleteSubject(id: string): Promise<void>;
    generateId(prefix: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCollegeInfo(): Promise<CollegeInfo | null>;
    getStudentDashboard(registrationNumber: string): Promise<Dashboard | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAdminAccessRequests(): Promise<Array<AdminAccessRequest>>;
    listAllMarks(): Promise<Array<MarksRecord>>;
    listAnnouncements(): Promise<Array<Announcement>>;
    listAttendance(): Promise<Array<AttendanceRecord>>;
    listNotifications(): Promise<Array<Notification>>;
    listQueries(): Promise<Array<StudentQuery>>;
    listStudents(): Promise<Array<Student>>;
    listSubjects(): Promise<Array<Subject>>;
    rejectAdminAccessRequest(id: string): Promise<void>;
    replyToStudentQuery(id: string, reply: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchStudent(registrationNumber: string): Promise<Student | null>;
    submitAdminAccessRequest(requestorName: string, email: string, department: string, reason: string): Promise<string>;
    submitStudentQuery(studentReg: string, studentName: string, subject: string, message: string): Promise<string>;
    updateAnnouncement(announcement: Announcement): Promise<void>;
    updateAttendance(record: AttendanceRecord): Promise<void>;
    updateCollegeInfo(info: CollegeInfo): Promise<void>;
    updateMarks(record: MarksRecord): Promise<void>;
    updateNotification(notification: Notification): Promise<void>;
    updateStudent(student: Student): Promise<void>;
    updateSubject(subject: Subject): Promise<void>;
    verifyAdminCredentials(username: string, password: string): Promise<boolean>;
}

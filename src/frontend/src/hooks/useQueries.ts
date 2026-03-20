import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminAccessRequest,
  Announcement,
  AttendanceRecord,
  CollegeInfo,
  MarksRecord,
  Notification,
  Student,
  StudentQuery,
  Subject,
} from "../backend.d";
import { useActor } from "./useActor";

export function useStudentDashboard(reg: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboard", reg],
    queryFn: () => actor!.getStudentDashboard(reg),
    enabled: !!actor && !isFetching && !!reg,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => actor!.listAnnouncements(),
    enabled: !!actor && !isFetching,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => actor!.listNotifications(),
    enabled: !!actor && !isFetching,
  });
}

export function useCollegeInfo() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["collegeInfo"],
    queryFn: () => actor!.getCollegeInfo(),
    enabled: !!actor && !isFetching,
  });
}

export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => actor!.listSubjects(),
    enabled: !!actor && !isFetching,
  });
}

export function useStudentQueryList() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["queries"],
    queryFn: () => actor!.listQueries(),
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAccessRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminAccessRequests"],
    queryFn: () => actor!.listAdminAccessRequests(),
    enabled: !!actor && !isFetching,
  });
}

export function useBulkUpsertStudents() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (students: Student[]) => actor!.bulkUpsertStudents(students),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (student: Student) => actor!.addStudent(student),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (student: Student) => actor!.updateStudent(student),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useListStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBulkUpsertAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: AttendanceRecord[]) =>
      actor!.bulkUpsertAttendance(records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useBulkUpsertMarks() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: MarksRecord[]) => actor!.bulkUpsertMarks(records),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["marks"] }),
  });
}

export function useCreateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Subject) => actor!.createSubject(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteSubject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Announcement) => actor!.createAnnouncement(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useUpdateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (a: Announcement) => actor!.updateAnnouncement(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useDeleteAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteAnnouncement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (n: Notification) => actor!.createNotification(n),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useUpdateNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (n: Notification) => actor!.updateNotification(n),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useDeleteNotification() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useUpdateCollegeInfo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (info: CollegeInfo) => actor!.updateCollegeInfo(info),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collegeInfo"] }),
  });
}

export function useReplyToQuery() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      actor!.replyToStudentQuery(id, reply),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queries"] }),
  });
}

export function useApproveAccessRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.approveAdminAccessRequest(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminAccessRequests"] }),
  });
}

export function useRejectAccessRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actor!.rejectAdminAccessRequest(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminAccessRequests"] }),
  });
}

export function useAddSecondaryAdmin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      await actor!.addSecondaryAdmin(username, password);
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (registrationNumber: string) =>
      actor!.deleteStudent(registrationNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useSubmitStudentQuery() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: ({
      reg,
      name,
      subject,
      message,
    }: { reg: string; name: string; subject: string; message: string }) =>
      actor!.submitStudentQuery(reg, name, subject, message),
  });
}

export function useSubmitAdminAccessRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: ({
      name,
      email,
      dept,
      reason,
    }: { name: string; email: string; dept: string; reason: string }) =>
      actor!.submitAdminAccessRequest(name, email, dept, reason),
  });
}

export function useGenerateId() {
  const { actor } = useActor();
  return (prefix: string) => actor!.generateId(prefix);
}

export type {
  Student,
  AttendanceRecord,
  MarksRecord,
  Subject,
  Announcement,
  Notification,
  CollegeInfo,
  AdminAccessRequest,
  StudentQuery,
};

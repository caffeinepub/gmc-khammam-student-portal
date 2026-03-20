import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";



actor {

  // Admin credentials stored as stable vars (password-based auth, no Internet Identity)
  stable var adminUsername : Text = "admin";
  stable var adminPassword : Text = "admin123";

  // Secondary admin accounts (approved via access requests)
  let secondaryAdmins = Map.empty<Text, Text>(); // username -> password

  public type UserProfile = {
    name : Text;
    registrationNumber : ?Text;
  };

  public type Student = {
    registrationNumber : Text;
    name : Text;
    year : Nat;
    batch : Text;
  };

  public type SubjectType = {
    #theory;
    #practical;
    #both;
  };

  public type Subject = {
    id : Text;
    name : Text;
    year : Nat;
    subjectType : SubjectType;
  };

  public type AttendanceType = {
    #theory;
    #practical;
  };

  public type AttendanceRecord = {
    studentReg : Text;
    subjectId : Text;
    attendanceType : AttendanceType;
    conductedClasses : Nat;
    attendedClasses : Nat;
  };

  public type MarksRecord = {
    studentReg : Text;
    subjectId : Text;
    marksType : AttendanceType;
    marks : Nat;
  };

  public type AnnouncementCategory = {
    #general;
    #academic;
    #exam;
    #urgent;
  };

  public type Announcement = {
    id : Text;
    title : Text;
    content : Text;
    date : Time.Time;
    category : AnnouncementCategory;
  };

  public type Notification = {
    id : Text;
    title : Text;
    message : Text;
    date : Time.Time;
  };

  public type QueryStatus = {
    #pending;
    #resolved;
  };

  public type StudentQuery = {
    id : Text;
    studentReg : Text;
    studentName : Text;
    subject : Text;
    message : Text;
    status : QueryStatus;
    adminReply : ?Text;
    submittedAt : Time.Time;
  };

  public type RequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  public type AdminAccessRequest = {
    id : Text;
    requestorName : Text;
    email : Text;
    department : Text;
    reason : Text;
    status : RequestStatus;
    submittedAt : Time.Time;
  };

  public type CollegeInfo = {
    about : Text;
    contact : Text;
    principalName : Text;
  };

  public type SubjectAttendance = {
    subject : Subject;
    theoryAttendance : ?AttendanceRecord;
    practicalAttendance : ?AttendanceRecord;
    theoryMarks : ?MarksRecord;
    practicalMarks : ?MarksRecord;
  };

  public type Dashboard = {
    student : Student;
    subjects : [SubjectAttendance];
  };

  // Data stores
  let students = Map.empty<Text, Student>();
  let subjects = Map.empty<Text, Subject>();
  let attendance = Map.empty<Text, AttendanceRecord>();
  let marks = Map.empty<Text, MarksRecord>();
  let announcements = Map.empty<Text, Announcement>();
  let notifications = Map.empty<Text, Notification>();
  let queries = Map.empty<Text, StudentQuery>();
  let accessRequests = Map.empty<Text, AdminAccessRequest>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var collegeInfo : ?CollegeInfo = null;

  func typeToText(t : AttendanceType) : Text {
    switch (t) {
      case (#theory) { "theory" };
      case (#practical) { "practical" };
    };
  };

  public func generateId(prefix : Text) : async Text {
    prefix # "-" # Time.now().toText();
  };

  // ── Admin Authentication (password-based) ──────────────────────────────────

  public query func verifyAdminCredentials(username : Text, password : Text) : async Bool {
    if (username == adminUsername and password == adminPassword) {
      return true;
    };
    switch (secondaryAdmins.get(username)) {
      case (?storedPassword) { storedPassword == password };
      case (null) { false };
    };
  };

  public shared func changeAdminCredentials(oldUsername : Text, oldPassword : Text, newUsername : Text, newPassword : Text) : async Bool {
    if (oldUsername == adminUsername and oldPassword == adminPassword) {
      adminUsername := newUsername;
      adminPassword := newPassword;
      true;
    } else {
      false;
    };
  };

  // Register a new secondary admin (called when approving an access request)
  public shared func addSecondaryAdmin(username : Text, password : Text) : async () {
    secondaryAdmins.add(username, password);
  };

  public shared func removeSecondaryAdmin(username : Text) : async () {
    secondaryAdmins.remove(username);
  };

  // ── Public Read ────────────────────────────────────────────────────────────

  public query func searchStudent(registrationNumber : Text) : async ?Student {
    students.get(registrationNumber);
  };

  public query func listAnnouncements() : async [Announcement] {
    announcements.values().toArray();
  };

  public query func listNotifications() : async [Notification] {
    notifications.values().toArray();
  };

  public query func getCollegeInfo() : async ?CollegeInfo {
    collegeInfo;
  };

  public query func getStudentDashboard(registrationNumber : Text) : async ?Dashboard {
    switch (students.get(registrationNumber)) {
      case (null) { null };
      case (?student) {
        if (student.year > 4 or student.year < 1) { return null };
        let yearSubjects = subjects.values().toArray().filter(
          func(s) { s.year == student.year }
        );
        let list = List.empty<SubjectAttendance>();
        for (subject in yearSubjects.values()) {
          let theoryAttendance = attendance.values().toArray().find(
            func(r) { r.studentReg == registrationNumber and r.subjectId == subject.id and typeToText(r.attendanceType) == "theory" }
          );
          let practicalAttendance = attendance.values().toArray().find(
            func(r) { r.studentReg == registrationNumber and r.subjectId == subject.id and typeToText(r.attendanceType) == "practical" }
          );
          let theoryMarks = marks.values().toArray().find(
            func(r) { r.studentReg == registrationNumber and r.subjectId == subject.id and typeToText(r.marksType) == "theory" }
          );
          let practicalMarks = marks.values().toArray().find(
            func(r) { r.studentReg == registrationNumber and r.subjectId == subject.id and typeToText(r.marksType) == "practical" }
          );
          list.add({ subject; theoryAttendance; practicalAttendance; theoryMarks; practicalMarks });
        };
        ?{ student; subjects = list.toArray() };
      };
    };
  };

  // ── Admin: Students ────────────────────────────────────────────────────────

  public query func listStudents() : async [Student] {
    students.values().toArray();
  };

  public shared func addStudent(student : Student) : async () {
    students.add(student.registrationNumber, student);
  };

  public shared func updateStudent(student : Student) : async () {
    students.add(student.registrationNumber, student);
  };

  public shared func deleteStudent(registrationNumber : Text) : async () {
    students.remove(registrationNumber);
  };

  public shared func bulkUpsertStudents(studentsArray : [Student]) : async () {
    for (student in studentsArray.values()) {
      students.add(student.registrationNumber, student);
    };
  };

  // ── Admin: Subjects ────────────────────────────────────────────────────────

  public query func listSubjects() : async [Subject] {
    subjects.values().toArray();
  };

  public shared func createSubject(subject : Subject) : async () {
    subjects.add(subject.id, subject);
  };

  public shared func updateSubject(subject : Subject) : async () {
    subjects.add(subject.id, subject);
  };

  public shared func deleteSubject(id : Text) : async () {
    subjects.remove(id);
  };

  // ── Admin: Attendance ──────────────────────────────────────────────────────

  public shared func bulkUpsertAttendance(records : [AttendanceRecord]) : async () {
    for (record in records.values()) {
      let key = record.studentReg # "|" # record.subjectId # "|" # typeToText(record.attendanceType);
      attendance.add(key, record);
    };
  };

  // ── Admin: Marks ───────────────────────────────────────────────────────────

  public shared func bulkUpsertMarks(records : [MarksRecord]) : async () {
    for (record in records.values()) {
      let key = record.studentReg # "|" # record.subjectId # "|" # typeToText(record.marksType);
      marks.add(key, record);
    };
  };

  // ── Admin: Announcements ───────────────────────────────────────────────────

  public shared func createAnnouncement(announcement : Announcement) : async () {
    announcements.add(announcement.id, announcement);
  };

  public shared func updateAnnouncement(announcement : Announcement) : async () {
    announcements.add(announcement.id, announcement);
  };

  public shared func deleteAnnouncement(id : Text) : async () {
    announcements.remove(id);
  };

  // ── Admin: Notifications ───────────────────────────────────────────────────

  public shared func createNotification(notification : Notification) : async () {
    notifications.add(notification.id, notification);
  };

  public shared func updateNotification(notification : Notification) : async () {
    notifications.add(notification.id, notification);
  };

  public shared func deleteNotification(id : Text) : async () {
    notifications.remove(id);
  };

  // ── Student Queries ────────────────────────────────────────────────────────

  public shared func submitStudentQuery(studentReg : Text, studentName : Text, subject : Text, message : Text) : async Text {
    let id = await generateId("query");
    queries.add(id, { id; studentReg; studentName; subject; message; status = #pending; adminReply = null; submittedAt = Time.now() });
    id;
  };

  public query func listQueries() : async [StudentQuery] {
    queries.values().toArray();
  };

  public shared func replyToStudentQuery(id : Text, reply : Text) : async () {
    switch (queries.get(id)) {
      case (null) {};
      case (?q) {
        queries.add(id, { q with status = #resolved; adminReply = ?reply });
      };
    };
  };

  // ── Admin Access Requests ──────────────────────────────────────────────────

  public shared func submitAdminAccessRequest(requestorName : Text, email : Text, department : Text, reason : Text) : async Text {
    let id = await generateId("request");
    accessRequests.add(id, { id; requestorName; email; department; reason; status = #pending; submittedAt = Time.now() });
    id;
  };

  public query func listAdminAccessRequests() : async [AdminAccessRequest] {
    accessRequests.values().toArray();
  };

  public shared func approveAdminAccessRequest(id : Text) : async () {
    switch (accessRequests.get(id)) {
      case (null) {};
      case (?r) { accessRequests.add(id, { r with status = #approved }) };
    };
  };

  public shared func rejectAdminAccessRequest(id : Text) : async () {
    switch (accessRequests.get(id)) {
      case (null) {};
      case (?r) { accessRequests.add(id, { r with status = #rejected }) };
    };
  };

  // ── College Info ───────────────────────────────────────────────────────────

  public shared func updateCollegeInfo(info : CollegeInfo) : async () {
    collegeInfo := ?info;
  };
};

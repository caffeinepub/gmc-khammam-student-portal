# GMC Khammam Student Portal

## Current State
- Backend has MarksRecord (paper1, paper2) without examinationName field
- No listAttendance or listAllMarks query functions
- No deleteAttendance, deleteMarks, updateAttendance, updateMarks functions
- Admin dashboard lacks 'View All Students' tab in Marks and Attendance sections
- Student dashboard does not display examination name for marks

## Requested Changes (Diff)

### Add
- `examinationName : Text` field to MarksRecord (migrate as marks_v3)
- `listAttendance() : [AttendanceRecord]` backend query
- `listAllMarks() : [MarksRecordV3]` backend query  
- `deleteAttendance(key: Text) : ()` backend function
- `deleteMarks(key: Text) : ()` backend function
- `updateAttendance(record: AttendanceRecord) : ()` backend function
- `updateMarks(record: MarksRecordV3) : ()` backend function
- 'View All Students' tab in admin Attendance section: table of all attendance records per student, with inline edit (conductedClasses, attendedClasses, percentage) and delete
- 'View All Students' tab in admin Marks section: table of all marks records per student, with inline edit (paper1, paper2, practMarks, examinationName) and delete
- Examination name field in admin Marks individual add form and bulk upload preview
- Examination name display in student portal marks section per subject

### Modify
- MarksRecord type: add examinationName field (v3 migration)
- Admin Marks section: individual add form to include examinationName input
- Admin Marks bulk upload: parse examinationName column and display in preview
- Student dashboard: show examination name alongside marks

### Remove
- Nothing removed

## Implementation Plan
1. Update backend main.mo: add MarksRecordV3 with examinationName, add listAttendance/listAllMarks/delete/update functions, migrate marks_v2 to marks_v3 in postupgrade
2. Update frontend backend.d.ts types to reflect new functions
3. Update admin Dashboard.tsx: add View All Students tab in Attendance and Marks sections with edit/delete, add examinationName to marks forms
4. Update StudentDashboard.tsx: display examinationName in marks cards

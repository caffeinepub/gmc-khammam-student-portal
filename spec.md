# GMC Khammam Student Portal

## Current State
Admin portal has ManageAttendance and ManageMarks components inside Dashboard.tsx (~3733 lines). Both have three tabs: Add Individual, Bulk Upload, View All Students.

**Bulk Upload issues:**
- No validation feedback showing which rows have errors (e.g. unmatched subject name)
- No row count summary shown before confirming
- No clear download template button with example data
- Column header matching is case-sensitive in places
- No error rows highlighted distinctly from low-value rows

**View All Students issues:**
- Search only filters by registration number or subject — no filter by type (theory/practical)
- No pagination or row count shown (could be hundreds of rows)
- No student name shown (only reg number)
- Edit form for marks doesn't show Examination Name field in a user-friendly way
- Attendance view doesn't show student name
- No export/download option for the view all table

## Requested Changes (Diff)

### Add
- Row count badge in View All Students cards (e.g. "Showing X of Y records")
- Filter by Type (theory/practical) dropdown in both View All tabs
- Error highlighting in bulk upload preview: rows where subject name doesn't match any known subject shown with orange warning
- Downloadable Excel template with example row built into the bulk upload card (button next to instructions)
- Student name column in View All Students for both marks and attendance (show studentReg as before but also add a name lookup or show reg as-is, clearly labeled)
- Examination Name shown in attendance View All is not applicable — keep as-is; for marks View All, make Examination Name editable in the edit form clearly
- Pagination for View All tables (show 20 rows per page with Previous/Next buttons)

### Modify
- Bulk upload preview table: add a "Warnings" column or row-level badge when subject is unmatched
- ExcelUploadCard: add a download template button that generates a sample .xlsx with correct headers and one example row
- Attendance View All: add Type filter dropdown
- Marks View All: add Type filter dropdown
- Both View All: show record count "Showing X of Y"
- Both View All: add pagination (20 per page)

### Remove
- Nothing removed

## Implementation Plan
1. In ManageAttendance bulk upload preview: after parsing rows, flag rows where subject name doesn't match subjects list, show warning badge in preview table
2. In ManageMarks bulk upload preview: same subject name matching warning
3. Add download template helper function that uses SheetJS to generate and download a sample Excel file with correct headers + one example row — add button to ExcelUploadCard or inline in each bulk tab
4. In ManageAttendance View All: add type filter state + dropdown, add pagination state + controls, show count
5. In ManageMarks View All: add type filter state + dropdown, add pagination state + controls, show count
6. Validate and build

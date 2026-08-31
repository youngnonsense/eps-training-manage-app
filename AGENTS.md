# AGENTS.md - EPS Training Space Management Application

Welcome to the **EPS Training Space (HR Development)** codebase. This document outlines the architecture, data structures, business logic, and guidelines for AI agents working on this project.

---

## 1. Project Overview & Objective

* **Repository:** `youngnonsense/eps-training-manage-app`
* **Purpose:** A centralized HR Development & Training Management Dashboard designed to track, schedule, and evaluate employee training progress against corporate annual KPIs and competency matrix requirements.
* **Core Tech Stack:** Next.js 16 (React 19, Turbopack), TypeScript, Tailwind CSS, Lucide Icons, Google Sheets API (`google-spreadsheet`, `google-auth-library`, `googleapis`).

---

## 2. Business Rules & KPI Calculation

### 🎯 Annual Training KPI Requirement
* **Target:** Each employee must complete at least **2 Courses Equivalent (2 หลักสูตร)** per year.

### 📜 Course Equivalence Rules:
1. **Certificate Courses (`hasCertificate = true`):**
   * Any course marked as providing a **Certificate (มีใบ Certificate)** counts as **1.0 Full Course (1 หลักสูตรเต็ม)** directly, regardless of its duration hours.
2. **Standard Non-Certificate Courses:**
   * **6 training hours = 1.0 course equivalent** (`hours / 6.0`).
3. **Total Employee Progress Calculation:**
   $$\text{Total Courses Completed} = (\text{Certificate Courses Count}) + \left(\frac{\text{Non-Certificate Training Hours}}{6.0}\right)$$
4. **KPI Passed Condition:**
   $$\text{isPassed} = \text{Total Courses Completed} \ge 2.0$$

---

## 3. Database Schema (Google Sheets)

The application uses Google Sheets as a headless database with the following primary tabs:

### 1) `Employees`
| Column Header | Description |
| :--- | :--- |
| `employee_id` | Unique employee ID (e.g. 1001) |
| `name_th` | Thai full name |
| `name_en` | English full name |
| `department_name` | Department / Business Unit |
| `position_name` | Job position title |
| `level` | Job level |
| `level_group` | Job level category |
| `phone` | Contact phone number |
| `email` | Contact email address |
| `status` | Employment status (Active / Inactive) |

### 2) `Courses`
| Column Header | Description |
| :--- | :--- |
| `course_id` | Auto-incrementing numeric course ID |
| `course_code` | Course reference code (e.g. HR-001) |
| `course_name` | Title of the training course |
| `category` | Category (e.g. หลักสูตรทั่วไป, OJT, ความปลอดภัย) |
| `start_date` | Date string in `DD/MM/YYYY` format |
| `end_date` | Date string in `DD/MM/YYYY` format |
| `duration_hours` | Number of training hours |
| `has_certificate` | `1` / `0` (or `Yes` / `No`) indicating if course grants a certificate |
| `instructor` | Trainer name |
| `location` | Training venue (Room, Zoom, etc.) |

### 3) `Registrations`
| Column Header | Description |
| :--- | :--- |
| `registration_id` | Unique registration record ID |
| `course_id` | Reference to `Courses.course_id` |
| `employee_id` | Reference to `Employees.employee_id` |
| `attendance_status` | `Registered` or `Attended` |
| `evaluation_result` | `Pending`, `Pass`, or `Fail` |
| `hours_completed` | Actual completed training hours |

### 4) `Training_Need_Matrix`
| Column Header | Description |
| :--- | :--- |
| `position_name` | Job position title |
| `course_name` | Required course name |
| `is_required` | `1` for mandatory course for this position |

### 5) `Training_History`
| Column Header | Description |
| :--- | :--- |
| `employee_id` | Employee ID |
| `course_name` | Historical training course completed |

---

## 4. Architecture & Modular Structure

```
├── app/
│   ├── layout.tsx         # Root layout with font and metadata
│   ├── page.tsx           # Main dashboard coordinator component (~150 lines)
│   └── globals.css        # Tailwind styles & theme variables
├── components/
│   ├── Header.tsx         # Navbar, theme toggle, jump links, actions
│   ├── OverviewStats.tsx  # Stat summary cards
│   ├── CourseSection.tsx  # Course table (List) & Monthly Calendar views
│   ├── EmployeeSection.tsx# Search, filtering, KPI progress, Grid/Table views
│   └── modals/
│       ├── AddCourseModal.tsx        # New course form with DatePicker & Cer toggle
│       ├── EditCourseModal.tsx       # Course edit form with Cer toggle
│       ├── CourseAttendeesModal.tsx  # Course registrant list & attendee removal
│       ├── EmployeeDetailsModal.tsx  # Employee profile, gap analysis, history
│       └── GroupRegistrationModal.tsx# Batch multi-employee course registration
├── lib/
│   ├── googleSheets.js    # Google Spreadsheet JWT authentication helper
│   └── dateUtils.ts       # Date parsing, formatting, and calendar cell math
├── pages/api/
│   ├── dashboard.js       # GET: Fetches full dashboard data with KPI calculations
│   ├── add-course.js      # POST: Adds course to Google Sheets
│   ├── edit-course.js     # PUT: Updates course & syncs registration status
│   ├── delete-course.js   # DELETE: Deletes course from Google Sheets
│   ├── register.js        # POST: Batch registers employees to a course
│   ├── delete-registration.js # DELETE: Removes an employee from a course
│   ├── update-history.js  # POST: Adds/removes manual historical training
│   └── training-summary.js# GET: Returns employee training summary & gap analysis
├── services/
│   └── trainingService.js # Shared business logic for data aggregation & gap analysis
└── types/
    └── index.ts           # TypeScript interfaces (Employee, Course, KPI, etc.)
```

---

## 5. Development & Contribution Guidelines

1. **Keep `app/page.tsx` Lightweight:**
   * Always place new UI sections in `components/` and modals in `components/modals/`.
2. **Preserve Date Format:**
   * Always format dates sent to/from Google Sheets as `DD/MM/YYYY`.
3. **Always Run Build Check Before Committing:**
   ```bash
   npm run build
   ```
4. **Environment Variables:**
   Required in `.env.local` or Vercel:
   * `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   * `GOOGLE_PRIVATE_KEY`
   * `GOOGLE_SHEET_ID`

---
name: eps-training-management
description: Comprehensive knowledge and operational skill for maintaining, developing, and extending the EPS Training Space Management Application (Next.js + Google Sheets + HR Development).
---

# EPS Training Management Skill

This skill provides domain expertise, technical patterns, and operational procedures for the **EPS Training Space (HR Development)** application.

## Domain Knowledge & Core Concept

### 1. Annual Training KPI Logic
* **Objective:** Ensure every employee achieves at least **2.0 Course Equivalents (2 หลักสูตร)** annually.
* **Certificate Weighting:**
  * Courses with a **Certificate (`has_certificate = 1`)** = **1.0 Course Equivalent** regardless of training duration.
  * Standard courses without certificate = **$\frac{\text{Training Hours}}{6.0}$ Course Equivalents**.
* **Formula:**
  $$\text{Total Courses} = N_{\text{Cert}} + \frac{\sum \text{Hours}_{\text{Non-Cert}}}{6.0}$$
* **Passing Threshold:** $\text{Total Courses} \ge 2.0$

### 2. Training Need Matrix & Gap Analysis
* The `Training_Need_Matrix` tab defines mandatory courses by `position_name` where `is_required = 1`.
* **Gap Analysis Formula:**
  $$\text{To-Do List} = \{ c \in \text{MandatoryCourses}(\text{Position}) \mid c \notin \text{CompletedCourses}(\text{Employee}) \}$$

---

## Technical Procedures

### Adding or Modifying a Course
When updating course endpoints:
1. Ensure `has_certificate` is persisted as `'1'` or `'0'` in Google Sheets.
2. In `pages/api/edit-course.js`, when a course date changes:
   * If date is in the past: Automatically update registrants in `Registrations` to `attendance_status: 'Attended'`, `evaluation_result: 'Pass'`, and set `hours_completed`.
   * If date is in the future: Set registrants to `attendance_status: 'Registered'`, `evaluation_result: 'Pending'`, and `hours_completed: 0`.

### Modifying Types
When modifying domain data models, update [types/index.ts](file:///d:/Second_Brain/01%20Projects/00_WebApp/training-app/types/index.ts) to maintain strict type safety across all React components.

### Build & Deployment Checklist
1. Run local build test:
   ```bash
   npm run build
   ```
2. Commit with meaningful conventional commit message:
   ```bash
   git add .
   git commit -m "feat(courses): add certificate course weighting"
   ```
3. Push to `main` to trigger Vercel deployment:
   ```bash
   git push origin main
   ```

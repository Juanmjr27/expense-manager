# Tasks: Expense Manager

**Input**: spec.md + plan.md

**Prerequisites**: plan.md (required)

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create project structure (backend + frontend folders)
- [x] T002 Initialize FastAPI project with necessary dependencies
- [x] T003 Setup SQLite database connection
- [x] T004 Create basic project configuration

## Phase 2: Foundational (Blocking)

- [x] T005 Create Expense data model (SQLAlchemy)
- [x] T006 Create Pydantic schemas for Expense (request/response)
- [x] T007 Implement CRUD operations in repository/service layer
- [x] T008 Create main API router and endpoints structure

## Phase 3: User Story 1 - Record New Expense (P1)

- [x] T009 [P] Create endpoint POST /expenses (add new expense)
- [x] T010 [P] Implement validation for amount, date and category
- [x] T011 Implement error handling for invalid data
- [x] T012 [P] Create basic frontend form to add expense

## Phase 4: User Story 2 - View Expenses List (P1)

- [x] T013 [P] Create endpoint GET /expenses (list all expenses)
- [x] T014 Implement sorting by date (newest first)
- [x] T015 [P] Create frontend to display expenses list
- [x] T016 Style the list responsively

## Phase 5: User Story 3 - Filter and Search (P2)

- [x] T017 Create query parameters for filtering (date range, category)
- [x] T018 Implement search by description
- [x] T019 Add filter controls in frontend

## Phase 6: User Story 4 - Summary & Statistics (P2)

- [x] T020 Create endpoint for monthly totals and category summary
- [x] T021 Implement statistics calculations
- [x] T022 Create dashboard/summary view in frontend

## Phase 7: Polish & Final Touches

- [x] T023 Improve UI/UX and responsiveness
- [x] T024 Add data persistence verification
- [x] T025 Final testing and cleanup

---

**Guarda el archivo** (Ctrl + S) y dime **“Listo”**.

Después te explico cada sección.
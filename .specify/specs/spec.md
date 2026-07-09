# Feature Specification: Expense Manager

**Feature Branch**: `main`  
**Created**: 26/06/2026  
**Status**: Draft

**Input**: Application for personal expense tracking and management.

## User Scenarios & Testing (mandatory)

### User Story 1 - Record New Expense (Priority: P1)

As a user, I want to quickly add a new expense so I can track my daily spending.

**Why this priority**: This is the core functionality. Without it, there is no app.

**Independent Test**: User can add an expense and see it immediately in the list.

**Acceptance Scenarios**:

1. **Given** I am on the main page, **When** I fill amount, category, date and description and click "Save", **Then** the expense is saved and appears in the list.
2. **Given** I enter an invalid amount, **When** I try to save, **Then** I see a clear error message.

### User Story 2 - View Expenses List (Priority: P1)

As a user, I want to see all my expenses in a list so I can review my spending.

**Acceptance Scenarios**:

1. **Given** I have recorded expenses, **When** I open the app, **Then** I see them sorted by date (newest first).
2. **Given** I have many expenses, **When** I scroll, **Then** the list loads smoothly.

### User Story 3 - Filter and Search Expenses (Priority: P2)

As a user, I want to filter expenses by date, category or search by description.

### User Story 4 - Summary and Statistics (Priority: P2)

As a user, I want to see total spent per month, per category and balance.

## Requirements

### Functional Requirements

- **FR-001**: Users must be able to add expenses with amount, date, category and description.
- **FR-002**: Expenses must be stored persistently.
- **FR-003**: Users must be able to view, filter and search expenses.
- **FR-004**: The app must show summary statistics (total by month/category).

### Key Entities

- **Expense**: amount, date, category, description, created_at

## Success Criteria

- **SC-001**: User can add and see a new expense in less than 5 seconds.
- **SC-002**: The app works correctly on mobile, tablet and desktop.
- **SC-003**: Data is never lost when closing/reopening the app.

## Assumptions

- Users don't need user accounts (single user local app for now).
- Categories are predefined but can be extended later.
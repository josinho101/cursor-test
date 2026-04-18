# Frontend Coding Rules (React + Material UI)

This document defines the baseline rules for implementing the frontend to keep the code consistent, reusable, readable, and easy to maintain.

## Tech Stack

- Use **ReactJS** for UI development.
- Use **Material UI (MUI)** as the primary component library.

## Component Design

- Build **small, reusable components**.
- Prefer composition over large, deeply-nested components.
- Keep components focused on a single responsibility (UI, layout, or a specific behavior).

## Code Quality

- Keep code **manageable and readable**:
  - Prefer clear names over short names.
  - Avoid overly long files/components; extract reusable pieces early.
  - Keep logic separated from presentation where practical.

## File Types

- **React component files** must use the `.jsx` extension.
- **Services, helpers, and utilities** must use the `.js` extension.

Examples:
- `taskCard.jsx`, `boardList.jsx` (components)
- `authService.js`, `boardService.js`, `dateUtils.js` (services/utilities)

## Naming Conventions (camelCasing)

- **File names** must be in `camelCasing`.
- **Variables and functions** must be in `camelCasing`.

Examples:
- Files: `taskDetailsDialog.jsx`, `userProfileMenu.jsx`, `apiClient.js`
- Variables/functions: `taskTitle`, `selectedBoardId`, `fetchBoards()`, `createCard()`


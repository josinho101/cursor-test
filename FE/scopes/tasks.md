# Frontend Tasks Breakdown

This document breaks the high-level frontend features into smaller, manageable tasks for implementation tracking. Dependencies are listed to show logical implementation order, and the status column can be updated as work progresses.

Status values:

- `Not Started`
- `In Progress`
- `Blocked`
- `Done`

## 1. General / Foundation


| ID   | Task                                                                                       | Dependencies | Implementation Status |
| ---- | ------------------------------------------------------------------------------------------ | ------------ | --------------------- |
| GF-1 | Set up the React application structure using Material UI as the primary component library. | None         | Done                  |
| GF-2 | Define the main application layout for authenticated and unauthenticated screens.          | GF-1         | Done                  |
| GF-3 | Implement dark mode and light mode theme configuration.                                    | GF-1         | Done                  |
| GF-4 | Add a theme switch control that is accessible from the main UI.                            | GF-2, GF-3   | Done                  |
| GF-5 | Ensure core layouts and screens are responsive across desktop, tablet, and mobile sizes.   | GF-2         | Done                  |
| GF-6 | Establish route protection rules for authenticated and role-restricted pages.              | GF-2         | Done                  |
| GF-7 | Define shared loading, empty, and error states for feature screens.                        | GF-2         | Done                  |
| GF-8 | Ensure the app starts in dark mode by default.                                             | GF-3         | Done                  |
| GF-9 | Place the user widget at the top-right, next to the theme switch.                          | GF-2, GF-4   | Done                  |
| GF-10 | Add a collapse toggle (hamburger control) on the left navigation to expand or collapse the sidebar on desktop and close the drawer on mobile. | GF-2, GF-5 | Done                  |


## 2. Authentication


| ID   | Task                                                                               | Dependencies     | Implementation Status |
| ---- | ---------------------------------------------------------------------------------- | ---------------- | --------------------- |
| AU-1 | Build the login screen with form validation and submission handling.               | GF-1, GF-2       | Done                  |
| AU-2 | Connect the login flow to JWT-based authentication.                                | AU-1             | Done                  |
| AU-3 | Persist authenticated session data on the client.                                  | AU-2             | Done                  |
| AU-4 | Restore the user session when the application reloads.                             | AU-3             | Done                  |
| AU-5 | Create a user widget that shows the current user identity and available actions.   | AU-3, GF-2       | Done                  |
| AU-6 | Implement logout and clear all session-related client state.                       | AU-3, AU-5       | Done                  |
| AU-7 | Handle unauthorized and expired-session states by redirecting users appropriately. | AU-2, AU-3, GF-6 | Done                  |


## 3. Boards


| ID   | Task                                                                             | Dependencies           | Implementation Status |
| ---- | -------------------------------------------------------------------------------- | ---------------------- | --------------------- |
| BO-1 | Build the boards view where users can see available boards.                      | AU-4, GF-2, GF-6, GF-7 | Done                  |
| BO-2 | Add a create-board flow with inputs for board name and description.              | BO-1                   | Done                  |
| BO-3 | Validate board creation inputs and surface errors clearly in the UI.             | BO-2, GF-7             | Done                  |
| BO-4 | Implement board details display for name and description.                        | BO-1                   | Done                  |
| BO-5 | Add an edit-board flow for updating board name and description.                  | BO-4                   | Done                  |
| BO-6 | Add a delete-board action with confirmation to prevent accidental removal.       | BO-1                   | Done                  |
| BO-7 | Refresh the board list and board details after create, edit, and delete actions. | BO-2, BO-4, BO-5, BO-6 | Done                  |


## 4. Lists


| ID   | Task                                                                      | Dependencies     | Implementation Status |
| ---- | ------------------------------------------------------------------------- | ---------------- | --------------------- |
| LI-1 | Display all lists within a selected board in a clear column-based layout. | BO-4, GF-5, GF-7 | Done                  |
| LI-2 | Add a create-list flow within a board.                                    | LI-1             | Done                  |
| LI-3 | Implement inline or modal-based list renaming.                            | LI-1             | Done                  |
| LI-4 | Add drag-and-drop support to reorder lists within a board.                | LI-1             | Done                  |
| LI-5 | Persist updated list order after drag-and-drop actions.                   | LI-4             | Done                  |
| LI-6 | Add a delete-list action with confirmation.                               | LI-1             | Done                  |
| LI-7 | Handle empty-board and empty-list states gracefully.                      | LI-1, GF-7       | Done                  |


## 5. Cards and Tasks


| ID    | Task                                                          | Dependencies | Implementation Status |
| ----- | ------------------------------------------------------------- | ------------ | --------------------- |
| CA-1  | Display cards inside each list with key summary information.  | LI-1, LI-7   | Done                  |
| CA-2  | Add a create-card flow within a selected list.                | CA-1         | Done                  |
| CA-3  | Implement card details editing for title and description.     | CA-1         | Done                  |
| CA-4  | Add a delete-card action with confirmation.                   | CA-1         | Done                  |
| CA-5  | Enable drag-and-drop to move cards across lists.              | CA-1         | Done                  |
| CA-6  | Enable drag-and-drop to reorder cards within the same list.   | CA-1         | Done                  |
| CA-7  | Persist card position changes after reorder and move actions. | CA-5, CA-6   | Done                  |
| CA-8  | Add member assignment UI for cards.                           | CA-3         | Done                  |
| CA-9  | Allow setting and updating due dates on cards.                | CA-3         | Done                  |
| CA-10 | Add label or tag selection and display on cards.              | CA-3         | Done                  |
| CA-11 | Build a comments section within the card details view.        | CA-3         | Done                  |
| CA-12 | Support adding new comments and rendering comment history.    | CA-11        | Done                  |


## 6. Subtasks and Checklists


| ID   | Task                                                       | Dependencies | Implementation Status |
| ---- | ---------------------------------------------------------- | ------------ | --------------------- |
| CH-1 | Add a checklist section inside the card details view.      | CA-3         | Not Started           |
| CH-2 | Implement checklist creation within a card.                | CH-1         | Not Started           |
| CH-3 | Add checklist items with creation and basic validation.    | CH-2         | Not Started           |
| CH-4 | Allow checklist items to be marked complete or incomplete. | CH-3         | Not Started           |
| CH-5 | Support reordering checklist items.                        | CH-3         | Not Started           |
| CH-6 | Show checklist progress as a completion percentage.        | CH-3, CH-4   | Not Started           |
| CH-7 | Keep checklist progress updated when item states change.   | CH-4, CH-6   | Not Started           |


## 7. Collaboration


| ID   | Task                                                                                    | Dependencies           | Implementation Status |
| ---- | --------------------------------------------------------------------------------------- | ---------------------- | --------------------- |
| CO-1 | Reflect real-time board and card updates in the UI when another user makes changes.     | BO-4, LI-1, CA-1, CA-3 | Not Started           |
| CO-2 | Handle optimistic or loading states for collaborative updates to reduce user confusion. | CO-1, GF-7             | Not Started           |
| CO-3 | Support user mentions while writing card comments.                                      | CA-11, CA-12           | Not Started           |
| CO-4 | Highlight or format mentioned users in comment content.                                 | CO-3                   | Not Started           |
| CO-5 | Build a notifications UI for assignments, due dates, comments, and mentions.            | AU-5, GF-2             | Not Started           |
| CO-6 | Show unread vs. read notification states.                                               | CO-5                   | Not Started           |
| CO-7 | Allow users to view and clear notification items.                                       | CO-5, CO-6             | Not Started           |


## 8. Search, Filter, and Sorting


| ID   | Task                                                                      | Dependencies            | Implementation Status |
| ---- | ------------------------------------------------------------------------- | ----------------------- | --------------------- |
| SF-1 | Add a global search entry point accessible from the main application UI.  | GF-2                    | Not Started           |
| SF-2 | Implement search results across boards and cards.                         | SF-1, BO-1, CA-1        | Not Started           |
| SF-3 | Support searching by title and description.                               | SF-2                    | Not Started           |
| SF-4 | Support searching by labels, assigned members, and due dates.             | SF-2, CA-8, CA-9, CA-10 | Not Started           |
| SF-5 | Add card filtering by member within board views.                          | CA-1, CA-8              | Not Started           |
| SF-6 | Add card filtering by status within board views.                          | CA-1                    | Not Started           |
| SF-7 | Ensure search and filter states are reflected clearly in the UI.          | SF-2, SF-5, SF-6        | Not Started           |
| SF-8 | Provide empty-state messaging when no search or filter results are found. | SF-2, SF-7, GF-7        | Not Started           |


## 9. Admin Features


| ID   | Task                                                                          | Dependencies     | Implementation Status |
| ---- | ----------------------------------------------------------------------------- | ---------------- | --------------------- |
| AD-1 | Build an admin-only user management screen.                                   | AU-4, GF-2, GF-6 | Not Started           |
| AD-2 | Display a list of users with relevant account details and role information.   | AD-1             | Not Started           |
| AD-3 | Add actions for managing user access or roles based on authorization rules.   | AD-2             | Not Started           |
| AD-4 | Build an admin workspace management screen.                                   | AU-4, GF-2, GF-6 | Not Started           |
| AD-5 | Display available workspaces and their summary information.                   | AD-4             | Not Started           |
| AD-6 | Add workspace management actions aligned with the allowed admin capabilities. | AD-5             | Not Started           |
| AD-7 | Restrict admin screens and actions to authorized roles only.                  | GF-6, AD-1, AD-4 | Not Started           |



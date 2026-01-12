# Assignment System Documentation

## Overview
The assignment system allows teachers to create and distribute worksheets to students, who can then complete and submit them for grading. The system includes:

1. **Assignment Creation**: Teachers can create assignments with various question types
2. **Assignment Distribution**: Teachers can assign to all students or specific students
3. **Student Completion**: Students can access and complete assignments
4. **Submission Tracking**: Teachers receive notifications when assignments are submitted
5. **Grading Interface**: Teachers can review and grade student submissions

## Components

### 1. AssignmentsPage (Teacher)
Located in `/workspace/src/components/AssignmentsPage.jsx`

Features:
- Question type selection (Short Answer, Multiple Choice, Fill in Blanks, Matching, Comprehension)
- Question editor with text/image support
- Assignment distribution (to all students or select students)
- Assignment publishing to class

### 2. StudentWorksheetSolver (Student)
Located in `/workspace/src/components/LandingPage.jsx`

Features:
- Displays assignments to students
- Handles different question types
- Collects student answers
- Submits completed assignments

### 3. ClassDashboard (Teacher)
Located in `/workspace/src/components/ClassDashboard.jsx`

Features:
- Shows assignment inbox with submissions
- Grading interface for reviewing student work
- Notifications for new submissions

## How It Works

### 1. Creating an Assignment
1. Teacher clicks "Assignment Studio" in ClassDashboard
2. Creates questions using different types
3. Selects distribution (all students or specific students)
4. Publishes assignment to class

### 2. Student Access
1. Students log in using their access code
2. See available assignments in their portal
3. Click "Start" to begin working on assignment
4. Complete and submit assignment

### 3. Submission & Grading
1. Upon submission, assignment goes to teacher's inbox
2. Teacher receives notification in ClassDashboard
3. Teacher can open grading interface to review and award points
4. Student receives points for completed assignment

## Technical Implementation

### Data Flow
```
Teacher creates assignment → Stored in class.assignments
Student accesses assignment → Filtered by assignedTo property
Student submits → Added to class.submissions
Teacher grades → Updates submission status and awards points
```

### Key Properties
- `assignedTo`: Array of student IDs or 'all' for all students
- `assignedToAll`: Boolean indicating if assignment is for all students
- `submissions`: Array containing student submissions with answers
- `status`: 'submitted' or 'graded' for tracking

## Question Types Support
- **Short Answer**: Text input field
- **Multiple Choice**: Radio button selection
- **Fill in Blanks**: Text inputs embedded in question text
- **Matching**: Input fields for matching pairs
- **Comprehension**: Textarea for written responses to passages
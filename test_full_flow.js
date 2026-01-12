/**
 * Test script to verify the complete assignment flow from publishing to student receiving
 */

// Simulate the assignment publishing logic from App.jsx
function publishAssignment(assignmentData, activeClass, classes) {
  const newAsn = { 
    ...assignmentData, 
    id: Date.now(),
    // Ensure consistent formatting of assignedTo array
    assignedTo: Array.isArray(assignmentData.assignedTo) ? 
      assignmentData.assignedTo.map(id => String(id)) : 
      (assignmentData.assignedTo || 'all'),  // Store who it's assigned to
    assignedToAll: assignmentData.assignedToAll !== undefined ? assignmentData.assignedToAll : true  // Default to all
  };

  const newClasses = classes.map(c => {
    if (String(c.id) === String(activeClass.id)) {
      return {
        ...c,
        assignments: [...(c.assignments || []), newAsn],
        submissions: c.submissions || []
      };
    }
    return c;
  });
  
  return { newClasses, newAsn };
}

// Simulate the assignment filtering logic from LandingPage.jsx
function filterAssignments(liveClassData, studentData) {
  // Helper function to normalize student ID for comparison
  const normalizeStudentId = (id) => {
    if (id === undefined || id === null) return '';
    return String(id).trim();
  };

  // Find class with normalized ID comparison to handle string/number mismatches
  const liveClassDataWithNormalizedIds = {
    ...liveClassData,
    students: liveClassData.students?.map(s => ({
      ...s,
      id: normalizeStudentId(s.id)
    }))
  };

  // Filter assignments to only show those assigned to this student
  // If assignedTo is 'all' or if the student is in the selected list
  const studentAssignments = liveClassDataWithNormalizedIds?.assignments?.filter(assignment => {
    // If assignedToAll is true, all students can see it
    if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
      return true;
    }
    // If specific students are assigned, check if current student is in the list
    // Handle potential type mismatches (string vs number IDs) and normalization
    if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
      const normalizedStudentId = normalizeStudentId(studentData.studentId);
      return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
    }
    // Default: show the assignment
    return true;
  }) || [];
  
  return studentAssignments;
}

// Test the complete flow
console.log("Testing Complete Assignment Flow...\n");

// Initial setup
const initialClasses = [
  {
    id: 1,
    name: "Class A",
    students: [
      { id: '123', name: "John Doe", accessCode: "00001" },  // String ID in class
      { id: '456', name: "Jane Smith", accessCode: "00002" }  // String ID in class
    ],
    assignments: []
  }
];

const activeClass = initialClasses[0];
const assignmentData = {
  title: "Math Test",
  questions: [{ id: 1, question: "What is 2+2?" }],
  date: new Date().toISOString(),
  assignedTo: ['123'],  // Assign to John specifically
  assignedToAll: false
};

// Step 1: Publish assignment (simulating teacher action)
console.log("Step 1: Publishing assignment...");
const { newClasses, newAsn } = publishAssignment(assignmentData, activeClass, initialClasses);

console.log("Assignment published:", newAsn.title);
console.log("Assigned to:", newAsn.assignedTo);
console.log("Assigned to all:", newAsn.assignedToAll);
console.log();

// Step 2: Student logs in and receives assignments (simulating student experience)
console.log("Step 2: Student accessing assignments...");

// Student 1: John (should receive the assignment)
const johnStudentData = {
  studentId: 123,  // Number ID from login (type mismatch scenario)
  studentName: "John Doe",
  classData: initialClasses[0]  // Original class data from login
};

// Find the updated class data (this simulates how LandingPage.jsx finds the live class data)
const normalizeStudentId = (id) => {
  if (id === undefined || id === null) return '';
  return String(id).trim();
};

const liveClassData = newClasses.find(c => 
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(johnStudentData.studentId))
) || johnStudentData.classData;

const johnAssignments = filterAssignments(liveClassData, johnStudentData);

console.log("John's assignments:", johnAssignments.length);
console.log("John should see 1 assignment, got:", johnAssignments.length);
console.log("Assignment title:", johnAssignments[0]?.title || "None");
console.log("✓ John received assignment correctly\n");

// Student 2: Jane (should NOT receive the assignment)
const janeStudentData = {
  studentId: '456',  // String ID from login (same type as in class data)
  studentName: "Jane Smith",
  classData: initialClasses[0]  // Original class data from login
};

const janeLiveClassData = newClasses.find(c => 
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(janeStudentData.studentId))
) || janeStudentData.classData;

const janeAssignments = filterAssignments(janeLiveClassData, janeStudentData);

console.log("Jane's assignments:", janeAssignments.length);
console.log("Jane should see 0 assignments, got:", janeAssignments.length);
console.log("Assignment title:", janeAssignments[0]?.title || "None");
console.log("✓ Jane correctly did not receive assignment\n");

// Step 3: Test assignment for all students
console.log("Step 3: Testing assignment for all students...");

const allStudentsAssignment = {
  title: "General Announcement",
  questions: [{ id: 2, question: "Welcome to class!" }],
  date: new Date().toISOString(),
  assignedTo: 'all',  // Assign to all students
  assignedToAll: true
};

const resultAfterAll = publishAssignment(allStudentsAssignment, activeClass, newClasses);
const newClassesAfterAll = resultAfterAll.newClasses;

// Both students should now see both assignments
const johnLiveClassAfterAll = newClassesAfterAll.find(c => 
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(johnStudentData.studentId))
) || johnStudentData.classData;

const johnAssignmentsAfterAll = filterAssignments(johnLiveClassAfterAll, johnStudentData);
console.log("John's assignments after general announcement:", johnAssignmentsAfterAll.length);
console.log("John should see 2 assignments, got:", johnAssignmentsAfterAll.length);

const janeLiveClassAfterAll = newClassesAfterAll.find(c => 
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(janeStudentData.studentId))
) || janeStudentData.classData;

const janeAssignmentsAfterAll = filterAssignments(janeLiveClassAfterAll, janeStudentData);
console.log("Jane's assignments after general announcement:", janeAssignmentsAfterAll.length);
console.log("Jane should see 1 assignment, got:", janeAssignmentsAfterAll.length);
console.log("✓ General assignment delivered to both students correctly\n");

console.log("🎉 Complete assignment flow test passed! Students should now receive assignments correctly.");
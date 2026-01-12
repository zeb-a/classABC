/**
 * Guide steps for onboarding - arrow-based with action-triggered progression
 */

export const GUIDE_STEPS = {
  portal: [
    {
      id: 'welcome',
      title: '👋 Welcome to Class123!',
      description: 'Click the "Add Class" button to create your first class.',
      target: '.add-class-button',
      action: 'click',
      hint: 'Enter the class name (e.g., "Room 4A", "Class 2B")',
    },
    {
      id: 'class-name-input',
      title: '📝 Class Name',
      description: 'Type your class name here. Be creative! 🎨',
      target: 'input[type="text"]',
      action: 'input',
      hint: 'Make it memorable for your students',
    },
    {
      id: 'create-class-btn',
      title: '✅ Create Class',
      description: 'Click "Create Class" to save your first class!',
      target: 'button[style*="#4CAF50"]',
      action: 'click',
      hint: 'Your class will appear below',
    },
    {
      id: 'class-select',
      title: '📚 Select Your Class',
      description: 'Click on your new class to enter the classroom dashboard.',
      target: '[style*="background: white"]',
      action: 'click',
      hint: 'Time to add students!',
    },
  ],
  dashboard: [
    {
      id: 'add-student',
      title: '👥 Add First Student',
      description: 'Click "Add Student" to enroll your first student.',
      target: '.add-student-button',
      action: 'click',
      hint: 'Every great class starts with students',
    },
    {
      id: 'student-name',
      title: '📝 Student Name',
      description: 'Enter the student name.',
      target: 'input[type="text"]',
      action: 'input',
      hint: 'Be accurate for the attendance system',
    },
    {
      id: 'save-student',
      title: '💾 Save Student',
      description: 'Click "Save" to add the student to your class.',
      target: 'button[style*="#4CAF50"]',
      action: 'click',
      hint: 'You can add more students anytime',
    },
    {
      id: 'student-card',
      title: '🎯 Student Card',
      description: 'Click on a student card to award behavior points!',
      target: '.student-cards-container > div:first-child',
      action: 'click',
      hint: 'This opens the behavior selection modal',
    },
    {
      id: 'behavior-cards',
      title: '⭐ Behavior Cards',
      description: 'Click a green "WOW" card to award positive points. Red cards for behaviors to improve.',
      target: '.behavior-cards-container button',
      action: 'click',
      hint: 'Mix positive and constructive feedback',
    },
    {
      id: 'attendance',
      title: '✓ Attendance Mode',
      description: 'Click the checkmark icon to mark students absent/present each day.',
      target: '[data-navbar-icon="attendance"]',
      action: 'click',
      hint: 'Great for tracking class participation',
    },
    {
      id: 'lucky-draw',
      title: '🎲 Lucky Draw',
      description: 'Click the dice icon to randomly pick a student for activities.',
      target: '[data-navbar-icon="lucky-draw"]',
      action: 'click',
      hint: 'Perfect for fair classroom selection',
    },
    {
      id: 'egg-road',
      title: '🥚 Egg Road Rewards',
      description: 'Click the trophy icon to see your class progress toward rewards!',
      target: '[data-navbar-icon="egg-road"]',
      action: 'click',
      hint: 'Students love tracking progress',
    },
  ],
};

/**
 * Helper to check if user has completed guide
 */
export const hasCompletedGuide = (email, view) => {
  if (!email) return false;
  const key = `class123_guide_${view}_${email}`;
  return localStorage.getItem(key) === 'true';
};

/**
 * Helper to mark guide as completed
 */
export const markGuideComplete = (email, view) => {
  if (!email) return;
  const key = `class123_guide_${view}_${email}`;
  localStorage.setItem(key, 'true');
};

/**
 * Helper to reset guide for user
 */
export const resetGuide = (email) => {
  if (!email) return;
  localStorage.removeItem(`class123_guide_portal_${email}`);
  localStorage.removeItem(`class123_guide_dashboard_${email}`);
};

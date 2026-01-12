# Custom Action-Driven Onboarding Guide

## Overview

This is a **game-style guided tutorial** that reacts to user actions in real time. Unlike traditional tooltip tours, this guide advances **ONLY** when the user performs the required action—no next/back buttons, no manual navigation.

## Architecture

### 1. **useOnboardingGuide Hook** (`src/hooks/useOnboardingGuide.js`)

Manages the entire guide flow:

```javascript
const guide = useOnboardingGuide(steps, userId);
```

**Returns:**
- `isActive` - Guide is currently running
- `isCompleted` - User has finished the guide
- `currentStep` - Current step object
- `currentStepIndex` - Which step we're on
- `totalSteps` - Total number of steps
- `startGuide()` - Begin/restart the guide
- `completeGuide()` - Finish the guide (called automatically)
- `completeStep()` - Advance to next step (called when action is detected)

**How it works:**
1. Listens for specific action types on target elements
2. When action is detected, validates it (optional validation function)
3. Removes the listener and advances to next step
4. On final step, marks guide as completed in localStorage
5. Never shows the same guide twice to the same user

### 2. **GuideArrow Component** (`src/components/GuideArrow.jsx`)

Renders the visual guide with:

- **Animated SVG curved arrow** pointing to the target element
- **Floating instruction text** with gentle animation
- **Pulsing glow effect** around the target
- **Dynamic positioning** - repositions on scroll/resize
- **Smooth drawing animation** when arrow appears

**Features:**
- No overlay that blocks interaction
- Arrow follows target element smoothly
- Text floats gently above the arrow
- Fully responsive to window events

### 3. **Guide Steps Schema** (`src/utils/guideSteps.js`)

Define what the guide should do:

```javascript
{
  id: 'step-name',
  targetSelector: '.css-selector',  // Must match actual DOM element
  instruction: 'Click here to... 📚',
  actionType: 'click' | 'input' | 'submit' | 'api',
  validation: () => boolean (optional)
}
```

**Action Types:**
- `click` - Advances when target is clicked
- `input` - Advances when target has non-empty value
- `submit` - Advances when form is submitted
- `api` - Must manually call `guide.completeStep()` after API response

**Example Steps:**

```javascript
export const PORTAL_GUIDE_STEPS = [
  {
    id: 'portal-welcome',
    targetSelector: '.add-class-button',
    instruction: 'Click here to create your first class! 📚',
    actionType: 'click',
  },
  {
    id: 'portal-name',
    targetSelector: 'input[type="text"]',
    instruction: 'Type your class name (e.g., "Room 4A") ✏️',
    actionType: 'input',
  },
  // ... more steps
];
```

## Usage in App.jsx

```javascript
import GuideArrow from './components/GuideArrow';
import { useOnboardingGuide } from './hooks/useOnboardingGuide';
import { getGuideStepsForView, markGuideAsCompleted } from './utils/guideSteps';

function App() {
  const guideSteps = getGuideStepsForView(view); // 'portal' or 'dashboard'
  const guide = useOnboardingGuide(guideSteps, user?.email);

  return (
    <>
      {/* Main component */}
      <TeacherPortal ... />
      
      {/* Render guide arrow when active */}
      {guide.isActive && guide.currentStep && (
        <GuideArrow step={guide.currentStep} isVisible={true} />
      )}
      
      {/* Help button to restart guide */}
      {user && (
        <HelpIcon onClick={() => {
          if (!guide.isCompleted) {
            guide.startGuide();
          }
        }} />
      )}
    </>
  );
}
```

## How It Works - Step by Step

### User Journey - Portal (Class Creation)

1. **User logs in** → Portal view loads
2. **Arrow appears** pointing to "Add Class" button with instruction "Click here to create your first class! 📚"
3. **User clicks "Add Class"** → Modal opens
4. **Arrow + instruction change** → Now pointing to name input "Type your class name ✏️"
5. **User types name** → Input validates as non-empty
6. **Auto-advance** → Arrow moves to "Create Class" button "Click to create! 🎉"
7. **User clicks Create** → Class is created, arrow appears on class card "Click to enter dashboard 🚀"
8. **User clicks class** → Enters dashboard
9. **Guide marks as complete** → Won't show portal guide again

### User Journey - Dashboard (Student Addition)

1. **User enters dashboard** → Gets new guide (separate from portal)
2. **Arrow points to "Add Student"** → "Click to add your first student 👥"
3. **User clicks** → Modal opens
4. **Arrow moves to name input** → "Type the student's name ✏️"
5. **User types** → Validates non-empty
6. **Arrow moves to Save button** → "Click to save 💾"
7. **User clicks Save** → Student added
8. **Sequence continues** through clicking student card, awarding points, etc.
9. **After all steps** → "You're all set! 🎉"

## localStorage Keys

```javascript
// Portal guide completion
class123_guide_completed_portal_user@example.com = 'true'

// Dashboard guide completion
class123_guide_completed_dashboard_user@example.com = 'true'
```

## Customization

### Add More Steps

Edit `src/utils/guideSteps.js`:

```javascript
export const PORTAL_GUIDE_STEPS = [
  // Existing steps...
  {
    id: 'new-step',
    targetSelector: '.new-element',
    instruction: 'Do something here! 🎯',
    actionType: 'click',
  },
];
```

### Change Arrow Colors/Animation

Edit `GuideArrow.jsx`:

```javascript
// Change arrow color from green to blue
stroke="#2196F3"

// Adjust animation speed
animation: 'guideFloat 2s ease-in-out infinite' // was 3s
```

### Add Custom Validation

```javascript
{
  id: 'email-input',
  targetSelector: 'input[type="email"]',
  instruction: 'Enter your email 📧',
  actionType: 'input',
  validation: () => {
    const input = document.querySelector('input[type="email"]');
    return input.value.includes('@'); // Only advance if @ symbol
  }
}
```

### API Actions

For steps that require API calls:

```javascript
{
  id: 'api-step',
  targetSelector: '.save-button',
  instruction: 'Save your changes',
  actionType: 'api', // Don't auto-advance
}

// Then manually advance after API response:
.then(() => guide.completeStep())
```

## Technical Details

### Event Listeners

The hook attaches listeners on the target element:

```javascript
// For click actions
targetElement.addEventListener('click', handleAction);

// For input actions
targetElement.addEventListener('input', handleInput);

// For submit actions
targetElement.addEventListener('submit', handleAction);
```

### Cleanup

Listeners are automatically removed when:
- Step changes
- Guide is destroyed
- Component unmounts

### DOM Positioning

Arrow is absolutely positioned using `getBoundingClientRect()`:

```javascript
const rect = targetElement.getBoundingClientRect();
const targetX = window.scrollX + rect.left + rect.width / 2;
const targetY = window.scrollY + rect.top + rect.height / 2;
```

Repositions on:
- Window scroll (passive listener)
- Window resize
- Step change

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- **No external libraries** - Just React hooks + CSS animations
- **Minimal redraws** - Only arrow/text repositions on scroll
- **Passive listeners** - Scroll listener doesn't block rendering
- **Auto-cleanup** - No memory leaks on unmount

## Troubleshooting

### Guide doesn't start

Check:
1. User email is being passed: `user?.email`
2. View is being tracked: `getGuideStepsForView(view)`
3. Guide not already completed in localStorage

### Arrow not pointing to element

Verify:
1. CSS selector in step is correct: `document.querySelector(targetSelector)`
2. Element exists in DOM when arrow renders
3. Element is not hidden (`display: none` or off-screen)

### Step doesn't advance

Check:
1. Action type matches what user is doing
2. For `input` type: input has non-empty value
3. No JavaScript errors in console
4. Element selector is unique (no duplicate IDs)

### Reset Guide for Testing

In browser console:

```javascript
localStorage.removeItem('class123_guide_completed_portal_user@example.com');
localStorage.removeItem('class123_guide_completed_dashboard_user@example.com');
// Refresh page
```

## Examples

### Example 1: Form Signup Flow

```javascript
const signupSteps = [
  {
    id: 'name',
    targetSelector: 'input[name="fullname"]',
    instruction: 'Enter your full name 📝',
    actionType: 'input',
  },
  {
    id: 'email',
    targetSelector: 'input[type="email"]',
    instruction: 'Enter your email address 📧',
    actionType: 'input',
    validation: () => {
      const email = document.querySelector('input[type="email"]').value;
      return email.includes('@');
    }
  },
  {
    id: 'submit',
    targetSelector: 'form',
    instruction: 'Click submit to complete signup 🎉',
    actionType: 'submit',
  }
];
```

### Example 2: Feature Onboarding

```javascript
const featureSteps = [
  {
    id: 'open-menu',
    targetSelector: '.menu-button',
    instruction: 'Open the menu 📂',
    actionType: 'click',
  },
  {
    id: 'find-settings',
    targetSelector: '.settings-option',
    instruction: 'Click on Settings ⚙️',
    actionType: 'click',
  },
  {
    id: 'enable-feature',
    targetSelector: '.feature-toggle',
    instruction: 'Enable the new feature 🚀',
    actionType: 'click',
  }
];

const guide = useOnboardingGuide(featureSteps, userId);

// Auto-start when feature mounts
useEffect(() => {
  if (!guide.isCompleted) {
    guide.startGuide();
  }
}, []);
```

## Key Differences from Toast/Modal Tours

| Feature | Custom Guide | Standard Tours |
|---------|-------------|-----------------|
| Navigation | None - auto-advance | Next/Back buttons |
| Interaction | Guides interaction | Blocks interaction |
| Learning | Action-based | Passive reading |
| Flow | Game-like | Linear walkthrough |
| Responsiveness | Real-time | Step-by-step |

## Notes

- Guide persists per view (portal vs dashboard)
- Guide persists per user (localStorage key includes email)
- No retry - once completed, doesn't auto-show
- Can manually restart via help button
- Clean, React-idiomatic hooks API
- No external dependencies needed

# Driver.js Integration Guide

## Overview

The Class123 app now uses **Driver.js** (v1.4.0) for professional guided tours instead of custom arrow guides. Driver.js provides:

- ✅ **Overlay highlighting** - Dims everything except the target element
- ✅ **Smart tooltips** - Contextual help with auto-positioning
- ✅ **Smooth animations** - Professional slide/fade transitions
- ✅ **Progress tracking** - Shows current step / total steps
- ✅ **Persistent completion** - Remembers which tours users have seen
- ✅ **Closeable tours** - Users can dismiss and continue with work

## Files Changed/Created

### New Files
1. **`src/utils/driverTour.js`** - Tour configuration and helper functions
   - `portalTour` - 4-step tour for TeacherPortal view
   - `dashboardTour` - 11-step tour for ClassDashboard view
   - `startTour()` - Function to initialize and start a tour
   - `hasTourBeenCompleted()` - Check localStorage for tour completion
   - `markTourAsCompleted()` - Store tour completion status
   - `resetTours()` - Clear tour progress for a user

### Modified Files
1. **`src/App.jsx`**
   - Removed: `ArrowGuide` component import and usage
   - Removed: `showArrowGuide`, `currentGuideStep` state
   - Added: Import Driver.js tour utilities
   - Added: `portalTourRef`, `dashboardTourRef` refs to manage tour instances
   - Updated: `onLoginSuccess()` - Auto-starts portal tour for new users
   - Updated: `onLogout()` - Cleans up tour instances
   - Updated: `HelpIcon` click handler - Starts appropriate tour (portal/dashboard)
   - Updated: Portal/Dashboard sections - Removed ArrowGuide conditional rendering

2. **`src/components/HelpIcon.jsx`**
   - No changes required ✅
   - Already configured with floating button at bottom-right

## Tour Configuration Details

### Portal Tour (4 Steps)
Shown automatically when user logs in for the first time.

1. **Add Class Button** - "Click here to create your first class"
2. **Class Name Input** - "Type your class name"
3. **Create Button** - "Click to save your classroom"
4. **Select Class Message** - "Click on your class to enter the dashboard"

### Dashboard Tour (11 Steps)
Shown automatically when user clicks Help icon (?) in dashboard.

1. **Add Student Button** - Enroll first student
2. **Student Name Input** - Enter name
3. **Avatar Selection** - Choose cute animal avatar
4. **Save Button** - Add student to classroom
5. **Student Card** - Click to award points
6. **Behavior Cards** - Green (positive) vs Red (negative)
7. **Attendance Icon** - Mark absent/present
8. **Lucky Draw Icon** - Random student selector
9. **Egg Road Icon** - Reward progress tracker
10. **Settings Icon** - Customize behavior cards
11. **Completion Screen** - Celebration message

## localStorage Keys

Tours track completion per user per view:

```javascript
class123_tour_portal_<email>      // Portal tour completed
class123_tour_dashboard_<email>   // Dashboard tour completed
```

## Usage

### Auto-Start on Login
```javascript
// In onLoginSuccess handler
if (!hasTourBeenCompleted(u.email, 'portal')) {
  portalTourRef.current = startTour(portalTour, () => {
    markTourAsCompleted(u.email, 'portal');
  });
}
```

### Start on Help Icon Click
```javascript
// In HelpIcon onClick handler
if (dashboardTourRef.current) {
  dashboardTourRef.current.destroy();
}
dashboardTourRef.current = startTour(dashboardTour, () => {
  markTourAsCompleted(user.email, 'dashboard');
});
```

### Cleanup on Logout
```javascript
if (portalTourRef.current) {
  portalTourRef.current.destroy();
}
if (dashboardTourRef.current) {
  dashboardTourRef.current.destroy();
}
```

## Styling

Driver.js uses its default professional theme:
- **Overlay**: Semi-transparent dark background (rgba(0, 0, 0, 0.7))
- **Popover**: White card with shadow and arrow
- **Buttons**: "Next →", "← Back", "🎉 Done"
- **Progress**: Shows "Step 2/4" style counter

## Browser Compatibility

Driver.js supports:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Custom Styling (Optional)

To customize Driver.js styling, modify `src/utils/driverTour.js`:

```javascript
export const portalTour = {
  config: {
    overlayColor: 'rgba(0, 0, 0, 0.7)',  // Overlay darkness
    nextBtnText: 'Next →',                // Button text
    doneBtnText: '🎉 Done',               // Final button
    showProgress: true,                   // Show step counter
    allowClose: true,                     // Show X button
  },
  steps: [
    // Step definitions...
  ],
};
```

## Testing the Tours

### Test Portal Tour
1. Log out
2. Log in with new account or existing account without tour completion
3. Portal tour should auto-start showing 4 steps
4. Click "🎉 Done" to complete

### Test Dashboard Tour
1. Select a class to enter dashboard
2. Click the green `?` button (bottom-right)
3. Dashboard tour should start showing 11 steps
4. Click "🎉 Done" to complete
5. Clicking `?` again on same view will restart the tour

### Reset Tours
To reset tour progress for testing, add this to browser console:
```javascript
localStorage.removeItem('class123_tour_portal_<email>');
localStorage.removeItem('class123_tour_dashboard_<email>');
```

## Notes

- Tours are **optional** - users can close them anytime
- Tours **don't block** interaction with the app
- Tours **persist** - completed tours won't auto-show again
- Tours are **context-aware** - different tours for portal vs dashboard
- Tours use **real DOM selectors** - they work with actual page elements

## Migration from ArrowGuide

The old `ArrowGuide` component (`src/components/ArrowGuide.jsx`) is no longer used but still exists in the codebase. It can be safely deleted if desired, but leaving it won't harm the app.

**Files that can be deleted (optional cleanup):**
- `src/components/ArrowGuide.jsx` - Custom arrow guide (superseded)
- `src/utils/guideSteps.js` - Old guide configuration (superseded)

## Troubleshooting

### Tour doesn't start on login
Check:
- Browser console for errors
- `localStorage` for completion keys
- User email is being passed correctly to `hasTourBeenCompleted()`

### Tour elements not highlighting
Check:
- CSS selectors in `driverTour.js` match actual DOM
- Target elements are visible on page
- No CSS `z-index` conflicts hiding the overlay

### Tour steps skip or go backward
Driver.js handles this automatically - no manual intervention needed.

## Dependencies

- **driver.js** @1.4.0 - Tour library (already installed)
- **React** 19.2.0 - App framework
- **Vite** 7.3.0 - Build tool

All dependencies are listed in `package.json`.

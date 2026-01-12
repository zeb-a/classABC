import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom onboarding guide hook
 * Manages guided tutorial flow that advances based on user actions
 */
export function useOnboardingGuide(steps, userId) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const actionListenersRef = useRef({});
  const elementObserversRef = useRef({});

  // Check if guide has been completed
  useEffect(() => {
    if (!userId) return;
    const completed = localStorage.getItem(`class123_guide_completed_${userId}`);
    setIsCompleted(!!completed);
  }, [userId]);

  // Start the guide
  const startGuide = useCallback(() => {
    if (isCompleted) return;
    setIsActive(true);
    setCurrentStepIndex(0);
  }, [isCompleted]);

  // Complete the guide
  const completeGuide = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setIsCompleted(true);
    if (userId) {
      localStorage.setItem(`class123_guide_completed_${userId}`, 'true');
    }
  }, [userId]);

  // Complete a specific step and advance
  const completeStep = useCallback(() => {
    if (!isActive || currentStepIndex >= steps.length) return;

    const nextIndex = currentStepIndex + 1;
    
    // Clean up current step listeners
    cleanupStepListeners(currentStepIndex);

    if (nextIndex >= steps.length) {
      // Guide is complete
      completeGuide();
    } else {
      // Move to next step
      setCurrentStepIndex(nextIndex);
      setupStepListeners(nextIndex);
    }
  }, [isActive, currentStepIndex, steps, completeGuide]);

  // Setup action listeners for a step
  const setupStepListeners = useCallback((stepIndex) => {
    if (stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    const targetElement = document.querySelector(step.targetSelector);
    
    if (!targetElement) {
      console.warn(`[Guide] Target element not found: ${step.targetSelector}`);
      return;
    }

    const handleAction = () => {
      // Validate if validation function is provided
      if (step.validation && !step.validation()) {
        return;
      }
      completeStep();
    };

    // Attach listeners based on action type
    switch (step.actionType) {
      case 'click':
        targetElement.addEventListener('click', handleAction);
        actionListenersRef.current[stepIndex] = { element: targetElement, handler: handleAction, type: 'click' };
        break;

      case 'input':
        const handleInput = () => {
          if (targetElement.value.trim().length > 0) {
            handleAction();
          }
        };
        targetElement.addEventListener('input', handleInput);
        actionListenersRef.current[stepIndex] = { element: targetElement, handler: handleInput, type: 'input' };
        break;

      case 'submit':
        targetElement.addEventListener('submit', handleAction);
        actionListenersRef.current[stepIndex] = { element: targetElement, handler: handleAction, type: 'submit' };
        break;

      case 'api':
        // API actions are handled externally via completeStep() call
        break;

      default:
        console.warn(`[Guide] Unknown action type: ${step.actionType}`);
    }
  }, [steps, completeStep]);

  // Cleanup listeners for a step
  const cleanupStepListeners = useCallback((stepIndex) => {
    const listener = actionListenersRef.current[stepIndex];
    if (listener) {
      listener.element.removeEventListener(listener.type, listener.handler);
      delete actionListenersRef.current[stepIndex];
    }
  }, []);

  // Setup listeners when step changes
  useEffect(() => {
    if (!isActive || currentStepIndex >= steps.length) return;
    
    const timeoutId = setTimeout(() => {
      setupStepListeners(currentStepIndex);
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
      cleanupStepListeners(currentStepIndex);
    };
  }, [isActive, currentStepIndex, steps, setupStepListeners, cleanupStepListeners]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(actionListenersRef.current).forEach((stepIndex) => {
        cleanupStepListeners(parseInt(stepIndex));
      });
    };
  }, [cleanupStepListeners]);

  const currentStep = isActive && currentStepIndex < steps.length ? steps[currentStepIndex] : null;

  return {
    isActive,
    isCompleted,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    startGuide,
    completeGuide,
    completeStep,
  };
}

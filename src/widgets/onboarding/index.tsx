import { WelcomeModal } from './welcome-modal';
import { ProductTour } from './product-tour';

export { WelcomeModal } from './welcome-modal';
export { ProductTour } from './product-tour';
export { DemoDataRibbon } from './demo-ribbon';
export { QuickStartChecklist } from './quick-start-checklist';
export { useOnboarding } from './use-onboarding';

/** App-level onboarding overlays (welcome modal + coach-mark tour). */
export function OnboardingHost() {
  return (
    <>
      <WelcomeModal />
      <ProductTour />
    </>
  );
}

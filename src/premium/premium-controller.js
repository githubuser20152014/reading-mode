import { authService } from '../auth/auth-service';
import { authModal } from '../components/auth/AuthModal';

class PremiumController {
  constructor() {
    this.premiumFeatures = {
      highlighting: false,
      articleLibrary: false,
      aiSummary: false
    };
    
    // Initialize premium status
    this.initializePremiumStatus();
    
    // Listen for auth changes
    authService.addAuthListener(() => this.updatePremiumStatus());
  }

  async initializePremiumStatus() {
    if (authService.isAuthenticated()) {
      await this.updatePremiumStatus();
    }
  }

  async updatePremiumStatus() {
    const hasPremium = await authService.hasPremiumAccess();
    
    // Update feature flags based on premium status
    this.premiumFeatures = {
      highlighting: hasPremium,
      articleLibrary: hasPremium,
      aiSummary: hasPremium
    };
    
    // Dispatch event for UI components to update
    document.dispatchEvent(new CustomEvent('premium:statusChanged', {
      detail: { hasPremium, features: this.premiumFeatures }
    }));
  }

  // Check if a specific feature is available
  canUseFeature(featureName) {
    return this.premiumFeatures[featureName] || false;
  }

  // Handle premium feature access attempt
  async handlePremiumFeatureAttempt(featureName) {
    // If user is not authenticated, show auth modal
    if (!authService.isAuthenticated()) {
      authModal.show();
      return false;
    }
    
    // If user is authenticated but doesn't have premium
    if (!this.canUseFeature(featureName)) {
      // Show upgrade modal/prompt
      this.showUpgradePrompt();
      return false;
    }
    
    // User has access to the feature
    return true;
  }

  // Show upgrade prompt
  showUpgradePrompt() {
    // This would be replaced with your actual upgrade UI
    alert('This is a premium feature. Please upgrade to access it.');
  }
}

// Export singleton instance
export const premiumController = new PremiumController();
class PremiumService {
  constructor() {
    this.features = {
      summarization: {
        enabled: false,
        dailyQuota: 0
      },
      highlighting: {
        enabled: false
      }
    };
  }

  async init() {
    await this.loadPremiumStatus();
  }

  async loadPremiumStatus() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['premiumStatus', 'features'], (result) => {
        if (result.premiumStatus) {
          this.features = result.features || this.features;
        }
        resolve();
      });
    });
  }

  async checkFeatureAccess(featureName) {
    const feature = this.features[featureName];
    if (!feature) return false;

    if (feature.dailyQuota !== undefined) {
      return feature.enabled || feature.dailyQuota > 0;
    }

    return feature.enabled;
  }

  async deductQuota(featureName) {
    const feature = this.features[featureName];
    if (!feature || feature.dailyQuota === undefined) return;

    feature.dailyQuota--;
    await this.saveFeatureState();
  }

  async saveFeatureState() {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ features: this.features }, resolve);
    });
  }

  showUpgradePrompt(feature) {
    chrome.runtime.sendMessage({
      action: 'showUpgradePrompt',
      feature: feature
    });
  }
} 
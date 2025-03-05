class PremiumService {
  constructor() {
    this.aiService = new AIService();
    this.features = {
      summarization: {
        enabled: false,
        dailyQuota: 3,    // Free tier
        maxLength: 300    // Free tier token limit
      },
      highlighting: false,
      offlineStorage: false
    };
    this.init();
  }

  async init() {
    // Check premium status from storage/server
    const status = await chrome.storage.sync.get('premiumStatus');
    if (status.premiumStatus) {
      await this.activateFeatures(status.premiumStatus.features);
    }
  }

  async activateFeatures(features) {
    // Enable premium features
    this.features = { ...this.features, ...features };
    await chrome.storage.sync.set({ premiumFeatures: this.features });
  }

  isPremiumFeature(feature) {
    return this.features[feature] || false;
  }

  async upgradeToPremium() {
    this.features.summarization = {
      enabled: true,
      dailyQuota: 50,     // Premium tier
      maxLength: 1000,    // Premium tier token limit
      model: 'gpt-4'      // Better model for premium
    };
  }
} 
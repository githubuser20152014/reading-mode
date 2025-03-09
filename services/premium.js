class PremiumService {
  constructor() {
    this.features = {
      summarization: {
        enabled: false,
        dailyQuota: 0
      }
    };
    this.aiService = new AIService();
  }

  async init() {
    try {
      // Initialize AI service
      await this.aiService.init();
      
      // Check if API key exists
      const result = await chrome.storage.sync.get('openai_api_key');
      if (result.openai_api_key) {
        this.features.summarization.enabled = true;
        this.features.summarization.dailyQuota = 3; // Default daily quota
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize premium service:', error);
      return false;
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
import { getSupabaseClient } from './supabase';

class AuthService {
  constructor() {
    this.supabase = getSupabaseClient();
    this.currentUser = null;
    this.authListeners = [];
    
    // Initialize - check if user is already logged in
    this.initialize();
  }

  async initialize() {
    try {
      // Get session from storage
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session) {
        this.currentUser = session.user;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  // Register a new user
  async signUp(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      this.currentUser = data.user;
      this.notifyListeners();
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      this.currentUser = data.user;
      this.notifyListeners();
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user has premium access
  async hasPremiumAccess() {
    if (!this.currentUser) return false;
    
    try {
      // Query the profiles table to check subscription status
      const { data, error } = await this.supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', this.currentUser.id)
        .single();
      
      if (error) throw error;
      
      return data.subscription_tier === 'premium';
    } catch (error) {
      console.error('Premium check error:', error);
      return false;
    }
  }

  // Add auth state change listener
  addAuthListener(listener) {
    this.authListeners.push(listener);
    // Immediately notify with current state
    listener(this.currentUser);
  }

  // Remove auth state change listener
  removeAuthListener(listener) {
    this.authListeners = this.authListeners.filter(l => l !== listener);
  }

  // Notify all listeners of auth state change
  notifyListeners() {
    this.authListeners.forEach(listener => listener(this.currentUser));
  }
}

// Export singleton instance
export const authService = new AuthService();
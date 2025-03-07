// Basic Auth Modal Component
class AuthModal {
    constructor() {
      this.modalElement = null;
      this.isVisible = false;
      this.mode = 'login'; // 'login' or 'signup'
    }
  
    // Create modal DOM element
    createModal() {
      const modal = document.createElement('div');
      modal.className = 'auth-modal';
      modal.style.display = 'none';
      
      modal.innerHTML = `
        <div class="auth-modal-content">
          <div class="auth-modal-header">
            <h2 id="auth-modal-title">Sign In</h2>
            <button class="auth-modal-close">&times;</button>
          </div>
          <div class="auth-modal-body">
            <div class="auth-form">
              <div class="form-group">
                <label for="auth-email">Email</label>
                <input type="email" id="auth-email" placeholder="your@email.com">
              </div>
              <div class="form-group">
                <label for="auth-password">Password</label>
                <input type="password" id="auth-password" placeholder="Your password">
              </div>
              <div class="auth-error" style="display: none; color: red;"></div>
              <button id="auth-submit-btn" class="auth-submit">Sign In</button>
            </div>
            <div class="auth-switch">
              <span id="auth-switch-text">Don't have an account?</span>
              <a href="#" id="auth-switch-btn">Sign Up</a>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      this.modalElement = modal;
      this.attachEventListeners();
    }
  
    // Show the modal
    show() {
      if (!this.modalElement) {
        this.createModal();
      }
      
      this.modalElement.style.display = 'flex';
      this.isVisible = true;
    }
  
    // Hide the modal
    hide() {
      if (this.modalElement) {
        this.modalElement.style.display = 'none';
        this.isVisible = false;
      }
    }
  
    // Switch between login and signup modes
    switchMode() {
      this.mode = this.mode === 'login' ? 'signup' : 'login';
      
      const title = document.getElementById('auth-modal-title');
      const submitBtn = document.getElementById('auth-submit-btn');
      const switchText = document.getElementById('auth-switch-text');
      const switchBtn = document.getElementById('auth-switch-btn');
      
      if (this.mode === 'login') {
        title.textContent = 'Sign In';
        submitBtn.textContent = 'Sign In';
        switchText.textContent = "Don't have an account?";
        switchBtn.textContent = 'Sign Up';
      } else {
        title.textContent = 'Sign Up';
        submitBtn.textContent = 'Sign Up';
        switchText.textContent = 'Already have an account?';
        switchBtn.textContent = 'Sign In';
      }
    }
  
    // Attach event listeners to modal elements
    attachEventListeners() {
      // Close button
      const closeBtn = this.modalElement.querySelector('.auth-modal-close');
      closeBtn.addEventListener('click', () => this.hide());
      
      // Switch mode button
      const switchBtn = document.getElementById('auth-switch-btn');
      switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchMode();
      });
      
      // Submit button
      const submitBtn = document.getElementById('auth-submit-btn');
      submitBtn.addEventListener('click', () => this.handleSubmit());
      
      // Close when clicking outside the modal
      this.modalElement.addEventListener('click', (e) => {
        if (e.target === this.modalElement) {
          this.hide();
        }
      });
    }
  
    // Handle form submission
    async handleSubmit() {
      const emailInput = document.getElementById('auth-email');
      const passwordInput = document.getElementById('auth-password');
      const errorElement = document.querySelector('.auth-error');
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Basic validation
      if (!email || !password) {
        errorElement.textContent = 'Please enter both email and password';
        errorElement.style.display = 'block';
        return;
      }
      
      try {
        errorElement.style.display = 'none';
        
        // Import auth service dynamically to avoid circular dependencies
        const { authService } = await import('../../auth/auth-service');
        
        if (this.mode === 'login') {
          await authService.signIn(email, password);
        } else {
          await authService.signUp(email, password);
        }
        
        // Success - hide modal
        this.hide();
        
        // Notify that authentication was successful
        const event = new CustomEvent('auth:success', {
          detail: { mode: this.mode }
        });
        document.dispatchEvent(event);
        
      } catch (error) {
        errorElement.textContent = error.message || 'Authentication failed';
        errorElement.style.display = 'block';
      }
    }
  }
  
  // Export singleton instance
  export const authModal = new AuthModal();
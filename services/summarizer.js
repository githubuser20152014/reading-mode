class Summarizer {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';  // We'll make this configurable later
        this.initializeSummarizeButton();
        this.summaryVisible = false;
    }

    // Initialize the summarize button
    initializeSummarizeButton() {
        // Listen for reader mode activation
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    const readerContent = document.querySelector('.reader-content');
                    if (readerContent && !document.querySelector('.summarize-button')) {
                        this.createSummarizeButton();
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Create and inject the summarize button
    createSummarizeButton() {
        const button = document.createElement('button');
        button.className = 'summarize-button';
        button.textContent = 'Summarize';
        button.setAttribute('aria-label', 'Summarize article');
        button.addEventListener('click', () => this.toggleSummary());
        
        // Insert button at the top of reader content
        const readerContent = document.querySelector('.reader-content');
        if (readerContent) {
            readerContent.insertBefore(button, readerContent.firstChild);
        }
    }

    // Toggle summary visibility
    async toggleSummary() {
        const button = document.querySelector('.summarize-button');
        const existingSummary = document.querySelector('.reader-summary');

        if (!this.summaryVisible) {
            // Show summary
            if (existingSummary) {
                existingSummary.style.display = 'block';
            } else {
                await this.summarize();
            }
            button.textContent = 'Hide summary';
            this.summaryVisible = true;
        } else {
            // Hide summary
            if (existingSummary) {
                existingSummary.style.display = 'none';
            }
            button.textContent = 'Summarize';
            this.summaryVisible = false;
        }
    }

    // Get the main content text from the page
    getPageContent() {
        // First try to get content from reader mode container
        const readerContent = document.querySelector('.reader-content');
        if (readerContent) {
            // Remove the summary section if it exists to avoid summarizing the summary
            const existingSummary = readerContent.querySelector('.reader-summary');
            if (existingSummary) {
                existingSummary.remove();
            }
            
            // Get text content excluding scripts, styles, and other non-content elements
            return Array.from(readerContent.children)
                .filter(el => {
                    // Exclude non-content elements
                    const tag = el.tagName.toLowerCase();
                    return !['script', 'style', 'button'].includes(tag) &&
                           !el.classList.contains('reader-summary') &&
                           !el.classList.contains('summarize-button');
                })
                .map(el => el.textContent.trim())
                .filter(text => text.length > 0)
                .join('\n');
        }

        // Fallback to article or main content if reader mode isn't active
        const mainContent = document.querySelector('article') || 
                          document.querySelector('main') || 
                          document.querySelector('.article-content');
        
        if (mainContent) {
            return mainContent.textContent.trim();
        }

        return '';
    }

    // Create a summary of the text
    async summarize() {
        try {
            // First, check if we're in reader mode
            const readerContent = document.querySelector('.reader-content');
            if (!readerContent) {
                throw new Error('Please activate reader mode first');
            }

            // Get the content
            const content = this.getPageContent();
            if (!content) {
                throw new Error('No content found to summarize');
            }

            // Create and display summary
            const summary = this.createBasicSummary(content);
            this.displaySummary(summary);
            this.summaryVisible = true;
        } catch (error) {
            console.error('Summarization failed:', error);
            this.displayError(error.message);
        }
    }

    // Create a basic summary by extracting key sentences
    createBasicSummary(text) {
        // Split into sentences (improved implementation)
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        
        // Filter out short sentences and those that look like metadata
        const validSentences = sentences.filter(sentence => {
            const cleaned = sentence.trim();
            return cleaned.length > 30 && // Avoid very short sentences
                   !cleaned.match(/^(copyright|all rights reserved|published|updated)/i); // Avoid metadata
        });
        
        // Get first 3 meaningful sentences
        return validSentences.slice(0, 3).join(' ');
    }

    // Display the summary in the UI
    displaySummary(summary) {
        // Remove any existing summary
        const existingSummary = document.querySelector('.reader-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        // Create summary container
        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'reader-summary';
        
        // Add summary content
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Summary';
        
        const summaryText = document.createElement('p');
        summaryText.textContent = summary;

        summaryContainer.appendChild(summaryTitle);
        summaryContainer.appendChild(summaryText);

        // Insert at the top of the reader content
        const readerContent = document.querySelector('.reader-content');
        readerContent.insertBefore(summaryContainer, readerContent.firstChild);
    }

    // Display error message
    displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'reader-summary-error';
        errorDiv.textContent = message;
        
        const readerContent = document.querySelector('.reader-content');
        if (readerContent) {
            readerContent.insertBefore(errorDiv, readerContent.firstChild);
            setTimeout(() => errorDiv.remove(), 3000); // Remove after 3 seconds
        }
    }
}

// Initialize the summarizer
const summarizer = new Summarizer();

// Export for use in other modules
window.summarizer = summarizer; 
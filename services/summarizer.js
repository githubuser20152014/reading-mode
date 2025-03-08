class Summarizer {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.initializeSummarizeButton();
        this.summaryVisible = false;
        this.loadApiKey();
    }

    // Load API key from storage
    async loadApiKey() {
        try {
            const result = await chrome.storage.sync.get('openai_api_key');
            this.apiKey = result.openai_api_key;
        } catch (error) {
            console.error('Failed to load API key:', error);
        }
    }

    // Initialize the summarize button
    initializeSummarizeButton() {
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

    // Create a summary using OpenAI
    async createAISummary(text) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not found. Please add it in the extension settings.');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a highly skilled summarizer. Create a clear summary with exactly 3 bullet points that capture the main points. Each bullet point should be concise and start with a bullet point character "•".'
                        },
                        {
                            role: 'user',
                            content: `Please summarize the following text in exactly 3 bullet points:\n\n${text}`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to generate summary');
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('AI Summary failed:', error);
            throw new Error('Failed to generate AI summary. Falling back to basic summary.');
        }
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

            // Try AI summary first, fallback to basic if it fails
            let summary;
            try {
                summary = await this.createAISummary(content);
            } catch (error) {
                console.warn('Falling back to basic summary:', error);
                summary = this.createBasicSummary(content);
            }
            
            // Display the summary
            this.displaySummary(summary);
            this.summaryVisible = true;
        } catch (error) {
            console.error('Summarization failed:', error);
            this.displayError(error.message);
        }
    }

    // Get the main content text from the page
    getPageContent() {
        const readerContent = document.querySelector('.reader-content');
        if (readerContent) {
            const existingSummary = readerContent.querySelector('.reader-summary');
            if (existingSummary) {
                existingSummary.remove();
            }
            
            return Array.from(readerContent.children)
                .filter(el => {
                    const tag = el.tagName.toLowerCase();
                    return !['script', 'style', 'button'].includes(tag) &&
                           !el.classList.contains('reader-summary') &&
                           !el.classList.contains('summarize-button');
                })
                .map(el => el.textContent.trim())
                .filter(text => text.length > 0)
                .join('\n');
        }

        const mainContent = document.querySelector('article') || 
                          document.querySelector('main') || 
                          document.querySelector('.article-content');
        
        return mainContent ? mainContent.textContent.trim() : '';
    }

    // Create a basic summary by extracting key sentences
    createBasicSummary(text) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const validSentences = sentences.filter(sentence => {
            const cleaned = sentence.trim();
            return cleaned.length > 30 && 
                   !cleaned.match(/^(copyright|all rights reserved|published|updated)/i);
        });
        return validSentences.slice(0, 3).join(' ');
    }

    // Format bullet points with proper spacing
    formatBulletPoints(summary) {
        const lines = summary.split('\n');
        return lines
            .filter(line => line.trim().startsWith('•'))
            .map(line => `<span class="bullet-point">${line.trim()}</span>`)
            .join('');
    }

    // Display the summary in the UI
    displaySummary(summary) {
        const existingSummary = document.querySelector('.reader-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        const summaryContainer = document.createElement('div');
        summaryContainer.className = 'reader-summary';
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Summary';
        
        if (this.apiKey) {
            const aiBadge = document.createElement('span');
            aiBadge.className = 'ai-badge';
            aiBadge.textContent = 'AI';
            summaryTitle.appendChild(aiBadge);
        }

        const summaryText = document.createElement('div');
        summaryText.className = 'summary-text';
        summaryText.innerHTML = this.formatBulletPoints(summary);

        summaryContainer.appendChild(summaryTitle);
        summaryContainer.appendChild(summaryText);

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
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
}

// Initialize and export
const summarizer = new Summarizer();
window.summarizer = summarizer; 
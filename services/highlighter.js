class Highlighter {
    constructor(container) {
        if (!container) {
            console.error('Highlighter requires a container element');
            return;
        }
        
        this.container = container;
        this.colors = {
            yellow: '#fef3c7',
            green: '#dcfce7',
            blue: '#dbeafe',
            purple: '#f3e8ff',
            red: '#fee2e2'
        };
        this.currentColor = 'yellow';
        this.menu = null;
        
        // Initialize after construction
        this.init();
    }

    async init() {
        try {
            await this.createHighlightMenu();
            this.initializeHighlighter();
            await this.loadHighlights();
        } catch (error) {
            console.error('Failed to initialize highlighter:', error);
        }
    }

    initializeHighlighter() {
        // Listen for text selection only within reader content
        this.container.addEventListener('mouseup', (e) => {
            if (e.target.closest('.reader-content')) {
                this.handleTextSelection(e);
            }
        });
        
        // Listen for clicks outside menu to close it
        document.addEventListener('mousedown', (e) => {
            if (this.menu && !e.target.closest('.highlight-menu')) {
                this.hideHighlightMenu();
            }
        });
    }

    createHighlightMenu() {
        const menu = document.createElement('div');
        menu.className = 'highlight-menu';
        menu.style.display = 'none';
        
        // Add color options
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        
        Object.entries(this.colors).forEach(([name, color]) => {
            const colorBtn = document.createElement('button');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = color;
            colorBtn.setAttribute('data-color', name);
            colorBtn.addEventListener('click', () => this.highlightSelection(name));
            colorPicker.appendChild(colorBtn);
        });

        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-highlight';
        deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.addEventListener('click', () => this.removeHighlight());

        menu.appendChild(colorPicker);
        menu.appendChild(deleteBtn);
        document.body.appendChild(menu);
        this.menu = menu;
    }

    handleTextSelection(e) {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text.length > 0) {
            // Get the selection coordinates
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Position menu above the selection
            const menuLeft = Math.max(
                0, 
                rect.left + (rect.width / 2) - (this.menu.offsetWidth / 2)
            );
            const menuTop = Math.max(
                0, 
                rect.top - this.menu.offsetHeight - 10 + window.scrollY
            );
            
            this.menu.style.display = 'flex';
            this.menu.style.position = 'absolute';
            this.menu.style.left = `${menuLeft}px`;
            this.menu.style.top = `${menuTop}px`;
            
            // Ensure menu is visible in viewport
            const menuRect = this.menu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) {
                this.menu.style.left = `${window.innerWidth - this.menu.offsetWidth - 10}px`;
            }
            if (menuRect.top < 0) {
                this.menu.style.top = `${rect.bottom + 10 + window.scrollY}px`;
            }
        } else {
            this.hideHighlightMenu();
        }
    }

    hideHighlightMenu() {
        if (this.menu) {
            this.menu.style.display = 'none';
        }
    }

    highlightSelection(color) {
        const selection = window.getSelection();
        if (!selection.toString().trim()) return;

        const range = selection.getRangeAt(0);
        const highlight = document.createElement('mark');
        highlight.className = `highlight ${color}`;
        highlight.dataset.color = color;
        
        try {
            range.surroundContents(highlight);
            this.saveHighlight({
                color,
                text: highlight.textContent,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error('Failed to highlight selection:', e);
        }

        selection.removeAllRanges();
        this.hideHighlightMenu();
    }

    removeHighlight() {
        const selection = window.getSelection();
        const highlight = selection.anchorNode.parentElement;
        
        if (highlight.classList.contains('highlight')) {
            const text = highlight.textContent;
            highlight.outerHTML = text;
            this.deleteHighlight(text);
        }
        
        this.hideHighlightMenu();
    }

    async saveHighlight(highlight) {
        try {
            const { highlights = [] } = await chrome.storage.sync.get('highlights');
            highlights.push(highlight);
            await chrome.storage.sync.set({ highlights });
        } catch (error) {
            console.error('Failed to save highlight:', error);
        }
    }

    async deleteHighlight(text) {
        try {
            const { highlights = [] } = await chrome.storage.sync.get('highlights');
            const updatedHighlights = highlights.filter(h => h.text !== text);
            await chrome.storage.sync.set({ highlights: updatedHighlights });
        } catch (error) {
            console.error('Failed to delete highlight:', error);
        }
    }

    async loadHighlights() {
        try {
            const { highlights = [] } = await chrome.storage.sync.get('highlights');
            // TODO: Implement highlight restoration for saved articles
        } catch (error) {
            console.error('Failed to load highlights:', error);
        }
    }
}

// Initialize highlighter
const highlighter = new Highlighter();
window.highlighter = highlighter; 
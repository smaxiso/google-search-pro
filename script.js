// Enhanced toast notification system
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set icon based on type
    const icons = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        error: 'error'
    };
    
    toastIcon.textContent = icons[type] || icons.info;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Generate and display query preview
function generateQueryPreview() {
    const query = document.getElementById('query').value.trim();
    const category = document.getElementById('category').value;
    const filetype = document.getElementById('filetype').value;
    const site = document.getElementById('site').value.trim();
    const sort = document.getElementById('sort').value;
    const size = document.getElementById('size').value;
    
    let dorkQuery = buildDorkQuery(query, category, filetype, site, sort, size);
    
    const queryDisplay = document.getElementById('query-display');
    queryDisplay.textContent = dorkQuery || 'Enter search parameters to see the generated query';
    
    return dorkQuery;
}

// Improved dorking query builder
function buildDorkQuery(query, category, filetype, site, sort, size) {
    let dorkQuery = '';
    let parts = [];
    
    // Base query construction based on category and inputs
    if (category && filetype) {
        // When both category and filetype are selected
        if (query) {
            parts.push(`intitle:index.of "${query}" filetype:${filetype}`);
        } else {
            parts.push(`intitle:index.of filetype:${filetype}`);
        }
    } else if (category && !filetype) {
        // When only category is selected
        if (query) {
            parts.push(`intitle:index.of "${query}"`);
        } else {
            parts.push(`intitle:index.of`);
        }
    } else if (!category && filetype) {
        // When only filetype is selected
        if (query) {
            parts.push(`intitle:index.of "${query}" filetype:${filetype}`);
        } else {
            parts.push(`intitle:index.of filetype:${filetype}`);
        }
    } else if (query) {
        // When only query is provided
        parts.push(`intitle:index.of "${query}"`);
    } else {
        // Fallback
        parts.push('intitle:index.of');
    }
    
    // Add site filter
    if (site) {
        parts.push(`site:${site}`);
    }
    
    // Add file size filters
    if (size) {
        switch (size) {
            case 'small':
                parts.push('intitle:index.of -"parent directory" -"size" -"last modified" -"description" (mp3|mp4|pdf|zip|rar) <10MB');
                break;
            case 'medium':
                parts.push('intitle:index.of -"parent directory" size:10MB..100MB');
                break;
            case 'large':
                parts.push('intitle:index.of -"parent directory" size:>100MB');
                break;
        }
    }
    
    // Add sorting
    if (sort === 'date') {
        parts.push('"last modified"');
    }
    
    // Combine all parts
    dorkQuery = parts.join(' ');
    
    // Add category-specific enhancements
    if (category) {
        switch (category) {
            case 'video':
                dorkQuery += ' -"parent directory" -"cgi-bin" -"apache" -"server"';
                break;
            case 'music':
                dorkQuery += ' -"parent directory" -"cgi-bin" -"apache"';
                break;
            case 'book':
                dorkQuery += ' -"parent directory" -"cgi-bin"';
                break;
            case 'software':
                dorkQuery += ' -"parent directory" -"cgi-bin" -"apache" (exe|msi|dmg|deb|rpm)';
                break;
            case 'image':
                dorkQuery += ' -"parent directory" -"cgi-bin" (jpg|jpeg|png|gif|bmp|webp)';
                break;
        }
    }
    
    return dorkQuery;
}

// Form validation
function validateForm() {
    const query = document.getElementById('query').value.trim();
    const category = document.getElementById('category').value;
    const filetype = document.getElementById('filetype').value;
    const site = document.getElementById('site').value.trim();
    
    if (!query && !category && !filetype && !site) {
        showToast('Please enter at least one search parameter', 'warning');
        return false;
    }
    
    // Validate site format
    if (site && !isValidSite(site)) {
        showToast('Please enter a valid site format (e.g., example.com)', 'warning');
        return false;
    }
    
    return true;
}

// Site validation helper
function isValidSite(site) {
    const siteRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return siteRegex.test(site);
}

// Copy query to clipboard
function copyQuery() {
    const queryText = document.getElementById('query-display').textContent;
    
    if (queryText && queryText !== 'Enter search parameters to see the generated query') {
        navigator.clipboard.writeText(queryText).then(() => {
            showToast('Query copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = queryText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Query copied to clipboard!', 'success');
        });
    } else {
        showToast('No query to copy', 'warning');
    }
}

// Clear form
function clearForm() {
    document.getElementById('dorking-form').reset();
    document.getElementById('filetype').innerHTML = '<option value="">Any File Type</option>';
    generateQueryPreview();
    showToast('Form cleared', 'info');
}

// Handle form submission
document.getElementById('dorking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const dorkQuery = generateQueryPreview();
    
    if (dorkQuery) {
        // Encode the query and open in a new tab
        const encodedQuery = encodeURIComponent(dorkQuery);
        const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
        
        window.open(searchUrl, '_blank');
        showToast('Search opened in new tab', 'success');
    }
});

// Populate file type options based on selected category
document.getElementById('category').addEventListener('change', function () {
    const filetypeSelect = document.getElementById('filetype');
    filetypeSelect.innerHTML = '<option value="">Any File Type</option>';
    
    const selectedCategory = this.value;
    const fileTypes = {
        book: [
            { value: 'pdf', label: 'PDF' },
            { value: 'epub', label: 'EPUB' },
            { value: 'mobi', label: 'MOBI' },
            { value: 'djvu', label: 'DjVu' },
            { value: 'doc', label: 'DOC' },
            { value: 'docx', label: 'DOCX' },
            { value: 'txt', label: 'TXT' },
            { value: 'rtf', label: 'RTF' },
            { value: 'cbr', label: 'CBR' },
            { value: 'cbz', label: 'CBZ' }
        ],
        video: [
            { value: 'mp4', label: 'MP4' },
            { value: 'mkv', label: 'MKV' },
            { value: 'avi', label: 'AVI' },
            { value: 'mov', label: 'MOV' },
            { value: 'wmv', label: 'WMV' },
            { value: 'flv', label: 'FLV' },
            { value: 'webm', label: 'WebM' },
            { value: 'm4v', label: 'M4V' },
            { value: '3gp', label: '3GP' },
            { value: 'ts', label: 'TS' }
        ],
        music: [
            { value: 'mp3', label: 'MP3' },
            { value: 'flac', label: 'FLAC' },
            { value: 'wav', label: 'WAV' },
            { value: 'aac', label: 'AAC' },
            { value: 'ogg', label: 'OGG' },
            { value: 'wma', label: 'WMA' },
            { value: 'm4a', label: 'M4A' },
            { value: 'opus', label: 'Opus' },
            { value: 'ape', label: 'APE' },
            { value: 'alac', label: 'ALAC' }
        ],
        software: [
            { value: 'exe', label: 'EXE' },
            { value: 'msi', label: 'MSI' },
            { value: 'dmg', label: 'DMG' },
            { value: 'pkg', label: 'PKG' },
            { value: 'deb', label: 'DEB' },
            { value: 'rpm', label: 'RPM' },
            { value: 'apk', label: 'APK' },
            { value: 'zip', label: 'ZIP' },
            { value: 'rar', label: 'RAR' },
            { value: '7z', label: '7Z' }
        ],
        image: [
            { value: 'jpg', label: 'JPG' },
            { value: 'jpeg', label: 'JPEG' },
            { value: 'png', label: 'PNG' },
            { value: 'gif', label: 'GIF' },
            { value: 'bmp', label: 'BMP' },
            { value: 'webp', label: 'WebP' },
            { value: 'svg', label: 'SVG' },
            { value: 'tiff', label: 'TIFF' },
            { value: 'raw', label: 'RAW' },
            { value: 'ico', label: 'ICO' }
        ]
    };
    
    if (selectedCategory && fileTypes[selectedCategory]) {
        fileTypes[selectedCategory].forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            filetypeSelect.appendChild(option);
        });
    }
    
    generateQueryPreview();
});

// Add event listeners for real-time query preview
document.addEventListener('DOMContentLoaded', function() {
    const inputs = ['query', 'category', 'filetype', 'site', 'sort', 'size'];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', generateQueryPreview);
            element.addEventListener('change', generateQueryPreview);
        }
    });
    
    // Add copy button functionality
    document.getElementById('copy-query').addEventListener('click', copyQuery);
    
    // Add clear button functionality
    document.getElementById('clear-btn').addEventListener('click', clearForm);
    
    // Initialize query preview
    generateQueryPreview();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter to search
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('dorking-form').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl+R to clear form
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        clearForm();
    }
    
    // Ctrl+C to copy query (when not in input field)
    if (e.ctrlKey && e.key === 'c' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        copyQuery();
    }
});

// Add input animations
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="text"], select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

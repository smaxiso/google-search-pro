// Function to show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000); // Duration of the toast
}

// Handle form submission
document.getElementById('dorking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get input values
    const query = document.getElementById('query').value;
    const category = document.getElementById('category').value;
    const filetype = document.getElementById('filetype').value;
    const site = document.getElementById('site').value;
    const sort = document.getElementById('sort').value;

    // Check if all required fields are filled
    if (!query && !category && !filetype && !site && !sort) {
        showToast('Please fill at least one field before searching.');
        return;
    }

    // Base query
    let dorkQuery = "";

    if (category === 'video' || category === 'music') {
        dorkQuery += `intitle:index.of "${query ? query : filetype}"`;
    }
    else {
        dorkQuery += `intitle:index.of "${filetype ? filetype : query}" ${query}`;
    }

    // Add site filter if provided
    if (site) {
        dorkQuery += ` site:${site}`;
    }

    // Add sorting by date if selected
    if (sort === 'date') {
        dorkQuery += ` "last modified"`; // Adjust this as per your logic for sorting by date
    }

    // Encode the query and open in a new tab
    const encodedQuery = encodeURIComponent(dorkQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

    window.open(searchUrl, '_blank');
});

// Populate file type options based on selected category
document.getElementById('category').addEventListener('change', function () {
    const filetypeSelect = document.getElementById('filetype');
    filetypeSelect.innerHTML = '<option value="">Select a file type</option>'; // Clear previous options

    const selectedCategory = this.value;
    const fileTypes = {
        book: ['pdf', 'docx', 'epub', 'mobi', 'cbz', 'cbr'],
        video: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv'],
        music: ['mp3', 'wav', 'flac', 'aac', 'ogg']
    };

    if (selectedCategory && fileTypes[selectedCategory]) {
        fileTypes[selectedCategory].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filetypeSelect.appendChild(option);
        });
    }
});

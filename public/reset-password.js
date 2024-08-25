document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        document.getElementById('token').value = token;
    }
});

document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('new-password').value;
    const status = document.getElementById('status');

    try {
        const response = await fetch('/routes/reset-password', { // Ensure this path matches your server route
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });

        const result = await response.json();
        status.textContent = result.message;
    } catch (error) {
        status.textContent = 'An error occurred. Please try again.';
    }
});

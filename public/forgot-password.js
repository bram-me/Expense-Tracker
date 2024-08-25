document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const status = document.getElementById('status');

    try {
        const response = await fetch('/routes/forgot-password', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        status.textContent = result.message;
    } catch (error) {
        status.textContent = 'An error occurred. Please try again.';
    }
});
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const status = document.getElementById('status');

    try {
        const response = await fetch('/forgot-password', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        status.textContent = result.message;
        status.style.color = response.ok ? 'green' : 'red';
    } catch (error) {
        console.error('Error:', error); // Log error for debugging
        status.textContent = 'An error occurred. Please try again.';
        status.style.color = 'red';
    }
});

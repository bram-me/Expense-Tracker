document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const name = document.getElementById('username').value; // Change 'username' to 'name'
    const password = document.getElementById('password').value;
  
    try {
        // Correct the URL to match your Express route
        const response = await fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                name, // Change 'username' to 'name'
                password
            })
        });
  
        const result = await response.json();
        if (response.ok) {
            alert('Registration successful!');
            window.location.href = '/login.html'; // Redirect to login page on success
        } else {
            alert(`Registration failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration.');
    }
});


function validateEmail(email) {
    // More strict email validation for Gmail with .com domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    
    // Additional custom validation checks
    const checks = [
        {
            test: emailRegex.test(email),
            message: 'Valid Gmail address with .com domain'
        },
        {
            test: email.length > 0,
            message: 'Email is not empty'
        },
        {
            test: email.includes('@'),
            message: 'Contains @ symbol'
        },
        {
            test: email.split('@')[0].length >= 6 && email.split('@')[0].length <= 30,
            message: 'Username length between 6-30 characters'
        },
        {
            test: !/[&=_'\-+,<>]/.test(email.split('@')[0]),
            message: 'No invalid special characters in username'
        },
        {
            test: !email.split('@')[0].includes('..'),
            message: 'No consecutive periods'
        },
        {
            test: !['abuse', 'postmaster'].includes(email.split('@')[0].toLowerCase()),
            message: 'Username not a reserved alias'
        }
    ];

    return {
        isValid: checks.every(check => check.test),
        details: checks
    };
}

function validateEmailFirst() {
    const emailInput = document.getElementById('emailInput');
    const emailResultDiv = document.getElementById('emailResult');
    const passwordSection = document.getElementById('passwordSection');

    // Reset previous states
    emailResultDiv.innerHTML = '';
    passwordSection.style.display = 'none';

    const email = emailInput.value.trim();
    const validationResult = validateEmail(email);

    // Display detailed validation results
    let resultHTML = validationResult.details.map(check => 
        `<div class="${check.test ? 'valid' : 'invalid'}">
            ${check.test ? '✅' : '❌'} ${check.message}
         </div>`
    ).join('');

    emailResultDiv.innerHTML = resultHTML;

    // If email is valid, show password section
    if (validationResult.isValid) {
        passwordSection.style.display = 'block';
    } else {
        passwordSection.style.display = 'none';
    }
}

function generatePassword() {
    const email = document.getElementById('emailInput').value.trim();
    const generatedPasswordDiv = document.getElementById('generatedPassword');
    const strengthIndicator = document.getElementById('strengthIndicator');

    // Revalidate email before generating password
    const validationResult = validateEmail(email);
    if (!validationResult.isValid) {
        generatedPasswordDiv.innerHTML = 'Please validate email first';
        return;
    }

    // Password generation function based on email username
    function createStrongPassword() {
        const length = 12; // Password length
        const username = email.split('@')[0];
        
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

        // Use parts of the username for randomization
        const seed = username.length > 3 ? username.slice(0, 3) : username;
        
        // Ensure at least one character from each set
        let password = [
            uppercaseChars[seed.charCodeAt(0) % uppercaseChars.length],
            lowercaseChars[seed.charCodeAt(1) % lowercaseChars.length],
            numberChars[seed.charCodeAt(2) % numberChars.length],
            specialChars[seed.charCodeAt(0) % specialChars.length]
        ];

        // Fill the rest of the password
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
        while (password.length < length) {
            password.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }

        // Shuffle the password
        return password.sort(() => Math.random() - 0.5).join('');
    }

    // Calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 12) strength += 40;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 10;
        if (/[!@#$%^&*()_+\[\]{}|;:,.<>?]/.test(password)) strength += 10;

        return Math.min(strength, 100);
    }

    // Generate password
    const generatedPassword = createStrongPassword();
    const strengthScore = calculatePasswordStrength(generatedPassword);

    // Update strength indicator
    strengthIndicator.style.width = `${strengthScore}%`;
    strengthIndicator.style.backgroundColor = 
        strengthScore < 40 ? 'red' : 
        strengthScore < 70 ? 'orange' : 
        'green';

    // Display generated password with details
    generatedPasswordDiv.innerHTML = `
        <div>Generated Password: <strong id="passwordText">${generatedPassword}</strong></div>
        <div>Strength: ${
            strengthScore < 40 ? 'Weak' : 
            strengthScore < 70 ? 'Moderate' : 
            'Strong'
        } (${strengthScore}%)</div>
    `;
}

function copyPassword() {
    const passwordText = document.getElementById('passwordText');
    
    if (passwordText) {
        // Create a temporary textarea to copy the password
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = passwordText.textContent;
        document.body.appendChild(tempTextArea);
        
        // Select and copy the text
        tempTextArea.select();
        document.execCommand('copy');
        
        // Remove the temporary textarea
        document.body.removeChild(tempTextArea);
        
        // Optional: Show a brief copied message
        alert('Password copied to clipboard!');
    }
}
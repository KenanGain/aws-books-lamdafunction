document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Smooth scroll functionality
    document.querySelectorAll('a.smooth-scroll').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Cognito configuration
    const poolData = {
        UserPoolId: 'us-east-1_3IUzJhmnH', // Replace with your User Pool ID
        ClientId: '6p43v88dpv6t6h9stbhvfoqkfi' // Replace with your Client ID
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    // Function to check authentication
    function checkAuthentication() {
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession((err, session) => {
                if (err || !session.isValid()) {
                    window.location.href = 'index.html';
                    return;
                }
                displayUsername(cognitoUser);
            });
        }
    }

    // Function to display username
    function displayUsername(cognitoUser) {
        cognitoUser.getUserAttributes((err, attributes) => {
            if (err) return; // Silently ignore errors
            const username = cognitoUser.getUsername();
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = username;
            }
        });
    }

    // Sign Up Function
    function signUp() {
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        const attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email })
        ];

        userPool.signUp(username, password, attributeList, null, (err, result) => {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            alert('User signed up successfully. Please check your email for the verification code.');
            showConfirmationPopup(username);
        });
    }

    // Confirmation Popup
    function showConfirmationPopup(username) {
        const code = prompt("Please enter the 6-digit verification code sent to your email:");
        if (code) {
            confirmSignUp(username, code);
        }
    }

    // Confirm Sign Up
    function confirmSignUp(username, code) {
        const userData = { Username: username, Pool: userPool };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.confirmRegistration(code, true, function(err, result) {
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            alert('Account confirmed successfully. You can now log in.');
            showLoginPopup();
        });
    }

    // Function to show login pop-up
    function showLoginPopup() {
        popupContainer.classList.add('show');
        loginForm.style.display = 'block';
        signUpForm.style.display = 'none';
    }

    // Log In Function
    function login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password,
        });

        const userData = { Username: username, Pool: userPool };
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                window.location.href = 'books.html';
            },
            onFailure: function(err) {
                alert(err.message || JSON.stringify(err));
            },
        });
    }

    // Pop-up functionality for sign up and login
    const signUpBtn = document.getElementById('signUpBtn');
    const logInBtn = document.getElementById('logInBtn');
    const popupContainer = document.getElementById('popup-container');
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signUpForm');
    const closeLogin = document.getElementById('closeLogin');
    const closeSignUp = document.getElementById('closeSignUp');
    const goToSignUp = document.getElementById('goToSignUp');
    const goToLogin = document.getElementById('goToLogin');

    // Ensure elements exist before adding event listeners
    if (signUpBtn && logInBtn && popupContainer && loginForm && signUpForm && closeLogin && closeSignUp && goToSignUp && goToLogin) {
        signUpBtn.addEventListener('click', () => {
            popupContainer.classList.add('show');
            signUpForm.style.display = 'block';
            loginForm.style.display = 'none';
        });

        logInBtn.addEventListener('click', () => {
            popupContainer.classList.add('show');
            loginForm.style.display = 'block';
            signUpForm.style.display = 'none';
        });

        closeLogin.addEventListener('click', () => {
            popupContainer.classList.remove('show');
        });

        closeSignUp.addEventListener('click', () => {
            popupContainer.classList.remove('show');
        });

        goToSignUp.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('flip');
            setTimeout(() => {
                loginForm.style.display = 'none';
                signUpForm.style.display = 'block';
                loginForm.classList.remove('flip');
            }, 300);
        });

        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signUpForm.classList.add('flip');
            setTimeout(() => {
                signUpForm.style.display = 'none';
                loginForm.style.display = 'block';
                signUpForm.classList.remove('flip');
            }, 300);
        });

        // Event Listeners for Sign Up and Login Buttons
        document.getElementById('signUpSubmit').addEventListener('click', signUp);
        document.getElementById('loginSubmit').addEventListener('click', login);
    } else {
        console.error('One or more elements not found in the DOM. Event listeners not attached.');
    }

    // Fetch JSON data and implement search functionality
    fetch('books.json')
        .then(response => response.json())
        .then(data => {
            let search = document.getElementById('search');
            let results = document.getElementById('results');

            if (search && results) {
                search.addEventListener('keyup', function(event) {
                    results.innerHTML = '';
                    let searchTerm = event.target.value.toLowerCase();

                    if (searchTerm.length > 0) {
                        data.forEach(function(book) {
                            if (book.Title.toLowerCase().indexOf(searchTerm) > -1 || 
                                book.Authors.toLowerCase().indexOf(searchTerm) > -1 || 
                                book.Publisher.toLowerCase().indexOf(searchTerm) > -1) {

                                let item = document.createElement('li');
                                item.innerHTML = `${book.Title} by ${book.Authors} (${book.Publisher}, ${book.Year})`;
                                results.appendChild(item);
                            }
                        });
                    }
                });
            } else {
                console.error('Search elements not found.');
            }
        })
        .catch(error => console.error('Error fetching JSON data:', error));

    console.log('Script execution completed');

    // Add event listeners for the additional buttons on books.html
    const logoutBtn = document.getElementById('logoutBtn');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', resetPassword);
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }

    function logout() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
            window.location.href = 'index.html';
        }
    }

    function deleteAccount() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err || !session.isValid()) {
                    window.location.href = 'index.html';
                    return;
                }
                cognitoUser.deleteUser((err, result) => {
                    if (err) {
                        alert(err.message || JSON.stringify(err));
                        return;
                    }
                    alert('User account deleted successfully');
                    window.location.href = 'index.html';
                });
            });
        } else {
            window.location.href = 'index.html';
        }
    }

    function resetPassword() {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.forgotPassword({
                onSuccess: function(data) {
                    const verificationCode = prompt('Please enter the verification code sent to your email:');
                    if (verificationCode) {
                        const newPassword = prompt('Please enter your new password:');
                        if (newPassword) {
                            cognitoUser.confirmPassword(verificationCode, newPassword, {
                                onSuccess() {
                                    alert('Your password has been reset successfully. Please log in with your new password.');
                                    window.location.href = 'index.html';
                                },
                                onFailure(err) {
                                    alert(err.message || JSON.stringify(err));
                                }
                            });
                        }
                    }
                },
                onFailure: function(err) {
                    alert(err.message || JSON.stringify(err));
                }
            });
        } else {
            window.location.href = 'index.html';
        }
    }

    // Check authentication status on load
    checkAuthentication();
});

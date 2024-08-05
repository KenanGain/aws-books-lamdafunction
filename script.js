document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Cognito configuration
    const poolData = {
        
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    let currentUser;

    // Function to check authentication
    function checkAuthentication() {
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser != null) {
            cognitoUser.getSession((err, session) => {
                if (err || !session.isValid()) {
                    console.error('Session is invalid or error occurred:', err);
                    // Stay on the page and show login form if session is invalid
                    showLoginPopup();
                    return;
                }
                currentUser = cognitoUser;
                displayUsername(cognitoUser);
                fetchAndDisplayBooks(); // Fetch and display books after authentication
            });
        } else {
            console.log('No cognito user found, showing login form.');
            // Stay on the page and show login form if no user found
            showLoginPopup();
        }
    }

    // Function to display username
    function displayUsername(cognitoUser) {
        cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
                console.error('Error getting user attributes:', err);
                return;
            }
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
        document.getElementById('popup-container').classList.add('show');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signUpForm').style.display = 'none';
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

    // Fetch books data and implement search functionality
    function fetchAndDisplayBooks() {
        console.log('Fetching books...');
        fetch('https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Books fetched successfully:', data);
                const books = data; // No need to parse data.body as it is already parsed
                displayBooks(books);
                setupSearch(books);
            })
            .catch(error => console.error('Error fetching books:', error));
    }

    // Function to display books on the page
    function displayBooks(books) {
        const section5 = document.getElementById('section5');
        if (section5) {
            section5.innerHTML = ''; // Clear any existing content
            books.forEach(book => {
                const bookCard = document.createElement('div');
                bookCard.classList.add('card');

                bookCard.innerHTML = `
                    <div class="content">
                        <h1 class="booktitle zero-space">${book.Title}</h1>
                        <img src="logo-navy.png" alt="Book cover">
                        <p class="para"><span class="bold">Authors:</span> ${book.Authors}</p>
                        <p class="para"><span class="bold">Publisher:</span> ${book.Publisher}</p>
                        <p class="para"><span class="bold">Year:</span> ${book.Year}</p>
                        <button class="deleteBookBtn" data-title="${book.Title}" style="--c:#CE2D4F">Delete</button>
                    </div>
                `;

                section5.appendChild(bookCard);
            });

            setupDeleteButtons(); // Add delete button functionality
        }
    }

    // Function to set up the search functionality
    function setupSearch(books) {
        const searchInput = document.getElementById('search');
        const resultsList = document.getElementById('results');

        if (searchInput && resultsList) {
            searchInput.addEventListener('keyup', function(event) {
                const searchTerm = event.target.value.toLowerCase();
                resultsList.innerHTML = '';

                if (searchTerm.length > 0) {
                    books.forEach(book => {
                        if (
                            book.Title.toLowerCase().includes(searchTerm) ||
                            book.Authors.toLowerCase().includes(searchTerm) ||
                            book.Publisher.toLowerCase().includes(searchTerm)
                        ) {
                            const listItem = document.createElement('li');
                            listItem.textContent = `${book.Title} by ${book.Authors} (${book.Publisher}, ${book.Year})`;
                            resultsList.appendChild(listItem);
                        }
                    });
                }
            });
        } else {
            console.error('Search input or results list not found.');
        }
    }

    // Function to set up delete button functionality
    function setupDeleteButtons() {
        document.querySelectorAll('.deleteBookBtn').forEach(button => {
            button.addEventListener('click', handleDeleteBook);
        });
    }

    // Function to handle deleting a book
    function handleDeleteBook(event) {
        if (!currentUser) {
            alert('You must be logged in to delete a book.');
            return;
        }

        const title = event.target.getAttribute('data-title');
        if (confirm(`Are you sure you want to delete the book: ${title}?`)) {
            fetch(`https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books?title=${encodeURIComponent(title)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Book deleted:', data);
                    fetchAndDisplayBooks(); // Refresh the book list
                })
                .catch(error => console.error('Error deleting book:', error));
        }
    }

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

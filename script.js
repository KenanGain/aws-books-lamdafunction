document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // Cognito configuration
    const poolData = {
        UserPoolId: 'us-east-1_3IUzJhmnH', // Replace with your User Pool ID
        ClientId: '6p43v88dpv6t6h9stbhvfoqkfi' // Replace with your Client ID
    };
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    let currentUser;
    let currentEditBookTitle;
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
                        <div class="crud-buttons">
                            <button class="editBookBtn" data-title="${book.Title}">Edit</button>
                            <button class="deleteBookBtn" data-title="${book.Title}" style="--c:#CE2D4F">Delete</button>
                        </div>
                    </div>
                `;

                section5.appendChild(bookCard);
            });

            setupDeleteButtons(); // Add delete button functionality
            setupEditButtons(); // Add edit button functionality
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

     // Function to set up edit button functionality
     function setupEditButtons() {
        document.querySelectorAll('.editBookBtn').forEach(button => {
            button.addEventListener('click', handleEditBook);
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
                    'Content-Type': 'application/json',
                    'Authorization': currentUser.getSignInUserSession().getIdToken().getJwtToken() // Ensure the user is authenticated
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

    function handleEditBook(event) {
        if (!currentUser) {
            alert('You must be logged in to edit a book.');
            return;
        }
    
        const title = decodeURIComponent(event.target.getAttribute('data-title'));
        currentEditBookTitle = title;
        fetch(`https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books?title=${encodeURIComponent(title)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('edit-book-title').value = data.Title;
                document.getElementById('edit-book-author').value = data.Authors;
                document.getElementById('edit-book-publisher').value = data.Publisher;
                document.getElementById('edit-book-year').value = data.Year;
    
                document.getElementById('popup-container').classList.add('show');
                document.getElementById('editBook').style.display = 'block';
                document.getElementById('addBook').style.display = 'none';
            })
            .catch(error => console.error('Error fetching book details:', error));
    }

    function handleEditBookSubmit() {
        if (!currentUser) {
            alert('You must be logged in to edit a book.');
            return;
        }
    
        const newTitle = document.getElementById('edit-book-title').value;
        const authors = document.getElementById('edit-book-author').value;
        const publisher = document.getElementById('edit-book-publisher').value;
        const year = document.getElementById('edit-book-year').value;
    
        const updatedBook = {
            Title: newTitle,
            Authors: authors,
            Publisher: publisher,
            Year: parseInt(year)
        };
    
        // First, delete the old book
        fetch(`https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books?title=${encodeURIComponent(currentEditBookTitle)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentUser.getSignInUserSession().getIdToken().getJwtToken()
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete old book entry');
            }
            // Then, add the updated book
            return fetch('https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': currentUser.getSignInUserSession().getIdToken().getJwtToken()
                },
                body: JSON.stringify(updatedBook)
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add updated book entry');
            }
            return response.json();
        })
        .then(data => {
            console.log('Book updated:', data);
            fetchAndDisplayBooks();
            document.getElementById('editBook').style.display = 'none';
            document.getElementById('popup-container').classList.remove('show');
        })
        .catch(error => {
            console.error('Error updating book:', error);
            alert('Failed to update book. Please try again.');
        });
    }
    // Function to handle adding a new book
    function handleAddBook() {
        if (!currentUser) {
            alert('You must be logged in to add a book.');
            return;
        }

        const title = document.getElementById('book-title').value;
        const authors = document.getElementById('book-author').value;
        const publisher = document.getElementById('book-publisher').value;
        const year = document.getElementById('book-year').value;

        const newBook = {
            Title: title,
            Authors: authors,
            Publisher: publisher,
            Year: parseInt(year)
        };

        fetch('https://pq9v4plwp1.execute-api.us-east-1.amazonaws.com/dev2/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentUser.getSignInUserSession().getIdToken().getJwtToken() // Ensure the user is authenticated
            },
            body: JSON.stringify(newBook)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Book added:', data);
                fetchAndDisplayBooks(); // Refresh the book list
                document.getElementById('addBook').style.display = 'none'; // Close the popup
                document.getElementById('popup-container').classList.remove('show');
            })
            .catch(error => console.error('Error adding book:', error));
    }


   // Add event listeners for the additional buttons on books.html
   const logoutBtn = document.getElementById('logoutBtn');
   const resetPasswordBtn = document.getElementById('resetPasswordBtn');
   const deleteAccountBtn = document.getElementById('deleteAccountBtn');
   const addBookBtn = document.getElementById('addBookBtn');
   const closeAddBook = document.getElementById('closeAddBook');
   const closeEditBook = document.getElementById('closeEditBook');
   const addBookSubmit = document.getElementById('addBookSubmit');
   const editBookSubmit = document.getElementById('editBookSubmit');

   if (logoutBtn) {
       logoutBtn.addEventListener('click', logout);
   }

   if (resetPasswordBtn) {
       resetPasswordBtn.addEventListener('click', resetPassword);
   }

   if (deleteAccountBtn) {
       deleteAccountBtn.addEventListener('click', deleteAccount);
   }

   if (addBookBtn) {
       addBookBtn.addEventListener('click', () => {
           document.getElementById('popup-container').classList.add('show');
           document.getElementById('addBook').style.display = 'block';
           document.getElementById('editBook').style.display = 'none';
       });
   }

   if (closeAddBook) {
       closeAddBook.addEventListener('click', () => {
           document.getElementById('addBook').style.display = 'none';
           document.getElementById('popup-container').classList.remove('show');
       });
   }

   if (closeEditBook) {
       closeEditBook.addEventListener('click', () => {
           document.getElementById('editBook').style.display = 'none';
           document.getElementById('popup-container').classList.remove('show');
       });
   }

   if (addBookSubmit) {
       addBookSubmit.addEventListener('click', handleAddBook);
   }

   if (editBookSubmit) {
       editBookSubmit.addEventListener('click', handleEditBookSubmit);
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

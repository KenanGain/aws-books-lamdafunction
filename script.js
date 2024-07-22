document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll functionality
  document.querySelectorAll('a.smooth-scroll').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
          });
      });
  });

  // Fetch JSON data from file
  fetch('books.json')
    .then(response => response.json())
    .then(data => {
      // Get input element and results list
      let search = document.getElementById('search');
      let results = document.getElementById('results');

      // Attach event listener to input element
      if (search && results) {
          search.addEventListener('keyup', function(event) {
              // Clear results list
              results.innerHTML = '';

              // Get search term
              let searchTerm = event.target.value.toLowerCase();

              // Check if search term is not empty
              if (searchTerm.length > 0) {
                  // Loop through data and check for matches
                  data.forEach(function(book) {
                      // Check if title, authors, or publisher contains search term
                      if (book.Title.toLowerCase().indexOf(searchTerm) > -1 || 
                          book.Authors.toLowerCase().indexOf(searchTerm) > -1 || 
                          book.Publisher.toLowerCase().indexOf(searchTerm) > -1) {

                          // Create result item
                          let item = document.createElement('li');
                          item.innerHTML = `${book.Title} by ${book.Authors} (${book.Publisher}, ${book.Year})`;
                          results.appendChild(item);
                      }
                  });
              }
          });
      }
    })
    .catch(error => console.error('Error fetching JSON data:', error));

  // Pop-up functionality for index.html
  const signUpBtn = document.getElementById('signUpBtn');
  const logInBtn = document.getElementById('logInBtn');
  const popupContainer = document.getElementById('popup-container');
  const loginForm = document.getElementById('loginForm');
  const signUpForm = document.getElementById('signUpForm');
  const closeLogin = document.getElementById('closeLogin');
  const closeSignUp = document.getElementById('closeSignUp');
  const goToSignUp = document.getElementById('goToSignUp');
  const goToLogin = document.getElementById('goToLogin');

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

      // Redirect to books.html on form submission (for demonstration purposes)
      document.getElementById('loginSubmit').addEventListener('click', () => {
          window.location.href = 'books.html';
      });

      document.getElementById('signUpSubmit').addEventListener('click', () => {
          window.location.href = 'books.html';
      });
  }

  // Pop-up functionality for books.html
  const addBook = document.getElementById('addBook');
  const editBook = document.getElementById('editBook');
  const deleteBook = document.getElementById('deleteBook');

  const closeAddBook = document.getElementById('closeAddBook');
  const closeEditBook = document.getElementById('closeEditBook');
  const deleteBookNo = document.getElementById('deleteBookNo');

  const addBookBtn = document.getElementById('addBookBtn');
  const editBookBtn = document.getElementById('editBookBtn');
  const deleteBookBtn = document.getElementById('deleteBookBtn');


  if (addBook && editBook && closeAddBook && closeEditBook && addBookBtn && editBookBtn && deleteBook && deleteBookNo && deleteBookBtn) {
      addBookBtn.addEventListener('click', () => {
          popupContainer.classList.add('show');
          addBook.style.display = 'block';
          editBook.style.display = 'none';
          deleteBook.style.display = 'none';

      });

      editBookBtn.addEventListener('click', () => { 
          popupContainer.classList.add('show');
          editBook.style.display = 'block';
          addBook.style.display = 'none';
          deleteBook.style.display = 'none';

      });

      deleteBookBtn.addEventListener('click', () => { 
        popupContainer.classList.add('show');
        deleteBook.style.display = 'block';
        addBook.style.display = 'none';
        editBook.style.display = 'none';
    });

      closeAddBook.addEventListener('click', () => {
          popupContainer.classList.remove('show');
      });

      closeEditBook.addEventListener('click', () => {
          popupContainer.classList.remove('show');
      });
      
      deleteBookNo.addEventListener('click', () => {
        popupContainer.classList.remove('show');
    });

  }
});

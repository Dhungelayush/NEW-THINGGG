import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdxGsJNeXdY2vHUuWkgXFMrtUY9JerZ7M",
  authDomain: "khane-ho.firebaseapp.com",
  projectId: "khane-ho",
  storageBucket: "khane-ho.appspot.com",
  messagingSenderId: "808035616011",
  appId: "1:808035616011:web:639c584e6f0819b4a10e0e",
  measurementId: "G-76C8MGTB29"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}


function registerUser(email, password, confirmPassword) {
  if (password !== confirmPassword) {
    return Promise.reject("Passwords do not match.");
  }

  return createUserWithEmailAndPassword(auth, email, password);
}


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form-container');
  const registerForm = document.getElementById('register-form-container');
  const merchantForm = document.getElementById('merchant-form-container');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const loadingScreen = document.getElementById('loading-screen');
  const showMerchant = document.getElementById('show-merchant');
  const merchantEmailInput = document.getElementById('merchant-email');
  

  showRegisterLink.addEventListener("click", function(event) {
    event.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    merchantForm.style.display = "none";
  });

  showLoginLink.addEventListener("click", function(event) {
    event.preventDefault();
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    merchantForm.style.display = "none";
  });
  showMerchant.addEventListener("click", function(event) {
    event.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "none";
    merchantForm.style.display = "block";
  });
  // Login form submit event handler
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    // Display loading screen while the request is being processed
    loadingScreen.style.display = 'block';

    loginUser(email, password)
      .then(() => {
        // User logged in successfully
        loadingScreen.style.display = 'none';
        window.location.href = '/redirect';
      })
      .catch((error) => {
        loadingScreen.style.display = 'none';
        console.error('Error logging in:', error);
        alert('Error logging in. Please try again.');
      });
  });

  // Register form submit event handler
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = registerForm.querySelector('input[name="email"]').value;
    const password = registerForm.querySelector('input[name="password"]').value;
    const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;

    loadingScreen.style.display = 'block';

    registerUser(email, password, confirmPassword)
      .then(() => {
      
        loadingScreen.style.display = 'none';
        window.location.href = '/redirect';
      })
      .catch((error) => {
        loadingScreen.style.display = 'none';
        console.error('Error registering:', error);
        alert('Error registering. Please try again.');
      });
  });
  merchantForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = merchantEmailInput.value;
    const password = merchantForm.querySelector('input[name="password"]').value;
    const confirmPassword = merchantForm.querySelector('input[name="confirmPassword"]').value;
  
    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    // Display loading screen while the registration request is being processed
    loadingScreen.style.display = 'block';
  
    // Register the merchant to Firebase
    registerUser(email, password, confirmPassword)
      .then(() => {
        // Registration successful, now save the email to the server
        return fetch('/merchantRegister', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
      })
      .then(response => response.json())
      .then(data => {
        loadingScreen.style.display = 'none';
  
        if (data.error) {
          alert(data.error);
        } else {
          window.location.href = '/redirect';
        }
      })
      .catch(error => {
        loadingScreen.style.display = 'none';
        console.error('Error registering:', error);
        alert('Error registering. Please try again.');
      });
  });
});

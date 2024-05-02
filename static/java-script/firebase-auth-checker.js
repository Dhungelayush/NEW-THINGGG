import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js"; 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

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

function checkAuthState() {
  const auth = getAuth(app);

  // Use onAuthStateChanged to listen for changes in user authentication state
  onAuthStateChanged(auth, (user) => {
    const uploadBtn = document.getElementById("upload-btn");
    const orderBtn = document.getElementById("Manage");

    if (user) {
      // User is logged in
      const userEmail = user.email;
      localStorage.setItem("user",userEmail);
      fetch("/merchantEmail")
        .then(response => response.json())
        .then(data => {
          console.log("The data =>" + JSON.stringify(data))
         
          if (data.merchantEmails.includes(userEmail)) {
            uploadBtn.style.display = 'inline-block';
            orderBtn.style.display = 'inline-block';
            console.log("User is a registered merchant:", userEmail);
          } else {
            uploadBtn.style.display = 'none';
            orderBtn.style.display = 'none';
            console.log("User is not a registered merchant:", userEmail);
          }
          
        })
        .catch(error => {
          console.error("Error fetching merchant emails:", error);
        });
    } else {
      uploadBtn.style.display = 'none';
      orderBtn.style.display = 'none';
      console.log("User is not logged in.");
    }
  });
}

checkAuthState();


// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAdxGsJNeXdY2vHUuWkgXFMrtUY9JerZ7M",
    authDomain: "khane-ho.firebaseapp.com",
    projectId: "khane-ho",
    storageBucket: "khane-ho.appspot.com",
    messagingSenderId: "808035616011",
    appId: "1:808035616011:web:639c584e6f0819b4a10e0e",
    measurementId: "G-76C8MGTB29"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
var userEmail;
async function Getuser() {
    await new Promise((resolve) => {
      userEmail = localStorage.getItem("user");
      console.log("Current User " + userEmail);
      resolve();
    });
  }

  
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const receiver = urlParams.get("receiver");
    const area = urlParams.get("area");
    
    try {
        // Wait for Firebase authentication to be ready
        await auth.onAuthStateChanged(async (user) => {
            if (user) {

                Getuser();
                const response = await fetch("/merchantEmail");
                const data = await response.json();
                const merchantEmails = data.merchantEmails; // Assuming the server returns an array of emails

                let emailMatch = merchantEmails.includes(userEmail);

                if (!emailMatch) {
                    alert("User Email doesn't match " + userEmail + " is not a Merchant");
                    window.location.href = "/redirect";
                    return;
                }

                if (!emailMatch) {
                    alert("User Email aint match " + userEmail + " is User")
                    window.location.href = "/redirect";
                    return;
                }
                alert(userEmail);
              
                // User matches with merchant, continue with order verification setup
                
                // Set the orderId as the value of the input field
                const verificationCodeInput = document.getElementById("verification-code");
                verificationCodeInput.value = orderId;
                
                // Show the Verify button
                const verifyButton = document.querySelector(".verify-button");
                verifyButton.style.display = "inline-block";
                
                verifyButton.addEventListener("click", async () => {
                    try {
                        // Make an AJAX request to change the order status
                        const changeStatusResponse = await fetch('/changeOrderStatus', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ area: area, orderNumber: orderId })
                        });

                        const changeStatusData = await changeStatusResponse.json();

                        // Show a popup or alert indicating the order is approved
                        alert('Order Approved');
                        
                    } catch (error) {
                        console.error('Error changing order status:', error);
                    }
                });
                
            } else {
                // User is not logged in, redirect to login page
                window.location.href = "/user-auth"; // Change to your login page URL
            }
        });
    } catch (error) {
        console.error('Error fetching merchant email:', error);
    }
});

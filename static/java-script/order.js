const orderButton = document.getElementById("orderBTN");
orderButton.disabled = true;
const receiver = getURLParameter("receiver");
const rName = getURLParameter("restaurantName");
const area = getURLParameter("area");
function addMenuItem(itemName, itemPrice) {
  const menuItemsTable = document.getElementById("menuItems");

  const row = document.createElement("tr");
  const nameCell = document.createElement("td");
  const priceCell = document.createElement("td");
  const actionCell = document.createElement("td");
  const orderButton = document.createElement("button");

  nameCell.textContent = itemName;
  priceCell.textContent = itemPrice;
  orderButton.textContent = "Order";
  orderButton.addEventListener("click", () => {
    addToCart(itemName, itemPrice);
  });

  actionCell.appendChild(orderButton);

  row.appendChild(nameCell);
  row.appendChild(priceCell);
  row.appendChild(actionCell);

  menuItemsTable.appendChild(row);
}

// Function to retrieve the restaurant data from local storage and display the menu items
async function displayMenuItems() {
  try {
    const restaurantData = await new Promise((resolve) => {
      const data = localStorage.getItem("restaurantData");
      resolve(data);
    });

    const menuItems = JSON.parse(restaurantData);

    // Display the menu items
    for (const [itemName, itemPrice] of Object.entries(menuItems)) {
      addMenuItem(itemName, itemPrice);
    }
  } catch (error) {
    console.error("Error displaying menu items:", error);
  }
}




async function getStoredRestaurantData() {
  return await new Promise((resolve) => {
    const restaurantData = localStorage.getItem("restaurantData");

    console.log(localStorage.getItem("restaurantData") + "IS THE JSON");
    const parsedData = JSON.parse(restaurantData);
    resolve(parsedData);
  });
}

// Call the displayMenuItems function with the retrieved restaurant data
const restaurantData = getStoredRestaurantData();
displayMenuItems(restaurantData);

function addToCart(itemName, price) {
  const cartItems = document.getElementById("cartItems");

  const cartItemDiv = document.createElement("div");
  cartItemDiv.innerHTML = `
    <p>${itemName} - ${price}</p>
    <button type="button" onclick="removeFromCart(this)">Remove</button>
  `;

  cartItems.appendChild(cartItemDiv);
  console.log(cartItems.children.length);
  updateOrderButtonState();
}

function updateOrderButtonState() {
  const phoneNumber = document.getElementsByClassName("ph")[0].value;
  const address = document.getElementById("address").value;
  const cartItems = document.getElementById("cartItems");
  const orderButton = document.getElementById("orderBTN");

  if (cartItems.children.length < 1 || phoneNumber === "" || address === "") {
    orderButton.disabled = true;
  } else {
    orderButton.disabled = false;
  }
}

function hasRequiredItems() {
  const phoneNumber = document.getElementsByClassName("ph")[0].value;
  const address = document.getElementById("address").value;
  const cartItems = document.getElementById("cartItems");

  if (cartItems.children.length > 0 && phoneNumber !== "" && address !== "") {
    return true;
  } else {
    return false;
  }
}

function removeFromCart(button) {
  const cartItemDiv = button.parentNode;
  cartItemDiv.remove();
  updateOrderButtonState();
}

function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const receiverEmail = getURLParameter("receiver");
const orderNo = generateRandomOrderNumber();
const areaC = getURLParameter("area");
function placeOrder() {
  const phoneNumber = document.getElementsByClassName("ph")[0].value;
  const address = document.getElementById("address").value;
  const restaurantName = decodeURIComponent(getURLParameter("restaurantName"));
  const orderObject = {
    area: areaC,
    orderNumber: orderNo,
    orderDetails: [],
    customerDetails: {
      phoneNumber,
      address,
    },
    restaurantName,
    orderStatus: "PENDING",
  };

  const cartItems = document.getElementById("cartItems").getElementsByTagName("p");

  for (let i = 0; i < cartItems.length; i++) {
    const itemInfo = cartItems[i].textContent.split(" - ");
    const itemName = itemInfo[0];
    const itemPrice = parseFloat(itemInfo[1]);
    orderObject.orderDetails.push({
      itemName,
      itemPrice,
    });
  }

  const orderData = JSON.stringify(orderObject);
  console.log(orderData);

  // Send the order data to the server and handle the response
  fetch("/sendOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: orderData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order sent successfully:", data);
      // Handle success, e.g., show confirmation message, clear cart, etc.
    })
    .catch((error) => {
      console.error("Error sending order:", error);
      // Handle error, e.g., show error message to the user
      const alertModal = document.getElementById("alertModal");
      const alertMessage = document.getElementById("alertMessage");
      alertMessage.innerHTML = "Error placing the order. Please try again.";
      alertModal.style.display = "block";
    });

  let orderDetails = "";

  for (let i = 0; i < cartItems.length; i++) {
    orderDetails += cartItems[i].textContent + "<br>";
  }

  const orderNumber = orderNo;
 


  const newURL = `http://localhost:3000/verify-order?orderId=${orderNumber}&receiver=${receiver}&restaurantName=${rName}&area=${area}`;
  const message = `
    <h1>New Order from ${orderNumber}</h1>
    <h2>Order Details</h2>
    ${orderDetails}
    <h2>Customer Details</h2>
    <p>Phone Number: ${phoneNumber}</p>
    <p>Address: ${address}</p>
    <a href="${newURL}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Order</a>
  `;

  // Show loading modal
  const loadingModal = document.getElementById("loadingModal");
  loadingModal.style.display = "block";

  if (phoneNumber === "" || address === "") {
    const alertModal = document.getElementById("alertModal");
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.innerHTML = "Order not placed, address empty!";
    alertModal.style.display = "block";
    loadingModal.style.display = "none";
  } else {
    // Send email with order details
    sendEmail(receiverEmail, "New Order", message)
      .then(() => {

        loadingModal.style.display = "none";

        // Show success alert modal
        const alertModal = document.getElementById("alertModal");
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.innerHTML = "Order placed successfully! \n Your Order ID is " + orderNo;
        alertModal.style.display = "block";

        // Disable order button and clear cart items
        orderButton.disabled = true;
        document.getElementById("cartItems").innerHTML = "";
      })
      .catch((error) => {
        // Hide loading modal
        loadingModal.style.display = "none";

        // Show error alert modal
        const alertModal = document.getElementById("alertModal");
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.innerHTML = "Error placing the order. Please try again.";
        alertModal.style.display = "block";
      });
  }
}

function sendEmail(receiver, topic, message) {
  const phoneNumber = document.getElementsByClassName("ph")[0].value;
  const address = document.getElementById("address").value;

  if (phoneNumber !== "" && address !== "") {
    return new Promise((resolve, reject) => {

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver, topic, message }),
      };

      fetch("/sendEmail", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          console.log("Email sent successfully:", data);
          resolve();
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          reject(error);
        });

    });

  }
}

const cartIcon = document.querySelector(".cart-icon");
const cartModal = document.getElementById("cartModal");

cartIcon.addEventListener("click", () => {
  cartModal.style.display = "block"; // Show cart modal
});

// Close the cart modal when the user clicks outside of it
window.addEventListener("click", (event) => {
  if (event.target === cartModal) {
    cartModal.style.display = "none"; // Hide cart modal
  }
});
function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  cartModal.style.display = "none"; // Hide cart modal
}



function generateRandomOrderNumber() {
  const randomNumber = Math.floor(Math.random() * 10000000);
  return randomNumber;
}
function redirectToHomepage() {
  window.location.href = "/redirect";
}


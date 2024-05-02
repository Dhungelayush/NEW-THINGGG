


document.getElementById("restaurantForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  

  const restaurantName = document.getElementById("restaurantName").value;
  const orderReceiveEmail = document.getElementById("orderReceiveEmail").value;
  const phoneNumber = document.getElementById("phoneNumber").value;
  const areaDropdown = document.getElementById("area");
  const selectedOption = areaDropdown.selectedOptions[0];
  const areaName = selectedOption.textContent;

  const menuItems = Array.from(document.getElementsByClassName("itemName"));
  const itemPrices = Array.from(document.getElementsByClassName("itemPrice"));

  const menu = {};
  menuItems.forEach((item, index) => {
    const itemName = item.value;
    const itemPrice = itemPrices[index].value;
    if (itemName && itemPrice) {
      menu[itemName] = itemPrice;
    }
  });

  const photoFile = document.getElementById("restaurantImage").files[0];

  if (!photoFile) {
    showMessage("Please select an image.", true);
    return;
  }

  showLoading();

  try {
    // Create FormData and append the form fields to it
    const formDataWithRestaurant = new FormData();
    formDataWithRestaurant.append("restaurantName", restaurantName);
    formDataWithRestaurant.append("orderReceiveEmail", orderReceiveEmail);
    formDataWithRestaurant.append("phoneNumber", phoneNumber);
    formDataWithRestaurant.append("area", areaName);
    formDataWithRestaurant.append("menu", JSON.stringify(menu));
    formDataWithRestaurant.append("restaurantImage", photoFile);

    // Now submit the form with the FormData containing the restaurant data and await the response
    const response = await fetch("/addRestaurant", {
      method: "POST",
      body: formDataWithRestaurant, // Use the FormData object with restaurant data as the body
    });

    // Check if the response is successful before showing the success message
    if (response.ok) {
      hideLoading();
      showMessage("Restaurant added successfully!");
    } else {
      // If the response is not successful, show an error message
      hideLoading();
      showMessage("Error uploading image.", true);
      console.error("Error uploading image:");
    }
  } catch (error) {
    hideLoading();
    showMessage("Error uploading image.", true);
    console.error("Error uploading image:", error);
  }
});


function addItem() {
  const menuItems = document.getElementById("menuItems");
  const newItemDiv = document.createElement("div");
  newItemDiv.innerHTML = `
    <input type="text" class="itemName" placeholder="Item Name" required>
    <input type="text" class="itemPrice" placeholder="Item Price" required>
    <br><br>
  `;
  menuItems.appendChild(newItemDiv);
}

function showLoading() {
  const loadingIcon = document.createElement("span");
  loadingIcon.innerHTML = "&#128344;"; // You can change this to your desired loading icon
  loadingIcon.classList.add("loading-icon");
  document.getElementById("restaurantForm").appendChild(loadingIcon);
}

// Hide loading icon
function hideLoading() {
  const loadingIcon = document.querySelector(".loading-icon");
  if (loadingIcon) {
    loadingIcon.remove();
  }
}

function showMessage(message, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.classList.toggle("error", isError);
}

function clearMessage() {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = "";
  messageDiv.classList.remove("error");
}

fetch("/static/area.json")
  .then(response => response.json())
  .then(data => {
    const areaDropdown = document.getElementById("area");
    data.areas.forEach(area => {
      const option = document.createElement("option");
      option.value = area;
      option.textContent = area;
      areaDropdown.appendChild(option);
    });
  })
  .catch(error => {
    console.error("Error fetching areas:", error);
  });
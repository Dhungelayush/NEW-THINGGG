var userEmail;


async function Getuser() {
  await new Promise((resolve) => {
    userEmail = localStorage.getItem("user");
    console.log("Current User " + userEmail);
    resolve();
  });
}

Getuser();

document.addEventListener('DOMContentLoaded', async () => {
  const ownedRestaurantsContainer = document.getElementById('owned-restaurants-container');
  const selectRestaurantDropdown = document.getElementById('select-restaurant');
  const loadingScreen = document.getElementById('loading-screen');
 
  async function fetchAllRestaurants(selectedArea) {
    showLoadingScreen();
  
    try {
      const response = await fetch(`/restaurantsByArea/${selectedArea}`);
      const restaurantsData = await response.json();
      
      hideLoadingScreen();
      return restaurantsData;
    } catch (error) {
      showLoadingScreenWithMessage("Error fetching restaurants.");
      throw error;
    }
  }

  async function fetchOwnedRestaurants(selectedArea) {
    showLoadingScreen();


    const response = await fetch(`/userOwnedRestaurants/${userEmail}`);
    const ownedRestaurantsData = await response.json();

    const selectedAreaData = ownedRestaurantsData.find(areaData => areaData.area === selectedArea);
    if (selectedAreaData) {
      const areaRestaurantsResponse = await fetch(`/restaurantsByArea/${selectedArea}`);
      const areaRestaurants = await areaRestaurantsResponse.json();

      // Filter the user's owned restaurants for the selected area
      const ownedRestaurants = [];
      selectedAreaData.restaurants.forEach(ownedRestaurant => {
        const areaRestaurant = areaRestaurants.find(ar => ar.restaurantName === ownedRestaurant.name);
        if (areaRestaurant) {
          ownedRestaurants.push(ownedRestaurant);
        }
      });
      console.log("The Owned Data === ", ownedRestaurants);
      hideLoadingScreen();
      // Return the filtered owned restaurants and area restaurants
      return { ownedRestaurants, areaRestaurants };
    } else {
      return { ownedRestaurants: [], areaRestaurants: [] };
    }

  }
  document.getElementById('close-loading-btn').addEventListener('click', () => {
    hideLoadingScreen();
  });

  function waitForElement(selector) {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  async function populateOwnedRestaurants(selectedArea) {
    try {
      showLoadingScreen();
      ownedRestaurantsContainer.innerHTML = ''; // Clear the previous content

      const { ownedRestaurants, areaRestaurants } = await fetchOwnedRestaurants(selectedArea);

      // Fetch all restaurants from the server (restaurants.json)
      const allRestaurantsResponse = await fetch(`/restaurantsByArea/${selectedArea}`);
      const allRestaurants = await allRestaurantsResponse.json();

      // Create and populate HTML elements for each restaurant using for loops
      for (const ownedRestaurant of ownedRestaurants) {
        let areaRestaurant;

        for (const restaurant of areaRestaurants) {
          if (restaurant.restaurantName === ownedRestaurant.name) {
            areaRestaurant = restaurant;
            break;
          }
        }
        console.log("THE AREA RESTAURANT =  ", areaRestaurant.menuItems);
        console.log("THE AREA RESTAURANT EMAIL =  ", areaRestaurant.orderReceiveEmail);
        console.log("THE AREA RESTAURANT Phone =  ", areaRestaurant.phoneNumber);
        console.log("THE AREA RESTAURANT Area =  ", areaRestaurant.area);


        if (areaRestaurant) {
          const restaurantDiv = document.createElement('div');
          restaurantDiv.innerHTML =`
          <h2>${ownedRestaurant.name}</h2>
          <p>Area: ${areaRestaurant.area}</p>
          <p>Order Receive Email: ${areaRestaurant.orderReceiveEmail}</p>
          <p>Phone Number: ${areaRestaurant.phoneNumber}</p>
          <p>Menu:</p>
          <ul id="menu-${ownedRestaurant.name}">
            <!-- Menu items will be dynamically populated here -->
          </ul>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          <hr>
        `;
          ownedRestaurantsContainer.appendChild(restaurantDiv);

          const menuList = document.getElementById(`menu-${ownedRestaurant.name}`);


          if (areaRestaurant.menuItems && typeof areaRestaurant.menuItems === 'object') {
            const menuItemsArray = Object.entries(areaRestaurant.menuItems);

            if (menuItemsArray.length > 0) {
              // Code to populate menu items here
              for (const [itemName, itemPrice] of menuItemsArray) {
                const menuItemElement = document.createElement('li');
                menuItemElement.textContent = `${itemName} - ${itemPrice}`;
                menuList.appendChild(menuItemElement);
              }
            } else {
              // Handle the case when 'menuItems' is an object but empty
              const noMenuItemsMessage = document.createElement('li');
              noMenuItemsMessage.textContent = 'No menu items available';
              menuList.appendChild(noMenuItemsMessage);
            }
          } else {
            // Handle the case when 'menuItems' is missing or not an object
            const noMenuItemsMessage = document.createElement('li');
            noMenuItemsMessage.textContent = 'No menu items available';
            menuList.appendChild(noMenuItemsMessage);
          }

          // Attach event listeners to edit and delete buttons
          const editBtn = restaurantDiv.querySelector('.edit-btn');
          const deleteBtn = restaurantDiv.querySelector('.delete-btn');
          editBtn.addEventListener('click', () => handleEditRestaurant(areaRestaurant));
          deleteBtn.addEventListener('click', () => handledeleteRestaurant(areaRestaurant.area, ownedRestaurant.name));


        }
      }
    } catch (error) {
      showLoadingScreenWithMessage(error);
    }
  }

  // Call the populateAllRestaurants function
  async function populateAllRestaurants(selectedArea) {
    try {
      const restaurantsData = await fetchAllRestaurants(selectedArea);
  
      ownedRestaurantsContainer.innerHTML = ''; // Clear the previous content
  
      for (const restaurant of restaurantsData) {
        const restaurantDiv = document.createElement('div');
        restaurantDiv.innerHTML = `
          <h2>${restaurant.restaurantName}</h2>
          <p>Area: ${restaurant.area}</p>
          <p>Order Receive Email: ${restaurant.orderReceiveEmail}</p>
          <p>Phone Number: ${restaurant.phoneNumber}</p>
          <p>Menu:</p>
          <ul id="menu-${restaurant.restaurantName}">
            <!-- Menu items will be dynamically populated here -->
          </ul>
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
          <hr>
        `;
        ownedRestaurantsContainer.appendChild(restaurantDiv);
  
        const menuList = document.getElementById(`menu-${restaurant.restaurantName}`);
  
        if (restaurant.menuItems && typeof restaurant.menuItems === 'object') {
          const menuItemsArray = Object.entries(restaurant.menuItems);
  
          if (menuItemsArray.length > 0) {
            // Code to populate menu items here
            for (const [itemName, itemPrice] of menuItemsArray) {
              const menuItemElement = document.createElement('li');
              menuItemElement.textContent = `${itemName} - ${itemPrice}`;
              menuList.appendChild(menuItemElement);
            }
          } else {
            // Handle the case when 'menuItems' is an object but empty
            const noMenuItemsMessage = document.createElement('li');
            noMenuItemsMessage.textContent = 'No menu items available';
            menuList.appendChild(noMenuItemsMessage);
          }
        } else {
          // Handle the case when 'menuItems' is missing or not an object
          const noMenuItemsMessage = document.createElement('li');
          noMenuItemsMessage.textContent = 'No menu items available';
          menuList.appendChild(noMenuItemsMessage);
        }
  
        // Add event listeners for edit and delete buttons
        const editBtn = restaurantDiv.querySelector('.edit-btn');
        const deleteBtn = restaurantDiv.querySelector('.delete-btn');
        editBtn.addEventListener('click', () => handleEditRestaurant(restaurant));
        deleteBtn.addEventListener('click', () => deleteRestaurant(restaurant.area, restaurant.restaurantName));
      }
    } catch (error) {
      showLoadingScreenWithMessage(error);
    }
  }
  
  function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'inline-block';
  }

  // Function to hide the loading screen
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';
  }

  // Function to show the loading screen with a custom message
  function showLoadingScreenWithMessage(message) {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = message;
    loadingScreen.style.display = 'inline-block';
  }

  async function populateAreaDropdown() {
    try {
      const areasResponse = await fetch('/areas');
      const areasData = await areasResponse.json();

      areasData.areas.forEach(area => {
        const option = document.createElement('option');
        option.value = area; // Set the area name as the value
        option.textContent = area;
        selectRestaurantDropdown.appendChild(option);
      });


    } catch (error) {
      console.error('Error fetching area data:', error);
      // Handle error if unable to fetch area data
    }
  }
  selectRestaurantDropdown.addEventListener('change', async () => {
    const acceptedAdmin = "prabeshpathak02@gmail.com";
    const selectedArea = selectRestaurantDropdown.value;
    console.log("Selected area => " + selectedArea)
    if(userEmail == acceptedAdmin)
    {
      console.log("User is admin");
      populateAllRestaurants(selectedArea);
    }else
    {
      const ownedRestaurants = await fetchOwnedRestaurants(selectedArea);
      populateOwnedRestaurants(selectedArea);
    }
  });

  function handleEditRestaurant(restaurant) {
    // Create the edit panel
    const editPanel = document.createElement('div');
    editPanel.classList.add('edit-panel');
    editPanel.innerHTML = `
    <div class="con">
      <h3>Edit Restaurant</h3>
      <label for="edit-restaurant-name">Name:</label>
      <input type="text" id="edit-restaurant-name" value="${restaurant.restaurantName}" disabled>
  
      <label for="edit-order-receive-email">Order Receive Email:</label>
      <input type="text" id="edit-order-receive-email" value="${restaurant.orderReceiveEmail}">
  
      <label for="edit-phone-number">Phone Number:</label>
      <input type="text" id="edit-phone-number" value="${restaurant.phoneNumber}">
  
      <h4>Edit Menu Items</h4>
      <div id="menu-items-container">
        <!-- Menu items will be dynamically populated here -->
      </div>
  
      <label for="edit-restaurant-image">Restaurant Image:</label>
      <input type="file" id="edit-restaurant-image">
  
      <button class="save-btn">Save</button>
      <button class="cancel-btn">Cancel</button>
    </div>
      `;

    // Attach event listeners to the save and cancel buttons
    const saveBtn = editPanel.querySelector('.save-btn');
    const cancelBtn = editPanel.querySelector('.cancel-btn');
    saveBtn.addEventListener('click', () => saveEditedRestaurant(restaurant, editPanel));
    cancelBtn.addEventListener('click', () => closeEditPanel(editPanel));

    // Populate the menu items in the edit panel
    const menuItemsContainer = editPanel.querySelector('#menu-items-container');
    menuItemsContainer.innerHTML = ''; // Clear previous content
    for (const [itemName, itemPrice] of Object.entries(restaurant.menuItems)) {
      const menuItemDiv = document.createElement('div');
      menuItemDiv.innerHTML = `
        <label for="edit-menu-item-name-${itemName}">Menu Item Name:
        <input type="text" id="edit-menu-item-name-${itemName}" value="${itemName}">
        <input type="text" id="edit-menu-item-price-${itemName}" value="${itemPrice}">
        </label>
      `;
      menuItemsContainer.appendChild(menuItemDiv);
    }

    // Show the edit panel
    const restaurantDiv = document.getElementById('owned-restaurants-container');
    restaurantDiv.appendChild(editPanel);
  }

  async function saveEditedRestaurant(restaurant, editPanel) {
    const editedName = document.getElementById('edit-restaurant-name').value;
    const editedOrderReceiveEmail = document.getElementById('edit-order-receive-email').value;
    const editedPhoneNumber = document.getElementById('edit-phone-number').value;

    // Update the restaurant object with the edited data
    restaurant.name = editedName;
    restaurant.orderReceiveEmail = editedOrderReceiveEmail;
    restaurant.phoneNumber = editedPhoneNumber;

    // Update the menu items in the restaurant object
    const menuItemsContainer = editPanel.querySelector('#menu-items-container');
    const editedMenuItems = {};
    const menuItemDivs = menuItemsContainer.querySelectorAll('div'); // Select all the divs inside the container
    menuItemDivs.forEach((menuItemDiv) => {
      const itemNameInput = menuItemDiv.querySelector('input[type="text"][id^="edit-menu-item-name-"]');
      const itemPriceInput = menuItemDiv.querySelector('input[type="text"][id^="edit-menu-item-price-"]');
      const itemName = itemNameInput.value;
      const itemPrice = itemPriceInput.value;
      editedMenuItems[itemName] = itemPrice;
    });
    restaurant.menuItems = editedMenuItems;

    // Update the restaurant data on the server
    try {
      await updateRestaurantOnServer(restaurant);

      // Close the edit panel
      closeEditPanel(editPanel);

      // Refresh the owned restaurants container to reflect the changes
      populateOwnedRestaurants(selectRestaurantDropdown.value);
    } catch (error) {
      console.error('Error updating restaurant data:', error);
      // Handle error if the update fails
    }
  }

  // Function to close the edit panel
  function closeEditPanel(editPanel) {
    editPanel.remove();
  }
  async function deleteRestaurant(area, restaurantName) {
    showLoadingScreen();

    const formData = new FormData();
    formData.append("area", area);
    formData.append("restaurantName", restaurantName);
    formData.append("email", userEmail); // Assuming you have defined userEmail earlier

    try {
      // Delete from the server
      const serverResponse = await fetch('/deleteRestaurant', {
        method: 'POST',
        body: formData,
      });
      const serverResult = await serverResponse.json();
      console.log('Restaurant deleted on the server:', serverResult);

      // Delete from the database
      try {
        const dbResponse = await fetch('/deleteRestaurantDatabase', {
          method: 'POST',
          body: formData,
        });
        const dbResult = await dbResponse.json();
        console.log('Restaurant deleted from the Database:', dbResult);

        showLoadingScreenWithMessage("Restaurant successfully deleted, please refresh the page...");
      } catch (dbError) {
        console.error('Error deleting restaurant from the Database:', dbError);
        hideLoadingScreen();
        throw dbError;
      }
    } catch (serverError) {
      console.error('Error deleting restaurant from the server:', serverError);
      hideLoadingScreen();
      throw serverError;
    }
  }

  // Function to update the restaurant data on the server
  async function updateRestaurantOnServer(restaurant) {
    const formData = new FormData();
    formData.append('area', restaurant.area);
    formData.append('restaurantName', restaurant.name);
    formData.append('orderReceiveEmail', restaurant.orderReceiveEmail);
    formData.append('phoneNumber', restaurant.phoneNumber);
    formData.append("menu", JSON.stringify(restaurant.menuItems));
    // Append other fields to the formData as needed for menu items, etc.
    formData.append('restaurantImage', document.getElementById('edit-restaurant-image').files[0]);

    try {
      showLoadingScreen();
      const response = await fetch('/editRestaurant', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Restaurant updated on the server:', result);
    } catch (error) {
      console.error('Error updating restaurant on the server:', error);
      hideLoadingScreen();
      throw error;
    }
  }
  
  

  populateAreaDropdown();
});

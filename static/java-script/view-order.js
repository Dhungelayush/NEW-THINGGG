fetch("/static/area.json")
.then(response => response.json())
.then(data => {
  const areaDropdown = document.getElementById("area");
  const areas = data.areas;

  areas.forEach(area => {
    const option = document.createElement("option");
    option.value = area;
    option.textContent = area;
    areaDropdown.appendChild(option);
  });
})
.catch(error => {
  console.log("Error fetching areas:", error);
});

document.getElementById("orderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const orderNumber = document.getElementById("orderNumber").value;
    const area = document.getElementById("area").value; // Get the selected area
  
    fetch(`/getOrderDetails/${area}/${orderNumber}`) // Add the selected area to the URL
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          document.getElementById("restaurantName").textContent =
            data.restaurantName;
  
          const itemsList = document.getElementById("itemsList");
          itemsList.innerHTML = "";
          data.orderDetails.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${item.itemName} - ${item.itemPrice}`;
            itemsList.appendChild(listItem);
          });
  
          document.getElementById("orderStatus").textContent =
            data.orderStatus;
  
          // Show the order details section
          const orderDetails = document.getElementById("orderDetails");
          orderDetails.classList.add("active");
        }
      })
      .catch((error) => {
        console.error("Error fetching order details:", error);
        alert("Error fetching order details. Please try again.");
      });
  });
  
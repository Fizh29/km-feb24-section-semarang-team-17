document.addEventListener("DOMContentLoaded", function () {
  let dataTable;
  let revenueByCategoryChart;
  let revenueByMonthChart;
  let revenueByLocationChart;
  let revenueByProductDetailChart; // New chart for Revenue by Product Detail
  let originalData; // Data as fetched

  // Fetch the transactions data
  fetch("transactions.json")
    .then((response) => response.json())
    .then((data) => {
      originalData = data; // Store the original data

      // Initialize DataTables
      dataTable = $("#transaction-table-dt").DataTable({
        data: data,
        columns: [
          { data: "product_category", title: "Product Category" },
          { data: "product_detail", title: "Product Detail" },
          { data: "unit_price", title: "Price" },
          { data: "transaction_qty", title: "Total Sales" },
          { data: "transaction_date", title: "Transaction Date" },
        ],
      });
      $("#transaction-table-dt").show();
      $("#loading-transaction-table").hide();

      // Prepare data for charts
      const revenueByCategoryData = processRevenueByCategoryData(data);
      const revenueByMonthData = processRevenueByMonthData(data);
      const revenueByLocationData = processRevenueByLocationData(data);
      const revenueByProductDetailData = processRevenueByProductDetailData(data); // New data for Revenue by Product Detail

      // Bar chart configuration for Revenue by Product Category
      const ctxRevenueByCategory = document
        .getElementById("revenue-by-category-chart")
        .getContext("2d");
      revenueByCategoryChart = new Chart(ctxRevenueByCategory, {
        type: "bar",
        data: revenueByCategoryData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      $("#revenue-by-category-chart").show();
      $("#loading-category-chart").hide();

      // Line chart configuration for Revenue by Month
      const ctxRevenueByMonth = document
        .getElementById("revenue-by-month-chart")
        .getContext("2d");
      revenueByMonthChart = new Chart(ctxRevenueByMonth, {
        type: "line",
        data: revenueByMonthData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      $("#revenue-by-month-chart").show();
      $("#loading-month-chart").hide();

      // Pie chart configuration for Revenue by Location
      const ctxRevenueByLocation = document
        .getElementById("revenue-by-location-chart")
        .getContext("2d");
      revenueByLocationChart = new Chart(ctxRevenueByLocation, {
        type: "pie",
        data: revenueByLocationData,
        options: {
          responsive: true,
        },
      });
      $("#revenue-by-location-chart").show();
      $("#loading-location-chart").hide();

      // Bar chart configuration for Revenue by Product Detail
      const ctxRevenueByProductDetail = document
        .getElementById("revenue-by-product-detail-chart")
        .getContext("2d");
      revenueByProductDetailChart = new Chart(ctxRevenueByProductDetail, {
        type: "bar",
        data: revenueByProductDetailData,
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true,
            },
            
          },
          
        },
      });
      $("#revenue-by-product-detail-chart").show(); // Show the new chart
      $("#loading-product-detail-chart").hide(); // Hide loading indicator
    })

    .catch((error) =>
      console.error("Error fetching transactions data:", error)
    );

  // Function to update charts based on filters
  function updateCharts(filteredData) {
    // Update data for charts
    const revenueByCategoryData = processRevenueByCategoryData(filteredData);
    const revenueByMonthData = processRevenueByMonthData(filteredData);
    const revenueByLocationData = processRevenueByLocationData(filteredData);
    const revenueByProductDetailData = processRevenueByProductDetailData(filteredData); // Update data for Revenue by Product Detail

    // Update chart data
    revenueByCategoryChart.data = revenueByCategoryData;
    revenueByMonthChart.data = revenueByMonthData;
    revenueByLocationChart.data = revenueByLocationData;
    revenueByProductDetailChart.data = revenueByProductDetailData; // Update chart data for Revenue by Product Detail

    // Redraw charts
    revenueByCategoryChart.update();
    revenueByMonthChart.update();
    revenueByLocationChart.update();
    revenueByProductDetailChart.update(); // Redraw chart for Revenue by Product Detail
  }

  // Function to filter data based on selected options
  function filterData() {
    let filteredData = [...originalData]; // Copy original data

    const selectedCategory = $("#product-category-select").val();
    const selectedLocation = $("#store-location-select").val();
    const selectedMonth = $("#transaction-month-select").val();

    // Filter data based on selected category
    if (selectedCategory !== "all") {
      filteredData = filteredData.filter(
        (item) => item.product_category === selectedCategory
      );
    }

    // Filter data based on selected location
    if (selectedLocation !== "all") {
      filteredData = filteredData.filter(
        (item) => item.store_location === selectedLocation
      );
    }

    // Filter data based on selected month
    if (selectedMonth !== "all") {
      const selectedMonthIndex = parseInt(selectedMonth.split("-")[1]); // Correctly parse month index
      filteredData = filteredData.filter((item) => {
        const transactionMonth = new Date(item.transaction_date).getMonth() + 1;
        return transactionMonth === selectedMonthIndex;
      });
    }

    // Update DataTable
    dataTable.clear().rows.add(filteredData).draw();

    // Update charts
    updateCharts(filteredData);
  }

  // Event listeners for filter changes
  $("#product-category-select").change(filterData);
  $("#store-location-select").change(filterData);
  $("#transaction-month-select").change(filterData);

  // Function to process revenue data by category
  function processRevenueByCategoryData(data) {
    const categoryRevenue = {};
    data.forEach((transaction) => {
      const category = transaction.product_category;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      if (!categoryRevenue[category]) {
        categoryRevenue[category] = 0;
      }
      categoryRevenue[category] += revenue;
    });

    // Sort by revenue in descending order
    const sortedCategories = Object.keys(categoryRevenue).sort(
      (a, b) => categoryRevenue[b] - categoryRevenue[a]
    );

    return {
      labels: sortedCategories,
      datasets: [
        {
          label: "Revenue",
          data: sortedCategories.map((category) => categoryRevenue[category]),
          backgroundColor: sortedCategories.map(getRandomColor),
          borderColor: sortedCategories.map(getRandomColor),
          borderWidth: 1,
        },
      ],
    };
  }

  // Function to process revenue data by month
  function processRevenueByMonthData(data) {
    const monthRevenue = {};
    data.forEach((transaction) => {
      const month = new Date(transaction.transaction_date).toLocaleString("default", { month: "long" });
      const revenue = transaction.unit_price * transaction.transaction_qty;
      if (!monthRevenue[month]) {
        monthRevenue[month] = 0;
      }
      monthRevenue[month] += revenue;
    });

    // Manually define the order of months starting from January
    const sortedMonths = ["January", "February", "March", "April", "May", "June"];

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Revenue",
          data: sortedMonths.map((month) => monthRevenue[month] || 0),
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    };
  }

  // Function to process revenue data by location
  function processRevenueByLocationData(data) {
    const locationRevenue = {};
    data.forEach((transaction) => {
      const location = transaction.store_location;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      if (!locationRevenue[location]) {
        locationRevenue[location] = 0;
      }
      locationRevenue[location] += revenue;
    });

    return {
      labels: Object.keys(locationRevenue),
      datasets: [
        {
          label: "Revenue",
          data: Object.values(locationRevenue),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  // Function to process revenue data by product detail
  function processRevenueByProductDetailData(data) {
    const productDetailRevenue = {};
    data.forEach((transaction) => {
      const productDetail = transaction.product_detail;
      const revenue = transaction.unit_price * transaction.transaction_qty;
      if (!productDetailRevenue[productDetail]) {
        productDetailRevenue[productDetail] = 0;
      }
      productDetailRevenue[productDetail] += revenue;
    });

    // Sort by revenue in descending order
    const sortedProductDetails = Object.keys(productDetailRevenue).sort(
      (a, b) => productDetailRevenue[b] - productDetailRevenue[a]
    );

    return {
      labels: sortedProductDetails,
      datasets: [
        {
          label: "Revenue",
          data: sortedProductDetails.map(
            (productDetail) => productDetailRevenue[productDetail]
          ),
          backgroundColor: sortedProductDetails.map(getRandomColor),
          borderColor: sortedProductDetails.map(getRandomColor),
          borderWidth: 1,
        },
      ],
    };
  }

  // Function to generate random colors
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
});
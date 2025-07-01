export async function sendOrderToSupplier(orderData: any): Promise<any> {
  // Test Supplier API endpoint
  const url = "https://jsi.kitchen365test.com/index.php/rest/V1/jsimiddleware";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers here if needed, e.g. 'Authorization': 'Bearer ...'
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supplier API error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Log or handle error as needed
    throw error;
  }
} 
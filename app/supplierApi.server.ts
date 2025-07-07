export async function sendOrderToSupplier(orderData: any): Promise<any> {
  // Test Supplier API endpoint
  const url = "https://jsi.kitchen365test.com/index.php/rest/V1/jsimiddleware/pushorder";
  const AUTH_TOKEN = process.env.SUPPLIER_API_TOKEN;
  if (!AUTH_TOKEN) {
    throw new Error("Supplier API token is not set in environment variables.");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(orderData),
    });

    const contentType = response.headers.get("content-type");
    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Supplier API error: ${response.status} ${rawText}`);
    }

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON, got: ${rawText}`);
    }

    return JSON.parse(rawText);
  } catch (error) {
    // Log or handle error as needed
    throw error;
  }
} 
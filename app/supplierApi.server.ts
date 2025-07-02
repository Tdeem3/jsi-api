export async function sendOrderToSupplier(orderData: any): Promise<any> {
  // Test Supplier API endpoint
  const url = "https://jsi.kitchen365test.com/index.php/rest/V1/jsimiddleware/pushorder";
  const AUTH_TOKEN = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjM1MDIsInV0eXBpZCI6MywiaWF0IjoxNzUxNDY1NTAwLCJleHAiOjIwNjcwNDE1MDB9.0a-atU8JS5M0MVQFRgJ9JVQ5gaPIAcv-mJu93-ahm5E";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AUTH_TOKEN}`,
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
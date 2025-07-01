import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { sendOrderToSupplier } from "../supplierApi.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const orderData = await request.json();
    const supplierResponse = await sendOrderToSupplier(orderData);
    return json({ success: true, supplierResponse });
  } catch (error: any) {
    return json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
}; 
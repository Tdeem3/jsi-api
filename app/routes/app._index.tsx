import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

const TEST_ORDER = {
  po_name: "PO Name",
  shipping_type: "pickup",
  ship_pickup_date: "2025-03-08T00:00:00",
  warehouse_code: 1,
  additional_details: {
    shipping_notes: "test",
    reference: "test",
    cc_email: "test",
    residential: 0,
    delivery_appointment: 0,
    liftgate: 0,
    sales_representative: "test",
    email: "test",
    coupon_code: ""
  },
  billingAddress: {
    region_code: "CA",
    firstname: "test",
    lastname: "test",
    company: "test",
    street: "test",
    postcode: "test",
    city: "test",
    email: "test",
    telephone: "test",
    country_id: "US"
  },
  shippingAddress: {
    region_code: "CA",
    firstname: "test",
    lastname: "test",
    company: "test",
    street: "test",
    postcode: "test",
    city: "test",
    email: "test@k.com",
    telephone: "test",
    country_id: "US"
  },
  orderItems: [
    {
      sku: "KD-B12",
      qty: 1,
      is_assembled: 0,
      accessories_codes: [],
      modification_codes: []
    },
    {
      sku: "KD-B12",
      qty: 1,
      is_assembled: 1,
      accessories_codes: ["STRY"],
      modification_codes: [],
      hinge: "L",
      finish_end: "B"
    }
  ]
};

export default function AppIndex() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTestOrder = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(TEST_ORDER),
      });
      const contentType = res.headers.get("content-type");
      const rawText = await res.text();

      if (!res.ok) {
        throw new Error(`Supplier API error: ${res.status} ${rawText}`);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON, got: ${rawText}`);
      }

      const data = JSON.parse(rawText);
      setResponse(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <Page title="Send Test Order to JSI">
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Send Test Order
            </Text>
            <Button onClick={sendTestOrder} loading={loading}>
              Send Test Order
            </Button>
            {error && <Text as="span" tone="critical">Error: {error}</Text>}
            {response && (
              <Box padding="400" background="bg-surface-active" borderWidth="025" borderRadius="200" borderColor="border" overflowX="scroll">
                <Text as="h3" variant="headingMd">Supplier API Response:</Text>
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </Box>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

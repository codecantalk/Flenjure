import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Column,
  Row,
} from '@react-email/components';

interface OrderReceiptProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ title: string; quantity: number; price: number; image?: string | null }>;
  shippingAddress?: {
    fullName?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
}

export const OrderReceipt = ({
  orderId,
  customerName,
  totalAmount,
  items,
  shippingAddress,
}: OrderReceiptProps) => (
  <Html>
    <Head />
    <Preview>Your Flenjure Order Receipt #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>FLEÑJURE</Text>
        </Section>
        <Section style={content}>
          <Text style={greeting}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for shopping with Flenjure! We're getting your order ready to be shipped. We will notify you when it has been sent.
          </Text>

          <Hr style={hr} />
          
          <Heading as="h2" style={subheading}>Order Summary (#{orderId})</Heading>
          
          <Section style={{ marginTop: '24px' }}>
            {items.map((item, index) => (
              <Row key={index} style={{ marginBottom: '16px' }}>
                <Column style={{ width: '64px' }}>
                  {item.image ? (
                    <Img
                      src={item.image}
                      width="64"
                      height="64"
                      style={productImage}
                      alt={item.title}
                    />
                  ) : (
                    <div style={productImagePlaceholder} />
                  )}
                </Column>
                <Column style={{ paddingLeft: '16px', verticalAlign: 'middle' }}>
                  <Text style={productTitle}>{item.title}</Text>
                  <Text style={productQuantity}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <Text style={productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}
          </Section>
          
          <Hr style={hr} />
          
          <table style={table} width="100%">
            <tr>
              <td style={tdLeftBold}>Total</td>
              <td style={tdRightBold}>${totalAmount.toFixed(2)} USD</td>
            </tr>
          </table>

          {shippingAddress && (
            <>
              <Hr style={hr} />
              <Heading as="h3" style={subheading}>Shipping Details</Heading>
              <Text style={paragraph}>
                {shippingAddress.fullName && <>{shippingAddress.fullName}<br /></>}
                {shippingAddress.addressLine1 && <>{shippingAddress.addressLine1}<br /></>}
                {shippingAddress.addressLine2 && <>{shippingAddress.addressLine2}<br /></>}
                {[shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', ')}<br />
                {shippingAddress.country}
              </Text>
            </>
          )}

          <Hr style={hr} />
          
          <Text style={footerText}>
            If you have any questions, reply to this email or contact us at support@flenjure.com.
          </Text>
          <Text style={footerText}>
            Flenjure — Enjoy life! On ne vit qu'une fois.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderReceipt;

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '0px 0px 48px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #e4e4e7',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#18181b',
  padding: '32px 48px',
  textAlign: 'center' as const,
};

const logoText = {
  fontSize: '24px',
  letterSpacing: '6px',
  fontWeight: '300',
  color: '#ffffff',
  margin: '0',
};

const content = {
  padding: '32px 48px 0',
};

const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
  fontWeight: '600',
  color: '#18181b',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '26px',
  color: '#52525b',
};

const subheading = {
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  fontWeight: '600',
  color: '#71717a',
  marginTop: '24px',
  marginBottom: '0',
};

const productImage = {
  borderRadius: '4px',
  objectFit: 'cover' as const,
};

const productImagePlaceholder = {
  width: '64px',
  height: '64px',
  backgroundColor: '#f4f4f5',
  borderRadius: '4px',
};

const productTitle = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#18181b',
  margin: '0 0 4px',
};

const productQuantity = {
  fontSize: '13px',
  color: '#71717a',
  margin: '0',
};

const productPrice = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#18181b',
  margin: '0',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const tdLeftBold = {
  padding: '12px 0',
  color: '#18181b',
  fontSize: '16px',
  fontWeight: 'bold',
};

const tdRightBold = {
  padding: '12px 0',
  color: '#18181b',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#a1a1aa',
  textAlign: 'center' as const,
};

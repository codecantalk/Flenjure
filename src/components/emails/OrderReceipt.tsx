import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OrderReceiptProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ title: string; quantity: number; price: number }>;
}

export const OrderReceipt = ({
  orderId,
  customerName,
  totalAmount,
  items,
}: OrderReceiptProps) => (
  <Html>
    <Head />
    <Preview>Your Flenjure Order Receipt #{orderId}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={heading}>FLEÑJURE</Heading>
        </Section>
        <Section style={content}>
          <Text style={greeting}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Thank you for shopping with Flenjure! We're getting your order ready to be shipped. We will notify you when it has been sent.
          </Text>

          <Hr style={hr} />
          
          <Heading as="h2" style={subheading}>Order Summary (#{orderId})</Heading>
          
          <table style={table} width="100%">
            {items.map((item, index) => (
              <tr key={index}>
                <td style={tdLeft}>
                  {item.quantity}x {item.title}
                </td>
                <td style={tdRight}>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </table>
          
          <Hr style={hr} />
          
          <table style={table} width="100%">
            <tr>
              <td style={tdLeftBold}>Total</td>
              <td style={tdRightBold}>${totalAmount.toFixed(2)} USD</td>
            </tr>
          </table>

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
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '0 48px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '24px',
  letterSpacing: '4px',
  fontWeight: '300',
  color: '#18261e',
};

const content = {
  padding: '0 48px',
};

const greeting = {
  fontSize: '18px',
  lineHeight: '28px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525f7f',
};

const subheading = {
  fontSize: '18px',
  fontWeight: '500',
  color: '#323232',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const tdLeft = {
  padding: '8px 0',
  color: '#525f7f',
  fontSize: '14px',
};

const tdRight = {
  padding: '8px 0',
  color: '#525f7f',
  fontSize: '14px',
  textAlign: 'right' as const,
};

const tdLeftBold = {
  padding: '12px 0',
  color: '#323232',
  fontSize: '16px',
  fontWeight: 'bold',
};

const tdRightBold = {
  padding: '12px 0',
  color: '#323232',
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#8898aa',
};

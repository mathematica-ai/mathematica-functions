import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Preview,
  Heading,
  Img,
} from '@react-email/components';

interface MagicLinkTemplateProps {
  url: string;
  host?: string;
}

export const MagicLinkTemplate = ({
  url,
  host = "Mathematica Functions",
}: MagicLinkTemplateProps) => {
  // Ensure the URL is properly encoded
  const safeUrl = encodeURI(decodeURI(url));
  
  return (
    <Html>
      <Head />
      <Preview>Sign in to {host}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Img
              src="https://mathematica-functions.s3.eu-west-3.amazonaws.com/logo.png"
              width="42"
              height="42"
              alt="Mathematica"
              style={logo}
            />
            
            <Heading style={heading}>Sign in to {host}</Heading>
            <Text style={paragraph}>
              Welcome back! Click the button below to securely sign in to your account.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={safeUrl} target="_blank" style={button}>
                Sign in to {host}
              </Link>
            </Section>

            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
              <br />
              <Link href={safeUrl} target="_blank" style={link}>
                {safeUrl}
              </Link>
            </Text>

            <Text style={paragraph}>
              If you didn't request this email, you can safely ignore it.
            </Text>

            <Text style={paragraph}>
              This link will expire in 24 hours and can only be used once.
            </Text>

            <Text style={footer}>
              © {new Date().getFullYear()} {host}. All rights reserved.
              <br />
              Secure sign-in powered by Mathematica
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkTemplate;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
  width: '100%',
};

const content = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '40px',
};

const logo = {
  margin: '0 auto 24px',
  display: 'block',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 auto',
};

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const footer = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#898989',
  textAlign: 'center' as const,
  margin: '48px 0 0',
}; 
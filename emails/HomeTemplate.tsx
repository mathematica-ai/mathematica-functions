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
} from '@react-email/components';

interface HomeTemplateProps {
  title: string;
  description: string;
  slices?: any[];
}

export const HomeTemplate = ({
  title = "Mathematica Functions",
  description = "Your AI-powered assistant for mathematical computations and insights",
  slices = [],
}: HomeTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>{description}</Text>
            
            {slices?.map((slice, index) => {
              // Handle different slice types
              switch (slice.slice_type) {
                case 'text':
                  return (
                    <Text key={index} style={paragraph}>
                      {slice.primary.text}
                    </Text>
                  );
                case 'link':
                  return (
                    <Link
                      key={index}
                      href={slice.primary.url}
                      style={link}
                    >
                      {slice.primary.text}
                    </Link>
                  );
                default:
                  return null;
              }
            })}

            <Text style={footer}>
              © {new Date().getFullYear()} Mathematica. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default HomeTemplate;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const content = {
  padding: '0 24px',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#484848',
};

const link = {
  ...paragraph,
  color: '#2754C5',
  textDecoration: 'underline',
};

const footer = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#898989',
  marginTop: '32px',
  fontWeight: '400',
}; 
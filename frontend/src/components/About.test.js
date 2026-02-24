import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

describe('About Component', () => {
  it('renders the main heading "About Contoso Traders"', () => {
    render(<About />);
    const heading = screen.getByRole('heading', { name: /about contoso traders/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-5xl', 'sm:text-6xl', 'font-bold');
  });

  it('displays the tagline "Secure Commerce, Built Right"', () => {
    render(<About />);
    const tagline = screen.getByText(/secure commerce, built right/i);
    expect(tagline).toBeInTheDocument();
  });

  it('displays the mission statement section', () => {
    render(<About />);
    const missionHeading = screen.getByRole('heading', { name: /our mission/i });
    expect(missionHeading).toBeInTheDocument();

    const missionText = screen.getByText(
      /at contoso traders, we're committed to delivering secure, reliable e-commerce solutions/i
    );
    expect(missionText).toBeInTheDocument();
  });

  it('contains the contact email address', () => {
    render(<About />);
    const emailLinks = screen.getAllByText(/support@contoso-traders\.com/i);
    expect(emailLinks.length).toBeGreaterThan(0);

    const emailLink = emailLinks[0];
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:support@contoso-traders.com');
  });

  it('renders the "DevSecOps Excellence" section with all pillars', () => {
    render(<About />);
    const devsecopsHeading = screen.getByRole('heading', { name: /devsecops excellence/i });
    expect(devsecopsHeading).toBeInTheDocument();

    // Check for all DevSecOps pillars
    expect(screen.getByText(/security first/i)).toBeInTheDocument();
    expect(screen.getByText(/continuous integration/i)).toBeInTheDocument();
    expect(screen.getByText(/compliance/i)).toBeInTheDocument();
    expect(screen.getByText(/monitoring/i)).toBeInTheDocument();
  });

  it('displays statistics section with correct values', () => {
    render(<About />);
    const statsHeading = screen.getByRole('heading', { name: /by the numbers/i });
    expect(statsHeading).toBeInTheDocument();

    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('5K+')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('99.99%')).toBeInTheDocument();
  });

  it('renders the call-to-action section', () => {
    render(<About />);
    const ctaHeading = screen.getByRole('heading', { name: /ready to transform your commerce/i });
    expect(ctaHeading).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /contact support email/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', 'mailto:support@contoso-traders.com');
  });

  it('renders the questions section with contact email', () => {
    render(<About />);
    const questionsHeading = screen.getByRole('heading', { name: /questions or feedback/i });
    expect(questionsHeading).toBeInTheDocument();

    const contactText = screen.getByText(/we'd love to hear from you/i);
    expect(contactText).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<About />);

    // Check for main element
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Check for sections with aria-labelledby
    const sections = screen.getAllByRole('region');
    expect(sections.length).toBeGreaterThan(0);
  });

  it('renders all pillar descriptions correctly', () => {
    render(<About />);

    expect(screen.getByText(/security integrated into every stage of development/i)).toBeInTheDocument();
    expect(screen.getByText(/automated testing and deployment pipelines/i)).toBeInTheDocument();
    expect(screen.getByText(/meeting industry standards and regulations/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7 real-time threat detection and response/i)).toBeInTheDocument();
  });

  it('renders multiple email links for contact', () => {
    render(<About />);
    const emailLinks = screen.getAllByText(/support@contoso-traders\.com/i);

    // Should have at least 1 visible email link
    expect(emailLinks.length).toBeGreaterThanOrEqual(1);

    emailLinks.forEach((link) => {
      expect(link.closest('a')).toHaveAttribute('href', 'mailto:support@contoso-traders.com');
    });
  });

  it('renders with proper semantic HTML structure', () => {
    render(<About />);

    // Check main element
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check for multiple sections
    const sections = screen.getAllByRole('region');
    expect(sections.length).toBeGreaterThan(0);

    // Check for headings hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();

    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThan(0);
  });
});

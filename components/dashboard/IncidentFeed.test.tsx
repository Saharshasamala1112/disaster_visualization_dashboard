import { render, screen } from '@testing-library/react';
import { IncidentFeed } from '@/components/dashboard/IncidentFeed';
import type { IncidentFeedItem } from '@/lib/realtime/mock-pipeline';

function makeIncident(overrides: Partial<IncidentFeedItem> = {}): IncidentFeedItem {
  return {
    id: '1',
    title: 'Flood Alert Sector 7',
    location: 'Mumbai',
    summary: 'Water level rising rapidly in low-lying sectors.',
    sentiment: 'warning',
    confidence: 84,
    source: 'official',
    media: 'text',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('IncidentFeed', () => {
  it('renders empty-state message when no incidents are provided', () => {
    render(<IncidentFeed incidents={[]} updatedAt="" freshness="offline" />);

    expect(screen.getByText(/Incident stream unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it('renders incident cards with confidence and sentiment', () => {
    render(
      <IncidentFeed
        incidents={[makeIncident({ sentiment: 'critical', confidence: 91 })]}
        updatedAt={new Date().toISOString()}
        freshness="live"
      />,
    );

    expect(screen.getByText('Flood Alert Sector 7')).toBeInTheDocument();
    expect(screen.getByText(/Confidence 91%/i)).toBeInTheDocument();
    expect(screen.getByText(/critical/i)).toBeInTheDocument();
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });
});

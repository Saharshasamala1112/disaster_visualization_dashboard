import { render, screen } from '@testing-library/react';
import LiveMap from '@/components/dashboard/LiveMap';

const mockMap = {
  remove: vi.fn(),
  fitBounds: vi.fn(),
};

const mockLayerGroup = {
  addTo: vi.fn(() => mockLayerGroup),
  clearLayers: vi.fn(),
};

const mockMarkerChain = {
  bindPopup: vi.fn(() => mockMarkerChain),
  addTo: vi.fn(() => mockMarkerChain),
  openPopup: vi.fn(() => mockMarkerChain),
};

vi.mock('leaflet', () => {
  return {
    default: {},
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
    map: vi.fn(() => mockMap),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    layerGroup: vi.fn(() => mockLayerGroup),
    latLngBounds: vi.fn(() => ({
      extend: vi.fn(),
      pad: vi.fn(() => ({})),
    })),
    circle: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => mockMarkerChain),
    divIcon: vi.fn(() => ({})),
  };
});

describe('LiveMap', () => {
  it('renders map title and legend text', async () => {
    render(
      <LiveMap
        title="Real-time Disaster Monitoring"
        subTitle="Updated just now"
        heatPoints={[{ lat: 19.1, lng: 72.8, intensity: 0.9, label: 'Critical hotspot' }]}
      />,
    );

    expect(screen.getByText(/Real-time Disaster Monitoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk Scale/i)).toBeInTheDocument();
    expect(screen.getByText(/Pulse speed = urgency/i)).toBeInTheDocument();
  });
});

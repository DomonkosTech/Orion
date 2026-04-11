import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ListJobs from '../ListJobs';
import * as adApi from '../../../../../Api/advertisementApi';

// Mock the API calls
vi.mock('../../../../../Api/advertisementApi', () => ({
  getAdvertisements: vi.fn(),
  OrionAI: vi.fn(),
}));

// Mock userApi for favorites
vi.mock('../../../../../Api/userApi', () => ({
  getFavorites: vi.fn().mockResolvedValue([]),
}));

describe('ListJobs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ListJobs />
      </BrowserRouter>
    );
  };

  it('should load and display standard jobs on mount', async () => {
    (adApi.getAdvertisements as any).mockResolvedValue({
      success: true,
      advertisements: [
        { id: 1, title: 'Job 1', position: 'Pos 1', location: 'Loc 1', hourly_wage: 3000 },
      ],
      totalCount: 1
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Job 1')).toBeInTheDocument();
      expect(screen.getByText(/Loc 1/)).toBeInTheDocument();
    });
  });

  it('should switch to AI search when toggled and submitted', async () => {
    (adApi.getAdvertisements as any).mockResolvedValue({ success: true, advertisements: [], totalCount: 0 });
    (adApi.OrionAI as any).mockResolvedValue({
      success: true,
      data: [{ id: 101, title: 'AI Job', position: 'AI Pos', location: 'Remote', hourly_wage: 5000 }]
    });

    renderComponent();

    // Find the AI toggle in FilterBar (need to check FilterBar structure or just test button)
    const aiToggle = screen.getByTestId('ai-toggle');
    fireEvent.click(aiToggle);

    const searchBtn = screen.getByTestId('search-submit');
    fireEvent.click(searchBtn);

    await waitFor(() => {
      expect(adApi.OrionAI).toHaveBeenCalled();
      expect(screen.getByText('AI Job')).toBeInTheDocument();
    });
  });

  it('should trigger search automatically after debouncing when typing', async () => {
    (adApi.getAdvertisements as any).mockResolvedValue({ success: true, advertisements: [], totalCount: 0 });

    renderComponent();

    // Wait for initial fetch on mount
    await waitFor(() => expect(adApi.getAdvertisements).toHaveBeenCalledTimes(1));

    vi.useFakeTimers();

    // The i18n mock returns the key directly, so the placeholder is the i18n key
    const searchInput = screen.getByPlaceholderText('jobs.list.ai.inputPlaceholderDefault');
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // Should not have triggered another fetch immediately
    expect(adApi.getAdvertisements).toHaveBeenCalledTimes(1);

    // Advance time past the 500ms debounce delay, wrapped in act() to flush React state updates
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now it should have been called a second time
    expect(adApi.getAdvertisements).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

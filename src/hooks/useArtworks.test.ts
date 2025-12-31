import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase before importing the hook
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { useArtworks, useArtwork } from './useArtworks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useArtworks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
  });

  it('should fetch artworks successfully', async () => {
    const mockArtworks = [
      { id: '1', title: 'Artwork 1', display_order: 1 },
      { id: '2', title: 'Artwork 2', display_order: 2 },
    ];

    mockOrder.mockResolvedValue({ data: mockArtworks, error: null });

    const { result } = renderHook(() => useArtworks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArtworks);
    expect(mockFrom).toHaveBeenCalledWith('artworks');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('display_order', { ascending: true });
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Database error');
    mockOrder.mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useArtworks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(mockError);
  });

  it('should return empty array when no artworks exist', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useArtworks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});

describe('useArtwork', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
  });

  it('should fetch single artwork by id', async () => {
    const mockArtwork = { id: '1', title: 'Artwork 1' };
    mockSingle.mockResolvedValue({ data: mockArtwork, error: null });

    const { result } = renderHook(() => useArtwork('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArtwork);
    expect(mockFrom).toHaveBeenCalledWith('artworks');
    expect(mockEq).toHaveBeenCalledWith('id', '1');
  });

  it('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useArtwork(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should handle artwork not found', async () => {
    const mockError = new Error('Not found');
    mockSingle.mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useArtwork('999'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe(mockError);
  });
});

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CountryData, CityData } from '@/types';

export const useCountryDistribution = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['country-distribution', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<CountryData[]> => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('country, country_name, visitor_fingerprint, total_duration_seconds')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .not('country', 'is', null);

      if (!sessions || sessions.length === 0) return [];

      const countryMap = new Map<string, {
        country_name: string;
        visitors: Set<string>;
        sessions: number;
        totalDuration: number;
      }>();

      sessions.forEach(session => {
        const key = session.country!;
        if (!countryMap.has(key)) {
          countryMap.set(key, {
            country_name: session.country_name || key,
            visitors: new Set(),
            sessions: 0,
            totalDuration: 0,
          });
        }

        const data = countryMap.get(key)!;
        data.sessions++;
        if (session.visitor_fingerprint) {
          data.visitors.add(session.visitor_fingerprint);
        }
        data.totalDuration += session.total_duration_seconds || 0;
      });

      return Array.from(countryMap.entries())
        .map(([country, data]) => ({
          country,
          country_name: data.country_name,
          visitors: data.visitors.size,
          sessions: data.sessions,
          avg_duration: data.sessions > 0 ? Math.floor(data.totalDuration / data.sessions) : 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);
    },
  });
};

export const useCityDistribution = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['city-distribution', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<CityData[]> => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('city, country_name, visitor_fingerprint')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString())
        .not('city', 'is', null);

      if (!sessions || sessions.length === 0) return [];

      const cityMap = new Map<string, {
        country_name: string;
        visitors: Set<string>;
      }>();

      sessions.forEach(session => {
        const key = `${session.city}-${session.country_name}`;
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            country_name: session.country_name || 'Unknown',
            visitors: new Set(),
          });
        }

        if (session.visitor_fingerprint) {
          cityMap.get(key)!.visitors.add(session.visitor_fingerprint);
        }
      });

      return Array.from(cityMap.entries())
        .map(([key, data]) => ({
          city: key.split('-')[0],
          country_name: data.country_name,
          visitors: data.visitors.size,
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10);
    },
  });
};

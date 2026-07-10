import { useEffect, useState } from 'react';

const ENDPOINTS = {
  modules: '/data/modules.json',
  fields: '/data/fields.json',
  valueOptions: '/data/valueOptions.json',
  savedSearches: '/data/savedSearches.json',
  platforms: '/data/platforms.json',
  nav: '/data/nav.json',
  reportsCategories: '/data/reportsCategories.json',
  homeKpis: '/data/homeKpis.json',
  profileModuleAccess: '/data/profileModuleAccess.json',
  userProfile: '/data/userProfile.json',
  searchDefaults: '/data/searchDefaults.json',
  homeSearchTags: '/data/homeSearchTags.json',
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

// Fetches every app dataset from the static JSON API (public/data/*.json) once
// on mount. Nothing in the app reads hardcoded JS data modules — this hook is
// the single entry point that hydrates it all via HTTP.
export function useAppData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const entries = Object.entries(ENDPOINTS);
        const results = await Promise.all(entries.map(([, url]) => fetchJson(url)));
        if (cancelled) return;
        const next = {};
        entries.forEach(([key], i) => {
          next[key] = results[i];
        });
        setData(next);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading: !data && !error };
}

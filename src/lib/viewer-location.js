const LOCATION_URL = "https://ipwho.is/?fields=success,city,country_code";

export function formatViewerLocation(data) {
  if (!data || data.success !== true) return null;
  const country = typeof data.country_code === "string" ? data.country_code.trim().toUpperCase() : "";
  if (!/^[A-Z]{2}$/.test(country)) return null;
  const city = typeof data.city === "string" ? data.city.trim().slice(0, 60) : "";
  const displayCountry = country === "GB" ? "UK" : country;
  return city ? `${city}, ${displayCountry}` : displayCountry;
}

export async function lookupViewerLocation(fetcher = fetch) {
  try {
    const response = await fetcher(LOCATION_URL, { credentials: "omit", referrerPolicy: "no-referrer" });
    return response.ok ? formatViewerLocation(await response.json()) : null;
  } catch {
    return null;
  }
}

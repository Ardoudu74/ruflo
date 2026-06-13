const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY ?? '';
const BASE = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  tempC: number;
  feelsLikeC: number;
  description: string;
  icon: string;
  humidity: number;
  isBeachWeather: boolean;
  windKph: number;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  if (!API_KEY) return null;
  try {
    const r = await fetch(
      `${BASE}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${API_KEY}`
    );
    const j = await r.json();
    const tempC: number = j.main?.temp ?? 20;
    const windMps: number = j.wind?.speed ?? 0;
    return {
      tempC: Math.round(tempC),
      feelsLikeC: Math.round(j.main?.feels_like ?? tempC),
      description: j.weather?.[0]?.description ?? '',
      icon: j.weather?.[0]?.icon ?? '01d',
      humidity: j.main?.humidity ?? 50,
      isBeachWeather: tempC >= 24 && windMps < 7,
      windKph: Math.round(windMps * 3.6),
    };
  } catch {
    return null;
  }
}

export function weatherEmoji(icon: string): string {
  if (icon.startsWith('01')) return '☀️';
  if (icon.startsWith('02') || icon.startsWith('03')) return '⛅';
  if (icon.startsWith('04')) return '☁️';
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️';
  if (icon.startsWith('11')) return '⛈️';
  if (icon.startsWith('13')) return '❄️';
  return '🌙';
}

import { createClient } from '@libre-net-pe/qrapid-sdk';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function createQRapidClient(token: string) {
  return createClient({ token, baseUrl: API_BASE_URL });
}

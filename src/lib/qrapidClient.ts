import { createClient } from '@libre-net-pe/qrapid-sdk';

export function createQRapidClient(token: string) {
  return createClient({ token });
}

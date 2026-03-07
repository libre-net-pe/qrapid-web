import { createClient } from '@libre-net-pe/qrapid-sdk';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export function createQRapidClient(token: string) {
  const client = createClient({ token, baseUrl: API_BASE_URL });

  client.use({
    async onResponse({ request, schemaPath, response }) {
      // Exclude /me itself to prevent recursion
      if (schemaPath === '/me') return;
      if (response.status !== 401) return;

      const body = await response.clone().json().catch(() => null);
      if (body?.code !== 'user_not_provisioned') return;

      // Provision the account, then retry the original request once
      await client.GET('/me');
      const retryHeaders = new Headers(request.headers);
      retryHeaders.set('X-Provisioning-Retry', '1');
      return fetch(new Request(request, { headers: retryHeaders }));
    },
  });

  return client;
}

import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';

/**
 * /.well-known/security.txt (RFC 9116), generated at build time so the
 * Expires date always sits a year after the latest deploy.
 */
export const GET: APIRoute = async ({ site }) => {
  const { email } = (await getEntry('site', 'site'))!.data.links;
  const address = email.href?.replace(/^mailto:/, '') ?? email.label; // "[address]" until it is set
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${address}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: en',
    `Canonical: ${new URL('/.well-known/security.txt', site)}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

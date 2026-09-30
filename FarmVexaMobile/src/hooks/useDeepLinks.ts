import { useEffect } from 'react';
import { Linking } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';

/**
 * Deep link listener.
 * Supported schemes:
 *   farmvexa://invoice/:invoiceNumber
 *   https://farmvexa.pxxl.click/invoice/:invoiceNumber  (universal link)
 *   farmvexamobile://invoice/:invoiceNumber             (Expo default)
 */

const SUPPORTED_HOSTS = ['farmvexa.pxxl.click', 'farmvexaserver.pxxl.click'];
const SUPPORTED_SCHEMES = ['farmvexa:', 'farmvexamobile:', 'exp:'];
const INVOICE_PATH_REGEX = /^\/?invoice\/([A-Za-z0-9-]+)\/?$/;

function parseInvoiceFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Check scheme
    const schemeMatches =
      SUPPORTED_SCHEMES.some((s) => url.startsWith(s)) ||
      SUPPORTED_HOSTS.includes(parsed.hostname);

    if (!schemeMatches) return null;

    // Try pathname match
    const match = parsed.pathname.match(INVOICE_PATH_REGEX);
    if (match) return match[1];

    // Fallback: query param ?invoiceNumber=...
    const queryInvoice = parsed.searchParams.get('invoiceNumber');
    if (queryInvoice) return queryInvoice;

    return null;
  } catch {
    return null;
  }
}

export function useDeepLinks() {
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const invoiceNumber = parseInvoiceFromUrl(url);
      if (!invoiceNumber) return;

      // Wait for nav to be ready
      const navigate = () => {
        if (navigationRef.isReady()) {
          navigationRef.navigate('Invoice', { invoiceNumber } as any);
        } else {
          setTimeout(navigate, 200);
        }
      };
      navigate();
    };

    // Cold start — app opened via link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Warm start — app already running
    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, []);
}
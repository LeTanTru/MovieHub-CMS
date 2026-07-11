import DOMPurify from 'dompurify';

// Iframe embeds are only allowed from these origins (docs/security-scan.md —
// "Rich text sanitization allows iframes and inline styles").
const TRUSTED_IFRAME_ORIGINS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com'
];

const isTrustedIframeSrc = (src: string): boolean => {
  try {
    return TRUSTED_IFRAME_ORIGINS.includes(new URL(src).origin);
  } catch {
    return false;
  }
};

// DOMPurify hooks are global; isSupported is false during SSR where there is
// no DOM (sanitize is a no-op there as well).
if (DOMPurify.isSupported) {
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return;
    const src = (node as Element).getAttribute('src') ?? '';
    if (!isTrustedIframeSrc(src)) {
      node.parentNode?.removeChild(node);
    }
  });
}

export const sanitizeRichText = (html?: string | null): string =>
  DOMPurify.sanitize(html ?? '', {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen']
  });

import { useEffect, useState } from 'react';
import { defaultCardContent } from '../data/cardContent.js';
import { fetchCardContent } from '../services/cardApi.js';

// A generic server template must not replace this recipient's personal greeting.
export function useCardContent() {
  const [content, setContent] = useState(defaultCardContent);
  useEffect(() => {
    const controller = new AbortController();
    fetchCardContent(controller.signal)
      .then(remote => {
        if (remote.recipientName === defaultCardContent.recipientName) {
          setContent({ ...defaultCardContent, ...remote });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  return content;
}

import { useEffect, useRef, useState } from 'react';
import { createBookController, initialUi } from '../lib/bookController.js';

const ELEMENTS = [
  'viewer', 'scene', 'book', 'cover', 'leaf', 'leafTwo', 'pageTwo', 'pageThree', 'deskShadow', 'sky',
  'portrait', 'portraitLeft', 'portraitRight', 'cat', 'cake', 'cakeLeft', 'cakeRight',
  'selfStand', 'selfLeft', 'selfRight', 'mirror', 'puppy',
  'thirdStand', 'thirdLeft', 'thirdRight', 'thirdSelf',
];

export function useBookExperience() {
  const refs = useRef(Object.fromEntries(ELEMENTS.map(name => [name, { current: null }]))).current;
  const controller = useRef(null);
  const [ui, setUi] = useState(initialUi);

  useEffect(() => {
    const els = Object.fromEntries(ELEMENTS.map(name => [name, refs[name].current]));
    const book = createBookController(els, setUi);
    controller.current = book;
    return () => {
      book.destroy();
      controller.current = null;
    };
  }, [refs]);

  // Stable action handlers that forward to the live controller.
  const actions = useRef(new Proxy({}, {
    get: (_, name) => (...args) => controller.current?.[name]?.(...args),
  })).current;

  return { refs, ui, actions };
}

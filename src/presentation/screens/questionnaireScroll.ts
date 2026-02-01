export type ScrollRefLike = {
  scrollTo?: (options: any) => void;
  getScrollableNode?: () => any;
};

export const scrollToY = (scrollRef: ScrollRefLike | null | undefined, y: number): boolean => {
  if (!scrollRef) return false;

  if (typeof scrollRef.scrollTo === 'function') {
    scrollRef.scrollTo({ y, animated: true });
    return true;
  }

  const node = typeof scrollRef.getScrollableNode === 'function' ? scrollRef.getScrollableNode() : null;
  if (node && typeof node.scrollTo === 'function') {
    node.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }

  return false;
};

export const scrollToQuestionWithRetries = (params: {
  getOffset: () => number | undefined;
  scrollToY: (y: number) => boolean;
  maxAttempts?: number;
  delayMs?: number;
  initialDelayMs?: number;
}): void => {
  const maxAttempts = params.maxAttempts ?? 25;
  const delayMs = params.delayMs ?? 80;
  const initialDelayMs = params.initialDelayMs ?? 0;

  const attempt = (attemptsLeft: number): void => {
    const offset = params.getOffset();
    if (typeof offset === 'number') {
      params.scrollToY(offset);
      return;
    }

    if (attemptsLeft <= 0) return;
    setTimeout(() => attempt(attemptsLeft - 1), delayMs);
  };

  if (initialDelayMs > 0) {
    setTimeout(() => attempt(maxAttempts), initialDelayMs);
    return;
  }

  attempt(maxAttempts);
};

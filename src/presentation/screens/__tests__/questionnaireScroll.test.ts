import { scrollToQuestionWithRetries, scrollToY } from '../questionnaireScroll';

describe('questionnaireScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scrollToY uses scrollTo({y}) when available', () => {
    const scrollTo = jest.fn();
    const ok = scrollToY({ scrollTo }, 123);
    expect(ok).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ y: 123, animated: true });
  });

  it('scrollToY falls back to DOM node scrollTo({top})', () => {
    const nodeScrollTo = jest.fn();
    const ref = {
      getScrollableNode: () => ({ scrollTo: nodeScrollTo }),
    };

    const ok = scrollToY(ref, 456);
    expect(ok).toBe(true);
    expect(nodeScrollTo).toHaveBeenCalledWith({ top: 456, behavior: 'smooth' });
  });

  it('scrollToQuestionWithRetries waits until offset exists', () => {
    const scroll = jest.fn(() => true);

    let calls = 0;
    const getOffset = () => {
      calls += 1;
      return calls >= 3 ? 200 : undefined;
    };

    scrollToQuestionWithRetries({
      getOffset,
      scrollToY: scroll,
      maxAttempts: 10,
      delayMs: 50,
      initialDelayMs: 0,
    });

    expect(scroll).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(100);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledWith(200);
  });
});

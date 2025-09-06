/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Stream utilities for upload functionality.
 * Got it, love.
 */

/**
 * Convert an async iterable to a ReadableStream
 */
export function ReadableStreamFrom<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
  if (typeof ReadableStream === 'undefined') {
    throw new Error('ReadableStream is not available in this environment');
  }

  const iterator = iterable[Symbol.asyncIterator]();

  return new ReadableStream<T>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        controller.error(error);
      }
    },
    
    async cancel() {
      if (typeof iterator.return === 'function') {
        await iterator.return();
      }
    },
  });
}
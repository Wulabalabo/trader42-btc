export function parseJsonCompletion<T>(content: string): T {
  return JSON.parse(content.trim()) as T;
}

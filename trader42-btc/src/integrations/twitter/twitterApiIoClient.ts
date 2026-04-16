export interface Tweet {
  id: string;
  text: string;
  author: { userName: string; name: string };
  createdAt: string;
  retweetCount: number;
  likeCount: number;
  replyCount: number;
  quoteCount: number;
}

export interface SearchResult {
  tweets: Tweet[];
  has_next_page: boolean;
  next_cursor?: string;
}

export class TwitterApiIoClient {
  private readonly baseUrl = 'https://api.twitterapi.io';

  constructor(private apiKey: string) {}

  async searchTweets(query: string, opts: { count?: number; cursor?: string } = {}): Promise<Tweet[]> {
    const params = new URLSearchParams({
      query,
      queryType: 'Latest',
    });
    if (opts.count) params.set('count', String(opts.count));
    if (opts.cursor) params.set('cursor', opts.cursor);
    const res = await fetch(`${this.baseUrl}/twitter/tweet/advanced_search?${params}`, {
      headers: { 'X-API-Key': this.apiKey },
    });
    if (!res.ok) throw new Error(`Twitter search error: ${res.status}`);
    const data = (await res.json()) as SearchResult;
    return data.tweets ?? [];
  }

  async getUserLastTweets(userName: string, count = 10): Promise<Tweet[]> {
    const params = new URLSearchParams({
      userName,
      count: String(count),
    });
    const res = await fetch(`${this.baseUrl}/twitter/user/last_tweets?${params}`, {
      headers: { 'X-API-Key': this.apiKey },
    });
    if (!res.ok) throw new Error(`Twitter user tweets error: ${res.status}`);
    const data = (await res.json()) as SearchResult;
    return data.tweets ?? [];
  }

  async searchRecent(query: string, count = 20): Promise<SearchResult> {
    return {
      tweets: await this.searchTweets(query, { count }),
      has_next_page: false,
    };
  }

  async getUserTweets(userName: string, count = 10): Promise<SearchResult> {
    return {
      tweets: await this.getUserLastTweets(userName, count),
      has_next_page: false,
    };
  }
}

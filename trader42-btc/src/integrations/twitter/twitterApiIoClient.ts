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

  async searchRecent(query: string, count = 20): Promise<SearchResult> {
    const params = new URLSearchParams({
      query,
      queryType: 'Latest',
      cursor: '',
    });
    const res = await fetch(`${this.baseUrl}/twitter/tweet/advanced_search?${params}`, {
      headers: { 'X-API-Key': this.apiKey },
    });
    if (!res.ok) throw new Error(`Twitter search error: ${res.status}`);
    return res.json() as Promise<SearchResult>;
  }

  async getUserTweets(userName: string, count = 10): Promise<SearchResult> {
    const params = new URLSearchParams({
      userName,
      cursor: '',
    });
    const res = await fetch(`${this.baseUrl}/twitter/user/last_tweets?${params}`, {
      headers: { 'X-API-Key': this.apiKey },
    });
    if (!res.ok) throw new Error(`Twitter user tweets error: ${res.status}`);
    return res.json() as Promise<SearchResult>;
  }
}

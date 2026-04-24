import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function parseSearchResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const resultRegex = /<a[^>]+class="result__a"[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const titles: { url: string; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = resultRegex.exec(html)) !== null) {
    const url = decodeURIComponent(
      match[1]
        .replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, '')
        .replace(/&rut=.*$/, '')
    );
    const title = match[2].replace(/<[^>]*>/g, '').trim();
    if (url && title) {
      titles.push({ url, title });
    }
  }

  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
  }

  for (let i = 0; i < titles.length; i++) {
    results.push({
      title: titles[i].title,
      url: titles[i].url,
      snippet: snippets[i] || '',
    });
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Search request failed with status ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const results = parseSearchResults(html);

    return NextResponse.json({
      query,
      results: results.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Search request timed out' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.q || body.query || '';

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter "q" or "query" is required in request body' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Search request failed with status ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const results = parseSearchResults(html);

    return NextResponse.json({
      query,
      results: results.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Search request timed out' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Search failed' },
      { status: 500 }
    );
  }
}

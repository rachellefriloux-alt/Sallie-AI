import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
  createdAt: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  weight: number;
  createdAt: string;
}

const nodes = new Map<string, GraphNode>();
const edges = new Map<string, GraphEdge>();

function getAIConfig() {
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );
  const deployment =
    azureOpenAIConfig.deployment ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AI_MODEL ||
    'gpt-4o';
  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;

  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    url = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else if (isAzure && azureResource) {
    url = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else {
    url = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return { url, headers, apiKey, isAzure, deployment };
}

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const { url, headers, apiKey, isAzure, deployment } = getAIConfig();
  if (!apiKey) return '';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const nodeId = searchParams.get('nodeId');
  const query = searchParams.get('query');

  if (action === 'traverse' && nodeId) {
    const node = nodes.get(nodeId);
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }
    const connected = Array.from(edges.values()).filter(
      (e) => e.source === nodeId || e.target === nodeId
    );
    const neighborIds = connected.map((e) =>
      e.source === nodeId ? e.target : e.source
    );
    const neighbors = neighborIds
      .map((id) => nodes.get(id))
      .filter(Boolean);
    return NextResponse.json({ node, edges: connected, neighbors });
  }

  if (action === 'search' && query) {
    const q = query.toLowerCase();
    const matchingNodes = Array.from(nodes.values()).filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
    );
    const matchingEdges = Array.from(edges.values()).filter((e) =>
      e.relation.toLowerCase().includes(q)
    );
    return NextResponse.json({ nodes: matchingNodes, edges: matchingEdges });
  }

  return NextResponse.json({
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
    stats: { nodeCount: nodes.size, edgeCount: edges.size },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, node, edge } = body;

    if (action === 'extract' && text) {
      const aiResult = await callAI(
        `You are an entity/relation extraction engine. Given text, extract entities and relationships.
Return valid JSON with this exact structure:
{"entities": [{"label": "string", "type": "string", "properties": {}}], "relations": [{"source": "entity_label", "target": "entity_label", "relation": "string", "weight": 0.0-1.0}]}
Only return JSON, no markdown.`,
        text
      );

      let extracted = { entities: [] as any[], relations: [] as any[] };
      try {
        const cleaned = aiResult.replace(/```json\n?|```\n?/g, '').trim();
        extracted = JSON.parse(cleaned);
      } catch {
        return NextResponse.json(
          { error: 'AI extraction failed to parse', raw: aiResult },
          { status: 422 }
        );
      }

      const createdNodes: GraphNode[] = [];
      const createdEdges: GraphEdge[] = [];
      const labelToId = new Map<string, string>();

      for (const entity of extracted.entities || []) {
        const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const graphNode: GraphNode = {
          id,
          label: entity.label || 'Unknown',
          type: entity.type || 'entity',
          properties: entity.properties || {},
          createdAt: new Date().toISOString(),
        };
        nodes.set(id, graphNode);
        createdNodes.push(graphNode);
        labelToId.set(graphNode.label.toLowerCase(), id);
      }

      for (const rel of extracted.relations || []) {
        const sourceId = labelToId.get((rel.source || '').toLowerCase());
        const targetId = labelToId.get((rel.target || '').toLowerCase());
        if (sourceId && targetId) {
          const id = `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const graphEdge: GraphEdge = {
            id,
            source: sourceId,
            target: targetId,
            relation: rel.relation || 'related_to',
            weight: typeof rel.weight === 'number' ? rel.weight : 0.5,
            createdAt: new Date().toISOString(),
          };
          edges.set(id, graphEdge);
          createdEdges.push(graphEdge);
        }
      }

      return NextResponse.json({
        nodes: createdNodes,
        edges: createdEdges,
        message: `Extracted ${createdNodes.length} entities and ${createdEdges.length} relations`,
      }, { status: 201 });
    }

    if (action === 'add_node' && node) {
      const id = `node_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const graphNode: GraphNode = {
        id,
        label: node.label || 'Untitled',
        type: node.type || 'entity',
        properties: node.properties || {},
        createdAt: new Date().toISOString(),
      };
      nodes.set(id, graphNode);
      return NextResponse.json({ node: graphNode, message: `Node "${graphNode.label}" added` }, { status: 201 });
    }

    if (action === 'add_edge' && edge) {
      if (!edge.source || !edge.target) {
        return NextResponse.json({ error: 'source and target node IDs required' }, { status: 400 });
      }
      if (!nodes.has(edge.source) || !nodes.has(edge.target)) {
        return NextResponse.json({ error: 'Source or target node not found' }, { status: 404 });
      }
      const id = `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const graphEdge: GraphEdge = {
        id,
        source: edge.source,
        target: edge.target,
        relation: edge.relation || 'related_to',
        weight: typeof edge.weight === 'number' ? edge.weight : 0.5,
        createdAt: new Date().toISOString(),
      };
      edges.set(id, graphEdge);
      return NextResponse.json({ edge: graphEdge, message: 'Edge added' }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action. Use "extract", "add_node", or "add_edge"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Knowledge graph operation failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId');
    const edgeId = searchParams.get('edgeId');

    if (edgeId) {
      if (!edges.has(edgeId)) {
        return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
      }
      edges.delete(edgeId);
      return NextResponse.json({ message: 'Edge deleted' });
    }

    if (nodeId) {
      if (!nodes.has(nodeId)) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }
      nodes.delete(nodeId);
      for (const [id, edge] of edges) {
        if (edge.source === nodeId || edge.target === nodeId) {
          edges.delete(id);
        }
      }
      return NextResponse.json({ message: 'Node and connected edges deleted' });
    }

    return NextResponse.json({ error: 'nodeId or edgeId query parameter required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 400 }
    );
  }
}

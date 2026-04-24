import { NextRequest, NextResponse } from 'next/server';
import {
  getAllIntegrations,
  getAllConnections,
  getConnection,
  saveConnection,
  removeConnection,
  testConnection,
  type IntegrationConnection,
} from '@/lib/integrations-registry';

export async function GET() {
  const integrations = getAllIntegrations();
  const connections = getAllConnections();

  const enriched = integrations.map(integration => {
    const conn = connections.find(c => c.integrationId === integration.id);
    return {
      ...integration,
      status: conn?.status || integration.status,
      connectedAt: conn?.connectedAt,
      lastVerified: conn?.lastVerified,
      hasConfig: !!conn,
    };
  });

  return NextResponse.json({
    integrations: enriched,
    connectedCount: connections.filter(c => c.status === 'connected').length,
    totalCount: integrations.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, integrationId, config } = body;

    if (action === 'connect') {
      if (!integrationId) {
        return NextResponse.json({ error: 'integrationId required' }, { status: 400 });
      }

      const conn: IntegrationConnection = {
        integrationId,
        status: 'connected',
        config: config || {},
        connectedAt: new Date().toISOString(),
        lastVerified: new Date().toISOString(),
      };

      saveConnection(conn);

      const testResult = testConnection(integrationId);

      return NextResponse.json({
        success: true,
        connection: { integrationId, status: 'connected', connectedAt: conn.connectedAt },
        test: testResult,
      });
    }

    if (action === 'disconnect') {
      if (!integrationId) {
        return NextResponse.json({ error: 'integrationId required' }, { status: 400 });
      }

      removeConnection(integrationId);

      return NextResponse.json({
        success: true,
        connection: { integrationId, status: 'disconnected' },
      });
    }

    if (action === 'test') {
      if (!integrationId) {
        return NextResponse.json({ error: 'integrationId required' }, { status: 400 });
      }

      const result = testConnection(integrationId);
      return NextResponse.json({ success: result.success, message: result.message });
    }

    if (action === 'get') {
      if (!integrationId) {
        return NextResponse.json({ error: 'integrationId required' }, { status: 400 });
      }

      const conn = getConnection(integrationId);
      if (!conn) {
        return NextResponse.json({ connection: null });
      }

      const safeConfig: Record<string, string> = {};
      for (const [key, value] of Object.entries(conn.config)) {
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')) {
          safeConfig[key] = value ? '••••••••' + value.slice(-4) : '';
        } else {
          safeConfig[key] = value;
        }
      }

      return NextResponse.json({
        connection: {
          ...conn,
          config: safeConfig,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use: connect, disconnect, test, get' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

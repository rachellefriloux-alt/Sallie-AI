import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCapabilities,
  getCapabilitiesByCategory,
  getCapabilityById,
  getCategories,
  getCapabilitySummary,
  type CapabilityCategory,
} from '@/lib/capability-registry';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as CapabilityCategory | null;
    const id = searchParams.get('id');
    const mode = searchParams.get('mode');

    if (mode === 'summary') {
      return NextResponse.json(getCapabilitySummary());
    }

    if (mode === 'categories') {
      return NextResponse.json({ categories: getCategories() });
    }

    if (id) {
      const capability = getCapabilityById(id);
      if (!capability) {
        return NextResponse.json({ error: `Capability "${id}" not found` }, { status: 404 });
      }
      return NextResponse.json({ capability });
    }

    if (category) {
      const validCategories = getCategories();
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category "${category}". Valid: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
      const capabilities = getCapabilitiesByCategory(category);
      return NextResponse.json({ category, capabilities, total: capabilities.length });
    }

    const capabilities = getAllCapabilities();
    const summary = getCapabilitySummary();

    return NextResponse.json({
      capabilities,
      summary,
    });
  } catch (e) {
    console.error('api/capabilities GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

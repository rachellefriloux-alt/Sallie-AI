import { NextRequest, NextResponse } from 'next/server';

type ConversionMap = Record<string, Record<string, number>>;

const lengthToMeters: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  nm: 1852, μm: 0.000001,
};

const weightToKg: Record<string, number> = {
  mg: 0.000001, g: 0.001, kg: 1, lb: 0.453592, oz: 0.0283495, ton: 907.185, tonne: 1000, st: 6.35029,
};

const volumeToLiters: Record<string, number> = {
  ml: 0.001, l: 1, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588,
  floz: 0.0295735, tbsp: 0.0147868, tsp: 0.00492892, m3: 1000,
};

const speedToMps: Record<string, number> = {
  'km/h': 1 / 3.6, 'mph': 0.44704, 'm/s': 1, 'ft/s': 0.3048, knot: 0.514444, kn: 0.514444,
};

const dataToBytes: Record<string, number> = {
  b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4, pb: 1024 ** 5,
  bit: 0.125, kbit: 128, mbit: 128 * 1024, gbit: 128 * 1024 ** 2,
};

const timeToSeconds: Record<string, number> = {
  ms: 0.001, s: 1, min: 60, h: 3600, hr: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000,
};

const areaToSqm: Record<string, number> = {
  mm2: 0.000001, cm2: 0.0001, m2: 1, km2: 1000000, in2: 0.00064516, ft2: 0.092903,
  yd2: 0.836127, ac: 4046.86, acre: 4046.86, ha: 10000, hectare: 10000, mi2: 2590000,
};

function convertTemperature(value: number, from: string, to: string): number {
  const f = from.toLowerCase();
  const t = to.toLowerCase();

  let celsius: number;
  if (f === 'c' || f === 'celsius') celsius = value;
  else if (f === 'f' || f === 'fahrenheit') celsius = (value - 32) * 5 / 9;
  else if (f === 'k' || f === 'kelvin') celsius = value - 273.15;
  else throw new Error(`Unknown temperature unit: ${from}`);

  if (t === 'c' || t === 'celsius') return celsius;
  if (t === 'f' || t === 'fahrenheit') return celsius * 9 / 5 + 32;
  if (t === 'k' || t === 'kelvin') return celsius + 273.15;
  throw new Error(`Unknown temperature unit: ${to}`);
}

function convertWithMap(value: number, from: string, to: string, map: Record<string, number>, unitName: string): number {
  const fromFactor = map[from.toLowerCase()];
  const toFactor = map[to.toLowerCase()];
  if (fromFactor === undefined) throw new Error(`Unknown ${unitName} unit: ${from}`);
  if (toFactor === undefined) throw new Error(`Unknown ${unitName} unit: ${to}`);
  return (value * fromFactor) / toFactor;
}

const categoryMaps: Record<string, { map: Record<string, number>; label: string }> = {
  length: { map: lengthToMeters, label: 'length' },
  weight: { map: weightToKg, label: 'weight' },
  mass: { map: weightToKg, label: 'weight' },
  volume: { map: volumeToLiters, label: 'volume' },
  speed: { map: speedToMps, label: 'speed' },
  velocity: { map: speedToMps, label: 'speed' },
  data: { map: dataToBytes, label: 'data' },
  digital: { map: dataToBytes, label: 'data' },
  time: { map: timeToSeconds, label: 'time' },
  duration: { map: timeToSeconds, label: 'time' },
  area: { map: areaToSqm, label: 'area' },
};

function detectCategory(from: string, to: string): string | null {
  const f = from.toLowerCase();
  const t = to.toLowerCase();

  if (['c', 'f', 'k', 'celsius', 'fahrenheit', 'kelvin'].includes(f)) return 'temperature';

  for (const [cat, { map }] of Object.entries(categoryMaps)) {
    if (map[f] !== undefined && map[t] !== undefined) return cat;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { value, from, to, category } = body;

    if (value === undefined || typeof value !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid "value" (number)' }, { status: 400 });
    }
    if (!from || typeof from !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "from" unit' }, { status: 400 });
    }
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "to" unit' }, { status: 400 });
    }

    const cat = (category || detectCategory(from, to) || '').toLowerCase();

    if (!cat) {
      return NextResponse.json(
        { error: `Cannot determine conversion category. Specify "category" (length, weight, temp, volume, speed, data, time, area)` },
        { status: 400 }
      );
    }

    let result: number;

    if (cat === 'temperature' || cat === 'temp') {
      result = convertTemperature(value, from, to);
    } else {
      const entry = categoryMaps[cat];
      if (!entry) {
        return NextResponse.json(
          { error: `Unknown category: ${category}. Supported: length, weight, temp, volume, speed, data, time, area` },
          { status: 400 }
        );
      }
      result = convertWithMap(value, from, to, entry.map, entry.label);
    }

    return NextResponse.json({
      value,
      from,
      to,
      category: cat,
      result,
      formatted: `${value} ${from} = ${Number.isInteger(result) ? result : parseFloat(result.toPrecision(10))} ${to}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Conversion failed' },
      { status: 400 }
    );
  }
}

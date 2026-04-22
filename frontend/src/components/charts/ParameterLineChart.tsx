import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
  Dot,
} from 'recharts';
import type { WaterParameter, ParameterKey } from '../../types/parameter';
import { PARAMETER_RANGES } from '../../utils/parameterRanges';
import { formatChartDate } from '../../utils/formatters';

interface ChartPoint {
  date: string;
  value: number | null;
}

interface TooltipPayload {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.10)] rounded-lg px-3 py-2 text-sm">
      <p className="text-[#A0A0A0] text-xs mb-0.5">{label}</p>
      <p className="font-mono text-[#59D3FF]">{payload[0].value}</p>
    </div>
  );
}

interface Props {
  parameters: WaterParameter[];
  paramKey: ParameterKey;
}

export default function ParameterLineChart({ parameters, paramKey }: Props) {
  const range = PARAMETER_RANGES[paramKey];

  const data: ChartPoint[] = [...parameters]
    .reverse()
    .filter((p) => p[paramKey] !== null && p[paramKey] !== undefined)
    .map((p) => ({
      date: formatChartDate(p.measuredAt),
      value: p[paramKey] as number,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#666] text-sm">
        No data for this parameter yet.
      </div>
    );
  }

  const values = data.map((d) => d.value as number);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const padding = (dataMax - dataMin) * 0.2 || range.max * 0.05;
  const yMin = Math.min(dataMin, range.min) - padding;
  const yMax = Math.max(dataMax, range.max) + padding;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />

        <ReferenceArea
          y1={range.min}
          y2={range.max}
          fill="rgba(52,211,153,0.06)"
          fillOpacity={1}
          strokeOpacity={0}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: '#666', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: '#666', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v: number) => v.toFixed(range.decimals)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#59D3FF"
          strokeWidth={2}
          dot={<Dot r={3} fill="#59D3FF" stroke="#59D3FF" />}
          activeDot={{ r: 5, fill: '#59D3FF', stroke: '#000', strokeWidth: 2 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

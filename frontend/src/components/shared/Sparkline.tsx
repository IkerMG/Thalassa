import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: number[];
  color?: string;
}

export default function Sparkline({ data, color = '#59D3FF' }: Props) {
  if (data.length < 2) {
    return (
      <div className="h-10 flex items-center">
        <span className="text-text-tertiary text-xs font-mono">—</span>
      </div>
    );
  }

  const chartData = data.map((value) => ({ value }));

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#ef4444', '#f59e0b'];

export default function StokSummaryChart({ data }: { data: { tersedia: number; rusak: number; perbaikan: number } }) {
    const chartData = [
        { name: 'Tersedia', value: data.tersedia },
        { name: 'Rusak', value: data.rusak },
        { name: 'Perbaikan', value: data.perbaikan },
    ];

    if (!chartData.some((item) => item.value > 0)) {
        return (
            <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                Belum ada data stok.
            </div>
        );
    }

    return (
        <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius={88} innerRadius={56} paddingAngle={3}>
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            borderRadius: 8,
                            color: 'var(--popover-foreground)',
                        }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

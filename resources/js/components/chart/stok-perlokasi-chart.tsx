import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type StokLokasiItem = {
    lokasi: string;
    tersedia: number;
    rusak: number;
    perbaikan: number;
};

export default function StokPerLokasiChart({ data = [] }: { data: StokLokasiItem[] }) {
    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="lokasi" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'var(--muted)' }}
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            borderRadius: 8,
                            color: 'var(--popover-foreground)',
                        }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar dataKey="tersedia" fill="#2563eb" name="Tersedia" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rusak" fill="#ef4444" name="Rusak" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="perbaikan" fill="#f59e0b" name="Perbaikan" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

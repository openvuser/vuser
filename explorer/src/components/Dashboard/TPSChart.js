import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { generateTPSHistory } from '@/lib/mockData';

export default function TPSChart() {
  const [data, setData] = useState(generateTPSHistory(30));
  const [maxTPS, setMaxTPS] = useState(0);

  useEffect(() => {
    // Update chart data every 5 seconds
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString(),
          tps: Math.random() * (15000 - 8000) + 8000,
          timestamp: now.getTime(),
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const max = Math.max(...data.map(d => d.tps));
    setMaxTPS(max);
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(18, 18, 37, 0.95)',
          border: '1px solid var(--color-electric-blue)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{ color: 'var(--color-electric-blue)', fontWeight: '600', marginBottom: '0.25rem' }}>
            {payload[0].payload.time}
          </p>
          <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
            {payload[0].value.toLocaleString('en-US', { maximumFractionDigits: 0 })} TPS
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-between items-start mb-lg">
        <div>
          <h3>Real-Time Transaction Throughput</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
            Live TPS monitoring • Updates every 5 seconds
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            Peak TPS
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {maxTPS.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#B026FF" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="tps"
            stroke="#00D9FF"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#tpsGradient)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
            Current TPS
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-electric-blue)' }}>
            {data[data.length - 1]?.tps.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
            Average TPS
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-cyber-green)' }}>
            {(data.reduce((acc, d) => acc + d.tps, 0) / data.length).toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
            Network Status
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--color-cyber-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span className="pulse-glow" style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-cyber-green)',
              display: 'inline-block',
            }} />
            LIVE
          </div>
        </div>
      </div>
    </motion.div>
  );
}

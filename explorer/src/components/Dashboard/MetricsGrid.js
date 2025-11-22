import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Layers, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { generateBlockchainStats } from '@/lib/mockData';

export default function MetricsGrid() {
  const [stats, setStats] = useState(generateBlockchainStats());
  const [prevStats, setPrevStats] = useState(stats);

  // Update stats every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevStats(stats);
      setStats(generateBlockchainStats());
    }, 3000);

    return () => clearInterval(interval);
  }, [stats]);

  // Calculate change percentage
  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(2);
  };

  const metrics = [
    {
      label: 'Transactions Per Second',
      value: stats.tps.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      change: calculateChange(stats.tps, prevStats.tps),
      icon: Activity,
      color: 'blue',
      suffix: ' TPS',
    },
    {
      label: 'Gas Price',
      value: stats.gasPrice.toFixed(6),
      change: calculateChange(stats.gasPrice, prevStats.gasPrice),
      icon: Zap,
      color: 'green',
      prefix: '$',
      highlight: 'Ultra-Low',
    },
    {
      label: 'Active Sidechains',
      value: stats.activeSidechains,
      change: calculateChange(stats.activeSidechains, prevStats.activeSidechains),
      icon: Layers,
      color: 'purple',
    },
    {
      label: 'PoP Eligible Pool',
      value: stats.popPool,
      change: 0,
      icon: Users,
      color: 'pink',
      subtitle: 'Last 100 addresses',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="metrics-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className="metric-card"
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="metric-label">{metric.label}</div>
              {metric.subtitle && (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  {metric.subtitle}
                </div>
              )}
            </div>
            <metric.icon className={`text-${metric.color}`} size={24} />
          </div>

          <div className="metric-value">
            {metric.prefix}
            {metric.value}
            {metric.suffix}
          </div>

          {metric.highlight && (
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.75rem',
              background: 'var(--gradient-success)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginTop: '0.5rem',
            }}>
              {metric.highlight}
            </div>
          )}

          {metric.change !== 0 && (
            <div className={`metric-change ${metric.change > 0 ? 'positive' : 'negative'}`}>
              {metric.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(metric.change)}%
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

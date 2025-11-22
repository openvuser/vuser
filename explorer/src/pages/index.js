import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import{ TrendingUp, ArrowRight } from 'lucide-react';
import MetricsGrid from '@/components/Dashboard/MetricsGrid';
import TPSChart from '@/components/Dashboard/TPSChart';
import { generateRecentTransactions } from '@/lib/mockData';

export default function Home() {
  const [transactions, setTransactions] = useState(generateRecentTransactions(5));

  // Add new transaction every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newTxs = generateRecentTransactions(1);
      setTransactions(prev => [newTxs[0], ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sponsored':
        return 'var(--color-cyber-green)';
      case 'sidechain_anchor':
        return 'var(--color-neon-purple)';
      default:
        return 'var(--color-electric-blue)';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'sponsored':
        return '⚡ SPONSORED';
      case 'sidechain_anchor':
        return '🔗 ANCHOR';
      default:
        return '💰 REGULAR';
    }
  };

  return (
    <>
      <Head>
        <title>Vuser Blockchain Explorer | Ultra-High TPS, Ultra-Low Gas</title>
        <meta name="description" content="Real-time blockchain explorer for Vuser Network featuring high TPS, low gas fees, federated sidechains, and Proof-of-Participation consensus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {/* Hero Section */}
        <motion.section
          className="section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              VUSER BLOCKCHAIN EXPLORER
            </motion.h1>
            <motion.p
              style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.8)',
                marginTop: '1rem',
                maxWidth: '800px',
                margin: '1rem auto 0',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Real-time monitoring of the Vuser Network • Ultra-High TPS • Ultra-Low Gas • Federated Sidechains • Proof-of-Participation Consensus
            </motion.p>

            <motion.div
              style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span style={{
                padding: '0.5rem 1rem',
                background: 'var(--gradient-success)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <TrendingUp size={20} />
                High Performance
              </span>
              <span style={{
                padding: '0.5rem 1rem',
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
              }}>
                Low Cost
              </span>
              <span style={{
                padding: '0.5rem 1rem',
                background: 'var(--gradient-warning)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
              }}>
                Decentralized
              </span>
            </motion.div>
          </div>
        </motion.section>

        {/* Metrics Grid */}
        <section>
          <MetricsGrid suppressHydrationWarning />
        </section>

        {/* TPS Chart */}
        <section className="section">
          <TPSChart />
        </section>

        {/* Live Transactions Feed */}
        <section className="section">
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3>Live Transactions</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                  Real-time transaction stream
                </p>
              </div>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  className="glass-card-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    borderLeft: `3px solid ${getTypeColor(tx.type)}`,
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <code style={{
                          fontSize: '0.9rem',
                          color: 'var(--color-electric-blue)',
                          background: 'rgba(0, 217, 255, 0.1)',
                        }}>
                          {formatAddress(tx.hash)}
                        </code>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: getTypeColor(tx.type) + '20',
                          color: getTypeColor(tx.type),
                          fontWeight: '600',
                        }}>
                          {getTypeLabel(tx.type)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}>
                        <code>{formatAddress(tx.sender)}</code>
                        <span>→</span>
                        <code>{formatAddress(tx.recipient)}</code>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'white',
                      }}>
                        {tx.amount} VOC
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: tx.gasPrice === 0 ? 'var(--color-cyber-green)' : 'rgba(255,255,255,0.6)',
                        fontWeight: tx.gasPrice === 0 ? '600' : 'normal',
                      }}>
                        {tx.gasPrice === 0 ? 'Coalition Sponsored' : `Gas: $${tx.gasPrice.toFixed(6)}`}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '2rem 0',
          color: 'rgba(255,255,255,0.5)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: '3rem',
        }}>
          <p>Vuser Blockchain Explorer • Powered by Virtual User Protocol</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Built with Next.js, Recharts, Framer Motion & Three.js
          </p>
        </footer>
      </div>
    </>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/auth';
import { ConnectionHealthBadge } from '@/components/ConnectionHealth';
import DashboardLayout from '@/components/DashboardLayout';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms?: number;
  message: string;
  timestamp: string;
}

interface SystemHealthResponse {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthMetric[];
  timestamp: string;
}

interface SystemStats {
  total_users: number;
  total_strategies: number;
  active_strategies: number;
  shared_strategies: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const sess = await getSession();
      if (!sess) {
        router.push('/login');
        return;
      }
      setSession(sess);
      await fetchHealthData(sess.accessToken);
    }
    checkAuth();
  }, [router]);

  const fetchHealthData = async (token?: string) => {
    const accessToken = token || session?.accessToken;
    if (!accessToken) return;

    try {
      const [healthRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/admin/health', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch('http://localhost:8000/api/v1/admin/stats', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      if (!healthRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const healthData = await healthRes.json();
      const statsData = await statsRes.json();

      setHealth(healthData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;

    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(() => fetchHealthData(), 5000);
      return () => clearInterval(interval);
    }
  }, [session, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout session={session || { user: { name: 'Guest', email: '' } }} currentPage="admin">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm p-6">
          <h2 className="text-lg font-semibold text-red-200 mb-2">Error Loading Admin Data</h2>
          <p className="text-red-300">{error || 'Session not available'}</p>
          <button
            onClick={() => fetchHealthData()}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout session={session} currentPage="admin">
      {/* Page Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">System Health Monitoring</h2>
          <p className="text-gray-400">Real-time system status and metrics</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh (5s)
        </label>
      </div>

      {/* Overall Status Card */}
          {health && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">System Status</h2>
                  <p className="text-sm text-gray-400">
                    Last updated: {new Date(health.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block w-6 h-6 rounded-full ${getStatusDot(health.overall_status)} animate-pulse`}></span>
                  <span className={`text-3xl font-bold uppercase ${
                    health.overall_status === 'healthy' ? 'text-green-400' :
                    health.overall_status === 'degraded' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{health.overall_status}</span>
                </div>
              </div>
            </div>
          )}

          {/* System Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Strategies</p>
                    <p className="text-3xl font-bold text-white">{stats.total_strategies}</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-300">Active Strategies</p>
                    <p className="text-3xl font-bold text-green-100">{stats.active_strategies}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">Shared Strategies</p>
                    <p className="text-3xl font-bold text-blue-100">{stats.shared_strategies}</p>
                  </div>
                  <div className="text-4xl">🌐</div>
                </div>
              </div>
            </div>
          )}

          {/* Health Check Cards */}
          {health && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Health Checks</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {health.checks.map((check, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{check.name}</h3>
                      <span className={`inline-block w-3 h-3 rounded-full ${getStatusDot(check.status)}`}></span>
                    </div>

                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                      check.status === 'healthy' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                      check.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {check.status.toUpperCase()}
                    </div>

                    {check.latency_ms !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Latency</span>
                          <span className="font-semibold text-white">{check.latency_ms.toFixed(2)} ms</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              check.latency_ms < 50
                                ? 'bg-green-500'
                                : check.latency_ms < 200
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((check.latency_ms / 200) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-gray-300 mb-2">{check.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(check.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
    </DashboardLayout>
  );
}

'use client';
import React, { useMemo } from 'react';
import { DonutChart } from '@tremor/react';
import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/translations';
import type { PanelStatus, ReportResponse } from '@/types/report';

const STATUS_COLORS: Record<PanelStatus, string> = {
  trustworthy: '#01AE7D',
  suspicious: '#FACC15',
  unreliable: '#F87171',
};

type PanelKey = 'browser' | 'location' | 'ipAddress' | 'hardware' | 'software';

interface ChartDataPoint {
  name: string;
  value: number;
  status: PanelStatus;
}

interface InteractiveRadarChartProps {
  data?: ReportResponse['panels'];
  onPanelClick?: (panel: PanelKey) => void;
  activePanel?: PanelKey;
}

// Custom value formatter
const valueFormatter = (value: number) => `${value}`;

export const InteractiveRadarChart = ({ data, onPanelClick, activePanel }: InteractiveRadarChartProps) => {
  const t = useTranslations('interactiveRadar');
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data) return [];

    return Object.entries(data).map(([key, panel]) => ({
      name: t(`panels.${key}`),
      value: panel.score,
      status: panel.status as PanelStatus,
    }));
  }, [data, t]);

  // Map colors based on status for each data point
  const chartColors = useMemo<('emerald' | 'yellow' | 'red' | 'slate')[]>(() => {
    if (!chartData.length) return [];
    return chartData.map(d => {
      switch (d.status) {
        case 'trustworthy':
          return 'emerald';
        case 'suspicious':
          return 'yellow';
        case 'unreliable':
          return 'red';
        default:
          return 'slate';
      }
    });
  }, [chartData]);

  const overallScore = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length);
  }, [chartData]);

  const overallStatus = useMemo(() => {
    if (!data) return 'trustworthy';

    const statuses = Object.values(data).map(d => d.status);
    if (statuses.some(s => s === 'unreliable')) return 'unreliable';
    if (statuses.some(s => s === 'suspicious')) return 'suspicious';
    return 'trustworthy';
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-80 w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-accent" />
          <p className="text-sm text-slate-400">{t('analyzingFingerprint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Display */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/60 px-6 py-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[overallStatus] }} />
          <span className="text-lg font-semibold text-white">{overallScore}/100</span>
          <span className="text-sm text-slate-400">{t(`status.${overallStatus}`)}</span>
        </div>
      </motion.div>

      {/* Panel List and Pie Chart - Left-Right Layout */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Panel Breakdown - Left Side */}
        <div className="rounded-2xl border border-white/5 bg-surface/40 p-6">
          <div className="space-y-3 h-full flex flex-col justify-center">
            {Object.entries(data).map(([key, panel]) => {
              const isActive = activePanel === key;
              const panelKey = key as PanelKey;

              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPanelClick?.(panelKey)}
                  className={`
                    w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all
                    ${
                      isActive
                        ? 'border-accent/50 bg-accent/10'
                        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[panel.status as PanelStatus] }}
                    />
                    <span className="text-sm font-medium text-white">{t(`panels.${panelKey}`)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">{panel.score}</span>
                    <span className="text-xs text-slate-500">{t(`status.${panel.status}`)}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Pie Chart - Right Side */}
        <div className="rounded-2xl border border-white/5 bg-surface/40 p-6">
          <div className="flex flex-col items-center justify-center h-full">
            <DonutChart
              data={chartData}
              category="value"
              index="name"
              valueFormatter={valueFormatter}
              colors={chartColors}
              showAnimation={true}
              showLabel={true}
              showTooltip={true}
              className="h-80"
            />
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-accent/20 bg-accent/5 p-4"
      >
        <h4 className="font-semibold text-accent mb-2">{t('keyInsights')}</h4>
        <div className="space-y-1 text-xs text-slate-300">
          {overallStatus === 'unreliable' && <p>{t('multipleConflicts')}</p>}
          {overallStatus === 'suspicious' && <p>{t('inconsistenciesFound')}</p>}
          {overallStatus === 'trustworthy' && <p>{t('strongConsistency')}</p>}
          <p>{t('clickPanel')}</p>
        </div>
      </motion.div>
    </div>
  );
};

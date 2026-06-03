/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Activity, Layers, Calendar, ChevronRight, 
  CheckCircle, AlertTriangle, ShieldCheck, BarChart2
} from 'lucide-react';
import { FamilyMember, HealthReport, HealthIndicator } from '../types';

interface IndicatorTrendChartProps {
  member: FamilyMember;
  reports: HealthReport[];
  isCompact?: boolean;
}

export default function IndicatorTrendChart({ member, reports, isCompact = false }: IndicatorTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'3h' | '6h' | '12h' | '24h' | 'years'>('12h');
  const [selectedCode, setSelectedCode] = useState<string>('glucose'); // 'glucose', 'sbp', 'cholesterol'

  // Standard CGM Blood Sugar dataset from Mini-program UI design requirement specs
  // "X轴时间点（06:00~12:40），Y轴血糖值（50~300），带数据点124/198/55"
  const cgmData = useMemo(() => {
    return [
      { time: "06:00", value: 124, type: "空腹/餐前" },
      { time: "07:20", value: 198, type: "餐后高峰" },
      { time: "08:40", value: 55,  type: "餐后低响应" },
      { time: "10:00", value: 140, type: "恢复期" },
      { time: "11:20", value: 120, type: "餐前平稳" },
      { time: "12:40", value: 158, type: "午餐后" }
    ];
  }, []);

  // Filter CGM depending on hours selected to give interactive experience
  const currentCgmDataset = useMemo(() => {
    if (timeRange === '3h') {
      return cgmData.slice(0, 3);
    } else if (timeRange === '6h') {
      return cgmData.slice(0, 4);
    } else if (timeRange === '12h') {
      return cgmData;
    } else { // 24h
      return [
        { time: "02:00", value: 85, type: "深夜平稳" },
        ...cgmData,
        { time: "16:00", value: 110, type: "下午平稳" },
        { time: "20:00", value: 135, type: "晚餐后" }
      ];
    }
  }, [timeRange, cgmData]);

  // Aggregate indicators from actual historical uploaded reports to build Module 1 comparative trend!
  const historicalReportsDataset = useMemo(() => {
    // Sort reports from oldest to newest to plot on x-axis chronological order
    const sortedReports = [...reports].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return sortedReports.map(rep => {
      // Find matching indicator code
      const ind = rep.indicators.find(i => i.code === selectedCode || i.code.includes(selectedCode));
      return {
        date: rep.date,
        reportTitle: rep.title,
        value: ind?.value || null,
        unit: ind?.unit || '',
        status: ind?.status || 'normal',
        normalRange: ind?.normalRange || '',
      };
    }).filter(d => d.value !== null);
  }, [reports, selectedCode]);

  // Choose which dataset to display on Recharts
  const isCgmMode = timeRange !== 'years';
  const chartData = isCgmMode ? currentCgmDataset : historicalReportsDataset;

  // Compute stat metrics line: Mean, Max, Min
  const stats = useMemo(() => {
    if (chartData.length === 0) return { mean: 0, max: 0, min: 0 };
    const values = chartData.map(d => Number(d.value)).filter(v => !isNaN(v));
    if (values.length === 0) return { mean: 0, max: 0, min: 0 };

    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const mean = Math.round(sum / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { mean, max, min };
  }, [chartData]);

  // Blood sugar target coloring ranges
  const unitLabel = selectedCode === 'glucose' ? 'mg/dL' : selectedCode === 'sbp' ? 'mmHg' : 'mmol/L';

  return (
    <div id="indicators-analytics-card" className={`bg-white rounded-3xl ${isCompact ? 'p-4' : 'p-6'} border border-slate-100 shadow-xs ${isCompact ? 'space-y-4' : 'space-y-6'}`}>
      
      {/* Chart Header Settings */}
      <div className={`flex flex-col ${isCompact ? 'gap-3' : 'md:flex-row md:items-center md:gap-4'} justify-between border-b pb-4 border-slate-50`}>
        <div className="min-w-0 flex-1">
          <span className="inline-block text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            指标变化与长期趋势对比
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 animate-pulse shrink-0" />
            <span className="truncate">历年健康指标 & 餐后动态波幅监测</span>
          </h3>
          {!isCompact && (
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              聚合 【{member.name}】 的本地高密体检单明细，对血糖、血压、尿酸等生命征候进行多重趋势拟合。
            </p>
          )}
        </div>

        {/* Dynamic Mode Switcher Toggle Tabs */}
        <div className={`flex flex-col gap-1.5 w-full ${isCompact ? '' : 'md:w-auto md:min-w-[280px]'} shrink-0 font-sans`}>
          <div className="grid grid-cols-4 bg-slate-50 p-1 rounded-xl border border-slate-100 text-[10px] sm:text-[11px] font-bold text-center">
            <button
              type="button"
              onClick={() => setTimeRange('3h')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${timeRange === '3h' ? 'bg-white shadow-xs text-health-green font-extrabold' : 'text-slate-500'}`}
            >
              3h
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('6h')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${timeRange === '6h' ? 'bg-white shadow-xs text-health-green font-extrabold' : 'text-slate-500'}`}
            >
              6h
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12h')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${timeRange === '12h' ? 'bg-white shadow-xs text-health-green font-extrabold' : 'text-slate-500'}`}
            >
              12h
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('24h')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${timeRange === '24h' ? 'bg-white shadow-xs text-health-green font-extrabold' : 'text-slate-500'}`}
            >
              24h
            </button>
          </div>
          <button
            type="button"
            onClick={() => setTimeRange('years')}
            className={`w-full py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${timeRange === 'years' ? 'bg-health-green text-white shadow-xs' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            历年体检记录对比
          </button>
        </div>
      </div>

      {/* Select Which report Indicator Code when in Comparative Years mode */}
      {timeRange === 'years' && (
        <div className={`flex flex-wrap gap-1.5 ${isCompact ? 'text-[10px]' : 'text-xs'}`} id="trends-indicator-selectors">
          <span className="text-slate-400 self-center font-bold mr-1">对比化验项:</span>
          {[
            { name: "空腹血糖", nameFull: "空腹血糖 (Glucose)", code: "glucose" },
            { name: "收缩压", nameFull: "收缩压 (BP SBP)", code: "sbp" },
            { name: "总胆固醇", nameFull: "总胆固醇 (Chol)", code: "cholesterol" },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setSelectedCode(item.code)}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl font-bold border transition-all ${
                selectedCode === item.code
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isCompact ? item.name : item.nameFull}
            </button>
          ))}
        </div>
      )}

      {/* Real-time Blood Glucose Core Numeric Big Card (Amanda's current status example / Selected Patient Highlight) */}
      {isCgmMode && selectedCode === 'glucose' && (
        <div className={`bg-slate-50/85 border border-slate-100 rounded-2xl ${isCompact ? 'p-3.5' : 'p-4 sm:p-5'} flex ${isCompact ? 'flex-col gap-3' : 'flex-col lg:flex-row justify-between items-start lg:items-center gap-4'} w-full overflow-hidden`}>
          <div className="min-w-0 max-w-full">
            <span className="inline-block text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
              最新数值 (CGM 传感器)
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight font-mono leading-none">
                  78
                </span>
                <span className="text-slate-500 text-xs sm:text-sm font-extrabold font-sans">mg/dL</span>
              </div>
              <span className="whitespace-nowrap inline-flex items-center gap-1 bg-emerald-500 text-white font-extrabold text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full shadow-xs shrink-0 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                正常
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans">
              测量时间: 12分钟前 · 强抗干扰葡萄糖氧化酶 (GOD) 电极传感器测定
            </p>
          </div>
          
          <div className={`flex ${isCompact ? 'grid grid-cols-2' : 'flex-wrap sm:flex-nowrap'} items-stretch gap-2.5 w-full lg:w-auto shrink-0 justify-start sm:justify-end`}>
            <div className="text-xs bg-white border border-slate-200/60 p-2 rounded-xl text-center shrink-0 flex flex-col justify-center min-w-[76px] shadow-2xs">
              <p className="text-[9px] text-slate-400 font-bold leading-none mb-1">传感器寿命</p>
              <p className="font-extrabold text-slate-700 whitespace-nowrap text-xs leading-none">剩余 14 天</p>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(window.location.href + "?action=bind_assistant");
                  alert("已成功复制医生与健康助手的连机绑定邀请链接！\n请将该链接发给微信家庭服务群或护理助理管家。");
                } catch (e) {
                  alert("健康医疗保障多账号联通秘钥已就绪。\n(可通过系统主面板生成多维密钥完成分发)");
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl p-2 px-3 text-xs text-left leading-tight shrink-0 flex flex-col justify-center cursor-pointer transition-all border-none font-sans min-w-[130px] shadow-xs"
            >
              <span className="font-extrabold whitespace-nowrap block">邀请并绑定助理</span>
              <span className="text-[8px] text-[#D1FAE5] mt-0.5 font-medium block truncate max-w-[124px]">
                完成多联机安全认证
              </span>
            </button>
          </div>
        </div>
      )}

      {/* RECHARTS PLOT DIAGRAM CONTAINER */}
      <div id="chart-canvas-view" className={`${isCompact ? 'h-[180px]' : 'h-[250px]'} w-full bg-white border border-slate-50/50 rounded-2xl p-2 relative`}>
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <BarChart2 className="w-12 h-12 text-slate-100 mb-1" />
            <p className="text-xs text-slate-400">缺少足够的体检报告或监测点生成图表趋势。</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={isCompact ? { top: 10, right: 10, left: -25, bottom: 0 } : { top: 20, right: 15, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2EBD85" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2EBD85" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey={isCgmMode ? "time" : "date"} 
                stroke="#94a3b8" 
                fontSize={10} 
                fontWeight={500}
                tickLine={false} 
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                domain={isCgmMode ? [40, 240] : ['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-[11px] font-sans">
                        <p className="font-bold text-slate-300">
                          {isCgmMode ? `监测时间: ${data.time}` : `体检报告: ${data.reportTitle}`}
                        </p>
                        <p className="mt-1 text-xs">
                          测定数值: <span className="text-emerald-400 font-mono font-bold text-sm">{payload[0].value}</span> {unitLabel}
                        </p>
                        {!isCgmMode && data.normalRange && (
                          <p className="text-slate-400 mt-0.5">参考标准: {data.normalRange} {unitLabel}</p>
                        )}
                        {isCgmMode && data.type && (
                          <p className="text-emerald-300 mt-0.5 font-semibold">状态: {data.type}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2EBD85" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                dot={{ stroke: '#2EBD85', strokeWidth: 3, r: 4, fill: '#FFFFFF' }}
                activeDot={{ r: 6, stroke: '#2EBD85', strokeWidth: 2, fill: '#FFFFFF' }}
              />
              
              {/* Reference Lines for Normal Guidelines */}
              {isCgmMode && selectedCode === 'glucose' && (
                <>
                  <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: '正常空腹上限 100', fill: '#94a3b8', fontSize: 9, position: 'insideTopLeft' }} />
                  <ReferenceLine y={70} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: '血糖下限 70', fill: '#94a3b8', fontSize: 9, position: 'insideBottomLeft' }} />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* STATISTICAL INDICATOR ROW */}
      <div className={`grid grid-cols-3 ${isCompact ? 'gap-2' : 'gap-4'}`} id="indicators-statistics-row">
        
        {/* Mean Box */}
        <div className={`bg-slate-50 border border-slate-100 hover:border-slate-200/50 rounded-2xl ${isCompact ? 'p-2' : 'p-3.5'} transition-all text-center`}>
          <p className="text-[9px] text-slate-400 font-bold uppercase truncate">平均值</p>
          <p className="text-base sm:text-2xl font-extrabold text-slate-800 font-mono mt-0.5 leading-none">
            {stats.mean || '--'}
          </p>
          <span className="text-[8px] text-slate-400 block mt-1 truncate">区间平稳</span>
        </div>

        {/* Max Box */}
        <div className={`bg-amber-50/50 border border-amber-100 hover:border-amber-200/50 rounded-2xl ${isCompact ? 'p-2' : 'p-3.5'} transition-all text-center`}>
          <p className="text-[9px] text-amber-600 font-bold uppercase truncate">最高值</p>
          <p className="text-base sm:text-2xl font-extrabold text-amber-700 font-mono mt-0.5 leading-none">
            {stats.max || '--'}
          </p>
          <span className="text-[8px] text-amber-500 block mt-1 truncate">高警惕上限</span>
        </div>

        {/* Min Box */}
        <div className={`bg-blue-50/50 border border-blue-100 hover:border-blue-200/50 rounded-2xl ${isCompact ? 'p-2' : 'p-3.5'} transition-all text-center`}>
          <p className="text-[9px] text-blue-600 font-bold uppercase truncate">最低值</p>
          <p className="text-base sm:text-2xl font-extrabold text-blue-700 font-mono mt-0.5 leading-none">
            {stats.min || '--'}
          </p>
          <span className="text-[8px] text-blue-500 block mt-1 truncate">过低警戒</span>
        </div>

      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Settings, ChevronRight, Apple, Heart, Compass, Sparkles, 
  User, Bell, Shield, BookOpen, AlertCircle, RefreshCw, Milestone, Users,
  MoreVertical, Share2, ClipboardList, Zap, ArrowRight, Star
} from 'lucide-react';
import { FamilyMember } from '../types';

interface GlucoseHomeProps {
  member: FamilyMember;
  onQuickAction: (actionKey: string) => void;
  onNavigateTab: (tabKey: 'dashboard' | 'family' | 'reports' | 'trends' | 'ai' | 'security') => void;
  addWxLog: (api: string, status: 'success' | 'warn' | 'info', detail: string) => void;
}

// Custom emoji peak point indicators to make the AreaChart 100% match the user's high-fidelity Screen 1 reference!
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  let emoji = "";
  if (payload.time === "07:20") emoji = "🥐"; // breakfast/donut peak
  else if (payload.time === "08:40") emoji = "💊"; // insulin injection drops/pill
  else if (payload.time === "10:00") emoji = "🥗"; // healthy salad
  else if (payload.time === "12:40") emoji = "🍲"; // lunch meal reaction

  return (
    <g>
      <circle cx={cx} cy={cy} r={4.5} fill="#743AF6" stroke="#FFFFFF" strokeWidth={2} />
      {emoji && (
        <g>
          {/* Subtle text background for the emoji to make it float crisply above the area curve line */}
          <text 
            x={cx} 
            y={cy - 12} 
            textAnchor="middle" 
            fontSize={14} 
            className="filter drop-shadow-sm select-none"
          >
            {emoji}
          </text>
        </g>
      )}
    </g>
  );
};

export default function GlucoseHome({ member, onQuickAction, onNavigateTab, addWxLog }: GlucoseHomeProps) {
  const [selectedRange, setSelectedRange] = useState<'3Hours' | '6Hours' | '12Hours' | '24Hours'>('6Hours'); // Default to 6 Hours active tab just like Screen 1 mockup!
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Core sensor measurement database according to requirements
  const cgmFullDataset = useMemo(() => {
    return [
      { time: "06:00", value: 124, type: "空腹测量" },
      { time: "07:20", value: 198, type: "餐后峰值" },
      { time: "08:40", value: 55,  type: "低血糖偏低点" },
      { time: "10:00", value: 140, type: "逐步恢复" },
      { time: "11:20", value: 120, type: "趋于平稳" },
      { time: "12:40", value: 158, type: "午餐反应" }
    ];
  }, []);

  // Filter series according to active range
  const currentChartData = useMemo(() => {
    switch (selectedRange) {
      case '3Hours':
        return cgmFullDataset.slice(0, 3);
      case '6Hours':
        return cgmFullDataset.slice(0, 4);
      case '12Hours':
        return cgmFullDataset;
      case '24Hours':
        return [
          { time: "02:00", value: 85, type: "深度睡眠期" },
          ...cgmFullDataset,
          { time: "14:00", value: 110, type: "午后稳定期" },
          { time: "18:00", value: 135, type: "晚餐反应" }
        ];
      default:
        return cgmFullDataset;
    }
  }, [selectedRange, cgmFullDataset]);

  // Invites reward flow trigger
  const handleInviteFriends = (e: React.MouseEvent) => {
    e.stopPropagation();
    addWxLog('wx.showShareMenu', 'success', '调用微信社交分享底盘。已配发生效优惠券代码：GC-FRIEND-10');
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="bg-[#F8F9FC] min-h-full font-sans select-none pb-12" id="glucose-home-page-container">
      
      {/* 1. Header (UI Design Optimized Top Bar) */}
      <div className="flex justify-between items-center pt-5 pb-3 px-5 bg-transparent sticky top-0 bg-[#F8F9FC]/95 backdrop-blur-md z-20" id="applet-custom-header">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            {member.name}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
            <span>传感器寿命</span>
            <span className="font-extrabold text-slate-800">剩余 14 天</span>
          </p>
        </div>
        <button
          onClick={() => onQuickAction('settings')}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer shadow-xs active:scale-95 transition-all"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 px-4 pb-4">

        {/* 2. Glassmorphic Radial Gradient Glucose Value Card - Redesigned to 100% Match Screen 1's Lavender White backdrop */}
        <div 
          className="bg-gradient-to-br from-[#EAE7FE] via-[#F4F3FF] to-[#FFFFFF] p-6 rounded-[32px] border border-white/60 shadow-md shadow-[#743AF6]/5 text-slate-800 relative overflow-hidden group"
          id="glucose-home-main-metric-card"
        >
          {/* Glowing Ambient Light Backdrops for premium feel */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-[#743AF6]/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          <div className="absolute left-1/4 bottom-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl" />

          {/* Card Top Label */}
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-6xl sm:text-7xl font-sans font-black tracking-tighter text-[#1D1B20] drop-shadow-sm">
                  78
                </span>
                <span className="text-sm font-extrabold tracking-tight text-[#743AF6] ml-1">
                  mg/dL
                </span>
                <span className="text-xl text-[#743AF6] ml-2 animate-pulse font-bold">→</span>
              </div>
            </div>

            {/* Right block: Last measured timing & status pill exactly matching Screen 1 colors */}
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="text-[11px] text-[#743AF6]/80 font-extrabold">
                12 min ago
              </span>
              <span className="bg-[#743AF6] text-white px-3 py-1 rounded-full text-[11px] font-black tracking-wide flex items-center gap-1.5 shadow-sm">
                👍 Good
              </span>
            </div>
          </div>

          {/* Decorative bottom lines */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 z-10 relative">
            <span className="font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              实时动态血糖感应器 (CGM) 对齐
            </span>
            <span className="font-mono bg-[#743AF6]/5 px-2 py-0.5 rounded-md text-[9px] border border-[#743AF6]/10 text-[#743AF6] font-bold">
              氧化酶电极正常
            </span>
          </div>
        </div>

        {/* 3. Modernized Segmented Time Selector */}
        <div className="bg-[#EFEEF8] p-1.5 rounded-[22px] flex justify-around items-center border border-transparent shadow-xs" id="glucose-time-tabs-row">
          {([
            { key: '3Hours', label: '3 Hours' },
            { key: '6Hours', label: '6 Hours' },
            { key: '12Hours', label: '12 Hours' },
            { key: '24Hours', label: '24 Hours' }
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedRange(tab.key);
                addWxLog('wx.request', 'success', `时序对比跨度切换：${tab.label}`);
              }}
              className={`flex-1 text-center py-2 text-xs font-bold rounded-2xl transition-all duration-300 cursor-pointer border-none ${
                selectedRange === tab.key 
                  ? 'bg-white text-[#743AF6] shadow-sm font-black scale-102' 
                  : 'text-[#98A2B3] hover:text-[#485363] bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Beautiful Horizontal scrollable quick menu with colored indicators */}
        <div 
          className="flex overflow-x-auto gap-3 py-1 pb-2 scrollbar-none scroll-smooth flex-nowrap -mx-4 px-4" 
          id="glucose-scroll-quick-bar"
        >
          {[
            { label: "体检设备分析", icon: "⚙️", key: "archive", color: "bg-[#743AF6]/10 text-[#743AF6]" },
            { label: "设置提醒", icon: "⏰", key: "reminder", color: "bg-[#AC60FA]/10 text-[#AC60FA]" },
            { label: "健康日志", icon: "📓", key: "metrics", color: "bg-blue-50 text-blue-600" },
            { label: "关注亲友", icon: "➕", key: "add_follow", color: "bg-pink-50 text-pink-500" },
            { label: "快捷校准", icon: "🎯", key: "calibrate", color: "bg-emerald-50 text-emerald-600" },
          ].map(tool => (
            <button
              key={tool.label}
              onClick={() => onQuickAction(tool.key)}
              className="flex flex-col items-center justify-center bg-white border border-slate-100 shadow-sm active:scale-95 transition-all rounded-2xl p-3 min-w-[98px] shrink-0 hover:border-[#743AF6]/30 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full ${tool.color} flex items-center justify-center text-xl shadow-xs mb-1.5`}>
                {tool.icon}
              </div>
              <span className="text-[11px] text-slate-700 font-extrabold whitespace-nowrap">
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        {/* 5. Minimalist, High-Contrast Recharts Area Curve Chart Section - With Today pill and Expander matching Screen 1 1:1! */}
        <div 
          className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4"
          id="glucose-home-recharts-card"
        >
          <div className="flex justify-between items-center pb-1">
            <button 
              onClick={() => addWxLog('wx.showActionSheet', 'info', '呼出快速日历选择窗口')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-xs font-black text-slate-700 transition-all cursor-pointer"
            >
              <span className="text-xs">📅</span>
              <span>今日</span>
            </button>
            
            <button 
              onClick={() => {
                addWxLog('wx.vibrateShort', 'success', '触感缩放');
                alert("进入全屏高清趋势波幅看盘模块的模拟...");
              }}
              className="text-slate-400 hover:text-slate-700 p-1 bg-slate-50 hover:bg-slate-150 rounded-lg border border-slate-100 transition-all cursor-pointer"
              title="全屏趋势"
            >
              {/* Expander icon ⤢ represented beautifully */}
              <span className="text-xs font-black block w-4 h-4 text-center leading-none">⤢</span>
            </button>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#743AF6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#743AF6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EAEAEE" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  stroke="#A3AED0" 
                  fontSize={10} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#A3AED0" 
                  fontSize={10} 
                  fontWeight={600}
                  tickLine={false} 
                  axisLine={false}
                  domain={[50, 240]} // domain representing screen 1 limits
                  ticks={[0, 70, 140, 210, 280]} // exact matching ticks on screen 1 mockup right edge!
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1C1C1E] text-white p-2.5 px-3 rounded-2xl shadow-xl border border-white/10 text-[10px] font-sans">
                          <p className="font-bold">时间: {payload[0].payload.time}</p>
                          <p className="font-black text-[#8042F3] mt-0.5 text-xs">
                            血糖: {payload[0].value} mg/dL
                          </p>
                          <p className="text-slate-400 mt-0.5 font-semibold text-[9px]">
                            类别: {payload[0].payload.type}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#743AF6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#glucoseGradient)" 
                  dot={<CustomDot />} // Feeding custom floating emojis exact with mockup screen 1
                  activeDot={{ r: 6, stroke: '#743AF6', strokeWidth: 2, fill: '#FFFFFF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-[9px] text-[#A3AED0] pt-2 border-t border-slate-50">
            <span>数据源: 智能生物传感器探极</span>
            <span>更新频率：1分钟自动同步</span>
          </div>
        </div>

        {/* 6. High-Contrast stats grid (Mean, Max, Min metrics row) - Perfectly styled after Screen 1 layout */}
        <div className="grid grid-cols-3 gap-1 divide-x divide-slate-100 bg-white rounded-2xl p-4 shadow-sm border border-slate-50" id="glucose-metrics-row-indicator">
          
          <div className="text-center">
            <p className="text-xl font-bold font-sans text-slate-800 leading-none">124</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-none">平均值 (mg/dL)</p>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold font-sans text-slate-800 leading-none">198</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-none">最高值 (mg/dL)</p>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold font-sans text-slate-800 leading-none">55</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-none">最低值 (mg/dL)</p>
          </div>

        </div>

        {/* 7. Beautiful Doctor-Recommendation Tip Banner (Mocking Middle Screen Dr. hi) */}
        <div 
          className="bg-white border border-slate-100 p-4 rounded-[28px] shadow-sm flex items-center gap-3"
          id="glucose-health-knowledge-section"
        >
          {/* Dr. Avatar representation */}
          <div className="relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120" 
              alt="医生"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-100"
            />
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full text-[8px] font-bold px-1 py-0.5 leading-none shadow-sm">
              Hi~
            </span>
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-[#743AF6] uppercase">
              DAILY HEALTH KNOWLEDGE
            </span>
            <p className="text-slate-700 font-extrabold text-xs leading-relaxed mt-0.5">
              如果您习惯的主食早餐引起了晨间血糖起伏，建议适当采用少量低糖高纤维杂粮。
            </p>
          </div>
        </div>

        {/* 8. Beautiful Styled promo "Invite Friends" card (Designed after Screen 3's overlay design) */}
        <div 
          onClick={handleInviteFriends}
          className="bg-gradient-to-r from-[#171A21] via-[#242835] to-[#1E212D] text-white p-5 rounded-[28px] overflow-hidden relative shadow-lg cursor-pointer group active:scale-99 transition-all"
          id="invite-friends-reward-card"
        >
          {/* Golden Badge Light Accent */}
          <div className="absolute right-4 top-4 w-12 h-12 bg-amber-400/15 rounded-full blur-xl group-hover:bg-amber-400/25 transition-all" />
          <div className="absolute top-4 right-4 text-amber-400 text-xl animate-bounce">
            🏆
          </div>

          <div className="z-10 relative space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-400 text-[#171A21] text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
                Coupon Reward
              </span>
              <span className="text-slate-400 text-[10px] font-medium">推荐特惠</span>
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Invite Friends
              </h3>
              <p className="text-slate-300 text-xs mt-0.5 font-medium leading-relaxed max-w-[280px]">
                每邀请一位好友加入健康仓，双方均可立享官方 <span className="text-amber-400 font-extrabold">10% Off 折扣特惠</span> 兑换券。
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <span className="text-[10px] bg-white/10 px-3 py-1.5 rounded-xl text-slate-200 font-extrabold border border-white/5 whitespace-nowrap">
                {copiedCoupon ? "✓ 已分发10%优惠券：GC-FRIEND-10" : "分享微信好友以完成邀新对齐"}
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 9. Comprehensive visual dashboard list panel (Styled after Settings screen list menu) */}
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden" id="dashboard-menu-settings-styled">
          {[
            { label: "体检配套设备", value: "222222H3GA", icon: "⚙️", key: "security" },
            { label: "吃药与测糖提醒设置", value: "已启动推送", icon: "⏰", key: "ai" },
            { label: "化验日志与医学报告单", value: "3件已归档", icon: "📓", key: "reports" },
            { label: "快速校正生理传感器", value: "随时可用", icon: "🎯", key: "trends" }
          ].map((item, idx, arr) => (
            <button
              key={item.label}
              onClick={() => {
                onNavigateTab(item.key as any);
                addWxLog('wx.navigateTo', 'info', `快速导航至 /pages/${item.key}`);
              }}
              className={`w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition-all cursor-pointer border-none bg-transparent ${
                idx !== arr.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="text-slate-800 font-extrabold text-xs">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[10px] font-bold text-slate-400">{item.value}</span>
                <ChevronRight className="w-4 h-4 shrink-0 text-slate-300" />
              </div>
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}

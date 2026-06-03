/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronRight, Award, Compass, Heart, Bell, BookOpen, UserPlus, Sliders, Settings 
} from 'lucide-react';
import { FamilyMember } from '../types';

interface UserProfileProps {
  member: FamilyMember;
  onNavigateTab: (tabKey: 'dashboard' | 'family' | 'reports' | 'trends' | 'ai' | 'security') => void;
  onQuickAction: (actionKey: string) => void;
  addWxLog: (api: string, status: 'success' | 'warn' | 'info', detail: string) => void;
}

export default function UserProfile({ member, onNavigateTab, onQuickAction, addWxLog }: UserProfileProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = () => {
    addWxLog('wx.setClipboardData', 'success', '优惠口令 [GC-FRIEND-10] 已复制到剪切板');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans select-none pb-12" id="user-profile-subpage">
      
      {/* 1. Account Identity Header */}
      <div className="flex items-center justify-between bg-transparent pt-3 px-1">
        <div className="flex items-center gap-3">
          <img 
            src={member.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"} 
            alt={member.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              {member.name}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold mt-1 tracking-wide">
              @wenjuan988009
            </p>
          </div>
        </div>
        
        {/* Golden medal badge representation on top right */}
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shadow-xs">
          <span className="text-xl">🏆</span>
        </div>
      </div>

      {/* 2. Premium "Invite Friends" Card (Screen 3 style) */}
      <div 
        onClick={handleCopyCoupon}
        className="relative bg-gradient-to-r from-[#1E2130] via-[#12141F] to-[#1C1F2E] text-white p-5 rounded-[28px] overflow-hidden shadow-md cursor-pointer group active:scale-99 transition-all"
        style={{
          backgroundImage: `linear-gradient(rgba(18, 20, 31, 0.85), rgba(18, 20, 31, 0.95)), url('https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=500')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="z-10 relative space-y-3">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            邀请亲友
          </h3>
          
          {/* White floating pill coupon badge styled exactly as shown on Screen 3 mockup */}
          <div>
            <span className="inline-block bg-white text-slate-900 text-[10px] font-black px-4 py-2 rounded-full shadow-sm pr-6 border border-slate-100">
              推荐每位好友享 9 折优惠
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-[280px]">
            点击卡片快速复制邀新专属口令。推荐亲属，共同配对动态生物监测波幅。
          </p>

          {copied && (
            <span className="absolute bottom-2 right-4 text-[9px] bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded-md animate-pulse">
              ✓ 口令已成功复制到剪纸板！
            </span>
          )}
        </div>
      </div>

      {/* 3. Sleek Menu Selection List (Screen 3 style with violet custom icons) */}
      <div className="space-y-3">
        
        {/* Main interactive settings block */}
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          
          {/* Row 1: Equipment */}
          <button 
            onClick={() => onQuickAction('calibrate')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">体检配套设备</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold pr-1">222222H3GA</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          {/* Row 2: Reminder Setting */}
          <button 
            onClick={() => onQuickAction('reminder')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">服药与测糖提醒</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 pr-1">已激活</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          {/* Row 3: Logbook */}
          <button 
            onClick={() => onNavigateTab('reports')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">化验医学历史归档</span>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          {/* Row 4: Add Follow */}
          <button 
            onClick={() => onNavigateTab('family')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">绑定关注家属子女</span>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          {/* Row 5: Calibrate */}
          <button 
            onClick={() => onQuickAction('calibrate')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <Sliders className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">感应极快速阻抗校正</span>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

        </div>

        {/* Individual Settings Gap Block (Matches gap in Screen 3) */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <button 
            onClick={() => onNavigateTab('security')}
            className="w-full flex justify-between items-center p-4 hover:bg-slate-50/50 transition-all cursor-pointer border-none bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0EEFF] text-[#743AF6] flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-[#743AF6]" />
              </div>
              <span className="text-slate-800 font-extrabold text-xs">私密权限与密钥库</span>
            </div>
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </div>

      </div>

    </div>
  );
}

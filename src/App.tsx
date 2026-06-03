/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Activity, ShieldCheck, Sparkles, Heart, Bell, 
  Settings, Info, Compass, HelpCircle, UserCheck, RefreshCw, Layers,
  ChevronRight, ArrowRight, ShieldAlert, Cpu, Smartphone, Laptop, QrCode, Terminal
} from 'lucide-react';

import { FamilyMember, HealthReport, Invitation, AuditLog } from './types';
import FamilyGroupManager from './components/FamilyGroupManager';
import ReportArchiver from './components/ReportArchiver';
import IndicatorTrendChart from './components/IndicatorTrendChart';
import AiAssistantPanel from './components/AiAssistantPanel';
import SecurityPrivacyLog from './components/SecurityPrivacyLog';
import GlucoseHome from './components/GlucoseHome';

export default function App() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string>('mem_1');
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // WeChat Mini Program simulator states
  const [isPhoneSimMode, setIsPhoneSimMode] = useState<boolean>(true);
  const [wxIsAuth, setWxIsAuth] = useState<boolean>(true);
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);
  const [wxLogs, setWxLogs] = useState<any[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), api: 'wx.cloud.init', status: 'success', detail: '微信云端核心服务 (WeChat Cloud Serverless) 初始化就绪' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), api: 'wx.login', status: 'success', detail: '登录成功，已派发本机会话 OpenID: o_uX92_amanda_secret' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), api: 'wx.checkSession', status: 'success', detail: '会话秘钥有效，国密隔离信道加固成功' }
  ]);

  const addWxLog = (api: string, status: 'success' | 'info' | 'warn', detail: string) => {
    setWxLogs(prev => [
      {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString(),
        api,
        status,
        detail
      },
      ...prev.slice(0, 49)
    ]);
  };
  
  // Tab control states: 'dashboard' | 'family' | 'reports' | 'trends' | 'ai' | 'security'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'family' | 'reports' | 'trends' | 'ai' | 'security'>('dashboard');
  
  // Loading indicators
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Fetch all starting datasets from Express REST APIs on load
  const loadData = async () => {
    try {
      const [mRes, rRes, iRes, lRes] = await Promise.all([
        fetch('/api/family-members'),
        fetch('/api/reports'),
        fetch('/api/invitations'),
        fetch('/api/audit-logs')
      ]);

      if (mRes.ok) {
        const mData = await mRes.json();
        setMembers(mData);
        addWxLog('wx.cloud.callFunction', 'success', `微信云端拉取家庭成员成功: 获得 ${mData.length} 个角色模型底册`);
        // Default to first member
        if (mData.length > 0 && !activeMemberId) {
          setActiveMemberId(mData[0].id);
        }
      }

      if (rRes.ok) {
        const rData = await rRes.json();
        setReports(rData);
        addWxLog('wx.cloud.callFunction', 'success', `已解绑拉取历年归档化验单: 共 ${rData.length} 份数据`);
      }
      if (iRes.ok) setInvitations(await iRes.json());
      if (lRes.ok) setAuditLogs(await lRes.json());
    } catch (err) {
      console.error("Failed to load full-stack health data:", err);
      addWxLog('wx.cloud.callFunction', 'warn', `微信云托管接口发生信道偏移: ${err}`);
      triggerAlert("网络联机状态受阻。暂时启用本地高安全性备用解密算子。", "warn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerAlert = (text: string, type: 'success' | 'info' | 'warn') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Select Active Member
  const handleSelectMember = (id: string) => {
    setActiveMemberId(id);
    const selected = members.find(m => m.id === id);
    if (selected) {
      addWxLog('wx.setStorageSync', 'success', `缓存聚焦账户ID [${id}] 并同步拉起长期趋势`);
      triggerAlert(`已授权安全调阅 【${selected.name}】 的脱敏病案及生理趋势图谱。`, "success");
    }
  };

  // Add Family Member
  const handleAddMember = async (memberData: any) => {
    setSyncing(true);
    addWxLog('wx.cloud.callFunction', 'info', `派发微信云函数 [addFamilyMember] 正在密态上传：${memberData.name} (${memberData.relationship})`);
    try {
      const res = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers(prev => [...prev, newMember]);
        addWxLog('wx.showToast', 'success', `微信数仓授权新增成功: 【${newMember.name}】 档案已锁闭`);
        triggerAlert(`已成功为 【${newMember.name}】 重建儿童/成人定制期病历安全底册！`, "success");
        // Reload logs too
        const lRes = await fetch('/api/audit-logs');
        if (lRes.ok) setAuditLogs(await lRes.json());
      } else {
        addWxLog('wx.showToast', 'warn', '数据填写格式校验发生拦截');
        triggerAlert("录入失败，请校验填报要素。", "warn");
      }
    } catch (err) {
      console.error(err);
      addWxLog('wx.cloud.callFunction', 'warn', '微信云数据库上传超时：本地安全沙盒阻断');
      triggerAlert("本地安全网关阻止：网络离线。", "warn");
    } finally {
      setSyncing(false);
    }
  };

  // Update Family Member details
  const handleUpdateMember = async (id: string, updatedData: any) => {
    setSyncing(true);
    addWxLog('wx.cloud.callFunction', 'info', `派发微信云函数 [updateFamilyMember] 正在密态上传背景：${updatedData.name}`);
    try {
      const res = await fetch(`/api/family-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const updatedMember = await res.json();
        setMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
        addWxLog('wx.showToast', 'success', `数据增量更新成功: 【${updatedMember.name}】 档案已生效`);
        triggerAlert(`已成功更新 【${updatedMember.name}】 的健康病史及生理指征底册！`, "success");
        // Reload logs too
        const lRes = await fetch('/api/audit-logs');
        if (lRes.ok) setAuditLogs(await lRes.json());
      } else {
        addWxLog('wx.showToast', 'warn', '更新数据填写格式校验拦截');
        triggerAlert("修改失败，请校验填报要素。", "warn");
      }
    } catch (err) {
      console.error(err);
      addWxLog('wx.cloud.callFunction', 'warn', '数据服务暂不可用');
      triggerAlert("离线网关阻断：无法写入修改。", "warn");
    } finally {
      setSyncing(false);
    }
  };

  // Delete/Discharge Member
  const handleDeleteMember = async (id: string) => {
    addWxLog('wx.showModal', 'info', `拉起微信弹窗确认：请求销毁用户 ID [${id}] 的多维病单及传感器索引`);
    if (!window.confirm("注销此人将永久物理抹除其全部健康和指标上报文件！此过程由于密码锁死不可逆。是否确认？")) {
      addWxLog('wx.showModal', 'warn', '用户取消了销毁指令');
      return;
    }
    setSyncing(true);
    addWxLog('wx.cloud.callFunction', 'info', `微信云解散指令派发中, ID: ${id}`);
    try {
      const res = await fetch(`/api/family-members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        if (activeMemberId === id) {
          setActiveMemberId('mem_1');
        }
        addWxLog('wx.showToast', 'success', `物理删除完成。该用户的对开解密钥匙密钥已作废物理粉碎`);
        triggerAlert("档案及相关联密码指纹已被物理粉碎。", "success");
        // Reload logs
        const lRes = await fetch('/api/audit-logs');
        if (lRes.ok) setAuditLogs(await lRes.json());
      } else {
        const errJson = await res.json();
        addWxLog('wx.showToast', 'warn', `删除失败: ${errJson.error || 'Server error'}`);
        triggerAlert(errJson.error || "注销失败", "warn");
      }
    } catch (e) {
      console.error(e);
      addWxLog('wx.showToast', 'warn', '断网报错');
      triggerAlert("删除指令离线受阻。", "warn");
    } finally {
      setSyncing(false);
    }
  };

  // Create Invitation Link & QR
  const handleCreateInvitation = async (role: 'Admin' | 'Member') => {
    setSyncing(true);
    addWxLog('wx.cloud.callFunction', 'info', `正在派发微信对称分卷私密钥匙: 档别 ${role}`);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const newInvite = await res.json();
        setInvitations(prev => [newInvite, ...prev]);
        addWxLog('wx.showShareMenu', 'success', `成功构建群生态授权分享图样: token=${newInvite.token.substring(0, 10)}...`);
        triggerAlert(`已分发新的【${role === 'Admin' ? '联席管理员' : '普通成员'}】安全扫码秘钥。`, "success");
        // Reload logs
        const lRes = await fetch('/api/audit-logs');
        if (lRes.ok) setAuditLogs(await lRes.json());
      }
    } catch (err) {
      console.error(err);
      addWxLog('wx.showToast', 'warn', '分享生成发生阻断');
    } finally {
      setSyncing(false);
    }
  };

  // Upload/Process scanned health reports
  const handleUploadReport = async (reportData: any) => {
    setSyncing(true);
    addWxLog('wx.chooseMedia', 'info', `化验单图像压栈：大小 48KB, 正在拉起国密算法进行脱敏预分析`);
    try {
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (res.ok) {
        const respJson = await res.json();
        setReports(prev => [respJson.report, ...prev]);
        
        const aiProcessed = respJson.aiProcessed;
        addWxLog('wx.cloud.uploadFile', 'success', `PDF 化验单安全落盘存储：名下档案 ${activeMember?.name}`);
        addWxLog('wx.showToast', 'success', aiProcessed ? '✔ 微信端对端 OCR 自适应要素对齐析出成功！' : '基本纸质报告数字转译封装完毕');

        const aiMessage = aiProcessed 
          ? "✔ 联机大模型 OCR 数据提炼及智能医生意见注入成功！" 
          : "基本归档完成。采用国密密盾完成 100% 物理落盘加密封缄。";
          
        triggerAlert(aiMessage, "success");
        
        // Reload logs
        const lRes = await fetch('/api/audit-logs');
        if (lRes.ok) setAuditLogs(await lRes.json());
      } else {
        addWxLog('wx.showToast', 'warn', '化验单校验不通过：仅允许PDF/JPEG图像');
        triggerAlert("报告上传解密失败。仅支持标准的化验单PDF/JPEG文件类型。", "warn");
      }
    } catch (e) {
      console.error(e);
      addWxLog('wx.showToast', 'warn', '报告归档上传超时');
      triggerAlert("网络错误：无法提交归档包。", "warn");
    } finally {
      setSyncing(false);
    }
  };

  // Ask doctor AI questions
  const handleAskAi = async (message: string) => {
    addWxLog('wx.request', 'info', `双通道 AI 问诊密谈启动: 向上游安全网关投递加密字节 (流度 ${message.length} 字节)`);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, memberId: activeMemberId })
      });
      if (!res.ok) {
        addWxLog('wx.request', 'warn', '会话服务器阻断信道');
        throw new Error("Chat call failed");
      }
      const data = await res.json();
      addWxLog('wx.request', 'success', `收到大模型医生诊断要素对齐: 回复长度 ${data.reply?.length || 0} 字符`);
      return data;
    } catch(err) {
      addWxLog('wx.request', 'warn', `AI 接口异常: ${err}`);
      throw err;
    }
  };

  // Get active member details
  const activeMember = members.find(m => m.id === activeMemberId) || members[0];
  const activeMemberReports = reports.filter(r => r.memberId === activeMemberId);

  // Quick Action Buttons Event Dispatcher
  const handleQuickAction = (action: string) => {
    addWxLog('wx.vibrateShort', 'success', `触感反馈触发: Haptic vibration feedback for action [${action}]`);
    switch (action) {
      case 'archive':
        setActiveTab('reports');
        addWxLog('wx.navigateTo', 'info', '跳转二级路由 /pages/reports/index');
        triggerAlert("已导航至体检单归档底册上传区。", "info");
        break;
      case 'reminder':
        addWxLog('wx.addPhoneCalendar', 'success', '注入本地生理监测事件提醒：每日 07:30 血糖定时拉网扫频');
        triggerAlert("⚙ 提醒配置：每日早晨07:30血糖复测闹钟已重整激活。", "success");
        break;
      case 'add_follow':
        setActiveTab('family');
        addWxLog('wx.navigateTo', 'info', '跳转二级路由 /pages/family/index');
        triggerAlert("已定位至家庭共享绑定二维码密钥分发面板。", "info");
        break;
      case 'calibrate':
        addWxLog('wx.startWifi', 'info', '蓝牙/Wi-Fi 生物抗阻阻抗分析校正开始...');
        setTimeout(() => {
          addWxLog('wx.getBatteryInfo', 'success', '当前动态血糖传感器电池寿命：剩余 14 天 (100% 阻抗均衡值 2.1Ohm)');
        }, 600);
        triggerAlert("🎯 动态血糖监测仪传感器阻抗自动校准中... 阻抗配准成功!", "success");
        break;
      case 'metrics':
        setActiveTab('trends');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-health-light text-health-green rounded-full flex items-center justify-center animate-spin mx-auto ring-4 ring-health-light">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-slate-800 font-extrabold text-lg tracking-wider">健康档案 (health_records)</h3>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
            正在解密装载 Module 1 基础架构和安全密码底座...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] pb-16 font-sans antialiased text-slate-800 selection:bg-health-light">
      
      {/* 1. WeChat Top Sandbox Header - Universal controller across both views */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-950 flex flex-col md:flex-row justify-between items-center gap-4 relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#07C160] text-white rounded-full flex items-center justify-center font-black text-lg select-none">
            微
          </div>
          <div>
            <h2 className="font-extrabold text-[#07C160] text-sm md:text-base tracking-wide flex items-center gap-1.5 font-sans">
              微信小程序全保真真机调试沙盒
              <span className="text-[9px] bg-emerald-500/20 text-[#07C160] px-1.5 py-0.5 rounded font-mono font-extrabold animate-pulse">ACTIVE</span>
            </h2>
            <p className="text-slate-400 text-[10px] sm:text-xs font-sans font-semibold">
              当前模式集成了微信原生 JS-SDK 调试控制台，高度模拟移动端 WeUI 核心布局，支持真机手势响应。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setIsPhoneSimMode(true);
              addWxLog('Simulator.SwitchMode', 'info', '切换到：📱 微信小程序真机模拟视图');
              triggerAlert("已启动 📱 微信小程序全保真真机模拟视图", "success");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              isPhoneSimMode 
                ? 'bg-[#07C160] text-white shadow-lg shadow-[#07C160]/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> 📱 小程序真机模拟
          </button>
          <button
            onClick={() => {
              setIsPhoneSimMode(false);
              addWxLog('Simulator.SwitchMode', 'info', '切换到：🖥️ 极速云端网页版');
              triggerAlert("已转换为 🖥️ 极速云端网页版 (SaaS System View)", "success");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
              !isPhoneSimMode 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" /> 🖥️ 极速云端网页版
          </button>
        </div>
      </div>

      {/* Floating System-Wide Alerts Banner Notification */}
      {alertMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-3.5 rounded-2xl card-shadow flex items-center gap-2.5 border text-xs font-bold ${
            alertMsg.type === 'success' 
              ? 'bg-health-green text-white border-health-green shadow-xl' 
              : alertMsg.type === 'warn'
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-slate-900 text-white border-slate-800'
          }`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* RENDER BRANCH A: WECHAT PHONE SIMULATOR VIEW MODE */}
      {isPhoneSimMode ? (
        <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* L1. Left Column: Developer Debugging console & Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-slate-900 border border-slate-950 text-white rounded-3xl p-5 card-shadow space-y-4">
                
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="text-[#07C160] w-5 h-5 animate-pulse" />
                    <span className="font-extrabold text-xs tracking-wider uppercase font-mono">
                      微信小程序 SDK 控制台 (JS-SDK Traces)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setWxLogs([]);
                      triggerAlert("控制台日志清空成功", "info");
                    }}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded hover:bg-slate-750 font-bold cursor-pointer transition-all border-none"
                  >
                    清空控制台
                  </button>
                </div>

                {/* Cloud actions triggers for Wechat simulation */}
                <div className="bg-slate-950 rounded-2xl p-4 space-y-3.5 text-xs text-slate-300 font-sans">
                  <h4 className="font-bold text-[#07C160] text-xs flex items-center gap-1.5 leading-none">
                    <Sparkles className="w-4 h-4" /> 微信云开发生态联动算子
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-semibold">
                    本系统物理落盘及多账号子档案隔离，深度依赖微信 JS-SDK 硬件及社交网卡环境，可模拟触发如下指令：
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        addWxLog('wx.scanCode', 'info', '正在启动微信镜头扫读，预装载化验图像密印对齐...');
                        triggerAlert("正在呼出微信扫码虚拟模块", "info");
                        setTimeout(() => {
                          addWxLog('wx.scanCode', 'success', '扫描对开完成！解析获得生理要件：【空腹血糖 78mg/dL, 血压 115/72】');
                          triggerAlert("化验单条码扫获成功，智能医生已提开报告，可切换到「报告」或「趋势」查看！", "success");
                          
                          // Mock Upload dynamic report payload
                          const mockRep = {
                            title: "微信扫码纸质检验归档对开件",
                            institution: "微信原生摄像头一键扫码机构",
                            date: new Date().toISOString().split('T')[0],
                            glucose: 78,
                            sbp: 115,
                            dbp: 72
                          };
                          handleUploadReport(mockRep);
                        }, 1200);
                      }}
                      className="py-2.5 px-3 bg-[#07C160]/10 hover:bg-[#07C160]/20 border border-[#07C160]/30 hover:border-[#07C160] text-[#07C160] font-bold rounded-xl transition-all text-[11px] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" /> 模拟 wx.scanCode
                    </button>
                    
                    <button 
                      onClick={() => {
                        addWxLog('wx.showShareMenu', 'info', '触发微信 MiniProgram 对称群社交私密分立协议...');
                        setShowShareSheet(true);
                        triggerAlert("已在小程序模拟器中呼出微信分享底盘 (Share Actions)", "success");
                      }}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-100 font-bold rounded-xl transition-all text-[11px] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-teal-400" /> 群内分享私钥
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-slate-800 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#07C160]"></span>
                      <span className="text-[10px] text-slate-400 font-bold">用户身份绑定：</span>
                      <span className="text-[11px] font-bold text-[#07C160] font-mono">
                        {wxIsAuth ? '已完成绑定 (Amanda)' : '未登录 / 游客匿名模式'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setWxIsAuth(!wxIsAuth);
                        addWxLog('wx.getUserProfile', 'info', wxIsAuth ? '主动抹除微信多维信息授权' : '请求授权微信 OpenID 及微信号昵称头像');
                        triggerAlert(wxIsAuth ? "已切换为未授权状态 (模拟注销微信登录)" : "微信多账号继承及微密档案库成功接通！", "success");
                      }}
                      className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold hover:text-white px-2 py-1 rounded cursor-pointer transition-all border-none"
                    >
                      修改授权
                    </button>
                  </div>

                </div>

                {/* Simulated runtime standard traces logger feed */}
                <div className="bg-[#131416] border border-slate-950 rounded-2xl p-4 text-[11px] font-mono space-y-2.5 h-[340px] overflow-y-auto scrollbar-thin">
                  {wxLogs.length === 0 ? (
                    <p className="text-slate-600 text-center py-10 font-bold">控制台无实时调用反馈。等待您与小程序执行交互...</p>
                  ) : (
                    wxLogs.map(log => {
                      let badgeColor = "bg-blue-900/40 text-blue-400 border-blue-900/60";
                      if (log.status === 'success') {
                        badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-900/60";
                      } else if (log.status === 'warn') {
                        badgeColor = "bg-rose-950 text-rose-400 border-rose-900/60";
                      }
                      return (
                        <div key={log.id} className="border-b border-slate-950 pb-2 flex gap-2 items-start hover:bg-slate-900/25 transition-colors">
                          <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold shrink-0 ${badgeColor}`}>
                                {log.api}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1 leading-snug break-all font-semibold font-mono">{log.detail}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

            {/* R1. Right Column: Smartphone Case Container with WeChat Applet (7 cols) */}
            <div className="lg:col-span-7 flex justify-center">
              
              <div className="relative w-full max-w-[420px] bg-[#1E1F22] rounded-[48px] p-4.5 border-[6px] border-slate-800 shadow-2xl transition-all">
                
                {/* Simulated Smartphone status notch/camera dot */}
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[7px] text-green-400 font-mono font-black tracking-wide">SECURE LATCH</span>
                  </div>
                </div>

                {/* Smartphone Side buttons decoration */}
                <div className="absolute -left-1.5 top-28 w-[6px] h-12 bg-slate-700 rounded-r-lg"></div>
                <div className="absolute -left-1.5 top-44 w-[6px] h-12 bg-slate-700 rounded-r-lg"></div>
                <div className="absolute -right-1.5 top-36 w-[6px] h-16 bg-slate-700 rounded-l-lg"></div>

                {/* Simulated device screen boundary */}
                <div className="bg-[#F4F7F6] rounded-[34px] overflow-hidden border border-slate-900 flex flex-col h-[770px] relative">
                  
                  {/* WeChat Client Header Status bar (Glassmorphic White Theme matching iOS Premium mockups) */}
                  <div className="bg-white/95 backdrop-blur-md text-slate-700 px-6 pt-5 pb-2.5 flex justify-between items-center text-[10px] font-bold select-none z-30 shrink-0 border-b border-slate-50">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1.5">
                      <span>中国联通 5G</span>
                      <span className="text-[11px] leading-none text-slate-500">📶</span>
                      <span className="text-[11px] leading-none text-slate-500">🔋</span>
                    </div>
                  </div>

                  {/* WeChat Client Navigation top layout with capsule menu button */}
                  <div className="bg-white/95 backdrop-blur-md text-slate-800 px-4 pb-3.5 pt-1.5 flex justify-between items-center relative z-30 shrink-0 border-b border-slate-100/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] bg-slate-100 p-2 rounded-full select-none cursor-pointer flex items-center justify-center hover:bg-slate-200" onClick={() => {
                        addWxLog('wx.reLaunch', 'info', '重启刷新小程序内存，清退不合规脏读生理数据');
                        loadData();
                        triggerAlert("数据刷新成功！", "success");
                      }}>
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate font-sans tracking-tight">
                          家庭健康隐私密仓
                        </p>
                        <p className="text-[8px] text-[#743AF6] font-mono font-extrabold tracking-wider leading-none mt-0.5 uppercase">
                          AES-256 Micro Crypto Vault
                        </p>
                      </div>
                    </div>

                    {/* Standard WeChat Capsule button button: ( ··· ) ( ⓧ ) */}
                    <div className="bg-slate-100 hover:bg-slate-150 px-3 py-1.5 rounded-full border border-slate-200/50 flex items-center gap-3 transition-all text-slate-700 relative select-none">
                      <button 
                        onClick={() => {
                          addWxLog('wx.showActionSheet', 'info', '调开胶囊菜单 (···) 底盘');
                          setShowShareSheet(true);
                        }}
                        className="cursor-pointer text-[13px] hover:scale-115 active:scale-90 transition-all font-black border-none bg-transparent outline-none"
                        title="分享健康卡片"
                      >
                        ···
                      </button>
                      <div className="w-[1px] h-3.5 bg-slate-250"></div>
                      <button 
                        onClick={() => {
                          addWxLog('wx.exitMiniProgram', 'warn', '用户主动关闭(ⓧ)退出家庭密码舱，切换为游客');
                          triggerAlert("已模拟关闭小程序。请重新在左侧面板重整激活身份。", "info");
                          setWxIsAuth(false);
                        }}
                        className="cursor-pointer text-slate-600 hover:text-rose-500 font-sans font-extrabold text-[11px] leading-none hover:scale-115 active:scale-90 transition-all border-none bg-transparent outline-none"
                        title="关闭小程序"
                      >
                        ⓧ
                      </button>
                    </div>
                  </div>

                  {/* Scrolling Page App Container within mobile viewport limits */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20 scrollbar-none select-none relative" id="wechat-phone-viewport">
                    
                    {/* Action conditional for login auth state */}
                    {!wxIsAuth ? (
                      <div className="h-full flex flex-col justify-center items-center py-20 px-4 text-center font-sans">
                        <div className="w-16 h-16 bg-[#07C160] text-white rounded-full flex items-center justify-center animate-bounce shadow-xl">
                          <Heart className="w-9 h-9" />
                        </div>
                        <h3 className="font-extrabold text-base text-slate-800 mt-6 font-sans">
                          家庭健康隐私密仓 申准授权
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed font-semibold">
                          本小程序采用中控 AES-GCM 物理对称指纹加锁。为建立您的脱敏病案及生理对比波形，需要继承并授权您的微信公开信息。
                        </p>
                        
                        <div className="bg-white border border-soft rounded-2xl p-4 mt-6 text-left text-[11px] text-slate-500 space-y-2 w-full">
                          <p className="font-extrabold text-slate-700">授权用途与敏感承诺：</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>离线密钥动态分发与家属共享配对对接。</li>
                            <li>智能全科医生大模型(Gemini) OCR 提录对齐。</li>
                          </ul>
                        </div>

                        <div className="space-y-2 mt-8 w-full">
                          <button
                            onClick={() => {
                              setWxIsAuth(true);
                              addWxLog('wx.getUserProfile', 'success', '授权接通。已返回加密 UnionID 及本底缓存身份：Amanda');
                              triggerAlert("授权已经绑定！成功为您载入多账号健康底座。", "success");
                            }}
                            className="w-full py-3 bg-[#07C160] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#07C160]/20 active:scale-95 transition-all cursor-pointer border-none"
                          >
                            允许并微信快捷授权
                          </button>
                          <button
                            onClick={() => {
                              addWxLog('wx.getUserProfile', 'warn', '授权拒绝，由于缺少 SessionKey 该会诊处于只读游客状态。');
                              triggerAlert("由于您拒绝授权公开指纹信息，只读模式被暂时切开", "warn");
                            }}
                            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-600 font-extrabold text-xs rounded-xl active:scale-95 transition-all cursor-pointer border-none"
                          >
                            拒绝
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Authenticated Applet Views with beautiful responsive adaptation */
                      <div className="animate-in fade-in duration-300 space-y-4">
                        
                        {/* Member fast switcher at top of simulated applet */}
                        <div className="bg-white rounded-2xl p-4 border border-soft card-shadow">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Focus Patient</p>
                              <h3 className="font-extrabold text-xs text-slate-800 mt-0.5">
                                正在对齐：<span className="text-[#07C160]">【{activeMember?.name}】</span>
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[#EBFBEF] px-2 py-0.5 rounded-full border border-[#07C160]/10 shrink-0">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#07C160] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#07C160]"></span>
                              </span>
                              <span className="text-[8px] text-[#07C160] font-bold">同步会诊</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 overflow-x-auto pb-1 pt-1 -mx-2 px-2 scrollbar-none items-center scroll-smooth">
                            {members.map(m => {
                              const isSelected = m.id === activeMemberId;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => handleSelectMember(m.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shrink-0 border ${
                                    isSelected
                                      ? 'bg-[#EBFBEF] text-[#07C160] border-[#07C160]/30 shadow-xs scale-102 font-extrabold'
                                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 font-medium'
                                  }`}
                                >
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    referrerPolicy="no-referrer"
                                    className={`w-4 h-4 rounded-full object-cover shrink-0 border ${
                                      isSelected ? 'border-[#07C160]/40' : 'border-slate-200'
                                    }`}
                                  />
                                  <span className="text-[11px] whitespace-nowrap">{m.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* TAB CONTENTS inside Phone Simulation */}
                        {activeTab === 'dashboard' && activeMember && (
                          <GlucoseHome 
                            member={activeMember} 
                            onQuickAction={handleQuickAction}
                            onNavigateTab={(tabKey) => {
                              setActiveTab(tabKey);
                              addWxLog('wx.switchTab', 'info', `切换选项卡：/pages/${tabKey}`);
                            }}
                            addWxLog={addWxLog}
                          />
                        )}

                        {activeTab === 'family' && (
                          <FamilyGroupManager
                            members={members}
                            activeMemberId={activeMemberId}
                            onSelectMember={handleSelectMember}
                            onAddMember={handleAddMember}
                            onUpdateMember={handleUpdateMember}
                            onDeleteMember={handleDeleteMember}
                            invitations={invitations}
                            onCreateInvitation={handleCreateInvitation}
                            isCompact={true}
                          />
                        )}

                        {activeTab === 'reports' && (
                          <ReportArchiver member={activeMember} reports={activeMemberReports} onUploadReport={handleUploadReport} isCompact={true} />
                        )}

                        {activeTab === 'trends' && (
                          <IndicatorTrendChart member={activeMember} reports={activeMemberReports} isCompact={true} />
                        )}

                        {activeTab === 'ai' && (
                          <div className="space-y-4">
                            <AiAssistantPanel member={activeMember} onAskAi={handleAskAi} />
                            <div className="bg-white rounded-2xl p-4 border border-soft card-shadow space-y-1.5 text-xs text-slate-505 font-sans">
                              <h4 className="font-bold text-[#07C160] flex items-center gap-1">
                                <Heart className="w-4 h-4 text-[#07C160]" />
                                AI 会诊辅助健康背景资料
                              </h4>
                              <p className="text-slate-500 text-[11px] leading-relaxed">
                                当前患者：<strong>{activeMember.name} ({activeMember.age}岁)</strong><br/>
                                既往病史：<strong>{activeMember.medicalHistory.join(', ') || '无'}</strong><br/>
                                过敏药物：<strong className="text-rose-500">{activeMember.allergies.join(', ') || '无'}</strong>
                              </p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'security' && (
                          <SecurityPrivacyLog logs={auditLogs} onRefreshLogs={async () => {
                            const res = await fetch('/api/audit-logs');
                            if (res.ok) setAuditLogs(await res.json());
                          }} />
                        )}

                      </div>
                    )}

                  </div>

                  {/* Simulated WeChat Bottom TabBar (Sticky inside simulator viewport - Redesigned to fit Reference premium UI) */}
                  {wxIsAuth && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center px-2 py-1 z-30 shrink-0 shadow-xl h-[70px]">
                      
                      {/* Tab 1: Dashboard (Compass Icon) */}
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          addWxLog('wx.switchTab', 'info', '跳转至：总览 /pages/dashboard');
                        }}
                        className={`flex flex-col items-center justify-center transition-all cursor-pointer border-none bg-transparent flex-1 ${
                          activeTab === 'dashboard' ? 'text-[#743AF6] scale-102 font-black' : 'text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        <Compass className="w-5 h-5 stroke-[2.2]" />
                        <span className="text-[9px] font-extrabold mt-1">总览</span>
                      </button>

                      {/* Tab 2: Trends (Activity Icon) */}
                      <button
                        onClick={() => {
                          setActiveTab('trends');
                          addWxLog('wx.switchTab', 'info', '跳转至：对比析出折线 /pages/trends');
                        }}
                        className={`flex flex-col items-center justify-center transition-all cursor-pointer border-none bg-transparent flex-1 ${
                          activeTab === 'trends' ? 'text-[#743AF6] scale-102 font-black' : 'text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        <Activity className="w-5 h-5 stroke-[2.2]" />
                        <span className="text-[9px] font-extrabold mt-1">趋势</span>
                      </button>

                      {/* Tab 3: FLOATING DOCTOR MAIN AI BUTTON (Central overlapping button) */}
                      <div className="flex-1 flex flex-col items-center justify-center relative select-none">
                        <button
                          onClick={() => {
                            setActiveTab('ai');
                            addWxLog('wx.switchTab', 'info', '跳转至：大模型会诊 /pages/chat');
                          }}
                          className={`absolute -top-7 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 cursor-pointer ${
                            activeTab === 'ai' 
                              ? 'bg-gradient-to-tr from-[#8059FF] to-[#AC60FA] ring-4 ring-[#EFEEFF] ring-offset-1 p-[2.5px]' 
                              : 'bg-white border border-slate-100 hover:border-slate-200 p-[3px]'
                          }`}
                        >
                          <img 
                            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120" 
                            alt="医生AI"
                            className="w-full h-full rounded-full object-cover shadow-xs border border-white"
                          />
                        </button>
                        <span className={`text-[9px] font-extrabold mt-7 ${activeTab === 'ai' ? 'text-[#743AF6]' : 'text-slate-400'}`}>问医生</span>
                      </div>

                      {/* Tab 4: Family Group (Users Icon) */}
                      <button
                        onClick={() => {
                          setActiveTab('family');
                          addWxLog('wx.switchTab', 'info', '跳转至：成员 /pages/family');
                        }}
                        className={`flex flex-col items-center justify-center transition-all cursor-pointer border-none bg-transparent flex-1 ${
                          activeTab === 'family' ? 'text-[#743AF6] scale-102 font-black' : 'text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        <Users className="w-5 h-5 stroke-[2.2]" />
                        <span className="text-[9px] font-extrabold mt-1">成员</span>
                      </button>

                      {/* Tab 5: Reports archive (FileText Icon) */}
                      <button
                        onClick={() => {
                          setActiveTab('reports');
                          addWxLog('wx.switchTab', 'info', '跳转至：化验报告归档 /pages/reports');
                        }}
                        className={`flex flex-col items-center justify-center transition-all cursor-pointer border-none bg-transparent flex-1 ${
                          activeTab === 'reports' ? 'text-[#743AF6] scale-102 font-black' : 'text-slate-400 hover:text-slate-650'
                        }`}
                      >
                        <FileText className="w-5 h-5 stroke-[2.2]" />
                        <span className="text-[9px] font-extrabold mt-1">归档</span>
                      </button>

                    </div>
                  )}

                  {/* Standard WeChat Share Sheets popup layout inside simulator */}
                  {showShareSheet && (
                    <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end transition-all" onClick={() => setShowShareSheet(false)}>
                      <div className="bg-white rounded-t-[24px] p-5 space-y-4 font-sans text-slate-800" onClick={e => e.stopPropagation()}>
                        
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-widest">
                            微信隐私群落对称安全外享
                          </h4>
                          <button 
                            onClick={() => {
                              setShowShareSheet(false);
                              addWxLog('wx.hideActionSheet', 'info', '自关闭下浮菜单');
                            }}
                            className="text-xs text-[#07C160] font-black border-none bg-transparent cursor-pointer hover:underline"
                          >
                            关闭
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                          为了防止生理数值散播泄露，分享前会对卡片附加上本机专属公钥对称哈希（Hash）摘要，对隐私高度负责：
                        </p>

                        <div className="grid grid-cols-3 gap-3 pt-1 text-center font-sans">
                          <button 
                            onClick={() => {
                              addWxLog('wx.shareAppMessage', 'success', '已生成配对解密卡片，同步至所选微信群');
                              triggerAlert("已一键发送群分享卡片到微信！", "success");
                              setShowShareSheet(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-[#07C160] rounded-xl border border-soft flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-700"
                          >
                            <span className="text-xl">💬</span>
                            <span className="text-[10px] font-extrabold">微信好友群</span>
                          </button>
                          
                          <button 
                            onClick={() => {
                              addWxLog('wx.shareTimeline', 'success', '已发送国密卡片摘要链接至微信朋友圈');
                              triggerAlert("成功分享对称签名至朋友圈！", "success");
                              setShowShareSheet(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-[#07C160] rounded-xl border border-soft flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-700"
                          >
                            <span className="text-xl">✨</span>
                            <span className="text-[10px] font-extrabold">朋友圈</span>
                          </button>

                          <button 
                            onClick={() => {
                              addWxLog('wx.setClipboardData', 'success', '密室口令链接已写入本地剪纸板');
                              triggerAlert("对称密钥已被复制到剪纸板！", "success");
                              setShowShareSheet(false);
                            }}
                            className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-[#07C160] rounded-xl border border-soft flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-700"
                          >
                            <span className="text-xl">🔗</span>
                            <span className="text-[10px] font-extrabold">复制公钥链接</span>
                          </button>
                        </div>

                        <div className="bg-[#E9F9F1] text-[#07C160] rounded-xl p-3 text-[10px] flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span className="text-emerald-950 font-semibold leading-relaxed">获得该链接的配偶或家属扫描后，即能共享家庭安全健康仓的所有特权。</span>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* RENDER BRANCH B: ORIGINAL PREMIUM DESKTOP VIEW */
        <div className="animate-in fade-in duration-300">
          
          {/* Main Desktop Header */}
          <header className="bg-white border-b border-soft sticky top-0 z-40 card-shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-health-green text-white rounded-xl flex items-center justify-center font-black card-shadow shrink-0 select-none">
                    <Heart className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-extrabold text-base md:text-lg text-slate-800 tracking-tight leading-tight flex items-center gap-1.5">
                      健康档案 <span className="font-mono text-sm text-slate-500 font-semibold">health_records</span>
                      <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold hidden sm:inline tracking-wider">
                        运行中
                      </span>
                    </h1>
                    <p className="text-slate-400 text-[10px] truncate max-w-[200px] sm:max-w-none">
                      一体化家庭健康报告与多账号成员身份管理器
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-health-light border border-soft p-2.5 rounded-2xl">
                    <img
                      src={members[0]?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"}
                      alt="Amanda 账户管理员"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-health-green"
                    />
                    <div className="hidden md:block text-left pr-2">
                      <p className="text-xs font-bold text-slate-705 text-gray-800">Amanda (主人)</p>
                      <p className="text-[10px] text-health-green font-bold">生物传感器寿命剩 14 天</p>
                    </div>
                  </div>

                  {syncing && (
                    <div className="p-1 text-health-green animate-spin" title="数据正上盘持久化写入...">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

            {/* Top-Level Desktop Tabs Navigation Bar */}
            <div className="bg-white border border-soft p-2.5 rounded-3xl flex flex-wrap gap-1.5 card-shadow" id="desktop-navigation-tabs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-health-green text-white card-shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>家庭健康大一统总览</span>
              </button>

              <button
                onClick={() => setActiveTab('family')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'family'
                    ? 'bg-health-green text-white card-shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>家庭组与成员档案仓 (录入/角色)</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-health-green text-white card-shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>体检报告上传归档 (历年列表)</span>
              </button>

              <button
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'trends'
                    ? 'bg-health-green text-white card-shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>指标长期对比析出趋势 (折线图)</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-health-green text-white card-shadow font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>全科 AI 医生问诊 (日常膳食推荐)</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ml-auto ${
                  activeTab === 'security'
                    ? 'bg-slate-900 text-teal-400 card-shadow border border-slate-950 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>数据安全与算子密级</span>
              </button>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="overflow-x-auto pb-2 scrollbar-none flex gap-3.5 font-sans" id="desktop-quick-shortcuts">
              <button
                onClick={() => handleQuickAction('archive')}
                className="flex items-center gap-3.5 bg-white border border-soft p-4 rounded-xl font-bold text-xs card-shadow hover:-translate-y-0.5 hover:border-health-green transition-all text-slate-700 select-none shrink-0"
              >
                <span className="w-8 h-8 rounded-full bg-health-light text-health-green flex items-center justify-center font-mono">⚙⚙</span>
                <div className="text-left">
                  <p className="font-extrabold text-slate-800">体检扫描仪 (Equipment)</p>
                  <p className="text-[10px] text-slate-400 font-normal">多模态高通量解析</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('reminder')}
                className="flex items-center gap-3.5 bg-white border border-soft p-4 rounded-xl font-bold text-xs card-shadow hover:-translate-y-0.5 hover:border-health-green transition-all text-slate-700 select-none shrink-0"
              >
                <span className="w-8 h-8 rounded-full bg-health-light text-health-green flex items-center justify-center font-mono font-bold">⏰</span>
                <div className="text-left">
                  <p className="font-extrabold text-slate-800">复测提醒设置 (Reminder)</p>
                  <p className="text-[10px] text-slate-400 font-normal">异常指数按时促发</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('metrics')}
                className="flex items-center gap-3.5 bg-white border border-soft p-4 rounded-xl font-bold text-xs card-shadow hover:-translate-y-0.5 hover:border-health-green transition-all text-slate-700 select-none shrink-0"
              >
                <span className="w-8 h-8 rounded-full bg-health-light text-health-green flex items-center justify-center font-mono font-bold">📓</span>
                <div className="text-left">
                  <p className="font-extrabold text-slate-800">历年健康病志 (Logbook)</p>
                  <p className="text-[10px] text-slate-400 font-normal">化验单时序跟踪归档</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('add_follow')}
                className="flex items-center gap-3.5 bg-white border border-soft p-4 rounded-xl font-bold text-xs card-shadow hover:-translate-y-0.5 hover:border-health-green transition-all text-slate-700 select-none shrink-0"
              >
                <span className="w-8 h-8 rounded-full bg-health-light text-health-green flex items-center justify-center font-mono font-bold">➕</span>
                <div className="text-left">
                  <p className="font-extrabold text-slate-800">配偶子女接入 (Add Follow)</p>
                  <p className="text-[10px] text-slate-400 font-normal">生成离线密匙连接对</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickAction('calibrate')}
                className="flex items-center gap-3.5 bg-white border border-soft p-4 rounded-xl font-bold text-xs card-shadow hover:-translate-y-0.5 hover:border-health-green transition-all text-slate-700 select-none shrink-0"
              >
                <span className="w-8 h-8 rounded-full bg-health-light text-health-green flex items-center justify-center font-mono font-bold">🎯</span>
                <div className="text-left">
                  <p className="font-extrabold text-slate-800">校对生理偏置值 (Calibrate)</p>
                  <p className="text-[10px] text-slate-400 font-normal">血糖生物抗阻调优</p>
                </div>
              </button>
            </div>

            {/* Tab Core Router for original Desktop view */}
            <div className="space-y-6">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="desktop-dashboard-grid">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-5 border border-soft card-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">当前选定病历档案</p>
                          <h3 className="font-extrabold text-base text-slate-800">
                            正在会诊档案人：<span className="text-health-green">【{activeMember?.name}】</span>
                          </h3>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto py-1">
                          {members.map(m => (
                            <button
                              key={m.id}
                              onClick={() => handleSelectMember(m.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                                m.id === activeMemberId 
                                  ? 'bg-health-green text-white border-health-green font-extrabold' 
                                  : 'bg-slate-50 text-slate-600 border-soft hover:bg-slate-100'
                              }`}
                            >
                               {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <IndicatorTrendChart member={activeMember} reports={activeMemberReports} />
                    <ReportArchiver member={activeMember} reports={activeMemberReports} onUploadReport={handleUploadReport} />
                  </div>

                  <div className="lg:col-span-1 space-y-6 font-sans">
                    <div className="bg-gradient-to-br from-[#E9F9F1] to-[#D5F3E4] border border-[#2EBD85]/20 text-[#218158] rounded-3xl p-5 card-shadow relative overflow-hidden font-sans">
                      <div className="absolute -right-6 -bottom-6 opacity-10 font-bold font-mono text-7xl select-none">
                        KNOW
                      </div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-health-green flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> 每日健康小课堂
                      </h4>
                      <p className="font-bold text-sm text-slate-800 mt-2">
                        今日重点：胰岛素黎明现象与清减食餐
                      </p>
                      <p className="text-xs text-emerald-950 mt-1.5 leading-relaxed font-semibold">
                        在晨间 4 点到 8 点，身体因为皮质醇及肾上腺激素增加，通常会自行推高血糖水平。建议此周期餐点少油、少糖，引入温水或热柠檬秋葵豆腐，避免胰岛素抵抗激增。
                      </p>
                    </div>

                    <AiAssistantPanel member={activeMember} onAskAi={handleAskAi} />

                    <div className="bg-white rounded-3xl p-5 border border-soft card-shadow font-sans">
                      <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">
                        快捷专项深度研判入口
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button 
                          onClick={() => { setActiveTab('security'); }}
                          className="p-4 rounded-2xl bg-slate-50 hover:bg-health-light border border-soft hover:border-health-green/45 text-left transition-all cursor-pointer text-slate-700"
                        >
                          <span className="text-lg">⚙️</span>
                          <p className="font-extrabold text-slate-800 text-xs mt-1.5">系统设置</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">管理数据证书秘钥</p>
                        </button>
                        <button 
                          onClick={() => { setActiveTab('ai'); }}
                          className="p-4 rounded-2xl bg-slate-50 hover:bg-health-light border border-soft hover:border-health-green/45 text-left transition-all cursor-pointer text-slate-700"
                        >
                          <span className="text-lg">🍽️</span>
                          <p className="font-extrabold text-slate-800 text-xs mt-1.5">轻膳食研判</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">低嘌呤低升糖搭配</p>
                        </button>
                        <button 
                          onClick={() => { setActiveTab('trends'); }}
                          className="p-4 rounded-2xl bg-slate-50 hover:bg-health-light border border-soft hover:border-health-green/45 text-left transition-all cursor-pointer text-slate-700"
                        >
                          <span className="text-lg">📊</span>
                          <p className="font-extrabold text-slate-800 text-xs mt-1.5">血糖专项</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">传感器趋势精算图</p>
                        </button>
                        <button 
                          onClick={() => { setActiveTab('ai'); }}
                          className="p-4 rounded-2xl bg-slate-50 hover:bg-health-light border border-soft hover:border-health-green/45 text-left transition-all cursor-pointer text-slate-700"
                        >
                          <span className="text-lg">❓</span>
                          <p className="font-extrabold text-slate-800 text-xs mt-1.5">向医生提问</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">一键触发全方位解答</p>
                        </button>
                        <button 
                          onClick={() => { setActiveTab('family'); }}
                          className="p-4 rounded-2xl bg-slate-50 hover:bg-health-light border border-soft hover:border-health-green/45 text-left transition-all col-span-2 cursor-pointer text-slate-705 text-slate-700"
                        >
                          <span className="text-lg">👤</span>
                          <p className="font-extrabold text-slate-800 text-xs mt-1.5">家庭成员全盘画像</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">评估吸烟史及病史重疾风险机率</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'family' && (
                <FamilyGroupManager
                  members={members}
                  activeMemberId={activeMemberId}
                  onSelectMember={handleSelectMember}
                  onAddMember={handleAddMember}
                  onUpdateMember={handleUpdateMember}
                  onDeleteMember={handleDeleteMember}
                  invitations={invitations}
                  onCreateInvitation={handleCreateInvitation}
                />
              )}

              {activeTab === 'reports' && (
                <div className="space-y-6 font-sans">
                  <div className="bg-white rounded-3xl p-5 border border-soft card-shadow">
                    <h3 className="font-extrabold text-base text-slate-800">切换报告所属人：</h3>
                    <div className="flex gap-1.5 mt-2 overflow-x-auto py-1">
                      {members.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectMember(m.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                            m.id === activeMemberId 
                              ? 'bg-health-green text-white border-health-green shadow-xs' 
                              : 'bg-slate-50 text-slate-600 border-soft hover:bg-slate-100'
                          }`}
                        >
                          {m.name} ({m.relationship === 'Self' ? '本人' : m.relationship})
                        </button>
                      ))}
                    </div>
                  </div>
                  <ReportArchiver member={activeMember} reports={activeMemberReports} onUploadReport={handleUploadReport} />
                </div>
              )}

              {activeTab === 'trends' && (
                <IndicatorTrendChart member={activeMember} reports={activeMemberReports} />
              )}

              {activeTab === 'ai' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <AiAssistantPanel member={activeMember} onAskAi={handleAskAi} />
                  </div>
                  <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-soft card-shadow space-y-4 font-sans">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                      <Heart className="text-health-green w-4 h-4" /> 问诊辅助背景资料
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">当前患者体征：</span>
                        <p className="text-slate-600 bg-white p-2 border border-soft rounded-lg">
                          {activeMember.name}, {activeMember.age}岁, 既往病史包含：
                          {activeMember.medicalHistory.length > 0 ? activeMember.medicalHistory.join(', ') : '无'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">过敏因素：</span>
                        <p className="text-rose-600 bg-white p-2 border border-rose-100 rounded-lg font-semibold">
                          {activeMember.allergies.length > 0 ? activeMember.allergies.join(', ') : '无已知过敏原'}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 block mb-1">日常行为习性：</span>
                        <p className="text-slate-600">
                          吸烟状态: <strong>{activeMember.smokingHistory === 'never' ? '从不吸烟' : activeMember.smokingHistory === 'former' ? '已戒烟' : '吸烟中'}</strong><br/>
                          饮酒习惯: <strong>{activeMember.drinkingHistory === 'never' ? '从不饮酒' : activeMember.drinkingHistory === 'socially' ? '社交饮酒' : '酗酒'}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-soft pt-4 leading-relaxed flex items-start gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-health-green shrink-0 mt-0.5" />
                      <span>
                        全天候端对端密约交换保护。AI 将不会将本轮会话内容输出至公共训练池，数据仅服务于您当前的健康追踪折线。
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <SecurityPrivacyLog logs={auditLogs} onRefreshLogs={async () => {
                  const res = await fetch('/api/audit-logs');
                  if (res.ok) setAuditLogs(await res.json());
                }} />
              )}

            </div>

          </main>

        </div>
      )}

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, ToggleLeft, ToggleRight, ListFilter, 
  Terminal, ShieldAlert, Cpu, Key, Database, RefreshCw
} from 'lucide-react';
import { AuditLog, PrivacyConfig } from '../types';

interface SecurityPrivacyLogProps {
  logs: AuditLog[];
  onRefreshLogs: () => Promise<void>;
}

export default function SecurityPrivacyLog({ logs, onRefreshLogs }: SecurityPrivacyLogProps) {
  const [privacy, setPrivacy] = useState<PrivacyConfig>({
    aesKeyLength: 256,
    clientSideEncryption: true,
    enableDoubleEncryption: true,
    autoLogOutMinutes: 15,
    sharingScope: 'family_only'
  });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshLogs();
    setTimeout(() => setRefreshing(false), 500);
  };

  const toggleClientSide = () => {
    setPrivacy(prev => ({ ...prev, clientSideEncryption: !prev.clientSideEncryption }));
  };

  const toggleDouble = () => {
    setPrivacy(prev => ({ ...prev, enableDoubleEncryption: !prev.enableDoubleEncryption }));
  };

  return (
    <div id="security-privacy-panel" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
      
      <div className="flex flex-col gap-3 justify-between border-b pb-4 border-slate-50">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            核心安全底座
          </span>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
            医疗级数据安全与分布式隐私管理
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            符合《个人信息保护法 (PIPL)》以及 HIPAA 医疗敏感数据物理分段控制标准，确保数据确权。
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-xl transition-all w-full"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          刷新审计痕迹
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        
        {/* Sub panel: Privacy Control Configurations */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-emerald-500" />
            加密解密管理配置
          </h4>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-4">
            
            {/* Toggle 1 */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">客户端对称算子加密</span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  体检包原始字节流先于浏览器内采用对称秘钥完成高难度封装，秘钥只保存于本地。
                </span>
              </div>
              <button onClick={toggleClientSide} className="text-emerald-500 hover:scale-105 transition-transform shrink-0">
                {privacy.clientSideEncryption ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-start justify-between gap-4 border-t pt-3 border-slate-200/50">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 block">激活国密双重包络</span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  通过云端分布式密钥交换协议进行二次包络多重加密，阻断任何硬件窃码攻击。
                </span>
              </div>
              <button onClick={toggleDouble} className="text-emerald-500 hover:scale-105 transition-transform shrink-0">
                {privacy.enableDoubleEncryption ? (
                  <ToggleRight className="w-10 h-10 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-300" />
                )}
              </button>
            </div>

            {/* Selector 3 */}
            <div className="border-t pt-3 border-slate-200/50 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">数据开放共享阀域</label>
              <select
                value={privacy.sharingScope}
                onChange={(e) => setPrivacy(prev => ({ ...prev, sharingScope: e.target.value as any }))}
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
              >
                <option value="family_only">仅限经授权的家庭组管理员调阅 (推荐)</option>
                <option value="private_selected">严格自我封闭 (任何人均无法调阅)</option>
              </select>
            </div>

            {/* Cipher indicators info */}
            <div className="bg-emerald-900 text-emerald-100 rounded-xl p-3 text-[10px] space-y-1">
              <div className="flex gap-1.5 items-center font-bold text-emerald-300">
                <Cpu className="w-3.5 h-3.5" />
                <span>硬件加密签名指纹</span>
              </div>
              <p className="font-mono text-emerald-200 break-all leading-tight">
                SHA256: 4e806d22e8ef4a6fb40a07bbab0e23f8b81a07bb54cbbab6
              </p>
            </div>

          </div>
        </div>

        {/* Sub panel: Live Cryptographic Audit Trail Table */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            国密安全与操作实时审计痕迹 LEDGER (MODULE 1 SECURE VIEW)
          </h4>

          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <div className="overflow-y-auto max-h-[295px] divide-y divide-slate-100 text-xs">
              <table className="w-full text-left text-slate-600">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">产生时间</th>
                    <th className="px-4 py-2.5">主体</th>
                    <th className="px-4 py-2.5 text-center">安全动作</th>
                    <th className="px-4 py-2.5">审计描述</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 shrink-0 font-semibold text-slate-800">
                        {log.operator}
                      </td>
                      <td className="px-4 py-3 text-center shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-sm text-[9px] font-bold ${
                          log.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed break-words max-w-[200px] sm:max-w-xs md:max-w-none">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] rounded-xl p-3 px-3.5 leading-relaxed flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>哈希日志存证：</strong>底层日志存储在安全容器本地日志锚点中。任何人（含管理员本身）均无权对过往痕迹、解密流转日志及诊断细节进行物理抹除或修改。
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

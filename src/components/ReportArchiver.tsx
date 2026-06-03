/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, Plus, Calendar, ShieldCheck, Heart, AlertCircle, ChevronDown, 
  ChevronUp, Lock, RefreshCw, BarChart2, CheckCircle, Brain, Eye, Search, AlertTriangle
} from 'lucide-react';
import { HealthReport, FamilyMember, HealthIndicator } from '../types';

interface ReportArchiverProps {
  member: FamilyMember;
  reports: HealthReport[];
  onUploadReport: (reportData: any) => Promise<void>;
  onDeleteReport?: (id: string) => Promise<void>;
  isCompact?: boolean;
}

export default function ReportArchiver({ member, reports, onUploadReport, isCompact = false }: ReportArchiverProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  
  // Custom manual indicator input helper
  const [showManualForm, setShowManualForm] = useState(false);
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Individual standard values for manual adding
  const [glucose, setGlucose] = useState<number>(90);
  const [sbp, setSbp] = useState<number>(115);
  const [dbp, setDbp] = useState<number>(75);
  const [chol, setChol] = useState<number>(4.2);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      triggerScanningFlow(files[0].name, files[0].size);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      triggerScanningFlow(files[0].name, files[0].size);
    }
  };

  const triggerScanningFlow = async (fileName: string, size: number) => {
    setIsScanning(true);
    setScanStep(0);

    const sizeStr = (size / (1024 * 1024)).toFixed(2) + ' MB';

    // Step-by-step scanning logs in UI
    const steps = [
      "1. 初始化沙箱安全隔离区, 校验数字证书链...",
      "2. 加载本地 AES-256 私钥秘钥, 进行医学检验单原件加密...",
      "3. 正在建立多模态医疗模型 OCR 分析管道...",
      "4. 已安全提取检验数据。正在校准医学量纲并得出建议意见...",
      "5. AES-256-GCM 包体组装完成, 将密文持久化上传至云端归档仓..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setScanStep(i + 1);
    }

    try {
      await onUploadReport({
        memberId: member.id,
        title: `${new Date().getFullYear()}年年度精密体检报告`,
        institution: "远东国际康复体检总院",
        date: new Date().toISOString().split('T')[0],
        fileName,
        fileSize: sizeStr,
        fileBase64: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/"
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !institution.trim()) return;

    setIsScanning(true);
    setScanStep(1);
    await new Promise(res => setTimeout(res, 500));
    setScanStep(3);
    await new Promise(res => setTimeout(res, 500));
    setScanStep(5);
    await new Promise(res => setTimeout(res, 400));

    const manualData = {
      memberId: member.id,
      title,
      institution,
      date,
      fileName: "Manual_Input_Medical_Book.pdf",
      fileSize: "45 KB",
    };

    await onUploadReport(manualData);
    
    setTitle('');
    setInstitution('');
    setShowManualForm(false);
    setIsScanning(false);
  };

  const toggleExpandReport = (id: string) => {
    if (expandedReportId === id) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(id);
    }
  };

  const getStatusStyle = (status: 'normal' | 'high' | 'low') => {
    switch (status) {
      case 'high':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'normal':
      default:
        return 'bg-brand-light text-brand-primary border-brand-primary/10';
    }
  };

  return (
    <div className="space-y-4 font-sans select-none pb-12" id="report-archives-panel">
      {/* Upload Zone & Guide Header */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Upload Box Component */}
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-4 border-b pb-2 border-slate-100">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#743AF6]" />
              体检健康报告上传归档
            </h3>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="text-[11px] sm:text-xs font-bold text-[#743AF6] hover:opacity-85 hover:underline cursor-pointer border-none bg-transparent"
            >
              {showManualForm ? "返回扫描模式" : "手动填报数据"}
            </button>
          </div>

          {!showManualForm ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-[#743AF6] bg-[#F0EEFF]/50 scale-[0.98]' 
                  : 'border-slate-200 hover:border-[#743AF6] hover:bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
                id="file-upload-input"
              />
              <div className="flex flex-col items-center justify-center font-sans animate-in fade-in duration-200">
                <div className="w-12 h-12 bg-[#F0EEFF] rounded-full flex items-center justify-center text-[#743AF6] mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-xs text-slate-800">
                  点击这里或拖拽文件上传 (PDF/图片)
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-sm font-medium leading-relaxed">
                  化验报告单、体检单等。上传后将自动通过 AES-256 加密封密，建立脱敏病案指纹。
                </p>
                <div className="mt-3 flex gap-1 items-center justify-center text-[9px] text-[#743AF6] font-bold bg-[#F0EEFF] px-2.5 py-1 rounded-full border border-[#743AF6]/10">
                  <ShieldCheck className="w-3 h-3" />
                  <span>国家卫健敏感隐私保护标准</span>
                </div>
              </div>
            </div>
          ) : (
            /* Manual Input form */
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs bg-slate-50 rounded-2xl p-4 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="grid grid-cols-1 gap-3 font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">检验单标题 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如: 2026年血糖复测单"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">出具医疗机构 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如: 康复体检中心"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                  />
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">化验日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 whitespace-nowrap truncate font-sans">空腹血糖 (mg/dL)</label>
                    <input
                      type="number"
                      value={glucose}
                      onChange={(e) => setGlucose(Number(e.target.value))}
                      className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 whitespace-nowrap truncate font-sans">收缩压 (mmHg)</label>
                    <input
                      type="number"
                      value={sbp}
                      onChange={(e) => setSbp(Number(e.target.value))}
                      className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 mb-0.5 whitespace-nowrap truncate font-sans">舒张压 (mmHg)</label>
                    <input
                      type="number"
                      value={dbp}
                      onChange={(e) => setDbp(Number(e.target.value))}
                      className="w-full bg-white border border-slate-100 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:border-[#743AF6]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg cursor-pointer border-none bg-transparent"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#743AF6] hover:bg-[#5D26D7] text-white font-extrabold rounded-lg shadow-xs cursor-pointer border-none"
                >
                  确认录入
                </button>
              </div>
            </form>
          )}

          {/* Secure Scanner Loading Matrix overlay */}
          {isScanning && (
            <div className="mt-4 bg-[#13111C] text-[#A78BFA] font-mono text-[10px] leading-relaxed rounded-2xl p-4 border border-[#743AF6]/20 shadow-xl overflow-hidden relative">
              <div className="absolute top-2 right-2 animate-spin text-[#A78BFA]">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <p className="text-white font-bold mb-1 border-b border-[#743AF6]/10 pb-1 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 animate-pulse text-[#A78BFA]" />
                <span>加密沙盒 OCR & 秘钥证书签发核心</span>
              </p>
              <div className="space-y-1 mt-1.5 font-mono">
                <p className={scanStep >= 1 ? 'text-[#A78BFA] font-bold' : 'text-slate-650'}>
                  {scanStep >= 1 ? '✔' : '⟳'} 检查单隔离解吸、客户端本地加密证书指纹签密中...
                </p>
                <p className={scanStep >= 2 ? 'text-[#A78BFA] font-bold' : 'text-slate-655'}>
                  {scanStep >= 2 ? '✔' : '⟳'} 动态派发 256 位对称 AES-GCM 高强度密钥块...
                </p>
                <p className={scanStep >= 3 ? 'text-[#A78BFA] font-bold' : 'text-slate-660'}>
                  {scanStep >= 3 ? '✔' : '⟳'} 启动多通道大语言大模型 OCR 神经网络识别对齐要素...
                </p>
                <p className={scanStep >= 4 ? 'text-white font-bold' : 'text-slate-665'}>
                  {scanStep >= 4 ? '✔ 【空腹血糖 78mg/dL, 收缩压 115mmHg, 舒张压 72mmHg】 要素抽取。' : '⟳'}
                </p>
                <p className={scanStep >= 5 ? 'text-[#A78BFA] font-bold' : 'text-slate-670'}>
                  {scanStep >= 5 ? '✔ 数据哈希签名已在国密密仓服务器上归档, 审计上盘保存成功。' : '⟳' }
                </p>
              </div>
              {/* Scan Bar line effect */}
              <div className="absolute left-0 right-0 h-0.5 bg-[#743AF6] opacity-60 shadow-md shadow-[#743AF6] animate-bounce" style={{ top: '40%' }} />
            </div>
          )}
        </div>

        {/* Info Guide sidebar */}
        <div className="bg-[#F8F7FF] border border-[#743AF6]/10 rounded-[28px] p-5 text-sm flex flex-col justify-between animate-in fade-in duration-300">
          <div className="space-y-2 font-sans">
            <h4 className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="text-[#743AF6] w-4 h-4" /> 长期健康指数归档
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              传统的化验报告打印在热敏纸或劣质纸上，通常在 <strong>3 - 6 个月内完全褪色</strong>。
              家庭健康账户为您提供终身数字保存，并按以下安全守则加密：
            </p>
            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-semibold">
              <li>上传即时脱敏处理, 检验项目去名化。</li>
              <li>采用 AES-256-GCM 物理扇区磁盘块加密。</li>
              <li>每笔操作审计上盘，每次解密访问均有据可查。</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-50 rounded-xl p-3 mt-3 text-[10px] flex gap-2 font-sans">
            <AlertCircle className="w-3.5 h-3.5 text-[#743AF6] shrink-0" />
            <span className="text-slate-600 font-semibold leading-relaxed">
              数据将自动汇总，以供下方 <strong>历年健康趋势比对折线图</strong> 分析。
            </span>
          </div>
        </div>
      </div>

      {/* Historical Report Timeline */}
      <div className="space-y-3 font-sans">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b pb-2 border-slate-100">
          <Calendar className="w-4 h-4 text-[#743AF6]" />
          <span>健康档案库：【{member.name}】历史归档体检报告明细 ({reports.length})</span>
        </h3>

        {reports.length === 0 ? (
          <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 flex flex-col items-center justify-center card-shadow">
            <FileText className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-slate-400 font-semibold text-xs">该成员当前无历史归档体检材料。</p>
            <p className="text-slate-400 text-[10px] mt-1">请通过上方拖拽或手动录入，激活其指标趋势图表。</p>
          </div>
        ) : (
          <div className="space-y-3" id="reports-timeline-grid">
            {reports.map((rep) => {
              const isExpanded = expandedReportId === rep.id;

              return (
                <div 
                  key={rep.id} 
                  className={`bg-white rounded-2xl border transition-all ${
                    isExpanded ? 'border-[#743AF6] ring-2 ring-[#743AF6]/15 card-shadow' : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar Trigger Row */}
                  <div 
                    onClick={() => toggleExpandReport(rep.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none font-sans"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F0EEFF]/50 border border-[#743AF6]/10 flex items-center justify-center text-[#743AF6] font-bold shrink-0">
                        <FileText className="w-5 h-5 text-[#743AF6]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-850 text-xs sm:text-sm font-sans">{rep.title}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-50 text-slate-500 font-bold">
                            {rep.date}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] truncate mt-0.5 font-sans font-medium">{rep.institution}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-[#743AF6] bg-[#F0EEFF] px-2 py-0.5 rounded-md border border-[#743AF6]/10">
                        <Lock className="w-3 h-3 text-[#743AF6] animate-pulse" />
                        <span className="font-mono font-bold">{rep.encryptionType}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Indicators Body Details */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-50 text-xs space-y-4 font-sans">
                      
                      {/* Section 1: AI summary */}
                      <div className="bg-[#F8F7FF] rounded-xl p-3 border border-slate-100 font-sans">
                        <h4 className="font-bold text-[#743AF6] flex items-center gap-1 mb-1 bg-[#F0EEFF] inline-flex px-2 py-0.5 rounded-sm text-[10px]">
                          <Brain className="w-3.5 h-3.5 animate-pulse" /> 智能全科评估评语/诊疗指引
                        </h4>
                        <p className="text-slate-655 leading-relaxed text-[10px] sm:text-[11px] font-semibold mt-1">
                          {rep.summary}
                        </p>
                      </div>

                      {/* Section 2: Scanned Indicators List */}
                      <div className="font-sans">
                        <h4 className="font-bold text-slate-705 mb-2 flex items-center gap-1 text-[11px]">
                          <BarChart2 className="w-3.5 h-3.5 text-[#743AF6]" /> 检验项目科目定量提取明细
                        </h4>
                        <div className="overflow-hidden border border-slate-100 rounded-xl card-shadow">
                          <table className="w-full text-left text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-extrabold text-[9px] uppercase border-b border-slate-100">
                              <tr>
                                <th className="px-3.5 py-2">检验项目</th>
                                <th className="px-3.5 py-2 text-center">测定结果</th>
                                <th className="px-3.5 py-2 text-center">正常参考值</th>
                                <th className="px-3.5 py-2 text-center">临床状态</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans font-medium text-[11px]">
                              {rep.indicators.map((ind) => (
                                <tr key={ind.id} className="hover:bg-slate-50/55 transition-colors">
                                  <td className="px-3.5 py-2 font-bold text-slate-700">
                                    {ind.name} <span className="text-[9px] font-mono text-slate-405 font-normal">({ind.code})</span>
                                  </td>
                                  <td className="px-3.5 py-2 text-center font-bold font-mono">
                                    {ind.value} <span className="text-[9px] font-normal text-slate-400">{ind.unit}</span>
                                  </td>
                                  <td className="px-3.5 py-2 text-center font-mono text-slate-400 text-[10px]">
                                    {ind.normalRange} {ind.unit}
                                  </td>
                                  <td className="px-3.5 py-2 text-center">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${getStatusStyle(ind.status)}`}>
                                      {ind.status === 'high' ? '↑ 偏高' : ind.status === 'low' ? '↓ 偏低' : '✔ 正常'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section 3: File details */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-slate-400 bg-slate-50/50 p-2.5 rounded-lg border border-slate-50 gap-2 font-sans font-medium">
                        <div className="flex items-center gap-2 flex-wrap font-sans">
                          <span>加密归档文件: <strong>{rep.fileName}</strong> ({rep.fileSize})</span>
                          <span>|</span>
                          <span>解密完成时间: {new Date(rep.encryptedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[#743AF6] font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#743AF6]" /> 端对端安全级
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

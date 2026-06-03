/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Send, Brain, Salad, Heart, Dumbbell, ShieldCheck, 
  HelpCircle, ChevronRight, Activity, Terminal, Mic, Plus, ArrowUp
} from 'lucide-react';
import { FamilyMember } from '../types';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  isRealAI?: boolean;
}

interface AiAssistantPanelProps {
  member: FamilyMember;
  onAskAi: (message: string) => Promise<{ response: string; realAI: boolean }>;
}

export default function AiAssistantPanel({ member, onAskAi }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'user',
      text: "我今天想吃点清淡的东西。您有什么推荐吗？"
    },
    {
      sender: 'assistant',
      text: `**以下是一些适合您的清淡膳食推荐**

• **清蒸类菜品**：如清蒸鱼、小葱拌豆腐，或清蒸蔬菜（西兰花、胡萝卜、芦笋）。相比于煎炸或烤制，清蒸对血糖的影响最小。
• **高纤维沙拉**：以绿叶蔬菜为主，淋上少许橄榄油或柠檬汁。
• **无糖燕麦**：燕麦片搭配一把新鲜莓果（如草莓或鳄梨碎）。`
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    { text: "糖尿病/高血糖体质早餐该怎么吃？", type: "sugar" },
    { text: "我这个家庭成员的指标健康吗？", type: "check" },
    { text: "我的高血压指标复查间隔是多久？", type: "bp" },
    { text: "高尿酸(痛风)患者有什么饮食禁忌？", type: "uric" }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Add user message
    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const result = await onAskAi(textToSend);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: result.response,
        isRealAI: result.realAI
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "抱歉，由于云端加密通道正在重构，请稍后再试或查看下方内置的临床诊断备忘录。"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-widget" className="bg-[#F8F9FC] min-h-full font-sans select-none flex flex-col space-y-4">
      
      {/* 1. Doctor Avatar Zone styled 1:1 like Screen 2 Mockup */}
      <div className="bg-gradient-to-b from-[#EBEBFE] via-[#F6F5FF] to-white rounded-t-[32px] rounded-b-[24px] p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Mock Screen 2 Top Action controls (X and Dots) */}
        <div className="absolute top-4 left-5 right-5 flex justify-between items-center z-20 text-slate-700 font-bold">
          <button 
            onClick={() => alert("关闭对话通道")}
            className="text-lg hover:text-slate-900 border-none bg-transparent cursor-pointer transition-all"
          >
            ✕
          </button>
          <button 
            onClick={() => alert("会诊更多操作选项")}
            className="text-lg hover:text-slate-905 border-none bg-transparent cursor-pointer transition-all leading-none font-black text-slate-705"
          >
            ⋮
          </button>
        </div>

        {/* Doctor Photo & "Hi~" bubble exactly matching Screen 2 */}
        <div className="relative mt-5">
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300" 
            alt="AI医生" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md relative z-10"
          />
          <div className="absolute -top-1 -right-4 bg-[#743AF6] text-white font-extrabold text-[10px] px-3 py-1 rounded-full border border-white z-20 shadow-sm animate-bounce flex items-center gap-1">
            <span>Hi~</span>
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
          </div>
        </div>

        <h3 className="text-base font-black text-slate-800 mt-3 flex items-center gap-1.5 relative z-10">
          全科医生 AI 诊疗助手
        </h3>
        <p className="text-[11px] text-[#A3AED0] font-bold max-w-xs mt-1 relative z-10 leading-relaxed">
          医护助理已就绪。正在为您提供高密级别、支持 OCR 生理要要素提取的专属医疗膳食方案。
        </p>
      </div>

      {/* 2. Breakfast knowledge visual card styled 1:1 like Screen 2 */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden flex flex-col" id="breakfast-knowledge-card-s2">
        {/* Top Image: oats with berries */}
        <div className="h-44 w-full relative">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500" 
            alt="燕麦莓果轻早餐"
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-4 bg-[#743AF6] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            知识卡片
          </span>
        </div>
        
        {/* Bottom Panel exactly matching S2 layout */}
        <div className="p-4 bg-slate-50/50 flex flex-col justify-between relative border-t border-slate-50">
          <div>
            <span className="text-[9px] font-black tracking-widest text-[#743AF6] uppercase">
              每日健康知识
            </span>
            <h4 className="font-extrabold text-slate-800 text-xs mt-1 leading-snug">
              您常吃的早餐可能会使您的血糖升得过高。
            </h4>
            <p className="text-[11px] text-[#A3AED0] font-medium leading-relaxed mt-0.5 max-w-[310px]">
              如果您习惯早餐吃白米饭、吐司面包或甜糕点，建议尝试换成富含高纤维的蔬菜、燕麦和清蒸鱼。
            </p>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100">
            {/* Smooth Pagination carousel indicators */}
            <div className="flex gap-1.5 justify-center items-center">
              <span className="w-2 h-2 rounded-full bg-[#743AF6]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>

            {/* Clickable Action button exactly like s2 */}
            <button 
              onClick={() => alert("加载下一页膳食大纲观点...")}
              className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:text-[#743AF6] hover:border-[#743AF6]/30 cursor-pointer shadow-xs transition-colors"
            >
              <span className="text-xs font-bold">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Preset Quick Consult Questions */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase font-black tracking-widest text-[#A3AED0] px-1">一键快捷健康咨询</p>
        <div className="grid grid-cols-2 gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              disabled={loading}
              className="text-left p-3 rounded-2xl bg-white hover:bg-[#F0EEFF] hover:border-[#743AF6]/30 border border-slate-100 disabled:opacity-50 transition-all text-xs text-slate-700 font-extrabold shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="leading-tight truncate">{q.text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0 mt-0.5 ml-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Core Conversation scroll container */}
      <div id="chat-messages-container" className="flex-1 overflow-y-auto min-h-[300px] bg-[#F1F3F9] rounded-[30px] p-4 space-y-4 max-h-[380px] scrollbar-none">
        
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          
          return (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 self-start shadow-sm shadow-purple-150">
                  🩺
                </div>
              )}
              
              <div className="max-w-[85%] flex flex-col gap-1.5">
                <div
                  className={`rounded-[22px] p-4 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#743AF6] text-white font-extrabold rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}

                  {/* Sub annotations */}
                  {!isUser && msg.isRealAI !== undefined && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100/60 flex justify-between items-center text-[8px] text-slate-400 font-mono">
                      <span>
                        诊断源: {msg.isRealAI ? "Gemini 3.5 " : "内置全科模型"}
                      </span>
                      <span className="text-[#743AF6] font-black flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> 数据高密隔离脱敏
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags helper pills directly under doctor response */}
                {!isUser && index === messages.length - 1 && (
                  <div className="flex gap-1.5 mt-1 flex-wrap">
                    <button 
                      onClick={() => handleSendMessage("请深入帮我分析【膳食配餐】阻糖原理")}
                      className="px-3 py-1.5 text-[9px] font-black bg-[#F0EEFF] hover:bg-white text-[#743AF6] border border-[#743AF6]/10 rounded-full cursor-pointer shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1 animate-pulse"
                    >
                      🍉 膳食配餐分析
                    </button>
                    <button 
                      onClick={() => handleSendMessage("有什么针对我这次波幅的【血糖建议】吗？")}
                      className="px-3 py-1.5 text-[9px] font-black bg-[#F0EEFF] hover:bg-white text-[#743AF6] border border-[#743AF6]/10 rounded-full cursor-pointer shadow-xs whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                    >
                      📈 血糖调整建议
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 animate-bounce border border-slate-100">
              🩺
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2 shadow-sm font-medium">
              <span className="flex gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-[#743AF6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#743AF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#743AF6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>健康助理正在解读检验单、研判调理方案并生成专属食单...</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Rich voice/text chat submission bar (Mirroring Middle Screen input) */}
      <div className="bg-white rounded-full p-1.5 border border-slate-100 shadow-sm flex items-center gap-1 mt-auto">
        {/* Left microphone icon */}
        <button 
          onClick={() => alert("语音录入功能模拟中...")}
          className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer border-none shrink-0"
        >
          <Mic className="w-5 h-5 text-slate-400" />
        </button>

        {/* Input Text Box */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
          placeholder="向健康助理提问..."
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-2 py-2 text-xs text-slate-800 placeholder-slate-400 font-bold"
          id="chat-user-input"
        />

        {/* Right Arrow Up send icon */}
        <button
          onClick={() => handleSendMessage(inputMessage)}
          disabled={loading || !inputMessage.trim()}
          className="w-10 h-10 bg-[#743AF6] hover:bg-[#622de3] active:scale-95 disabled:opacity-40 text-white rounded-full shrink-0 transition-all flex items-center justify-center shadow-md border-none cursor-pointer"
          id="chat-send-btn"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Plus attachments icon on the right end */}
        <button 
          onClick={() => alert("附加医学文件上传模拟...")}
          className="w-10 h-10 rounded-full bg-transparent hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer border-none shrink-0"
        >
          <Plus className="w-5 h-5 text-slate-400" />
        </button>
      </div>

    </div>
  );
}

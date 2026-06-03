/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, UserPlus, QrCode, Clipboard, Check, ShieldAlert, Trash2, Heart, Shield, Upload } from 'lucide-react';
import { FamilyMember, Invitation } from '../types';

interface FamilyGroupManagerProps {
  members: FamilyMember[];
  activeMemberId: string;
  onSelectMember: (id: string) => void;
  onAddMember: (memberData: any) => Promise<void>;
  onUpdateMember: (id: string, memberData: any) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  invitations: Invitation[];
  onCreateInvitation: (role: 'Admin' | 'Member') => Promise<void>;
  isCompact?: boolean;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"
];

export default function FamilyGroupManager({
  members,
  activeMemberId,
  onSelectMember,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  invitations,
  onCreateInvitation,
  isCompact = false
}: FamilyGroupManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(65);
  const [bloodType, setBloodType] = useState('O+');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [smokingHistory, setSmokingHistory] = useState<'never' | 'former' | 'active'>('never');
  const [drinkingHistory, setDrinkingHistory] = useState<'never' | 'socially' | 'frequently'>('never');
  const [avatar, setAvatar] = useState(PRESET_AVATARS[1]);

  // Edit Family Member States
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editRelationship, setEditRelationship] = useState('Spouse');
  const [editRole, setEditRole] = useState<'Admin' | 'Member'>('Member');
  const [editAge, setEditAge] = useState<number>(30);
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other'>('male');
  const [editHeight, setEditHeight] = useState<number>(170);
  const [editWeight, setEditWeight] = useState<number>(65);
  const [editBloodType, setEditBloodType] = useState('O+');
  const [editMedicalHistory, setEditMedicalHistory] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editSmokingHistory, setEditSmokingHistory] = useState<'never' | 'former' | 'active'>('never');
  const [editDrinkingHistory, setEditDrinkingHistory] = useState<'never' | 'socially' | 'frequently'>('never');
  const [editAvatar, setEditAvatar] = useState(PRESET_AVATARS[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择正确的图片类型 (JPG, PNG, WEBP等)');
      return;
    }
    if (file.size > 3.5 * 1024 * 1024) {
      alert('图片尺寸太大，请限制在 3.5MB 以内');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      if (base64String) {
        if (type === 'add') {
          setAvatar(base64String);
        } else {
          setEditAvatar(base64String);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEdit = (m: FamilyMember) => {
    setEditingMember(m);
    setEditName(m.name);
    setEditRelationship(m.relationship);
    setEditRole(m.role);
    setEditAge(m.age);
    setEditGender(m.gender);
    setEditHeight(m.height);
    setEditWeight(m.weight);
    setEditBloodType(m.bloodType);
    setEditMedicalHistory(m.medicalHistory ? m.medicalHistory.join(', ') : '');
    setEditAllergies(m.allergies ? m.allergies.join(', ') : '');
    setEditSmokingHistory(m.smokingHistory || 'never');
    setEditDrinkingHistory(m.drinkingHistory || 'never');
    setEditAvatar(m.avatar || PRESET_AVATARS[0]);
    setShowAddForm(false); // Close add form when changing to edit

    // Smooth scroll focus
    setTimeout(() => {
      document.getElementById('edit-form-card-container')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedHistory = medicalHistory
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const formattedAllergies = allergies
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await onAddMember({
      name,
      relationship,
      role,
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      bloodType,
      medicalHistory: formattedHistory,
      allergies: formattedAllergies,
      smokingHistory,
      drinkingHistory,
      avatar
    });

    // Reset Form
    setName('');
    setMedicalHistory('');
    setAllergies('');
    setAvatar(PRESET_AVATARS[1]);
    setShowAddForm(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editName.trim()) return;

    const formattedHistory = editMedicalHistory
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const formattedAllergies = editAllergies
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await onUpdateMember(editingMember.id, {
      name: editName,
      relationship: editRelationship,
      role: editRole,
      age: Number(editAge),
      gender: editGender,
      height: Number(editHeight),
      weight: Number(editWeight),
      bloodType: editBloodType,
      medicalHistory: formattedHistory,
      allergies: formattedAllergies,
      smokingHistory: editSmokingHistory,
      drinkingHistory: editDrinkingHistory,
      avatar: editAvatar
    });

    setEditingMember(null);
  };

  const getRoleBadge = (r: 'Admin' | 'Member') => {
    if (r === 'Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-[1px] rounded-full text-[9px] font-extrabold bg-[#EFEEF8] text-[#743AF6] border border-[#743AF6]/10 font-sans">
          <Shield className="w-2.5 h-2.5" /> 管理员
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-[1px] rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-50 font-sans">
        普通成员
      </span>
    );
  };

  return (
    <div id="family-group-section" className="space-y-4 font-sans select-none pb-12">
      {/* Header Info Block */}
      <div className="bg-white rounded-[28px] p-5 border border-slate-100 card-shadow">
        <div className={`flex ${isCompact ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center'} justify-between gap-4`}>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Users className="text-[#743AF6] w-4.5 h-4.5 shrink-0" /> 家庭档案组与成员管理
            </h2>
            <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">
              集中式存储、长期保存家庭成员的敏感体检与自主填报医疗档案。数据采用微型隔离方案并支持对端审计。
            </p>
          </div>
          <button
            id="btn-trigger-add-member"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1 px-4 py-2 text-[11px] font-extrabold rounded-full bg-[#743AF6] hover:bg-[#5D26D7] active:scale-95 text-white transition-all cursor-pointer shrink-0 whitespace-nowrap self-start border-none"
          >
            <UserPlus className="w-3.5 h-3.5" /> 录入新档案
          </button>
        </div>
      </div>

      {/* Add New Member Drawer/Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-150 rounded-[28px] p-5 relative card-shadow animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-3.5 border-b pb-2 border-slate-50 font-sans">
            <Heart className="w-3.5 h-3.5 text-[#743AF6]" /> 填报家庭成员详细健康底册
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-[11px]" id="form-add-member">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">成员姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="如: Eleanor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-850 focus:outline-none focus:border-[#743AF6] focus:bg-white placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">家庭关系 *</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="Self">本人</option>
                  <option value="Spouse">配偶</option>
                  <option value="Parent">父母</option>
                  <option value="Child">子女</option>
                  <option value="Other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">角色权限 *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="Member">普通家庭成员 (仅限阅读本人或授权报告)</option>
                  <option value="Admin">管理员 (可查看全部、生成邀请链路、管理报告)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">性别</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGender(g);
                        // Auto update corresponding default male/female layout as basic starter
                        if (avatar === PRESET_AVATARS[0] || avatar === PRESET_AVATARS[1] || avatar === PRESET_AVATARS[4]) {
                          setAvatar(g === 'female' ? PRESET_AVATARS[1] : PRESET_AVATARS[4]);
                        }
                      }}
                      className={`flex-1 py-1.5 text-center rounded-xl font-bold border text-[10px] capitalize transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-[#743AF6] text-white border-[#743AF6]/80'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5">成员头像 (*)</label>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  {/* Current selected Avatar block */}
                  <div className="relative shrink-0">
                    <img 
                      src={avatar} 
                      alt="Avatar preview" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#743AF6] bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 bg-[#743AF6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full font-sans scale-90">
                      预览
                    </span>
                  </div>
                  {/* Preset selections list */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AVATARS.map((avUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setAvatar(avUrl)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                            avatar === avUrl ? 'border-[#743AF6] scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={avUrl} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    {/* Direct URL input option for customized avatar */}
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-[#743AF6] font-bold shrink-0 font-sans">自定义链接:</span>
                        <input 
                          type="text"
                          placeholder="粘贴第三方头像图片链接"
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="flex-grow bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[9px] text-slate-700 focus:outline-none focus:border-[#743AF6]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 px-2.5 py-1 bg-[#F0EEFF] hover:bg-[#E2DFFF] text-[#743AF6] text-[9px] font-black rounded-lg cursor-pointer transition-all border border-[#743AF6]/10 select-none">
                          <Upload className="w-3 h-3 text-[#743AF6]" />
                          <span>本地图片上传/拍照</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, 'add')} 
                            className="hidden" 
                          />
                        </label>
                        <span className="text-[8px] text-slate-400 font-sans">支持 JPG, PNG, WEBP 高密本地转换</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">年龄 (岁)</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">血型</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">身高 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">既往病史 (以英文逗号分隔)</label>
                <input
                  type="text"
                  placeholder="如: 高血压, 2型糖尿病"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">药物/食物过敏原 (逗号分隔)</label>
                <input
                  type="text"
                  placeholder="如: 青霉素, 蚕豆"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border-none bg-transparent cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#743AF6] text-white font-extrabold rounded-full hover:bg-[#5D26D7] transition-all cursor-pointer border-none"
              >
                保存档案
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Existing Member Form */}
      {editingMember && (
        <div id="edit-form-card-container" className="bg-white border-2 border-[#743AF6]/30 rounded-[28px] p-5 relative card-shadow animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="absolute -top-3 left-6 bg-[#743AF6] text-white px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase font-sans">
            正在编辑档案
          </div>
          <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 mb-3.5 border-b pb-2 border-slate-50 font-sans mt-1">
            <Heart className="w-3.5 h-3.5 text-[#743AF6]" /> 修改 【{editingMember.name}】 详细健康生理底册
          </h3>
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-[11px]" id="form-edit-member">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">成员姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="如: Eleanor"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-850 focus:outline-none focus:border-[#743AF6] focus:bg-white placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">家庭关系 *</label>
                <select
                  value={editRelationship}
                  onChange={(e) => setEditRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="Self">本人</option>
                  <option value="Spouse">配偶</option>
                  <option value="Parent">父母</option>
                  <option value="Child">子女</option>
                  <option value="Other">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">角色权限 *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-[#EBFBEF] border border-[#07C160]/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="Member">普通家庭成员 (仅限阅读本人或授权报告)</option>
                  <option value="Admin">管理员 (可查看全部、生成邀请链路、管理报告)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">性别</label>
                <div className="flex gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setEditGender(g);
                        // Auto-align default placeholder avatars if still of standard presets
                        if (editAvatar === PRESET_AVATARS[0] || editAvatar === PRESET_AVATARS[1] || editAvatar === PRESET_AVATARS[4]) {
                          setEditAvatar(g === 'female' ? PRESET_AVATARS[1] : PRESET_AVATARS[4]);
                        }
                      }}
                      className={`flex-1 py-1.5 text-center rounded-xl font-bold border text-[10px] capitalize transition-all cursor-pointer ${
                        editGender === g
                          ? 'bg-[#743AF6] text-white border-[#743AF6]/80'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {g === 'male' ? '男' : g === 'female' ? '女' : '其他'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5">成员头像 (*)</label>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                  {/* Current selected Avatar block */}
                  <div className="relative shrink-0">
                    <img 
                      src={editAvatar} 
                      alt="Avatar preview" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#743AF6] bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                      }}
                    />
                    <span className="absolute -bottom-1 -right-1 bg-[#743AF6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full font-sans scale-90">
                      当前
                    </span>
                  </div>
                  {/* Preset selections list */}
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_AVATARS.map((avUrl, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setEditAvatar(avUrl)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer ${
                            editAvatar === avUrl ? 'border-[#743AF6] scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={avUrl} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    {/* Direct URL input option for customized avatar */}
                    <div className="flex flex-col gap-1.5 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-[#743AF6] font-bold shrink-0 font-sans">自定义链接:</span>
                        <input 
                          type="text"
                          placeholder="粘贴第三方头像图片链接"
                          value={editAvatar}
                          onChange={(e) => setEditAvatar(e.target.value)}
                          className="flex-grow bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[9px] text-slate-700 focus:outline-none focus:border-[#743AF6]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 px-2.5 py-1 bg-[#F0EEFF] hover:bg-[#E2DFFF] text-[#743AF6] text-[9px] font-black rounded-lg cursor-pointer transition-all border border-[#743AF6]/10 select-none">
                          <Upload className="w-3 h-3 text-[#743AF6]" />
                          <span>本地图片上传/拍照</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, 'edit')} 
                            className="hidden" 
                          />
                        </label>
                        <span className="text-[8px] text-slate-400 font-sans">支持 JPG, PNG, WEBP 高密本地转换</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">年龄 (岁)</label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">血型</label>
                <select
                  value={editBloodType}
                  onChange={(e) => setEditBloodType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6]"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">身高 (cm)</label>
                <input
                  type="number"
                  value={editHeight}
                  onChange={(e) => setEditHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-[#743AF6] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">既往病史 (以逗号/顿号/空格间隔)</label>
                <input
                  type="text"
                  placeholder="如: 高血压, 2型糖尿病"
                  value={editMedicalHistory}
                  onChange={(e) => setEditMedicalHistory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">药物/食物过敏原 (逗号/空格间隔)</label>
                <input
                  type="text"
                  placeholder="如: 青霉素, 蚕豆"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl border-none bg-transparent cursor-pointer font-sans"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#743AF6] text-white font-extrabold rounded-full hover:bg-[#5D26D7] transition-all cursor-pointer border-none font-sans"
              >
                保存修改
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive Family Members Grid */}
      <div className="grid grid-cols-1 gap-3.5" id="members-list-grid">
        {members.map((member) => {
          const isActive = member.id === activeMemberId;
          const bmi = (member.weight / Math.pow(member.height / 100, 2)).toFixed(1);

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(member.id)}
              className={`relative cursor-pointer rounded-[24px] p-4.5 border transition-all duration-300 font-sans ${
                isActive
                  ? 'bg-[#F0EEFF]/60 border-[#743AF6]/80 ring-2 ring-[#743AF6]/20 card-shadow'
                  : 'bg-white border-slate-100 card-shadow hover:border-slate-200'
              }`}
            >
              <div className="flex gap-3.5 items-start">
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className={`w-11 h-11 rounded-full object-cover shrink-0 border ${
                    isActive ? 'border-[#743AF6]/50 ring-2 ring-[#743AF6]/10' : 'border-slate-100'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 font-sans">
                    <span className="font-extrabold text-slate-900 truncate text-xs sm:text-sm">{member.name}</span>
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-bold">
                      {member.relationship === 'Self' ? '本人' : member.relationship === 'Spouse' ? '配偶' : member.relationship === 'Parent' ? '父母' : member.relationship === 'Child' ? '孩子' : '家庭成员'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1 items-center font-medium">
                    <span>{member.age}岁</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>{member.gender === 'female' ? '女' : '男'}</span>
                    <span className="text-slate-200 font-normal">|</span>
                    <span>{member.bloodType}型</span>
                  </div>
                </div>
              </div>

              {/* Physical Spec Row */}
              <div className="grid grid-cols-3 gap-1 text-[10px] bg-slate-50 border border-slate-100 rounded-xl p-2 mt-3 text-slate-600">
                <div className="text-center border-r border-slate-100">
                  <p className="text-[8px] text-slate-400">身高</p>
                  <p className="font-bold text-slate-700">{member.height}cm</p>
                </div>
                <div className="text-center border-r border-slate-100">
                  <p className="text-[8px] text-slate-400">体重</p>
                  <p className="font-bold text-slate-700">{member.weight}kg</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] text-slate-400 font-sans">BMI</p>
                  <p className="font-bold text-slate-700">{bmi}</p>
                </div>
              </div>

              {/* Critical medical info list */}
              <div className="mt-3.5 space-y-1 text-[10px] font-sans">
                <div className="flex justify-between items-center bg-[#F8F9FC] px-2.5 py-1 rounded-lg">
                  <span className="text-slate-400 shrink-0">既往病史</span>
                  <span className="text-slate-700 font-semibold truncate text-right pl-2 max-w-[130px]">
                    {member.medicalHistory.length > 0 ? member.medicalHistory.join(', ') : '无'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#FFF5F5] px-2.5 py-1 rounded-lg font-sans">
                  <span className="text-rose-400 shrink-0">过敏源</span>
                  <span className="text-rose-600 font-bold truncate text-right pl-2 max-w-[130px]">
                    {member.allergies.length > 0 ? member.allergies.join(', ') : '无'}
                  </span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-50">
                {getRoleBadge(member.role)}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(member);
                    }}
                    className="p-1 px-2 hover:bg-[#F0EEFF] rounded-lg text-slate-500 hover:text-[#743AF6] transition-all text-[10px] flex items-center gap-1 cursor-pointer font-bold font-sans border-none bg-transparent"
                    title="编辑此成员档案背景"
                  >
                    <UserPlus className="w-3 h-3 text-[#743AF6]" /> <span>编辑</span>
                  </button>
                  {member.relationship !== 'Self' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMember(member.id);
                      }}
                      className="p-1 px-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-all text-[10px] flex items-center gap-1 cursor-pointer font-bold font-sans border-none bg-transparent"
                      title="注销此成员档案及全部体检报告"
                    >
                      <Trash2 className="w-3 h-3" /> <span>注销</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active check-overlay */}
              {isActive && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#743AF6] text-white rounded-full p-0.5 shadow-xs px-2 text-[8px] font-extrabold font-sans">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping text-[8px]"></span>
                  正在会诊
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advanced Invitation and Access Mechanism */}
      <div className="grid grid-cols-1 gap-4 font-sans">
        <div className="bg-slate-900 border border-slate-950 text-white rounded-[28px] p-5 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldAlert className="text-amber-400 w-4 h-4 flex-shrink-0 animate-pulse" />
              <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-amber-400 font-mono">
                权限共享邀请机制 (Invite)
              </h3>
            </div>
            <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
              根据《数据隐私保护条例(GDPR)》，医疗和体检数据集只能由本人显式授权共享。通过生成加密短链和绑定二维码，可以邀请家人加入本家庭组。
            </p>
          </div>
          <div className="space-y-2 mt-4 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateInvitation('Member');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-slate-900 hover:bg-slate-50 border-none active:scale-95 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#743AF6]" /> 生成[普通成员]二度空间码
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateInvitation('Admin');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs rounded-xl transition-all text-slate-100 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#743AF6]" /> 派发[联席管理员]对称私钥
            </button>
          </div>
        </div>

        {/* Existing Invitations List */}
        <div className="bg-white rounded-[28px] p-5 border border-slate-100 card-shadow flex flex-col">
          <h3 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 mb-2.5 font-sans">
            <QrCode className="w-4 h-4 text-[#743AF6]" /> 已分发的活性成员临时密钥/链接对
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[160px] divide-y divide-slate-50 text-[11px] pr-1">
            {invitations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6 font-sans">
                <QrCode className="w-7 h-7 text-slate-200 mb-1" />
                <p>暂无活动的家庭邀请密钥。请点击上方生成。</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div key={inv.id} className="py-2 flex items-center justify-between gap-4 font-sans">
                  <div className="min-w-0 flex-1 font-sans">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-[#743AF6] bg-[#F0EEFF] px-1.5 py-0.5 rounded-sm">
                        {inv.code}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] rounded-sm bg-slate-100 text-slate-600 font-semibold">
                        {inv.role === 'Admin' ? '联席管理员' : '普通家庭成员'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 truncate max-w-[180px]">
                      {inv.invitationUrl}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(inv.invitationUrl, inv.id)}
                      className="px-2 py-1 rounded-lg border border-slate-100 hover:border-[#743AF6]/30 hover:bg-[#F0EEFF] text-slate-600 hover:text-[#743AF6] active:scale-95 transition-all font-bold flex items-center gap-1 cursor-pointer bg-transparent"
                    >
                      {copiedId === inv.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#743AF6] animate-bounce" />
                          <span className="text-[9px] text-[#743AF6] font-extrabold font-sans">已复制</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>复制</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-100 text-amber-800 text-[10px] rounded-xl p-2 px-3 leading-relaxed flex items-center gap-1.5 font-sans">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>安全提示：</strong>新家庭端设备访问密钥短链后，由管理员本地授权拉齐。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

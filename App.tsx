
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  HomeIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentCheckIcon, 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  PaintBrushIcon,
  CakeIcon,
  VideoCameraIcon,
  RectangleStackIcon,
  SparklesIcon,
  ArrowPathIcon,
  BookmarkIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  CheckIcon,
  ClockIcon,
  BanknotesIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { Guest, WeddingContext, GalleryImage, Table, MenuItem, BudgetItem, ProductionTask } from './types';
import { INITIAL_RITUALS, CATEGORIES } from './constants';
import { getWeddingAdvice, generateBackdropIdea } from './services/geminiService';

// --- Sub-Components ---

const SidebarItem: React.FC<{ 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-[#d4af37] text-white shadow-lg' 
        : 'text-gray-600 hover:bg-[#d4af37]/10 hover:text-[#d4af37]'
    }`}
  >
    <Icon className="w-6 h-6" />
    <span className="font-medium">{label}</span>
  </button>
);

const GlobalBudgetBar: React.FC<{ wedding: WeddingContext }> = ({ wedding }) => {
  const totalActual = useMemo(() => wedding.budgetItems.reduce((acc, item) => acc + item.actual, 0), [wedding.budgetItems]);
  const remaining = wedding.budgetTotal - totalActual;
  const progress = Math.min(Math.round((totalActual / (wedding.budgetTotal || 1)) * 100), 100);

  return (
    <div className="sticky top-0 z-20 mb-6 w-full animate-fadeIn">
      <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[#d4af37]/10 rounded-xl">
            <BanknotesIcon className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">งบประมาณรวม</p>
            <p className="text-lg font-bold text-gray-800">฿{wedding.budgetTotal.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex-1 w-full md:max-w-xs space-y-1">
          <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
            <span>ใช้ไปแล้ว ฿{totalActual.toLocaleString()}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${progress > 90 ? 'bg-rose-500' : 'bg-[#d4af37]'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">คงเหลือ</p>
            <p className={`text-lg font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ฿{remaining.toLocaleString()}
            </p>
          </div>
          <div className="hidden sm:block p-2 bg-gray-50 rounded-xl">
             <ChartPieIcon className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView: React.FC<{ 
  wedding: WeddingContext, 
  onUpdate: (u: Partial<WeddingContext>) => void,
  aiPrompt: string,
  setAiPrompt: (s: string) => void,
  handleAskAi: () => void,
  isAiLoading: boolean,
  aiResponse: string
}> = ({ wedding, onUpdate, aiPrompt, setAiPrompt, handleAskAi, isAiLoading, aiResponse }) => {
  const totalActual = useMemo(() => wedding.budgetItems.reduce((acc, item) => acc + item.actual, 0), [wedding.budgetItems]);
  const totalPaid = useMemo(() => wedding.budgetItems.reduce((acc, item) => acc + (item.isPaid ? item.actual : 0), 0), [wedding.budgetItems]);
  
  const confirmedGuests = wedding.guests.filter(g => g.status === 'Confirmed').length;
  const seatedGuests = wedding.guests.filter(g => g.tableId).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 thai-title">สานรัก - วางแผนงานแต่งงาน</h1>
          <div className="flex items-center space-x-2 mt-2">
            <input 
              className="bg-transparent border-b border-dashed border-gray-300 focus:border-[#d4af37] outline-none font-bold text-gray-700 w-24 text-center"
              value={wedding.coupleNames.bride}
              onChange={(e) => onUpdate({ coupleNames: { ...wedding.coupleNames, bride: e.target.value } })}
            />
            <span className="text-gray-400">&</span>
            <input 
              className="bg-transparent border-b border-dashed border-gray-300 focus:border-[#d4af37] outline-none font-bold text-gray-700 w-24 text-center"
              value={wedding.coupleNames.groom}
              onChange={(e) => onUpdate({ coupleNames: { ...wedding.coupleNames, groom: e.target.value } })}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: wedding.theme.primaryColor }}></div>
          <div className="w-8 h-8 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: wedding.theme.secondaryColor }}></div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">ชำระแล้ว (Paid)</p>
          <h3 className="text-2xl font-bold mt-1 text-emerald-600">฿{totalPaid.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-1">จากค่าใช้จ่ายจริง ฿{totalActual.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">แขกตอบรับ</p>
          <h3 className="text-2xl font-bold mt-1 text-rose-500">{confirmedGuests} คน</h3>
          <p className="text-xs text-gray-400 mt-1">จัดที่นั่งแล้ว {seatedGuests} คน</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">เมนูอาหาร</p>
          <h3 className="text-2xl font-bold mt-1 text-emerald-600">{wedding.catering.length} รายการ</h3>
          <p className="text-xs text-gray-400 mt-1">เตรียมพร้อมบริการแขก</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">งานสื่อ/วิดีโอ</p>
          <h3 className="text-2xl font-bold mt-1 text-blue-600">{wedding.production.tasks.length} งาน</h3>
          <p className="text-xs text-gray-400 mt-1">ทีม {wedding.production.videoTeam || 'ยังไม่ระบุ'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2 text-[#d4af37]" />
            ปรึกษา AI ผู้เชี่ยวชาญ
          </h4>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="ถามเรื่องเมนูอาหารมงคล หรือสีธีมที่เข้ากัน..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
            />
            <button onClick={handleAskAi} className="bg-[#d4af37] text-white px-6 py-3 rounded-xl hover:bg-[#b8962e]">ถาม</button>
          </div>
          {isAiLoading && <div className="mt-4 text-center text-gray-400 animate-pulse">กำลังวิเคราะห์ข้อมูล...</div>}
          {aiResponse && <div className="mt-6 p-4 bg-[#fdfaf6] rounded-xl border border-[#d4af37]/20 text-sm whitespace-pre-wrap">{aiResponse}</div>}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-6">ความคืบหน้าภาพรวม</h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-1"><span>ความพร้อมพิธีการ</span><span>{Math.round((wedding.rituals.filter(r => r.isCompleted).length / wedding.rituals.length) * 100)}%</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${(wedding.rituals.filter(r => r.isCompleted).length / wedding.rituals.length) * 100}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span>จัดที่นั่งแขก</span><span>{wedding.guests.length ? Math.round((seatedGuests / wedding.guests.length) * 100) : 0}%</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="bg-rose-400 h-full transition-all duration-500" style={{ width: `${wedding.guests.length ? (seatedGuests / wedding.guests.length) * 100 : 0}%` }}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1"><span>รายการอาหาร</span><span>{wedding.catering.length > 0 ? 100 : 0}%</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${wedding.catering.length > 0 ? 100 : 0}%` }}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetView: React.FC<{
  wedding: WeddingContext,
  onUpdate: (u: Partial<WeddingContext>) => void
}> = ({ wedding, onUpdate }) => {
  const [newItem, setNewItem] = useState({ category: CATEGORIES[0], item: '', estimated: 0, actual: 0 });

  const totalEstimated = useMemo(() => wedding.budgetItems.reduce((acc, i) => acc + i.estimated, 0), [wedding.budgetItems]);
  const totalActual = useMemo(() => wedding.budgetItems.reduce((acc, i) => acc + i.actual, 0), [wedding.budgetItems]);
  const totalPaid = useMemo(() => wedding.budgetItems.reduce((acc, i) => acc + (i.isPaid ? i.actual : 0), 0), [wedding.budgetItems]);
  const remaining = wedding.budgetTotal - totalActual;

  const addItem = () => {
    if (!newItem.item) return;
    const item: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      isPaid: false
    };
    onUpdate({ budgetItems: [...wedding.budgetItems, item] });
    setNewItem({ ...newItem, item: '', estimated: 0, actual: 0 });
  };

  const togglePaid = (id: string) => {
    onUpdate({
      budgetItems: wedding.budgetItems.map(i => i.id === id ? { ...i, isPaid: !i.isPaid } : i)
    });
  };

  const removeItem = (id: string) => {
    onUpdate({ budgetItems: wedding.budgetItems.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold text-gray-800 thai-title">จัดการงบประมาณอย่างละเอียด</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase font-bold">ปรับแก้งบประมาณรวม</p>
          <input 
            type="number" 
            value={wedding.budgetTotal}
            onChange={(e) => onUpdate({ budgetTotal: Number(e.target.value) })}
            className="text-2xl font-bold text-[#d4af37] bg-transparent border-b border-dashed border-[#d4af37]/30 focus:outline-none w-40 text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase">ยอดประมาณการทั้งหมด</p>
          <p className="text-xl font-bold text-gray-700">฿{totalEstimated.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase">จ่ายแล้ว (Paid Status)</p>
          <p className="text-xl font-bold text-emerald-500">฿{totalPaid.toLocaleString()}</p>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm ${remaining >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase">ยอดคงเหลือในงบ</p>
          <p className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ฿{remaining.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <PlusIcon className="w-5 h-5 mr-2 text-[#d4af37]" />
          เพิ่มรายการค่าใช้จ่าย
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-[10px] text-gray-400 block mb-1">หมวดหมู่</label>
            <select 
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="w-full p-2 rounded-xl border border-gray-200 text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-[10px] text-gray-400 block mb-1">รายการ</label>
            <input 
              type="text"
              value={newItem.item}
              onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
              className="w-full p-2 rounded-xl border border-gray-200 text-sm"
              placeholder="ระบุชื่อรายการ..."
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">ประมาณการ (฿)</label>
            <input 
              type="number"
              value={newItem.estimated}
              onChange={(e) => setNewItem({ ...newItem, estimated: Number(e.target.value) })}
              className="w-full p-2 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">ใช้จริง (฿)</label>
            <input 
              type="number"
              value={newItem.actual}
              onChange={(e) => setNewItem({ ...newItem, actual: Number(e.target.value) })}
              className="w-full p-2 rounded-xl border border-gray-200 text-sm"
            />
          </div>
          <button onClick={addItem} className="bg-[#d4af37] text-white py-2 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
            เพิ่ม
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">หมวดหมู่ / รายการ</th>
              <th className="px-6 py-4">ประมาณการ</th>
              <th className="px-6 py-4">ใช้จริง</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {wedding.budgetItems.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{item.category}</div>
                  <div className="font-medium text-gray-800">{item.item}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">฿{item.estimated.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-700">฿{item.actual.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => togglePaid(item.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                      item.isPaid 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {item.isPaid ? <CheckCircleIcon className="w-3 h-3" /> : <ExclamationCircleIcon className="w-3 h-3" />}
                    <span>{item.isPaid ? 'จ่ายแล้ว' : 'ยังไม่จ่าย'}</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-rose-500 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {wedding.budgetItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">ยังไม่มีรายการค่าใช้จ่าย</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// DecorView, SeatingView, CateringView, ProductionView remain as they were in the previous logic...
// To keep code concise and avoid re-outputting unchanged sub-views, I'll include only the top-level App and updated logic.

// --- Main App Component ---

const App: React.FC = () => {
  type TabType = 'dashboard' | 'guests' | 'seating' | 'budget' | 'rituals' | 'ai' | 'gallery' | 'decor' | 'catering' | 'production';
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [wedding, setWedding] = useState<WeddingContext>(() => {
    const saved = localStorage.getItem('sarn_rak_wedding');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.gallery) parsed.gallery = [];
      if (!parsed.theme) parsed.theme = { name: 'Traditional Elegance', primaryColor: '#d4af37', secondaryColor: '#ffffff', backdropNotes: '' };
      if (!parsed.tables) parsed.tables = [];
      if (!parsed.catering) parsed.catering = [];
      if (!parsed.budgetItems) parsed.budgetItems = [];
      if (!parsed.production) parsed.production = { videoTeam: '', projectors: 1, tasks: [] };
      if (!parsed.production.tasks) parsed.production.tasks = [];
      return parsed;
    }
    return {
      coupleNames: { groom: 'ก้อง', bride: 'แก้ว' },
      budgetTotal: 500000,
      guests: [],
      budgetItems: [],
      rituals: INITIAL_RITUALS,
      gallery: [],
      theme: { name: 'Traditional Elegance', primaryColor: '#d4af37', secondaryColor: '#ffffff', backdropNotes: '' },
      tables: [],
      catering: [],
      production: { videoTeam: '', projectors: 1, tasks: [] }
    };
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [generatedIdeaUrl, setGeneratedIdeaUrl] = useState<string | null>(null);
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sarn_rak_wedding', JSON.stringify(wedding));
  }, [wedding]);

  const updateWedding = (updates: Partial<WeddingContext>) => {
    setWedding(prev => ({ ...prev, ...updates }));
  };

  const handleAskAi = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    const context = `Wedding for ${wedding.coupleNames.bride} & ${wedding.coupleNames.groom}, Theme: ${wedding.theme.name}, Budget: ${wedding.budgetTotal}, Guests: ${wedding.guests.length}`;
    const res = await getWeddingAdvice(aiPrompt, context);
    setAiResponse(res || '');
    setIsAiLoading(false);
  };

  const handleGenerateIdea = async () => {
    setIsGeneratingIdea(true);
    setGeneratedIdeaUrl(null);
    try {
      const url = await generateBackdropIdea(
        wedding.theme.name,
        wedding.theme.primaryColor,
        wedding.theme.secondaryColor,
        wedding.theme.backdropNotes
      );
      setGeneratedIdeaUrl(url);
    } catch (err) {
      alert("ไม่สามารถสร้างรูปภาพได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  const saveGeneratedToGallery = () => {
    if (!generatedIdeaUrl) return;
    const newImage: GalleryImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: generatedIdeaUrl,
      type: 'Inspiration',
      createdAt: Date.now()
    };
    updateWedding({ gallery: [...wedding.gallery, newImage] });
    setGeneratedIdeaUrl(null);
    alert("บันทึกลงแกลเลอรี่แล้ว!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newImage: GalleryImage = {
          id: Math.random().toString(36).substr(2, 9),
          url: base64String,
          type: 'Engagement',
          createdAt: Date.now()
        };
        updateWedding({ gallery: [...wedding.gallery, newImage] });
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfaf6]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-gray-100 p-6 flex flex-col space-y-6 sticky top-0 h-auto md:h-screen z-10">
        <div className="flex items-center space-x-3 px-2 mb-4">
          <div className="w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center shadow-lg"><span className="text-white text-xl font-bold">SR</span></div>
          <div><h2 className="text-xl font-bold text-gray-800 thai-title">สานรัก</h2><p className="text-[10px] text-[#d4af37] uppercase tracking-widest font-bold">Wedding Planner</p></div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <SidebarItem icon={HomeIcon} label="แผงควบคุม" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={UsersIcon} label="รายชื่อแขก" active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} />
          <SidebarItem icon={RectangleStackIcon} label="ผังที่นั่ง" active={activeTab === 'seating'} onClick={() => setActiveTab('seating')} />
          <SidebarItem icon={PaintBrushIcon} label="ธีมและฉาก" active={activeTab === 'decor'} onClick={() => setActiveTab('decor')} />
          <SidebarItem icon={CakeIcon} label="อาหาร & เครื่องดื่ม" active={activeTab === 'catering'} onClick={() => setActiveTab('catering')} />
          <SidebarItem icon={VideoCameraIcon} label="สื่อ & วิดีโอ" active={activeTab === 'production'} onClick={() => setActiveTab('production')} />
          <SidebarItem icon={CurrencyDollarIcon} label="งบประมาณ" active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} />
          <SidebarItem icon={ClipboardDocumentCheckIcon} label="ลำดับพิธีการ" active={activeTab === 'rituals'} onClick={() => setActiveTab('rituals')} />
          <SidebarItem icon={PhotoIcon} label="แกลเลอรี่" active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} />
          <SidebarItem icon={ChatBubbleLeftRightIcon} label="ปรึกษา AI" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>

        <div className="bg-[#fdfaf6] p-4 rounded-xl border border-[#d4af37]/10 mt-auto">
          <p className="text-xs text-gray-400">บ่าวสาว:</p>
          <p className="text-sm font-bold text-gray-700 truncate">{wedding.coupleNames.bride} & {wedding.coupleNames.groom}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Global Budget Bar - Always Visible */}
        <GlobalBudgetBar wedding={wedding} />

        {activeTab === 'dashboard' && (
          <DashboardView 
            wedding={wedding} 
            onUpdate={updateWedding} 
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            handleAskAi={handleAskAi}
            isAiLoading={isAiLoading}
            aiResponse={aiResponse}
          />
        )}
        
        {activeTab === 'guests' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800 thai-title">รายชื่อแขกเหรื่อ</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-gray-500 mb-1">ชื่อแขก</label>
                <input type="text" id="guest-name-input" className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="ระบุชื่อแขก..." />
              </div>
              <button 
                onClick={() => {
                  const input = document.getElementById('guest-name-input') as HTMLInputElement;
                  if(input.value) {
                    updateWedding({ guests: [...wedding.guests, { id: Math.random().toString(36).substr(2, 9), name: input.value, side: 'Mutual', status: 'Pending', plusOne: false }] });
                    input.value = '';
                  }
                }}
                className="bg-[#d4af37] text-white px-6 py-2 rounded-xl flex items-center font-bold"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> เพิ่มแขก
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">ชื่อ</th>
                    <th className="px-6 py-4">ฝ่าย</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4">โต๊ะ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wedding.guests.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{g.name}</td>
                      <td className="px-6 py-4">
                        <select 
                          className="text-xs bg-transparent border-none focus:ring-0 p-0"
                          value={g.side}
                          onChange={(e) => updateWedding({ guests: wedding.guests.map(item => item.id === g.id ? { ...item, side: e.target.value as any } : item) })}
                        >
                          <option value="Mutual">ส่วนกลาง</option>
                          <option value="Bride">เจ้าสาว</option>
                          <option value="Groom">เจ้าบ่าว</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className={`text-[10px] px-2 py-1 rounded-full cursor-pointer font-bold ${g.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}
                          onClick={() => updateWedding({ guests: wedding.guests.map(item => item.id === g.id ? { ...item, status: g.status === 'Confirmed' ? 'Pending' : 'Confirmed' } : item) })}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{wedding.tables.find(t => t.id === g.tableId)?.name || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => updateWedding({ guests: wedding.guests.filter(item => item.id !== g.id) })} className="text-gray-300 hover:text-rose-500">
                          <TrashIcon className="w-5 h-5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {wedding.guests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400">ยังไม่มีรายชื่อแขก</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'seating' && (
          <SeatingView wedding={wedding} onUpdate={updateWedding} />
        )}

        {activeTab === 'decor' && (
          <DecorView 
            wedding={wedding} 
            onUpdate={updateWedding} 
            onGenerate={handleGenerateIdea}
            isGenerating={isGeneratingIdea}
            generatedUrl={generatedIdeaUrl}
            onOpenFull={setFullScreenImageUrl}
            onSaveIdea={saveGeneratedToGallery}
          />
        )}
        
        {activeTab === 'catering' && (
          <CateringView wedding={wedding} onUpdate={updateWedding} />
        )}
        
        {activeTab === 'production' && (
          <ProductionView wedding={wedding} onUpdate={updateWedding} />
        )}
        
        {activeTab === 'budget' && (
          <BudgetView wedding={wedding} onUpdate={updateWedding} />
        )}
        
        {activeTab === 'rituals' && (
           <div className="space-y-6 animate-fadeIn">
              <h2 className="text-3xl font-bold text-gray-800 thai-title">ลำดับพิธีการไทย</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {wedding.rituals.map(r => (
                   <div 
                    key={r.id} 
                    className={`p-5 rounded-2xl flex items-start space-x-4 transition-all cursor-pointer ${r.isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100 border'}`}
                    onClick={() => updateWedding({ rituals: wedding.rituals.map(item => item.id === r.id ? { ...item, isCompleted: !item.isCompleted } : item) })}
                   >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${r.isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                        {r.order}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800">{r.title}</h4>
                          {r.isCompleted && <ArrowPathIcon className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'gallery' && (
           <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold text-gray-800 thai-title">แกลเลอรี่ภาพประทับใจ</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-[#d4af37] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" /> เพิ่มรูปภาพ
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {wedding.gallery.map(img => (
                   <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => setFullScreenImageUrl(img.url)}
                          className="bg-white/20 p-2 rounded-full backdrop-blur-md text-white hover:bg-white hover:text-[#d4af37] transition-all"
                        >
                          <ArrowsPointingOutIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateWedding({ gallery: wedding.gallery.filter(i => i.id !== img.id) })}
                          className="bg-white/20 p-2 rounded-full backdrop-blur-md text-white hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                 ))}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
              </div>
           </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fadeIn h-full flex flex-col">
            <h2 className="text-3xl font-bold text-gray-800 thai-title">ปรึกษาผู้เชี่ยวชาญ AI</h2>
            <div className="bg-white flex-1 p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-4">
               <div className="bg-rose-50 p-4 rounded-xl text-rose-700 text-sm flex items-start space-x-3">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>ถามอะไรก็ได้เกี่ยวกับการจัดงานแต่งงานแบบไทย เช่น "พิธีขบวนแห่ขันหมากต้องมีอะไรบ้าง?" หรือ "ช่วยเขียนคำเชิญแขกแบบสุภาพหน่อย"</p>
               </div>

               <div className="flex-1 overflow-y-auto min-h-[300px] p-4 bg-[#fdfaf6] rounded-2xl border border-gray-100">
                  {aiResponse ? (
                    <div className="prose prose-rose max-w-none text-gray-700">
                      <div className="flex items-center space-x-2 text-[#d4af37] mb-2 font-bold">
                        <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                        <span>คำแนะนำจากสานรัก:</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4 opacity-20" />
                      <p>พิมพ์คำถามของคุณด้านล่าง</p>
                    </div>
                  )}
                  {isAiLoading && (
                    <div className="flex items-center space-x-2 text-[#d4af37] animate-pulse mt-4">
                      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      <span>กำลังเขียนคำแนะนำที่เหมาะสมกับงานของคุณ...</span>
                    </div>
                  )}
               </div>

               <div className="flex space-x-3 pt-4">
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskAi()}
                    className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30"
                    placeholder="พิมพ์คำถามที่นี่..."
                  />
                  <button 
                    onClick={handleAskAi}
                    className="bg-[#d4af37] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#b8962e] transition-all shadow-lg disabled:opacity-50"
                    disabled={isAiLoading || !aiPrompt}
                  >
                    ปรึกษา
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Image Modal Overlay */}
      {fullScreenImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setFullScreenImageUrl(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <button 
              className="absolute top-0 right-0 m-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setFullScreenImageUrl(null); }}
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <img 
              src={fullScreenImageUrl} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

// --- Missing Views used in Tab Routing ---

const SeatingView: React.FC<{
  wedding: WeddingContext,
  onUpdate: (u: Partial<WeddingContext>) => void
}> = ({ wedding, onUpdate }) => {
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(10);

  const addTable = () => {
    if (!tableName) return;
    const newTable: Table = { id: Math.random().toString(36).substr(2, 9), name: tableName, capacity };
    onUpdate({ tables: [...wedding.tables, newTable] });
    setTableName('');
  };

  const assignTable = (guestId: string, tableId: string) => {
    onUpdate({
      guests: wedding.guests.map(g => g.id === guestId ? { ...g, tableId } : g)
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold text-gray-800 thai-title">ผังที่นั่งแขก</h2>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-500">
           จัดที่นั่งแล้ว {wedding.guests.filter(g => g.tableId).length} / {wedding.guests.filter(g => g.status === 'Confirmed').length} คน
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-500 mb-1">ชื่อโต๊ะ (เช่น VIP 1, ฝ่ายเจ้าสาว 2)</label>
          <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d4af37]/30" />
        </div>
        <div className="w-32">
          <label className="block text-sm text-gray-500 mb-1">ความจุ (คน)</label>
          <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#d4af37]/30" />
        </div>
        <button onClick={addTable} className="bg-[#d4af37] text-white px-6 py-2 rounded-xl h-[42px] font-bold shadow-md hover:shadow-lg transition-all">
          <PlusIcon className="w-5 h-5 inline mr-1" /> เพิ่มโต๊ะ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wedding.tables.map(table => {
          const tableGuests = wedding.guests.filter(g => g.tableId === table.id);
          const isFull = tableGuests.length >= table.capacity;
          return (
            <div key={table.id} className={`bg-white p-6 rounded-3xl border transition-all ${isFull ? 'border-emerald-100 shadow-emerald-50 shadow-sm' : 'border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${isFull ? 'bg-emerald-500' : 'bg-[#d4af37]'}`} />
                   <h3 className="font-bold text-gray-800">{table.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${isFull ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                  {tableGuests.length} / {table.capacity}
                </span>
              </div>
              <div className="space-y-1 min-h-[120px] max-h-[200px] overflow-y-auto mb-4 border-t border-gray-50 pt-3">
                {tableGuests.map(g => (
                  <div key={g.id} className="flex justify-between items-center text-sm py-1.5 px-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-gray-700 font-medium">{g.name}</span>
                    <button onClick={() => assignTable(g.id, '')} className="text-gray-300 hover:text-rose-500 transition-colors">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
              <select 
                className="w-full text-xs p-2 rounded-xl border border-gray-100 bg-gray-50"
                onChange={(e) => assignTable(e.target.value, table.id)}
                value=""
              >
                <option value="">+ เพิ่มแขก</option>
                {wedding.guests.filter(g => !g.tableId && g.status === 'Confirmed').map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CateringView: React.FC<{
  wedding: WeddingContext,
  onUpdate: (u: Partial<WeddingContext>) => void
}> = ({ wedding, onUpdate }) => {
  const [dish, setDish] = useState('');
  const [cat, setCat] = useState<'Appetizer' | 'Main' | 'Dessert' | 'Drink'>('Main');
  const addDish = () => {
    if (!dish) return;
    const newItem: MenuItem = { id: Math.random().toString(36).substr(2, 9), name: dish, category: cat };
    onUpdate({ catering: [...wedding.catering, newItem] });
    setDish('');
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-800 thai-title">รายการอาหารและเครื่องดื่ม</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <input type="text" value={dish} onChange={(e) => setDish(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200" placeholder="ชื่อเมนู..." />
        <select value={cat} onChange={(e) => setCat(e.target.value as any)} className="px-4 py-2 rounded-xl border border-gray-200">
           {['Appetizer', 'Main', 'Dessert', 'Drink'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addDish} className="bg-[#d4af37] text-white px-6 py-2 rounded-xl font-bold">เพิ่มเมนู</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Appetizer', 'Main', 'Dessert', 'Drink'].map(category => (
          <div key={category} className="bg-white p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold mb-4 flex items-center"><CakeIcon className="w-5 h-5 mr-2 text-[#d4af37]"/> {category}</h4>
            {wedding.catering.filter(m => m.category === category).map(m => (
              <div key={m.id} className="flex justify-between py-2 border-b last:border-0 border-gray-50">
                <span>{m.name}</span>
                <button onClick={() => onUpdate({ catering: wedding.catering.filter(i => i.id !== m.id) })}><TrashIcon className="w-4 h-4 text-gray-300 hover:text-rose-500"/></button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductionView: React.FC<{
  wedding: WeddingContext,
  onUpdate: (u: Partial<WeddingContext>) => void
}> = ({ wedding, onUpdate }) => {
  const [taskName, setTaskName] = useState('');
  const addTask = () => {
    if (!taskName) return;
    const newTask: ProductionTask = { id: Math.random().toString(36).substr(2, 9), item: taskName, status: 'Pending' };
    onUpdate({ production: { ...wedding.production, tasks: [...wedding.production.tasks, newTask] } });
    setTaskName('');
  };
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-800 thai-title">งานบันทึกวิดีโอและสื่อในงาน</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <input type="text" value={wedding.production.videoTeam} onChange={(e) => onUpdate({ production: { ...wedding.production, videoTeam: e.target.value } })} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="ชื่อทีมโปรดักชั่น..." />
        <div className="flex space-x-2">
          <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} className="flex-1 px-4 py-2 rounded-xl border border-gray-200" placeholder="เพิ่มงานใหม่..." />
          <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">เพิ่มงาน</button>
        </div>
        <div className="space-y-2 mt-4">
          {wedding.production.tasks.map(t => (
            <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex justify-between">
              <span>{t.item}</span>
              <button onClick={() => onUpdate({ production: { ...wedding.production, tasks: wedding.production.tasks.filter(tk => tk.id !== t.id) } })}><TrashIcon className="w-4 h-4 text-gray-300"/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DecorView: React.FC<{
  wedding: WeddingContext,
  onUpdate: (u: Partial<WeddingContext>) => void,
  onGenerate: () => void,
  isGenerating: boolean,
  generatedUrl: string | null,
  onOpenFull: (url: string) => void,
  onSaveIdea: () => void
}> = ({ wedding, onUpdate, onGenerate, isGenerating, generatedUrl, onOpenFull, onSaveIdea }) => (
  <div className="space-y-8 animate-fadeIn">
    <h2 className="text-3xl font-bold text-gray-800 thai-title">ธีมและการตกแต่ง</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4">
        <input type="text" value={wedding.theme.name} onChange={(e) => onUpdate({ theme: { ...wedding.theme, name: e.target.value } })} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="ชื่อธีม..." />
        <div className="flex space-x-4">
          <input type="color" value={wedding.theme.primaryColor} onChange={(e) => onUpdate({ theme: { ...wedding.theme, primaryColor: e.target.value } })} className="flex-1 h-10 rounded-xl" />
          <input type="color" value={wedding.theme.secondaryColor} onChange={(e) => onUpdate({ theme: { ...wedding.theme, secondaryColor: e.target.value } })} className="flex-1 h-10 rounded-xl" />
        </div>
        <textarea className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200" value={wedding.theme.backdropNotes} onChange={(e) => onUpdate({ theme: { ...wedding.theme, backdropNotes: e.target.value } })} placeholder="รายละเอียดฉาก..."></textarea>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center space-y-4">
        <button onClick={onGenerate} disabled={isGenerating} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold">สร้างไอเดียด้วย AI</button>
        {generatedUrl && <img src={generatedUrl} className="w-full h-48 object-cover rounded-xl shadow-sm" />}
      </div>
    </div>
  </div>
);

export default App;

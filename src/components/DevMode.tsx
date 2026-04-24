
import React, { useState, useEffect, useRef } from 'react';
import { SiteData, SectionConfig, StyleConfig, PortfolioItem, ServiceItem } from '../types';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, LogOut, Upload, Loader2, ChevronDown, ChevronUp, Smartphone, Monitor, Eye, X, Check, Mail, Share2 as Instagram, MapPin, Phone, Globe, Video as Youtube, Briefcase as Linkedin, X as Twitter, Users as Facebook, MessageSquare, Send } from 'lucide-react';
import { GOOGLE_FONTS } from '../lib/fonts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

const LucideIcons = { Check, Mail, Instagram, MapPin, Phone, Globe, Youtube, Linkedin, Twitter, Facebook, MessageSquare, Send };

function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

const DynamicIcon = ({ name, size = 20, className }: { name: string, size?: number, className?: string }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Mail;
  return <Icon size={size} className={className} />;
};

interface DevModeProps {
 data: SiteData;
 onSave: (data: SiteData) => Promise<void>;
 onChange?: (data: SiteData) => void;
 onClose: () => void;
 user: any;
 onLogin?: () => void;
}

const UploadButton = ({ onUpload, label, accept = "image/*", className }: { onUpload: (url: string) => void, label: string, accept?: string, className?: string }) => {
 const [isUploading, setIsUploading] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsUploading(true);

 try {
 const reader = new FileReader();
 reader.onloadend = () => {
 const base64String = reader.result as string;
 onUpload(base64String);
 setIsUploading(false);
 if (fileInputRef.current) fileInputRef.current.value = '';
 };
 reader.onerror = () => {
 throw new Error('Falha ao converter arquivo');
 };
 reader.readAsDataURL(file);
 } catch (error) {
 console.error('Upload error:', error);
 alert('Erro ao processar o arquivo.');
 setIsUploading(false);
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 };

 return (
 <>
 <input 
 type="file" 
 ref={fileInputRef}
 onChange={handleFileChange}
 accept={accept}
 className="hidden"
 />
 <button
 onClick={() => fileInputRef.current?.click()}
 disabled={isUploading}
 className={cn("flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 whitespace-nowrap min-h-[44px]", className)}
 >
 {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
 {label}
 </button>
 </>
 );
};

const DebouncedColorInput = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
 const [localValue, setLocalValue] = useState(value);

 useEffect(() => {
 setLocalValue(value);
 }, [value]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 setLocalValue(e.target.value);
 };

 useEffect(() => {
 const timer = setTimeout(() => {
 if (localValue !== value) {
 onChange(localValue);
 }
 }, 100);
 return () => clearTimeout(timer);
 }, [localValue, value, onChange]);

 return (
 <input 
 type="color"
 value={localValue}
 onChange={handleChange}
 className={className}
 />
 );
};

const CustomDropdown = ({ 
 options, 
 value, 
 onChange, 
 placeholder, 
 className 
}: { 
 options: { label: string, value: string }[], 
 value: string, 
 onChange: (val: string) => void, 
 placeholder: string,
 className?: string
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
 setIsOpen(false);
 }
 };
 if (isOpen) {
 document.addEventListener('mousedown', handleClickOutside);
 }
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, [isOpen]);

 const selectedOption = options.find(o => o.value === value);

 return (
 <div ref={containerRef} className={cn("relative", className)}>
 <button
 onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
 className="w-full flex items-center justify-between text-left bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer hover:bg-zinc-800"
 >
 <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
 <ChevronDown size={14} className={cn("ml-2 flex-shrink-0 transition-transform opacity-50", isOpen && "rotate-180")} />
 </button>
 {isOpen && (
 <div className="absolute bottom-full left-0 mb-2 w-48 max-h-60 overflow-y-auto hidden-scrollbar bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-xl z-50">
 <button
 onClick={(e) => { e.preventDefault(); onChange(''); setIsOpen(false); }}
 className={cn(
 "w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 cursor-pointer transition-colors block",
 !value && "text-emerald-400 bg-zinc-800/50"
 )}
 >
 {placeholder}
 </button>
 {options.map((opt) => (
 <button
 key={opt.value}
 onClick={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
 className={cn(
 "w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 cursor-pointer transition-colors block",
 value === opt.value && "text-emerald-400 bg-zinc-800/50"
 )}
 >
 {opt.label}
 </button>
 ))}
 </div>
 )}
 </div>
 );
};

const RichTextarea = ({ 
 value = "", 
 onChange, 
 onSelect, 
 data, 
 context,
 className, 
 minHeight = "80px",
 placeholder,
 previewScale,
 targetWidth
}: { 
 value: string, 
 onChange: (val: string) => void, 
 onSelect: (e: any, context?: string) => void, 
 data: SiteData, 
 context?: string,
 className?: string,
 minHeight?: string,
 placeholder?: string,
 previewScale?: number,
 targetWidth?: number
}) => {
 const textareaRef = useRef<HTMLTextAreaElement>(null);
 const preRef = useRef<HTMLDivElement>(null);
 const [selection, setSelection] = useState({ start: 0, end: 0, focused: false });

 useEffect(() => {
 const handleSelectionChange = () => {
 if (textareaRef.current && document.activeElement === textareaRef.current) {
 setSelection({
 start: textareaRef.current.selectionStart,
 end: textareaRef.current.selectionEnd,
 focused: true
 });
 onSelect({ currentTarget: textareaRef.current } as any, context);
 } else if (textareaRef.current && document.activeElement !== textareaRef.current) {
 setSelection(prev => ({ ...prev, focused: false }));
 }
 };

 document.addEventListener('selectionchange', handleSelectionChange);
 return () => document.removeEventListener('selectionchange', handleSelectionChange);
 }, [context, onSelect]);

 const handleScroll = () => {
 if (textareaRef.current && preRef.current) {
 preRef.current.scrollTop = textareaRef.current.scrollTop;
 preRef.current.scrollLeft = textareaRef.current.scrollLeft;
 }
 };

 const handleSelect = (e: any) => {
 setSelection({
 start: e.target.selectionStart,
 end: e.target.selectionEnd,
 focused: true
 });
 onSelect(e, context);
 };

 const baseFontFamily = data?.styles?.fontFamily ? `"${data.styles.fontFamily}", sans-serif` : undefined;

 let globalCharIndex = 0;

 return (
 <div className="relative w-full" style={{ minHeight }}>
 <div 
 ref={preRef}
 className={cn(
 "absolute inset-0 p-5 pointer-events-none overflow-hidden whitespace-pre-wrap break-words border border-transparent rounded-2xl z-0",
 className
 )}
 style={{ 
 minHeight,
 lineHeight: '1',
 fontFamily: baseFontFamily
 }}
 aria-hidden="true"
 >
 {(value || "").split('\n').map((line, lineIdx, linesArray) => {
 const isLastLine = lineIdx === linesArray.length - 1;
 
 let lineLineHeight: string | undefined = undefined;
 const parts = line.split(/([^a-zA-Z0-9À-ÿ']+)/).filter(p => p !== '');
 
 for (const part of parts) {
 if (!part.trim()) continue;
 const style = (context && data?.wordStyles?.[`${context}:${part}`]) || data?.wordStyles?.[part];
 if (style?.lineHeight !== undefined) {
 const formatValue = (val: string | number | undefined) => {
 if (val === undefined || val === '' || String(val).toLowerCase() === 'auto') return undefined;
 
 let pxValue: number | undefined = undefined;
 
 if (typeof val === 'number') {
 pxValue = val;
 } else if (typeof val === 'string') {
 if (val.endsWith('vw') && targetWidth) {
 pxValue = (parseFloat(val) / 100) * targetWidth;
 } else if (val.endsWith('px')) {
 pxValue = parseFloat(val);
 } else if (/^-?\d*\.?\d+$/.test(val)) {
 pxValue = parseFloat(val);
 }
 }
 
 if (pxValue !== undefined) {
 if (previewScale) {
 return `${pxValue * previewScale}px`;
 }
 return `${pxValue}px`;
 }
 
 return String(val);
 };
 lineLineHeight = formatValue(style.lineHeight);
 break;
 }
 }

 return (
 <div key={lineIdx} className="leading-tight" style={{ marginBottom: lineLineHeight, lineHeight: '1.2', minHeight: '1em' }}>
 {line.split(/([^a-zA-Z0-9À-ÿ']+)/).map((part, i) => {
 if (!part) return null;
 const partStart = globalCharIndex;
 globalCharIndex += part.length;
 
 if (!/^[a-zA-Z0-9À-ÿ']+$/.test(part)) {
 return <span key={i}>{part}</span>;
 }

 const style = (context && data?.wordStyles?.[`${context}:${part}`]) || data?.wordStyles?.[part] || {};
 const isOutline = style.isOutline !== undefined ? style.isOutline : data?.outlinedWords?.includes(part);
 const isSelected = selection.focused && selection.start < globalCharIndex && selection.end > partStart;

 const formatValue = (val: string | number | undefined) => {
 if (val === undefined || val === '' || String(val).toLowerCase() === 'auto') return undefined;
 
 let pxValue: number | undefined = undefined;
 
 if (typeof val === 'number') {
 pxValue = val;
 } else if (typeof val === 'string') {
 if (val.endsWith('vw') && targetWidth) {
 pxValue = (parseFloat(val) / 100) * targetWidth;
 } else if (val.endsWith('px')) {
 pxValue = parseFloat(val);
 } else if (/^-?\d*\.?\d+$/.test(val)) {
 pxValue = parseFloat(val);
 }
 }
 
 if (pxValue !== undefined) {
 if (previewScale) {
 return `${pxValue * previewScale}px`;
 }
 return `${pxValue}px`;
 }
 
 return String(val);
 };

 const getOutlineStyle = (width: string | undefined, color: string | undefined) => {
 if (!isOutline) return {};
 const w = parseFloat(formatValue(width) || '1') || 1;
 const c = color || 'white';
 return { 
 WebkitTextStroke: `${w * 1.8}px ${c}`, 
 paintOrder: 'stroke fill',
 WebkitTextFillColor: 'black',
 color: 'black',
 mixBlendMode: 'screen' as const,
 WebkitFontSmoothing: 'antialiased' as const
 };
 };

 return (
 <span 
 key={i} 
 className={cn(
 "inline-block align-baseline transition-all", 
 style.fontWeight,
 isSelected && "ring-1 ring-emerald-500 bg-emerald-500/10 rounded-sm"
 )}
 style={{
 fontFamily: style.fontFamily ? `"${style.fontFamily}", sans-serif` : undefined,
 fontSize: formatValue(style.fontSize),
 ...(!isOutline ? { color: style.color || undefined } : getOutlineStyle(style.outlineWidth, style.color)),
 lineHeight: '1',
 letterSpacing: style.letterSpacing ? formatValue(style.letterSpacing) : (isOutline ? '0.02em' : undefined),
 }}
 >
 {part}
 </span>
 );
 })}
 {isLastLine && <span className="inline-block w-[1px] h-[1.2em] align-middle bg-emerald-500 animate-pulse ml-[1px]" />}
 </div>
 );
 })}
 </div>
 <textarea
 ref={textareaRef}
 value={value}
 onChange={e => onChange(e.target.value)}
 onSelect={handleSelect}
 onScroll={handleScroll}
 className={cn(
 "w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-transparent caret-emerald-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none relative z-10 resize-none overflow-y-auto hidden-scrollbar",
 className
 )}
 style={{ 
 minHeight,
 lineHeight: '1.2',
 fontFamily: baseFontFamily
 }}
 placeholder={placeholder}
 />
 </div>
 );
};

export const DevMode: React.FC<DevModeProps> = ({ data: baseData, onSave, onChange, onClose, user, onLogin }) => {
 const [localData, setLocalData] = useState<SiteData>(baseData);
 const [mobileData, setMobileData] = useState<Partial<SiteData>>({});
 const [selectedText, setSelectedText] = useState<{ word: string, context?: string } | null>(null);
 const [isSaving, setIsSaving] = useState(false);
 const [floatingMenu, setFloatingMenu] = useState<{ visible: boolean, words: string[], context?: string }>({ visible: false, words: [] });
 const [expandedBackgrounds, setExpandedBackgrounds] = useState<Record<string, boolean>>({});
 const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
 const [showDesktopPreview, setShowDesktopPreview] = useState(false);
 const [desktopPreviewScale, setDesktopPreviewScale] = useState(1);
 const iframeRef = useRef<HTMLIFrameElement>(null);
 const desktopIframeRef = useRef<HTMLIFrameElement>(null);
 const desktopPreviewContainerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (iframeRef.current?.contentWindow) {
 iframeRef.current.contentWindow.postMessage({ type: 'DEV_MODE_PREVIEW_UPDATE', data: localData }, '*');
 }
 if (desktopIframeRef.current?.contentWindow) {
 desktopIframeRef.current.contentWindow.postMessage({ type: 'DEV_MODE_PREVIEW_UPDATE', data: localData }, '*');
 }
 }, [localData, viewMode]);

 useEffect(() => {
 setLocalData(baseData);
 }, [baseData]);

 useEffect(() => {
 if (onChange) onChange(localData);
 }, [localData, onChange]);

 useEffect(() => {
 const handleResize = () => {
 if (desktopPreviewContainerRef.current) {
 const container = desktopPreviewContainerRef.current;
 const scale = Math.min(
 container.clientWidth / 1920,
 container.clientHeight / 1080
 ) * 0.9;
 setDesktopPreviewScale(scale);
 }
 };

 if (showDesktopPreview) {
 window.addEventListener('resize', handleResize);
 handleResize();
 }
 return () => window.removeEventListener('resize', handleResize);
 }, [showDesktopPreview]);

 const handleSave = async () => {
 setIsSaving(true);
 try {
 await onSave(localData);
 } catch (error) {
 console.error('Error saving:', error);
 alert('Erro ao salvar alterações.');
 } finally {
 setIsSaving(false);
 }
 };

 const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>, context?: string) => {
 const textarea = e.currentTarget;
 const start = textarea.selectionStart;
 const end = textarea.selectionEnd;
 const text = textarea.value;

 const wordsInSelection = text.substring(start, end).split(/[^a-zA-Z0-9À-ÿ']+/).filter(w => w.length > 0);
 
 if (wordsInSelection.length > 0) {
 setFloatingMenu({ visible: true, words: wordsInSelection, context });
 } else {
 const wordMatch = text.substring(0, start).match(/[a-zA-Z0-9À-ÿ']+$/);
 const wordMatchAfter = text.substring(start).match(/^[a-zA-Z0-9À-ÿ']+/);
 
 if (wordMatch || wordMatchAfter) {
 const word = (wordMatch ? wordMatch[0] : '') + (wordMatchAfter ? wordMatchAfter[0] : '');
 setSelectedText({ word, context });
 setFloatingMenu({ visible: false, words: [] });
 } else {
 setSelectedText(null);
 setFloatingMenu({ visible: false, words: [] });
 }
 }
 };

 const updateWordStyle = (word: string, style: Partial<StyleConfig>, context?: string) => {
 const key = context ? `${context}:${word}` : word;
 setLocalData(prev => ({
 ...prev,
 wordStyles: {
 ...prev.wordStyles,
 [key]: { ...(prev.wordStyles?.[key] || {}), ...style }
 }
 }));
 };

 const toggleWordOutline = (word: string) => {
 setLocalData(prev => {
 const isOutlined = prev.outlinedWords?.includes(word);
 return {
 ...prev,
 outlinedWords: isOutlined 
 ? prev.outlinedWords?.filter(w => w !== word)
 : [...(prev.outlinedWords || []), word]
 };
 });
 };

 const updatePortfolio = (index: number, field: keyof PortfolioItem, value: string) => {
 const newPortfolio = [...(localData.portfolio || [])];
 newPortfolio[index] = { ...newPortfolio[index], [field]: value };
 setLocalData({ ...localData, portfolio: newPortfolio });
 };

 const addPortfolioItem = () => {
 const newItem: PortfolioItem = {
 id: Date.now().toString(),
 title: 'Novo Projeto',
 category: 'Categoria',
 thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80',
 videoUrl: ''
 };
 setLocalData({ ...localData, portfolio: [...(localData.portfolio || []), newItem] });
 };

 const removePortfolioItem = (index: number) => {
 const newPortfolio = (localData.portfolio || []).filter((_, i) => i !== index);
 setLocalData({ ...localData, portfolio: newPortfolio });
 };

 const updateExpertise = (index: number, field: keyof ServiceItem, value: string) => {
 const newExpertise = [...(localData.expertise || [])];
 newExpertise[index] = { ...newExpertise[index], [field]: value };
 setLocalData({ ...localData, expertise: newExpertise });
 };

 const addExpertiseItem = () => {
 const newItem: ServiceItem = {
 id: Date.now().toString(),
 title: 'Nova Expertise',
 description: 'Descrição da expertise...'
 };
 setLocalData({ ...localData, expertise: [...(localData.expertise || []), newItem] });
 };

 const removeExpertiseItem = (index: number) => {
 const newExpertise = (localData.expertise || []).filter((_, i) => i !== index);
 setLocalData({ ...localData, expertise: newExpertise });
 };

 const updateNumber = (index: number, field: 'value' | 'label', value: string) => {
 const newNumbers = [...(localData.numbers || [])];
 newNumbers[index] = { ...newNumbers[index], [field]: value };
 setLocalData({ ...localData, numbers: newNumbers });
 };

 const addNumberItem = () => {
 setLocalData({ ...localData, numbers: [...(localData.numbers || []), { value: '0', label: 'Novo Item' }] });
 };

 const removeNumberItem = (index: number) => {
 const newNumbers = (localData.numbers || []).filter((_, i) => i !== index);
 setLocalData({ ...localData, numbers: newNumbers });
 };

 const updateClient = (index: number, field: 'logoUrl' | 'name', value: string) => {
 const newClients = [...(localData.clients || [])];
 newClients[index] = { ...newClients[index], [field]: value };
 setLocalData({ ...localData, clients: newClients });
 };

 const addClientItem = () => {
 setLocalData({ ...localData, clients: [...(localData.clients || []), { logoUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80', name: 'Novo Cliente' }] });
 };

 const removeClientItem = (index: number) => {
 const newClients = (localData.clients || []).filter((_, i) => i !== index);
 setLocalData({ ...localData, clients: newClients });
 };

 const updateContact = (index: number, field: 'label' | 'value' | 'link' | 'icon', value: string) => {
 const newContact = [...((localData.contact as any)?.items || [])];
 newContact[index] = { ...newContact[index], [field]: value };
 setLocalData({ ...localData, contact: { ...localData.contact, items: newContact } });
 };

 const addContactItem = () => {
 setLocalData({ ...localData, contact: { ...localData.contact, items: [...((localData.contact as any)?.items || []), { id: Date.now().toString(), label: 'Novo', value: 'Valor', icon: 'Mail', link: '' }] } });
 };

 const removeContactItem = (index: number) => {
 const newContact = ((localData.contact as any)?.items || []).filter((_: any, i: number) => i !== index);
 setLocalData({ ...localData, contact: { ...localData.contact, items: newContact } });
 };

 const toggleSection = (section: keyof SectionConfig) => {
 setLocalData(prev => ({
 ...prev,
 sections: {
 ...prev.sections,
 [section]: { ...prev.sections[section], enabled: !prev.sections[section].enabled }
 }
 }));
 };

 const moveSection = (section: keyof SectionConfig, direction: 'up' | 'down') => {
 const sections = Object.entries(localData.sections || {}) as [keyof SectionConfig, any][];
 const index = sections.findIndex(([key]) => key === section);
 if (index === -1) return;

 const newIndex = direction === 'up' ? index - 1 : index + 1;
 if (newIndex < 0 || newIndex >= sections.length) return;

 const newSections = [...sections];
 [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
 
 const sectionsObj = Object.fromEntries(newSections) as SectionConfig;
 setLocalData({ ...localData, sections: sectionsObj });
 };

 const renderEstrutura = () => (
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Estrutura do Site
 </h2>
 <div className="space-y-4">
 {Object.entries(localData.sections || {}).map(([key, config], idx, arr) => (
 <div key={key} className="space-y-2">
 <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 hover:border-emerald-500/20 transition-all group">
 <div className="flex items-center gap-4">
 <div 
 className={cn(
 "w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer",
 config.enabled ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"
 )}
 onClick={() => toggleSection(key as keyof SectionConfig)}
 >
 {config.enabled && <LucideIcons.Check size={12} className="text-black" />}
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-white">{key}</span>
 </div>
 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
 <button 
 onClick={() => moveSection(key as keyof SectionConfig, 'up')}
 disabled={idx === 0}
 className="p-1.5 text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"
 >
 <ArrowUp size={14} />
 </button>
 <button 
 onClick={() => moveSection(key as keyof SectionConfig, 'down')}
 disabled={idx === arr.length - 1}
 className="p-1.5 text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"
 >
 <ArrowDown size={14} />
 </button>
 </div>
 </div>
 
 <div className="px-2">
 <button 
 onClick={() => setExpandedBackgrounds(prev => ({ ...prev, [key]: !prev[key] }))}
 className="w-full flex items-center justify-between p-3 bg-zinc-900/30 rounded-xl border border-zinc-800/30 hover:bg-zinc-800/50 transition-all group"
 >
 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-400">Background da Seção</span>
 {expandedBackgrounds[key] ? <ChevronUp size={12} className="text-zinc-600" /> : <ChevronDown size={12} className="text-zinc-600" />}
 </button>
 
 {expandedBackgrounds[key] && (
 <div className="mt-2 p-4 bg-zinc-900/20 rounded-xl border border-zinc-800/30 space-y-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Tipo de Fundo</label>
 <div className="grid grid-cols-2 gap-2">
 {(['color', 'image'] as const).map((type) => (
 <button
 key={type}
 onClick={() => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundType: type }
 }
 })}
 className={cn(
 "py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
 config.backgroundType === type ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-zinc-400 bg-zinc-800/30'
 )}
 >
 {type === 'color' ? 'Cor' : 'Imagem'}
 </button>
 ))}
 </div>
 </div>

 {config.backgroundType === 'color' ? (
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Cor do Fundo</label>
 <div className="flex items-center gap-3 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/50">
 <DebouncedColorInput 
 value={config.backgroundColor || '#000000'} 
 onChange={(val) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundColor: val }
 }
 })}
 className="w-8 h-8 rounded-md bg-transparent border-0 cursor-pointer"
 />
 <input 
 type="text" 
 value={config.backgroundColor || '#000000'} 
 onChange={(e) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundColor: e.target.value }
 }
 })}
 className="bg-transparent text-[10px] font-mono text-zinc-400 outline-none w-20"
 />
 </div>
 </div>
 ) : (
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Imagem de Fundo</label>
 <div className="space-y-3">
 <input 
 type="text" 
 value={config.backgroundImage || ''} 
 onChange={(e) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundImage: e.target.value }
 }
 })}
 placeholder="URL da imagem"
 className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-lg p-3 text-[10px] text-zinc-400 outline-none"
 />
 <UploadButton 
 label="Upload Imagem" 
 className="w-full !min-h-[36px]"
 onUpload={(url) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundImage: url }
 }
 })} 
 />
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[7px] font-black uppercase text-zinc-600 mb-1">Opacidade</label>
 <input 
 type="range" 
 min="0" 
 max="1" 
 step="0.1"
 value={config.backgroundOpacity ?? 1} 
 onChange={(e) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundOpacity: parseFloat(e.target.value) }
 }
 })}
 className="w-full accent-emerald-500"
 />
 </div>
 <div>
 <label className="block text-[7px] font-black uppercase text-zinc-600 mb-1">Blur</label>
 <input 
 type="range" 
 min="0" 
 max="20" 
 step="1"
 value={config.backgroundBlur ?? 0} 
 onChange={(e) => setLocalData({
 ...localData,
 sections: {
 ...localData.sections,
 [key]: { ...localData.sections[key as keyof SectionConfig], backgroundBlur: parseInt(e.target.value) }
 }
 })}
 className="w-full accent-emerald-500"
 />
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );

 return (
 <>
 <div className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-hidden font-sans text-white">
 {/* Header */}
 <div className="h-20 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-md bg-zinc-900/80 sticky top-0 z-50">
 <div className="flex items-center gap-6">
 <div className="bg-emerald-500 p-2 rounded-lg">
 <div className="w-5 h-5 flex items-center justify-center font-black text-black text-xs">WF</div>
 </div>
 <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dev Mode CMS</h1>
 </div>

 <div className="flex items-center gap-8">
 <div className="flex bg-zinc-950/50 p-1 rounded-xl border border-zinc-800">
 <button 
 onClick={() => setViewMode('desktop')}
 className={cn(
 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
 viewMode === 'desktop' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
 )}
 >
 <Monitor size={14} />
 Desktop
 </button>
 <button 
 onClick={() => setViewMode('mobile')}
 className={cn(
 "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
 viewMode === 'mobile' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
 )}
 >
 <Smartphone size={14} />
 Mobile
 </button>
 </div>

 <div className="flex items-center gap-4 border-l border-zinc-800 pl-8">
 <button 
 onClick={onClose}
 className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
 >
 <LogOut size={14} />
 Sair
 </button>
 <button 
 onClick={handleSave}
 disabled={isSaving}
 className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
 >
 {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
 Publicar Alterações
 </button>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-1 overflow-y-auto hidden-scrollbar bg-zinc-950">
 <div className="p-8 md:p-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Left Column (Mobile Preview) */}
 <div className={cn("lg:col-span-4 space-y-8 relative hidden lg:block", viewMode !== 'mobile' && '!hidden')}>
 <div className="sticky top-24 flex justify-center">
 {/* Phone Frame */}
 <div className="w-[391px] h-[716px] bg-black rounded-[3rem] border-[8px] border-zinc-800 relative overflow-hidden shadow-2xl ring-1 ring-white/10">
 {/* Notch */}
 <div className="absolute top-0 inset-x-0 h-6 bg-zinc-800 rounded-b-3xl w-40 mx-auto z-50"></div>
 <iframe 
 ref={iframeRef}
 src="./?preview=true&device=mobile"
 className="absolute inset-0 w-full h-full border-0 bg-black"
 onLoad={() => {
 if (iframeRef.current?.contentWindow) {
 iframeRef.current.contentWindow.postMessage({ type: 'DEV_MODE_PREVIEW_UPDATE', data: localData }, '*');
 }
 }}
 />
 </div>
 </div>
 </div>

 {/* Left Column (Desktop Estrutura) */}
 <div className={cn("lg:col-span-4 space-y-8", viewMode !== 'desktop' && 'hidden lg:hidden')}>
 {renderEstrutura()}
 </div>

 {/* Right Column: Editing Options */}
 <div className={cn("space-y-8", viewMode === 'mobile' ? "lg:col-span-8" : "lg:col-span-8 lg:col-start-5")}>
 {viewMode === 'mobile' && renderEstrutura()}

 {/* Edição de Conteúdo - Hero */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Seção Hero
 </h2>
 <div className="grid grid-cols-1 gap-8">
 <div className="relative">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título Principal</label>
 <RichTextarea 
 value={localData?.hero?.title} 
 onChange={val => setLocalData({ ...localData, hero: { ...localData.hero, title: val } })}
 onSelect={handleTextSelect}
 data={localData}
 context="hero.title"
 minHeight="120px"
 className="bg-zinc-950/50 font-black uppercase tracking-tighter text-2xl"
 previewScale={viewMode === 'mobile' ? 0.43 : 0.11}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div className="relative">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Subtítulo / Descrição</label>
 <RichTextarea 
 value={localData?.hero?.subtitle} 
 onChange={val => setLocalData({ ...localData, hero: { ...localData.hero, subtitle: val } })}
 onSelect={handleTextSelect}
 data={localData}
 context="hero.subtitle"
 minHeight="100px"
 className="bg-zinc-950/50 text-lg"
 previewScale={viewMode === 'mobile' ? 2.25 : 0.75}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">URL do Vídeo de Fundo</label>
 <div className="flex gap-3">
 <input 
 type="text" 
 value={localData?.hero?.videoUrl || ''} 
 onChange={e => setLocalData({ ...localData, hero: { ...localData.hero, videoUrl: e.target.value } })}
 className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-zinc-400 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
 />
 <UploadButton 
 label="Upload Vídeo" 
 accept="video/*"
 onUpload={(url) => setLocalData({ ...localData, hero: { ...localData.hero, videoUrl: url } })} 
 />
 </div>
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Tamanho da Logo (Ex: 200px)</label>
 <input 
 type="text" 
 value={(() => {
 const val = localData?.hero?.logoSize || '';
 if (/^\d+$/.test(val)) return val + 'px';
 return val;
 })()} 
 onChange={e => {
 let val = e.target.value;
 if (val.endsWith('px') && /^\d+px$/.test(val)) {
 val = val.replace('px', '');
 }
 setLocalData({ ...localData, hero: { ...localData.hero, logoSize: val } });
 }}
 placeholder="Ex: 200px"
 className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none"
 />
 </div>
 </div>
 </div>

 {/* Edição de Conteúdo - Nossos Trabalhos */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Portfólio
 </h2>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título da Seção</label>
 <RichTextarea 
 value={localData.worksTitle || "Nossos Trabalhos"} 
 onChange={val => setLocalData({ ...localData, worksTitle: val })}
 onSelect={handleTextSelect}
 data={localData}
 context="works.title"
 minHeight="80px"
 className="bg-zinc-950/50 font-black uppercase tracking-tight text-xl"
 previewScale={viewMode === 'mobile' ? 0.42 : 0.15}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Alinhamento do Título</label>
 <div className="grid grid-cols-3 gap-2 bg-zinc-800/30 p-1 rounded-xl border border-zinc-700/30">
 {(['left', 'center', 'right'] as const).map((align) => (
 <button
 key={align}
 onClick={() => setLocalData({ ...localData, sectionStyles: { ...localData.sectionStyles, works: { ...localData.sectionStyles?.works, titleAlign: align } } })}
 className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localData.sectionStyles?.works?.titleAlign === align ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
 >
 {align === 'left' ? 'Esq' : align === 'center' ? 'Meio' : 'Dir'}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {(localData.portfolio || []).map((item, index) => (
 <div key={item.id} className="group bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/50 relative hover:border-emerald-500/20 transition-all">
 <button onClick={() => removePortfolioItem(index)} className="absolute top-6 right-6 text-zinc-600 hover:text-red-500 transition-colors">
 <Trash2 size={18} />
 </button>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-10">
 <div className="flex flex-col">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Título do Projeto</label>
 <RichTextarea 
 value={item.title} 
 onChange={val => updatePortfolio(index, 'title', val)}
 onSelect={handleTextSelect}
 data={localData}
 context={`portfolio.${index}.title`}
 minHeight="60px"
 className="bg-zinc-900/50 font-bold uppercase tracking-tight text-base"
 previewScale={viewMode === 'mobile' ? 0.67 : 0.44}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div className="flex flex-col">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Categoria</label>
 <input 
 type="text" 
 value={item.category} 
 onChange={e => updatePortfolio(index, 'category', e.target.value)}
 className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-sm focus:border-emerald-500/50 outline-none"
 />
 </div>
 <div className="flex flex-col">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">URL da Thumbnail (Imagem)</label>
 <div className="flex gap-2">
 <input 
 type="text" 
 value={item.thumbnailUrl} 
 onChange={e => updatePortfolio(index, 'thumbnailUrl', e.target.value)}
 className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-[10px] focus:border-emerald-500/50 outline-none"
 />
 <UploadButton 
 label="Upload" 
 className="!min-h-[40px] !px-4"
 onUpload={(url) => updatePortfolio(index, 'thumbnailUrl', url)} 
 />
 </div>
 </div>
 <div className="flex flex-col">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">URL do Vídeo (Vimeo/Direct)</label>
 <div className="flex gap-2">
 <input 
 type="text" 
 value={item.videoUrl} 
 onChange={e => updatePortfolio(index, 'videoUrl', e.target.value)}
 className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-[10px] focus:border-emerald-500/50 outline-none"
 />
 <UploadButton 
 label="Upload" 
 accept="video/*"
 className="!min-h-[40px] !px-4"
 onUpload={(url) => updatePortfolio(index, 'videoUrl', url)} 
 />
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 <button 
 onClick={addPortfolioItem}
 className="w-full mt-8 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
 >
 <Plus size={14} />
 Adicionar Trabalho
 </button>
 </div>

 {/* Edição de Conteúdo - Sobre */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Sobre / Visão
 </h2>
 <div className="grid grid-cols-1 gap-8">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título da Seção</label>
 <RichTextarea 
 value={localData?.about?.title} 
 onChange={val => setLocalData({ ...localData, about: { ...localData.about, title: val } })}
 onSelect={handleTextSelect}
 data={localData}
 context="about.title"
 minHeight="80px"
 className="bg-zinc-950/50 font-black uppercase tracking-tight text-xl"
 previewScale={viewMode === 'mobile' ? 0.42 : 0.15}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Texto Principal</label>
 <RichTextarea 
 value={localData?.about?.text} 
 onChange={val => setLocalData({ ...localData, about: { ...localData.about, text: val } })}
 onSelect={handleTextSelect}
 data={localData}
 context="about.text"
 minHeight="150px"
 className="bg-zinc-950/50 text-base"
 previewScale={viewMode === 'mobile' ? 1.5 : 0.6}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">URL da Imagem</label>
 <div className="flex gap-3">
 <input 
 type="text" 
 value={localData?.about?.imageUrl || ''} 
 onChange={e => setLocalData({ ...localData, about: { ...localData.about, imageUrl: e.target.value } })}
 className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-zinc-400 text-sm focus:border-emerald-500/50 outline-none"
 />
 <UploadButton 
 label="Upload Imagem" 
 onUpload={(url) => setLocalData({ ...localData, about: { ...localData.about, imageUrl: url } })} 
 />
 </div>
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Largura da Imagem (px)</label>
 <input 
 type="number" 
 value={localData?.about?.imageWidth || 600} 
 onChange={e => setLocalData({ ...localData, about: { ...localData.about, imageWidth: parseInt(e.target.value) } })}
 className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-emerald-500/50 outline-none"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Altura da Imagem (px)</label>
 <input 
 type="number" 
 value={localData?.about?.imageHeight || 800} 
 onChange={e => setLocalData({ ...localData, about: { ...localData.about, imageHeight: parseInt(e.target.value) } })}
 className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:border-emerald-500/50 outline-none"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Edição de Conteúdo - Expertise */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Expertise
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título da Seção</label>
 <RichTextarea 
 value={localData.expertiseTitle || "Expertise"} 
 onChange={val => setLocalData({ ...localData, expertiseTitle: val })}
 onSelect={handleTextSelect}
 data={localData}
 context="expertise.title"
 minHeight="80px"
 className="bg-zinc-950/50 font-black uppercase tracking-tight text-xl"
 previewScale={viewMode === 'mobile' ? 0.42 : 0.15}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Alinhamento do Título</label>
 <div className="grid grid-cols-3 gap-2 bg-zinc-800/30 p-1 rounded-xl border border-zinc-700/30">
 {(['left', 'center', 'right'] as const).map((align) => (
 <button
 key={align}
 onClick={() => setLocalData({ ...localData, sectionStyles: { ...localData.sectionStyles, expertise: { ...localData.sectionStyles?.expertise, titleAlign: align } } })}
 className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localData.sectionStyles?.expertise?.titleAlign === align ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
 >
 {align === 'left' ? 'Esq' : align === 'center' ? 'Meio' : 'Dir'}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {(localData.expertise || []).map((item, index) => (
 <div key={item.id} className="group bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/50 relative hover:border-emerald-500/20 transition-all">
 <button onClick={() => removeExpertiseItem(index)} className="absolute top-6 right-6 text-zinc-600 hover:text-red-500 transition-colors">
 <Trash2 size={18} />
 </button>
 <div className="space-y-4 pr-10">
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Título da Expertise</label>
 <RichTextarea 
 value={item.title} 
 onChange={val => updateExpertise(index, 'title', val)}
 onSelect={handleTextSelect}
 data={localData}
 context={`expertise.${index}.title`}
 minHeight="60px"
 className="bg-zinc-900/50 font-bold uppercase tracking-tight text-base"
 previewScale={viewMode === 'mobile' ? 0.67 : 0.44}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Descrição</label>
 <RichTextarea 
 value={item.description} 
 onChange={val => updateExpertise(index, 'description', val)}
 onSelect={handleTextSelect}
 data={localData}
 context={`expertise.${index}.description`}
 minHeight="80px"
 className="bg-zinc-900/50 text-sm"
 previewScale={viewMode === 'mobile' ? 1.25 : 0.85}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 </div>
 </div>
 ))}
 </div>

 <button 
 onClick={addExpertiseItem}
 className="w-full mt-8 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
 >
 <Plus size={14} />
 Adicionar Expertise
 </button>
 </div>

 {/* Edição de Conteúdo - Números */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Números
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título da Seção</label>
 <RichTextarea 
 value={localData.numbersTitle || "Nossos Números"} 
 onChange={val => setLocalData({ ...localData, numbersTitle: val })}
 onSelect={handleTextSelect}
 data={localData}
 context="numbers.title"
 minHeight="80px"
 className="bg-zinc-950/50 font-black uppercase tracking-tight text-xl"
 previewScale={viewMode === 'mobile' ? 0.42 : 0.15}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Alinhamento do Título</label>
 <div className="grid grid-cols-3 gap-2 bg-zinc-800/30 p-1 rounded-xl border border-zinc-700/30">
 {(['left', 'center', 'right'] as const).map((align) => (
 <button
 key={align}
 onClick={() => setLocalData({ ...localData, sectionStyles: { ...localData.sectionStyles, numbers: { ...localData.sectionStyles?.numbers, titleAlign: align } } })}
 className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localData.sectionStyles?.numbers?.titleAlign === align ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
 >
 {align === 'left' ? 'Esq' : align === 'center' ? 'Meio' : 'Dir'}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {(localData.numbers || []).map((item, index) => (
 <div key={index} className="bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/50 relative group">
 <button onClick={() => removeNumberItem(index)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
 <Trash2 size={14} />
 </button>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Valor Numérico</label>
 <input 
 type="text" 
 value={item.value} 
 onChange={e => updateNumber(index, 'value', e.target.value)}
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-white text-base font-black outline-none"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Rótulo / Label</label>
 <input 
 type="text" 
 value={item.label} 
 onChange={e => updateNumber(index, 'label', e.target.value)}
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-[10px] font-black uppercase tracking-widest outline-none"
 />
 </div>
 </div>
 </div>
 ))}
 </div>

 <button 
 onClick={addNumberItem}
 className="w-full mt-8 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
 >
 <Plus size={14} />
 Adicionar Número
 </button>
 </div>

 {/* Edição de Conteúdo - Clientes */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Clientes
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {(localData.clients || []).map((client, index) => (
 <div key={index} className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-800/50 relative group">
 <button onClick={() => removeClientItem(index)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
 <Trash2 size={14} />
 </button>
 <div className="space-y-3">
 <div className="h-20 bg-zinc-900 rounded-lg flex items-center justify-center p-4">
 <img src={client.logoUrl} alt={client.name} className="max-h-full max-w-full object-contain opacity-50" />
 </div>
 <input 
 type="text" 
 value={client.logoUrl} 
 onChange={e => updateClient(index, 'logoUrl', e.target.value)}
 placeholder="URL da imagem"
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-[8px] text-zinc-500 outline-none"
 />
 <input 
 type="text" 
 value={client.name || ''} 
 onChange={e => updateClient(index, 'name', e.target.value)}
 placeholder="Nome do Cliente (Opcional)"
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-[8px] text-white outline-none"
 />
 <UploadButton 
 label="Logo" 
 className="w-full !min-h-[32px] !px-2 !text-[8px]"
 onUpload={(url) => updateClient(index, 'logoUrl', url)} 
 />
 </div>
 </div>
 ))}
 </div>
 <button 
 onClick={addClientItem}
 className="w-full mt-8 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
 >
 <Plus size={14} />
 Adicionar Cliente
 </button>
 </div>

 {/* Edição de Conteúdo - Contato */}
 <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
 Contato
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
 <div className="md:col-span-2">
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Título da Seção</label>
 <RichTextarea 
 value={localData.contactTitle || "Let's Create"} 
 onChange={val => setLocalData({ ...localData, contactTitle: val })}
 onSelect={handleTextSelect}
 data={localData}
 context="contact.title"
 minHeight="80px"
 className="bg-zinc-950/50 font-black uppercase tracking-tight text-xl"
 previewScale={viewMode === 'mobile' ? 0.42 : 0.15}
 targetWidth={viewMode === 'mobile' ? 375 : 1920}
 />
 </div>
 <div>
 <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Alinhamento do Título</label>
 <div className="grid grid-cols-3 gap-2 bg-zinc-800/30 p-1 rounded-xl border border-zinc-700/30">
 {(['left', 'center', 'right'] as const).map((align) => (
 <button
 key={align}
 onClick={() => setLocalData({ ...localData, sectionStyles: { ...localData.sectionStyles, contact: { ...localData.sectionStyles?.contact, titleAlign: align } } })}
 className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${localData.sectionStyles?.contact?.titleAlign === align ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-white'}`}
 >
 {align === 'left' ? 'Esq' : align === 'center' ? 'Meio' : 'Dir'}
 </button>
 ))}
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {(Array.isArray((localData.contact as any)?.items) ? (localData.contact as any).items : []).map((item: any, index: number) => (
 <div key={index} className="bg-zinc-950/30 p-6 rounded-2xl border border-zinc-800/50 relative group">
 <button onClick={() => removeContactItem(index)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
 <Trash2 size={14} />
 </button>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Rótulo</label>
 <input 
 type="text" 
 value={item.label} 
 onChange={e => updateContact(index, 'label', e.target.value)}
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-white text-[10px] font-bold outline-none"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Valor</label>
 <input 
 type="text" 
 value={item.value} 
 onChange={e => updateContact(index, 'value', e.target.value)}
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-400 text-[10px] outline-none"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Link</label>
 <input 
 type="text" 
 value={item.link || ''} 
 onChange={e => updateContact(index, 'link', e.target.value)}
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-zinc-500 text-[10px] outline-none"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Ícone</label>
 <div className="grid grid-cols-5 gap-1">
 {['Mail', 'Instagram', 'MapPin', 'Phone', 'Globe', 'Youtube', 'Linkedin', 'Twitter', 'Facebook', 'MessageSquare', 'Send'].map((icon) => (
 <button
 key={icon}
 onClick={() => updateContact(index, 'icon', icon)}
 className={cn(
 "p-1.5 rounded-lg flex items-center justify-center transition-all",
 item.icon === icon ? 'bg-emerald-500 text-black' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'
 )}
 title={icon}
 >
 <DynamicIcon name={icon} size={12} />
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 <button 
 onClick={addContactItem}
 className="w-full mt-8 py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
 >
 <Plus size={14} />
 Adicionar Item
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Floating Style Menu */}
 <AnimatePresence>
 {floatingMenu.visible && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.95 }}
 className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-2xl p-4 shadow-2xl flex items-center gap-6"
 >
 <div className="flex items-center gap-2 border-r border-zinc-800 pr-6">
 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Palavras:</span>
 <div className="flex flex-wrap gap-1 max-w-[200px]">
 {floatingMenu.words.map((w, i) => (
 <span key={i} className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">{w}</span>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-4">
 <button
 onClick={() => floatingMenu.words.forEach(w => toggleWordOutline(w))}
 className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-all group"
 >
 <div className={cn(
 "w-4 h-4 rounded border flex items-center justify-center transition-all",
 floatingMenu.words.every(w => localData?.outlinedWords?.includes(w)) ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 group-hover:border-zinc-400"
 )}>
 {floatingMenu.words.every(w => localData?.outlinedWords?.includes(w)) && <LucideIcons.Check size={10} className="text-black" />}
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Outline</span>
 </button>

 <div className="h-8 w-[1px] bg-zinc-800 mx-2" />

 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fonte:</span>
 <CustomDropdown 
 options={GOOGLE_FONTS.map(f => ({ label: f.name, value: f.name }))}
 value={floatingMenu.words.length === 1 ? localData?.wordStyles?.[floatingMenu.context ? `${floatingMenu.context}:${floatingMenu.words[0]}` : floatingMenu.words[0]]?.fontFamily || '' : ''}
 onChange={(val) => floatingMenu.words.forEach(w => updateWordStyle(w, { fontFamily: val }, floatingMenu.context))}
 placeholder="Padrão"
 className="w-32"
 />
 </div>

 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Tamanho:</span>
 <input 
 type="text" 
 value={floatingMenu.words.length === 1 ? localData?.wordStyles?.[floatingMenu.context ? `${floatingMenu.context}:${floatingMenu.words[0]}` : floatingMenu.words[0]]?.fontSize || '' : ''}
 onChange={(e) => floatingMenu.words.forEach(w => updateWordStyle(w, { fontSize: e.target.value }, floatingMenu.context))}
 placeholder="Auto"
 className="w-16 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-emerald-500/50"
 />
 </div>

 <div className="flex items-center gap-3">
 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Cor:</span>
 <div className="flex items-center gap-2 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50">
 <DebouncedColorInput 
 value={floatingMenu.words.length === 1 ? localData?.wordStyles?.[floatingMenu.context ? `${floatingMenu.context}:${floatingMenu.words[0]}` : floatingMenu.words[0]]?.color || '#ffffff' : '#ffffff'}
 onChange={(val) => floatingMenu.words.forEach(w => updateWordStyle(w, { color: val }, floatingMenu.context))}
 className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer"
 />
 </div>
 </div>
 </div>

 <button 
 onClick={() => setFloatingMenu({ visible: false, words: [] })}
 className="ml-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
 >
 <X size={16} />
 </button>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Floating Style Editor for Single Word Selection */}
 <AnimatePresence>
 {selectedText && !floatingMenu.visible && (
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 className="fixed right-8 bottom-8 z-[10000] w-72 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-6 shadow-2xl space-y-6"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
 <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[150px]">
 {selectedText.word}
 </span>
 </div>
 <button onClick={() => setSelectedText(null)} className="text-zinc-600 hover:text-white transition-colors">
 <X size={16} />
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Estilo</label>
 <button
 onClick={() => toggleWordOutline(selectedText.word)}
 className={cn(
 "w-full flex items-center justify-between p-3 rounded-xl border transition-all group",
 localData?.outlinedWords?.includes(selectedText.word) ? "bg-emerald-500 border-emerald-500 text-black" : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-500"
 )}
 >
 <span className="text-[10px] font-black uppercase tracking-widest">Efeito Outline</span>
 {localData?.outlinedWords?.includes(selectedText.word) ? <LucideIcons.Check size={14} /> : <div className="w-3.5 h-3.5 rounded border border-zinc-600 group-hover:border-zinc-500" />}
 </button>
 </div>

 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Família da Fonte</label>
 <CustomDropdown 
 options={GOOGLE_FONTS.map(f => ({ label: f.name, value: f.name }))}
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.fontFamily || ''}
 onChange={(val) => updateWordStyle(selectedText.word, { fontFamily: val }, selectedText.context)}
 placeholder="Fonte Padrão"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tamanho</label>
 <input 
 type="text" 
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.fontSize || ''}
 onChange={(e) => updateWordStyle(selectedText.word, { fontSize: e.target.value }, selectedText.context)}
 placeholder="Auto"
 className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-emerald-500/50"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Peso</label>
 <CustomDropdown 
 options={[
 { label: 'Light', value: 'font-light' },
 { label: 'Normal', value: 'font-normal' },
 { label: 'Medium', value: 'font-medium' },
 { label: 'Bold', value: 'font-bold' },
 { label: 'Black', value: 'font-black' }
 ]}
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.fontWeight || ''}
 onChange={(val) => updateWordStyle(selectedText.word, { fontWeight: val }, selectedText.context)}
 placeholder="Peso"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Espaçamento</label>
 <input 
 type="text" 
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.letterSpacing || ''}
 onChange={(e) => updateWordStyle(selectedText.word, { letterSpacing: e.target.value }, selectedText.context)}
 placeholder="0"
 className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-emerald-500/50"
 />
 </div>
 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Altura Linha</label>
 <input 
 type="text" 
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.lineHeight || ''}
 onChange={(e) => updateWordStyle(selectedText.word, { lineHeight: e.target.value }, selectedText.context)}
 placeholder="1.2"
 className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white outline-none focus:border-emerald-500/50"
 />
 </div>
 </div>

 <div>
 <label className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Cor da Palavra</label>
 <div className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50">
 <DebouncedColorInput 
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.color || '#ffffff'} 
 onChange={(val) => updateWordStyle(selectedText.word, { color: val }, selectedText.context)}
 className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
 />
 <input 
 type="text" 
 value={localData?.wordStyles?.[selectedText.context ? `${selectedText.context}:${selectedText.word}` : selectedText.word]?.color || '#ffffff'} 
 onChange={(e) => updateWordStyle(selectedText.word, { color: e.target.value }, selectedText.context)}
 className="bg-transparent text-[10px] font-mono text-zinc-500 outline-none w-20"
 />
 </div>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Mobile Dev Toggle */}
 <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
 <button 
 onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
 className="bg-emerald-500 text-black p-4 rounded-full shadow-2xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
 >
 {viewMode === 'desktop' ? <Smartphone size={18} /> : <Monitor size={18} />}
 Alternar Visualização
 </button>
 </div>

 {/* Desktop Preview Button */}
 {viewMode === 'desktop' && (
 <button 
 onClick={() => setShowDesktopPreview(true)}
 className="fixed bottom-8 right-8 z-50 bg-emerald-500 text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
 title="Preview Desktop"
 >
 <Eye size={24} />
 </button>
 )}
 </div>

 {/* Desktop Preview Modal */}
 <div 
 className={cn(
 "fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6",
 !showDesktopPreview && "hidden"
 )}
 >
 <div 
 className="w-full bg-zinc-950 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-zinc-800 ring-1 ring-white/10"
 style={{ maxWidth: 'calc((100vh - 3rem - 48px) * 16 / 9)' }}
 >
 <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
 <div className="flex items-center gap-3">
 <Monitor size={14} className="text-emerald-500" />
 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Preview Desktop</span>
 </div>
 <button 
 onClick={() => setShowDesktopPreview(false)}
 className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
 >
 <X size={16} />
 </button>
 </div>
 <div ref={desktopPreviewContainerRef} className="w-full bg-black relative overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
 <div 
 style={{
 width: 1920,
 height: 1080,
 transform: `scale(${desktopPreviewScale})`,
 transformOrigin: 'center',
 position: 'absolute'
 }}
 className="bg-white flex-shrink-0"
 >
 <iframe 
 ref={desktopIframeRef}
 src="./?preview=true&device=desktop"
 className="w-full h-full border-0"
 onLoad={(e) => {
 if (e.currentTarget.contentWindow) {
 e.currentTarget.contentWindow.postMessage({ type: 'DEV_MODE_PREVIEW_UPDATE', data: localData }, '*');
 }
 }}
 />
 </div>
 </div>
 </div>
 </div>
 </>
 );
};

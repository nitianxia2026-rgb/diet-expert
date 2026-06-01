'use client';

import { useState } from 'react';
import { Loader2, Leaf, Egg, Wheat, AlertTriangle, CheckCircle2, Apple, WifiOff, RefreshCw, MessageCircleWarning } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AIResult {
  protein: string;
  warning: string;
}

interface NutritionResult {
  protein: number;
  calories: number;
  carbs: number;
}

function calculateNutrition(chicken: number, rice: number, eggs: number): NutritionResult {
  const protein = Math.round(chicken * 0.31 + rice * 0.027 + eggs * 6.3);
  const calories = Math.round(chicken * 1.65 + rice * 1.30 + eggs * 72);
  const carbs = Math.round(rice * 0.28 + eggs * 0.6);
  return { protein, calories, carbs };
}

function SliderRow({
  icon,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${color}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-stone-600">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            className="w-16 text-right text-sm font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#7a9ab0] focus:ring-1 focus:ring-[#7a9ab0]/30 transition-all"
          />
          <span className="text-xs text-stone-400 w-5">{unit}</span>
        </div>
      </div>
      <div className="px-1">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onChange(v)}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-stone-300">{min}{unit}</span>
          <span className="text-[10px] text-stone-300">{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [chicken, setChicken] = useState(150);
  const [rice, setRice] = useState(100);
  const [eggs, setEggs] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [shown, setShown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEvaluate() {
    setLoading(true);
    setResult(null);
    setShown(false);
    setError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chicken, rice, eggs }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || '网络波动，请重试';
        throw new Error(errorMessage);
      }

      const data: AIResult = await response.json();

      if (!data.protein || !data.warning) {
        throw new Error('返回数据格式错误，请重试');
      }

      setResult(data);
      setShown(true);
    } catch (err) {
      console.error('Evaluation failed:', err);
      const errorMessage = err instanceof Error ? err.message : '网络波动，请重试';
      setError(errorMessage);
      setShown(true);
    } finally {
      setLoading(false);
    }
  }

  const nutrition = calculateNutrition(chicken, rice, eggs);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      {/* Header */}
      <div className="text-center mb-10 space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#c8dce8] flex items-center justify-center">
            <Leaf size={16} className="text-[#5c8097]" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-700">
          日常状态与维他命补给站
        </h1>
        <p className="text-sm text-stone-400 font-normal leading-relaxed">
          记录今日饮食，获取专属营养评估与补给建议
        </p>
      </div>

      {/* Main Card */}
      <div
        className="w-full max-w-md bg-white rounded-3xl p-7"
        style={{
          boxShadow:
            '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
        }}
      >
        {/* Section title */}
        <div className="flex items-center gap-2 mb-7">
          <div className="h-4 w-0.5 rounded-full bg-[#7a9ab0]" />
          <h2 className="text-sm font-semibold text-stone-500 tracking-wide uppercase">
            今日饮食记录
          </h2>
        </div>

        {/* Sliders */}
        <div className="space-y-7">
          <SliderRow
            icon={<span className="text-sm">🍗</span>}
            label="鸡胸肉"
            unit="克"
            value={chicken}
            min={0}
            max={400}
            step={5}
            onChange={setChicken}
            color="bg-amber-50"
          />
          <SliderRow
            icon={<Wheat size={14} className="text-[#a08060]" />}
            label="糙米"
            unit="克"
            value={rice}
            min={0}
            max={300}
            step={5}
            onChange={setRice}
            color="bg-amber-50/60"
          />
          <SliderRow
            icon={<Egg size={14} className="text-[#c4973a]" />}
            label="鸡蛋"
            unit="个"
            value={eggs}
            min={0}
            max={10}
            step={1}
            onChange={setEggs}
            color="bg-yellow-50"
          />
        </div>

        {/* Divider */}
        <div className="my-7 h-px bg-stone-100" />

        {/* CTA Button */}
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-70 active:scale-[0.98]"
          style={{
            backgroundColor: '#7a9ab0',
            boxShadow: '0 4px 16px rgba(122,154,176,0.30)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6589a0';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7a9ab0';
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              <span>正在评估中…</span>
            </>
          ) : (
            <>
              <Apple size={16} />
              <span>一键评估营养与补给</span>
            </>
          )}
        </button>

        {/* Error State */}
        {shown && error && !result && (
          <div className="mt-6 animate-fade-slide-in">
            <div
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: '#fef5f5',
                borderColor: '#fee0e0',
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <WifiOff size={20} className="text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-red-600">
                    评估失败
                  </p>
                  <p className="text-xs text-red-500">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleEvaluate}
                  disabled={loading}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                >
                  <RefreshCw size={12} />
                  重试
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Area - Dynamic AI Response */}
        {shown && result && (
          <div className="mt-6 space-y-3 animate-fade-slide-in">
            {/* Macro summary */}
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#f4f8fb' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={15} className="text-[#7a9ab0]" />
                <span className="text-xs font-semibold text-stone-500 tracking-wide uppercase">
                  营养摄入概览
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <MacroChip label="蛋白质" value={nutrition.protein + 'g'} sub="推荐 55–80g" accent="#7a9ab0" />
                <MacroChip label="热量" value={nutrition.calories + 'kcal'} sub="参考 1600–2200" accent="#a0b09a" />
                <MacroChip label="碳水" value={nutrition.carbs + 'g'} sub="推荐 130–250g" accent="#c4a882" />
              </div>
              <p className="mt-3 text-xs text-stone-500 leading-relaxed">
                AI 评估结果：{result.protein}
              </p>
            </div>

            {/* AI Warning - Dynamic from backend */}
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: '#fff9f0',
                borderColor: '#f0d9b8',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                  <MessageCircleWarning size={14} className="text-amber-500" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-amber-700">
                    极客营养师点评
                  </p>
                  <p className="text-xs text-amber-600 leading-relaxed overflow-visible">
                    {result.warning}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial / Loading State - Show waiting message */}
        {!shown && !error && (
          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl p-4 bg-stone-50 border border-stone-100 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-stone-200" />
                  <div className="flex-1">
                    <div className="h-3 bg-stone-200 rounded w-24 mb-2" />
                    <div className="h-2 bg-stone-100 rounded w-32" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-[11px] text-stone-300 text-center">
        数据仅供参考，不构成医疗建议 · 日常状态与维他命补给站
      </p>
    </main>
  );
}

function MacroChip({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 flex flex-col gap-0.5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <span className="text-[10px] text-stone-400">{label}</span>
      <span className="text-sm font-bold" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[9px] text-stone-300 leading-tight">{sub}</span>
    </div>
  );
}

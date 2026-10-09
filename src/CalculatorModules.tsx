import React, { useState, useEffect, useMemo, useId } from 'react';
import { 
  Wallet, Briefcase, Landmark, RefreshCw, Zap, Calculator, TrendingUp, Compass, 
  CircleDollarSign, ShieldAlert, DollarSign, ArrowRight, ChevronDown, ChevronUp, 
  Percent, CheckCircle2, Calendar
} from 'lucide-react';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  calculateLoan, 
  calculateAutoLoan, 
  calculateInterest, 
  calculatePayment, 
  calculateSalary, 
  calculateInterestRate, 
  calculateSalesTax, 
  calculateFinanceTVM, 
  calculateInflation, 
  calculateIncomeTax, 
  calculateFicaTax,
  calculateComprehensiveTax,
  calculateCompoundInterest,
  calculateMortgage,
  solveRegulationZ_Apr,
  US_TAX_CONFIG_BY_YEAR,
  US_STATE_TAX_CONFIGS,
  US_STATE_LIST,
  getStateConfig,
  type FilingStatus,
  MONTH_NAMES,
  FULL_MONTH_NAMES,
  parseStartDate,
  formatMonthYear,
  computePayoffMonthYear,
  normalizeMonthYearStr,
  addMonthsToDateStr
} from './engine';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 shadow-sm text-slate-900 dark:text-slate-100 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 transition-colors", className)}>
    {children}
  </div>
);

export const MetricCard = ({ label, value, subtext, icon: Icon, color }: any) => (
  <div 
    className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 p-4 sm:p-6 rounded-2xl shadow-sm space-y-2.5 sm:space-y-4 transition-colors"
    aria-live="polite"
    aria-atomic="true"
  >
    <div className="flex justify-between items-start gap-2 sm:gap-4">
      <div className={cn("p-2 sm:p-2.5 rounded-xl flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] shrink-0", color)} aria-hidden="true">
        <Icon size={18} className="text-white sm:w-5 sm:h-5" />
      </div>
      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-right leading-tight">{label}</span>
    </div>
    <div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{value}</h3>
      <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">{subtext}</p>
    </div>
  </div>
);

export const InputGroup = ({ label, value, onChange, min, step, prefix, suffix, type = "number", id: customId, placeholder }: any) => {
  const generatedId = useId();
  const inputId = customId || `input-${generatedId}`;
  const isNumber = type === "number";

  // Local text state to allow seamless backspacing, wiping out, and free typing without stuck 0s
  const [localText, setLocalText] = useState(value === 0 && !prefix ? '0' : (value !== undefined && value !== null ? String(value) : ''));

  useEffect(() => {
    // Only synchronize if the numeric value actually diverged
    const numInLocal = parseFloat(localText);
    if (value === '' || value === undefined || value === null) {
      if (localText !== '') setLocalText('');
    } else if (isNaN(numInLocal) || numInLocal !== value) {
      setLocalText(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalText(text);

    if (isNumber) {
      if (text.trim() === '') {
        onChange(0);
      } else {
        const parsed = Number(text);
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
      }
    } else {
      onChange(text);
    }
  };

  const handleBlur = () => {
    if (isNumber) {
      if (localText.trim() === '' || isNaN(Number(localText))) {
        setLocalText(String(value ?? 0));
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <div aria-hidden="true" className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold text-sm pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          aria-label={label}
          type={isNumber ? "text" : type}
          inputMode={isNumber ? (step && String(step).includes('.') ? "decimal" : "numeric") : undefined}
          value={localText}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-slate-900 dark:text-slate-100 font-bold text-base sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            prefix ? "pl-8 sm:pl-9 pr-3 sm:pr-4" : "px-3.5 sm:px-4",
            suffix && "pr-10 sm:pr-12"
          )}
        />
        {suffix && (
          <div aria-hidden="true" className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 font-bold text-xs pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
};

export interface StartDatePickerProps {
  value: string; // "YYYY-MM"
  onChange: (dateStr: string) => void;
  label?: string;
  termYears?: number;
  payoffDate?: string;
  firstPaymentDate?: string;
  id?: string;
}

export const StartDatePicker = ({
  value,
  onChange,
  label = "Start Date",
  termYears = 30,
  payoffDate,
  firstPaymentDate,
  id
}: StartDatePickerProps) => {
  const generatedId = useId();
  const inputId = id || `start-date-${generatedId}`;

  const parsed = useMemo(() => parseStartDate(value), [value]);
  const currentYear = parsed.year;
  const currentMonth = parsed.month;

  // Local state for free-form year text: allows user to freely backspace, delete, or clear to empty!
  const [yearText, setYearText] = useState(String(currentYear));

  // Sync yearText when external value changes (e.g., clicking presets)
  useEffect(() => {
    setYearText(String(currentYear));
  }, [currentYear]);

  const livePayoff = useMemo(() => {
    if (payoffDate) return payoffDate;
    return computePayoffMonthYear(value, (termYears || 30) * 12);
  }, [value, termYears, payoffDate]);

  const liveFirst = useMemo(() => {
    if (firstPaymentDate) return firstPaymentDate;
    return formatMonthYear(parsed.year, parsed.month);
  }, [firstPaymentDate, parsed]);

  const handleMonthSelect = (m: number) => {
    const yr = Number(yearText) >= 1900 && Number(yearText) <= 2150 ? Number(yearText) : currentYear;
    const nextVal = `${yr}-${String(m).padStart(2, '0')}`;
    onChange(nextVal);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits only up to 4 chars; can be completely empty if backspaced/deleted!
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 4);
    setYearText(digitsOnly);

    // If complete 4-digit year typed, immediately propagate change!
    if (digitsOnly.length === 4) {
      const num = Number(digitsOnly);
      if (num >= 1900 && num <= 2150) {
        const nextVal = `${num}-${String(currentMonth).padStart(2, '0')}`;
        onChange(nextVal);
      }
    }
  };

  const handleYearBlur = () => {
    const num = Number(yearText);
    if (!yearText || isNaN(num) || num < 1900 || num > 2150) {
      // If user blurred leaving it empty or invalid, restore to current valid year
      setYearText(String(currentYear));
    } else {
      const nextVal = `${num}-${String(currentMonth).padStart(2, '0')}`;
      onChange(nextVal);
    }
  };

  const setPresetOffset = (offsetMonths: number) => {
    const nextDate = addMonthsToDateStr(value, offsetMonths);
    onChange(nextDate);
  };

  return (
    <div className="space-y-3 bg-white/50 dark:bg-slate-900/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <label htmlFor={`${inputId}-month`} className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
            {label}
          </span>
        </label>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
          {liveFirst}
        </span>
      </div>

      {/* Calculator.net style: Month Dropdown + Clearable Year Text Box Side-by-Side (No Spinners) */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3">
        {/* Month Dropdown */}
        <div className="col-span-7">
          <label htmlFor={`${inputId}-month`} className="sr-only">Start Month</label>
          <select
            id={`${inputId}-month`}
            value={currentMonth}
            onChange={(e) => handleMonthSelect(Number(e.target.value))}
            className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 sm:px-3 py-2 text-base sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name} ({FULL_MONTH_NAMES[idx]})
              </option>
            ))}
          </select>
        </div>

        {/* Year Input: Pure text, no up/down spinner arrows, wipes out completely on backspace */}
        <div className="col-span-5">
          <label htmlFor={`${inputId}-year`} className="sr-only">Start Year</label>
          <input
            id={`${inputId}-year`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={yearText}
            onChange={handleYearChange}
            onBlur={handleYearBlur}
            placeholder="YYYY"
            className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 sm:px-3 py-2 text-base sm:text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Quick Month Preset Buttons */}
      <div className="space-y-1.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-600 dark:text-slate-400 px-0.5">
          <span className="font-bold">Presets:</span>
          <div className="grid grid-cols-4 sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="min-h-[36px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center"
            >
              This Mo
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                now.setMonth(now.getMonth() + 1);
                onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="min-h-[36px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center"
            >
              Next Mo
            </button>
            <button
              type="button"
              onClick={() => setPresetOffset(6)}
              className="min-h-[36px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center"
            >
              +6 Mo
            </button>
            <button
              type="button"
              onClick={() => setPresetOffset(12)}
              className="min-h-[36px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 flex items-center justify-center"
            >
              +1 Yr
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Date Audit Badge */}
      <div className="p-2.5 bg-blue-50/90 dark:bg-blue-950/60 rounded-xl border border-blue-200/80 dark:border-blue-800/80 text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
        <span>First: <strong className="font-mono text-slate-900 dark:text-white">{liveFirst}</strong></span>
        <span>Payoff: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{livePayoff}</strong></span>
      </div>
    </div>
  );
};

export const AdvancedToggle = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
  <button 
    type="button"
    onClick={onToggle}
    aria-expanded={isOpen}
    className="w-full min-h-[44px] flex items-center justify-between py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
  >
    <span className="flex items-center gap-2">
      <Percent size={16} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
      {isOpen ? 'Hide Advanced Options' : 'Show Advanced Options'}
    </span>
    {isOpen ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
  </button>
);

export const ExpandableSchedule = ({ data, columns }: { data: any[], columns: { key: string, label: string, format?: (v: any) => string }[] }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-4">
      <button 
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full min-h-[44px] flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <RefreshCw size={16} className={cn("transition-transform duration-500", expanded && "rotate-180")} aria-hidden="true" />
          Detailed Payment Schedule
        </span>
        {expanded ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>
      {expanded && (
        <div className="overflow-hidden space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden flex items-center gap-1 font-medium">
            <span>Swipe horizontally to view full schedule →</span>
          </div>
          <div className="overflow-x-auto touch-pan-x rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full text-left text-xs sm:text-sm font-medium">
              <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs font-bold sticky top-0">
                <tr>
                  {columns.map(col => <th key={col.key} className="px-3 sm:px-6 py-3 sm:py-4 text-xs whitespace-nowrap">{col.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-3 sm:px-6 py-2.5 sm:py-4 font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-nowrap">
                        {col.format ? col.format(row[col.key]) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 1. LOAN CALCULATOR MODULE
 * ========================================================================== */
export function LoanCalculatorModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    amount: 25000,
    rate: 8.5,
    termYears: 5,
    originationFee: 1.5,
    extraMonthly: 0
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const res = useMemo(() => calculateLoan({
    loanAmount: params.amount,
    annualRate: params.rate,
    termYears: params.termYears,
    originationFeePercent: params.originationFee,
    extraMonthly: params.extraMonthly
  }), [params]);

  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  const chartData = [
    { name: 'Principal', value: res.loanAmount, color: '#3b82f6' },
    { name: 'Total Interest', value: res.totalInterest, color: '#f43f5e' },
    ...(res.originationFee > 0 ? [{ name: 'Fees', value: res.originationFee, color: '#8b5cf6' }] : [])
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Wallet size={20} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" /> Loan Setup
            </h3>
            <InputGroup label="Loan Amount" value={params.amount} prefix={currency.symbol} onChange={(v: number) => setParams({...params, amount: v})} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Interest Rate" value={params.rate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, rate: v})} />
              <InputGroup label="Term" value={params.termYears} suffix="yrs" onChange={(v: number) => setParams({...params, termYears: v})} />
            </div>

            <AdvancedToggle isOpen={showAdvanced} onToggle={() => setShowAdvanced(!showAdvanced)} />
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <InputGroup label="Origination Fee" value={params.originationFee} suffix="%" step="0.25" onChange={(v: number) => setParams({...params, originationFee: v})} />
                <InputGroup label="Extra Monthly Pay" value={params.extraMonthly} prefix={currency.symbol} onChange={(v: number) => setParams({...params, extraMonthly: v})} />
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard label="Monthly Payment" value={format(res.monthlyPayment)} subtext="Standard P&I per month" icon={Wallet} color="bg-indigo-600" />
            <MetricCard label="Total Interest" value={format(res.totalInterest)} subtext="Total interest paid" icon={Landmark} color="bg-rose-600" />
            <MetricCard label="Total Paid" value={format(res.totalPayment)} subtext="Principal + Interest + Fees" icon={RefreshCw} color="bg-blue-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-6 lg:p-8 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Loan Cost Allocation</h4>
              <div className="h-64" aria-label="Loan Cost Allocation Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {chartData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                {chartData.map(d => (
                  <div key={d.name} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">{d.name}</div>
                    <div className="text-sm font-black" style={{ color: d.color }}>{format(d.value)}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 lg:p-8 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Balance Progression</h4>
              <div className="h-64" aria-label="Balance Progression Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={res.schedule.filter((_, i) => i % Math.max(1, Math.floor(res.schedule.length / 15)) === 0 || i === res.schedule.length - 1)}>
                    <defs>
                      <linearGradient id="loanColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                    <XAxis dataKey="month" tickFormatter={m => `M${m}`} fontSize={11} stroke="#64748b" />
                    <YAxis hide />
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} fill="url(#loanColor)" name="Remaining Balance" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE EDUCATIONAL GUIDE & CREDIT TIER BENCHMARKS */}
      <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Personal Loan Calculator: How to Estimate Monthly Payments, Interest Costs, and Origination Fees
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            <strong>Bottom Line Up Front (BLUF):</strong> Calculating the true cost of an unsecured personal loan requires evaluating three primary metrics: your monthly fixed payment, your total lifetime interest charges, and upfront origination fees. On a standard $25,000 personal loan at an 8.5% annual interest rate over a 5-year (60-month) term, your base monthly payment works out to $513. Accounting for a standard 1.5% upfront origination fee ($375), your total loan cost equals $31,150—comprising $25,000 in original principal, $5,775 in total interest paid, and $375 in fees. Making additional monthly principal payments reduces your outstanding balance faster, directly lowering lifetime interest expenses and shortening your repayment timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Understanding Total Personal Loan Costs</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Taking out a personal loan involves more than just repaying the principal amount borrowed. Lenders charge interest for the risk of extending credit, and many financial institutions assess upfront processing fees that reduce the net cash disbursed to your bank account.
            </p>
            <div className="space-y-1 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400">Total Personal Loan Cost Outlay</div>
              <div>├── Borrowed Principal: The initial cash sum requested from the lender</div>
              <div>├── Cumulative Interest: The fee charged over time for borrowing funds</div>
              <div>└── Upfront Origination Fee: Processing fee charged by the lender upon approval</div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Key Financial Metrics Explained</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong>Monthly Payment:</strong> The fixed installment paid every month throughout the loan duration. Each payment is split between covering accrued monthly interest and reducing the principal balance.</li>
              <li><strong>Total Interest Paid:</strong> The total dollar amount paid in borrowing costs across the entire loan term. Higher interest rates or longer repayment periods significantly increase this figure.</li>
              <li><strong>Origination Fee:</strong> An upfront fee charged by lenders to cover administrative costs, underwriting, and processing. Typically 1% to 8% of the loan amount.</li>
              <li><strong>Total Cost (Principal + Interest + Fees):</strong> The ultimate sum required to completely satisfy the loan obligation.</li>
            </ul>
          </GlassCard>
        </div>

        {/* How to Use the Calculator Inputs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">How to Use the Calculator Inputs</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The personal loan calculator allows you to test various borrowing scenarios by modifying core parameters and advanced cost options:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-base">1. Loan Setup Inputs</div>
              <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
                <li><strong>Loan Amount ($):</strong> Enter the total dollar sum you intend to borrow (e.g., $25,000).</li>
                <li><strong>Interest Rate (%):</strong> Input your estimated or quoted annual percentage rate (APR), such as 8.5%.</li>
                <li><strong>Term (Years):</strong> Select your target repayment window in years (e.g., 5 years / 60 months).</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-2 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-base">2. Advanced Options &amp; Fees</div>
              <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
                <li><strong>Origination Fee (%):</strong> Enter any upfront processing fee assessed by your lender (e.g., 1.5%).</li>
                <li><strong>Extra Monthly Pay ($):</strong> Input an additional monthly cash amount to pay down principal faster.</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Credit Tier Benchmark Table */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Benchmark Comparison: Personal Loan Rates and Terms by Credit Tier
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Personal loan interest rates in the U.S. depend heavily on your credit profile. Lenders evaluate credit scores to assign risk tiers, directly impacting the interest rate you are offered.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-left text-xs" aria-label="U.S. Personal Loan Interest Rate Benchmarks">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3">Credit Tier</th>
                  <th scope="col" className="px-4 py-3">Credit Score Range</th>
                  <th scope="col" className="px-4 py-3">Average APR Range</th>
                  <th scope="col" className="px-4 py-3">Estimated Monthly Payment</th>
                  <th scope="col" className="px-4 py-3">Total Interest Paid (5 Years)</th>
                  <th scope="col" className="px-4 py-3">Total Loan Outlay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {[
                  ['Excellent', '720 to 850', '6.50% – 10.00%', '$489 – $531', '$4,352 – $6,848', '$29,352 – $31,848'],
                  ['Good', '690 to 719', '10.50% – 15.00%', '$537 – $596', '$7,220 – $10,757', '$32,220 – $35,757'],
                  ['Fair', '630 to 689', '15.50% – 22.00%', '$602 – $688', '$11,148 – $16,299', '$36,148 – $41,299'],
                  ['Needs Work', '300 to 629', '22.50% – 32.00%', '$696 – $824', '$16,742 – $24,453', '$41,742 – $49,453']
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row[0]}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row[1]}</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold">{row[2]}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{row[3]}</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">{row[4]}</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
            Note: Benchmark figures assume zero origination fees. Actual rates vary based on lender underwriting criteria, income proof, and existing debt obligations.
          </div>
        </GlassCard>

        {/* U.S. State Legal Interest Rate Caps and Regulations */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">U.S. State Legal Interest Rate Caps and Regulations</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              While federal credit unions enforce a strict maximum statutory APR cap (typically 18% under federal guidelines), state laws regulate state-chartered banks, online fintech platforms, and private lenders differently. Because licensing rules and predatory lending protections vary across all 50 U.S. states, our free-entry rate field allows you to type in any exact custom APR or fee structure permitted in your jurisdiction.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Overview of U.S. State Personal Loan Regulatory Frameworks</h5>
            <div className="overflow-x-auto max-h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm" aria-label="U.S. State Personal Loan Regulatory Frameworks">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3">State</th>
                    <th scope="col" className="px-4 py-3">Small Loan APR Cap Status</th>
                    <th scope="col" className="px-4 py-3">Typical State Licensing Body</th>
                    <th scope="col" className="px-4 py-3">Maximum Consumer Protections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {[
                    ['Alabama', 'Rate capped under Small Loan Act', 'AL State Banking Department', 'Tiered interest rate structure'],
                    ['Alaska', 'Statutory caps apply on small loans', 'AK Division of Banking & Securities', 'Strict disclosure rules'],
                    ['Arizona', 'Capped for consumer loans under $10,000', 'AZ Department of Insurance and Financial Institutions', 'Military lending protections enforced'],
                    ['Arkansas', '17% Constitutional Usury Limit', 'AR State Bank Department', 'Strict interest rate enforcement'],
                    ['California', '36% APR cap on loans under $10,000', 'CA Department of Financial Protection and Innovation', 'AB 539 rate capping enforcement'],
                    ['Colorado', '36% APR cap under UCCC guidelines', 'CO Attorney General - Consumer Credit', 'Uniform Consumer Credit Code limits'],
                    ['Connecticut', '36% APR cap on consumer credit', 'CT Department of Banking', 'Strict APR calculation rules'],
                    ['Delaware', 'Flexible market-rate options', 'DE Office of the State Bank Commissioner', 'Clear contractual disclosure requirements'],
                    ['Florida', 'Tiered rate caps based on loan amount', 'FL Office of Financial Regulation', 'Florida Consumer Finance Act limits'],
                    ['Georgia', 'Capped under Industrial Loan Act', 'GA Office of Commissioner of Insurance and Safety Fire', 'Industrial loan fee protections'],
                    ['Hawaii', 'Capped on small consumer loans', 'HI Division of Financial Institutions', 'Small dollar loan restrictions'],
                    ['Idaho', 'Market rate rules with clear disclosure', 'ID Department of Finance', 'Credit Code enforcement'],
                    ['Illinois', '36% APR cap under PLPA', 'IL Department of Financial and Professional Regulation', 'Predatory Loan Prevention Act enforcement'],
                    ['Indiana', 'Capped under UCCC rate schedules', 'IN Department of Financial Institutions', 'Indiana Uniform Consumer Credit Code'],
                    ['Iowa', 'Regulated state caps on consumer loans', 'IA Division of Banking', 'Consumer Credit Code protections'],
                    ['Kansas', 'Capped under Kansas UCCC rules', 'KS Office of the State Bank Commissioner', 'Kansas Consumer Credit Code'],
                    ['Kentucky', 'Capped on consumer loans under statutory thresholds', 'KY Department of Financial Institutions', 'Consumer loan licensing requirements'],
                    ['Louisiana', 'Tiered interest caps based on loan sizing', 'LA Office of Financial Institutions', 'Louisiana Consumer Credit Law'],
                    ['Maine', '36% maximum rate cap for small loans', 'ME Bureau of Consumer Credit Protection', 'Strict fee disclosure regulations'],
                    ['Maryland', 'Capped consumer loan rate limits', 'MD Office of the Commissioner of Financial Regulation', 'Consumer loan law protections'],
                    ['Massachusetts', '23% small loan rate cap', 'MA Division of Banks', 'Small Loan Law enforcement'],
                    ['Michigan', 'Capped under Regulatory Loan Act', 'MI Department of Insurance and Financial Services', 'Regulatory Loan Act limits'],
                    ['Minnesota', 'Regulated small-loan statutory limits', 'MN Department of Commerce', 'Regulated Loan Act protections'],
                    ['Mississippi', 'Tiered rate caps apply', 'MS Department of Banking and Consumer Finance', 'Small Loan Regulatory Act'],
                    ['Missouri', 'Regulated loan company guidelines', 'MO Division of Finance', 'Consumer credit disclosure rules'],
                    ['Montana', '36% cap voter-approved under I-164', 'MT Division of Banking and Financial Institutions', 'Consumer Loan Act limits'],
                    ['Nebraska', '36% cap voter-approved under Measure 428', 'NE Department of Banking and Finance', 'Delayed Deposit and Small Loan limits'],
                    ['Nevada', 'Market rate options with mandatory disclosures', 'NV Financial Institutions Division', 'High-interest loan disclosure rules'],
                    ['New Hampshire', '36% APR cap on small consumer loans', 'NH Banking Department', 'Small Loan Act protections'],
                    ['New Jersey', '30% criminal usury limit', 'NJ Department of Banking and Insurance', 'Consumer Finance Licensing Act'],
                    ['New Mexico', '36% APR cap under HB 132', 'NM Financial Institutions Division', 'Small Loan Act protections'],
                    ['New York', '25% criminal usury cap', 'NY Department of Financial Services', 'Strict usury caps enforced'],
                    ['North Carolina', 'Capped under Consumer Finance Act', 'NC Commissioner of Banks', 'Consumer Finance Act protections'],
                    ['North Dakota', 'Statutory limits on small loans', 'ND Department of Financial Institutions', 'Consumer finance limits'],
                    ['Ohio', 'Capped under Small Loan and Mortgage Acts', 'OH Division of Financial Institutions', 'Ohio Small Loan Law'],
                    ['Oklahoma', 'Capped under Oklahoma UCCC', 'OK Department of Consumer Credit', 'Uniform Consumer Credit Code'],
                    ['Oregon', '36% APR cap on consumer loans', 'OR Division of Financial Regulation', 'Consumer Finance License regulations'],
                    ['Pennsylvania', '18% baseline statutory cap under CFTAPA', 'PA Department of Banking and Securities', 'Consumer Discount Company Act'],
                    ['Rhode Island', 'Regulated rate limits for small loans', 'RI Department of Business Regulation', 'Small Loan License regulations'],
                    ['South Carolina', 'Fixed rate caps required to be posted', 'SC Department of Consumer Affairs', 'Consumer Protection Code'],
                    ['South Dakota', '36% voter-approved cap under Initiated Measure 21', 'SD Division of Banking', 'Money Lending license limits'],
                    ['Tennessee', 'Capped rate structure under state formulas', 'TN Department of Financial Institutions', 'Flexible rate formula laws'],
                    ['Texas', 'Tiered interest caps under Finance Code', 'TX Office of Consumer Credit Commissioner', 'OCCC regulated loan schedules'],
                    ['Utah', 'Market-based rate system with clear contracts', 'UT Department of Financial Institutions', 'Consumer Credit Code protections'],
                    ['Vermont', 'Strict usury caps apply', 'VT Department of Financial Regulation', 'Small Loan Act regulations'],
                    ['Virginia', '36% APR cap on consumer loans under $35,000', 'VA State Corporation Commission / VA Bureau of Financial Institutions', 'Consumer Loan Act rules'],
                    ['Washington', '32% APR cap for small consumer loans', 'WA Department of Financial Institutions', 'Consumer Loan Act rules'],
                    ['West Virginia', 'Statutory interest caps on small loans', 'WV Division of Financial Institutions', 'Consumer Credit and Protection Act'],
                    ['Wisconsin', 'Regulated consumer loan framework', 'WI Department of Financial Institutions', 'Wisconsin Consumer Act'],
                    ['Wyoming', 'Capped under Wyoming UCCC rules', 'WY Division of Banking', 'Uniform Consumer Credit Code']
                  ].map(([st, cap, auth, prot], idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{st}</td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{cap}</td>
                      <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold">{auth}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{prot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* The Mathematics of Personal Loan Amortization */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">The Mathematics of Personal Loan Amortization</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Personal loans operate on a fixed amortization schedule. Every monthly installment is divided into two distinct portions: interest owed to the lender for the past billing cycle and principal used to reduce your balance.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">The Standard Amortization Formula</div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-center font-bold text-sm">
              M = P • [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1">
              <div>P = Net loan principal amount borrowed</div>
              <div>r = Monthly interest rate (Annual Interest Rate ÷ 12 ÷ 100)</div>
              <div>n = Total number of monthly payments (Loan Term in Years × 12)</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="font-bold text-base text-slate-900 dark:text-white">Amortization Balance Reduction Curve</div>
            <div className="space-y-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-mono text-xs sm:text-sm">
              <div>├── Early Loan Months: Higher Interest Allocation / Lower Principal Reduction</div>
              <div>├── Midpoint (M30):    Balanced Split Between Interest and Principal</div>
              <div>└── Late Loan Months:  Lower Interest Allocation / Rapid Principal Paydown</div>
            </div>
            <p className="pt-1 leading-relaxed">
              Because interest is calculated based on your remaining balance at the beginning of each cycle, the interest portion of your monthly payment decreases over time. Consequently, the portion allocated toward principal grows larger with every subsequent payment.
            </p>
          </div>
        </GlassCard>

        {/* Step-by-Step Payment Calculation Example */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Step-by-Step Payment Calculation Example</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">Using the default figures from the calculator interface, here is the complete mathematical breakdown:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Loan Parameters</div>
              <div>1. Total Loan Amount Borrowed (P): $25,000</div>
              <div>2. Quoted Annual Interest Rate: 8.50%</div>
              <div>3. Loan Term: 5 Years (60 Months)</div>
              <div>4. Origination Fee Percentage: 1.50%</div>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-1.5 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-2">Calculation Breakdown</div>
              <div>• Monthly Interest Rate (r): 8.5% / 12 = 0.0070833</div>
              <div>• Monthly Base Payment (M): $512.91 ($513/mo)</div>
              <div>• Total 60-Month Base Payments: $30,774.60</div>
              <div>• Total Cumulative Interest Paid: $5,774.60 ($5,775)</div>
              <div>• Upfront Origination Fee: $25,000 × 1.5% = $375.00</div>
              <div className="pt-2 font-black text-emerald-600 dark:text-emerald-400 text-sm">Total Final Outlay: $31,149.60 ($31,150)</div>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            In this setup, the borrower pays $5,775 in total interest and $375 in fees over the 5-year period. The origination fee represents 6.1% of total borrowing costs ($375 out of $6,150 total cost).
          </p>
        </GlassCard>

        {/* How Origination Fees Impact Net Loan Proceeds */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">How Origination Fees Impact Net Loan Proceeds</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            It is essential to distinguish between deducted origination fees and financed origination fees when accepting a loan offer:
          </p>
          <div className="space-y-2 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">Handling Origination Fees</div>
            <div>├── Option A: Deducted from Loan Proceeds (Net Payout Reduced)</div>
            <div>└── Option B: Added to Total Principal (Monthly Payment Increased)</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base block">Deducted from Proceeds (Most Common)</span>
              <p className="leading-relaxed">If you request $25,000 with a 1.5% fee ($375), the lender deducts $375 upfront and deposits $24,625 into your bank account. However, you still pay monthly interest on the full $25,000 loan agreement.</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base block">Financed into the Balance</span>
              <p className="leading-relaxed">If you need exactly $25,000 in net cash, you must request a higher gross loan amount (approximately $25,381) to cover the 1.5% fee without reducing your net cash payout.</p>
            </div>
          </div>
        </GlassCard>

        {/* The Benefits of Extra Principal Payments */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">The Benefits of Extra Principal Payments</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Paying more than your required monthly payment accelerates loan payoff and lowers total interest expenses. Because personal loans do not carry prepayment penalties under federal law, any extra funds applied directly to principal reduce your outstanding balance immediately.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-base text-slate-900 dark:text-white">Standard Scenario ($25,000 at 8.5% over 5 Years)</div>
              <div>• Monthly Payment: $513</div>
              <div>• Total Time to Pay Off: 60 Months (5 Years)</div>
              <div>• Cumulative Interest Paid: $5,775</div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-2 border border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-base text-emerald-900 dark:text-emerald-200">Accelerated Scenario (Adding $100 Extra Monthly)</div>
              <div>• Monthly Payment: $613 ($513 + $100)</div>
              <div>• Total Time to Pay Off: 49 Months (4 Years 1 Month)</div>
              <div>• Cumulative Interest Paid: $4,631</div>
              <div className="font-black text-emerald-600 dark:text-emerald-400 pt-1">Direct Financial Savings: $1,144 in Interest &amp; 11 Months Sooner!</div>
            </div>
          </div>
        </GlassCard>

        {/* FAQs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h4>
          <div className="space-y-4">
            {[
              {
                q: "What is a personal loan origination fee?",
                a: "An origination fee is an upfront processing fee charged by lenders to cover underwriting and administrative costs. It typically ranges from 1% to 8% of the total loan amount and is either deducted from your disbursement proceeds or added to your starting balance."
              },
              {
                q: "How does my credit score impact my personal loan rate?",
                a: "Lenders use your credit score to evaluate default risk. Borrowers with excellent credit (720+) qualify for single-digit interest rates, whereas borrowers with fair or poor credit face higher double-digit APRs, increasing total monthly and lifetime interest costs."
              },
              {
                q: "Can I make extra payments on a personal loan without penalty?",
                a: "Most reputable personal lenders do not charge prepayment penalties. Making extra monthly principal payments reduces your outstanding balance faster, substantially decreasing lifetime interest charges and shortening your repayment timeline."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. AUTO LOAN CALCULATOR MODULE
 * ========================================================================== */
export const US_AUTO_SALES_TAX_LIST = [
  { code: 'AL', name: 'Alabama', rate: 2.00 },
  { code: 'AK', name: 'Alaska', rate: 0.00 },
  { code: 'AZ', name: 'Arizona', rate: 5.60 },
  { code: 'AR', name: 'Arkansas', rate: 6.50 },
  { code: 'CA', name: 'California', rate: 7.25 },
  { code: 'CO', name: 'Colorado', rate: 2.90 },
  { code: 'CT', name: 'Connecticut', rate: 6.35 },
  { code: 'DE', name: 'Delaware', rate: 0.00 },
  { code: 'DC', name: 'District of Columbia', rate: 6.00 },
  { code: 'FL', name: 'Florida', rate: 6.00 },
  { code: 'GA', name: 'Georgia (TAVT)', rate: 7.00 },
  { code: 'HI', name: 'Hawaii', rate: 4.00 },
  { code: 'ID', name: 'Idaho', rate: 6.00 },
  { code: 'IL', name: 'Illinois', rate: 6.25 },
  { code: 'IN', name: 'Indiana', rate: 7.00 },
  { code: 'IA', name: 'Iowa', rate: 5.00 },
  { code: 'KS', name: 'Kansas', rate: 6.50 },
  { code: 'KY', name: 'Kentucky (Usage Tax)', rate: 6.00 },
  { code: 'LA', name: 'Louisiana', rate: 4.45 },
  { code: 'ME', name: 'Maine', rate: 5.50 },
  { code: 'MD', name: 'Maryland', rate: 6.00 },
  { code: 'MA', name: 'Massachusetts', rate: 6.25 },
  { code: 'MI', name: 'Michigan', rate: 6.00 },
  { code: 'MN', name: 'Minnesota', rate: 6.875 },
  { code: 'MS', name: 'Mississippi', rate: 5.00 },
  { code: 'MO', name: 'Missouri', rate: 4.225 },
  { code: 'MT', name: 'Montana', rate: 0.00 },
  { code: 'NE', name: 'Nebraska', rate: 5.50 },
  { code: 'NV', name: 'Nevada', rate: 4.60 },
  { code: 'NH', name: 'New Hampshire', rate: 0.00 },
  { code: 'NJ', name: 'New Jersey', rate: 6.625 },
  { code: 'NM', name: 'New Mexico (Motor Vehicle)', rate: 4.00 },
  { code: 'NY', name: 'New York', rate: 4.00 },
  { code: 'NC', name: 'North Carolina (HUT)', rate: 3.00 },
  { code: 'ND', name: 'North Dakota', rate: 5.00 },
  { code: 'OH', name: 'Ohio', rate: 5.75 },
  { code: 'OK', name: 'Oklahoma', rate: 3.25 },
  { code: 'OR', name: 'Oregon (Privilege Tax)', rate: 0.50 },
  { code: 'PA', name: 'Pennsylvania', rate: 6.00 },
  { code: 'RI', name: 'Rhode Island', rate: 7.00 },
  { code: 'SC', name: 'South Carolina', rate: 5.00 },
  { code: 'SD', name: 'South Dakota', rate: 4.00 },
  { code: 'TN', name: 'Tennessee', rate: 7.00 },
  { code: 'TX', name: 'Texas', rate: 6.25 },
  { code: 'UT', name: 'Utah', rate: 6.85 },
  { code: 'VT', name: 'Vermont', rate: 6.00 },
  { code: 'VA', name: 'Virginia (SUT)', rate: 4.15 },
  { code: 'WA', name: 'Washington', rate: 6.50 },
  { code: 'WV', name: 'West Virginia', rate: 6.00 },
  { code: 'WI', name: 'Wisconsin', rate: 5.00 },
  { code: 'WY', name: 'Wyoming', rate: 4.00 },
];

export function AutoLoanModule({ currency }: { currency: any }) {
  const [stateCode, setStateCode] = useState('CA');
  const [params, setParams] = useState({
    vehiclePrice: 38000,
    downPayment: 6000,
    tradeInValue: 4000,
    annualRate: 6.2,
    termMonths: 60,
    salesTaxPercent: 7.25,
    titleFees: 450,
    dealerDocFee: 350
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync state baseline sales tax when state changes
  const handleStateChange = (newCode: string) => {
    setStateCode(newCode);
    if (newCode === 'CUSTOM') return;
    const item = US_AUTO_SALES_TAX_LIST.find(s => s.code === newCode);
    if (item) {
      setParams(p => ({ ...p, salesTaxPercent: item.rate }));
    }
  };

  const res = useMemo(() => calculateAutoLoan(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  // Regulation Z Actuarial APR: Prepaid finance charges / doc fees increase true APR
  const aprRegZ = useMemo(() => {
    const financed = Math.max(1, res.totalFinanced - params.dealerDocFee);
    return solveRegulationZ_Apr(financed, res.monthlyPayment, params.termMonths);
  }, [res.totalFinanced, res.monthlyPayment, params.termMonths, params.dealerDocFee]);

  const chartData = [
    { name: 'Vehicle Loan', value: res.totalFinanced, color: '#3b82f6' },
    { name: 'Interest', value: res.totalInterest, color: '#f43f5e' },
    { name: 'Down + Trade', value: params.downPayment + params.tradeInValue, color: '#10b981' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Briefcase size={20} className="text-slate-700 dark:text-slate-300" aria-hidden="true" /> Vehicle Financing (US)
            </h3>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                State Sales Tax Jurisdiction <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="CUSTOM">-- Select State (Optional) / Free-entry --</option>
                {US_AUTO_SALES_TAX_LIST.map(st => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.rate === 0 ? '0% Sales Tax' : `${st.rate}% Sales Tax`})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                Selecting a state pre-populates default sales tax rates, or enter any custom rate below.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="Sales Tax Rate" 
                value={params.salesTaxPercent} 
                suffix="%" 
                step="0.01" 
                onChange={(v: number) => {
                  setStateCode('CUSTOM');
                  setParams(p => ({ ...p, salesTaxPercent: v }));
                }} 
              />
              <InputGroup label="Vehicle Price" value={params.vehiclePrice} prefix={currency.symbol} onChange={(v: number) => setParams({...params, vehiclePrice: v})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Down Payment" value={params.downPayment} prefix={currency.symbol} onChange={(v: number) => setParams({...params, downPayment: v})} />
              <InputGroup label="Trade-in Value" value={params.tradeInValue} prefix={currency.symbol} onChange={(v: number) => setParams({...params, tradeInValue: v})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Interest Rate" value={params.annualRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, annualRate: v})} />
              <InputGroup label="Term" value={params.termMonths} suffix="mo" step="12" onChange={(v: number) => setParams({...params, termMonths: v})} />
            </div>

            <AdvancedToggle isOpen={showAdvanced} onToggle={() => setShowAdvanced(!showAdvanced)} />
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Title & Reg" value={params.titleFees} prefix={currency.symbol} onChange={(v: number) => setParams({...params, titleFees: v})} />
                  <InputGroup label="Doc Fee" value={params.dealerDocFee} prefix={currency.symbol} onChange={(v: number) => setParams({...params, dealerDocFee: v})} />
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard label="Monthly Payment" value={format(res.monthlyPayment)} subtext={`For ${params.termMonths} months`} icon={Wallet} color="bg-slate-800 dark:bg-slate-700" />
            <MetricCard label="Regulation Z APR" value={`${aprRegZ.toFixed(3)}%`} subtext="Actuarial method" icon={Percent} color="bg-indigo-600" />
            <MetricCard label="Total Financed" value={format(res.totalFinanced)} subtext="Includes tax & fees" icon={ShieldAlert} color="bg-blue-600" />
            <MetricCard label="Total Interest" value={format(res.totalInterest)} subtext="Financing cost" icon={Landmark} color="bg-rose-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-6 lg:p-8 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Total Vehicle Cost Breakdown</h4>
              <div className="h-64" aria-label="Vehicle Cost Breakdown Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {chartData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {chartData.map(d => (
                  <div key={d.name} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">{d.name}</div>
                    <div className="text-sm font-black" style={{ color: d.color }}>{format(d.value)}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 lg:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Auto Deal Summary (TILA Disclosure)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Vehicle Base Price</span>
                    <span className="font-bold text-slate-900 dark:text-white">{format(params.vehiclePrice)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">State Sales Tax ({params.salesTaxPercent}%)</span>
                    <span className="font-bold text-slate-900 dark:text-white">+{format(res.salesTax)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Doc &amp; Title Fees</span>
                    <span className="font-bold text-slate-900 dark:text-white">+{format(res.fees)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Down Payment &amp; Trade Credit</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">-{format(params.downPayment + params.tradeInValue)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white">Total Out-of-Pocket Expenditure</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{format(res.totalVehicleCost)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
                Governing Regulation: Truth in Lending Act (TILA), Regulation Z (12 CFR Part 1026).
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE EDUCATIONAL GUIDE & BENCHMARKS */}
      <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
        {/* BLUF Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Auto Loan Calculator: How to Estimate Monthly Car Payments, Sales Tax, Trade-In Credit, and Dealer Fees
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            <strong>Bottom Line Up Front (BLUF):</strong> Financing a vehicle involves calculating several upfront and recurring expenses beyond the vehicle sticker price. Your total financed amount is determined by adding state sales tax, title/registration charges, and dealer documentation fees to the vehicle purchase price, then subtracting your cash down payment and trade-in allowance. On a $38,000 vehicle in California with a $6,000 cash down payment, $4,000 trade-in credit, 7.25% sales tax ($2,465 after trade-in tax credit), $450 title/reg fees, and $350 doc fees, the net loan principal comes out to $31,265. At a 6.20% annual interest rate over a 60-month term, the monthly payment works out to $607, generating $5,176 in total interest charges for a overall transaction cost of $46,441.
          </p>
        </div>

        {/* 2-Column: Total Outlay Tree & Core Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Understanding Total Vehicle Financing Outlay</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When negotiating a car purchase at a dealership, focusing solely on the vehicle sticker price often leads to underestimating your out-of-pocket costs. Dealership financing incorporates statutory state fees, local sales taxes, dealer documentation charges, and credit adjustments before arriving at your final financed loan balance.
            </p>
            <div className="space-y-1 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400">Total Out-of-Pocket Vehicle Expenditure</div>
              <div>├── Vehicle Sticker Price (Base Price)</div>
              <div>├── State &amp; Local Sales Tax (Calculated on Taxable Net Base)</div>
              <div>├── Mandatory Government Fees (Title &amp; Registration)</div>
              <div>├── Dealer Administrative Charges (Documentation Fee)</div>
              <div>├── Less: Cash Down Payment</div>
              <div>└── Less: Trade-In Equity Credit</div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Core Auto Financing Terms Defined</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong>Vehicle Base Price:</strong> The negotiated sale price of the vehicle before taxes, state fees, optional dealer add-ons, or financing charges.</li>
              <li><strong>Trade-In Equity Credit:</strong> The net dollar value granted by the dealership for your existing vehicle. In many U.S. states, trading in a vehicle provides a major tax advantage by reducing the taxable price of the new car.</li>
              <li><strong>Net Financed Principal:</strong> The remaining balance financed through an auto loan after factoring in taxes, dealer fees, down payment, and trade-in credit.</li>
              <li><strong>Regulation Z APR:</strong> The true annualized cost of financing required under the Truth in Lending Act (TILA). It integrates prepaid finance charges, mandatory lender fees, and interest rates into a standardized yearly percentage rate.</li>
              <li><strong>Total Out-of-Pocket Expenditure:</strong> The absolute sum of all capital deployed across the ownership transaction, combining cash down payment, trade-in credit, principal payments, interest charges, and upfront fees.</li>
            </ul>
          </GlassCard>
        </div>

        {/* How to Use the Calculator Inputs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">How to Use the Calculator Inputs</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The auto loan calculator provides a complete Truth in Lending Act (TILA) financing breakdown by accepting core purchase parameters alongside state-specific fee fields:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-base">1. Primary Financing Inputs</div>
              <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
                <li><strong>State Jurisdiction:</strong> Select your state or choose custom manual inputs. Choosing a state automatically provides baseline sales tax and fee benchmarks.</li>
                <li><strong>Vehicle Price ($):</strong> Enter the agreed negotiated price of the vehicle (e.g., $38,000).</li>
                <li><strong>Down Payment ($):</strong> Input your upfront cash contribution (e.g., $6,000). Higher down payments reduce loan-to-value (LTV) ratios and mitigate early equity depreciation.</li>
                <li><strong>Trade-in Value ($):</strong> Enter the allowance offered for your existing vehicle (e.g., $4,000).</li>
                <li><strong>Interest Rate (%):</strong> Input your quoted annual rate (e.g., 6.20%). Auto loan interest rates vary depending on whether the vehicle is new or used, your credit tier, and the repayment term length.</li>
                <li><strong>Term (Months):</strong> Select your loan horizon (e.g., 60 months / 5 years). Common auto loan terms include 36, 48, 60, 72, and 84 months.</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-2 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-base">2. Advanced Tax &amp; Dealer Fee Inputs</div>
              <ul className="space-y-1.5 list-disc pl-4 text-sm leading-relaxed">
                <li><strong>Sales Tax (%):</strong> Enter your state and local combined sales tax percentage (e.g., 7.25%).</li>
                <li><strong>Title &amp; Reg ($):</strong> Input mandatory state department of motor vehicles (DMV) licensing and titling fees (e.g., $450).</li>
                <li><strong>Doc Fee ($):</strong> Enter the administrative documentation fee charged by the dealership (e.g., $350).</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* 50-State Reference Guide Table */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Complete 50-State Reference Guide: Sales Taxes, Trade-In Tax Rules, and Dealer Doc Fees
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Auto financing costs vary dramatically depending on the state where you register the vehicle. Two key state-level factors directly affect your final monthly payment:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-1 pt-1 leading-relaxed">
              <li><strong>Trade-In Sales Tax Credit Rules:</strong> Most U.S. states allow a trade-in tax credit, meaning sales tax is charged only on the difference (Vehicle Price − Trade-In Value). A few states do not allow this credit, requiring you to pay sales tax on the full purchase price regardless of your trade-in.</li>
              <li><strong>Dealer Documentation Fee Caps:</strong> Some states set strict legal limits on dealer documentation fees (e.g., $175 in New York, $85 in California), while unregulated states allow dealerships to charge $800 to $1,000 or more.</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-1">
              Because municipal taxes and dealer practices vary, our free-entry tax and fee fields let you enter any custom rate or dollar amount.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">All 50 U.S. States Auto Finance Reference Table</h5>
            <div className="overflow-x-auto max-h-[420px] border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-left text-xs" aria-label="All 50 U.S. States Auto Finance Reference Table">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3">State</th>
                    <th scope="col" className="px-4 py-3">State Sales Tax Rate</th>
                    <th scope="col" className="px-4 py-3">Trade-In Tax Credit Allowed?</th>
                    <th scope="col" className="px-4 py-3">Avg. Combined Tax Rate</th>
                    <th scope="col" className="px-4 py-3">Dealer Doc Fee Status / Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {[
                    ['Alabama', '2.00% (Auto)', 'Yes', '3.50% – 4.00%', 'Uncapped ($400 – $500 avg)'],
                    ['Alaska', '0.00%', 'N/A (No State Tax)', '0.00% – 7.50% (Local)', 'Uncapped ($200 – $400 avg)'],
                    ['Arizona', '5.60%', 'Yes', '7.20% – 9.20%', 'Uncapped ($400 – $500 avg)'],
                    ['Arkansas', '6.50%', 'Yes (If trade > $4,000)', '7.50% – 10.00%', 'Uncapped ($150 – $300 avg)'],
                    ['California', '7.25%', 'No (Tax on full price)', '7.25% – 10.75%', 'Capped at $85'],
                    ['Colorado', '2.90%', 'Yes', '6.00% – 9.50%', 'Uncapped ($500 – $700 avg)'],
                    ['Connecticut', '6.35% (7.75% over $50k)', 'Yes', '6.35% – 7.75%', 'Uncapped ($400 – $600 avg)'],
                    ['Delaware', '0.00%', 'N/A (4.25% Doc Fee)', '4.25% (Doc Fee)', 'Uncapped ($300 – $500 avg)'],
                    ['Florida', '6.00%', 'Yes', '6.00% – 7.50%', 'Uncapped ($800 – $1,000+ avg)'],
                    ['Georgia', '7.00% (TAVT)', 'Yes', '7.00% (Flat TAVT)', 'Uncapped ($500 – $700 avg)'],
                    ['Hawaii', '4.00%', 'No', '4.00% – 4.50%', 'Uncapped ($250 – $450 avg)'],
                    ['Idaho', '6.00%', 'Yes', '6.00%', 'Uncapped ($300 – $400 avg)'],
                    ['Illinois', '6.25%', 'Yes (Restored limit)', '7.25% – 10.25%', 'Capped at $358 (Adjusted yearly)'],
                    ['Indiana', '7.00%', 'Yes', '7.00%', 'Capped at $230'],
                    ['Iowa', '5.00%', 'Yes', '5.00%', 'Uncapped ($150 – $300 avg)'],
                    ['Kansas', '6.50%', 'Yes', '7.50% – 10.50%', 'Uncapped ($200 – $400 avg)'],
                    ['Kentucky', '6.00% (Usage Tax)', 'Yes', '6.00%', 'Uncapped ($300 – $500 avg)'],
                    ['Louisiana', '4.45%', 'Yes', '8.50% – 10.00%', 'Capped at $200'],
                    ['Maine', '5.50%', 'Yes', '5.50%', 'Uncapped ($400 – $500 avg)'],
                    ['Maryland', '6.00%', 'Yes', '6.00%', 'Capped at $500'],
                    ['Massachusetts', '6.25%', 'Yes', '6.25%', 'Uncapped ($400 – $600 avg)'],
                    ['Michigan', '6.00%', 'Yes (Capped max trade credit)', '6.00%', 'Capped at $260 (Adjusted yearly)'],
                    ['Minnesota', '6.875%', 'Yes', '6.875% – 8.00%', 'Capped at $275'],
                    ['Mississippi', '5.00% (Auto)', 'Yes', '5.00%', 'Uncapped ($300 – $500 avg)'],
                    ['Missouri', '4.225%', 'Yes', '6.00% – 9.00%', 'Uncapped ($200 – $500 avg)'],
                    ['Montana', '0.00%', 'N/A', '0.00% (1.5% over $150k)', 'Uncapped ($200 – $400 avg)'],
                    ['Nebraska', '5.50%', 'Yes', '5.50% – 7.50%', 'Uncapped ($200 – $400 avg)'],
                    ['Nevada', '4.60%', 'Yes', '8.10% – 8.38%', 'Uncapped ($400 – $600 avg)'],
                    ['New Hampshire', '0.00%', 'N/A', '0.00%', 'Uncapped ($300 – $500 avg)'],
                    ['New Jersey', '6.625%', 'Yes', '6.625%', 'Uncapped ($400 – $600 avg)'],
                    ['New Mexico', '4.00% (Motor Vehicle)', 'Yes', '4.00%', 'Uncapped ($300 – $400 avg)'],
                    ['New York', '4.00%', 'Yes', '7.00% – 8.875%', 'Capped at $175'],
                    ['North Carolina', '3.00% (HUT)', 'Yes', '3.00% (Highway Use Tax)', 'Uncapped ($500 – $700 avg)'],
                    ['North Dakota', '5.00%', 'Yes', '5.00%', 'Uncapped ($250 – $350 avg)'],
                    ['Ohio', '5.75%', 'Yes', '6.50% – 8.00%', 'Capped at $250 (or 10% of sale)'],
                    ['Oklahoma', '3.25% (Auto)', 'Yes', '3.25% – 4.50%', 'Uncapped ($300 – $500 avg)'],
                    ['Oregon', '0.50% (Privilege Tax)', 'No', '0.50%', 'Capped at $150 (or $115 without electronic processing)'],
                    ['Pennsylvania', '6.00%', 'Yes', '6.00% (7% Allegheny / 8% Phila)', 'Capped at $463 (Adjusted yearly)'],
                    ['Rhode Island', '7.00%', 'Yes', '7.00%', 'Capped at $200'],
                    ['South Carolina', '5.00% (Capped at $500)', 'Yes', 'Max $500 (Infrastructure Maintenance Fee)', 'Uncapped ($400 – $600 avg)'],
                    ['South Dakota', '4.00%', 'Yes', '4.00%', 'Uncapped ($150 – $300 avg)'],
                    ['Tennessee', '7.00%', 'Yes', '8.50% – 9.75%', 'Uncapped ($500 – $700 avg)'],
                    ['Texas', '6.25%', 'Yes', '6.25%', 'Capped at $150'],
                    ['Utah', '6.85%', 'Yes', '6.85% – 7.25%', 'Uncapped ($300 – $450 avg)'],
                    ['Vermont', '6.00%', 'Yes', '6.00%', 'Uncapped ($300 – $500 avg)'],
                    ['Virginia', '4.15% (SUT)', 'No (Tax on full price)', '4.15% (Sales and Use Tax)', 'Uncapped ($500 – $800 avg)'],
                    ['Washington', '6.50% (+0.3% Motor Vehicle)', 'Yes', '8.00% – 10.60%', 'Capped at $200'],
                    ['West Virginia', '6.00%', 'Yes', '6.00%', 'Capped at $175'],
                    ['Wisconsin', '5.00%', 'Yes', '5.00% – 5.60%', 'Uncapped ($200 – $350 avg)'],
                    ['Wyoming', '4.00%', 'Yes', '4.00% – 6.00%', 'Uncapped ($200 – $400 avg)']
                  ].map(([st, rate, cred, avgRate, doc], idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{st}</td>
                      <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold">{rate}</td>
                      <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">{cred}</td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{avgRate}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{doc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* National Benchmark Auto Loan Rates by Credit Score */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              National Benchmark Auto Loan Rates by Credit Score
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Auto loan interest rates are primarily determined by your credit score, loan duration, and whether you are purchasing a new or used vehicle. Lenders classify credit profiles into five main tiers.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[400px] border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-left text-xs" aria-label="U.S. Auto Loan Interest Rates">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3">Credit Tier</th>
                  <th scope="col" className="px-4 py-3">Score Range</th>
                  <th scope="col" className="px-4 py-3">Avg. New Car APR</th>
                  <th scope="col" className="px-4 py-3">Avg. Used Car APR</th>
                  <th scope="col" className="px-4 py-3">Monthly Payment (New)</th>
                  <th scope="col" className="px-4 py-3">Total Interest Paid (New)</th>
                  <th scope="col" className="px-4 py-3">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {[
                  ['Super Prime', '781 to 850', '5.25%', '6.75%', '$569', '$4,170', '$34,170'],
                  ['Prime', '661 to 780', '6.45%', '8.85%', '$586', '$5,178', '$35,178'],
                  ['Non-Prime', '601 to 660', '9.60%', '13.25%', '$632', '$7,896', '$37,896'],
                  ['Subprime', '501 to 600', '12.85%', '18.10%', '$680', '$10,812', '$40,812'],
                  ['Deep Subprime', '300 to 500', '15.75%', '21.30%', '$726', '$13,538', '$43,538']
                ].map(([tier, rng, newApr, usedApr, pmt, intPaid, totPaid], idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{tier}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rng}</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold">{newApr}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{usedApr}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{pmt}</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">{intPaid}</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">{totPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
            Note: Figures assume a $30,000 financed principal over 60 months.
          </div>
        </GlassCard>

        {/* The Mathematics of Auto Loan Amortization */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">The Mathematics of Auto Loan Amortization</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Auto financing relies on simple interest amortization. Interest accrues daily based on your remaining principal balance between payment dates.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <div className="font-bold text-indigo-600 dark:text-indigo-400">Standard Amortization Formula</div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-center font-bold text-sm">
              M = P • [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
            </div>
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1">
              <div>P = Net Financed Principal (Vehicle Price + Taxes + Fees − Down Payment − Trade Credit)</div>
              <div>r = Monthly interest rate (Annual Interest Rate ÷ 12 ÷ 100)</div>
              <div>n = Loan term in months (e.g., 60 months)</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="font-bold text-base text-slate-900 dark:text-white">Auto Amortization Balance Progression</div>
            <div className="space-y-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl font-mono text-xs sm:text-sm">
              <div>├── Month 1:  High Principal Balance ──► Higher Monthly Interest Charge</div>
              <div>├── Month 30: Midpoint Balance      ──► Equal Division of Payment</div>
              <div>└── Month 60: Minimal Balance       ──► Final Principal Settlement</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-900 dark:text-white text-base">Truth in Lending Act (TILA) Disclosure Formula</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Under Federal Regulation Z (12 CFR Part 1026), auto lenders must disclose four key financial metrics before contract execution:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block text-sm">Annual Percentage Rate (APR)</span>
                <span className="text-slate-600 dark:text-slate-400">Nominal Interest Rate + Prepaid Finance Fees</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-900 dark:text-rose-200 block text-sm">Finance Charge</span>
                <span className="text-slate-600 dark:text-slate-400">Total Interest Paid + Financing Fees</span>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="font-bold text-blue-900 dark:text-blue-200 block text-sm">Amount Financed</span>
                <span className="text-slate-600 dark:text-slate-400">Net Credit Provided to Your Account</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm">Total of Payments</span>
                <span className="text-slate-600 dark:text-slate-400">Amount Financed + Total Finance Charges</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Step-by-Step Payment Calculation Example */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Step-by-Step Payment Calculation Example</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300">Using the scenario from the calculator image, here is the exact mathematical step-by-step breakdown:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Deal Setup &amp; Net Loan (P)</div>
              <div>Step 1: Vehicle Purchase Price: $38,000</div>
              <div>Step 2: Less Trade-In Allowance: -$4,000</div>
              <div>Step 3: Taxable Base Price (CA Rules: No Credit): $38,000</div>
              <div>Step 4: State Sales Tax (7.25% on $38,000 − $4,000): $2,465</div>
              <div>Step 5: Mandatory Title &amp; Registration Fees: +$450</div>
              <div>Step 6: Dealer Administrative Documentation Fee: +$350</div>
              <div className="pt-2 font-bold text-slate-900 dark:text-white">Gross Total Purchase Price: $41,265</div>
              <div>Less Total Deductions ($6k Down + $4k Trade): -$10,000</div>
              <div className="pt-1 font-black text-indigo-600 dark:text-indigo-400 text-sm">Net Amount Financed (P): $31,265</div>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-1.5 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-2">Financing &amp; Outlay Results</div>
              <div>• Quoted Interest Rate: 6.20%</div>
              <div>• Loan Term: 60 Months</div>
              <div>• Monthly Interest Rate (r): 6.20% / 12 = 0.0051667</div>
              <div className="pt-1 font-bold text-slate-900 dark:text-white text-sm">• Calculated Monthly Payment (M): $607.03 / mo</div>
              <div>• Total Interest Paid Over 60 Months: $5,176.00</div>
              <div>• Total Amount Paid on Loan ($31,265 + $5,176): $36,441.00</div>
              <div className="pt-2 font-black text-emerald-600 dark:text-emerald-400 text-sm">• Total Transaction Cost: $46,441.00</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">($36,441 loan payments + $10,000 cash down &amp; trade equity)</div>
            </div>
          </div>
        </GlassCard>

        {/* 5 Practical Strategies to Lower Total Auto Loan Costs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">5 Practical Strategies to Lower Total Auto Loan Costs</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">1. Keep the Loan Term to 60 Months or Fewer</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                While 72-month and 84-month loans lower your monthly payment, they significantly increase total interest expenses and heighten the risk of becoming "upside-down" on your loan (owing more than the car is worth).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">2. Put Down at Least 20% on New Cars</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                New vehicles lose 15% to 20% of their value in the first year. A 20% down payment prevents negative equity and protects you if the vehicle is totaled or sold early.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">3. Get Pre-Approved Before Visiting the Dealer</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Dealerships often add a 1% to 2% interest rate markup on financing arranged through their finance office. Securing a pre-approved rate from a credit union or bank gives you leverage to negotiate lower rates at the dealership.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">4. Negotiate Dealer Fees and Add-Ons</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Review the itemized loan contract for optional add-ons like extended warranties, GAP insurance, tire protection, or dealer prep charges. These non-essential add-ons can be declined or negotiated down.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 md:col-span-2">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">5. Pay Taxes and Registration Fees Out-of-Pocket</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Avoid rolling sales tax, title, and documentation fees into your loan. Financing these administrative costs increases your monthly payment and incurs long-term interest charges on non-asset fees.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* FAQs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h4>
          <div className="space-y-4">
            {[
              {
                q: "What is GAP insurance, and do I need it?",
                a: "Guaranteed Asset Protection (GAP) insurance covers the financial gap between what your auto insurance company pays if your vehicle is totaled or stolen and the remaining balance on your auto loan. GAP insurance is recommended if your down payment is less than 20%, if you choose a loan term longer than 60 months, or if you are leasing a vehicle."
              },
              {
                q: "Can I refinance my auto loan later if interest rates drop?",
                a: "Yes. Auto loans can be refinanced at any time without federal prepayment penalties. If your credit score improves significantly or market interest rates drop by 1% to 2%, refinancing can lower your monthly payment and reduce remaining interest charges."
              },
              {
                q: "How does trading in a car with negative equity affect my loan?",
                a: "If you owe more on your trade-in vehicle than the dealer offers for it, you have negative equity (often called being 'underwater'). Dealerships typically offer to roll this remaining debt into your new auto loan. Doing so increases your new loan principal, raises your monthly payment, and compounds your interest expenses."
              },
              {
                q: "What is the 20/4/10 rule for buying a car?",
                a: "The 20/4/10 rule is a practical budgeting framework for purchasing a vehicle: 20% Down Payment: Put down at least 20% in cash or trade-in equity. 4-Year Term: Limit the loan length to no more than 4 years (48 months). 10% of Income: Keep your total monthly vehicle expenses (loan payment, auto insurance, and fuel) below 10% of your gross monthly income."
              },
              {
                q: "Why is my first auto loan payment slightly higher or lower than my estimated installment?",
                a: "Your first auto loan payment may differ slightly from your standard monthly estimate depending on the number of days between loan origination and your first due date. Because auto interest accrues daily, scheduling your first payment 45 days after delivery instead of the standard 30 days generates extra daily interest charges, which are added to your initial billing statement."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. INTEREST CALCULATOR MODULE
 * ========================================================================== */
export function InterestCalculatorModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    principal: 20000,
    annualRate: 5.5,
    years: 5,
    type: 'compound' as 'compound' | 'simple',
    frequency: 365 as 1 | 2 | 4 | 12 | 365,
    monthlyDeposit: 157
  });
  const [showAdvanced, setShowAdvanced] = useState(true);

  const res = useMemo(() => calculateInterest(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;

  const freqLabel = params.frequency === 365 ? 'Daily' : params.frequency === 12 ? 'Monthly' : params.frequency === 4 ? 'Quarterly' : 'Annual';

  // Real-time comparison across all compounding schedules to demonstrate exact delta
  const frequencyComparison = useMemo(() => {
    if (params.type !== 'compound') return [];
    const freqs: Array<{ freq: 365 | 12 | 4 | 1; label: string; times: string }> = [
      { freq: 365, label: 'Daily', times: '365/yr' },
      { freq: 12, label: 'Monthly', times: '12/yr' },
      { freq: 4, label: 'Quarterly', times: '4/yr' },
      { freq: 1, label: 'Annually', times: '1/yr' }
    ];
    return freqs.map(f => {
      const computed = calculateInterest({ ...params, frequency: f.freq });
      return {
        freq: f.freq,
        label: f.label,
        times: f.times,
        finalBalance: computed.finalBalance,
        totalInterest: computed.totalInterest,
        apy: computed.apy
      };
    });
  }, [params]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Landmark size={20} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> Interest Growth
            </h3>
            <InputGroup label="Initial Principal" value={params.principal} prefix={currency.symbol} onChange={(v: number) => setParams({...params, principal: v})} />
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Interest Rate" value={params.annualRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, annualRate: v})} />
              <InputGroup label="Time Horizon" value={params.years} suffix="yrs" onChange={(v: number) => setParams({...params, years: v})} />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Interest Method</span>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setParams({...params, type: 'compound'})}
                  className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.type === 'compound' ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
                >
                  Compound
                </button>
                <button 
                  type="button" 
                  onClick={() => setParams({...params, type: 'simple'})}
                  className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.type === 'simple' ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm font-black" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
                >
                  Simple
                </button>
              </div>
            </div>

            {params.type === 'compound' && (
              <div className="space-y-2">
                <label htmlFor="compounding-freq-select" className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                  Compounding Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 365, label: 'Daily (365/yr)' },
                    { value: 12, label: 'Monthly (12/yr)' },
                    { value: 4, label: 'Quarterly (4/yr)' },
                    { value: 1, label: 'Annually (1/yr)' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setParams({ ...params, frequency: opt.value as any })}
                      className={cn(
                        "min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                        params.frequency === opt.value
                          ? "bg-emerald-600 border-emerald-600 text-white font-black shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <select 
                  id="compounding-freq-select"
                  aria-label="Compounding Frequency Dropdown"
                  value={params.frequency} 
                  onChange={e => setParams({...params, frequency: Number(e.target.value) as any})}
                  className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl py-2 px-3 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer mt-1"
                >
                  <option value={365}>Daily (365/yr)</option>
                  <option value={12}>Monthly (12/yr)</option>
                  <option value={4}>Quarterly (4/yr)</option>
                  <option value={1}>Annually (1/yr)</option>
                </select>
              </div>
            )}

            <AdvancedToggle isOpen={showAdvanced} onToggle={() => setShowAdvanced(!showAdvanced)} />
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                <InputGroup label="Monthly Addition" value={params.monthlyDeposit} prefix={currency.symbol} onChange={(v: number) => setParams({...params, monthlyDeposit: v})} />
              </div>
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard label="Final Balance" value={format(res.finalBalance)} subtext={`Principal + Growth (${freqLabel})`} icon={TrendingUp} color="bg-emerald-600" />
            <MetricCard label="Total Interest Earned" value={format(res.totalInterest)} subtext={`Pure interest yield (${freqLabel})`} icon={Zap} color="bg-amber-600" />
            <MetricCard label="Effective APY" value={`${res.apy}%`} subtext={`Annual yield (${freqLabel} compounding)`} icon={Percent} color="bg-blue-600" />
          </div>

          <GlassCard className="p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Wealth Accrual Trajectory</h4>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                {freqLabel} Compounding Active
              </span>
            </div>
            <div className="h-80" aria-label="Wealth Accrual Trajectory Chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={res.timeline}>
                  <defs>
                    <linearGradient id="interestGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                  <XAxis dataKey="year" tickFormatter={y => `Year ${y}`} fontSize={11} stroke="#64748b" />
                  <YAxis hide />
                  <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fill="url(#interestGrowth)" name="Total Balance" />
                  <Area type="monotone" dataKey="principal" stroke="#64748b" strokeWidth={2} fillOpacity={0} name="Total Deposits" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {params.type === 'compound' && (
            <GlassCard className="p-6 lg:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Compounding Frequency Yield Comparison
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Direct calculation across daily, monthly, quarterly, and annual compounding (click row to select)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Active: {freqLabel} ({params.frequency}/yr)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left" aria-label="Compounding Frequency Yield Comparison">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                      <th scope="col" className="py-2.5 px-3">Compounding Schedule</th>
                      <th scope="col" className="py-2.5 px-3">Effective APY</th>
                      <th scope="col" className="py-2.5 px-3">Total Interest Earned</th>
                      <th scope="col" className="py-2.5 px-3">Final Balance</th>
                      <th scope="col" className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {frequencyComparison.map(row => {
                      const isSelected = params.frequency === row.freq;
                      return (
                        <tr 
                          key={row.freq} 
                          onClick={() => setParams({ ...params, frequency: row.freq })}
                          className={cn(
                            "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80",
                            isSelected ? "bg-emerald-50/70 dark:bg-emerald-950/40 font-bold" : ""
                          )}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" aria-hidden="true" />
                              )}
                              <span className={isSelected ? "text-emerald-700 dark:text-emerald-300 font-black" : "text-slate-900 dark:text-white"}>
                                {row.label} ({row.times})
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {row.apy}%
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-amber-700 dark:text-amber-300">
                            {format(row.totalInterest)}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {format(row.finalBalance)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setParams({ ...params, frequency: row.freq });
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                                isSelected 
                                  ? "bg-emerald-600 text-white font-black" 
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                              )}
                            >
                              {isSelected ? 'Active' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE EDUCATIONAL GUIDE & BENCHMARKS */}
      <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
        {/* BLUF Banner */}
        <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Interest Calculator: How to Estimate Compound and Simple Interest Gains
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            <strong>Bottom Line Up Front (BLUF):</strong> The true return on invested capital depends heavily on three core factors: interest calculation method (compound vs. simple), compounding frequency (daily, monthly, quarterly, or annually), and recurring contributions. Starting with a $20,000 initial principal at a 5.50% annual interest rate over a 5-year investment horizon with daily compounding and $157 monthly additions yields a final balance of $37,147.74. This reflects $20,000 in starting principal, $9,420 in cumulative monthly contributions, and $7,727.74 in total compound interest earned—delivering an effective Annual Percentage Yield (APY) of 5.65%.
          </p>
        </div>

        {/* 2-Column: Total Outlay Tree & Core Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Understanding Interest Calculations: Simple vs. Compound Interest</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Interest is the monetary return earned on invested capital or the cost paid for borrowing funds. The method used to calculate interest significantly impacts wealth growth over time.
            </p>
            <div className="space-y-1 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">Total Investment Growth Value</div>
              <div>├── Initial Principal: The baseline capital deposited at investment origination</div>
              <div>├── Cumulative Recurring Additions: Total scheduled periodic contributions</div>
              <div>└── Total Interest Earned: Pure yield generated through simple or compound growth</div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Core Financial Metrics Defined</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong>Initial Principal ($):</strong> The starting capital deposit placed into a savings account, certificate of deposit (CD), treasury bond, or investment portfolio.</li>
              <li><strong>Nominal Interest Rate (%):</strong> The stated annual percentage rate (APR) paid by the financial institution before accounting for compounding effects.</li>
              <li><strong>Compounding Frequency:</strong> The schedule at which accrued interest is calculated and added back to the principal balance (daily, monthly, quarterly, or annually).</li>
              <li><strong>Effective Annual Percentage Yield (APY):</strong> The actual annualized rate of return earned when compounding frequency is factored into the nominal interest rate.</li>
              <li><strong>Monthly Addition ($):</strong> Regular supplemental capital contributions made at the end of each billing or calendar cycle to accelerate balance accumulation.</li>
            </ul>
          </GlassCard>
        </div>

        {/* Simple Interest vs. Compound Interest Mechanics */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Simple Interest vs. Compound Interest Mechanics</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Understanding the structural difference between simple and compound interest is fundamental to long-term wealth planning:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white text-base">1. Simple Interest Model</div>
              <p className="leading-relaxed">
                Simple interest calculates yield exclusively on the original initial principal balance. Interest earned in previous cycles is paid out or held separately and does not generate additional earnings.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                Simple Interest (I) = P • r • t
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
                <div>P = Initial Principal</div>
                <div>r = Stated Annual Interest Rate (decimal)</div>
                <div>t = Time Horizon in Years</div>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl space-y-3 border border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-base">2. Compound Interest Model</div>
              <p className="leading-relaxed">
                Compound interest calculates yield on both the initial principal balance and all cumulative interest earned from prior compounding periods. This creates an exponential growth curve often referred to as financial compounding.
              </p>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-center font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                A = P(1 + r/n)^(nt) + PMT • [((1 + r/n)^(nt) - 1) / (r/n)]
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-0.5 font-mono">
                <div>A = Final Accumulated Balance</div>
                <div>P = Initial Principal</div>
                <div>r = Annual Interest Rate (decimal)</div>
                <div>n = Compounding Periods per Year (e.g., 365 daily, 12 monthly)</div>
                <div>t = Time Horizon in Years</div>
                <div>PMT = Periodic Contribution Amount</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* How Compounding Frequency Increases Annual Yield (APY) & Matrix */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              How Compounding Frequency Increases Annual Yield (APY)
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Compounding frequency determines how often accrued earnings are reinvested into the principal base. Increasing the compounding frequency raises the effective yield without changing the nominal interest rate.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 max-w-md mx-auto">
              Effective APY = (1 + r/n)^n - 1
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Yield Comparison Matrix ($20,000 Principal at 5.50% APR with $157 Monthly Additions over 5 Years)
            </h5>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm" aria-label="Yield Comparison Matrix">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  <tr>
                    <th scope="col" className="px-4 py-3">Compounding Schedule</th>
                    <th scope="col" className="px-4 py-3">Nominal APR</th>
                    <th scope="col" className="px-4 py-3">Effective APY</th>
                    <th scope="col" className="px-4 py-3">Total Interest Earned</th>
                    <th scope="col" className="px-4 py-3">Final Accumulated Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Daily (365/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">5.50%</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">5.65%</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">$7,727.74</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$37,147.74</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Monthly (12/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">5.50%</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">5.64%</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">$7,708.56</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$37,128.56</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Quarterly (4/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">5.50%</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">5.61%</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">$7,668.69</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$37,088.69</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Annually (1/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">5.50%</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">5.50%</td>
                    <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-bold">$7,496.47</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$36,916.47</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">Simple Interest</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">5.50%</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-bold">5.50%</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">$5,500.00 (No Additions)</td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">$25,500.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* U.S. Deposit Account Regulatory & Tax Framework */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            U.S. Deposit Account Regulatory &amp; Tax Framework
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When evaluating interest-bearing products in the United States, several federal regulatory standards and tax rules govern consumer savings and investment vehicles:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-base block">1. Truth in Savings Act (Regulation DD)</span>
              <p className="leading-relaxed">
                Federal Regulation DD requires financial institutions to disclose interest rates using the standardized Annual Percentage Yield (APY) metric. This ensures consumers can make direct side-by-side comparisons across banks regardless of compounding schedules.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-base block">2. FDIC &amp; NCUA Insurance Limits</span>
              <p className="leading-relaxed">
                <strong>FDIC Insurance:</strong> Deposits at insured commercial banks are protected up to $250,000 per depositor, per insured bank, for each ownership category.
              </p>
              <p className="leading-relaxed">
                <strong>NCUA Insurance:</strong> Share accounts at federally insured credit unions receive identical coverage up to $250,000 through the National Credit Union Share Insurance Fund (NCUSIF).
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-base block">3. IRS Tax Treatment of Interest Income</span>
              <p className="leading-relaxed">
                Under U.S. tax law, interest earned on high-yield savings accounts (HYSA), certificates of deposit (CDs), and corporate bonds is categorized as ordinary income and taxed at standard federal income tax rates.
              </p>
              <p className="leading-relaxed">
                <strong>Form 1099-INT:</strong> Financial institutions issue IRS Form 1099-INT annually to account holders who earn $10 or more in interest during the tax year.
              </p>
              <p className="leading-relaxed">
                <strong>Tax-Exempt Interest:</strong> Interest earned on municipal bonds issued by state and local governments is typically exempt from federal income tax and, in many cases, state taxes if you reside in the issuing jurisdiction.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Complete 50-State Income Tax Overview for Savings Interest */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Complete 50-State Income Tax Overview for Savings Interest
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Interest income earned on cash deposits is subject to state income taxes in states that levy an income tax. Use the complete reference table below to understand how state income tax rates apply to interest earnings.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[440px] border border-slate-200 dark:border-slate-700 rounded-2xl">
            <table className="w-full text-left text-xs sm:text-sm" aria-label="All 50 U.S. States Interest Tax Overview">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-4 py-3">State</th>
                  <th scope="col" className="px-4 py-3">State Income Tax Treatment on Interest</th>
                  <th scope="col" className="px-4 py-3">Top Marginal State Tax Rate</th>
                  <th scope="col" className="px-4 py-3">Primary Tax Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {[
                  ['Alabama', 'Taxed as ordinary income', '5.00%', 'Progressive bracket schedule'],
                  ['Alaska', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['Arizona', 'Taxed as ordinary income', '2.50%', 'Flat tax rate structure'],
                  ['Arkansas', 'Taxed as ordinary income', '4.40%', 'Graduated income tax scale'],
                  ['California', 'Taxed as ordinary income', '13.30% (Up to 14.4%)', 'Top progressive state tax rate'],
                  ['Colorado', 'Taxed as ordinary income', '4.40%', 'Flat tax on state taxable income'],
                  ['Connecticut', 'Taxed as ordinary income', '6.99%', 'Progressive multi-bracket system'],
                  ['Delaware', 'Taxed as ordinary income', '6.60%', 'Graduated income tax brackets'],
                  ['Florida', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['Georgia', 'Taxed as ordinary income', '5.39%', 'Transitioning to flat tax model'],
                  ['Hawaii', 'Taxed as ordinary income', '11.00%', 'High progressive bracket schedule'],
                  ['Idaho', 'Taxed as ordinary income', '5.69%', 'Flat income tax system'],
                  ['Illinois', 'Taxed as ordinary income', '4.95%', 'Constitutional flat tax rate'],
                  ['Indiana', 'Taxed as ordinary income', '3.05%', 'Low flat tax rate structure'],
                  ['Iowa', 'Taxed as ordinary income', '3.80%', 'Flat tax implementation'],
                  ['Kansas', 'Taxed as ordinary income', '5.70%', 'Multi-tier graduated brackets'],
                  ['Kentucky', 'Taxed as ordinary income', '4.00%', 'Flat tax rate system'],
                  ['Louisiana', 'Taxed as ordinary income', '4.25%', 'Graduated individual income tax'],
                  ['Maine', 'Taxed as ordinary income', '7.15%', 'Progressive three-bracket system'],
                  ['Maryland', 'Taxed as ordinary income', '5.75% (+ Local county tax)', 'Combined state and county rates'],
                  ['Massachusetts', 'Taxed as ordinary income', '5.00% (4% Surtax over $1M)', 'Flat base rate with high-earner surtax'],
                  ['Michigan', 'Taxed as ordinary income', '4.25%', 'Flat income tax rate'],
                  ['Minnesota', 'Taxed as ordinary income', '9.85%', 'High progressive top bracket'],
                  ['Mississippi', 'Taxed as ordinary income', '4.00%', 'Single flat tax rate'],
                  ['Missouri', 'Taxed as ordinary income', '4.80%', 'Graduated tax bracket schedule'],
                  ['Montana', 'Taxed as ordinary income', '5.90%', 'Simplified two-bracket system'],
                  ['Nebraska', 'Taxed as ordinary income', '5.84%', 'Graduated individual tax rate'],
                  ['Nevada', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['New Hampshire', 'Phasing Out Interest/Dividends Tax', '1.00% (0% effective 2027)', 'Special tax on investment income phasing out'],
                  ['New Jersey', 'Taxed as ordinary income', '10.75%', 'High progressive top rate'],
                  ['New Mexico', 'Taxed as ordinary income', '5.90%', 'Graduated income tax brackets'],
                  ['New York', 'Taxed as ordinary income', '10.90% (+ NYC local tax)', 'High progressive state and city rates'],
                  ['North Carolina', 'Taxed as ordinary income', '4.50%', 'Flat individual tax rate'],
                  ['North Dakota', 'Taxed as ordinary income', '2.50%', 'Low progressive bracket structure'],
                  ['Ohio', 'Taxed as ordinary income', '3.50%', 'Graduated income tax brackets'],
                  ['Oklahoma', 'Taxed as ordinary income', '4.75%', 'Multi-tier graduated brackets'],
                  ['Oregon', 'Taxed as ordinary income', '9.90%', 'High progressive top tax rate'],
                  ['Pennsylvania', 'Taxed as ordinary income', '3.07%', 'Low statutory flat tax rate'],
                  ['Rhode Island', 'Taxed as ordinary income', '5.99%', 'Progressive three-bracket system'],
                  ['South Carolina', 'Taxed as ordinary income', '6.40%', 'Graduated individual income tax'],
                  ['South Dakota', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['Tennessee', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['Texas', 'No State Income Tax', '0.00%', 'Zero state tax on interest income'],
                  ['Utah', 'Taxed as ordinary income', '4.55%', 'Flat state income tax rate'],
                  ['Vermont', 'Taxed as ordinary income', '8.75%', 'Progressive multi-bracket schedule'],
                  ['Virginia', 'Taxed as ordinary income', '5.75%', 'Graduated individual tax rate'],
                  ['Washington', 'No State Income Tax on Savings', '0.00%', 'No tax on interest (7% tax on capital gains >$250k)'],
                  ['West Virginia', 'Taxed as ordinary income', '5.12%', 'Graduated income tax brackets'],
                  ['Wisconsin', 'Taxed as ordinary income', '7.65%', 'Progressive four-bracket scale'],
                  ['Wyoming', 'No State Income Tax', '0.00%', 'Zero state tax on interest income']
                ].map(([st, treat, rate, frame], idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{st}</td>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{treat}</td>
                    <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold">{rate}</td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{frame}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Step-by-Step Mathematical Calculation Walkthrough */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Step-by-Step Mathematical Calculation Walkthrough
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Using the parameters from the calculator setup, here is the exact mathematical calculation for daily compounding with recurring monthly contributions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Calculation Inputs</div>
              <div>• Initial Principal Deposit (P): $20,000.00</div>
              <div>• Stated Annual Interest Rate (r): 5.50% (0.055 per year)</div>
              <div>• Time Horizon (t): 5 Years (60 Months)</div>
              <div>• Compounding Frequency (n): 365 Days per Year</div>
              <div>• Monthly Contribution (PMT): $157.00 per month</div>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-2 border border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm mb-2">Step-by-Step Breakdown</div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">1. Initial Principal Compound Growth:</div>
                <div>$20,000 × (1 + 0.055 / 365)^(365 × 5)</div>
                <div>= $20,000 × (1.00015068)^1825 = $26,329.83</div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="font-bold text-slate-900 dark:text-white">2. Monthly Additions Accumulation Growth:</div>
                <div>Total Cash Additions = $157 × 60 Months = $9,420.00</div>
                <div>Future Value of Monthly Additions (Daily Compounded) = $10,817.91</div>
              </div>
              <div className="space-y-1 pt-1">
                <div className="font-bold text-slate-900 dark:text-white">3. Combined Final Portfolio Balance:</div>
                <div>$26,329.83 + $10,817.91 = $37,147.74</div>
              </div>
              <div className="pt-2 font-black text-emerald-600 dark:text-emerald-400 text-sm border-t border-emerald-200 dark:border-emerald-800">
                • Total Contributed: $29,420.00 | Total Interest Earned: $7,727.74 | Final Value: $37,147.74
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 5 Practical Wealth-Building Strategies Using Compounding */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            5 Practical Wealth-Building Strategies Using Compounding
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">1. Start Investing Early</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Because time (t) acts as an exponent in the compound interest formula, doubling your investment horizon quadruples compounding growth potential rather than merely doubling it.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">2. Increase Compounding Frequency</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Choose financial accounts that compound interest daily rather than quarterly or annually to capture maximum effective yield (APY).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">3. Automate Monthly Contributions</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Setting up recurring monthly deposits ensures continuous capital additions, fueling compound growth regardless of market volatility.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">4. Utilize Tax-Advantaged Accounts</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Holding cash and fixed-income assets inside tax-advantaged accounts like Traditional IRAs, Roth IRAs, or 401(k)s delays or eliminates annual taxes on interest income, keeping 100% of yield compounding.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 md:col-span-2">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">5. Reinvest All Interest Distributions</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Avoid withdrawing interest payments as cash. Keeping earnings within the account ensures the entire balance generates interest during subsequent compounding cycles.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* FAQs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h4>
          <div className="space-y-4">
            {[
              {
                q: "What is the Rule of 72, and how does it work?",
                a: "The Rule of 72 is a quick mental math shortcut used to estimate how many years it will take for an investment to double at a fixed annual interest rate. Divide 72 by your annual interest rate. For example, at a 5.50% interest rate, your money will double in approximately 13.09 years (72 ÷ 5.50)."
              },
              {
                q: "How does inflation affect compound interest returns?",
                a: "Inflation reduces the purchasing power of money over time. To calculate your real rate of return, subtract the annual inflation rate from your nominal APY. If your account earns a 5.65% APY and inflation averages 2.50%, your real purchasing power return is 3.15%."
              },
              {
                q: "What is the difference between APR and APY?",
                a: "Annual Percentage Rate (APR) is the simple annual interest rate without taking compounding into account. Annual Percentage Yield (APY) incorporates the effect of compounding frequency, reflecting the true annual percentage earned on your deposit. APY is always equal to or higher than APR."
              },
              {
                q: "Can interest rates on high-yield savings accounts change over time?",
                a: "Yes. High-yield savings accounts carry variable interest rates that fluctuate based on target federal funds rate adjustments set by the Federal Reserve. Conversely, Certificates of Deposit (CDs) lock in a fixed interest rate for a specific term length (e.g., 12 or 60 months)."
              },
              {
                q: "Are there penalties for withdrawing funds from a Certificate of Deposit (CD) early?",
                a: "Yes. Withdrawing principal or interest from a standard CD before its maturity date incurs an early withdrawal penalty, usually calculated as a set number of days or months of simple interest (e.g., 90 days or 180 days of interest)."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. PAYMENT CALCULATOR MODULE
 * ========================================================================== */
export const US_USURY_REGULATION_LIST = [
  { state: 'Alabama', limit: '8.00% (Legal rate without contract)', authority: 'AL State Banking Department', framework: 'Contractual rates allowed with disclosure' },
  { state: 'Alaska', limit: '10.50% (5% above Fed discount rate)', authority: 'AK Division of Banking & Securities', framework: 'Statutory caps on unwritten credit' },
  { state: 'Arizona', limit: '10.00% (Unwritten contracts)', authority: 'AZ Dept of Insurance and Financial Institutions', framework: 'Flexible contractual rates permitted' },
  { state: 'Arkansas', limit: '17.00% Constitutional Cap', authority: 'AR State Bank Department', framework: 'Strict constitutional usury enforcement' },
  { state: 'California', limit: '10.00% (Personal/consumer loans)', authority: 'CA Dept of Financial Protection and Innovation', framework: 'Exemptions for licensed lenders/banks' },
  { state: 'Colorado', limit: '45.00% Consumer Credit Code cap', authority: 'CO Attorney General - Consumer Credit', framework: 'Uniform Consumer Credit Code guidelines' },
  { state: 'Connecticut', limit: '12.00% Statutory civil usury cap', authority: 'CT Department of Banking', framework: 'Strict rate caps on unlicensed lenders' },
  { state: 'Delaware', limit: '5.00% above Fed discount rate', authority: 'DE Office of State Bank Commissioner', framework: 'Flexible banking hub rate structures' },
  { state: 'Florida', limit: '18.00% (Loans under $500k)', authority: 'FL Office of Financial Regulation', framework: 'Criminal usury applies above 25%' },
  { state: 'Georgia', limit: '7.00% (Legal rate without contract)', authority: 'GA Office of Commissioner of Insurance', framework: '16% cap on loans under $3,000' },
  { state: 'Hawaii', limit: '10.00% Statutory consumer limit', authority: 'HI Division of Financial Institutions', framework: 'Credit extension rate protections' },
  { state: 'Idaho', limit: '12.00% Statutory default limit', authority: 'ID Department of Finance', framework: 'Contractual rates allowed with disclosure' },
  { state: 'Illinois', limit: '9.00% Statutory limit (36% PLPA)', authority: 'IL Dept of Financial & Professional Regulation', framework: 'Predatory Loan Prevention Act caps' },
  { state: 'Indiana', limit: '8.00% Default statutory cap', authority: 'IN Department of Financial Institutions', framework: 'UCCC regulated consumer loan rates' },
  { state: 'Iowa', limit: '5.00% Statutory baseline rate', authority: 'IA Division of Banking', framework: 'Iowa Consumer Credit Code protections' },
  { state: 'Kansas', limit: '10.00% Default usury limit', authority: 'KS Office of State Bank Commissioner', framework: 'UCCC consumer credit limits' },
  { state: 'Kentucky', limit: '8.00% (Loans under $15,000)', authority: 'KY Department of Financial Institutions', framework: 'Statutory limits on small consumer credit' },
  { state: 'Louisiana', limit: '12.00% Legal interest rate limit', authority: 'LA Office of Financial Institutions', framework: 'Louisiana Consumer Credit Law' },
  { state: 'Maine', limit: '6.00% Default statutory limit', authority: 'ME Bureau of Consumer Credit Protection', framework: '36% APR cap on small consumer loans' },
  { state: 'Maryland', limit: '6.00% (Unwritten) / 24% contract', authority: 'MD Office of Commissioner of Financial Regulation', framework: 'Strict small loan regulatory caps' },
  { state: 'Massachusetts', limit: '20.00% Criminal usury threshold', authority: 'MA Division of Banks', framework: 'Small Loan Law rate restrictions' },
  { state: 'Michigan', limit: '5.00% (Legal) / 7.00% (Contract)', authority: 'MI Dept of Insurance & Financial Services', framework: 'Regulatory Loan Act rules' },
  { state: 'Minnesota', limit: '6.00% Legal statutory rate limit', authority: 'MN Department of Commerce', framework: 'Regulated Loan Act consumer protections' },
  { state: 'Mississippi', limit: '8.00% Default legal interest cap', authority: 'MS Dept of Banking & Consumer Finance', framework: 'Small Loan Regulatory Act schedules' },
  { state: 'Missouri', limit: '9.00% Legal baseline rate limit', authority: 'MO Division of Finance', framework: 'Contractual rate disclosures required' },
  { state: 'Montana', limit: '10.00% Statutory legal limit', authority: 'MT Division of Banking & Financial Institutions', framework: '36% voter-approved cap on small loans' },
  { state: 'Nebraska', limit: '6.00% Statutory legal baseline', authority: 'NE Department of Banking and Finance', framework: '36% voter-approved small loan cap' },
  { state: 'Nevada', limit: 'Market rate with clear disclosures', authority: 'NV Financial Institutions Division', framework: 'Clear contract rate rules' },
  { state: 'New Hampshire', limit: '10.00% Statutory legal rate limit', authority: 'NH Banking Department', framework: '36% APR cap on small consumer credit' },
  { state: 'New Jersey', limit: '30.00% Criminal usury limit', authority: 'NJ Department of Banking and Insurance', framework: 'Consumer Finance Licensing Act rules' },
  { state: 'New Mexico', limit: '15.00% Statutory default rate', authority: 'NM Financial Institutions Division', framework: '36% APR cap under HB 132' },
  { state: 'New York', limit: '16.00% Civil / 25.00% Criminal cap', authority: 'NY Department of Financial Services', framework: 'Strict statutory usury enforcement' },
  { state: 'North Carolina', limit: '8.00% Statutory legal rate limit', authority: 'NC Commissioner of Banks', framework: 'Consumer Finance Act rate limits' },
  { state: 'North Dakota', limit: '5.50% above Fed discount rate', authority: 'ND Department of Financial Institutions', framework: 'Consumer finance lending limits' },
  { state: 'Ohio', limit: '8.00% Legal rate without contract', authority: 'OH Division of Financial Institutions', framework: 'Ohio Small Loan Law protections' },
  { state: 'Oklahoma', limit: '6.00% Statutory legal baseline', authority: 'OK Department of Consumer Credit', framework: 'Uniform Consumer Credit Code schedule' },
  { state: 'Oregon', limit: '9.00% Default statutory legal rate', authority: 'OR Division of Financial Regulation', framework: '36% APR cap on small consumer loans' },
  { state: 'Pennsylvania', limit: '6.00% Statutory cap under CFTAPA', authority: 'PA Department of Banking and Securities', framework: 'Consumer Discount Company Act caps' },
  { state: 'Rhode Island', limit: '12.00% Statutory civil usury cap', authority: 'RI Department of Business Regulation', framework: 'Small loan licensing protections' },
  { state: 'South Carolina', limit: 'Fixed rate disclosure requirements', authority: 'SC Department of Consumer Affairs', framework: 'Consumer Protection Code guidelines' },
  { state: 'South Dakota', limit: '36.00% Voter-approved cap', authority: 'SD Division of Banking', framework: 'Money Lending license limits' },
  { state: 'Tennessee', limit: 'Formula rate (4% above prime)', authority: 'TN Dept of Financial Institutions', framework: 'Flexible statutory rate limits' },
  { state: 'Texas', limit: '6.00% Legal / Tiered Finance Code', authority: 'TX Office of Consumer Credit Commissioner', framework: 'OCCC regulated loan rate schedules' },
  { state: 'Utah', limit: 'Contractual rate market rules', authority: 'UT Dept of Financial Institutions', framework: 'Consumer Credit Code protections' },
  { state: 'Vermont', limit: '12.00% Statutory usury limit', authority: 'VT Dept of Financial Regulation', framework: 'Small Loan Act regulations' },
  { state: 'Virginia', limit: '6.00% Statutory / 36% cap', authority: 'VA State Corporation Commission', framework: 'Bureau of Financial Institutions rules' },
  { state: 'Washington', limit: '12.00% Civil usury statutory limit', authority: 'WA Department of Financial Institutions', framework: 'Consumer Loan Act regulations' },
  { state: 'West Virginia', limit: '6.00% Statutory legal limit', authority: 'WV Division of Financial Institutions', framework: 'Consumer Credit and Protection Act' },
  { state: 'Wisconsin', limit: '5.00% Default legal interest cap', authority: 'WI Dept of Financial Institutions', framework: 'Wisconsin Consumer Act guidelines' },
  { state: 'Wyoming', limit: '7.00% Statutory legal baseline', authority: 'WY Division of Banking', framework: 'Uniform Consumer Credit Code' }
];

export function PaymentCalculatorModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    mode: 'solve_payment' as 'solve_payment' | 'solve_loan',
    amount: 508763,
    annualRate: 7.0,
    termYears: 10,
    frequency: 'biweekly' as 'monthly' | 'biweekly' | 'weekly',
    extraPayment: 0
  });

  const res = useMemo(() => calculatePayment(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Goal Mode</span>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button 
                  type="button" 
                  onClick={() => setParams({...params, mode: 'solve_payment', amount: 508763})}
                  className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.mode === 'solve_payment' ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
                >
                  Find Payment
                </button>
                <button 
                  type="button" 
                  onClick={() => setParams({...params, mode: 'solve_loan', amount: 2723})}
                  className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.mode === 'solve_loan' ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
                >
                  Find Loan Size
                </button>
              </div>
            </div>

            <InputGroup 
              label={params.mode === 'solve_payment' ? "Loan Amount" : "Target Periodic Payment"} 
              value={params.amount} 
              prefix={currency.symbol} 
              onChange={(v: number) => setParams({...params, amount: v})} 
            />

            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Interest Rate" value={params.annualRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, annualRate: v})} />
              <InputGroup label="Term" value={params.termYears} suffix="yrs" onChange={(v: number) => setParams({...params, termYears: v})} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="payment-freq-select" className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Payment Frequency</label>
              <select 
                id="payment-freq-select"
                value={params.frequency}
                onChange={e => setParams({...params, frequency: e.target.value as any})}
                className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {params.mode === 'solve_payment' && (
              <InputGroup label="Extra Principal / Period" value={params.extraPayment} prefix={currency.symbol} onChange={(v: number) => setParams({...params, extraPayment: v})} />
            )}
          </GlassCard>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label={`${res.frequencyLabel} Payment`} 
              value={format(res.periodicPayment)} 
              subtext={params.mode === 'solve_payment' ? "Required periodic obligation" : "Affordable target payment"} 
              icon={RefreshCw} 
              color="bg-rose-600" 
            />
            <MetricCard 
              label={params.mode === 'solve_payment' ? "Loan Principal" : "Affordable Loan Amount"} 
              value={format(res.loanAmount)} 
              subtext="Total principal balance" 
              icon={Wallet} 
              color="bg-indigo-600" 
            />
            <MetricCard 
              label="Total Interest" 
              value={format(res.totalInterest)} 
              subtext="Over the entire term" 
              icon={Landmark} 
              color="bg-slate-800 dark:bg-slate-700" 
            />
          </div>

          <GlassCard className="p-6 lg:p-8 space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Payment Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64" aria-label="Payment Breakdown Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie 
                      data={[
                        { name: 'Principal Loan', value: res.loanAmount, color: '#4f46e5' },
                        { name: 'Total Interest', value: res.totalInterest, color: '#f43f5e' }
                      ]} 
                      innerRadius={65} 
                      outerRadius={85} 
                      paddingAngle={8} 
                      dataKey="value"
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Cumulative Payments:</span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{format(res.totalPayment)}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total money paid back to lender including all interest fees.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {res.schedule && res.schedule.length > 0 && (
            <ExpandableSchedule 
              data={res.schedule}
              columns={[
                { key: 'period', label: `${res.frequencyLabel} #` },
                { key: 'payment', label: 'Payment', format },
                { key: 'principal', label: 'Principal', format },
                { key: 'interest', label: 'Interest', format },
                { key: 'totalInterest', label: 'Total Interest', format },
                { key: 'balance', label: 'Ending Balance', format }
              ]}
            />
          )}
        </div>
      </div>

      {/* COMPREHENSIVE EDUCATIONAL GUIDE & AFFORDABILITY BENCHMARKS */}
      <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Payment &amp; Affordability Calculator: How to Estimate Periodic Payments and Maximum Loan Eligibility
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            <strong>Bottom Line Up Front (BLUF):</strong> Calculating loan affordability requires evaluating the mathematical relationship between periodic payment frequency (monthly, bi-weekly, or weekly), interest compounding, and total borrowing capacity. On a $508,763 loan principal at a 7.00% annual interest rate over a 10-year term with bi-weekly payments (26 payments per year), your required periodic payment equals $2,723. Over the 260 total payment periods, cumulative payments equal $708,094—comprising $508,763 in repaid principal and $199,331 in total interest charges. Switching to accelerated bi-weekly or weekly payment schedules reduces total lifetime interest expenses and shortens repayment horizons compared to standard monthly schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Understanding Periodic Payment Schedules and Affordability</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Whether financing real estate, personal debt consolidation, or commercial equipment, loan agreements structure payments across specific time intervals. Lenders evaluate borrowing eligibility based on debt-to-income (DTI) thresholds, interest compounding mechanics, and installment frequencies.
            </p>
            <div className="space-y-1 text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div className="font-bold text-indigo-600 dark:text-indigo-400">Total Out-of-Pocket Debt Obligation</div>
              <div>├── Loan Principal: The baseline capital sum borrowed from the lender</div>
              <div>├── Total Interest Charges: Accrued interest calculated over the loan term</div>
              <div>└── Periodic Installment: Fixed payment made monthly, bi-weekly, or weekly</div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Key Financial Metrics Defined</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong>Goal Mode (Find Payment vs. Find Loan Size):</strong> Dual calculation modes allowing users to compute the required installment for a known loan amount or solve for maximum affordable borrowing capacity based on a target budget.</li>
              <li><strong>Payment Frequency:</strong> The schedule at which installments are made—Monthly (12/yr), Bi-Weekly (26/yr), or Weekly (52/yr).</li>
              <li><strong>Required Periodic Obligation ($2,723):</strong> The fixed dollar amount owed during each payment cycle to fully amortize the loan by the target maturity date.</li>
              <li><strong>Total Principal Balance ($508,763):</strong> The original net sum financed through the credit agreement.</li>
              <li><strong>Cumulative Payments ($708,094):</strong> The total dollar amount remitted over the entire loan life (Principal + Interest).</li>
              <li><strong>Total Interest Paid ($199,331):</strong> The cumulative financing cost charged by the lender over the 10-year term.</li>
            </ul>
          </GlassCard>
        </div>

        {/* How Payment Frequencies Impact Lifetime Interest Charges */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">How Payment Frequencies Impact Lifetime Interest Charges</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Choosing between monthly, bi-weekly, and weekly payment schedules alters the rate at which principal decreases, directly impacting cumulative interest accrual:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-base block">1. Monthly Payments (12 Payments / Year)</span>
              <p className="leading-relaxed">
                Standard monthly amortization calculates interest on the remaining principal balance 12 times per year. Payments remain identical each month, spreading balance reduction evenly across the year.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-indigo-200 dark:border-indigo-800">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 text-base block">2. Bi-Weekly Payments (26 Payments / Year)</span>
              <p className="leading-relaxed">
                Bi-weekly schedules divide the year into 26 equal payment periods (every two weeks). Because there are 52 weeks in a year, bi-weekly schedules result in 26 half-payments—the equivalent of 13 full monthly payments per year. This extra annual payment reduces principal faster and shortens overall payoff timelines.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-base block">3. Weekly Payments (52 Payments / Year)</span>
              <p className="leading-relaxed">
                Weekly payment schedules divide the year into 52 equal installments. Making 52 weekly payments continuously reduces the principal balance, slightly lowering total interest costs compared to monthly payments.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Payment Frequency Comparison Table ($508,763 Principal at 7.00% Interest over 10 Years)
            </h5>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm" aria-label="Payment Frequency Comparison Table">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  <tr>
                    <th scope="col" className="px-4 py-3">Payment Frequency</th>
                    <th scope="col" className="px-4 py-3">Payments per Year</th>
                    <th scope="col" className="px-4 py-3">Periodic Payment Amount</th>
                    <th scope="col" className="px-4 py-3">Total Payments Made</th>
                    <th scope="col" className="px-4 py-3">Cumulative Outlay</th>
                    <th scope="col" className="px-4 py-3">Total Interest Paid</th>
                    <th scope="col" className="px-4 py-3">Interest Savings vs. Monthly</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Monthly (12/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">12</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">$5,907</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">120</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$708,867</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">$200,104</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">Baseline</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors bg-indigo-50/40 dark:bg-indigo-950/20">
                    <td className="px-4 py-3 font-bold text-indigo-700 dark:text-indigo-300">Bi-Weekly (26/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">26</td>
                    <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold">$2,723</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">260</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$708,094</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">$199,331</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">$773 Saved</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Weekly (52/yr)</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">52</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-bold">$1,361</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">520</td>
                    <td className="px-4 py-3 font-black text-slate-900 dark:text-white">$707,935</td>
                    <td className="px-4 py-3 text-rose-600 dark:text-rose-400 font-bold">$199,172</td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">$932 Saved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* The Mathematics of Loan Payment and Affordability Formulas */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">The Mathematics of Loan Payment and Affordability Formulas</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Loan payment calculations use time-value-of-money formulas based on interest rates, compounding frequency, and loan duration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white text-base">1. Solving for Periodic Payment (PMT)</div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl text-center space-y-1 shadow-sm border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Standard Amortization Formula</div>
                <div className="font-mono font-bold text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                  PMT = P • [ i(1 + i)ⁿ ] / [ (1 + i)ⁿ - 1 ]
                </div>
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1 font-mono">
                <div>P = Loan Principal Amount ($508,763)</div>
                <div>i = Periodic Interest Rate (Annual Rate ÷ Periods per Year = 0.07 ÷ 26 = 0.00269230769)</div>
                <div>n = Total Number of Payment Periods (10 Years × 26 = 260 Periods)</div>
              </div>
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl space-y-3 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 text-base">2. Solving for Maximum Loan Principal (P) — Affordability Mode</div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl text-center space-y-1 shadow-sm border border-indigo-200 dark:border-indigo-800">
                <div className="text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">Borrowing Capacity Inversion Formula</div>
                <div className="font-mono font-bold text-sm sm:text-base text-indigo-600 dark:text-indigo-400">
                  P = PMT • [ (1 + i)ⁿ - 1 ] / [ i(1 + i)ⁿ ]
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                This inverse formula calculates maximum borrowing capacity based on a user's target periodic budget (PMT), interest rate (i), and loan term (n).
              </p>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1 font-mono">
                <div>P = Maximum Loan Principal Amount</div>
                <div>PMT = Target Periodic Installment Budget ($2,723)</div>
                <div>i = Periodic Interest Rate (0.07 ÷ 26 = 0.00269230769)</div>
                <div>n = Total Payment Periods (10 × 26 = 260)</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="font-bold text-base text-slate-900 dark:text-white">Amortization Balance Progression (10-Year Bi-Weekly Term)</div>
            <div className="space-y-1 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-mono text-xs sm:text-sm">
              <div>├── Year 1 (Period 26):   High Balance ($471,085)  ──► High Interest Share ($34,171)</div>
              <div>├── Year 5 (Period 130):  Midpoint Balance ($290,140) ──► Balanced Division</div>
              <div>└── Year 10 (Period 260): Zero Balance ($0)          ──► Final Principal Settlement</div>
            </div>
          </div>
        </GlassCard>

        {/* U.S. Lending Regulations and Borrower Affordability Guidelines */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">U.S. Lending Regulations and Borrower Affordability Guidelines</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When applying for loans in the United States, federal underwriting standards and debt guidelines govern borrowing limits:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-700">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">1. Debt-to-Income (DTI) Ratios</h5>
              <p className="leading-relaxed">
                Lenders evaluate creditworthiness using two primary Debt-to-Income (DTI) ratios:
              </p>
              <ul className="space-y-2 list-disc pl-5 leading-relaxed">
                <li><strong>Front-End DTI Ratio (Housing/Primary Debt):</strong> Measures the percentage of gross monthly income allocated toward housing or primary loan payments. Standard guidelines recommend keeping front-end DTI at or below 28%.</li>
                <li><strong>Back-End DTI Ratio (Total Debt Obligations):</strong> Measures total monthly debt payments (housing + student loans + car payments + credit cards) against gross monthly income. Most conventional underwriting caps back-end DTI at 36% to 43%.</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 border border-slate-200 dark:border-slate-700">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">2. Truth in Lending Act (TILA) &amp; Regulation Z Disclosures</h5>
              <p className="leading-relaxed">
                Under Federal Regulation Z (12 CFR Part 1026), lenders must disclose four standardized metrics before loan execution:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs sm:text-sm">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Annual Percentage Rate (APR)</span>
                  <span className="text-slate-600 dark:text-slate-400">Total cost of credit as a yearly rate, including interest &amp; upfront fees.</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block">Finance Charge</span>
                  <span className="text-slate-600 dark:text-slate-400">The total dollar amount the credit will cost over the term.</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-blue-600 dark:text-blue-400 block">Amount Financed</span>
                  <span className="text-slate-600 dark:text-slate-400">The net amount of credit provided to the borrower.</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Total of Payments</span>
                  <span className="text-slate-600 dark:text-slate-400">The total amount paid after making all scheduled payments.</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Complete 50-State Mortgage and Personal Loan Usury Limits */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Complete 50-State Mortgage and Personal Loan Usury Limits
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Interest rate caps and usury laws vary across all 50 U.S. states. Use the reference table below to review regulatory frameworks and statutory limits across jurisdictions.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              All 50 U.S. States Interest Rate Regulations Overview
            </h5>
            <div className="overflow-x-auto max-h-[440px] border border-slate-200 dark:border-slate-700 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm" aria-label="All 50 U.S. States Interest Rate Regulations Overview">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3">State</th>
                    <th scope="col" className="px-4 py-3">Statutory Usury Rate Limit</th>
                    <th scope="col" className="px-4 py-3">State Financial Regulatory Body</th>
                    <th scope="col" className="px-4 py-3">Primary Lending Framework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {US_USURY_REGULATION_LIST.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="px-4 py-2 font-bold text-slate-900 dark:text-white">{row.state}</td>
                      <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400 font-bold">{row.limit}</td>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{row.authority}</td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.framework}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        {/* Step-by-Step Mathematical Calculation Walkthrough */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Step-by-Step Mathematical Calculation Walkthrough
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Using the parameters from the calculator setup ($508,763 Loan Amount, 7.00% Interest Rate, 10-Year Term, Bi-Weekly Schedule), here is the step-by-step mathematical breakdown:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-2">Calculation Inputs:</div>
              <div>• Loan Principal Financed (P):        $508,763.00</div>
              <div>• Quoted Annual Interest Rate (r):     7.00% (0.07 per year)</div>
              <div>• Loan Duration (t):                   10 Years</div>
              <div>• Payment Frequency (n):               Bi-Weekly (26 Periods / Year)</div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Step 1: Calculate Periodic Interest Rate (i)</div>
                <div>i = Annual Interest Rate / Periods per Year</div>
                <div>i = 0.07 / 26 = 0.00269230769 per period</div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Step 2: Calculate Total Payment Periods (n_total)</div>
                <div>n_total = Years × Periods per Year</div>
                <div>n_total = 10 × 26 = 260 Periods</div>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl space-y-2 border border-indigo-200 dark:border-indigo-800">
              <div className="space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Step 3: Calculate Periodic Payment (PMT)</div>
                <div>PMT = $508,763 × [0.00269230769 × (1 + 0.00269230769)^260] / [(1 + 0.00269230769)^260 - 1]</div>
                <div>PMT = $508,763 × [0.00269230769 × 2.0102919] / [2.0102919 - 1]</div>
                <div>PMT = $508,763 × 0.00541232 / 1.0102919</div>
                <div className="font-bold text-indigo-700 dark:text-indigo-300">PMT = $2,723.44 per period (Rounded to $2,723)</div>
              </div>
              <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 space-y-1">
                <div className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Step 4: Calculate Cumulative Outlay and Total Interest</div>
                <div>Total Outlay = 260 Payments × $2,723.4402 = $708,094.45</div>
                <div>Total Interest = $708,094.45 - $508,763.00 = $199,331.45</div>
              </div>
              <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 font-bold text-emerald-700 dark:text-emerald-400">
                <div>Final Calculation Summary:</div>
                <div>• Required Bi-Weekly Payment:          $2,723.00</div>
                <div>• Net Financed Principal:              $508,763.00</div>
                <div>• Total Cumulative Interest Paid:      $199,331.00</div>
                <div>• Total Cumulative Outlay:             $708,094.00</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 5 Practical Strategies to Maximize Borrowing Affordability */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            5 Practical Strategies to Maximize Borrowing Affordability
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">1. Opt for Bi-Weekly or Weekly Payment Schedules</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Making bi-weekly payments results in 26 half-payments per year—the equivalent of 13 full monthly payments. This extra annual contribution accelerates principal reduction and lowers cumulative interest costs.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">2. Improve Credit Tier Prior to Application</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Lenders assign interest rates based on credit score bands. Raising a credit score from 660 to 740 can reduce interest rates by 1.5% to 2.5%, saving tens of thousands of dollars on long-term loan agreements.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">3. Keep Total Debt-to-Income (DTI) Below 36%</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Maintaining a conservative DTI ratio ensures monthly debt obligations remain manageable relative to gross earnings, improving financial stability and lender approval odds.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">4. Make Optional Extra Principal Contributions</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Applying extra payments directly toward principal bypasses interest charges, reducing the outstanding balance used to calculate subsequent interest fees.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 md:col-span-2">
              <h5 className="font-bold text-slate-900 dark:text-white text-base">5. Shop Multiple Lenders for Rate Disclosures</h5>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Requesting loan estimates from banks, credit unions, and online lenders allows borrowers to compare Annual Percentage Rates (APR) and upfront fee structures to secure optimal financing terms.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* FAQs */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h4>
          <div className="space-y-4">
            {[
              {
                q: "What is the difference between simple interest and compound interest on loans?",
                a: "Simple interest calculates interest charges solely on the remaining principal balance. Compound interest calculates interest on both the principal balance and accrued unpaid interest. Most consumer loans (auto, mortgage, personal loans) use simple interest calculated on a daily or monthly basis."
              },
              {
                q: "How does changing payment frequency from monthly to bi-weekly reduce interest?",
                a: "Switching to bi-weekly payments means making 26 half-payments per year, which equals 13 full monthly payments annually. This extra payment goes directly toward principal reduction, shortening the overall loan duration and lowering cumulative interest charges."
              },
              {
                q: "What is the difference between nominal interest rate and APR?",
                a: "The nominal interest rate is the base percentage charged on borrowed funds. The Annual Percentage Rate (APR) reflects the true annual cost of credit, incorporating the nominal interest rate alongside mandatory upfront lender fees (e.g., origination fees, processing charges)."
              },
              {
                q: "How does a shorter loan term affect monthly payments and total interest?",
                a: "Shorter loan terms (e.g., 5 years vs. 10 years) require higher periodic payments because principal is repaid faster. However, shorter terms dramatically reduce total interest expenses because interest accrues over fewer billing cycles."
              },
              {
                q: "What happens if I make a lump-sum principal prepayment?",
                a: "Making a lump-sum principal prepayment reduces your remaining balance immediately. On standard simple-interest loans, this lowers future interest charges and shortens the remaining loan term without changing the required periodic payment amount unless the loan is formally re-amortized (re-casted)."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 5. AMORTIZATION CALCULATOR MODULE
 * ========================================================================== */
export function AmortizationModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    loanAmount: 320000,
    rate: 6.75,
    termYears: 30,
    startDate: '2026-10',
    extraMonthly: 100
  });

  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');

  const res = useMemo(() => calculateMortgage({
    homePrice: params.loanAmount,
    downPayment: 0,
    annualRate: params.rate,
    termYears: params.termYears,
    startDate: params.startDate,
    extraMonthly: params.extraMonthly
  }), [params]);

  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Calculator size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" /> Amortization Engine
          </h3>
          <InputGroup label="Original Loan Principal" value={params.loanAmount} prefix={currency.symbol} onChange={(v: number) => setParams({...params, loanAmount: v})} />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Interest Rate" value={params.rate} suffix="%" step="0.05" onChange={(v: number) => setParams({...params, rate: v})} />
            <InputGroup label="Loan Term" value={params.termYears} suffix="yrs" onChange={(v: number) => setParams({...params, termYears: v})} />
          </div>
          <StartDatePicker 
            value={params.startDate} 
            onChange={(v: string) => setParams({...params, startDate: v})} 
            termYears={params.termYears}
            payoffDate={res.payoffDate}
            firstPaymentDate={res.firstPaymentDate}
          />
          <InputGroup label="Extra Monthly Principal" value={params.extraMonthly} prefix={currency.symbol} onChange={(v: number) => setParams({...params, extraMonthly: v})} />
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Monthly P&I" value={format(res.monthlyPI)} subtext="Standard monthly installment" icon={Wallet} color="bg-blue-600" />
          <MetricCard label="Total Interest" value={format(res.totalInterest)} subtext="Total interest paid" icon={Landmark} color="bg-rose-600" />
          <MetricCard 
            label="Payoff Date" 
            value={res.payoffDate} 
            subtext={params.extraMonthly > 0 ? `${res.yearsSaved} yrs early! (${res.payoffMonth} payments)` : `Full term: ${res.payoffDate}`} 
            icon={Zap} 
            color="bg-emerald-600" 
          />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Principal vs Interest Trend</h4>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {res.firstPaymentDate} – {res.payoffDate}
            </span>
          </div>
          <div className="h-72" aria-label="Amortization Trend Chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={res.yearlySchedule}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="dateLabel" tickFormatter={y => `${y}`} fontSize={11} stroke="#64748b" />
                <YAxis hide />
                <ReTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  labelFormatter={(val) => `Date Period: ${val}`}
                />
                <Area type="monotone" dataKey="principal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} name="Principal Paid" />
                <Area type="monotone" dataKey="interest" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} name="Interest Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Amortization Schedule ({res.firstPaymentDate} – {res.payoffDate})
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {scheduleView === 'yearly' ? `${res.yearlySchedule.length} Calendar Years` : `${res.schedule.length} Monthly Payments`}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={() => setScheduleView('yearly')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                  scheduleView === 'yearly' ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"
                )}
              >
                Annual
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500",
                  scheduleView === 'monthly' ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"
                )}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            {scheduleView === 'yearly' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 sticky top-0">
                  <tr>
                    <th className="p-3.5">Calendar Year</th>
                    <th className="p-3.5">Date Period</th>
                    <th className="p-3.5">Principal Paid</th>
                    <th className="p-3.5">Interest Paid</th>
                    <th className="p-3.5">Cumul. Interest</th>
                    <th className="p-3.5">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-medium">
                  {res.yearlySchedule.map((row: any) => (
                    <tr key={row.year} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{row.year}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{row.dateRange}</td>
                      <td className="p-3.5 text-emerald-700 dark:text-emerald-400 font-bold">{format(row.principal)}</td>
                      <td className="p-3.5 text-rose-600 dark:text-rose-400 font-bold">{format(row.interest)}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{format(row.totalInterest)}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{format(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300 sticky top-0">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Principal</th>
                    <th className="p-3">Interest</th>
                    <th className="p-3">Extra</th>
                    <th className="p-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
                  {res.schedule.map((row: any) => (
                    <tr key={row.month} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">#{row.month}</td>
                      <td className="p-3 font-bold text-indigo-700 dark:text-indigo-300">{row.dateStr}</td>
                      <td className="p-3 text-emerald-700 dark:text-emerald-400 font-bold">{format(row.principal)}</td>
                      <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{format(row.interest)}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{row.appliedExtra > 0 ? `+${format(row.appliedExtra)}` : '—'}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{format(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 6. INFLATION CALCULATOR MODULE
 * ========================================================================== */
export function InflationModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    amount: 10000,
    rate: 3.2,
    years: 15
  });

  const res = useMemo(() => calculateInflation(params.amount, params.rate, params.years), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Compass size={20} className="text-orange-500" aria-hidden="true" /> Inflation Simulator
          </h3>
          <InputGroup label="Current Amount" value={params.amount} prefix={currency.symbol} onChange={(v: number) => setParams({...params, amount: v})} />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Annual Inflation" value={params.rate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, rate: v})} />
            <InputGroup label="Years Ahead" value={params.years} suffix="yrs" onChange={(v: number) => setParams({...params, years: v})} />
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Future Equivalent Cost" value={format(res.futureValue)} subtext={`What takes ${format(params.amount)} today`} icon={TrendingUp} color="bg-orange-500" />
          <MetricCard label="Purchasing Power" value={format(res.purchasingPower)} subtext={`Value of today's ${format(params.amount)}`} icon={Zap} color="bg-rose-600" />
          <MetricCard label="Purchasing Power Loss" value={`-${((1 - res.purchasingPower / params.amount) * 100).toFixed(1)}%`} subtext="Loss in real wealth" icon={ShieldAlert} color="bg-slate-800 dark:bg-slate-700" />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Purchasing Power Erosion</h4>
          <div className="h-72" aria-label="Purchasing Power Erosion Chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={res.timeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="year" tickFormatter={y => `Yr ${y}`} fontSize={11} stroke="#64748b" />
                <YAxis hide />
                <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="futureCost" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="Equivalent Future Cost" />
                <Area type="monotone" dataKey="purchasingPower" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Diminishing Real Value" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 7. FINANCE TVM MODULE
 * ========================================================================== */
export function FinanceTVMModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    solveFor: 'fv' as 'pv' | 'fv' | 'pmt' | 'periods',
    pv: -10000,
    fv: 25000,
    pmt: -200,
    annualRate: 6.5,
    periods: 60
  });

  const res = useMemo(() => calculateFinanceTVM(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <CircleDollarSign size={20} className="text-slate-800 dark:text-slate-200" aria-hidden="true" /> TVM Time-Value Solver
          </h3>
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Solve For</span>
            <div className="grid grid-cols-2 gap-2">
              {(['fv', 'pv', 'pmt', 'periods'] as const).map(target => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setParams({...params, solveFor: target})}
                  className={cn(
                    "min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    params.solveFor === target ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {target.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {params.solveFor !== 'pv' && (
            <InputGroup label="Present Value (PV)" value={params.pv} prefix={currency.symbol} onChange={(v: number) => setParams({...params, pv: v})} />
          )}
          {params.solveFor !== 'pmt' && (
            <InputGroup label="Payment (PMT)" value={params.pmt} prefix={currency.symbol} onChange={(v: number) => setParams({...params, pmt: v})} />
          )}
          {params.solveFor !== 'fv' && (
            <InputGroup label="Future Value (FV)" value={params.fv} prefix={currency.symbol} onChange={(v: number) => setParams({...params, fv: v})} />
          )}
          {params.solveFor !== 'periods' && (
            <InputGroup label="Total Periods (N - Months)" value={params.periods} onChange={(v: number) => setParams({...params, periods: v})} />
          )}
          <InputGroup label="Annual Rate (I/Y)" value={params.annualRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, annualRate: v})} />
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard 
            label={`Computed ${params.solveFor.toUpperCase()}`} 
            value={params.solveFor === 'periods' ? `${Math.round(res.solvedValue)} Periods` : format(res.solvedValue)} 
            subtext="Exact mathematical TVM resolution" 
            icon={Calculator} 
            color="bg-slate-900 dark:bg-slate-700" 
          />
          <MetricCard 
            label="Interest Rate" 
            value={`${params.annualRate}%`} 
            subtext={`${(params.annualRate / 12).toFixed(3)}% effective per monthly period`} 
            icon={TrendingUp} 
            color="bg-blue-600" 
          />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">TVM Cashflow Analysis</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Based on the standard Time Value of Money cashflow convention:
            outflows (investments/payments) are negative values while inflows (cash returned/future value) are positive.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">PV</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{params.solveFor === 'pv' ? format(res.solvedValue) : format(params.pv)}</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">PMT</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{params.solveFor === 'pmt' ? format(res.solvedValue) : format(params.pmt)}</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">FV</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{params.solveFor === 'fv' ? format(res.solvedValue) : format(params.fv)}</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">N (Months)</span>
              <p className="text-base font-black text-slate-900 dark:text-white">{params.solveFor === 'periods' ? Math.round(res.solvedValue) : params.periods}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 8. INCOME TAX CALCULATOR MODULE (US JURISDICTION ONLY)
 * ========================================================================== */
export function IncomeTaxModule({ currency }: { currency: any }) {
  const [year, setYear] = useState<number>(2024);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single');
  const [stateCode, setStateCode] = useState<string>('CA');
  const [annualIncome, setAnnualIncome] = useState<number>(95000);
  const [preTax401k, setPreTax401k] = useState<number>(6000);
  const [preTaxHsaFsa, setPreTaxHsaFsa] = useState<number>(0);
  const [useCustomDeduction, setUseCustomDeduction] = useState<boolean>(false);
  const [customDeduction, setCustomDeduction] = useState<number>(14600);

  // Auto-sync standard deduction when year or filing status changes
  useEffect(() => {
    const yrConfig = US_TAX_CONFIG_BY_YEAR[year] || US_TAX_CONFIG_BY_YEAR[2024];
    const std = yrConfig.standardDeduction[filingStatus]?.value || 14600;
    if (!useCustomDeduction) {
      setCustomDeduction(std);
    }
  }, [year, filingStatus, useCustomDeduction]);

  const taxResult = useMemo(() => {
    return calculateComprehensiveTax({
      annualIncome,
      year,
      filingStatus,
      stateCode,
      preTax401k,
      preTaxHsaFsa,
      itemizedDeductions: useCustomDeduction ? customDeduction : undefined
    });
  }, [annualIncome, year, filingStatus, stateCode, preTax401k, preTaxHsaFsa, useCustomDeduction, customDeduction]);

  const format = (v: number) => `$${new Intl.NumberFormat().format(Math.round(v))}`;
  const formatDetailed = (v: number) => `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;

  const chartData = [
    { name: 'Take-Home Pay', value: taxResult.netTakeHome, color: '#10b981' },
    { name: 'Federal Income Tax', value: taxResult.federalTax, color: '#ef4444' },
    { name: 'FICA (SS & Medicare)', value: taxResult.ficaTax, color: '#f59e0b' },
    ...(taxResult.stateTax > 0 ? [{ name: `${taxResult.stateCode} State Tax`, value: taxResult.stateTax, color: '#6366f1' }] : []),
    ...(preTax401k > 0 ? [{ name: 'Pre-Tax 401(k)', value: preTax401k, color: '#06b6d4' }] : []),
    ...(preTaxHsaFsa > 0 ? [{ name: 'Pre-Tax HSA/FSA', value: preTaxHsaFsa, color: '#14b8a6' }] : []),
  ];

  const stateCfg = getStateConfig(stateCode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Interactive Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400" aria-hidden="true" /> US Income Tax Setup
            </h3>
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Tax Year {year}
            </span>
          </div>

          {/* Tax Year Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
              Tax Year
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2024, 2025, 2026].map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={cn(
                    "min-h-[42px] py-2 text-xs font-bold rounded-xl transition-all border",
                    year === y 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  )}
                >
                  {y} {y === 2026 && <span className="text-xs opacity-80 font-normal">(Proj)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Filing Status Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
              Federal Filing Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'single', label: 'Single' },
                { id: 'mfj', label: 'Married Joint' },
                { id: 'mfs', label: 'Married Sep' },
                { id: 'hoh', label: 'Head of House' }
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilingStatus(st.id as FilingStatus)}
                  className={cn(
                    "min-h-[38px] py-1.5 px-2 text-xs font-bold rounded-xl transition-all border text-center",
                    filingStatus === st.id
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                  )}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* State Jurisdiction Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="tax-state-select" className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                State Jurisdiction
              </label>
              {!stateCfg.hasIncomeTax && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  0% State Income Tax
                </span>
              )}
            </div>
            <select
              id="tax-state-select"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {US_STATE_LIST.map(st => (
                <option key={st.code} value={st.code}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gross Annual Salary */}
          <InputGroup 
            label="Gross Annual Salary" 
            value={annualIncome} 
            prefix="$" 
            onChange={(v: number) => setAnnualIncome(v)} 
          />

          {/* Pre-Tax Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputGroup 
              label="Pre-Tax 401(k) / 403(b)" 
              value={preTax401k} 
              prefix="$" 
              onChange={(v: number) => setPreTax401k(v)} 
            />
            <InputGroup 
              label="Pre-Tax HSA / FSA" 
              value={preTaxHsaFsa} 
              prefix="$" 
              onChange={(v: number) => setPreTaxHsaFsa(v)} 
            />
          </div>

          {/* Standard vs Itemized Deductions */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Federal Standard Deduction: {format(taxResult.federalStandardDeduction)}
              </span>
              <button
                type="button"
                onClick={() => setUseCustomDeduction(!useCustomDeduction)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {useCustomDeduction ? 'Reset to Standard' : 'Itemize Instead'}
              </button>
            </div>
            {useCustomDeduction && (
              <InputGroup 
                label="Custom Itemized Deductions" 
                value={customDeduction} 
                prefix="$" 
                onChange={(v: number) => setCustomDeduction(v)} 
              />
            )}
          </div>

          {/* Compliance Rule Note */}
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed space-y-1.5">
            <p><strong>Pre-Tax Take-Home Rule:</strong> 401(k) contributions reduce Federal &amp; State taxable income, but because funds are directed into retirement accounts, they are subtracted from liquid paycheck cash flow.</p>
            <p><strong>FICA Breakdown:</strong> 6.2% Social Security up to wage base cap (${new Intl.NumberFormat().format(taxResult.ficaDetails.ssCap)}) + 1.45% Medicare. Section 125 HSA/FSA is exempt from FICA; 401(k) is subject to FICA per IRC § 3121.</p>
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Key Metrics & Paycheck Breakdown */}
      <div className="lg:col-span-7 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Net Annual Take-Home" 
            value={formatDetailed(taxResult.netTakeHome)} 
            subtext={`${formatDetailed(taxResult.monthlyNetTakeHome)}/mo (${formatDetailed(taxResult.biweeklyNetTakeHome)} bi-weekly)`} 
            icon={Wallet} 
            color="bg-emerald-600" 
          />
          <MetricCard 
            label="Total Tax Obligation" 
            value={formatDetailed(taxResult.totalTax)} 
            subtext={`${taxResult.totalEffectiveTaxRate.toFixed(2)}% overall effective rate`} 
            icon={ShieldAlert} 
            color="bg-rose-600" 
          />
          <MetricCard 
            label="Federal Effective Rate" 
            value={`${taxResult.federalEffectiveRate.toFixed(2)}%`} 
            subtext={`Taxable: ${format(taxResult.federalTaxableIncome)}`} 
            icon={Percent} 
            color="bg-slate-900 dark:bg-slate-700" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donut Chart */}
          <GlassCard className="p-6 lg:p-8 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Income Distribution</h4>
            <div className="h-64" aria-label="Income Distribution Chart">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={6} dataKey="value">
                    {chartData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                  </Pie>
                  <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {chartData.map(d => (
                <div key={d.name} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 truncate">{d.name}</div>
                  <div className="text-xs sm:text-sm font-black truncate" style={{ color: d.color }}>{formatDetailed(d.value)}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Itemized Paycheck Breakdown Table */}
          <GlassCard className="p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Itemized Paycheck Breakdown</h4>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Basis</span>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm pt-2">
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Gross Salary (Monthly)</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{formatDetailed(taxResult.monthlyGross)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Federal Withholding</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">-{formatDetailed(taxResult.monthlyFederalTax)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  FICA Social Security (6.2%)
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">-{formatDetailed(taxResult.ficaDetails.socialSecurity / 12)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  FICA Medicare (1.45% {taxResult.ficaDetails.additionalMedicare > 0 ? '+ 0.9%' : ''})
                </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">-{formatDetailed(taxResult.ficaDetails.medicare / 12)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {taxResult.stateName} Income Tax
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {taxResult.monthlyStateTax > 0 ? `-${formatDetailed(taxResult.monthlyStateTax)}` : '$0.00'}
                </span>
              </div>
              {preTax401k > 0 && (
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Pre-Tax 401(k) Elective Deferral</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 font-mono">-{formatDetailed(preTax401k / 12)}</span>
                </div>
              )}
              {preTaxHsaFsa > 0 && (
                <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Pre-Tax HSA/FSA (Sec. 125)</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">-{formatDetailed(preTaxHsaFsa / 12)}</span>
                </div>
              )}
              <div className="flex justify-between py-2.5 border-t-2 border-slate-300 dark:border-slate-600">
                <span className="font-black text-slate-900 dark:text-white">Net Liquid Paycheck</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-base">{formatDetailed(taxResult.monthlyNetTakeHome)}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Assumptions & Legal Sources Compliance Panel */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Landmark size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span>US Statutory Sources &amp; Legal Citations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Federal Income Tax:</p>
              <p>Internal Revenue Code § 1; IRS Revenue Procedure {year === 2024 ? '2023-34' : year === 2025 ? '2024-40' : '2024-40 (Projected)'}.</p>
              <a href={taxResult.statutorySources.federal} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium mt-0.5 inline-block">
                View Official IRS Revenue Procedure
              </a>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">FICA &amp; Social Security:</p>
              <p>IRC § 3101(a) (6.2% OASDI up to ${new Intl.NumberFormat().format(taxResult.ficaDetails.ssCap)} wage base) &amp; IRC § 3101(b) (1.45% Medicare uncapped + 0.9% surtax).</p>
              <a href={taxResult.statutorySources.socialSecurity} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium mt-0.5 inline-block">
                View SSA Social Security Fact Sheet
              </a>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">State Jurisdiction:</p>
              <p>{taxResult.stateName} Department of Revenue / Tax Commission. Effective date {stateCfg.effectiveDate}.</p>
              <a href={taxResult.statutorySources.state} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-medium mt-0.5 inline-block">
                View State Department of Revenue Source
              </a>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Section 125 &amp; Pre-Tax Savings:</p>
              <p>IRC § 125 (Cafeteria Plans), IRC § 402(g) ($23,000 for 2024 / $23,500 for 2025 elective deferrals).</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 italic">
            Disclaimer: Calculations and estimates are for educational and informational purposes only. Results do not constitute certified tax, legal, or accounting advice. Consult a licensed CPA or tax professional for your specific situation.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 9. COMPOUND INTEREST CALCULATOR MODULE
 * ========================================================================== */
export function CompoundInterestModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    principal: 15000,
    annualRate: 7.5,
    years: 15,
    frequency: 12,
    monthlyContribution: 300
  });

  const res = useMemo(() => calculateCompoundInterest(
    params.principal,
    params.annualRate,
    params.years,
    params.frequency,
    params.monthlyContribution
  ), [params]);

  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
  const freqLabel = params.frequency === 365 ? 'Daily' : params.frequency === 12 ? 'Monthly' : params.frequency === 4 ? 'Quarterly' : 'Annual';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp size={20} className="text-violet-600 dark:text-violet-400" aria-hidden="true" /> Compound Growth
          </h3>
          <InputGroup label="Initial Deposit" value={params.principal} prefix={currency.symbol} onChange={(v: number) => setParams({...params, principal: v})} />
          <InputGroup label="Monthly Addition" value={params.monthlyContribution} prefix={currency.symbol} onChange={(v: number) => setParams({...params, monthlyContribution: v})} />
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Annual Return" value={params.annualRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, annualRate: v})} />
            <InputGroup label="Time Horizon" value={params.years} suffix="yrs" onChange={(v: number) => setParams({...params, years: v})} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="compound-frequency-select" className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Compound Frequency</label>
            <select
              id="compound-frequency-select"
              value={params.frequency}
              onChange={e => setParams({...params, frequency: Number(e.target.value)})}
              className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl py-3 px-4 outline-none text-xs font-bold text-slate-900 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <option value={365}>Daily (365 times / yr)</option>
              <option value={12}>Monthly (12 times / yr)</option>
              <option value={4}>Quarterly (4 times / yr)</option>
              <option value={1}>Annually (1 time / yr)</option>
            </select>
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Future Portfolio Value" value={format(res.totalBalance)} subtext={`After ${params.years} yrs (${freqLabel} compounding)`} icon={Zap} color="bg-violet-600" />
          <MetricCard label="Total Interest Gained" value={format(res.totalInterest)} subtext={`Pure compound yield (${freqLabel})`} icon={TrendingUp} color="bg-emerald-600" />
          <MetricCard label="Total Invested Principal" value={format(res.totalInvested)} subtext="Your out-of-pocket deposits" icon={Wallet} color="bg-slate-800 dark:bg-slate-700" />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Total Contributions vs Compound Gains</h4>
          <div className="h-64" aria-label="Contributions vs Compound Interest Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Contributions', amount: res.totalInvested, fill: '#64748b' },
                { name: 'Compound Interest', amount: res.totalInterest, fill: '#8b5cf6' },
                { name: 'Total Wealth', amount: res.totalBalance, fill: '#10b981' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.5} />
                <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                <YAxis hide />
                <ReTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 10. SALARY CALCULATOR MODULE
 * ========================================================================== */
export function SalaryModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    amount: 45,
    frequency: 'hourly' as 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annual',
    hoursPerWeek: 40,
    daysPerWeek: 5,
    weeksPerYear: 52,
    overtimeHours: 5,
    taxRate: 20
  });

  const res = useMemo(() => calculateSalary({
    amount: params.amount,
    frequency: params.frequency,
    hoursPerWeek: params.hoursPerWeek,
    daysPerWeek: params.daysPerWeek,
    weeksPerYear: params.weeksPerYear,
    overtimeHours: params.overtimeHours,
    estimatedTaxPercent: params.taxRate
  }), [params]);

  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <Briefcase size={20} className="text-teal-600 dark:text-teal-400" aria-hidden="true" /> Wage Conversion
          </h3>
          <InputGroup label="Pay Rate" value={params.amount} prefix={currency.symbol} onChange={(v: number) => setParams({...params, amount: v})} />
          <div className="space-y-1.5">
            <label htmlFor="salary-frequency-select" className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Pay Frequency</label>
            <select
              id="salary-frequency-select"
              value={params.frequency}
              onChange={e => setParams({...params, frequency: e.target.value as any})}
              className="w-full min-h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl py-3 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Hours / Week" value={params.hoursPerWeek} onChange={(v: number) => setParams({...params, hoursPerWeek: v})} />
            <InputGroup label="Overtime Hrs / Wk" value={params.overtimeHours} onChange={(v: number) => setParams({...params, overtimeHours: v})} />
          </div>
          <InputGroup label="Est. Tax Deduction" value={params.taxRate} suffix="%" step="1" onChange={(v: number) => setParams({...params, taxRate: v})} />
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Gross Annual Salary" value={format(res.annualGross)} subtext="Before tax deductions" icon={Briefcase} color="bg-teal-600" />
          <MetricCard label="Net Annual Take-Home" value={format(res.annualNet)} subtext="After estimated withholding" icon={Wallet} color="bg-emerald-600" />
          <MetricCard label="Base Hourly Equivalent" value={format(res.baseHourly)} subtext="Standard 40-hr rate" icon={Zap} color="bg-blue-600" />
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Salary Conversion Matrix</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-4">Pay Period</th>
                <th className="p-4">Gross Earnings</th>
                <th className="p-4">Est. Tax</th>
                <th className="p-4">Net Take-Home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-medium">
              {res.breakdown.map((row: any) => (
                <tr key={row.period} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{row.period}</td>
                  <td className="p-4 text-slate-900 dark:text-white font-bold">{format(row.gross)}</td>
                  <td className="p-4 text-rose-600 dark:text-rose-400 font-bold">-{format(row.tax)}</td>
                  <td className="p-4 text-emerald-700 dark:text-emerald-400 font-black">{format(row.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 11. INTEREST RATE CALCULATOR MODULE
 * ========================================================================== */
export function InterestRateModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    loanAmount: 30000,
    monthlyPayment: 620,
    termMonths: 60,
    upfrontFees: 500
  });

  const res = useMemo(() => calculateInterestRate(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <TrendingUp size={20} className="text-cyan-600 dark:text-cyan-400" aria-hidden="true" /> APR Reverse Solver
          </h3>
          <InputGroup label="Original Loan Principal" value={params.loanAmount} prefix={currency.symbol} onChange={(v: number) => setParams({...params, loanAmount: v})} />
          <InputGroup label="Monthly Payment Made" value={params.monthlyPayment} prefix={currency.symbol} onChange={(v: number) => setParams({...params, monthlyPayment: v})} />
          <InputGroup label="Loan Duration (Months)" value={params.termMonths} onChange={(v: number) => setParams({...params, termMonths: v})} />
          <InputGroup label="Upfront Closing Fees" value={params.upfrontFees} prefix={currency.symbol} onChange={(v: number) => setParams({...params, upfrontFees: v})} />
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="True Nominal APR" value={`${res.nominalRate}%`} subtext="Annualized interest rate" icon={TrendingUp} color="bg-cyan-600" />
          <MetricCard label="Effective APR (with Fees)" value={`${res.aprWithFees}%`} subtext="Real cost of financing" icon={Percent} color="bg-rose-600" />
          <MetricCard label="Total Interest Paid" value={format(res.totalInterest)} subtext={`Total out: ${format(res.totalCost)}`} icon={Landmark} color="bg-slate-800 dark:bg-slate-700" />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Newton-Raphson Solver Result</h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            By reverse engineering a <strong>{format(params.monthlyPayment)}</strong> monthly payment across <strong>{params.termMonths} months</strong> on a <strong>{format(params.loanAmount)}</strong> loan:
          </p>
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded-2xl flex items-center gap-3 text-cyan-900 dark:text-cyan-200 text-sm font-semibold">
            <CheckCircle2 size={20} className="shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
            <span>The borrower is paying an exact nominal APR of <strong>{res.nominalRate}%</strong>. Factoring in <strong>{format(params.upfrontFees)}</strong> in fees raises the true loan APR to <strong>{res.aprWithFees}%</strong>.</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ============================================================================
 * 12. SALES TAX CALCULATOR MODULE
 * ========================================================================== */
export function SalesTaxModule({ currency }: { currency: any }) {
  const [params, setParams] = useState({
    amount: 1500,
    mode: 'add_tax' as 'add_tax' | 'extract_tax',
    stateRate: 6.25,
    localRate: 1.5,
    discountPercent: 10
  });

  const res = useMemo(() => calculateSalesTax(params), [params]);
  const format = (v: number) => `${currency.symbol}${new Intl.NumberFormat().format(Math.round(v))}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
            <DollarSign size={20} className="text-pink-600 dark:text-pink-400" aria-hidden="true" /> Sales Tax Engine
          </h3>
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">Operation Mode</span>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button 
                type="button" 
                onClick={() => setParams({...params, mode: 'add_tax'})}
                className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.mode === 'add_tax' ? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
              >
                Add Tax to Price
              </button>
              <button 
                type="button" 
                onClick={() => setParams({...params, mode: 'extract_tax'})}
                className={cn("min-h-[44px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", params.mode === 'extract_tax' ? "bg-white dark:bg-slate-700 text-pink-600 dark:text-pink-400 shadow-sm" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white")}
              >
                Reverse Tax Extraction
              </button>
            </div>
          </div>

          <InputGroup 
            label={params.mode === 'add_tax' ? "Before-Tax Price" : "Total Receipt Paid"} 
            value={params.amount} 
            prefix={currency.symbol} 
            onChange={(v: number) => setParams({...params, amount: v})} 
          />

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="State Tax" value={params.stateRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, stateRate: v})} />
            <InputGroup label="City / Local Tax" value={params.localRate} suffix="%" step="0.1" onChange={(v: number) => setParams({...params, localRate: v})} />
          </div>

          {params.mode === 'add_tax' && (
            <InputGroup label="Discount %" value={params.discountPercent} suffix="%" step="1" onChange={(v: number) => setParams({...params, discountPercent: v})} />
          )}
        </GlassCard>
      </div>

      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard label="Final Out-of-Pocket" value={format(res.finalTotal)} subtext="Total receipt cost" icon={Wallet} color="bg-pink-600" />
          <MetricCard label="Total Sales Tax" value={format(res.totalTax)} subtext={`${(params.stateRate + params.localRate).toFixed(2)}% combined rate`} icon={DollarSign} color="bg-slate-800 dark:bg-slate-700" />
          <MetricCard label="Pre-Tax Base Amount" value={format(res.beforeTax)} subtext="Taxable merchandise" icon={ShieldAlert} color="bg-blue-600" />
        </div>

        <GlassCard className="p-6 lg:p-8 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Receipt Line Item Breakdown</h4>
          <div className="space-y-3 text-sm pt-2">
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Item Pre-Tax Price</span>
              <span className="font-bold text-slate-900 dark:text-white">{format(res.beforeTax)}</span>
            </div>
            {params.mode === 'add_tax' && res.savings > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Discount Savings Applied</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">-{format(res.savings)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-medium">State Tax ({params.stateRate}%)</span>
              <span className="font-bold text-slate-900 dark:text-white">+{format(res.stateTax)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Local / City Tax ({params.localRate}%)</span>
              <span className="font-bold text-slate-900 dark:text-white">+{format(res.localTax)}</span>
            </div>
            <div className="flex justify-between py-3 border-t border-slate-200 dark:border-slate-700">
              <span className="font-black text-slate-900 dark:text-white text-base">Total Due</span>
              <span className="font-black text-pink-600 dark:text-pink-400 text-xl">{format(res.finalTotal)}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

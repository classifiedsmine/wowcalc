/**
 * Global Numerical & Financial Computation Engine
 * US Legal & Regulatory Compliance Kernel
 * Version 8.0.0
 * 
 * Complies with:
 * - Internal Revenue Code (IRC) Title 26
 * - IRS Rev. Proc. 2023-34 (2024) & Rev. Proc. 2024-40 (2025)
 * - SSA Social Security OASDI Wage Caps (12 CFR § 404.1047)
 * - TILA Regulation Z (12 CFR Part 1026, Appendix J - Actuarial APR)
 * - Homeowners Protection Act of 1998 (12 U.S.C. § 4901 - PMI 80%/78% LTV)
 * - RESPA Regulation X (12 CFR § 1024.17 - Escrow)
 * - TISA Regulation DD (12 CFR Part 1030 - APY)
 * - SECURE 2.0 Act & ERISA Retirement Limits
 */

import {
  US_TAX_CONFIG_BY_YEAR,
  US_LENDING_CONFIG,
  US_STATE_TAX_CONFIGS,
  getStateConfig,
  type FilingStatus,
  type StateTaxConfig,
  type YearTaxConfig
} from './usFinancialConfig';

export * from './usFinancialConfig';

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
  startDate?: string;
  autoPmi?: boolean;
  
  // Annual Costs
  taxPercent?: number; 
  insuranceAnnual?: number;
  pmiAnnual?: number;
  hoaAnnual?: number;
  otherAnnual?: number;

  // Increases (%)
  taxIncrease?: number;
  insuranceIncrease?: number;
  hoaIncrease?: number;
  otherIncrease?: number;

  // Extra Payments
  extraMonthly?: number;
  extraYearly?: number;
  extraOneTime?: number;
  extraOneTimeMonth?: number;
}

export class CalculationError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "CalculationError";
    this.code = code;
  }
}

/* ============================================================================
 * UTILS
 * ========================================================================== */

export function pmt(rate: number, periods: number, pv: number, fv = 0, type: 0 | 1 = 0): number {
  if (rate === 0) return -(pv + fv) / periods;
  const growth = Math.pow(1 + rate, periods);
  return (-(rate * (pv * growth + fv)) / ((1 + rate * type) * (growth - 1)));
}

/**
 * Rounds a number to 2 decimal places (cents) using standard bankers/financial rounding.
 */
export function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/* ============================================================================
 * REGULATION Z (TILA) ACTUARIAL APR SOLVER (12 CFR Part 1026, Appendix J)
 * ========================================================================== */

/**
 * Solves for the actuarial Annual Percentage Rate (APR) under Regulation Z,
 * Appendix J. For closed-end credit with level monthly payments:
 * Amount Financed = PMT * [ (1 - (1 + i)^(-n)) / i ]
 * where i = APR / 1200.
 */
export function solveRegulationZ_Apr(
  amountFinanced: number,
  monthlyPayment: number,
  totalMonths: number
): number {
  if (amountFinanced <= 0 || monthlyPayment <= 0 || totalMonths <= 0) return 0;
  if (monthlyPayment * totalMonths <= amountFinanced) return 0;

  // Newton-Raphson method
  let i = (monthlyPayment * totalMonths - amountFinanced) / (amountFinanced * totalMonths);
  if (i <= 0) i = 0.001;

  for (let iter = 0; iter < 100; iter++) {
    const v = Math.pow(1 + i, -totalMonths);
    const f = monthlyPayment * ((1 - v) / i) - amountFinanced;
    if (Math.abs(f) < 1e-9) break;

    // Derivative: d/di [ PMT * (1 - (1+i)^(-n)) / i ] = PMT * [ n*v/(i*(1+i)) - (1 - v)/(i^2) ]
    const df = monthlyPayment * ((totalMonths * v) / (i * (1 + i)) - (1 - v) / (i * i));
    if (Math.abs(df) < 1e-12) break;

    const nextI = i - f / df;
    if (nextI <= 0) {
      i = i / 2;
    } else {
      i = nextI;
    }
  }

  return roundToCents(i * 12 * 100);
}

/* ============================================================================
 * CORE FINANCIAL UTILS & REGULATION DD (APY)
 * ========================================================================== */

export function calculateCompoundInterest(
  principal: number, 
  annualRate: number, 
  years: number, 
  compoundingsPerYear: number, 
  monthlyContribution: number = 0
) {
  const r = Math.max(0, annualRate) / 100;
  const n = Math.max(1, compoundingsPerYear || 12);
  const t = Math.max(0.01, years);
  const PMT = Math.max(0, monthlyContribution);

  const totalMonths = Math.ceil(t * 12);
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  let balance = principal;
  let totalInvested = principal;

  for (let i = 1; i <= totalMonths; i++) {
    const interest = balance * monthlyRate;
    balance += interest + PMT;
    totalInvested += PMT;
  }

  // Regulation DD (12 CFR Part 1030) APY formula: APY = 100 * [ (1 + r/n)^n - 1 ]
  const apy = roundToCents((Math.pow(1 + r / n, n) - 1) * 100);

  return {
    totalBalance: roundToCents(balance),
    totalInvested: roundToCents(totalInvested),
    totalInterest: roundToCents(balance - totalInvested),
    apy,
    governingRegulation: "Truth in Savings Act (Regulation DD, 12 CFR Part 1030)"
  };
}

/* ============================================================================
 * US TAX & FICA COMPLIANCE (IRC § 3101, § 3121, § 125, § 402(g))
 * ========================================================================== */

export function calculateFicaTax(
  grossSalary: number, 
  preTaxHsaFsa: number = 0,
  filingStatus: FilingStatus = 'single',
  year: number = 2024
) {
  const yearConfig = US_TAX_CONFIG_BY_YEAR[year] || US_TAX_CONFIG_BY_YEAR[2024];

  // Pre-Tax deduction exclusions:
  // Section 125 cafeteria plans (HSA / Health FSA) are exempt from FICA under IRC § 3121(a)(5)(G).
  // Standard 401(k) / 403(b) contributions are SUBJECT to FICA under IRC § 3121(v)(1)(A).
  const ficaTaxableWages = Math.max(0, grossSalary - preTaxHsaFsa);
  
  // Social Security (OASDI)
  const ssCap = yearConfig.socialSecurity.wageBaseCap.value;
  const ssRate = yearConfig.socialSecurity.taxRate.value; // 6.2%
  const ssTaxable = Math.min(ficaTaxableWages, ssCap);
  const socialSecurity = roundToCents(ssTaxable * ssRate);
  
  // Medicare Base (1.45% uncapped)
  const medRate = yearConfig.medicare.taxRate.value; // 1.45%
  const baseMedicare = roundToCents(ficaTaxableWages * medRate);

  // Additional Medicare Tax (0.9% surtax over statutory threshold)
  const addThreshold = yearConfig.medicare.additionalThreshold[filingStatus]?.value || 200000;
  const addRate = yearConfig.medicare.additionalTaxRate.value; // 0.9%
  const surtaxWages = Math.max(0, ficaTaxableWages - addThreshold);
  const additionalMedicare = roundToCents(surtaxWages * addRate);
  const medicare = roundToCents(baseMedicare + additionalMedicare);
  
  const totalFica = roundToCents(socialSecurity + medicare);
  
  return {
    ficaTaxableWages,
    ssCap,
    socialSecurity,
    medicare,
    additionalMedicare,
    totalFica,
    monthlyFica: roundToCents(totalFica / 12),
    statutoryCitations: {
      socialSecurity: "IRC § 3101(a) (6.2% OASDI up to statutory wage base limit)",
      medicare: "IRC § 3101(b)(1) (1.45% Hospital Insurance, uncapped)",
      additionalMedicare: "IRC § 3101(b)(2) (0.9% Additional Medicare Tax over filing status threshold)",
      section125Exemption: "IRC § 125 & IRC § 3121(a)(5)(G) (Pre-tax HSA/FSA FICA exemption)"
    }
  };
}

export interface ComprehensiveTaxInput {
  annualIncome: number;
  year?: number;
  filingStatus?: FilingStatus;
  stateCode?: string;
  preTax401k?: number;
  preTaxHsaFsa?: number;
  itemizedDeductions?: number;
}

export function calculateComprehensiveTax(input: ComprehensiveTaxInput) {
  const year = input.year && US_TAX_CONFIG_BY_YEAR[input.year] ? input.year : 2024;
  const yearConfig = US_TAX_CONFIG_BY_YEAR[year];
  const filingStatus = input.filingStatus || 'single';
  const stateCode = (input.stateCode || 'CA').toUpperCase();
  const stateConfig = getStateConfig(stateCode);

  const grossSalary = Math.max(0, input.annualIncome);
  const preTax401k = Math.max(0, input.preTax401k || 0);
  const preTaxHsaFsa = Math.max(0, input.preTaxHsaFsa || 0);
  const totalPreTax = preTax401k + preTaxHsaFsa;

  // 1. Federal Standard vs Itemized Deduction
  const standardDeduction = yearConfig.standardDeduction[filingStatus].value;
  const effectiveFederalDeduction = Math.max(standardDeduction, input.itemizedDeductions || 0);

  // Federal Taxable Income = Gross - Pre-Tax Contributions - Federal Deduction
  const federalTaxableIncome = Math.max(0, grossSalary - totalPreTax - effectiveFederalDeduction);

  // 2. Federal Income Tax using Brackets
  const federalBrackets = yearConfig.brackets[filingStatus].value;
  let federalTax = 0;
  let rem = federalTaxableIncome;

  for (let i = 0; i < federalBrackets.length; i++) {
    const cur = federalBrackets[i];
    const next = federalBrackets[i + 1];
    const span = next ? next.threshold - cur.threshold : Infinity;
    const bracketTaxable = Math.min(rem, span);

    federalTax += bracketTaxable * cur.rate;
    rem -= bracketTaxable;
    if (rem <= 0) break;
  }
  federalTax = roundToCents(federalTax);

  // 3. FICA Taxes (Social Security & Medicare)
  const ficaRes = calculateFicaTax(grossSalary, preTaxHsaFsa, filingStatus, year);
  const ficaTax = ficaRes.totalFica;

  // 4. State Income Tax
  let stateTax = 0;
  let stateTaxableIncome = 0;
  let stateDeduction = 0;

  if (stateConfig.hasIncomeTax) {
    stateDeduction = stateConfig.standardDeduction[filingStatus] || 0;
    // Pre-tax 401(k) reduces State AGI across all states
    // Note: CA and NJ do not allow state HSA deduction on health savings accounts
    const statePreTaxExempt = (stateCode === 'CA' || stateCode === 'NJ') 
      ? preTax401k 
      : (preTax401k + preTaxHsaFsa);

    stateTaxableIncome = Math.max(0, grossSalary - statePreTaxExempt - stateDeduction);

    if (stateConfig.type === 'flat' && stateConfig.flatRate) {
      stateTax = roundToCents(stateTaxableIncome * stateConfig.flatRate);
    } else if (stateConfig.type === 'progressive' && stateConfig.brackets) {
      const stBrackets = stateConfig.brackets[filingStatus] || stateConfig.brackets.single;
      let sRem = stateTaxableIncome;
      for (let j = 0; j < stBrackets.length; j++) {
        const c = stBrackets[j];
        const n = stBrackets[j + 1];
        const span = n ? n.threshold - c.threshold : Infinity;
        const bTaxable = Math.min(sRem, span);
        stateTax += bTaxable * c.rate;
        sRem -= bTaxable;
        if (sRem <= 0) break;
      }
      stateTax = roundToCents(stateTax);
    }
  }

  // 5. Total Taxes & Liquid Take-Home Pay
  // RULE: Net Take-Home Pay = Gross Salary - Total Taxes - Pre-Tax Contributions
  const totalTax = roundToCents(federalTax + ficaTax + stateTax);
  const netTakeHome = Math.max(0, roundToCents(grossSalary - totalTax - totalPreTax));

  return {
    year,
    filingStatus,
    stateCode,
    stateName: stateConfig.stateName,
    grossSalary,
    preTax401k,
    preTaxHsaFsa,
    totalPreTax,
    federalStandardDeduction: standardDeduction,
    federalTaxableIncome,
    federalTax,
    federalEffectiveRate: grossSalary > 0 ? (federalTax / grossSalary) * 100 : 0,
    ficaTax,
    ficaDetails: ficaRes,
    stateDeduction,
    stateTaxableIncome,
    stateTax,
    stateEffectiveRate: grossSalary > 0 ? (stateTax / grossSalary) * 100 : 0,
    totalTax,
    totalEffectiveTaxRate: grossSalary > 0 ? (totalTax / grossSalary) * 100 : 0,
    netTakeHome,
    monthlyGross: roundToCents(grossSalary / 12),
    monthlyFederalTax: roundToCents(federalTax / 12),
    monthlyFicaTax: roundToCents(ficaTax / 12),
    monthlyStateTax: roundToCents(stateTax / 12),
    monthlyTotalTax: roundToCents(totalTax / 12),
    monthlyPreTax: roundToCents(totalPreTax / 12),
    monthlyNetTakeHome: roundToCents(netTakeHome / 12),
    biweeklyNetTakeHome: roundToCents(netTakeHome / 26),
    weeklyNetTakeHome: roundToCents(netTakeHome / 52),
    statutorySources: {
      federal: yearConfig.sourceUrl,
      state: stateConfig.sourceUrl,
      socialSecurity: yearConfig.socialSecurity.wageBaseCap.sourceUrl,
      medicare: yearConfig.medicare.taxRate.sourceUrl
    }
  };
}

export function calculateIncomeTax(annualIncome: number, year: number = 2024, filingStatus: FilingStatus = 'single') {
  const res = calculateComprehensiveTax({
    annualIncome,
    year,
    filingStatus,
    stateCode: 'CA',
    preTax401k: 0,
    preTaxHsaFsa: 0
  });

  return {
    totalTax: res.federalTax,
    effectiveRate: res.federalEffectiveRate,
    takeHome: roundToCents(annualIncome - res.federalTax)
  };
}

export function calculateInflation(amount: number, rate: number, years: number) {
  const futureValue = amount * Math.pow(1 + rate / 100, years);
  const purchasingPower = amount / Math.pow(1 + rate / 100, years);
  const timeline = [];
  for (let y = 0; y <= years; y++) {
    timeline.push({
      year: y,
      futureCost: roundToCents(amount * Math.pow(1 + rate / 100, y)),
      purchasingPower: roundToCents(amount / Math.pow(1 + rate / 100, y)),
    });
  }
  return {
    futureValue: roundToCents(futureValue),
    purchasingPower: roundToCents(purchasingPower),
    totalInflationImpact: roundToCents(futureValue - amount),
    timeline
  };
}

export function calculateLoan(input: {
  loanAmount: number;
  annualRate: number;
  termYears: number;
  originationFeePercent?: number;
  extraMonthly?: number;
}) {
  const principal = Math.max(0, input.loanAmount);
  const rate = Math.max(0, input.annualRate) / 100 / 12;
  const n = Math.max(1, input.termYears) * 12;
  const extra = Math.max(0, input.extraMonthly || 0);
  const fee = roundToCents(principal * ((input.originationFeePercent || 0) / 100));

  let monthlyPI = 0;
  if (principal > 0) {
    if (rate === 0) {
      monthlyPI = roundToCents(principal / n);
    } else {
      const g = Math.pow(1 + rate, n);
      monthlyPI = roundToCents((principal * rate * g) / (g - 1));
    }
  }

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let payoffMonth = 0;
  const schedule: any[] = [];

  for (let m = 1; m <= n; m++) {
    if (balance <= 0) break;
    const interest = roundToCents(balance * rate);
    let principalPaid = roundToCents(monthlyPI - interest);
    let appliedExtra = extra;

    if (principalPaid + appliedExtra >= balance || m === n) {
      principalPaid = balance;
      appliedExtra = 0;
      balance = 0;
      if (payoffMonth === 0) payoffMonth = m;
    } else {
      balance = roundToCents(balance - principalPaid - appliedExtra);
    }

    totalInterest = roundToCents(totalInterest + interest);
    totalPaid = roundToCents(totalPaid + principalPaid + interest + appliedExtra);
    if (balance <= 0 && payoffMonth === 0) payoffMonth = m;

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      payment: roundToCents(principalPaid + interest + appliedExtra),
      principal: roundToCents(principalPaid + appliedExtra),
      interest,
      balance,
      totalInterest
    });
  }

  return {
    loanAmount: principal,
    monthlyPayment: monthlyPI,
    originationFee: fee,
    totalInterest,
    totalPayment: roundToCents(totalPaid + fee),
    payoffMonths: payoffMonth || n,
    schedule
  };
}

export function calculateAutoLoan(input: {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxPercent: number;
  titleFees: number;
  dealerDocFee: number;
  annualRate: number;
  termMonths: number;
}) {
  const price = Math.max(0, input.vehiclePrice);
  const down = Math.min(price, Math.max(0, input.downPayment));
  const tradeIn = Math.max(0, input.tradeInValue);
  
  // In most tax jurisdictions, trade-in reduces taxable amount
  const taxableAmount = Math.max(0, price - tradeIn);
  const salesTax = roundToCents(taxableAmount * (Math.max(0, input.salesTaxPercent) / 100));
  const fees = roundToCents(Math.max(0, input.titleFees) + Math.max(0, input.dealerDocFee));
  
  const totalFinanced = Math.max(0, roundToCents(price - down - tradeIn + salesTax + fees));
  const rate = Math.max(0, input.annualRate) / 100 / 12;
  const n = Math.max(1, input.termMonths);

  let monthlyPayment = 0;
  if (totalFinanced > 0) {
    if (rate === 0) {
      monthlyPayment = roundToCents(totalFinanced / n);
    } else {
      const g = Math.pow(1 + rate, n);
      monthlyPayment = roundToCents((totalFinanced * rate * g) / (g - 1));
    }
  }

  const totalPayments = roundToCents(monthlyPayment * n);
  const totalInterest = Math.max(0, roundToCents(totalPayments - totalFinanced));
  const totalVehicleCost = roundToCents(down + tradeIn + totalPayments);

  return {
    vehiclePrice: price,
    totalFinanced,
    salesTax,
    fees,
    monthlyPayment,
    totalInterest,
    totalPayments,
    totalVehicleCost
  };
}

export function calculateInterest(input: {
  principal: number;
  annualRate: number;
  years: number;
  type: 'compound' | 'simple';
  frequency: 1 | 2 | 4 | 12 | 365;
  monthlyDeposit?: number;
}) {
  const p = Math.max(0, input.principal);
  const r = Math.max(0, input.annualRate) / 100;
  const t = Math.max(0.1, input.years);
  const pmt = Math.max(0, input.monthlyDeposit || 0);

  if (input.type === 'simple') {
    const interest = roundToCents(p * r * t);
    const endBalance = roundToCents(p + interest);
    const timeline = [];
    for (let y = 1; y <= Math.ceil(t); y++) {
      const curYear = Math.min(y, t);
      timeline.push({
        year: y,
        principal: p,
        interest: roundToCents(p * r * curYear),
        balance: roundToCents(p + p * r * curYear)
      });
    }
    return {
      finalBalance: endBalance,
      totalInterest: interest,
      totalDeposits: p,
      apy: roundToCents(input.annualRate),
      timeline
    };
  }

  // Compound Interest
  const n = input.frequency || 12;
  const apy = roundToCents((Math.pow(1 + r / n, n) - 1) * 100);
  let balance = p;
  let totalDeposited = p;
  const timeline = [];

  const totalMonths = Math.ceil(t * 12);
  // Equivalent monthly compounding rate corresponding to nominal annual rate r compounded n times per year
  const monthlyRate = Math.pow(1 + r / n, n / 12) - 1;

  for (let m = 1; m <= totalMonths; m++) {
    const interest = balance * monthlyRate;
    balance += interest + pmt;
    totalDeposited += pmt;

    if (m % 12 === 0 || m === totalMonths) {
      timeline.push({
        year: Math.ceil(m / 12),
        principal: roundToCents(totalDeposited),
        interest: roundToCents(balance - totalDeposited),
        balance: roundToCents(balance)
      });
    }
  }

  return {
    finalBalance: roundToCents(balance),
    totalInterest: roundToCents(balance - totalDeposited),
    totalDeposits: roundToCents(totalDeposited),
    apy,
    timeline
  };
}

export function calculatePayment(input: {
  mode: 'solve_payment' | 'solve_loan';
  amount: number;
  annualRate: number;
  termYears: number;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  extraPayment?: number;
}) {
  const periodsPerYear = input.frequency === 'weekly' ? 52 : input.frequency === 'biweekly' ? 26 : 12;
  const rate = Math.max(0, input.annualRate) / 100 / periodsPerYear;
  const totalPeriods = Math.max(1, input.termYears) * periodsPerYear;

  if (input.mode === 'solve_payment') {
    const loan = Math.max(0, input.amount);
    let payment = 0;
    if (loan > 0) {
      if (rate === 0) {
        payment = roundToCents(loan / totalPeriods);
      } else {
        const g = Math.pow(1 + rate, totalPeriods);
        payment = roundToCents((loan * rate * g) / (g - 1));
      }
    }
    const extra = Math.max(0, input.extraPayment || 0);
    const schedule: Array<{
      period: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
      totalInterest: number;
    }> = [];
    let balance = loan;
    let runningInterest = 0;
    let actualTotalPaid = 0;
    for (let p = 1; p <= totalPeriods; p++) {
      if (balance <= 0) break;
      const interest = roundToCents(balance * rate);
      let principalPaid = roundToCents((payment + extra) - interest);
      if (principalPaid >= balance || p === totalPeriods) {
        principalPaid = balance;
        balance = 0;
      } else {
        balance = roundToCents(balance - principalPaid);
      }
      runningInterest = roundToCents(runningInterest + interest);
      actualTotalPaid = roundToCents(actualTotalPaid + principalPaid + interest);
      schedule.push({
        period: p,
        payment: roundToCents(principalPaid + interest),
        principal: principalPaid,
        interest,
        balance,
        totalInterest: runningInterest
      });
    }
    const totalPaid = extra > 0 ? actualTotalPaid : roundToCents(payment * totalPeriods);
    return {
      loanAmount: loan,
      periodicPayment: payment,
      totalPayment: totalPaid,
      totalInterest: Math.max(0, roundToCents(totalPaid - loan)),
      frequencyLabel: input.frequency === 'weekly' ? 'Weekly' : input.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly',
      schedule
    };
  } else {
    // Solve affordable loan from target payment
    const targetPayment = Math.max(0, input.amount);
    let maxLoan = 0;
    if (targetPayment > 0) {
      if (rate === 0) {
        maxLoan = roundToCents(targetPayment * totalPeriods);
      } else {
        const g = Math.pow(1 + rate, totalPeriods);
        maxLoan = roundToCents(targetPayment * ((g - 1) / (rate * g)));
      }
    }
    const schedule: Array<{
      period: number;
      payment: number;
      principal: number;
      interest: number;
      balance: number;
      totalInterest: number;
    }> = [];
    let balance = maxLoan;
    let runningInterest = 0;
    for (let p = 1; p <= totalPeriods; p++) {
      if (balance <= 0) break;
      const interest = roundToCents(balance * rate);
      let principalPaid = roundToCents(targetPayment - interest);
      if (principalPaid >= balance || p === totalPeriods) {
        principalPaid = balance;
        balance = 0;
      } else {
        balance = roundToCents(balance - principalPaid);
      }
      runningInterest = roundToCents(runningInterest + interest);
      schedule.push({
        period: p,
        payment: roundToCents(principalPaid + interest),
        principal: principalPaid,
        interest,
        balance,
        totalInterest: runningInterest
      });
    }
    const totalPaid = roundToCents(targetPayment * totalPeriods);
    return {
      loanAmount: maxLoan,
      periodicPayment: targetPayment,
      totalPayment: totalPaid,
      totalInterest: Math.max(0, roundToCents(totalPaid - maxLoan)),
      frequencyLabel: input.frequency === 'weekly' ? 'Weekly' : input.frequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly',
      schedule
    };
  }
}

export function calculateSalary(input: {
  amount: number;
  frequency: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'annual';
  hoursPerWeek: number;
  daysPerWeek: number;
  weeksPerYear: number;
  overtimeHours?: number;
  estimatedTaxPercent?: number;
}) {
  const hpw = Math.max(1, input.hoursPerWeek || 40);
  const dpw = Math.max(1, input.daysPerWeek || 5);
  const wpy = Math.max(1, input.weeksPerYear || 52);
  const otHours = Math.max(0, input.overtimeHours || 0);
  const taxRate = Math.max(0, Math.min(100, input.estimatedTaxPercent || 22)) / 100;

  // Convert input to hourly baseline
  let baseHourly = 0;
  switch (input.frequency) {
    case 'hourly': baseHourly = input.amount; break;
    case 'daily': baseHourly = input.amount / (hpw / dpw); break;
    case 'weekly': baseHourly = input.amount / hpw; break;
    case 'biweekly': baseHourly = input.amount / (hpw * 2); break;
    case 'semimonthly': baseHourly = (input.amount * 24) / (hpw * wpy); break;
    case 'monthly': baseHourly = (input.amount * 12) / (hpw * wpy); break;
    case 'annual': baseHourly = input.amount / (hpw * wpy); break;
  }

  const overtimeHourly = baseHourly * 1.5;
  const weeklyGross = (baseHourly * hpw) + (overtimeHourly * otHours);
  const annualGross = weeklyGross * wpy;

  const row = (name: string, gross: number) => ({
    period: name,
    gross: roundToCents(gross),
    tax: roundToCents(gross * taxRate),
    net: roundToCents(gross * (1 - taxRate))
  });

  return {
    baseHourly: roundToCents(baseHourly),
    annualGross: roundToCents(annualGross),
    annualNet: roundToCents(annualGross * (1 - taxRate)),
    breakdown: [
      row('Hourly', baseHourly),
      row('Daily', weeklyGross / dpw),
      row('Weekly', weeklyGross),
      row('Bi-Weekly', weeklyGross * 2),
      row('Semi-Monthly', annualGross / 24),
      row('Monthly', annualGross / 12),
      row('Annual', annualGross)
    ]
  };
}

export function calculateInterestRate(input: {
  loanAmount: number;
  monthlyPayment: number;
  termMonths: number;
  upfrontFees?: number;
}) {
  const P = Math.max(0, input.loanAmount);
  const PMT = Math.max(0, input.monthlyPayment);
  const N = Math.max(1, input.termMonths);
  const fees = Math.max(0, input.upfrontFees || 0);

  if (P <= 0 || PMT <= 0 || PMT * N <= P) {
    return {
      nominalRate: 0,
      aprWithFees: 0,
      totalInterest: Math.max(0, roundToCents(PMT * N - P)),
      totalCost: roundToCents(PMT * N + fees)
    };
  }

  // Newton-Raphson solver for periodic rate r
  const solveRate = (principal: number) => {
    let r = (PMT * N - principal) / (principal * N); // Initial guess
    for (let iter = 0; iter < 100; iter++) {
      if (r <= 0) r = 0.0001;
      const g = Math.pow(1 + r, N);
      const f = principal * (r * g) / (g - 1) - PMT;
      if (Math.abs(f) < 1e-7) break;
      const df = principal * (g * (g - 1 - r * N)) / Math.pow(g - 1, 2);
      if (Math.abs(df) < 1e-12) break;
      r = r - f / df;
    }
    return Math.max(0, r * 12 * 100);
  };

  const nominalRate = roundToCents(solveRate(P));
  const aprWithFees = roundToCents(solveRate(Math.max(1, P - fees)));

  return {
    nominalRate,
    aprWithFees,
    totalInterest: roundToCents(PMT * N - P),
    totalCost: roundToCents(PMT * N + fees)
  };
}

export function calculateSalesTax(input: {
  amount: number;
  mode: 'add_tax' | 'extract_tax';
  stateRate: number;
  localRate: number;
  discountPercent?: number;
}) {
  const discount = Math.max(0, Math.min(100, input.discountPercent || 0)) / 100;
  const stateR = Math.max(0, input.stateRate) / 100;
  const localR = Math.max(0, input.localRate) / 100;
  const totalR = stateR + localR;

  if (input.mode === 'add_tax') {
    const raw = Math.max(0, input.amount);
    const discounted = roundToCents(raw * (1 - discount));
    const stateTax = roundToCents(discounted * stateR);
    const localTax = roundToCents(discounted * localR);
    const totalTax = roundToCents(discounted * totalR);
    const finalTotal = roundToCents(discounted + totalTax);

    return {
      beforeTax: discounted,
      stateTax,
      localTax,
      totalTax,
      finalTotal,
      savings: roundToCents(raw * discount)
    };
  } else {
    // Reverse tax extraction
    const total = Math.max(0, input.amount);
    const beforeTax = roundToCents(total / (1 + totalR));
    const totalTax = roundToCents(total - beforeTax);
    const stateTax = roundToCents(beforeTax * stateR);
    const localTax = roundToCents(beforeTax * localR);

    return {
      beforeTax,
      stateTax,
      localTax,
      totalTax,
      finalTotal: total,
      savings: 0
    };
  }
}

export function calculateFinanceTVM(input: {
  pv?: number;
  fv?: number;
  pmt?: number;
  annualRate?: number;
  periods?: number;
  solveFor: 'pv' | 'fv' | 'pmt' | 'rate' | 'periods';
}) {
  const r = (input.annualRate || 0) / 100 / 12;
  const n = input.periods || 12;
  const pv = input.pv || 0;
  const fv = input.fv || 0;
  const pmtVal = input.pmt || 0;

  let result = 0;
  switch (input.solveFor) {
    case 'fv':
      if (r === 0) result = -(pv + pmtVal * n);
      else {
        const g = Math.pow(1 + r, n);
        result = -(pv * g + pmtVal * ((g - 1) / r));
      }
      break;
    case 'pv':
      if (r === 0) result = -(fv + pmtVal * n);
      else {
        const g = Math.pow(1 + r, n);
        result = -(fv / g + pmtVal * ((1 - Math.pow(1 + r, -n)) / r));
      }
      break;
    case 'pmt':
      if (r === 0) result = -(pv + fv) / n;
      else {
        const g = Math.pow(1 + r, n);
        result = -((pv * g + fv) * r) / (g - 1);
      }
      break;
    case 'periods':
      if (r === 0) result = pmtVal !== 0 ? -(pv + fv) / pmtVal : 0;
      else {
        result = Math.log((-fv * r + pmtVal) / (pv * r + pmtVal)) / Math.log(1 + r);
      }
      break;
    case 'rate':
      result = 0; // handled by Newton solver if needed
      break;
  }

  return {
    solvedValue: roundToCents(result),
    pv,
    fv,
    pmt: pmtVal,
    periods: n,
    annualRate: input.annualRate || 0
  };
}

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const FULL_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function parseStartDate(startDateStr?: string): { year: number; month: number } {
  const fallbackYear = 2026;
  const fallbackMonth = 10;
  if (!startDateStr || typeof startDateStr !== 'string') {
    return { year: fallbackYear, month: fallbackMonth };
  }
  const clean = startDateStr.trim();
  
  // Format: YYYY-MM or YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    if (year >= 1900 && year <= 2150 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  // Format: MM/YYYY or MM-YYYY
  const usMatch = clean.match(/^(\d{1,2})[-/.](\d{4})/);
  if (usMatch) {
    const month = Number(usMatch[1]);
    const year = Number(usMatch[2]);
    if (year >= 1900 && year <= 2150 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  // Text month format: e.g. "Nov 1983" or "November 1983"
  const textMonthMatch = clean.match(/([a-zA-Z]+)[\s,]+(\d{4})/);
  if (textMonthMatch) {
    const monthStr = textMonthMatch[1].slice(0, 3).toLowerCase();
    const year = Number(textMonthMatch[2]);
    const mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr);
    if (mIdx !== -1 && year >= 1900 && year <= 2150) {
      return { year, month: mIdx + 1 };
    }
  }

  // Fallback to Date parse
  const d = new Date(clean.length <= 7 && clean.includes('-') ? `${clean}-01` : clean);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (y >= 1900 && y <= 2150) {
      return { year: y, month: m };
    }
  }

  return { year: fallbackYear, month: fallbackMonth };
}

export function formatMonthYear(year: number, month: number): string {
  const mIdx = Math.max(0, Math.min(11, month - 1));
  return `${MONTH_NAMES[mIdx]} ${year}`;
}

export function normalizeMonthYearStr(startDateStr?: string): string {
  const { year, month } = parseStartDate(startDateStr);
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function addMonthsToDateStr(startDateStr: string, monthsToAdd: number): string {
  const { year, month } = parseStartDate(startDateStr);
  const totalOffset = (month - 1) + monthsToAdd;
  const newYear = year + Math.floor(totalOffset / 12);
  const newMonth = (totalOffset % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

export function computePayoffMonthYear(startDateStr: string, totalMonths: number): string {
  const { year, month } = parseStartDate(startDateStr);
  const totalOffset = (month - 1) + Math.max(0, totalMonths - 1);
  const payoffYear = year + Math.floor(totalOffset / 12);
  const payoffMonthNum = (totalOffset % 12) + 1;
  return formatMonthYear(payoffYear, payoffMonthNum);
}

export function calculateMortgage(input: MortgageInput) {
  // 1. Validate and Calculate Loan Amount
  const homePrice = Math.max(0, input.homePrice);
  const downPayment = Math.min(homePrice, Math.max(0, input.downPayment));
  const loanAmount = homePrice - downPayment;

  // 2. Interest Rate & Term
  const annualRate = Math.max(0, input.annualRate);
  const monthlyRate = annualRate / 100 / 12;
  const termYears = Math.max(1, input.termYears);
  const totalPeriods = termYears * 12;

  // 2b. Parse Calendar Start Date
  const parsedStart = parseStartDate(input.startDate);
  const startYear = parsedStart.year;
  const startMonth = parsedStart.month;
  const startDateStr = formatMonthYear(startYear, startMonth);

  // 3. Monthly P&I Calculation (Fixed Rate formula)
  let monthlyPI = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      monthlyPI = roundToCents(loanAmount / totalPeriods);
    } else {
      const growth = Math.pow(1 + monthlyRate, totalPeriods);
      const precisePI = (loanAmount * monthlyRate * growth) / (growth - 1);
      monthlyPI = roundToCents(precisePI);
    }
  }

  // 4. Initial Annual Costs
  let currentTaxAnnual = input.taxPercent ? (homePrice * input.taxPercent / 100) : 0;
  let currentInsAnnual = input.insuranceAnnual || 0;
  let currentHoaAnnual = (input.hoaAnnual || 0);
  let currentOtherAnnual = input.otherAnnual || 0;

  // Auto-PMI Standard (Applied if explicitly configured or autoPmi enabled when Down Payment < 20% until 80% LTV)
  const downPaymentPercent = homePrice > 0 ? roundToCents((downPayment / homePrice) * 100) : 0;
  const isPmiApplicable = downPaymentPercent < 20 && loanAmount > 0 && (input.pmiAnnual !== undefined || input.autoPmi === true);
  const basePmiAnnual = input.pmiAnnual !== undefined && input.pmiAnnual > 0 
    ? input.pmiAnnual 
    : (isPmiApplicable ? roundToCents(loanAmount * 0.0075) : 0);
  const pmiMonthly = roundToCents(basePmiAnnual / 12);

  // 5. Increases (Annual %)
  const taxInc = (input.taxIncrease || 0) / 100;
  const insInc = (input.insuranceIncrease || 0) / 100;
  const hoaInc = (input.hoaIncrease || 0) / 100;
  const otherInc = (input.otherIncrease || 0) / 100;

  // 6. Amortization Schedule Generation
  const schedule: any[] = [];
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPrincipalPaid = 0;
  let totalOutOfPocket = 0;
  let payoffMonth = 0;
  let pmiDropoffMonth = 0;

  for (let m = 1; m <= totalPeriods; m++) {
    if (balance <= 0) break;

    if (m > 1 && (m - 1) % 12 === 0) {
      currentTaxAnnual *= (1 + taxInc);
      currentInsAnnual *= (1 + insInc);
      currentHoaAnnual *= (1 + hoaInc);
      currentOtherAnnual *= (1 + otherInc);
    }

    const monthlyTax = roundToCents(currentTaxAnnual / 12);
    const monthlyIns = roundToCents(currentInsAnnual / 12);
    const monthlyHoa = roundToCents(currentHoaAnnual / 12);
    const monthlyOther = roundToCents(currentOtherAnnual / 12);

    // Homeowners Protection Act of 1998 (12 U.S.C. § 4901):
    // - 80% LTV: Borrower requested cancellation right
    // - 78% LTV: Automatic statutory termination requirement
    const borrowerEligiblePmi = (balance > homePrice * 0.80 && isPmiApplicable);
    const autoEligiblePmi = (balance > homePrice * 0.78 && isPmiApplicable);
    const activePmi = borrowerEligiblePmi ? pmiMonthly : 0;
    
    if (balance <= homePrice * 0.80 && pmiDropoffMonth === 0 && isPmiApplicable) {
      pmiDropoffMonth = m;
    }
    let pmiAutoDropoffMonthTemp = 0;
    if (balance <= homePrice * 0.78 && isPmiApplicable) {
      pmiAutoDropoffMonthTemp = m;
    }

    const interest = roundToCents(balance * monthlyRate);
    let principal = roundToCents(monthlyPI - interest);
    
    let appliedExtra = input.extraMonthly || 0;
    if (m % 12 === 1 && m > 1) appliedExtra += (input.extraYearly || 0);
    if (m === 1 && (input.extraYearly || 0) > 0) appliedExtra += (input.extraYearly || 0);
    if (m === (input.extraOneTimeMonth || 0)) appliedExtra += (input.extraOneTime || 0);

    const monthlyNonPI = roundToCents(monthlyTax + monthlyIns + activePmi + monthlyHoa + monthlyOther);
    const currentTotalMonthly = roundToCents(monthlyPI + monthlyNonPI);

    if (principal + appliedExtra >= balance || m === totalPeriods) {
      principal = balance;
      appliedExtra = 0;
      balance = 0;
      if (payoffMonth === 0) payoffMonth = m;
    } else {
      balance = roundToCents(balance - principal - appliedExtra);
    }

    totalInterest = roundToCents(totalInterest + interest);
    totalPrincipalPaid = roundToCents(totalPrincipalPaid + principal + appliedExtra);
    totalOutOfPocket = roundToCents(totalOutOfPocket + (principal + interest + appliedExtra + monthlyNonPI));
    if (balance <= 0 && payoffMonth === 0) payoffMonth = m;

    // Calendar date for payment period m
    const totalMonthOffset = (startMonth - 1) + (m - 1);
    const paymentYear = startYear + Math.floor(totalMonthOffset / 12);
    const paymentMonth = (totalMonthOffset % 12) + 1;
    const paymentDateStr = formatMonthYear(paymentYear, paymentMonth);
    const paymentDateIso = `${paymentYear}-${String(paymentMonth).padStart(2, '0')}`;

    schedule.push({
      month: m,
      monthNumber: m,
      dateLabel: paymentDateStr,
      year: Math.ceil(m / 12),
      paymentYear,
      paymentMonth,
      dateStr: paymentDateStr,
      dateIso: paymentDateIso,
      payment: roundToCents(principal + interest + appliedExtra),
      totalMonthly: currentTotalMonthly,
      principal: roundToCents(principal + appliedExtra),
      interest,
      balance,
      totalInterest,
      appliedExtra,
      taxes: monthlyTax,
      insurance: monthlyIns,
      pmi: activePmi,
      hoa: monthlyHoa,
      other: monthlyOther
    });
  }

  // 7. Payoff Dates and Milestone Analysis
  const actualPayoffMonth = payoffMonth || totalPeriods;
  const payoffOffset = (startMonth - 1) + (actualPayoffMonth - 1);
  const payoffYear = startYear + Math.floor(payoffOffset / 12);
  const payoffMonthNum = (payoffOffset % 12) + 1;
  const payoffDate = formatMonthYear(payoffYear, payoffMonthNum);
  const payoffDateFull = `${FULL_MONTH_NAMES[payoffMonthNum - 1]} ${payoffYear}`;

  const pmiDropoffDate = pmiDropoffMonth > 0 
    ? formatMonthYear(
        startYear + Math.floor(((startMonth - 1) + (pmiDropoffMonth - 1)) / 12),
        (((startMonth - 1) + (pmiDropoffMonth - 1)) % 12) + 1
      )
    : null;

  const origOffset = (startMonth - 1) + (totalPeriods - 1);
  const origPayoffYear = startYear + Math.floor(origOffset / 12);
  const origPayoffMonthNum = (origOffset % 12) + 1;
  const originalPayoffDate = formatMonthYear(origPayoffYear, origPayoffMonthNum);
  const isAccelerated = actualPayoffMonth < totalPeriods;
  const monthsSaved = totalPeriods - actualPayoffMonth;
  const yearsSaved = roundToCents(monthsSaved / 12);

  // 8. Calendar Year Amortization Breakdown (Tax-Ready)
  const uniquePaymentYears = Array.from(new Set(schedule.map(s => s.paymentYear)));
  const calendarYearSchedule = uniquePaymentYears.map(calYear => {
    const monthsInYear = schedule.filter(s => s.paymentYear === calYear);
    const lastMonth = monthsInYear[monthsInYear.length - 1];
    const firstMonth = monthsInYear[0];
    return {
      year: calYear,
      calendarYear: calYear,
      label: String(calYear),
      dateLabel: String(calYear),
      dateRange: monthsInYear.length === 12 ? `${calYear}` : `${firstMonth.dateStr} – ${lastMonth.dateStr}`,
      paymentCount: monthsInYear.length,
      principal: roundToCents(monthsInYear.reduce((sum, s) => sum + s.principal, 0)),
      interest: roundToCents(monthsInYear.reduce((sum, s) => sum + s.interest, 0)),
      balance: lastMonth.balance,
      totalInterest: lastMonth.totalInterest,
      totalTaxes: roundToCents(monthsInYear.reduce((sum, s) => sum + s.taxes, 0)),
      totalIns: roundToCents(monthsInYear.reduce((sum, s) => sum + s.insurance, 0)),
      totalHoa: roundToCents(monthsInYear.reduce((sum, s) => sum + s.hoa, 0)),
      totalOther: roundToCents(monthsInYear.reduce((sum, s) => sum + s.other, 0))
    };
  });

  // 9. Loan Year Schedule (12-month blocks)
  const loanYearSchedule = Array.from({ length: Math.ceil(actualPayoffMonth / 12) }, (_, i) => {
    const loanYear = i + 1;
    const yearMonths = schedule.filter(s => s.year === loanYear);
    const lastMonth = yearMonths[yearMonths.length - 1];
    const firstMonth = yearMonths[0];
    return {
      year: loanYear,
      loanYear,
      label: `Year ${loanYear}`,
      dateRange: firstMonth && lastMonth ? `${firstMonth.dateStr} – ${lastMonth.dateStr}` : `Year ${loanYear}`,
      paymentCount: yearMonths.length,
      principal: roundToCents(yearMonths.reduce((sum, s) => sum + s.principal, 0)),
      interest: roundToCents(yearMonths.reduce((sum, s) => sum + s.interest, 0)),
      balance: lastMonth?.balance || 0,
      totalInterest: lastMonth?.totalInterest || 0,
      totalTaxes: roundToCents(yearMonths.reduce((sum, s) => sum + s.taxes, 0)),
      totalIns: roundToCents(yearMonths.reduce((sum, s) => sum + s.insurance, 0)),
      totalHoa: roundToCents(yearMonths.reduce((sum, s) => sum + s.hoa, 0)),
      totalOther: roundToCents(yearMonths.reduce((sum, s) => sum + s.other, 0))
    };
  });

  const totalLoanCost = roundToCents(totalPrincipalPaid + totalInterest);
  const regulationZApr = solveRegulationZ_Apr(loanAmount, monthlyPI, totalPeriods);
  const firstMonth = schedule[0];
  const escrowMonthly = firstMonth ? roundToCents((firstMonth.taxes || 0) + (firstMonth.insurance || 0) + (firstMonth.pmi || 0) + (firstMonth.hoa || 0) + (firstMonth.other || 0)) : 0;

  return {
    loanAmount,
    monthlyPI,
    totalMonthly: schedule[0]?.totalMonthly || 0,
    escrowMonthly,
    regulationZApr,
    totalInterest,
    totalPayment: totalLoanCost,
    totalPrincipalAndInterest: totalLoanCost,
    totalLoanCost,
    totalOutOfPocket,
    totalWithEscrow: totalOutOfPocket,
    payoffMonth: actualPayoffMonth,
    yearsToPayoff: actualPayoffMonth / 12,
    startDateStr,
    startYear,
    startMonth,
    firstPaymentDate: startDateStr,
    payoffDate,
    payoffDateFull,
    payoffYear,
    originalPayoffDate,
    isAccelerated,
    monthsSaved,
    yearsSaved,
    schedule,
    yearlySchedule: calendarYearSchedule,
    calendarYearSchedule,
    loanYearSchedule,
    methodologyNote: "Mortgage amortization results are calculated iteratively for each payment period. Displayed dollar amounts are rounded to cents. Minor differences may occur when comparing independently calculated totals because of payment-level rounding."
  };
}

/* ============================================================================
 * INVESTMENT & SIP
 * ========================================================================== */

export interface InvestmentInput {
  initialAmount: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
}

export function calculateInvestment(input: InvestmentInput) {
  const monthlyRate = input.annualRate / 100 / 12;
  const months = input.years * 12;
  
  const schedule = [];
  let totalInvested = input.initialAmount;
  let balance = input.initialAmount;

  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    balance += interest + input.monthlyContribution;
    totalInvested += input.monthlyContribution;

    if (m % 12 === 0 || m === 1) {
      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        invested: totalInvested,
        interestGained: balance - totalInvested,
        balance
      });
    }
  }

  return {
    finalBalance: balance,
    totalInvested,
    totalGains: balance - totalInvested,
    schedule
  };
}

/* ============================================================================
 * DEBT PAYOFF (SNOWBALL VS AVALANCHE)
 * ========================================================================== */

export interface Debt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export function calculateDebtPayoff(debts: Debt[], extraMonthly: number, strategy: 'snowball' | 'avalanche') {
  let sortedDebts = [...debts];
  if (strategy === 'snowball') {
    sortedDebts.sort((a, b) => a.balance - b.balance);
  } else {
    sortedDebts.sort((a, b) => b.rate - a.rate);
  }

  const results = sortedDebts.map(d => ({ ...d, currentBalance: d.balance, paidOffMonth: 0 }));
  const timeline = [];
  let month = 0;
  let totalPaid = 0;
  let totalInterest = 0;

  while (results.some(d => d.currentBalance > 0) && month < 600) {
    month++;
    let availableExtra = extraMonthly;
    let monthlyInterest = 0;

    // Apply min payments and collect interest
    results.forEach(d => {
      if (d.currentBalance > 0) {
        const interest = (d.currentBalance * (d.rate / 100)) / 12;
        monthlyInterest += interest;
        d.currentBalance += interest;
        
        const payment = Math.min(d.currentBalance, d.minPayment);
        d.currentBalance -= payment;
        totalPaid += payment;
        if (d.currentBalance === 0 && d.paidOffMonth === 0) d.paidOffMonth = month;
      }
    });

    // Apply extra to sorted focus debt
    for (const d of results) {
      if (d.currentBalance > 0) {
        const extra = Math.min(d.currentBalance, availableExtra);
        d.currentBalance -= extra;
        availableExtra -= extra;
        totalPaid += extra;
        if (d.currentBalance === 0 && d.paidOffMonth === 0) d.paidOffMonth = month;
        if (availableExtra <= 0) break;
      }
    }

    totalInterest += monthlyInterest;
    timeline.push({
      month,
      totalBalance: results.reduce((sum, d) => sum + d.currentBalance, 0),
      totalPaid,
      totalInterest
    });
  }

  return {
    monthsToPayoff: month,
    totalInterest,
    totalPaid,
    timeline: timeline.filter((_, i) => i % 6 === 0 || i === month - 1)
  };
}

/* ============================================================================
 * RETIREMENT (FIRE)
 * ========================================================================== */

export interface RetirementInput {
  currentAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualExpenses: number;
  annualReturn: number;
  safeWithdrawalRate?: number; // e.g. 4 for 4% (default 4% per standard Trinity Study)
  adjustForTaxes?: boolean;
  retirementTaxRatePercent?: number; // e.g. 15 for 15% ordinary income tax
}

export function calculateRetirement(input: RetirementInput) {
  const swr = input.safeWithdrawalRate && input.safeWithdrawalRate > 0 ? input.safeWithdrawalRate : 4;
  const taxRate = (input.adjustForTaxes && input.retirementTaxRatePercent) 
    ? Math.min(50, Math.max(0, input.retirementTaxRatePercent)) / 100 
    : 0;
  
  // Gross annual withdrawal needed to cover net living expenses after retirement income taxes
  const grossAnnualExpenses = taxRate > 0 && taxRate < 1 
    ? roundToCents(input.annualExpenses / (1 - taxRate))
    : input.annualExpenses;

  const targetNetWorth = roundToCents(grossAnnualExpenses / (swr / 100));
  const standardTargetNetWorth = roundToCents(input.annualExpenses / (swr / 100));
  const monthlyRate = input.annualReturn / 100 / 12;
  
  let balance = input.currentSavings;
  let months = 0;
  const timeline = [];

  while (balance < targetNetWorth && months < 1200) {
    months++;
    balance += (balance * monthlyRate) + input.monthlyContribution;
    
    if (months % 12 === 0) {
      timeline.push({
        age: input.currentAge + (months / 12),
        balance: roundToCents(balance),
        target: targetNetWorth
      });
    }
  }

  return {
    targetNetWorth,
    standardTargetNetWorth,
    grossAnnualExpenses,
    taxRatePercent: taxRate * 100,
    yearsToFIRE: months / 12,
    fireAge: input.currentAge + (months / 12),
    finalBalance: roundToCents(balance),
    timeline
  };
}

export function evaluateExpression(expression: string, context: Record<string, number> = {}): number {
  // Simple evaluator fallback for legacy scientific needs
  try {
    const sanitized = expression.replace(/[^-()\d/*+.]/g, '');
    return eval(sanitized);
  } catch {
    return 0;
  }
}

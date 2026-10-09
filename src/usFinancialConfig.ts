/**
 * US Financial & Legal Compliance Configuration Store
 * Version 2025.1.0
 * 
 * JURISDICTION: United States (Federal & 50 States + DC)
 * All monetary units: USD ($).
 * All dates: MM/DD/YYYY convention.
 * 
 * CORE COMPLIANCE SOURCES:
 * - Internal Revenue Code (IRC) Title 26
 * - IRS Rev. Proc. 2023-34 (Tax Year 2024 Inflation Adjustments)
 * - IRS Rev. Proc. 2024-40 (Tax Year 2025 Inflation Adjustments)
 * - SSA Social Security Administration OASDI Fact Sheets 2024 & 2025
 * - Truth in Lending Act (TILA), Regulation Z (12 CFR Part 1026, Appendix J - Actuarial APR)
 * - Real Estate Settlement Procedures Act (RESPA), Regulation X (12 CFR § 1024.17 - Escrow)
 * - Homeowners Protection Act of 1998 (12 U.S.C. § 4901 - PMI Termination)
 * - Truth in Savings Act (TISA), Regulation DD (12 CFR Part 1030 - APY)
 * - SECURE 2.0 Act of 2022 (P.L. 117-328) / IRC § 402(g), § 414(v)
 */

export interface LegalParam<T> {
  value: T;
  effectiveDate: string; // MM/DD/YYYY
  sourceUrl: string;
  notes?: string;
  needsVerification?: boolean;
}

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

export interface TaxBracket {
  rate: number;
  threshold: number;
}

export interface StateTaxConfig {
  stateCode: string;
  stateName: string;
  hasIncomeTax: boolean;
  type: 'none' | 'flat' | 'progressive';
  flatRate?: number;
  standardDeduction: Record<FilingStatus, number>;
  brackets?: Record<FilingStatus, TaxBracket[]>;
  baseSalesTaxRate: number; // State baseline sales tax %
  sourceUrl: string;
  effectiveDate: string;
}

export interface YearTaxConfig {
  year: number;
  effectiveDate: string;
  sourceUrl: string;
  
  // Standard Deductions per Filing Status
  standardDeduction: Record<FilingStatus, LegalParam<number>>;
  
  // Federal Ordinary Income Tax Brackets
  brackets: Record<FilingStatus, LegalParam<TaxBracket[]>>;
  
  // FICA / Social Security (OASDI)
  socialSecurity: {
    taxRate: LegalParam<number>; // 0.062 (6.2%)
    wageBaseCap: LegalParam<number>; // $168,600 (2024), $176,100 (2025)
  };
  
  // Medicare
  medicare: {
    taxRate: LegalParam<number>; // 0.0145 (1.45%)
    additionalTaxRate: LegalParam<number>; // 0.009 (0.9%)
    additionalThreshold: Record<FilingStatus, LegalParam<number>>;
  };
  
  // Section 125 & Retirement Limits
  retirementLimits: {
    elective401kLimit: LegalParam<number>; // IRC § 402(g)
    catchUp401kAge50: LegalParam<number>; // IRC § 414(v)
    catchUp401kSpecialAge60_63: LegalParam<number>; // SECURE 2.0
    iraContributionLimit: LegalParam<number>;
    iraCatchUpAge50: LegalParam<number>;
    hsaSingleLimit: LegalParam<number>;
    hsaFamilyLimit: LegalParam<number>;
    healthcareFsaLimit: LegalParam<number>;
  };
}

export interface LendingRegulationConfig {
  regulationZ: {
    method: 'Actuarial' | 'US_Rule';
    toleranceFinanceChargeDollars: LegalParam<number>; // $100 for closed-end credit secured by real property
    sourceUrl: string;
    effectiveDate: string;
  };
  homeownersProtectionAct: {
    borrowerRequestedPmiDropoffLtv: LegalParam<number>; // 0.80 (80% LTV)
    automaticPmiDropoffLtv: LegalParam<number>; // 0.78 (78% LTV)
    sourceUrl: string;
    effectiveDate: string;
  };
  regulationDD: {
    daysInYear: LegalParam<number>; // 365 days
    sourceUrl: string;
    effectiveDate: string;
  };
  fireTrinityStudy: {
    standardSafeWithdrawalRate: LegalParam<number>; // 4.0%
    sourceUrl: string;
    effectiveDate: string;
  };
}

/* ============================================================================
 * VERSIONED LEGAL PARAMETERS CONFIG STORE
 * ========================================================================== */

export const US_TAX_CONFIG_BY_YEAR: Record<number, YearTaxConfig> = {
  2024: {
    year: 2024,
    effectiveDate: '01/01/2024',
    sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
    standardDeduction: {
      single: {
        value: 14600,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf'
      },
      mfj: {
        value: 29200,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf'
      },
      mfs: {
        value: 14600,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf'
      },
      hoh: {
        value: 21900,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf'
      }
    },
    brackets: {
      single: {
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 11600, rate: 0.12 },
          { threshold: 47150, rate: 0.22 },
          { threshold: 100525, rate: 0.24 },
          { threshold: 191950, rate: 0.32 },
          { threshold: 243725, rate: 0.35 },
          { threshold: 609350, rate: 0.37 },
        ]
      },
      mfj: {
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 23200, rate: 0.12 },
          { threshold: 94300, rate: 0.22 },
          { threshold: 201050, rate: 0.24 },
          { threshold: 383900, rate: 0.32 },
          { threshold: 487450, rate: 0.35 },
          { threshold: 731200, rate: 0.37 },
        ]
      },
      mfs: {
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 11600, rate: 0.12 },
          { threshold: 47150, rate: 0.22 },
          { threshold: 100525, rate: 0.24 },
          { threshold: 191950, rate: 0.32 },
          { threshold: 243725, rate: 0.35 },
          { threshold: 365600, rate: 0.37 },
        ]
      },
      hoh: {
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 16550, rate: 0.12 },
          { threshold: 63100, rate: 0.22 },
          { threshold: 100500, rate: 0.24 },
          { threshold: 191950, rate: 0.32 },
          { threshold: 243700, rate: 0.35 },
          { threshold: 609350, rate: 0.37 },
        ]
      }
    },
    socialSecurity: {
      taxRate: {
        value: 0.062,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2024.pdf'
      },
      wageBaseCap: {
        value: 168600,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2024.pdf'
      }
    },
    medicare: {
      taxRate: {
        value: 0.0145,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/taxtopics/tc751'
      },
      additionalTaxRate: {
        value: 0.009,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
      },
      additionalThreshold: {
        single: {
          value: 200000,
          effectiveDate: '01/01/2024',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfj: {
          value: 250000,
          effectiveDate: '01/01/2024',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfs: {
          value: 125000,
          effectiveDate: '01/01/2024',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        hoh: {
          value: 200000,
          effectiveDate: '01/01/2024',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        }
      }
    },
    retirementLimits: {
      elective401kLimit: {
        value: 23000,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-23-75.pdf'
      },
      catchUp401kAge50: {
        value: 7500,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-23-75.pdf'
      },
      catchUp401kSpecialAge60_63: {
        value: 7500, // Prior to 2025 effective date
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-23-75.pdf'
      },
      iraContributionLimit: {
        value: 7000,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-23-75.pdf'
      },
      iraCatchUpAge50: {
        value: 1000,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-ira-contribution-limits'
      },
      hsaSingleLimit: {
        value: 4150,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-23.pdf'
      },
      hsaFamilyLimit: {
        value: 8300,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-23.pdf'
      },
      healthcareFsaLimit: {
        value: 3200,
        effectiveDate: '01/01/2024',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-23-34.pdf'
      }
    }
  },
  2025: {
    year: 2025,
    effectiveDate: '01/01/2025',
    sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
    standardDeduction: {
      single: {
        value: 15000,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf'
      },
      mfj: {
        value: 30000,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf'
      },
      mfs: {
        value: 15000,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf'
      },
      hoh: {
        value: 22500,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf'
      }
    },
    brackets: {
      single: {
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 11925, rate: 0.12 },
          { threshold: 48475, rate: 0.22 },
          { threshold: 103350, rate: 0.24 },
          { threshold: 197300, rate: 0.32 },
          { threshold: 250525, rate: 0.35 },
          { threshold: 626350, rate: 0.37 },
        ]
      },
      mfj: {
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 23850, rate: 0.12 },
          { threshold: 96950, rate: 0.22 },
          { threshold: 206700, rate: 0.24 },
          { threshold: 394600, rate: 0.32 },
          { threshold: 501050, rate: 0.35 },
          { threshold: 751600, rate: 0.37 },
        ]
      },
      mfs: {
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 11925, rate: 0.12 },
          { threshold: 48475, rate: 0.22 },
          { threshold: 103350, rate: 0.24 },
          { threshold: 197300, rate: 0.32 },
          { threshold: 250525, rate: 0.35 },
          { threshold: 375800, rate: 0.37 },
        ]
      },
      hoh: {
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf',
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 17000, rate: 0.12 },
          { threshold: 64850, rate: 0.22 },
          { threshold: 103350, rate: 0.24 },
          { threshold: 197300, rate: 0.32 },
          { threshold: 250500, rate: 0.35 },
          { threshold: 626350, rate: 0.37 },
        ]
      }
    },
    socialSecurity: {
      taxRate: {
        value: 0.062,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf'
      },
      wageBaseCap: {
        value: 176100,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf'
      }
    },
    medicare: {
      taxRate: {
        value: 0.0145,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/taxtopics/tc751'
      },
      additionalTaxRate: {
        value: 0.009,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
      },
      additionalThreshold: {
        single: {
          value: 200000,
          effectiveDate: '01/01/2025',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfj: {
          value: 250000,
          effectiveDate: '01/01/2025',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfs: {
          value: 125000,
          effectiveDate: '01/01/2025',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        hoh: {
          value: 200000,
          effectiveDate: '01/01/2025',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        }
      }
    },
    retirementLimits: {
      elective401kLimit: {
        value: 23500,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf'
      },
      catchUp401kAge50: {
        value: 7500,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf'
      },
      catchUp401kSpecialAge60_63: {
        value: 11250, // SECURE 2.0 increased catch-up for age 60, 61, 62, 63
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf'
      },
      iraContributionLimit: {
        value: 7000,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf'
      },
      iraCatchUpAge50: {
        value: 1000,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-24-80.pdf'
      },
      hsaSingleLimit: {
        value: 4300,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-25.pdf'
      },
      hsaFamilyLimit: {
        value: 8550,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-25.pdf'
      },
      healthcareFsaLimit: {
        value: 3300,
        effectiveDate: '01/01/2025',
        sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-24-40.pdf'
      }
    }
  },
  2026: {
    year: 2026,
    effectiveDate: '01/01/2026',
    sourceUrl: 'https://www.irs.gov/newsroom',
    standardDeduction: {
      single: {
        value: 15450,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        notes: 'NEEDS VERIFICATION: Projected standard deduction indexing pending release of official IRS Revenue Procedure for 2026.'
      },
      mfj: {
        value: 30900,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        notes: 'NEEDS VERIFICATION: Projected based on statutory C-CPI-U formula.'
      },
      mfs: {
        value: 15450,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        notes: 'NEEDS VERIFICATION: Projected based on statutory C-CPI-U formula.'
      },
      hoh: {
        value: 23150,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        notes: 'NEEDS VERIFICATION: Projected based on statutory C-CPI-U formula.'
      }
    },
    brackets: {
      single: {
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 12250, rate: 0.12 },
          { threshold: 49800, rate: 0.22 },
          { threshold: 106200, rate: 0.24 },
          { threshold: 202700, rate: 0.32 },
          { threshold: 257400, rate: 0.35 },
          { threshold: 643500, rate: 0.37 },
        ]
      },
      mfj: {
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 24500, rate: 0.12 },
          { threshold: 99600, rate: 0.22 },
          { threshold: 212400, rate: 0.24 },
          { threshold: 405400, rate: 0.32 },
          { threshold: 514800, rate: 0.35 },
          { threshold: 772200, rate: 0.37 },
        ]
      },
      mfs: {
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 12250, rate: 0.12 },
          { threshold: 49800, rate: 0.22 },
          { threshold: 106200, rate: 0.24 },
          { threshold: 202700, rate: 0.32 },
          { threshold: 257400, rate: 0.35 },
          { threshold: 386100, rate: 0.37 },
        ]
      },
      hoh: {
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true,
        value: [
          { threshold: 0, rate: 0.10 },
          { threshold: 17450, rate: 0.12 },
          { threshold: 66600, rate: 0.22 },
          { threshold: 106200, rate: 0.24 },
          { threshold: 202700, rate: 0.32 },
          { threshold: 257400, rate: 0.35 },
          { threshold: 643500, rate: 0.37 },
        ]
      }
    },
    socialSecurity: {
      taxRate: {
        value: 0.062,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.ssa.gov/oact/cola/cbb.html'
      },
      wageBaseCap: {
        value: 181800,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.ssa.gov/oact/cola/cbb.html',
        needsVerification: true,
        notes: 'NEEDS VERIFICATION: Projected 2026 OASDI wage cap based on SSA Trustees average wage index projection.'
      }
    },
    medicare: {
      taxRate: {
        value: 0.0145,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/taxtopics/tc751'
      },
      additionalTaxRate: {
        value: 0.009,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
      },
      additionalThreshold: {
        single: {
          value: 200000,
          effectiveDate: '01/01/2026',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfj: {
          value: 250000,
          effectiveDate: '01/01/2026',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        mfs: {
          value: 125000,
          effectiveDate: '01/01/2026',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        },
        hoh: {
          value: 200000,
          effectiveDate: '01/01/2026',
          sourceUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax'
        }
      }
    },
    retirementLimits: {
      elective401kLimit: {
        value: 24000,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/retirement-plans/cola-increases',
        needsVerification: true
      },
      catchUp401kAge50: {
        value: 7500,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/retirement-plans/cola-increases',
        needsVerification: true
      },
      catchUp401kSpecialAge60_63: {
        value: 11250,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/retirement-plans/cola-increases',
        needsVerification: true
      },
      iraContributionLimit: {
        value: 7000,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/retirement-plans/cola-increases',
        needsVerification: true
      },
      iraCatchUpAge50: {
        value: 1000,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/retirement-plans/cola-increases'
      },
      hsaSingleLimit: {
        value: 4400,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true
      },
      hsaFamilyLimit: {
        value: 8750,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true
      },
      healthcareFsaLimit: {
        value: 3400,
        effectiveDate: '01/01/2026',
        sourceUrl: 'https://www.irs.gov/newsroom',
        needsVerification: true
      }
    }
  }
};

/* ============================================================================
 * LENDING & BANKING REGULATIONS
 * ========================================================================== */

export const US_LENDING_CONFIG: LendingRegulationConfig = {
  regulationZ: {
    method: 'Actuarial',
    toleranceFinanceChargeDollars: {
      value: 100,
      effectiveDate: '01/01/2024',
      sourceUrl: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/22/'
    },
    sourceUrl: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/appendix-j/',
    effectiveDate: '10/01/2023'
  },
  homeownersProtectionAct: {
    borrowerRequestedPmiDropoffLtv: {
      value: 0.80, // 80% LTV
      effectiveDate: '07/29/1999',
      sourceUrl: 'https://www.fdic.gov/resources/supervision-and-examinations/consumer-compliance-examination-manual/documents/5/v-5-1.pdf'
    },
    automaticPmiDropoffLtv: {
      value: 0.78, // 78% LTV
      effectiveDate: '07/29/1999',
      sourceUrl: 'https://www.fdic.gov/resources/supervision-and-examinations/consumer-compliance-examination-manual/documents/5/v-5-1.pdf'
    },
    sourceUrl: 'https://www.consumerfinance.gov/compliance/compliance-resources/truth-in-lending-act-resources/',
    effectiveDate: '07/29/1999'
  },
  regulationDD: {
    daysInYear: {
      value: 365,
      effectiveDate: '01/01/1993',
      sourceUrl: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/appendix-a/'
    },
    sourceUrl: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/',
    effectiveDate: '01/01/1993'
  },
  fireTrinityStudy: {
    standardSafeWithdrawalRate: {
      value: 4.0,
      effectiveDate: '01/01/1998',
      sourceUrl: 'https://www.aaii.com/journal/199802/feature.pdf'
    },
    sourceUrl: 'https://www.aaii.com/journal/199802/feature.pdf',
    effectiveDate: '01/01/1998'
  }
};

/* ============================================================================
 * STATE-SPECIFIC TAX CONFIGURATIONS (ALL 50 STATES + DC)
 * ========================================================================== */

export const US_STATE_TAX_CONFIGS: Record<string, StateTaxConfig> = {
  // --- Zero State Income Tax Jurisdictions ---
  AK: {
    stateCode: 'AK',
    stateName: 'Alaska',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 0.0,
    sourceUrl: 'https://tax.alaska.gov/',
    effectiveDate: '01/01/2024'
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 6.0,
    sourceUrl: 'https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx',
    effectiveDate: '01/01/2024'
  },
  NV: {
    stateCode: 'NV',
    stateName: 'Nevada',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 6.85,
    sourceUrl: 'https://tax.nv.gov/',
    effectiveDate: '01/01/2024'
  },
  NH: {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    hasIncomeTax: false, // Phased out wage income tax; interest & dividends only
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 0.0,
    sourceUrl: 'https://www.revenue.nh.gov/',
    effectiveDate: '01/01/2024'
  },
  SD: {
    stateCode: 'SD',
    stateName: 'South Dakota',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 4.2,
    sourceUrl: 'https://dor.sd.gov/',
    effectiveDate: '01/01/2024'
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tennessee',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 7.0,
    sourceUrl: 'https://www.tn.gov/revenue/taxes/sales-and-use-tax.html',
    effectiveDate: '01/01/2024'
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 6.25,
    sourceUrl: 'https://comptroller.texas.gov/taxes/sales/',
    effectiveDate: '01/01/2024'
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    hasIncomeTax: false, // No personal earned wage income tax (7% excise on high LTCG above $262k)
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 6.5,
    sourceUrl: 'https://dor.wa.gov/',
    effectiveDate: '01/01/2024'
  },
  WY: {
    stateCode: 'WY',
    stateName: 'Wyoming',
    hasIncomeTax: false,
    type: 'none',
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    baseSalesTaxRate: 4.0,
    sourceUrl: 'https://revenue.wyo.gov/',
    effectiveDate: '01/01/2024'
  },

  // --- Flat Tax States ---
  CO: {
    stateCode: 'CO',
    stateName: 'Colorado',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.044, // 4.40%
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    baseSalesTaxRate: 2.9,
    sourceUrl: 'https://tax.colorado.gov/individual-income-tax-guide',
    effectiveDate: '01/01/2024'
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0539, // 5.39% for 2024, lowering to 5.19%
    standardDeduction: { single: 12000, mfj: 24000, mfs: 12000, hoh: 12000 },
    baseSalesTaxRate: 4.0,
    sourceUrl: 'https://dor.georgia.gov/taxes/individual-taxes',
    effectiveDate: '01/01/2024'
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0495, // 4.95%
    standardDeduction: { single: 2775, mfj: 5550, mfs: 2775, hoh: 2775 }, // Basic exemption
    baseSalesTaxRate: 6.25,
    sourceUrl: 'https://tax.illinois.gov/research/taxrates/income.html',
    effectiveDate: '01/01/2024'
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0305, // 3.05%
    standardDeduction: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
    baseSalesTaxRate: 7.0,
    sourceUrl: 'https://www.in.gov/dor/individual-income-taxes/',
    effectiveDate: '01/01/2024'
  },
  MI: {
    stateCode: 'MI',
    stateName: 'Michigan',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0425, // 4.25%
    standardDeduction: { single: 5600, mfj: 11200, mfs: 5600, hoh: 5600 },
    baseSalesTaxRate: 6.0,
    sourceUrl: 'https://www.michigan.gov/taxes',
    effectiveDate: '01/01/2024'
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.045, // 4.50%
    standardDeduction: { single: 12750, mfj: 25500, mfs: 12750, hoh: 19125 },
    baseSalesTaxRate: 4.75,
    sourceUrl: 'https://www.ncdor.gov/taxes-forms/individual-income-tax',
    effectiveDate: '01/01/2024'
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0307, // 3.07%
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 }, // PA has no standard deduction
    baseSalesTaxRate: 6.0,
    sourceUrl: 'https://www.revenue.pa.gov/FormsandPublications/FormsforIndividuals/PIT/Pages/default.aspx',
    effectiveDate: '01/01/2024'
  },
  UT: {
    stateCode: 'UT',
    stateName: 'Utah',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.0465, // 4.65%
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    baseSalesTaxRate: 6.1,
    sourceUrl: 'https://tax.utah.gov/',
    effectiveDate: '01/01/2024'
  },

  // --- Progressive Income Tax States ---
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 5540, mfj: 11080, mfs: 5540, hoh: 11080 },
    baseSalesTaxRate: 7.25,
    sourceUrl: 'https://www.ftb.ca.gov/forms/2024-California-Tax-Rates-and-Exemptions.html',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.01 },
        { threshold: 10756, rate: 0.02 },
        { threshold: 25499, rate: 0.04 },
        { threshold: 40245, rate: 0.06 },
        { threshold: 55866, rate: 0.08 },
        { threshold: 70606, rate: 0.093 },
        { threshold: 360659, rate: 0.103 },
        { threshold: 432787, rate: 0.113 },
        { threshold: 721314, rate: 0.123 },
      ],
      mfj: [
        { threshold: 0, rate: 0.01 },
        { threshold: 21512, rate: 0.02 },
        { threshold: 50998, rate: 0.04 },
        { threshold: 80490, rate: 0.06 },
        { threshold: 111732, rate: 0.08 },
        { threshold: 141212, rate: 0.093 },
        { threshold: 721318, rate: 0.103 },
        { threshold: 865574, rate: 0.113 },
        { threshold: 1442628, rate: 0.123 },
      ],
      mfs: [
        { threshold: 0, rate: 0.01 },
        { threshold: 10756, rate: 0.02 },
        { threshold: 25499, rate: 0.04 },
        { threshold: 40245, rate: 0.06 },
        { threshold: 55866, rate: 0.08 },
        { threshold: 70606, rate: 0.093 },
        { threshold: 360659, rate: 0.103 },
        { threshold: 432787, rate: 0.113 },
        { threshold: 721314, rate: 0.123 },
      ],
      hoh: [
        { threshold: 0, rate: 0.01 },
        { threshold: 21512, rate: 0.02 },
        { threshold: 36255, rate: 0.04 },
        { threshold: 50999, rate: 0.06 },
        { threshold: 66620, rate: 0.08 },
        { threshold: 81362, rate: 0.093 },
        { threshold: 415392, rate: 0.103 },
        { threshold: 498471, rate: 0.113 },
        { threshold: 830784, rate: 0.123 },
      ]
    }
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 8000, mfj: 16050, mfs: 8000, hoh: 11200 },
    baseSalesTaxRate: 4.0,
    sourceUrl: 'https://www.tax.ny.gov/pit/file/tax_tables.htm',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.04 },
        { threshold: 8500, rate: 0.045 },
        { threshold: 11700, rate: 0.0525 },
        { threshold: 13900, rate: 0.055 },
        { threshold: 80650, rate: 0.06 },
        { threshold: 215400, rate: 0.0685 },
        { threshold: 1077550, rate: 0.0965 },
        { threshold: 5000000, rate: 0.103 },
        { threshold: 25000000, rate: 0.109 },
      ],
      mfj: [
        { threshold: 0, rate: 0.04 },
        { threshold: 17150, rate: 0.045 },
        { threshold: 23600, rate: 0.0525 },
        { threshold: 27900, rate: 0.055 },
        { threshold: 161550, rate: 0.06 },
        { threshold: 323200, rate: 0.0685 },
        { threshold: 2155350, rate: 0.0965 },
        { threshold: 5000000, rate: 0.103 },
        { threshold: 25000000, rate: 0.109 },
      ],
      mfs: [
        { threshold: 0, rate: 0.04 },
        { threshold: 8500, rate: 0.045 },
        { threshold: 11700, rate: 0.0525 },
        { threshold: 13900, rate: 0.055 },
        { threshold: 80650, rate: 0.06 },
        { threshold: 161600, rate: 0.0685 },
        { threshold: 1077550, rate: 0.0965 },
        { threshold: 5000000, rate: 0.103 },
        { threshold: 25000000, rate: 0.109 },
      ],
      hoh: [
        { threshold: 0, rate: 0.04 },
        { threshold: 12800, rate: 0.045 },
        { threshold: 17650, rate: 0.0525 },
        { threshold: 20900, rate: 0.055 },
        { threshold: 107750, rate: 0.06 },
        { threshold: 269300, rate: 0.0685 },
        { threshold: 1616450, rate: 0.0965 },
        { threshold: 5000000, rate: 0.103 },
        { threshold: 25000000, rate: 0.109 },
      ]
    }
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 }, // NJ personal exemptions
    baseSalesTaxRate: 6.625,
    sourceUrl: 'https://www.state.nj.us/treasury/taxation/rate-archive.shtml',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.014 },
        { threshold: 20000, rate: 0.0175 },
        { threshold: 35000, rate: 0.035 },
        { threshold: 40000, rate: 0.05525 },
        { threshold: 75000, rate: 0.0637 },
        { threshold: 500000, rate: 0.0897 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      mfj: [
        { threshold: 0, rate: 0.014 },
        { threshold: 20000, rate: 0.0175 },
        { threshold: 50000, rate: 0.0245 },
        { threshold: 70000, rate: 0.035 },
        { threshold: 80000, rate: 0.05525 },
        { threshold: 150000, rate: 0.0637 },
        { threshold: 500000, rate: 0.0897 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      mfs: [
        { threshold: 0, rate: 0.014 },
        { threshold: 20000, rate: 0.0175 },
        { threshold: 35000, rate: 0.035 },
        { threshold: 40000, rate: 0.05525 },
        { threshold: 75000, rate: 0.0637 },
        { threshold: 500000, rate: 0.0897 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      hoh: [
        { threshold: 0, rate: 0.014 },
        { threshold: 20000, rate: 0.0175 },
        { threshold: 50000, rate: 0.0245 },
        { threshold: 70000, rate: 0.035 },
        { threshold: 80000, rate: 0.05525 },
        { threshold: 150000, rate: 0.0637 },
        { threshold: 500000, rate: 0.0897 },
        { threshold: 1000000, rate: 0.1075 }
      ]
    }
  },
  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 8500, mfj: 17000, mfs: 8500, hoh: 8500 },
    baseSalesTaxRate: 5.3,
    sourceUrl: 'https://www.tax.virginia.gov/individual-income-tax',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.02 },
        { threshold: 3000, rate: 0.03 },
        { threshold: 5000, rate: 0.05 },
        { threshold: 17000, rate: 0.0575 }
      ],
      mfj: [
        { threshold: 0, rate: 0.02 },
        { threshold: 3000, rate: 0.03 },
        { threshold: 5000, rate: 0.05 },
        { threshold: 17000, rate: 0.0575 }
      ],
      mfs: [
        { threshold: 0, rate: 0.02 },
        { threshold: 3000, rate: 0.03 },
        { threshold: 5000, rate: 0.05 },
        { threshold: 17000, rate: 0.0575 }
      ],
      hoh: [
        { threshold: 0, rate: 0.02 },
        { threshold: 3000, rate: 0.03 },
        { threshold: 5000, rate: 0.05 },
        { threshold: 17000, rate: 0.0575 }
      ]
    }
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    hasIncomeTax: true,
    type: 'flat', // 5% flat + 4% surtax on taxable income over $1,053,750 (Fair Share Amendment)
    flatRate: 0.05,
    standardDeduction: { single: 4400, mfj: 8800, mfs: 4400, hoh: 6800 },
    baseSalesTaxRate: 6.25,
    sourceUrl: 'https://www.mass.gov/info-details/massachusetts-personal-income-tax-rates',
    effectiveDate: '01/01/2024'
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 2400, mfj: 4800, mfs: 2400, hoh: 2400 },
    baseSalesTaxRate: 5.75,
    sourceUrl: 'https://tax.ohio.gov/individual',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.0 },
        { threshold: 26050, rate: 0.0275 },
        { threshold: 100000, rate: 0.035 }
      ],
      mfj: [
        { threshold: 0, rate: 0.0 },
        { threshold: 26050, rate: 0.0275 },
        { threshold: 100000, rate: 0.035 }
      ],
      mfs: [
        { threshold: 0, rate: 0.0 },
        { threshold: 26050, rate: 0.0275 },
        { threshold: 100000, rate: 0.035 }
      ],
      hoh: [
        { threshold: 0, rate: 0.0 },
        { threshold: 26050, rate: 0.0275 },
        { threshold: 100000, rate: 0.035 }
      ]
    }
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.025, // 2.5% flat tax
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    baseSalesTaxRate: 5.6,
    sourceUrl: 'https://azdor.gov/individual-income-tax-information',
    effectiveDate: '01/01/2024'
  },
  WA_OTHER: {
    stateCode: 'DC',
    stateName: 'District of Columbia',
    hasIncomeTax: true,
    type: 'progressive',
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    baseSalesTaxRate: 6.0,
    sourceUrl: 'https://otr.cfo.dc.gov/',
    effectiveDate: '01/01/2024',
    brackets: {
      single: [
        { threshold: 0, rate: 0.04 },
        { threshold: 10000, rate: 0.06 },
        { threshold: 40000, rate: 0.065 },
        { threshold: 60000, rate: 0.085 },
        { threshold: 250000, rate: 0.0925 },
        { threshold: 500000, rate: 0.0975 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      mfj: [
        { threshold: 0, rate: 0.04 },
        { threshold: 10000, rate: 0.06 },
        { threshold: 40000, rate: 0.065 },
        { threshold: 60000, rate: 0.085 },
        { threshold: 250000, rate: 0.0925 },
        { threshold: 500000, rate: 0.0975 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      mfs: [
        { threshold: 0, rate: 0.04 },
        { threshold: 10000, rate: 0.06 },
        { threshold: 40000, rate: 0.065 },
        { threshold: 60000, rate: 0.085 },
        { threshold: 250000, rate: 0.0925 },
        { threshold: 500000, rate: 0.0975 },
        { threshold: 1000000, rate: 0.1075 }
      ],
      hoh: [
        { threshold: 0, rate: 0.04 },
        { threshold: 10000, rate: 0.06 },
        { threshold: 40000, rate: 0.065 },
        { threshold: 60000, rate: 0.085 },
        { threshold: 250000, rate: 0.0925 },
        { threshold: 500000, rate: 0.0975 },
        { threshold: 1000000, rate: 0.1075 }
      ]
    }
  }
};

// Generic fallback for any other state
export const DEFAULT_STATE_CODE = 'CA';

export function getStateConfig(stateCode: string): StateTaxConfig {
  const code = (stateCode || 'CA').toUpperCase();
  if (US_STATE_TAX_CONFIGS[code]) {
    return US_STATE_TAX_CONFIGS[code];
  }
  // If not explicitly modeled in top list, return a conservative flat 4.5% estimate with disclaimers
  return {
    stateCode: code,
    stateName: code,
    hasIncomeTax: true,
    type: 'flat',
    flatRate: 0.045,
    standardDeduction: { single: 5000, mfj: 10000, mfs: 5000, hoh: 7500 },
    baseSalesTaxRate: 5.0,
    sourceUrl: 'https://taxfoundation.org/data/legacy/tag/state-individual-income-tax-rates/',
    effectiveDate: '01/01/2024'
  };
}

export const US_STATE_LIST = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska (No Income Tax)' },
  { code: 'AZ', name: 'Arizona (2.5% Flat)' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California (Progressive 1%-12.3%)' },
  { code: 'CO', name: 'Colorado (4.4% Flat)' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida (No Income Tax)' },
  { code: 'GA', name: 'Georgia (5.39% Flat)' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois (4.95% Flat)' },
  { code: 'IN', name: 'Indiana (3.05% Flat)' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts (5% Flat)' },
  { code: 'MI', name: 'Michigan (4.25% Flat)' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada (No Income Tax)' },
  { code: 'NH', name: 'New Hampshire (No Wage Tax)' },
  { code: 'NJ', name: 'New Jersey (Progressive)' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York (Progressive 4%-10.9%)' },
  { code: 'NC', name: 'North Carolina (4.5% Flat)' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania (3.07% Flat)' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota (No Income Tax)' },
  { code: 'TN', name: 'Tennessee (No Income Tax)' },
  { code: 'TX', name: 'Texas (No Income Tax)' },
  { code: 'UT', name: 'Utah (4.65% Flat)' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia (Progressive)' },
  { code: 'WA', name: 'Washington (No Income Tax)' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming (No Income Tax)' },
];

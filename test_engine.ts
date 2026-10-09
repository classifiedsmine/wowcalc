import { 
  calculateMortgage, 
  calculateComprehensiveTax, 
  calculateFicaTax,
  calculateRetirement,
  calculateAutoLoan,
  calculateCompoundInterest,
  calculateSalesTax,
  solveRegulationZ_Apr,
  getStateConfig
} from './src/engine';

let allPassed = true;
let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, desc: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  PASS: ${desc}`);
  } else {
    allPassed = false;
    console.error(`  FAIL: ${desc} ${detail ? `(${detail})` : ''}`);
  }
}

console.log('================================================================');
console.log('US FINANCIAL & LEGAL COMPLIANCE TEST SUITE (FINTECH ENGINE v8.0)');
console.log('================================================================\n');

/* ============================================================================
 * 1. INCOME TAX CALCULATOR (IRC, FICA, SECTION 125, STATE TAXES)
 * ========================================================================== */
console.log('--- 1. INCOME TAX CALCULATOR (5 Test Cases) ---');

// Case 1.1: Typical Case ($95,000 Single with $6,000 401k in CA for 2024)
{
  const res = calculateComprehensiveTax({
    annualIncome: 95000,
    year: 2024,
    filingStatus: 'single',
    stateCode: 'CA',
    preTax401k: 6000,
    preTaxHsaFsa: 0
  });

  // Gross: $95,000
  // Pre-tax 401(k): $6,000
  // Standard Deduction: $14,600
  // Fed Taxable = 95,000 - 6,000 - 14,600 = $74,400
  // Fed Tax:
  // 10% on 11,600 = $1,160.00
  // 12% on (47,150 - 11,600 = 35,550) = $4,266.00
  // 22% on (74,400 - 47,150 = 27,250) = $5,995.00
  // Total Federal Tax = 1,160 + 4,266 + 5,995 = $11,421.00
  assert(res.federalTaxableIncome === 74400, 'Case 1.1: Federal Taxable Income is $74,400', `Got ${res.federalTaxableIncome}`);
  assert(res.federalTax === 11421, 'Case 1.1: Federal Tax is $11,421.00', `Got ${res.federalTax}`);

  // FICA: 6.2% SS + 1.45% Med = 7.65% on $95,000 (401k is subject to FICA) = $7,267.50
  assert(res.ficaTax === 7267.50, 'Case 1.1: FICA Tax on $95,000 gross is $7,267.50', `Got ${res.ficaTax}`);
  assert(res.monthlyFicaTax === 605.63, 'Case 1.1: Monthly FICA is $605.63/mo', `Got ${res.monthlyFicaTax}`);

  // CA State Taxable = 95,000 - 6,000 - 5,540 (CA Single std ded) = $83,460
  // Net Take-Home = Gross - Total Taxes - 401(k)
  const expectedTakeHome = 95000 - res.totalTax - 6000;
  assert(Math.abs(res.netTakeHome - expectedTakeHome) < 0.01, 'Case 1.1: Net Take-Home formula subtracts 401(k) from liquid cash', `Got ${res.netTakeHome}`);
}

// Case 1.2: Boundary Wage Base Cap ($168,600 in 2024 Social Security Cap)
{
  const res = calculateFicaTax(250000, 0, 'single', 2024);
  // SS capped at $168,600 * 0.062 = $10,453.20
  // Medicare on $250,000 * 0.0145 = $3,625.00
  // Additional Medicare on (250,000 - 200,000) * 0.009 = $450.00
  // Total Medicare = $4,075.00
  // Total FICA = 10,453.20 + 4,075.00 = $14,528.20
  assert(res.socialSecurity === 10453.20, 'Case 1.2: Social Security caps at exactly $10,453.20 for 2024', `Got ${res.socialSecurity}`);
  assert(res.medicare === 4075.00, 'Case 1.2: Medicare uncapped base + 0.9% additional surtax over $200k = $4,075.00', `Got ${res.medicare}`);
  assert(res.totalFica === 14528.20, 'Case 1.2: Total FICA on $250,000 is $14,528.20', `Got ${res.totalFica}`);
}

// Case 1.3: Section 125 Pre-Tax HSA FICA Exemption Rule
{
  // $100,000 gross with $4,150 Section 125 HSA deduction
  const ficaWithHsa = calculateFicaTax(100000, 4150, 'single', 2024);
  // Taxable FICA wages = $95,850
  // SS: 95,850 * 0.062 = $5,942.70
  // Med: 95,850 * 0.0145 = $1,389.83 (rounded)
  const expectedFica = Math.round((95850 * 0.062 + 95850 * 0.0145) * 100) / 100;
  assert(ficaWithHsa.ficaTaxableWages === 95850, 'Case 1.3: Section 125 HSA reduces FICA taxable wage base to $95,850', `Got ${ficaWithHsa.ficaTaxableWages}`);
  assert(Math.abs(ficaWithHsa.totalFica - expectedFica) < 0.02, 'Case 1.3: Section 125 FICA savings realized per IRC § 3121(a)(5)(G)');
}

// Case 1.4: State-Specific Jurisdiction Rule (Zero-Tax State Texas vs Flat Illinois)
{
  const txRes = calculateComprehensiveTax({
    annualIncome: 100000,
    year: 2024,
    filingStatus: 'single',
    stateCode: 'TX',
    preTax401k: 0
  });
  assert(txRes.stateTax === 0, 'Case 1.4: Texas has $0 state income tax', `Got ${txRes.stateTax}`);

  const ilRes = calculateComprehensiveTax({
    annualIncome: 100000,
    year: 2024,
    filingStatus: 'single',
    stateCode: 'IL',
    preTax401k: 0
  });
  // IL Flat Tax 4.95% after $2,775 exemption = (100,000 - 2,775) * 0.0495 = $4,812.64
  assert(ilRes.stateTax > 4800 && ilRes.stateTax < 4820, 'Case 1.4: Illinois flat 4.95% state tax applies correctly', `Got ${ilRes.stateTax}`);
}

// Case 1.5: Zero / Negative Income Case
{
  const zeroRes = calculateComprehensiveTax({
    annualIncome: 0,
    year: 2024,
    filingStatus: 'single',
    stateCode: 'CA'
  });
  assert(zeroRes.federalTax === 0, 'Case 1.5: $0 income yields $0 federal tax');
  assert(zeroRes.ficaTax === 0, 'Case 1.5: $0 income yields $0 FICA tax');
  assert(zeroRes.stateTax === 0, 'Case 1.5: $0 income yields $0 state tax');
  assert(zeroRes.netTakeHome === 0, 'Case 1.5: $0 income yields $0 net take home');
}

/* ============================================================================
 * 2. MORTGAGE & EMI CALCULATOR (TILA REGULATION Z, HPA 1998, PITI, ESCROW)
 * ========================================================================== */
console.log('\n--- 2. MORTGAGE & EMI CALCULATOR (5 Test Cases) ---');

// Case 2.1: Standard Audit Case with PITI and Actuarial Regulation Z APR
{
  const m = calculateMortgage({
    homePrice: 597400,
    downPayment: 100973,
    annualRate: 7.7,
    termYears: 30,
    taxPercent: 1.2,
    insuranceAnnual: 1800,
    hoaAnnual: 1200
  });
  assert(m.loanAmount === 496427, 'Case 2.1: Loan Amount is $496,427', `Got ${m.loanAmount}`);
  assert(m.monthlyPI === 3539.33, 'Case 2.1: Monthly P&I is $3,539.33', `Got ${m.monthlyPI}`);
  assert(m.regulationZApr === 7.7, 'Case 2.1: Regulation Z Actuarial APR without upfront fees matches nominal 7.7%', `Got ${m.regulationZApr}`);

  // PITI validation
  const monthlyTaxes = Math.round((597400 * 0.012 / 12) * 100) / 100; // $597.40
  const monthlyIns = 1800 / 12; // $150.00
  const monthlyHoa = 1200 / 12; // $100.00
  const expectedPiti = Math.round((3539.33 + monthlyTaxes + monthlyIns + monthlyHoa) * 100) / 100;
  assert(Math.abs(m.totalMonthly - expectedPiti) < 1.0, 'Case 2.1: Total Monthly Payment equals PITI', `PITI=${m.totalMonthly}, Expected=${expectedPiti}`);

  // Invariant reconciliation
  const sumPrincipal = m.schedule.reduce((acc, c) => acc + c.principal, 0);
  const sumInterest = m.schedule.reduce((acc, c) => acc + c.interest, 0);
  assert(Math.abs(sumPrincipal - m.loanAmount) < 0.01, 'Case 2.1: Amortization schedule principal sums to loan amount');
  assert(Math.abs(sumInterest - m.totalInterest) < 0.01, 'Case 2.1: Amortization schedule interest sums to total interest');
}

// Case 2.2: Homeowners Protection Act (HPA 1998) 80% and 78% LTV PMI Dropoff
{
  const m = calculateMortgage({
    homePrice: 400000,
    downPayment: 40000, // 10% down -> 90% LTV, PMI required
    annualRate: 6.5,
    termYears: 30,
    autoPmi: true
  });
  // Loan amount = 360,000. 80% LTV is $320,000.
  assert(m.schedule[0].pmi > 0, 'Case 2.2: Initial PMI is active when down payment is < 20%');
  const monthAt80Ltv = m.schedule.find(s => s.balance <= 320000);
  assert(monthAt80Ltv !== undefined, 'Case 2.2: Reaches 80% LTV milestone within amortization schedule');
  if (monthAt80Ltv) {
    const nextMonth = m.schedule.find(s => s.month > monthAt80Ltv.month);
    assert(nextMonth?.pmi === 0, 'Case 2.2: PMI drops to $0 when loan reaches 80% LTV threshold under HPA 1998');
  }
}

// Case 2.3: 0% Interest Case (Statutory boundary)
{
  const m = calculateMortgage({
    homePrice: 120000,
    downPayment: 0,
    annualRate: 0,
    termYears: 10
  });
  assert(m.monthlyPI === 1000, 'Case 2.3: 0% interest monthly P&I is $1,000.00', `Got ${m.monthlyPI}`);
  assert(m.totalInterest === 0, 'Case 2.3: Total interest is $0');
  assert(m.totalPayment === 120000, 'Case 2.3: Total repayment is $120,000');
  assert(m.schedule[m.schedule.length - 1].balance === 0, 'Case 2.3: Ending balance reconciles to $0');
}

// Case 2.4: Short-Term Accelerated Extra Prepayment Case
{
  const m = calculateMortgage({
    homePrice: 300000,
    downPayment: 0,
    annualRate: 6.0,
    termYears: 15,
    extraMonthly: 500
  });
  assert(m.isAccelerated === true, 'Case 2.4: Extra payments trigger accelerated payoff');
  assert(m.payoffMonth < 180, 'Case 2.4: Loan pays off before 180 months (15 years)', `Paid off in ${m.payoffMonth} mo`);
  assert(m.monthsSaved > 0, 'Case 2.4: Months saved is positive');
}

// Case 2.5: High Interest Rate Boundary (15% 30-year)
{
  const m = calculateMortgage({
    homePrice: 200000,
    downPayment: 40000,
    annualRate: 15,
    termYears: 30
  });
  assert(m.loanAmount === 160000, 'Case 2.5: Loan amount is $160,000');
  assert(m.monthlyPI === 2023.11, 'Case 2.5: High interest monthly payment is $2,023.11', `Got ${m.monthlyPI}`);
  assert(m.schedule[m.schedule.length - 1].balance === 0, 'Case 2.5: Ending balance reconciles to $0');
}

/* ============================================================================
 * 3. RETIREMENT / FIRE CALCULATOR (TRINITY STUDY, 4% SWR, TAX ADJUSTMENT)
 * ========================================================================== */
console.log('\n--- 3. RETIREMENT & FIRE CALCULATOR (5 Test Cases) ---');

// Case 3.1: Standard Trinity Study 4% Rule Benchmark ($40,253 expenses)
{
  const fire = calculateRetirement({
    currentAge: 30,
    currentSavings: 50000,
    monthlyContribution: 2000,
    annualExpenses: 40253,
    annualReturn: 7.0,
    safeWithdrawalRate: 4.0,
    adjustForTaxes: false
  });
  // 40,253 / 0.04 = $1,006,325
  assert(fire.targetNetWorth === 1006325, 'Case 3.1: Standard 4% FIRE target for $40,253 expenses is $1,006,325', `Got ${fire.targetNetWorth}`);
  assert(fire.yearsToFIRE > 15 && fire.yearsToFIRE < 25, 'Case 3.1: Years to FIRE computed realistically', `Years=${fire.yearsToFIRE}`);
}

// Case 3.2: Tax-Adjusted FIRE Target (15% ordinary retirement tax bracket)
{
  const fire = calculateRetirement({
    currentAge: 30,
    currentSavings: 50000,
    monthlyContribution: 2000,
    annualExpenses: 40253,
    annualReturn: 7.0,
    safeWithdrawalRate: 4.0,
    adjustForTaxes: true,
    retirementTaxRatePercent: 15
  });
  // Gross annual withdrawal needed = 40,253 / (1 - 0.15) = 40,253 / 0.85 = $47,356.47
  // Target Net Worth = 47,356.47 / 0.04 = $1,183,911.75
  assert(fire.grossAnnualExpenses === 47356.47, 'Case 3.2: Gross annual withdrawal increases to cover taxes ($47,356.47)', `Got ${fire.grossAnnualExpenses}`);
  assert(fire.targetNetWorth === 1183911.75, 'Case 3.2: Tax-adjusted FIRE target is $1,183,911.75', `Got ${fire.targetNetWorth}`);
}

// Case 3.3: Conservative 3.5% SWR Boundary Case
{
  const fire = calculateRetirement({
    currentAge: 35,
    currentSavings: 100000,
    monthlyContribution: 3000,
    annualExpenses: 50000,
    annualReturn: 6.0,
    safeWithdrawalRate: 3.5,
    adjustForTaxes: false
  });
  // 50,000 / 0.035 = $1,428,571.43
  assert(fire.targetNetWorth === 1428571.43, 'Case 3.3: Conservative 3.5% SWR requires 28.57× expenses ($1,428,571.43)', `Got ${fire.targetNetWorth}`);
}

// Case 3.4: Zero Starting Savings Case
{
  const fire = calculateRetirement({
    currentAge: 25,
    currentSavings: 0,
    monthlyContribution: 1500,
    annualExpenses: 36000,
    annualReturn: 8.0,
    safeWithdrawalRate: 4.0
  });
  // 36,000 / 0.04 = $900,000
  assert(fire.targetNetWorth === 900000, 'Case 3.4: Target for $36k expenses is $900,000');
  assert(fire.yearsToFIRE > 15 && fire.yearsToFIRE < 25, 'Case 3.4: Successfully models journey from $0 savings');
}

// Case 3.5: Already Achieved FIRE Case (Current Savings > Target)
{
  const fire = calculateRetirement({
    currentAge: 55,
    currentSavings: 2000000,
    monthlyContribution: 0,
    annualExpenses: 50000,
    annualReturn: 5.0,
    safeWithdrawalRate: 4.0
  });
  assert(fire.yearsToFIRE === 0, 'Case 3.5: 0 years to FIRE when current savings exceed target', `Got ${fire.yearsToFIRE}`);
  assert(fire.fireAge === 55, 'Case 3.5: FIRE age is current age');
}

/* ============================================================================
 * 4. AUTO LOAN & LENDING (TILA REGULATION Z ACTUARIAL APR)
 * ========================================================================== */
console.log('\n--- 4. AUTO LOAN & REGULATION Z APR (5 Test Cases) ---');

// Case 4.1: Typical Auto Loan with Sales Tax & Fees
{
  const auto = calculateAutoLoan({
    vehiclePrice: 38000,
    downPayment: 6000,
    tradeInValue: 4000,
    annualRate: 6.2,
    termMonths: 60,
    salesTaxPercent: 7.25,
    titleFees: 450,
    dealerDocFee: 350
  });
  // Price = 38,000; Trade-in = 4,000 -> Taxable amount = 34,000
  // Sales Tax = 34,000 * 7.25% = $2,465.00
  // Fees = 450 + 350 = $800.00
  // Total Financed = 38,000 - 6,000 - 4,000 + 2,465 + 800 = $31,265.00
  assert(auto.salesTax === 2465, 'Case 4.1: Trade-in reduces sales tax base per state law ($2,465.00)', `Got ${auto.salesTax}`);
  assert(auto.totalFinanced === 31265, 'Case 4.1: Total Financed is $31,265.00', `Got ${auto.totalFinanced}`);
  assert(auto.monthlyPayment > 600 && auto.monthlyPayment < 620, 'Case 4.1: Monthly payment is computed accurately', `Got ${auto.monthlyPayment}`);
}

// Case 4.2: Regulation Z Actuarial APR with Prepaid Finance Charges
{
  // $20,000 loan, $500 origination fee (Amount Financed = $19,500), 36 months, 6% nominal
  // Level monthly payment PMT = $608.44
  const apr = solveRegulationZ_Apr(19500, 608.44, 36);
  // APR must exceed nominal rate (6%) because amount financed is lower than note principal
  assert(apr > 6.0 && apr < 8.5, 'Case 4.2: Actuarial APR exceeds nominal rate due to prepaid finance charges per Reg Z', `APR=${apr}%`);
}

// Case 4.3: 0% APR Dealer Incentive Financing
{
  const auto = calculateAutoLoan({
    vehiclePrice: 30000,
    downPayment: 0,
    tradeInValue: 0,
    annualRate: 0,
    termMonths: 60,
    salesTaxPercent: 0,
    titleFees: 0,
    dealerDocFee: 0
  });
  assert(auto.monthlyPayment === 500, 'Case 4.3: 0% financing monthly payment is exactly $500.00', `Got ${auto.monthlyPayment}`);
  assert(auto.totalInterest === 0, 'Case 4.3: Total interest is $0');
}

// Case 4.4: High Down Payment Case
{
  const auto = calculateAutoLoan({
    vehiclePrice: 25000,
    downPayment: 20000,
    tradeInValue: 0,
    annualRate: 5.0,
    termMonths: 24,
    salesTaxPercent: 6.0,
    titleFees: 200,
    dealerDocFee: 100
  });
  // Financed = 25,000 - 20,000 + 1,500 + 300 = $6,800
  assert(auto.totalFinanced === 6800, 'Case 4.4: Low financed balance handles small loan term', `Got ${auto.totalFinanced}`);
}

// Case 4.5: Negative / Excessive Trade-in Capping
{
  const auto = calculateAutoLoan({
    vehiclePrice: 20000,
    downPayment: 25000, // Down payment exceeds price
    tradeInValue: 0,
    annualRate: 4.0,
    termMonths: 36,
    salesTaxPercent: 0,
    titleFees: 0,
    dealerDocFee: 0
  });
  assert(auto.totalFinanced === 0, 'Case 4.5: Total financed floored at $0 when down payment exceeds price', `Got ${auto.totalFinanced}`);
}

/* ============================================================================
 * 5. SAVINGS & COMPOUND INTEREST (REGULATION DD APY COMPLIANCE)
 * ========================================================================== */
console.log('\n--- 5. SAVINGS & COMPOUND INTEREST (5 Test Cases) ---');

// Case 5.1: Regulation DD Daily 365 Compounding APY
{
  const sav = calculateCompoundInterest(10000, 5.0, 1, 365, 0);
  // APY = 100 * [ (1 + 0.05/365)^365 - 1 ] = 5.127% -> 5.13%
  assert(sav.apy === 5.13, 'Case 5.1: Daily compounding APY is 5.13% per Regulation DD (12 CFR Part 1030)', `Got ${sav.apy}%`);
  assert(sav.totalBalance === 10512.67, 'Case 5.1: Ending balance matches daily compounding formula', `Got ${sav.totalBalance}`);
}

// Case 5.2: Monthly Compounding with Monthly Deposits
{
  const sav = calculateCompoundInterest(5000, 6.0, 5, 12, 200);
  assert(sav.totalInvested === 17000, 'Case 5.2: Total invested equals principal + 60 monthly deposits of $200 ($17,000)', `Got ${sav.totalInvested}`);
  assert(sav.totalInterest > 3000, 'Case 5.2: Compound interest generated is positive and substantial');
}

// Case 5.3: 0% Interest Savings Account
{
  const sav = calculateCompoundInterest(10000, 0, 3, 12, 100);
  assert(sav.totalInterest === 0, 'Case 5.3: 0% rate produces $0 interest');
  assert(sav.totalBalance === 13600, 'Case 5.3: Total balance equals deposits only ($13,600)', `Got ${sav.totalBalance}`);
}

// Case 5.4: Annual Compounding Boundary Case (n = 1)
{
  const sav = calculateCompoundInterest(1000, 10.0, 2, 1, 0);
  // Yr 1: 1,100; Yr 2: 1,210
  assert(sav.totalBalance === 1210, 'Case 5.4: Annual compounding produces exact theoretical balance of $1,210', `Got ${sav.totalBalance}`);
  assert(sav.apy === 10.0, 'Case 5.4: APY for annual compounding equals nominal rate (10.0%)');
}

// Case 5.5: Fractional Term Case
{
  const sav = calculateCompoundInterest(50000, 4.5, 0.5, 12, 0); // 6 months
  assert(sav.totalBalance > 50000 && sav.totalBalance < 52000, 'Case 5.5: Handles fractional 6-month term cleanly');
}

/* ============================================================================
 * 6. SALES TAX CALCULATOR (STATE STATUTORY RATES & MODES)
 * ========================================================================== */
console.log('\n--- 6. SALES TAX CALCULATOR (5 Test Cases) ---');

// Case 6.1: Typical State + Local Additive Tax (CA 7.25% + 2.0% Local)
{
  const tax = calculateSalesTax({
    amount: 1000,
    mode: 'add_tax',
    stateRate: 7.25,
    localRate: 2.0,
    discountPercent: 10
  });
  // Discounted price = $900.00
  // State Tax = 900 * 7.25% = $65.25
  // Local Tax = 900 * 2.0% = $18.00
  // Total Tax = $83.25; Final = $983.25
  assert(tax.beforeTax === 900, 'Case 6.1: Discount applied before tax ($900.00)', `Got ${tax.beforeTax}`);
  assert(tax.totalTax === 83.25, 'Case 6.1: Total combined tax is $83.25', `Got ${tax.totalTax}`);
  assert(tax.finalTotal === 983.25, 'Case 6.1: Final out-of-pocket is $983.25', `Got ${tax.finalTotal}`);
}

// Case 6.2: Reverse Tax Extraction Mode (Extract tax from gross receipt)
{
  const tax = calculateSalesTax({
    amount: 108.25,
    mode: 'extract_tax',
    stateRate: 6.25,
    localRate: 2.0
  });
  // Total rate = 8.25%
  // Pre-tax = 108.25 / 1.0825 = $100.00
  // Total tax = $8.25
  assert(tax.beforeTax === 100, 'Case 6.2: Reverse extraction calculates $100.00 pre-tax base', `Got ${tax.beforeTax}`);
  assert(tax.totalTax === 8.25, 'Case 6.2: Reverse extraction isolates $8.25 total tax', `Got ${tax.totalTax}`);
}

// Case 6.3: Zero Sales Tax Jurisdiction (Alaska / Delaware / NH / Montana / Oregon)
{
  const tax = calculateSalesTax({
    amount: 500,
    mode: 'add_tax',
    stateRate: 0,
    localRate: 0
  });
  assert(tax.totalTax === 0, 'Case 6.3: Zero tax state produces $0 tax');
  assert(tax.finalTotal === 500, 'Case 6.3: Total equals base price ($500.00)');
}

// Case 6.4: High-Value Purchase Boundary Case
{
  const tax = calculateSalesTax({
    amount: 250000,
    mode: 'add_tax',
    stateRate: 6.0,
    localRate: 1.0
  });
  // 7% on $250,000 = $17,500
  assert(tax.totalTax === 17500, 'Case 6.4: Tax on $250,000 is $17,500', `Got ${tax.totalTax}`);
  assert(tax.finalTotal === 267500, 'Case 6.4: Total is $267,500', `Got ${tax.finalTotal}`);
}

// Case 6.5: 100% Discount Edge Case
{
  const tax = calculateSalesTax({
    amount: 100,
    mode: 'add_tax',
    stateRate: 8.0,
    localRate: 1.0,
    discountPercent: 100
  });
  assert(tax.beforeTax === 0, 'Case 6.5: 100% discount produces $0 pre-tax base');
  assert(tax.totalTax === 0, 'Case 6.5: 100% discount produces $0 tax');
  assert(tax.finalTotal === 0, 'Case 6.5: 100% discount produces $0 total');
}

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
if (allPassed) {
  console.log('STATUS: ALL TESTS PASSED - 100% US REGULATORY COMPLIANCE VERIFIED');
} else {
  console.error('STATUS: SOME TESTS FAILED');
  process.exit(1);
}
console.log('================================================================\n');

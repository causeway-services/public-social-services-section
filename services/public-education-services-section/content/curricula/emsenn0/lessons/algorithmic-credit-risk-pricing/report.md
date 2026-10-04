# Algorithmic Credit: How Code Determines Who Can Borrow

## Introduction

Algorithmic credit systems convert information about people and their financial lives into predictions, classifications, and prices. A credit score may estimate the probability that a borrower will become seriously delinquent; an underwriting model may turn that estimate into an approval or denial; and a pricing system may assign an interest rate, credit limit, down-payment requirement, or collateral condition. These are related but distinct operations. A person can receive the same nominal “approval” as another applicant while being offered a smaller loan or a substantially higher annual percentage rate.

The central social question is therefore not merely whether an algorithm predicts repayment accurately. It is how the system defines the outcome to be predicted, whose past behavior supplies the training evidence, which data are visible to it, how a lender translates predictions into decisions, and who bears the consequences of error. Credit models can reduce the inconsistency and prejudice of discretionary decisions, but they can also reproduce inequalities embedded in credit histories, employment, wealth, housing, and access to financial institutions.

This report concentrates on consumer lending in the United States. That geographic limitation matters: both the data infrastructure and the legal obligations discussed below are specific to the United States. It also distinguishes evidence about traditional credit-history scores from claims about newer machine-learning systems. Findings about one cannot automatically be generalized to the other.

## 1. Prerequisites: reports, scores, underwriting, and pricing

A **credit report** is a record assembled by a consumer-reporting agency from information supplied by creditors and other sources. A **credit score** is a model-generated prediction based on some version of that record. According to the Consumer Financial Protection Bureau (CFPB), commonly considered factors include payment history, unpaid debt, the number and types of accounts, account age, utilization of available credit, recent applications, collections, foreclosures, and bankruptcies. There is no single score attached permanently to a person: the result can differ by model, product, reporting agency, data vintage, and calculation date, although many familiar consumer scores fall between 300 and 850 ([CFPB, “What is a credit score?”](https://www.consumerfinance.gov/ask-cfpb/what-is-a-credit-score-en-315/)).

**Underwriting** is the lender’s broader decision process. A mortgage underwriter, for example, may consider income, existing debt, assets, collateral, loan-to-value ratio, and documentation in addition to a credit score. A score is therefore an input, not necessarily the final verdict.

**Risk-based pricing** means varying the price or material terms of credit according to assessed creditworthiness. The resulting differences can include a higher annual percentage rate, a lower credit limit, additional fees, or less favorable repayment terms. Under the federal Risk-Based Pricing Rule, certain consumers offered materially worse terms because of information in a consumer report must receive a notice, subject to specified methods and exceptions ([Federal Trade Commission guidance on risk-based pricing](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-credit-decisions-what-know-about-adverse-action-and-risk-based-pricing-notices)).

Finally, **credit risk** is not a moral judgment about whether someone is responsible. It is an estimate of a specified financial outcome under specified conditions. A model might predict whether an account will become at least 90 days delinquent within two years. That prediction does not reveal why delinquency would occur, whether the borrower received a fair contract, or whether illness, unemployment, discrimination, or an economic downturn contributed to the outcome.

## 2. How social and economic data become a risk estimate

A simplified scoring process has five stages:

1. Define the target outcome and prediction horizon.
2. Assemble historical examples with both applicant characteristics and later repayment outcomes.
3. transform raw records into measurable features.
4. Estimate a relationship between those features and the outcome.
5. validate the model and assign new applicants a score or predicted probability.

Suppose the target is default within 24 months. For applicant \(i\), let \(Y_i=1\) if default occurs and \(Y_i=0\) otherwise. Let the feature vector \(x_i\) contain variables such as recent delinquencies, revolving-credit utilization, account age, and outstanding balances. A conventional logistic model might estimate

\[
\hat p_i
=
P(Y_i=1\mid x_i)
=
\frac{1}{1+\exp[-(\beta_0+\beta^\top x_i)]}.
\]

The coefficients are chosen from historical data. If recent serious delinquency was strongly associated with later default in those data, its estimated coefficient will raise the predicted probability for otherwise similar records. A score can then be defined as a decreasing transformation of \(\hat p_i\), so that a higher score means lower estimated risk:

\[
S_i=A-B\log\left(\frac{\hat p_i}{1-\hat p_i}\right),
\]

where \(A\) and \(B\) set the score’s scale. Commercial formulas are proprietary and need not use this exact transformation; the equations illustrate the logic rather than reproduce a particular product.

Newer systems may replace a linear equation with decision trees, ensembles, neural networks, or other machine-learning methods. These models can represent nonlinear relationships and interactions—for example, the possibility that utilization has different predictive significance for a long, stable credit file than for a new file. Greater flexibility can improve prediction, but it can also increase sensitivity to unstable correlations and make individual decisions harder to explain.

A score is meaningful only in relation to an outcome and population. Its principal technical properties include:

- **Discrimination:** whether higher-risk and lower-risk cases receive meaningfully different scores.
- **Calibration:** whether an estimated probability corresponds to the observed outcome rate. Among applicants assigned a 5% risk, approximately 5% should experience the defined event if the model is well calibrated for that population and period.
- **Stability:** whether relationships learned in one period continue to hold after lending practices or economic conditions change.
- **Coverage:** whether enough reliable information exists to score the applicant.
- **Error distribution:** which groups receive false-positive high-risk classifications or false-negative low-risk classifications.

The Federal Reserve’s large 2007 study compared three credit-history scores by converting each to a common percentile-rank scale. A normalized score of 50 denoted the median, while an increase of five points meant moving five percentage points upward in the score distribution. The researchers emphasized that no natural, universal normalization formula exists; rank normalization permitted comparisons but discarded differences in the original scales ([Federal Reserve, score normalization and population analysis](https://www.federalreserve.gov/boarddocs/rptcongress/creditscore/performance.htm)).

## 3. Prediction is not the same as a lending decision

After estimating risk, a lender must decide how to act on it. Consider a stylized loan with principal \(L\), predicted probability of default \(p\), loss given default \(LGD\), funding cost \(c_f\), administrative cost \(c_a\), and required return \(m\). A lender might reason approximately that expected loss is

\[
EL=p\times LGD\times L,
\]

and require anticipated interest and fee revenue to cover

\[
EL+c_f+c_a+m.
\]

This framework clarifies why a score does not mechanically determine price. Two lenders can accept the same risk estimate yet choose different cutoffs, loss assumptions, profit margins, or cross-subsidies. A lender may reject applicants above a threshold \(p^\*\), assign applicants to pricing tiers, reduce the offered principal, demand collateral, or approve the loan while limiting the credit line.

Those choices distribute opportunity. A threshold creates a discontinuity: two applicants with almost identical estimated risks may land on opposite sides of an approval boundary. Tiered pricing can create a similar jump in cost. Higher interest payments then reduce disposable income and savings, possibly affecting the borrower’s later financial resilience. Conversely, an approval at an affordable price can support education, transportation, housing, or business formation. The model’s output enters a feedback loop rather than ending the analysis.

The Federal Reserve found that, in its historical sample, lower scores were consistently associated with higher inferred denial rates and higher estimated interest rates across populations. Yet credit records alone could not establish causation because the data omitted important factors such as wealth, employment history, mortgage loan-to-value ratios, and the weight lenders gave scores relative to other inputs ([Federal Reserve, credit availability and affordability analysis](https://www.federalreserve.gov/boarddocs/rptcongress/creditscore/overview.htm)). This is an important evidentiary boundary: a statistical relationship between score and credit outcome does not show that the score alone caused the outcome.

## 4. Where social inequality enters the pipeline

### Unequal starting records

A model trained without race or sex is not automatically socially neutral. Credit records are produced through prior participation in credit markets. A person needs access to reportable accounts before the record can display successful repayment. Rent, informal family loans, and some utility payments may go unreported, while missed payments or collections may still become visible. People excluded from mainstream lending may therefore appear to have little evidence of creditworthiness precisely because they were previously excluded.

The CFPB’s corrected national estimates make the coverage problem concrete. Using a 2% sample of deidentified records from one nationwide consumer-reporting agency, the agency estimated that in December 2020, 2.7% of U.S. adults—about 7.0 million people—had no credit record, while 9.8% had a record that did not receive a valid score under the commercially available model used for the study. Approximately 87.5%, or 225.3 million adults, had scored records ([CFPB, 2025 technical correction and update](https://files.consumerfinance.gov/f/documents/cfpb_update-credit-invisibles-estimate_2025-06.pdf)).

These figures also illustrate why research results must remain revisable. The CFPB’s original 2015 study estimated that 11% of adults were credit invisible in 2010. Its 2025 correction reduced the comparable estimate to 5.8%, largely because the earlier data omitted records containing only deferred student loans, collections, or closed accounts. The correction simultaneously raised the estimated share of unscored records. In other words, many people had been misclassified as having no record when they actually had a limited record that the scoring model did not score ([CFPB, explanation of the methodological correction](https://www.consumerfinance.gov/data-research/research-reports/technical-correction-and-update-to-the-cfpbs-credit-invisibles-estimate/)).

### Historical outcomes become model labels

Training labels encode the conditions under which past borrowers succeeded or failed. If a high-cost product made repayment harder, default in the training data partly reflects contract design, not simply an intrinsic borrower trait. If a recession disproportionately affected particular occupations or regions, a model may learn correlations that reflect that episode. The algorithm can be statistically accurate in the historical sample while treating contingent social conditions as durable evidence about future applicants.

This does not mean every correlation is illegitimate. Repayment history can genuinely predict later repayment. In the Federal Reserve’s 2007 analysis, the three credit-history scores studied were predictive for the population as a whole and for major demographic groups: higher scores were associated with lower observed default incidence. That conclusion, however, was expressly limited to scores constructed from national credit-reporting-agency records and should not be generalized to every alternative-data or machine-learning system ([Federal Reserve executive summary](https://www.federalreserve.gov/boarddocs/rptcongress/creditscore/executivesummary.htm)).

### Proxy variables and correlated disadvantage

A model can reconstruct protected or socially sensitive characteristics from correlated variables even when those characteristics are excluded. Geography, account history, income volatility, educational history, shopping behavior, and device information may carry indirect information about race, age, disability, or class.

Proxy concerns require careful evidence rather than the assumption that every correlation is intentional discrimination. The Federal Reserve’s 2007 study concluded that the credit characteristics in its specially estimated model generally did not function as proxies for race, ethnicity, or sex, although characteristics related to credit-history age partly proxied for age. Removing those age-related variables would have reduced that effect but also sacrificed predictive power ([Federal Reserve executive summary](https://www.federalreserve.gov/boarddocs/rptcongress/creditscore/executivesummary.htm)). This was an established finding about one historical dataset and model design, not proof that modern systems cannot produce proxy effects.

The Federal Trade Commission has described a broader alternative-data scenario in which an analytics provider compares an applicant with people sharing a ZIP code, social-media pattern, or shopping behavior. Such information can produce a score or recommendation even though it does not resemble a traditional repayment record. The FTC’s analysis indicates that, when prepared for a particular consumer’s eligibility decision, this kind of output may qualify as a consumer report and trigger Fair Credit Reporting Act protections ([FTC, *Big Data: A Tool for Inclusion or Exclusion?*](https://www.ftc.gov/system/files/documents/reports/big-data-tool-inclusion-or-exclusion-understanding-issues/160106big-data-rpt.pdf)).

### Measurement error and missingness

Errors do not affect only model coefficients. They can arise when accounts are matched to the wrong person, balances are stale, payments are reported inconsistently, or demographic categories used in audits are inferred rather than observed. Missingness itself may be socially patterned: people without conventional bank accounts or long domestic credit histories may be absent from particular datasets.

A model can thus be “race-blind” at decision time yet still allocate error unequally. Equal average accuracy is also insufficient if false rejections are concentrated in one population while false approvals occur in another. Good evaluation should report calibration, approval rates, pricing, and error rates by relevant groups, while accounting for sample size and uncertainty.

## 5. Can alternative data expand inclusion?

“Alternative data” covers heterogeneous material: rent and utility payments, deposit-account cash flows, employment history, educational information, device data, and online behavior should not be treated as one category. Their relationship to repayment and their privacy implications differ substantially.

Cash-flow underwriting illustrates the potential benefit. Checking and savings records can reveal deposits, balances, recurring expenses, overdrafts, and whether income regularly exceeds obligations. These measures may provide current evidence of financial capacity for an applicant whose credit file is thin.

A 2023 CFPB analysis linked survey responses to later credit performance among consumers with scores below 720. Three self-reported indicators—high accumulated savings, regularly saving without overdrafts, and paying bills on time—were associated with at least 20% better performance on serious delinquency measures after controlling for credit score. But only one of the three estimates was statistically significant; the effective samples numbered only in the hundreds, and the cash-flow measures were self-reported proxies rather than transaction data. The authors accordingly described the evidence as suggestive, not conclusive ([CFPB cash-flow analysis](https://www.consumerfinance.gov/archive/blog/credit-scores-only-tells-part-of-the-story-cashflow-data/)).

Alternative data can therefore operate in two opposing directions. Positive rent or cash-flow evidence may admit applicants who lack conventional histories. At the same time, continuous transaction surveillance can expose medical spending, unstable work, family obligations, religious activity, or other intimate patterns. If negative information is easier to collect than positive information—or if lenders use the data to segment prices rather than expand approvals—the same infrastructure may intensify exclusion.

A sound evaluation must ask a counterfactual question: compared with what? A new model may reduce disparities relative to discretionary face-to-face lending while still produce unequal outcomes. It may improve overall accuracy while worsening false-rejection rates for one group. Or it may approve more applicants but only at high prices.

Research on U.S. mortgages demonstrates this ambiguity. Using 2009–2015 data and the government-sponsored-enterprise mortgage-pricing structure to identify unexplained disparities, Bartlett, Morse, Stanton, and Wallace estimated that Latinx and Black borrowers paid 7.9 basis points more for purchase mortgages and 3.6 basis points more for refinances, amounting in their estimate to $765 million per year in additional interest. Fintech lenders showed roughly 40% less pricing disparity than face-to-face lenders, and the researchers found no evidence of fintech discrimination in approval decisions. Nevertheless, pricing disparities persisted, and the authors cautioned that the decline over time did not establish that fintech adoption caused the improvement ([Bartlett et al., NBER working paper and published-study summary](https://www.nber.org/papers/w25943)).

That study supports neither the claim that algorithms eliminate discrimination nor the claim that automation invariably worsens it. It shows that removing interpersonal discretion may reduce one pathway for unequal treatment while data-driven pricing preserves another.

## 6. Accountability, explanation, and legal protections

The Equal Credit Opportunity Act prohibits discrimination in credit transactions on specified grounds, including race, color, religion, national origin, sex or marital status, age under stated conditions, receipt of public-assistance income, and good-faith exercise of rights under the Consumer Credit Protection Act ([U.S. Department of Justice, ECOA overview](https://www.justice.gov/crt/equal-credit-opportunity-act-3)).

Explanation is an additional form of accountability. In its 2022 interpretive circular, the CFPB stated that creditors using machine learning or other complex algorithms remain obligated to provide specific and accurate principal reasons for adverse action. Saying that an applicant merely failed to reach an internal score is insufficient, and a lender cannot invoke the opacity of its own technology as a defense ([CFPB Circular 2022-03](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/)).

This requirement matters for three reasons. It allows an applicant to identify and dispute incorrect information; it gives regulators evidence about the actual decision rule; and it pressures lenders to understand the systems they deploy. Yet explanation has technical limitations. A post-hoc method may approximate a complex model rather than faithfully identify why the model produced a particular result. The CFPB explicitly warns that such approximations must be validated and may not be reliable for less interpretable models ([CFPB Circular 2022-03, note 1](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/)).

Under the Fair Credit Reporting Act, a creditor taking adverse action based on a consumer report must identify the reporting agency, disclose that the agency did not make the lending decision, and notify the consumer of rights to obtain a free report within 60 days and dispute inaccurate or incomplete information. If a credit score was used, specified score information must also be provided ([FTC adverse-action guidance](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-credit-decisions-what-know-about-adverse-action-and-risk-based-pricing-notices)).

These protections improve procedural visibility but do not by themselves establish that a model is fair. A perfectly accurate explanation can reveal a harmful rule without correcting it. Conversely, demographic parity alone can hide unequal prices, loan sizes, or error rates.

## 7. How to evaluate an algorithmic credit system

A serious audit should examine the entire decision chain:

- **Purpose:** What precise outcome and time horizon does the model predict?
- **Data provenance:** Who generated each field, under what incentives, and with what opportunity for correction?
- **Representativeness:** Does the development sample resemble the current applicant population?
- **Performance:** Are discrimination and calibration adequate both overall and across groups?
- **Decision policy:** How are probabilities converted into approvals, limits, collateral demands, and prices?
- **Counterfactual benchmark:** Is the system being compared with manual underwriting, a prior model, or no credit access?
- **Distribution:** Who receives false rejections, expensive approvals, and insufficient explanations?
- **Drift:** Does performance change during recessions, inflation, migration, or shifts in employment?
- **Recourse:** Can a person realistically correct an error or improve the relevant condition?
- **Governance:** Can the lender reproduce decisions, document model changes, and suspend a failing system?

No single fairness metric resolves the underlying value choices. Equal approval rates can conflict with equal error rates when historical outcome distributions differ. Calibration across groups can coexist with different thresholds and unequal access. The appropriate response is not to declare mathematics useless, but to make the normative choice explicit: which errors matter, who bears their cost, and what minimum opportunity should be protected?

## Conclusion

Algorithmic credit scoring translates social and economic life into financial risk through successive acts of selection: choosing data, defining default, fitting a model, setting a threshold, assigning a price, and deciding which explanations count. Each stage contains technical judgments and institutional values.

Established evidence shows that traditional credit-history scores can predict delinquency and help standardize decisions. Automation may lower underwriting costs, reduce some interpersonal discrimination, and use cash-flow or rental evidence to assess people with limited conventional histories. Equally established is that credit records provide unequal coverage, that model outputs strongly influence the availability and price of credit, and that disparities can remain after controlling for score.

What remains uncertain is the net effect of newer alternative-data and machine-learning systems across products, populations, and economic cycles. Proprietary models limit independent inspection, available studies often concern particular lenders or historical periods, and apparent improvements in aggregate prediction may conceal unequal errors or prices. Credit algorithms should therefore be understood neither as neutral measurements nor as inherently discriminatory machines. They are institutional devices that convert a historically produced data record into a distribution of capital, cost, and opportunity—and their legitimacy depends on evidence, contestability, and the social choices built around them.

## References

- [Consumer Financial Protection Bureau, “Technical correction and update to the CFPB’s credit invisibles estimate” (2025)](https://files.consumerfinance.gov/f/documents/cfpb_update-credit-invisibles-estimate_2025-06.pdf)
- [Consumer Financial Protection Bureau, Circular 2022-03](https://www.consumerfinance.gov/compliance/circulars/circular-2022-03-adverse-action-notification-requirements-in-connection-with-credit-decisions-based-on-complex-algorithms/)
- [Federal Reserve, *Report to the Congress on Credit Scoring and Its Effects on the Availability and Affordability of Credit* (2007)](https://www.federalreserve.gov/boarddocs/rptcongress/creditscore/overview.htm)
- [Federal Trade Commission, *Big Data: A Tool for Inclusion or Exclusion?* (2016)](https://www.ftc.gov/system/files/documents/reports/big-data-tool-inclusion-or-exclusion-understanding-issues/160106big-data-rpt.pdf)
- [Bartlett, Morse, Stanton, and Wallace, “Consumer-Lending Discrimination in the FinTech Era”](https://www.nber.org/papers/w25943)
- [Consumer Financial Protection Bureau, “Looking at credit scores only tells part of the story” (2023)](https://www.consumerfinance.gov/archive/blog/credit-scores-only-tells-part-of-the-story-cashflow-data/)
# Risk, Compliance, Resilience, and Stakeholder Obligations: Designing a Firm That Can Be Trusted Under Stress

## Introduction

A modern firm is not merely a portfolio of products, contracts, and financial assets. It is an operating system that converts resources, information, authority, and relationships into outcomes. Risk management, compliance, resilience, and stakeholder obligations are therefore not separate administrative topics. They are four perspectives on the same question:

> Can the firm pursue its strategy, remain within its obligations, withstand disruption, and produce credible evidence that it is doing so?

Risk management deals with uncertainty around objectives. Compliance translates selected obligations into operating constraints and expected behaviors. Resilience concerns the continued delivery or timely restoration of important outcomes when controls fail or conditions change. Stakeholder governance determines whose interests, rights, and exposures must enter decisions—and who has authority and accountability when interests conflict.

These functions should not promise the elimination of failure. That is usually impossible. Their purpose is to make risk-taking deliberate, prevent avoidable harm, detect deviation, contain incidents, preserve critical services, and learn from evidence.

This report explains how to build that system. It uses primary materials from regulators, legislatures, courts, and standard-setting bodies, but it is not legal advice. Obligations vary by jurisdiction, industry, corporate form, contract, and factual context; each organization must maintain its own authoritative legal inventory.

## 1. Prerequisites: the operating model beneath risk

Useful risk analysis presupposes three kinds of knowledge.

First, the firm must understand its economics. Revenue, accounting profit, liquidity, and economic value are different quantities. A risk can leave reported revenue untouched while causing a cash crisis through refunds, remediation costs, covenant breaches, delayed collections, or lost access to financing. Conversely, a control may lower short-run profit while preserving the license, trust, or operational capacity needed to produce future cash flows.

Second, the organization must know its decision rights and incentives. A control has no operational meaning unless someone can execute it, someone reviews the result, and exceptions are escalated to a person with authority. Incentives matter because employees rationally respond to what is rewarded, tolerated, and punished. The U.S. Department of Justice’s current prosecution guidance directs attention to whether compensation arrangements penalize misconduct and reward compliance-promoting behavior; its reported pilot experience also cautions that recovering already-paid compensation can be legally difficult and more expensive than the amount recovered, especially across jurisdictions ([DOJ, Compensation Incentives and Clawback Pilot](https://www.justice.gov/criminal/corporate-enforcement-note-compensation-incentives-and-clawback-pilot)).

Third, the firm must understand its information and technology environment. Automated decisions, third-party platforms, data pipelines, models, and privileged access are parts of the control system, not merely tools used by it. The DOJ’s September 2024 compliance-program guidance specifically asks whether firms assess risks from AI and other emerging technologies, integrate them into enterprise risk management, monitor reliability and intended use, establish accountability, and train employees ([DOJ, Evaluation of Corporate Compliance Programs](https://www.justice.gov/criminal/criminal-fraud/page/file/937501/dl?inline=)).

Without these prerequisites, a risk register becomes a list detached from how the business actually creates value or harm.

## 2. Core concepts and their boundaries

### Risk

Risk is uncertainty that matters to an objective. It may involve loss, missed opportunity, volatility, delay, misconduct, or harm to others. Every meaningful risk statement should identify:

1. an objective or obligation;
2. an uncertain event or condition;
3. causes or vulnerabilities;
4. consequences;
5. the population or stakeholder exposed;
6. existing controls and remaining exposure.

“Cyber risk: high” is not a useful statement. “Credential theft at the customer-support vendor could expose customer records, interrupt support, trigger notification duties, and reduce renewal revenue” is actionable because it connects cause, pathway, consequence, and stakeholder.

Useful distinctions include:

- **Inherent risk:** exposure before specified controls.
- **Residual risk:** exposure after considering those controls.
- **Risk capacity:** the maximum exposure the firm can absorb without violating hard constraints.
- **Risk appetite:** the types and aggregate level of risk the organization deliberately accepts in pursuing objectives.
- **Risk tolerance:** an operational boundary or permitted variation around an objective.
- **Control:** a measure intended to prevent, detect, correct, or recover from an unwanted condition.

These terms are decision aids, not natural constants. A label such as “medium” has no stable meaning unless scales, time horizon, assumptions, and aggregation rules are defined.

### Compliance

Compliance is the continuing process of identifying applicable obligations, assigning responsibility, embedding requirements into operations, testing performance, handling exceptions, and retaining evidence. Its sources can include legislation, regulation, permits, court orders, contracts, professional duties, financing covenants, and voluntary commitments.

Compliance should not be equated with ethics or with total risk management. Conduct can be legal yet exploitative, or technically noncompliant without creating equal harm in every circumstance. Nor does compliance certify safety: a minimum legal requirement may lag technology, overlook a stakeholder, or permit substantial residual risk.

### Resilience

Resilience is the capacity to continue, adapt, recover, and learn under disruption. The Basel Committee defines operational resilience for banks as the ability to deliver critical operations through disruption and emphasizes governance, operational-risk management, continuity testing, dependency mapping, third-party management, incident management, and resilient information and communications technology ([Basel Committee, *Principles for Operational Resilience*](https://www.bis.org/publications/202103-guidelines-principles-operational-resilience)).

This definition is sector-specific—the Basel principles address banks—but its operating logic is widely useful. Traditional risk controls often ask, “How do we prevent an outage?” Resilience adds, “Which service must continue, how much degradation can stakeholders tolerate, what dependencies could defeat recovery, and how will we know that restoration is safe?”

### Stakeholder obligations

A stakeholder is a party that can affect the firm or experience material effects from it: customers, workers, investors, lenders, suppliers, communities, regulators, governments, and others. But “stakeholder” is not itself a legal entitlement. Some claims arise from law or contract; others arise from strategy, ethics, reputation, or negotiated commitments.

The distinction matters. In the United Kingdom, section 172 of the Companies Act 2006 generally requires a director, acting in good faith, to promote the company’s success for members as a whole while having regard to long-term consequences, employees, relationships with suppliers and customers, community and environmental impacts, standards of business conduct, and fairness among members ([UK Companies Act 2006, section 172](https://www.legislation.gov.uk/ukpga/2006/46/section/172)). This is not a universal rule of “equal stakeholder governance”; it is a jurisdiction-specific formulation centered on the company’s success for its members, qualified by the listed considerations and other applicable law.

## 3. Four frameworks—and why none is universal

Several prominent frameworks address overlapping parts of the system:

| Framework or authority | Primary focus | Useful contribution | Important limitation |
|---|---|---|---|
| COSO Enterprise Risk Management | Strategy and enterprise performance | Connects risk consideration with strategy-setting and performance | Broad management framework; it does not identify every applicable legal duty |
| NIST Cybersecurity Framework 2.0 | Cybersecurity outcomes | Common language spanning governance through recovery | Cyber-focused and intentionally non-prescriptive |
| Basel operational-resilience principles | Continuity of critical banking operations | Disruption tolerances, dependency mapping, exercises, recovery, and learning | Written for banks and supervisors |
| EU Digital Operational Resilience Act (DORA) | ICT resilience in the EU financial sector | Legally binding governance, continuity, testing, incident, and third-party requirements within scope | Sectoral and jurisdiction-specific |
| DOJ compliance-program guidance | Evaluation of corporate compliance in federal criminal enforcement | Focuses attention on design, implementation, resources, incentives, data, investigation, and improvement | Prosecutorial guidance, not a general safe harbor |

COSO’s updated enterprise-risk framework explicitly places risk within strategy-setting and performance rather than treating it only as loss prevention ([COSO, *Enterprise Risk Management—Integrating with Strategy and Performance*](https://www.coso.org/enterprise-risk-management)). That orientation is valuable because strategies themselves can be poorly matched to organizational capabilities or stakeholder constraints.

NIST CSF 2.0 organizes cybersecurity outcomes under **Govern, Identify, Protect, Detect, Respond, and Recover**. NIST states that these functions should be addressed concurrently: governance, identification, protection, and detection are continuous, while response and recovery must remain ready for activation. Its Profiles compare current and target outcomes, while its four Tiers—Partial, Risk Informed, Repeatable, and Adaptive—characterize the rigor of governance and management practices rather than serving as a substitute for a risk methodology ([NIST, *Cybersecurity Framework 2.0*](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)).

DORA shows how a voluntary management logic can become a binding obligation. Regulation (EU) 2022/2554 requires covered financial entities to maintain an ICT risk-management framework, documented business-continuity arrangements, response and recovery plans, and a business-impact analysis using quantitative and qualitative criteria. It also requires at least annual testing of continuity and recovery plans for ICT systems supporting all functions, plus testing after substantive changes affecting critical or important functions ([EUR-Lex, Regulation (EU) 2022/2554, especially Articles 6–12](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2554)). The regulation has applied since 17 January 2025 ([EUR-Lex, DORA summary](https://eur-lex.europa.eu/legal-content/en/LSU/?uri=CELEX:32022R2554)).

The practical lesson is not to select a fashionable framework and declare completion. A firm needs a crosswalk:

- legal and contractual obligations establish mandatory outcomes;
- an enterprise-risk framework connects exposures to strategy;
- domain frameworks supply more detailed outcomes or controls;
- operational-resilience methods test whether important services survive;
- internal evidence shows whether the design actually works.

## 4. The operating mechanism: from obligations to evidence

### Step 1: Define objectives, services, and stakeholders

Begin with value-producing and harm-bearing outcomes, not organizational departments. Identify important products and services; the customers or populations relying on them; financial, safety, legal, and social consequences of failure; and the maximum tolerable duration or extent of disruption.

An online lender, for example, should not define the relevant object merely as “the application server.” The important service may be the ability to receive applications, make lawful credit decisions, communicate reasons for adverse action, protect applicant data, fund approved loans, and correct errors. A technically available server does not prove that this service is functioning.

### Step 2: Build an obligation register

For every relevant jurisdiction and activity, record:

- authoritative source and effective date;
- covered entity, product, process, and geography;
- required or prohibited outcome;
- reporting or record-retention deadline;
- accountable executive and control owner;
- evidence expected;
- dependencies and linked risks;
- review trigger.

This register should be versioned. A change in law, product, geography, vendor, data use, or business model should trigger reassessment. Versioning matters because an organization may later need to prove what it knew, which requirement applied, and which control was approved at a particular time.

### Step 3: Model risk pathways

A simple quantitative starting point is expected loss:

\[
EL = \sum_{i=1}^{n} p_i L_i
\]

where \(p_i\) is the estimated probability of scenario \(i\) over a stated period and \(L_i\) is its estimated loss. The loss term should include more than remediation expenditure:

\[
L_i = C_{\text{response}} + C_{\text{downtime}} + C_{\text{claims}}
+ C_{\text{penalties}} + C_{\text{churn}} + C_{\text{financing}} + C_{\text{stakeholder harm}}
\]

The last term may be difficult or inappropriate to reduce to money. Injury, discrimination, privacy invasion, or loss of access to an essential service should also be represented through nonfinancial measures.

Expected loss has severe limitations. It can conceal tail risk: a 1% probability of a $100 million loss and certainty of a $1 million loss both produce a $1 million expected value, but they present different solvency, insurance, and stakeholder questions. Estimates may also be correlated, strategically manipulated, or unsupported by sufficient history. Scenario ranges, stress tests, sensitivity analysis, and explicit uncertainty intervals are therefore preferable to a single point estimate.

### Step 4: Select and assign controls

Controls should address a causal pathway and produce evidence. Categories include:

- **Preventive:** approval limits, segregation of duties, access restrictions, product guardrails.
- **Detective:** reconciliations, exception reports, complaint analysis, anomaly detection.
- **Corrective:** account repair, patching, retraining, process redesign.
- **Recovery:** backups, alternate suppliers, manual workarounds, crisis staffing.
- **Directive:** policies, standards, training, contractual requirements.

For each control specify its objective, owner, frequency or trigger, population, system of record, evidence, reviewer, exception route, and failure response. “Managers review transactions” is weak. “A manager independent of initiation reviews all payments above $50,000 before release; the payment system records the approver, time, supporting documents, and rejected exceptions” is testable.

Automation does not remove accountability. It changes the evidence needed: model and rule versions, data lineage, access logs, override records, monitoring thresholds, validation results, and rollback capability.

### Step 5: Monitor three different things

Organizations often confuse activity with effectiveness. Separate:

1. **Control execution:** Was the control performed?
2. **Control effectiveness:** Did it detect or prevent the relevant condition?
3. **Risk outcome:** Did exposure or harm actually decline?

Training completion is execution evidence, not proof of behavioral change. Backup-job success is not proof that data can be restored. A vendor’s certification is not proof that the firm’s particular service can survive that vendor’s outage.

Leading indicators might include unpatched critical assets, privileged-access exceptions, overdue investigations, supplier concentration, failed restores, or employee turnover in a critical function. Lagging indicators include confirmed losses, service downtime, regulatory breaches, customer remediation, and repeat incidents. Both are necessary.

## 5. Governance, incentives, and stakeholder voice

Boards and executives do not need to operate every control, but they must ensure that material information reaches the right level and that authority matches accountability. Useful governance asks:

- Which risks are mission-critical?
- What limits cannot be exceeded?
- Who may accept an exception, for how long, and with what evidence?
- Which indicators reach senior management or the board?
- Can control functions challenge revenue owners?
- Are resources proportional to the stated appetite?
- Are recurring breaches changing compensation, capital allocation, or strategy?

U.S. Delaware case law illustrates the importance of board-level information systems for central compliance risks. In discussing *Marchand v. Barnhill*, the Delaware Court of Chancery described food safety at a monoline ice-cream company as an “essential and mission critical” compliance risk and emphasized the need for a good-faith board-level monitoring and reporting system rather than leaving the matter entirely to management discretion ([Delaware Court of Chancery opinion discussing *Marchand*](https://courts.delaware.gov/Opinions/Download.aspx?id=324120)). This principle should not be generalized into automatic liability whenever a bad event occurs; the legal tests are jurisdiction- and fact-specific. Operationally, however, it supports a sound design rule: the more central a regulated risk is to the business model, the more explicit the reporting architecture should be.

Stakeholder voice is also evidence. Complaints, worker reports, supplier warnings, regulator questions, and near misses may reveal a control failure sooner than a financial metric. Reporting channels must therefore protect confidentiality where appropriate, prohibit retaliation, support competent investigation, and feed systemic findings back into process design.

Incentives should balance outcome and conduct. Rewarding only sales, throughput, or uptime invites hidden risk-taking; rewarding only the absence of reported incidents may suppress reporting. Better designs combine commercial results with control quality, escalation behavior, customer outcomes, and remediation. The DOJ’s compliance guidance frames program evaluation around whether a program is well designed, effectively implemented, and working in practice, including whether compliance personnel have adequate autonomy, resources, data access, and mechanisms for timely investigation ([DOJ, *Evaluation of Corporate Compliance Programs*](https://www.justice.gov/criminal/criminal-fraud/page/file/937501/dl?inline=)).

## 6. Incident and resilience evidence

A resilience program assumes that some preventive controls will fail. It therefore maps every important service to the people, processes, information, facilities, technology, and external parties required to deliver it. The Basel principles explicitly call for mapping internal and external interconnections, testing continuity plans against severe but plausible scenarios, managing third-party dependencies, and incorporating lessons from incidents ([Basel Committee, operational-resilience executive summary](https://www.bis.org/publications/fsi-summary-principles-operational-resilience-executive-summary)).

Useful measures include:

- **Maximum tolerable disruption:** the outer boundary beyond which stakeholder harm becomes unacceptable.
- **Recovery time objective (RTO):** target time to restore a process or system.
- **Recovery point objective (RPO):** maximum acceptable period of data loss.
- **Maximum tolerable data loss:** expressed in records, transactions, time, or value.
- **Minimum viable service level:** the degraded capacity that must remain available.
- **Detection and decision time:** how long it takes to identify, classify, and authorize response.
- **Restore success rate:** the proportion of tested restores that meet integrity and timing requirements.

RTO and RPO are not automatically stakeholder tolerances. A database may meet its two-hour RTO while customers remain unable to access funds for a day because identity, communications, or reconciliation dependencies were omitted.

Consider a payment platform dependent on one cloud region and an external identity provider. A credible exercise disables both, introduces corrupted transaction records, and makes the usual incident commander unavailable. Evidence should include the timestamped detection path, authority succession, decision log, customer-impact estimate, regulator and partner communications, reconciliation results, recovery duration, data integrity checks, unresolved exceptions, and corrective-action owners. A scripted tabletop discussion is useful for discovering assumptions but is weaker evidence than a controlled technical failover and verified transaction reconciliation.

Incident disclosure creates an additional clock. For U.S. public companies within scope of the SEC’s cybersecurity-disclosure rules, a material incident must generally be reported on Form 8-K within four business days after the company determines it is material, subject to a national-security or public-safety delay mechanism. Annual reporting must also describe processes for managing material cyber risks and the roles of management and the board ([SEC, 2023 cybersecurity disclosure rules](https://www.sec.gov/newsroom/press-releases/2023-139)). The deadline runs from the materiality determination, not necessarily initial intrusion, but firms still need rapid evidence collection, escalation, legal analysis, and disclosure controls.

## 7. A practical review cycle

An integrated review can operate as a repeating loop:

1. **Observe:** collect incidents, complaints, control results, financial variance, legal changes, external threat information, and supplier evidence.
2. **Orient:** update service maps, obligation registers, assumptions, scenario likelihoods, and stakeholder impacts.
3. **Decide:** accept, avoid, reduce, transfer, or share exposure; assign resources and deadlines.
4. **Act:** implement controls, execute exercises, communicate, remediate, and document.
5. **Verify:** independently test whether controls and recovery measures work.
6. **Learn:** perform causal analysis, update incentives and assumptions, and preserve a versioned record.

The review should distinguish immediate containment from durable correction. If an employee bypassed approval, restoring the transaction limit contains the issue. Durable learning asks why the bypass was possible, whether workload or incentives encouraged it, whether monitoring detected it, whether similar access exists elsewhere, and whether affected stakeholders received correction.

Repeated exceptions are especially informative. If leaders repeatedly approve the same exception, the nominal standard may be unrealistic, the control may be poorly designed, or commercial priorities may be contradicting stated appetite. The honest response is to revise the process, resources, or strategy—not to preserve a fictional policy.

## 8. Limitations and unresolved uncertainty

No framework proves that a firm is safe, lawful, or responsible. Certifications and maturity tiers describe selected processes at a point in time. Risk scores depend on assumptions. Tests sample scenarios and can miss interactions. Legal duties can change faster than internal documentation. Third-party assurances may omit subcontractors, concentration risk, or the customer’s implementation choices.

Aggregation is particularly hazardous. Financial losses can be summed; different human harms often cannot. A single enterprise score can erase who bears the downside. Management should therefore retain disaggregated views by stakeholder, geography, service, and harm type.

There is also an evidence gap between official guidance and causal proof. Regulatory frameworks establish expectations and accumulated practice, but they do not demonstrate that every listed control produces the same benefit in every organization. The DOJ’s observations about compensation incentives, for example, are enforcement-policy evidence and reported implementation experience—not randomized proof that clawbacks reliably change culture. NIST expressly provides high-level outcomes rather than prescribing how every organization must achieve them ([NIST, *Cybersecurity Framework 2.0*](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)).

Finally, scope matters. DORA applies to specified financial entities and ICT relationships in the European Union; Basel principles address banks; SEC disclosure rules concern covered registrants; section 172 is UK company law; and Delaware oversight cases concern Delaware fiduciary doctrine. These sources offer transferable design insights, but none should be treated as a universal statement of legal duty.

## Conclusion

A well-governed firm connects strategy, obligations, operations, finance, technology, and stakeholder consequences through an evidence-producing loop. It identifies important services and the people who depend on them; translates authoritative obligations into owned controls; estimates exposure without hiding uncertainty; maps operational dependencies; tests recovery under severe but plausible conditions; escalates material information; aligns incentives; and changes its system when evidence contradicts its assumptions.

The decisive question is not whether the organization owns a risk framework, a compliance manual, or a continuity plan. It is whether those artifacts alter real decisions—and whether the firm can demonstrate, before and after failure, who knew what, who had authority, what the controls did, which stakeholders were affected, how service was restored, and what was changed.

## References

- [Basel Committee on Banking Supervision, *Principles for Operational Resilience*](https://www.bis.org/publications/202103-guidelines-principles-operational-resilience)
- [Committee of Sponsoring Organizations of the Treadway Commission, Enterprise Risk Management](https://www.coso.org/enterprise-risk-management)
- [European Union, Regulation (EU) 2022/2554](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2554)
- [National Institute of Standards and Technology, *Cybersecurity Framework 2.0*](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)
- [U.S. Department of Justice, *Evaluation of Corporate Compliance Programs*](https://www.justice.gov/criminal/criminal-fraud/page/file/937501/dl?inline=)
- [U.S. Securities and Exchange Commission, Cybersecurity Disclosure Rules](https://www.sec.gov/newsroom/press-releases/2023-139)
- [UK Companies Act 2006, section 172](https://www.legislation.gov.uk/ukpga/2006/46/section/172)
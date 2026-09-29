# Organization Design, Incentives, Decision Rights, and Coordination

## Introduction: the organization as a system of choices

Organization design is the deliberate arrangement of work, information, authority, incentives, and accountability. It is not synonymous with drawing an organization chart. A chart records reporting relationships; a design must also determine who possesses relevant knowledge, who may act on it, how interdependent work is coordinated, what performance is measured, who bears risk, and how errors reach people capable of correcting them.

These questions connect directly to operations and financial reasoning. A process map identifies activities, handoffs, queues, constraints, and failure modes. Accounting describes economic events through revenue, expense, assets, liabilities, and cash flows. Organization design determines which people control those activities, what evidence they receive, and whether their personal rewards encourage them to improve the whole system or merely their measured part of it.

No universal structure—functional, divisional, matrix, product-oriented, centralized, decentralized, or “flat”—is inherently best. The central design problem is conditional:

> Given the firm’s strategy, processes, knowledge distribution, risks, and legal obligations, which allocation of decision rights and incentives will produce informed action while containing coordination costs and harmful behavior?

The evidence supports several durable propositions, but not a recipe. Firms exist partly because using markets is costly; decentralization can exploit local knowledge; formal authority does not guarantee effective control; strong incentives can increase measured output while distorting unmeasured work; and legal institutions constrain what an organization may demand from workers. Each proposition has boundary conditions that managers must investigate rather than assume.

## Prerequisites: processes, constraints, and accounting

Organization design begins with an operating model. Before assigning responsibility, an analyst should be able to describe:

1. **The value proposition and demand:** who the customer is, what outcome the customer values, and what evidence indicates willingness to pay.
2. **The process:** the sequence and network of activities that transform inputs into customer outcomes.
3. **The constraint:** the resource or rule currently limiting system throughput.
4. **Quality:** the probability and consequence of defects, including defects discovered only after delivery.
5. **Capacity:** the sustainable rate at which resources can perform work, not merely their theoretical maximum.
6. **Economics:** contribution margin, fixed and variable costs, working-capital requirements, cash timing, and capital committed.
7. **Risk and obligation:** harms that could fall on customers, workers, investors, communities, or regulators.

These prerequisites prevent common category errors. A department’s utilization can rise while total throughput falls because work accumulates before a bottleneck. Revenue can rise while customer value and future cash generation deteriorate. A bonus can reward the creation of accounting entries rather than economically valuable transactions. Thus, a design should not begin with “How many direct reports?” but with “What decisions govern flow, quality, cash, and exposure?”

A useful unit of analysis is the **decision**, not the job title. For every consequential recurring decision, specify:

- the trigger;
- the information required;
- the person who proposes;
- the person who decides;
- required consultation;
- who executes;
- who can stop or appeal the action;
- the time limit;
- the record created; and
- the person accountable for reviewing the result.

This decision ledger connects the organization chart to actual operations.

## Why organize production inside a firm?

Ronald Coase’s 1937 analysis asked why firms exist when markets can coordinate exchange through prices. His answer was not that managerial direction is costless or universally superior. Market transactions themselves require discovering prices, negotiating and concluding contracts, and adapting contractual arrangements. A firm can reduce some of those costs by substituting an employment relationship and managerial direction for repeated market contracting. But internal organization also becomes more costly as an entrepreneur coordinates more transactions, so firm boundaries are determined comparatively rather than by a simple preference for hierarchy ([Coase, “The Nature of the Firm”](https://msuweb.montclair.edu/~lebelp/coasenatfirmec1937.pdf)).

This reasoning yields a practical boundary test. For an activity such as delivery, software development, component manufacture, or customer support, compare at least three governance costs:

\[
C_{\text{market}} = P + S + K + A + E
\]

where \(P\) is the supplier’s price, \(S\) search and qualification cost, \(K\) contracting cost, \(A\) adaptation cost when conditions change, and \(E\) expected cost of enforceability or supplier failure.

\[
C_{\text{hierarchy}} = W + M + B + I + R
\]

where \(W\) is wages and associated employment cost, \(M\) managerial overhead, \(B\) bureaucratic delay, \(I\) weakened internal incentives, and \(R\) the expected cost of internally controlled risk.

These are decision aids, not equations derived verbatim from Coase. Their purpose is to expose costs hidden by a purchase price or payroll figure. The organization should internalize an activity only when the relevant total cost, strategic control, capability development, and risk profile justify doing so.

The comparison also changes over time. Standardization may make outsourcing easier; accumulated internal expertise may make integration more valuable; new regulation may alter liability; and technological interfaces may reduce some coordination costs while creating cybersecurity or vendor-concentration risks. “Core versus non-core” is therefore too vague to decide a boundary. The analyst needs evidence about transaction frequency, uncertainty, asset specificity, knowledge, failure consequences, and reversibility.

## Distributed knowledge and the case for decentralization

A second foundation concerns knowledge. Friedrich Hayek argued that economically relevant knowledge is dispersed among people and often concerns particular circumstances of time and place rather than facts available to a central planner. His famous example of changing scarcity shows how prices can convey compressed signals that lead many actors to economize without learning the original cause. He also stressed that the price mechanism works imperfectly, especially where prices are rigid ([Hayek, “The Use of Knowledge in Society,” pp. 519–530](https://www.aeaweb.org/aer/top20/35.4.519-530.pdf)).

Inside a firm, many signals are not market prices. They may be queue lengths, defect reports, customer complaints, sensor readings, service recovery requests, or employee observations. The organizational implication is not “decentralize everything.” It is that a design must place either the decision or an effective communication channel near the knowledge required to make it.

Decentralization is especially attractive when:

- knowledge changes faster than it can be reported upward;
- local conditions vary substantially;
- errors are limited and reversible;
- rapid response matters;
- experimentation produces valuable learning; and
- central managers cannot process all relevant decisions.

Centralization becomes more valuable when:

- a local choice creates large spillovers elsewhere;
- safety, solvency, legality, or brand integrity is at stake;
- scale economies require standardization;
- scarce specialist knowledge must be pooled;
- local measures invite manipulation; or
- a decision is difficult to reverse.

The right question is therefore not “centralized or decentralized?” but “Which decisions should be decentralized, under what constraints, with what evidence and escalation rules?” A branch manager might control staff scheduling but not override anti-money-laundering controls. A product team might set interface details but not independently change enterprise identity architecture. A factory operator might stop an unsafe process even though capital expenditure remains centralized.

## Formal authority, real authority, and information

Philippe Aghion and Jean Tirole distinguish **formal authority**, the recognized right to decide, from **real authority**, effective control over what is actually selected. In their theoretical model, real authority depends on information: a principal who possesses the formal right but remains uninformed may effectively accept a subordinate’s recommendation. Greater real authority can stimulate the subordinate’s initiative, but it can also reduce the principal’s control. The model further identifies overload, urgency, lenient rules, reputation, performance measurement, and multiple superiors as conditions affecting effective authority ([Aghion and Tirole, “Formal and Real Authority in Organizations”](https://dash.harvard.edu/entities/publication/73120378-825e-6bd4-e053-0100007fdf3b)).

This distinction explains why a responsibility matrix can be formally correct yet operationally false. A board may possess ultimate authority but receive filtered information. A headquarters risk function may have a policy veto but lack timely access to business data. A technician without an executive title may exercise real authority because nobody else understands the equipment. A customer-facing employee may technically need approval yet make the effective choice because the customer cannot wait.

Managers can diagnose the gap by asking:

- Who can legally or formally approve the decision?
- Who frames the alternatives?
- Who controls the relevant data?
- Whose recommendation is almost always accepted?
- Who can delay implementation?
- Who experiences the consequences first?
- Can dissent reach an independent reviewer?
- Does the reviewer have enough time and expertise to intervene?

Delegation must include resources and boundaries. Assigning accountability without access to information, budget, staff, or stopping authority creates nominal ownership. Conversely, giving autonomy without an observable objective, risk limits, and review creates unbounded discretion.

A practical delegation statement can take this form:

> The role may decide \(D\) within limits \(L\), using evidence \(E\). It must consult \(C\), document \(R\), escalate when trigger \(T\) occurs, and submit the outcome to review \(V\) after interval \(H\).

The value lies not in the notation but in making the operating contract testable.

## Incentives: more than compensation

An incentive is any feature that changes the expected costs or benefits of behavior. Salary, commission, bonus, promotion, status, autonomy, workload, peer approval, job security, and fear of discipline all matter. An incentive system also selects people: a highly variable pay plan may attract workers with different ability, confidence, or risk tolerance from those attracted by a stable salary.

A minimal principal–agent model illustrates the issue. Suppose an employee chooses effort \(e\), output is

\[
y=e+\varepsilon,
\]

and pay is

\[
w=s+by,
\]

where \(s\) is fixed pay, \(b\) is the incentive rate, and \(\varepsilon\) is noise outside the employee’s control. Increasing \(b\) strengthens the employee’s marginal reward for measured output, but also transfers more noise-related income risk to the employee. The equation is a simplified teaching model, not a universal compensation formula. It omits intrinsic motivation, teamwork, manipulation, repeated relationships, limited liability, unequal bargaining power, and the legal rules governing pay.

Edward Lazear’s study of Safelite Glass Corporation offers important firm-level evidence. After the company shifted windshield installers from hourly wages to piece rates, output per worker increased by approximately 44 percent. The study attributes the increase partly to existing workers producing more and partly to workforce composition: the compensation regime attracted or retained more productive workers. The firm’s profits also increased, according to the published abstract ([Stanford Graduate School of Business record for Lazear, “Performance Pay and Productivity”](https://gsbpreserve.stanford.edu/view/33475/performance-pay-and-productivity?limit=50&offset=24&q=facet%2Cmetadata.OA_DC_CREATOR.en.keyword%2Cequals%2CEdward+Lazear&q=facet%2Cmetadata.OA_DC_PUBTYPE.en.keyword%2Cequals%2CArticles&sort=-metadata.OA_DC_DATE.en.keyword)).

That finding is established for this particular company and job design; it does not prove that piece rates generate a 44 percent gain in other settings. Windshield installation offered relatively observable individual output. Results may differ where quality is delayed, teamwork dominates, demand limits output, or workers can choose easy cases.

## Multitasking and the danger of strong measures

Most jobs contain several tasks, only some of which are readily measured. A salesperson must generate revenue but may also assess suitability, document consent, explain risks, preserve customer trust, and share knowledge. A software engineer must ship features but also test, document, secure, and maintain them. A clinician must treat cases while communicating and keeping records.

Holmström and Milgrom’s multitask principal–agent analysis shows why strong rewards for one observable task can redirect effort away from other valuable tasks. Their model can rationalize fixed wages or muted incentives even when an objective output measure exists and employees respond strongly to pay. It also links incentive intensity to job design, asset ownership, and restrictions on discretion ([Holmström and Milgrom, “Multitask Principal–Agent Analyses”](https://web.stanford.edu/~milgrom/publishedarticles/Multitask%20Principal%20Agent.pdf)).

A useful representation is:

\[
V=\sum_{i=1}^{n} q_i e_i,
\]

where \(V\) is true organizational value, \(e_i\) is effort on task \(i\), and \(q_i\) is that task’s contribution. Suppose compensation instead depends on:

\[
M=\sum_{i=1}^{n} m_i e_i.
\]

If measurement weights \(m_i\) differ substantially from true value weights \(q_i\), maximizing measured performance can destroy value. The equations express the alignment problem; they do not supply empirically known weights. In practice, those weights are uncertain and must be revised from operational evidence.

Several safeguards follow:

- Combine output, quality, risk, and customer-outcome measures.
- Use gates: no bonus is payable if a critical safety or conduct threshold fails.
- Measure teams when production is genuinely joint, while watching for free riding.
- Delay part of compensation when defects emerge after delivery.
- Audit unusual performance and boundary cases.
- Protect channels through which employees can challenge targets or report manipulation.
- Evaluate whether the measure changes case mix, reporting, or worker selection.
- Retire metrics that no longer track the intended outcome.

A balanced scorecard is not automatically balanced. Ten poorly chosen measures can be as distortive as one. Every metric requires a causal story: why should movement in this number indicate greater customer and enterprise value rather than gaming, risk transfer, or timing effects?

## A failure case: Wells Fargo’s retail sales system

Wells Fargo’s retail-banking scandal illustrates interaction among targets, decentralized authority, information filtering, and weak controls. The company’s independent-director investigation reported that aggressive sales management and a distorted performance system pressured employees to sell unwanted or unneeded products and, in some cases, open unauthorized accounts. It concluded that the Community Bank had excessive autonomy, that leaders resisted scrutiny and minimized problems, and that corporate control functions were constrained by a decentralized structure and deference to business units ([Wells Fargo independent directors’ 2017 report filed with the SEC](https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm)).

The investigation was substantial but not neutral in the strongest possible sense: it was commissioned by Wells Fargo’s independent directors and assisted by outside counsel. According to the report, counsel conducted 100 interviews, searched more than 35 million documents, reviewed hundreds of additional employee interviews, and examined information from more than 1,000 lower-level investigations. These methods strengthen the evidentiary basis but do not eliminate the limitations of a company-commissioned retrospective review ([SEC-filed investigation report](https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm)).

The board report states that sales-practice issues were not identified to the board as a noteworthy risk until 2014 and that the board learned through the September 2016 settlements that approximately 5,300 employees had been terminated for sales-practice violations. It also reports later measures including elimination of sales goals, incentive reform, accelerated centralization of control functions, committee changes, and more than $180 million in forfeitures, clawbacks, and compensation adjustments ([SEC-filed investigation report](https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm)).

The educational lesson is not simply “sales goals are bad” or “decentralization fails.” Goals can focus attention, and local autonomy can improve responsiveness. Failure arose from complementarities: narrow targets, pressure, local authority, weak independent challenge, fragmented reporting, and leadership unwillingness to reinterpret warning signs. Changing any single element might have been insufficient.

## Coordination mechanisms and their costs

Interdependence creates coordination demand. Firms can coordinate through several mechanisms:

- **Standards:** shared definitions, interfaces, policies, and operating procedures.
- **Plans:** budgets, schedules, forecasts, and capacity allocations.
- **Hierarchy:** escalation and managerial decision.
- **Markets or transfer prices:** internal charges that influence allocation.
- **Mutual adjustment:** direct communication among peers.
- **Shared information systems:** common operational records and dashboards.
- **Cross-functional roles:** integrators, product managers, program offices, or councils.

Each mechanism has costs. Standards can suppress useful variation. Planning can become stale. Hierarchy can overload senior managers. Internal prices can encourage bargaining or local optimization. Meetings consume scarce attention. Shared systems can create false confidence if definitions differ or data quality is poor.

A simple operational approximation is:

\[
C_{\text{coord}}=
C_{\text{communication}}+
C_{\text{delay}}+
C_{\text{rework}}+
C_{\text{conflict}}+
C_{\text{control}}.
\]

These components should be measured where possible: approval lead time, handoff failures, duplicate data entry, reopened work, exception volume, meeting hours, escalation age, and losses from incompatible local decisions. The point is not to minimize coordination cost to zero. Some coordination prevents much larger safety, quality, or financial losses. The design objective is the lowest total cost consistent with reliable performance and obligations.

## Labor and jurisdiction: authority is legally bounded

Managerial authority exists inside a legal system. In the United States, the National Labor Relations Act protects most covered employees in unionized and nonunionized private-sector workplaces when they engage in protected concerted activity concerning working conditions. The National Labor Relations Board states that it has statutory jurisdiction over private-sector employers whose interstate-commerce activity exceeds a minimal level, subject to its jurisdictional standards ([NLRB overview of the law](https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law)). An incentive, confidentiality rule, investigation process, or disciplinary system therefore cannot be evaluated solely as an efficiency device.

Worker classification is also not merely an organizational preference. As of September 29, 2026, the U.S. Department of Labor’s position is unusually fluid. The 2024 independent-contractor rule remains in effect for private litigation, but the Wage and Hour Division is not applying its analysis in current investigations. In February 2026, the Department proposed rescinding that rule and replacing it with a streamlined economic-reality analysis; the proposal’s comment period closed on April 28, 2026 ([Department of Labor 2026 rulemaking page](https://www.dol.gov/agencies/whd/flsa/misclassification/2026rulemaking); [DOL Fact Sheet 13](https://www.dol.gov/agencies/whd/fact-sheets/13-flsa-employment-relationship)).

The proposal does not determine classification under every law. The Department expressly notes that the Internal Revenue Code, National Labor Relations Act, and state laws can use different standards, including more restrictive state “ABC” tests. It also states that a worker cannot waive FLSA employee status merely by agreement when the legal test indicates employment ([DOL questions and answers on the 2026 proposal](https://www.dol.gov/agencies/whd/flsa/misclassification/2026rulemaking/faqs)).

Accordingly, “contractor,” “gig worker,” “partner,” and “franchisee” are not self-validating labels. Organization design must be reviewed for each relevant country, state, sector, and statute. This report provides an educational framework, not legal advice.

## Designing an evidence-producing organization

A robust design should generate evidence about its own performance and make correction possible. One practical cycle is:

1. **State the hypothesis.** Example: moving routine refund authority to service agents will reduce resolution time without increasing fraud or inconsistent treatment.
2. **Define boundaries.** Specify monetary limits, prohibited cases, documentation, and escalation triggers.
3. **Establish baselines.** Record resolution time, repeat contacts, customer outcomes, fraud loss, error rates, employee workload, and affected cash flows.
4. **Pilot at limited scale.** Choose comparable units and avoid exposing the entire enterprise to an untested design.
5. **Inspect behavior, not only averages.** Look for case selection, under-reporting, burden shifted to another team, or harms concentrated in vulnerable groups.
6. **Review decisions.** Sample records and ask whether agents had the information and resources needed.
7. **Revise or reverse.** Expand only when evidence supports the causal claim and risks remain within limits.
8. **Preserve the record.** Document what was believed, what changed, and why.

This approach treats organization design as an adaptive practice rather than a reorganization event. It also protects institutional memory: later managers can distinguish an established finding from a forecast, proposal, or failed experiment.

## Limitations and conclusions

The foundational sources provide mechanisms, not universal laws. Coase supplies comparative reasoning about markets and hierarchy but no timeless make-or-buy formula. Hayek explains the importance of dispersed knowledge but does not show that every local decision should be autonomous. Aghion and Tirole provide a theoretical account of formal and real authority whose predictions depend on model assumptions. Holmström and Milgrom explain multitask distortion but cannot identify the correct measures for a particular firm without local evidence. Lazear supplies strong observational evidence from one company and task environment, not a universal effect size. The Wells Fargo report documents a consequential failure but is retrospective and company-commissioned. Current U.S. labor guidance also illustrates that legal context can change.

The most defensible general conclusion is that organization design is an exercise in aligning five elements:

\[
\text{Design quality}
\approx
f(\text{knowledge},\text{decision rights},\text{incentives},
\text{coordination},\text{control}).
\]

The notation does not imply a known mathematical function. It emphasizes complementarity. Local knowledge without authority produces delay. Authority without information produces arbitrary control. Incentives without valid measures produce distortion. Autonomy without coordination produces incompatible decisions. Controls without independent information become ceremonial.

A well-designed modern firm therefore does more than divide labor. It connects customer value, operational flow, economic consequences, worker rights, risk limits, and learning. Its structure should make good decisions easier, harmful decisions visible, and correction possible before local optimization becomes systemic failure.

## References

- Ronald H. Coase, [“The Nature of the Firm”](https://msuweb.montclair.edu/~lebelp/coasenatfirmec1937.pdf), *Economica* 4, no. 16 (1937).
- Friedrich A. Hayek, [“The Use of Knowledge in Society”](https://www.aeaweb.org/aer/top20/35.4.519-530.pdf), *American Economic Review* 35, no. 4 (1945).
- Philippe Aghion and Jean Tirole, [“Formal and Real Authority in Organizations”](https://dash.harvard.edu/entities/publication/73120378-825e-6bd4-e053-0100007fdf3b), *Journal of Political Economy* 105, no. 1 (1997).
- Bengt Holmström and Paul Milgrom, [“Multitask Principal–Agent Analyses: Incentive Contracts, Asset Ownership, and Job Design”](https://web.stanford.edu/~milgrom/publishedarticles/Multitask%20Principal%20Agent.pdf), *Journal of Law, Economics, & Organization* 7 (1991).
- Edward P. Lazear, [“Performance Pay and Productivity”](https://gsbpreserve.stanford.edu/view/33475/performance-pay-and-productivity?limit=50&offset=24&q=facet%2Cmetadata.OA_DC_CREATOR.en.keyword%2Cequals%2CEdward+Lazear&q=facet%2Cmetadata.OA_DC_PUBTYPE.en.keyword%2Cequals%2CArticles&sort=-metadata.OA_DC_DATE.en.keyword), *American Economic Review* 90, no. 5 (2000).
- Independent Directors of Wells Fargo & Company, [*Sales Practices Investigation Report*](https://www.sec.gov/Archives/edgar/data/72971/000119312517118654/d375947ddefa14a.htm) (April 10, 2017).
- National Labor Relations Board, [“The Law”](https://www.nlrb.gov/about-nlrb/rights-we-protect/the-law).
- U.S. Department of Labor, [2026 independent-contractor rulemaking materials](https://www.dol.gov/agencies/whd/flsa/misclassification/2026rulemaking).
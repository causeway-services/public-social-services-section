# Data, Automation, AI, Controls, and Information Governance

## Introduction: technology changes the operating system of the firm

Data, automation, and artificial intelligence are often discussed as tools: a database, workflow engine, prediction model, or generative assistant is purchased and attached to an existing process. That description is incomplete. Once software observes work, transforms information, recommends actions, or executes decisions, it changes the firm’s operating system. It alters who can act, what evidence they see, how quickly work moves, which mistakes propagate, and who remains accountable when the system fails.

This broader view leads to a practical lesson: the unit of management is not the model or application alone. It is the **sociotechnical system** comprising data, software, people, procedures, vendors, incentives, controls, and affected stakeholders. The U.S. Government Accountability Office organizes AI accountability around four complementary principles—governance, data, performance, and monitoring—and explicitly applies them to both model and non-model components of an AI system ([GAO AI Accountability Framework](https://www.gao.gov/products/gao-21-519sp)). Similarly, the U.S. National Institute of Standards and Technology treats AI risk management as a lifecycle activity spanning design, development, deployment, use, and evaluation rather than as a one-time model test ([NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)).

For an operator, the central question is therefore not simply, “Can AI do this task?” It is:

> Can a controlled operational system use this capability to create measurable value, under defined conditions, while preserving accountability, information quality, security, privacy, and the ability to detect and correct failure?

Answering that question requires concepts from process design, accounting, experimentation, organizational governance, and information risk.

## 1. Prerequisites and essential distinctions

A useful starting point is to separate five ideas that are easily conflated.

**Data** are recorded representations used as inputs, evidence, state, or outputs. A customer address, machine-temperature reading, support transcript, accounting entry, photograph, and model-generated summary are all data, but they differ materially in origin, reliability, sensitivity, and permissible use.

**Information governance** is the system of decision rights, policies, controls, and records governing how information is collected, classified, accessed, transformed, retained, shared, corrected, and deleted. Privacy is part of this system but is not identical to it. The NIST Privacy Framework describes privacy risk management through five concurrent functions—Identify-P, Govern-P, Control-P, Communicate-P, and Protect-P—and emphasizes that they are continuous activities rather than a serial checklist ([NIST Privacy Framework 1.0](https://www.nist.gov/document/nist-privacy-frameworkv10pdf)).

**Automation** occurs when a machine performs some previously manual transformation or action under encoded rules. Traditional automation can be deterministic: if an invoice matches a purchase order and receipt within specified tolerances, route it for payment. Its behavior may still be complex, but the rule is intentionally specified.

**Machine learning** estimates a mapping from examples rather than relying entirely on hand-written rules. A model might estimate a probability,

\[
\hat p(y=1\mid x),
\]

where \(x\) represents available features and \(y=1\) represents an event such as default, fraud, equipment failure, or customer churn. The estimate is not a fact. It is a conditional prediction whose usefulness depends on data quality, population, time, thresholds, and the decision attached to it.

**Generative AI** produces new text, images, audio, video, code, or other content by learning statistical structure from input data. NIST defines generative AI broadly as models that emulate the structure and characteristics of input data to generate derived synthetic content ([NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). A fluent output is therefore generated content, not automatically verified knowledge.

Finally, a **control** is not merely a warning or policy. It is a designed mechanism intended to prevent, detect, contain, or correct a specified failure. Controls include access restrictions, approvals, reconciliations, validation rules, monitoring thresholds, audit logs, fallback procedures, incident escalation, and independent review.

These distinctions matter because each technology requires different assurance. Deterministic automation is often tested against specified rules and boundary cases. Predictive models require evaluation of discrimination, calibration, drift, and decision consequences. Generative systems require those concerns plus management of confabulation, prompt injection, information leakage, unstable outputs, content provenance, and overreliance.

## 2. Begin with the operational decision, not the model

A disciplined implementation starts by mapping the decision or workflow. Consider an AI-supported customer-refund process:

1. A customer submits a request.
2. Systems retrieve the order, payment, delivery, and prior-contact records.
3. An AI component classifies the issue and drafts a response.
4. Business rules determine whether a refund may be issued automatically.
5. A human reviews exceptions.
6. The firm communicates the result and records the action.
7. Subsequent disputes, reversals, complaints, and losses provide feedback.

A high aggregate “accuracy” score says little about whether this system is safe or valuable. Operators need to know which errors matter. An improper denial may produce customer harm and regulatory exposure; an improper approval may create direct loss or invite abuse. A plausible but false explanation may be more damaging than an obvious failure because it can pass through inattentive review.

The decision should therefore be expressed in operational terms:

- What action is being proposed or executed?
- What is the intended population and context?
- What information is required?
- Which errors are tolerable, and at what rates?
- Who may approve, override, or stop the process?
- What evidence must be retained?
- How can an affected person question or correct the result?
- Under what conditions must the system fall back to manual handling?

This is the **intended-use boundary**. The same model can present very different risks when used to brainstorm an internal memo, summarize a contract, prioritize patients, screen job applicants, or release funds.

The EU Artificial Intelligence Act makes this contextual approach legally consequential. For systems within its high-risk categories, Article 9 requires an established, implemented, documented, and maintained risk-management system operating as a continuous iterative process across the system lifecycle; it covers intended use and reasonably foreseeable misuse ([Regulation (EU) 2024/1689, Article 9](https://eur-lex.europa.eu/legal-content/EN-FR/TXT/?uri=CELEX%3A32024R1689)). This is a jurisdiction-specific legal requirement, not a universal definition of good practice, but its lifecycle logic is broadly useful.

## 3. Data is an operational supply chain

Data should be managed like a supply chain. It has sources, transformations, dependencies, custody changes, quality inspections, and failure modes. A reliable data record needs more than a value; it needs context.

At minimum, important data assets should have:

- a named owner and operational steward;
- a defined business meaning;
- source and collection purpose;
- lawful or authorized basis for use;
- lineage through transformations;
- units, time reference, and geographic scope;
- quality rules and known limitations;
- access and modification rights;
- retention and deletion rules;
- downstream consumers and dependencies;
- procedures for correction and incident response.

A useful abstraction is:

\[
D_{\text{usable}}
= f(\text{relevance},\text{completeness},\text{accuracy},
\text{timeliness},\text{representativeness},\text{lineage}).
\]

This is not a universal numerical formula. It expresses that usable data quality is multidimensional. A complete dataset can be irrelevant; an accurate dataset can be stale; an apparently representative dataset can omit the population exposed to the decision.

For AI, provenance is especially important. Training data influence model behavior; retrieval data ground individual responses; prompts provide current context; generated outputs can be stored and later reused as if they were observations. Without lineage, a firm may be unable to determine whether a bad outcome originated in source data, transformation logic, a model, a human instruction, or feedback contamination.

The GAO framework recommends documenting data sources and origins, evaluating reliability and appropriateness, examining operational data-stream dependencies, and assessing bias, security, and privacy ([GAO-21-519SP full report](https://www.gao.gov/assets/gao-21-519sp.pdf)). For high-risk systems using model-training techniques, Article 10 of the EU AI Act requires training, validation, and test datasets to be subject to data-governance practices and to be relevant, sufficiently representative, and, to the best extent possible, complete and free of errors for the intended purpose ([official EU AI Act text](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32024R1689)).

These standards should not be misread as promises of perfect data. Completeness and representativeness are relative to a defined use. Historical data may faithfully describe prior decisions while reproducing the exclusions or incentives embedded in those decisions. Labels can be proxies rather than ground truth: “customer did not complain” is not the same as “customer was satisfied,” and historical health expenditure is not necessarily a valid measure of medical need.

## 4. Capability must be tested in the real work context

Technology demonstrations and benchmark scores are evidence about capability under particular conditions. They are not direct estimates of business value.

NIST cautions against extrapolating generative-AI performance from narrow, anecdotal, or non-systematic assessments. Its guidance recommends empirically validated evaluation, testing under conditions similar to deployment, source and citation verification, involvement of end users in prototyping, and documentation of limits to generalizability ([NIST Generative AI Profile, Measure and Map actions](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). NIST also notes that available pre-deployment testing may be inadequate, inconsistently applied, or mismatched to deployment contexts ([NIST discussion of pre-deployment testing](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

A credible evaluation therefore progresses through several layers:

1. **Component evaluation:** Does the model perform the narrow transformation?
2. **Workflow evaluation:** Does the complete process perform better with the component included?
3. **Human-system evaluation:** How do users accept, reject, edit, or misunderstand its outputs?
4. **Outcome evaluation:** Does the change improve customer, operational, financial, or risk outcomes?
5. **Distributional evaluation:** Who benefits, who bears errors, and where does performance differ?
6. **Temporal evaluation:** Does performance persist as data, behavior, products, or threats change?

For a binary classifier, useful quantities may include:

\[
\text{Precision}=\frac{TP}{TP+FP}, \qquad
\text{Recall}=\frac{TP}{TP+FN}.
\]

Neither metric identifies the right operating threshold by itself. If a false negative costs \(C_{FN}\) and a false positive costs \(C_{FP}\), a simplified expected error cost is

\[
E[C]=C_{FN}P(FN)+C_{FP}P(FP).
\]

Even this calculation is incomplete when errors affect rights, safety, reputation, or groups differently. Some consequences cannot responsibly be collapsed into a single monetary estimate.

Generative systems need task-specific measures such as factual support, citation validity, policy compliance, harmful-output rate, omission rate, human correction time, successful task completion, and downstream rework. “The output looked good” is weak evidence because fluent language can conceal unsupported claims.

## 5. What productivity evidence does—and does not—show

Evidence on AI productivity is heterogeneous, which is exactly why local evaluation matters.

A major field study followed 5,179 customer-support agents during a staggered deployment of a generative conversational assistant. Access to the tool increased issues resolved per hour by about 14 percent on average, with much larger gains—approximately 35 percent—in the study’s novice and lower-skilled group and minimal gains for the most experienced workers ([Brynjolfsson, Li, and Raymond, *Generative AI at Work*](https://www.nber.org/system/files/working_papers/w31161/revisions/w31161.rev1.pdf)). This is substantive evidence of productivity improvement in a real workflow. It is not proof that generative AI raises productivity by 14 percent in general. The setting was one organization, one family of support tasks, and a tool designed to suggest responses using relevant organizational knowledge.

A contrasting randomized study of 16 experienced open-source developers performing 246 tasks in mature repositories found that access to early-2025 AI tools increased completion time by 19 percent. Participants had forecast a 24 percent speedup before the work and still believed afterward that AI had saved roughly 20 percent, illustrating that perceived productivity can diverge from measured productivity ([METR developer-productivity study](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)). The sample was small and specialized, so the result should not be generalized to all programming. It nevertheless demonstrates that benchmark capability, user enthusiasm, and actual task time can point in different directions.

Economy-wide effects are even less settled. A study linking chatbot-adoption surveys to administrative records in Denmark found task reorganization and reported benefits but estimated no detectable effect on earnings or recorded hours at the worker or workplace level, ruling out effects larger than 2 percent during the first two years after ChatGPT’s release ([Humlum and Vestergaard, NBER Working Paper 33777, revised March 2026](https://www.nber.org/papers/w33777)). That result concerns early labor-market outcomes in Denmark; it neither proves that AI has no value nor predicts long-run effects elsewhere.

The established finding is therefore narrower than popular claims: AI can materially improve some tasks and can impede others. Gains depend on task structure, worker experience, model capability, integration quality, error costs, and how saved time is redeployed.

## 6. Implementation economics: calculate the system, not the license

The correct business case includes more than subscription or inference cost. A simple annual value model is:

\[
V =
(B_L+B_Q+B_R+B_G)
-
(C_T+C_I+C_D+C_C+C_E),
\]

where:

- \(B_L\): usable labor-capacity benefit;
- \(B_Q\): quality, rework, or cycle-time benefit;
- \(B_R\): expected risk-loss reduction;
- \(B_G\): incremental gross contribution from growth or service improvement;
- \(C_T\): technology and consumption cost;
- \(C_I\): integration and process-redesign cost;
- \(C_D\): data preparation and governance cost;
- \(C_C\): control, compliance, security, and monitoring cost;
- \(C_E\): expected error, incident, and remediation cost.

This equation is an accounting scaffold, not an established valuation standard. Its purpose is to prevent omitted costs and double counting.

Suppose a drafting assistant saves ten minutes on 1,000 monthly cases. The apparent annual saving is 2,000 hours. That is not automatically a cash saving. If staffing and expenditure do not change, the immediate result is released capacity. Value appears only if that capacity produces additional output, improves quality, reduces delay, avoids hiring, or permits an actual cost change. Time saved should therefore be converted through an explicit realization factor:

\[
B_L=H_s \times W_b \times r,
\]

where \(H_s\) is hours saved, \(W_b\) is the relevant loaded hourly cost, and \(0\le r\le1\) is the proportion that becomes economically useful. Assuming \(r=1\) without operational evidence exaggerates returns.

Quality should also be measured downstream. Faster drafting is not a benefit if reviewers spend the saved time correcting fabricated citations. Automation may shift effort rather than remove it—from production to exception handling, monitoring, access administration, or vendor oversight. It can also create correlated losses: a person makes one error at a time, while a faulty automated rule can apply the same error to thousands of records.

A sound pilot therefore has a baseline, comparison group when feasible, predefined metrics, enough observation time, and an explicit decision rule. Measures should include total elapsed time, active labor time, rework, error severity, exception volume, customer outcome, override rate, incident rate, and full variable cost. Operators should record model and configuration versions because changing systems otherwise make results difficult to reproduce.

## 7. Controls should follow authority and consequence

Control intensity should rise with the system’s authority, scale, reversibility, and potential harm. A brainstorming assistant deserves lighter controls than an agent authorized to modify production data or issue payments.

A practical control architecture has several layers.

### Preventive controls

Preventive controls reduce the chance of an unacceptable event:

- approved-use and prohibited-use rules;
- data classification and least-privilege access;
- separation of development, test, and production environments;
- vendor assessment and contractual protections;
- input validation and output constraints;
- transaction, rate, and monetary limits;
- segregation of duties;
- approved model and version lists;
- secure retrieval restricted to authorized documents;
- prohibited autonomous actions for high-impact cases.

### Detective controls

Detective controls reveal failures or deterioration:

- immutable event and decision logs;
- sampling and independent quality review;
- reconciliation to authoritative systems;
- anomaly, drift, and abuse monitoring;
- subgroup performance analysis;
- citation or evidence checking;
- override, escalation, and complaint tracking;
- cost and latency alerts;
- tests for unauthorized data exposure.

### Corrective and containment controls

Corrective controls limit damage and restore reliable operation:

- pause and kill-switch authority;
- rollback to a known version;
- manual fallback;
- quarantine of affected records;
- customer correction and appeal procedures;
- incident triage, notification, and remediation;
- root-cause analysis;
- tracked corrective actions and retesting.

“Human in the loop” is not a sufficient control description. A human reviewer may lack time, evidence, expertise, authority, or incentives to disagree with the system. Effective review requires a defined question, access to source material, adequate time, competence, independence, and a recorded disposition. NIST recommends monitoring and documenting human overrides and using those cases to understand system problems, while also continually evaluating human–AI configurations ([NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

## 8. Governance means decision rights and evidence

AI governance is effective only when it specifies who decides what. A workable allocation usually distinguishes:

- the executive owner accountable for business purpose and risk acceptance;
- the process owner responsible for operational performance;
- data owners responsible for meaning, access, quality, and permitted use;
- technical owners responsible for implementation and reliability;
- security, privacy, legal, and compliance reviewers;
- independent assurance or internal audit;
- frontline users and affected stakeholders who can report failures;
- a release authority empowered to approve, condition, or stop deployment.

The governance record should connect purpose to evidence. A compact system dossier can contain:

- intended and excluded uses;
- affected populations;
- process and data-flow maps;
- data sources and lineage;
- vendor and component inventory;
- evaluation design and results;
- limitations and residual risks;
- controls and control owners;
- release decision and approval conditions;
- monitoring thresholds;
- incident and appeal procedures;
- material changes and version history;
- retirement or exit plan.

This documentation is operational memory. Without it, personnel changes, vendor updates, or process drift can sever the reasoning that justified deployment.

External obligations differ by jurisdiction and sector. In the European Union, AI Act enforcement powers and new transparency requirements began applying on August 2, 2026; specified interactive systems must disclose that users are interacting with AI, and specified generated or manipulated content is subject to labeling requirements ([European Commission enforcement announcement, July 31, 2026](https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august)). Organizations need legal analysis of their role, system category, geography, and applicable dates rather than assuming that every AI use is regulated identically.

In the United States, publicly reporting companies also operate under SEC cybersecurity-disclosure rules requiring disclosure of material cybersecurity incidents and annual information about cybersecurity risk management, strategy, and governance ([SEC Final Rule 33-11216](https://www.sec.gov/rule-release/33-11216)). Those rules are not an AI-governance code, but AI systems can expand cybersecurity exposure through data access, plugins, vendors, and autonomous actions. The SEC’s underlying logic is instructive: operational risk, governance, financial planning, and material disclosure cannot be managed as isolated subjects.

## 9. Monitoring and adaptive correction

Deployment is the beginning of evidence generation, not the end. Data distributions change, users learn to manipulate systems, product policies shift, vendors update models, and automation changes the behavior it measures.

A useful monitoring loop is:

\[
\text{Observe}\rightarrow\text{Compare}\rightarrow\text{Diagnose}
\rightarrow\text{Act}\rightarrow\text{Verify}\rightarrow\text{Record}.
\]

Monitoring should compare observed performance with predefined service, risk, and value thresholds. It should combine leading indicators—such as input drift, rising overrides, retrieval failures, or unusual access—with lagging outcomes such as losses, complaints, reversals, and customer harm.

Triggers for reassessment should include:

- a model, prompt, tool, or retrieval-source change;
- new data sources or intended uses;
- expansion to another population or jurisdiction;
- material deterioration in quality or economics;
- a security or privacy incident;
- persistent subgroup differences;
- significant user workarounds;
- a change in law or contractual obligation.

Incidents and near misses should update the system. NIST’s generative-AI profile calls for documented incident-response processes, retention of testing history, monitoring of control effectiveness, user-feedback channels, and post-mortem analysis aimed at preventing recurrence ([NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). GAO similarly treats continuous monitoring and assessment of continued utility as core accountability practices ([GAO AI Accountability Framework](https://www.gao.gov/products/gao-21-519sp)).

Correction should preserve history. When evidence changes a conclusion, governance records should append the new evidence, revised judgment, date, owner, and affected versions rather than silently rewriting the prior decision. That practice supports auditability and organizational learning.

## 10. Limits of the current evidence

Several uncertainties should remain visible.

First, model capabilities and products change quickly. Findings about a named model or early-2025 tool configuration may not describe systems available in October 2026. However, newer capability does not automatically resolve integration, control, or human-factors problems.

Second, external validity is limited. Results from one support center, country, occupation, or software repository should not be treated as universal estimates. The best current evidence supports conditional conclusions about particular tasks, workers, and settings.

Third, many harms are difficult to quantify. Privacy loss, exclusion, manipulation, loss of professional judgment, and diminished ability to contest decisions may not appear in ordinary productivity accounting.

Fourth, vendor transparency is incomplete. A customer may not know every training source, subcontractor, model change, or failure mode. Contractual representations and assurance reports reduce—but do not eliminate—this information asymmetry.

Fifth, compliance is not the same as effectiveness. A complete inventory, risk form, or disclosure can coexist with weak controls. Conversely, a small firm may operate an effective low-risk process without adopting every artifact of a large-enterprise framework. Proportionality matters.

## Conclusion

Data, automation, and AI create value when they improve a situated operating system—not when they merely display technical capability. The responsible sequence is to define the decision, map the workflow, govern the information supply chain, test the complete human–machine system, calculate full economics, assign decision rights, implement controls proportionate to consequence, and monitor outcomes over time.

The strongest empirical conclusion is deliberately modest: AI can produce substantial gains in some well-designed workflows, negligible effects in others, and measurable slowdowns in still others. Consequently, neither blanket enthusiasm nor blanket rejection is evidence-based. The modern firm needs an adaptive control system capable of learning where automation works, containing it where it does not, and preserving the evidence needed to revise its decisions.

## References

- [European Parliament and Council, Regulation (EU) 2024/1689—the Artificial Intelligence Act](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX%3A32024R1689)
- [European Commission, AI Act enforcement announcement, July 31, 2026](https://digital-strategy.ec.europa.eu/en/news/commission-starts-enforcing-ai-act-rules-and-new-transparency-requirements-2-august)
- [U.S. Government Accountability Office, *Artificial Intelligence: An Accountability Framework for Federal Agencies and Other Entities*](https://www.gao.gov/products/gao-21-519sp)
- [NIST, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [NIST, *Privacy Framework Version 1.0*](https://www.nist.gov/document/nist-privacy-frameworkv10pdf)
- [Brynjolfsson, Li, and Raymond, *Generative AI at Work*](https://www.nber.org/system/files/working_papers/w31161/revisions/w31161.rev1.pdf)
- [Humlum and Vestergaard, *Still Waters, Rapid Currents: Early Labor Market Transformation under Generative AI*](https://www.nber.org/papers/w33777)
- [Becker et al., *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity*](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)
- [U.S. Securities and Exchange Commission, Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure](https://www.sec.gov/rule-release/33-11216)
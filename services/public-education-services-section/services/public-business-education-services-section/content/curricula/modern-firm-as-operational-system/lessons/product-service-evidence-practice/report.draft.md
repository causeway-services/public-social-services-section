# Product and Service Development as Evidence-Producing Practice

## Introduction

Product and service development is often represented as a pipeline that converts ideas into outputs: discover a need, design a solution, build it, and launch it. That description is incomplete. Development also converts uncertainty into evidence. Interviews produce evidence about situations and language; prototypes expose usability and technical problems; pilots reveal operational constraints; randomized experiments estimate causal effects; verification checks conformance to specifications; and post-launch observation tests whether performance persists in real use.

The central managerial question is therefore not simply, “What should we build?” It is:

> What decision must be made, what uncertainty prevents that decision, and what is the least costly credible evidence that could reduce that uncertainty?

This framing connects customer discovery, operations, organizational decision rights, and adaptive strategy. It also guards against a common error: treating the visible artifact—a prototype, backlog, experiment dashboard, or launch—as proof that learning occurred. An activity produces useful evidence only when its observations bear on a defined claim, are collected under suitable conditions, and can change a decision.

No single development method is universally superior. The appropriate evidence system depends on what is uncertain, the cost of error, the reversibility of decisions, the observability of outcomes, regulatory obligations, and the economics of testing. An online retailer can expose a reversible interface variation to thousands of randomly assigned users; a medical-device firm cannot use the same approach to discover whether a safety-critical component works. A public service may need to examine letters, call-center work, identity checks, accessibility, and exception handling rather than optimize only its website.

## Prerequisites: demand evidence and decision rights

Two foundations are needed before development can function as an evidence-producing practice.

First, a team needs a situated account of value and demand. “Customers want convenience” is too vague to test. A useful claim identifies an actor, context, problem or desired outcome, proposed mechanism, and observable consequence. For example:

> For repeat customers ordering on a phone, preserving a verified delivery address will reduce checkout effort and increase completed orders without increasing address-related support cases.

This statement contains several uncertainties: whether the problem matters, whether the feature changes behavior, whether completion is the right outcome, and whether operational harm offsets any benefit.

Second, decision rights must be explicit. Evidence is useful only if someone is authorized to act on it. Before a test begins, the team should know who owns the hypothesis, who can expose users to risk, who judges data quality, who makes the ship-or-stop decision, and who may override that decision for legal, ethical, security, or strategic reasons. Separation of roles is especially important when the same team benefits from declaring its own idea successful.

These prerequisites reveal why “being data-driven” is insufficient. Measures do not choose goals, determine acceptable risk, or allocate authority. Evidence informs judgment within a governance system.

## Core definitions

A **hypothesis** is a claim whose credibility matters to a pending decision. It should specify the expected relationship and the conditions under which it is expected to hold.

An **assumption** is a claim temporarily treated as true. Assumptions become dangerous when they remain implicit, because the team cannot deliberately test or monitor them.

A **prototype** is a deliberately incomplete representation used to learn about selected properties of a possible solution. Its fidelity should be judged dimension by dimension: visual appearance, interaction, data, physical behavior, integration, operational staffing, or production process. “High fidelity” is not a single scale.

A **pilot** is a limited implementation in conditions closer to actual operation. A pilot can reveal whether a service can be delivered, but without a credible comparison it may not establish that the intervention caused an observed outcome.

**Verification** asks whether specified requirements were fulfilled. **Validation** asks whether the resulting design meets user needs and intended uses. The distinction is explicit in the US Food and Drug Administration’s design-control guidance: verification supplies objective evidence that specified requirements have been met, while design validation supplies objective evidence that specifications conform to user needs and intended uses ([FDA, *Design Control Guidance for Medical Device Manufacturers*](https://www.hhs.gov/guidance/sites/default/files/hhs-guidance-documents/FDA/Design-Control-Guidance-For-Medical-Device-Manufacturers.pdf)).

An **experiment** deliberately changes one or more conditions to learn about their consequences. A **randomized controlled experiment**, such as a well-designed A/B test, randomly assigns eligible units to alternatives. Under suitable implementation and analysis, randomization supports causal inference by making treatment assignment independent of pre-existing differences on average. Microsoft’s account of its experimentation platform describes controlled experiments as a way to assess how software features affect customer behavior, while also emphasizing the technical and cultural work needed to make them trustworthy ([Kohavi et al., “Online Experimentation at Microsoft”](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/)).

An **observational study** measures differences without randomized assignment. It can be highly informative about patterns, incidence, sequences, and rare events, but causal interpretation requires additional assumptions because users, sites, or periods receiving different treatments may already differ.

Finally, an **evidence artifact** is a durable record connecting a claim, method, result, limitation, and decision. A chart alone is not such an artifact. A useful record states what was believed before the test, what was done, what was observed, how uncertainty changed, and what action followed.

## Development as an uncertainty-reduction loop

A practical loop has seven parts:

1. Frame the decision.
2. Identify the uncertainties that could reverse it.
3. Rank them by expected consequence and tractability.
4. Select an evidence-producing method.
5. define validity conditions and decision rules in advance.
6. Conduct the work and examine both intended outcomes and harms.
7. Update the product, service, operating model, or strategy.

The loop is iterative, but iteration itself is not evidence. Repeatedly altering a product in response to noisy signals can amount to random motion. Each cycle should leave a traceable update: a claim was strengthened, weakened, narrowed, rejected, or left unresolved.

The Design Council’s Double Diamond supplies a useful but non-prescriptive map. Its first diamond moves from discovering a situation to defining a challenge; its second develops alternatives and delivers through small-scale testing, rejection, and improvement. The Council also notes that early making can occur during discovery and that learning may send a team back to the beginning ([Design Council, “The Double Diamond”](https://www.designcouncil.org.uk/resources/the-double-diamond/)). The model is best understood as alternating divergence and convergence, not as evidence that every project should follow four clean phases.

The Agile Manifesto’s principles provide a related software-development orientation: deliver working software frequently, treat working software as a primary measure of progress, welcome changing requirements, and regularly adjust the team’s process ([Principles behind the Agile Manifesto](https://agilemanifesto.org/principles)). These are normative principles written by practitioners, not controlled evidence that short iterations always improve outcomes. Working software demonstrates executability; it does not by itself demonstrate usefulness, safety, profitability, or strategic value.

## Matching methods to uncertainties

Different methods answer different questions.

| Uncertainty | Suitable evidence | What it cannot establish by itself |
|---|---|---|
| Problem and context | Observation, interviews, diary studies, support-log analysis | Population prevalence or causal impact |
| Comprehension and usability | Task-based prototype testing, accessibility testing | Sustained demand or production feasibility |
| Technical feasibility | Bench test, simulation, proof of concept | Customer value |
| Desirability or demand | Pre-orders, commitments, realistic choice tasks, market tests | Operational scalability |
| Causal behavioral effect | Randomized controlled experiment | Effects outside the tested population or period |
| Delivery feasibility | Pilot, rehearsal, process simulation | Incremental impact without a comparison |
| Specification conformance | Verification test or inspection | Whether the specification reflects the right need |
| Intended-use performance | Validation in actual or simulated use | Performance in every future environment |
| Economics | Cost observation, unit-economics model, price test | Long-run economics when scale changes costs |
| Reliability and rare harm | Stress testing, long-duration monitoring, incident analysis | Absence of unobserved hazards |

This comparison shows why discovery and experimentation are complements. Qualitative inquiry can reveal unknown concepts, vocabulary, workarounds, and mechanisms. Quantitative tests can estimate frequency or comparative effect. A small usability study may decisively expose that nobody can find the submission control, even though it cannot estimate a market-wide conversion rate. Conversely, a large A/B test may identify a small average effect without explaining why it occurred.

### Prototypes as targeted tests

A prototype should be constructed around a question. If the uncertainty concerns navigation, clickable screens may be adequate. If it concerns a pump’s pressure tolerance, visual polish is irrelevant and a physical rig may be necessary. If it concerns service recovery, the prototype may be a staffed role-play involving a user, agent, supervisor, database, and notification channel.

The economics of testing depend on both test cost and information structure. Thomke and Bell model product-development tests as information-generating activities and conclude that test strategy must balance test cost, fidelity, redesign cost, and correlation among successive tests. In a simplified case, their “economic testing frequency” is:

\[
n^*=\sqrt{\frac{C_A}{C_T}},
\]

where \(C_A\) is avoidable cost and \(C_T\) is the cost of a test. They further argue that a few high-fidelity tests may be preferable when tests are successive refinements, whereas more low-fidelity tests may be preferable when tests discover problems relatively independently ([Thomke and Bell, “Sequential Testing in Product Development”](https://doi.org/10.1287/mnsc.47.2.308.9838)).

This is a model-derived result under simplifying assumptions, not a universal staffing formula. Its durable lesson is that “test early and often” is incomplete advice. Redundant tests generate little new information, while delaying a test can make discovered defects expensive to correct.

## Designing credible experiments

A useful experiment begins with a decision, not a metric. A compact specification includes:

- the target population and eligibility rules;
- the treatment, comparison, and assignment unit;
- a primary outcome tied to the decision;
- guardrail measures for foreseeable harms;
- the minimum effect that would matter operationally;
- exposure duration and stopping rule;
- anticipated interference, novelty, seasonality, and missing-data risks;
- the action associated with positive, negative, mixed, or inconclusive results.

Suppose a checkout team tests saved addresses. Let \(p_T\) be the completion rate under the new design and \(p_C\) under the current design. The absolute effect estimate is

\[
\widehat{\Delta}=p_T-p_C,
\]

while relative lift is

\[
\widehat{L}=\frac{p_T-p_C}{p_C}.
\]

If completion rises from 60% to 61%, the absolute change is one percentage point, while relative lift is approximately \(1.67\%\). Reporting only “1.67% improvement” can make the result sound larger than it is. Neither statistic establishes business value until it is combined with eligible volume, contribution margin, implementation cost, support burden, and uncertainty around the estimate.

NIST’s engineering-statistics handbook emphasizes that statistical procedures must be chosen and interpreted with their assumptions in view; its scope includes measurement characterization, process modeling, improvement, monitoring, comparisons, and reliability ([NIST/SEMATECH Engineering Statistics Handbook](https://www.nist.gov/programs-projects/nistsematech-engineering-statistics-handbook)). In development work, this means that instrument quality and process stability are part of experimental validity, not housekeeping performed after the analysis.

### Validity audit

An experiment should be audited across at least five dimensions.

**Construct validity:** Does the measure represent the intended concept? Clicks may reflect confusion rather than engagement. Time in a support flow may indicate careful resolution or avoidable friction. Revenue may rise by shifting costs or risks to another stakeholder.

**Internal validity:** Can the observed difference plausibly be attributed to the treatment? Threats include broken randomization, differential attrition, inconsistent exposure, concurrent changes, contamination between groups, and analysis choices made after seeing results.

**Statistical conclusion validity:** Was the design capable of detecting a decision-relevant effect, and was uncertainty represented honestly? Repeatedly checking results and stopping when a threshold is crossed can inflate false-positive rates unless the analysis accounts for sequential monitoring. Multiple metrics and subgroup searches create similar risks.

**External validity:** To whom, where, and when does the result apply? Evidence from logged-in desktop customers during a promotion may not generalize to new mobile customers in ordinary weeks.

**Operational validity:** Can the result survive actual staffing, demand variability, supplier performance, production methods, exception handling, and maintenance? A demonstration run by expert designers may overstate routine performance.

A particularly important implementation diagnostic is **sample-ratio mismatch**: observed allocation differs unexpectedly from planned allocation. Microsoft researchers characterize it as a symptom that can arise from varied data-quality or assignment failures and warn that ignoring its cause can make harmful changes appear beneficial or beneficial changes appear harmful. Their taxonomy drew on work across four software companies, more than 25 products, and products serving hundreds of millions of users ([Fabijan et al., “Diagnosing Sample Ratio Mismatch in Online Controlled Experiments”](https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/)). Those figures describe the experience behind that taxonomy; they do not prove that its rules cover every experimentation system.

## Service development: the whole operation is the product

Services differ from discrete artifacts because production and use are often intertwined. Customers contribute information and action; employees exercise judgment; queues alter experience; backstage systems determine what frontstage staff can promise; and failures may emerge at channel boundaries.

Consider a hypothetical municipal permit-renewal service. The visible interface allows an applicant to enter an address, upload evidence, pay, and receive a decision. The operating system also includes identity checks, mailed reminders, call-center assistance, document review, fraud handling, payment reconciliation, accessibility support, escalation, and appeals.

A service-development team could proceed as follows:

1. Observe applicants and staff handling real or simulated renewals.
2. Map customer actions, visible interactions, backstage work, systems, delays, and evidence produced at each step.
3. Identify the riskiest assumptions—for example, that applicants possess the requested document, that address matching is reliable, and that staff can resolve exceptions within the promised time.
4. Prototype the form, letter, call script, reviewer screen, and escalation process together.
5. Rehearse common and exceptional journeys.
6. Pilot with a bounded population while monitoring completion, error, waiting time, repeat contact, accessibility failures, staff workload, and unresolved cases.
7. Compare results with a suitable baseline and retain incident narratives, not only averages.

This whole-service view is reflected in the UK Government Service Standard, which tells teams to test frequently with actual and potential users and to test every part users interact with, including offline elements such as letters ([GOV.UK Service Manual, “Make the service simple to use”](https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use)). The guidance is an operational standard and accumulated practice, not a comparative trial establishing that its specific process is optimal in all jurisdictions.

Service metrics should connect customer outcomes to process behavior. Useful measures may include:

\[
\text{First-pass success rate}
=\frac{\text{cases completed without correction or help}}
{\text{eligible initiated cases}},
\]

\[
\text{Rework rate}
=\frac{\text{cases returned to an earlier step}}
{\text{processed cases}},
\]

and elapsed-time distributions rather than averages alone. A mean completion time can conceal a severe tail in which a minority waits weeks. Stratification by channel, accessibility need, case type, location, or customer tenure can reveal uneven performance, but exploratory subgroup findings should be treated cautiously and confirmed where decisions depend on them.

## Verification, validation, and high-consequence domains

In low-cost and reversible contexts, teams can learn through limited release and correction. In high-consequence domains, “launch and observe” may be unethical or unlawful. Evidence must be staged before exposure.

FDA guidance illustrates the difference. It recommends beginning validation planning early, defining performance characteristics, methods, acceptance criteria, responsibilities, and schedules. It also says validation should use actual or simulated use environments and production-equivalent units; hand-built articles made by unusually skilled workers can conceal manufacturing problems. Packaging and labeling are part of validation because they can affect human factors and even physical performance ([FDA design-control guidance](https://www.hhs.gov/guidance/sites/default/files/hhs-guidance-documents/FDA/Design-Control-Guidance-For-Medical-Device-Manufacturers.pdf)).

This example yields general lessons without implying that FDA rules govern every product:

- requirements should trace to evidence and tests;
- test articles should represent intended production;
- use context can invalidate an otherwise functional design;
- validation may expose errors in the original account of user needs;
- changes require renewed judgment about which evidence remains applicable.

Compliance evidence and learning evidence overlap but are not identical. A documented test may satisfy a procedural requirement yet answer a commercially irrelevant question. Conversely, compelling market evidence does not replace safety verification or legally required validation.

## From evidence to operating and financial decisions

Evidence becomes economically meaningful when connected to the firm’s operating model. A feature that increases conversion can still destroy value if it raises fulfillment cost, fraud, returns, service demand, or working-capital requirements.

For a recurring decision, an approximate incremental contribution can be written as:

\[
\Delta \Pi
=(N \times \Delta q \times m)-C_{\text{build}}-C_{\text{run}}-\Delta C_{\text{risk}},
\]

where \(N\) is eligible volume, \(\Delta q\) is the incremental successful-outcome rate, \(m\) is contribution per incremental outcome, and the remaining terms represent build cost, recurring operating cost, and the expected cost of added risk. This is a decision model, not an accounting identity. Its credibility depends on horizon, attribution, capacity constraints, cannibalization, and whether \(m\) includes the relevant variable costs.

Evidence should also affect capacity plans. A pilot staffed by experts may demonstrate possibility but not scalable throughput. Teams should measure process time, waiting time, variation, failure demand, rework, and resource consumption. If demand approaches the capacity of a constrained activity, delays may grow nonlinearly; extrapolating average pilot performance can therefore be misleading.

## Governance and organizational learning

An evidence-producing organization needs more than experiments. It needs incentives that reward accurate learning rather than only positive results. If promotion, funding, or status depends on proving an initiative successful, teams have reasons to choose favorable metrics, exclude inconvenient cases, extend pilots selectively, or reinterpret inconclusive findings.

A minimal evidence record should contain:

- decision and accountable owner;
- hypothesis and important alternatives;
- baseline knowledge and provenance;
- population, context, and dates;
- intervention or prototype version;
- method, assignment, and exclusions;
- primary and guardrail measures;
- expected effect and decision threshold;
- result with uncertainty;
- validity threats and unresolved risks;
- decision, dissent, and follow-up date.

Versioning matters. New evidence should append a correction rather than silently rewriting the earlier record. This preserves the path from belief to action and makes later audits possible. It also distinguishes “what was reasonably believed at the time” from “what is now known.”

Post-launch monitoring completes the loop. A successful pre-launch test does not guarantee durable performance. User composition, competitors, regulations, supply conditions, software dependencies, and employee behavior change. Monitoring should therefore include leading indicators, outcome measures, guardrails, and triggers for review. The purpose is not to freeze the original conclusion but to expose when its assumptions cease to hold.

## Limitations and boundaries of the evidence

Several limitations should temper broad claims about evidence-led development.

First, much public material about Agile, design thinking, and service design is practitioner doctrine or official guidance rather than comparative causal evidence. These sources are valuable for definitions and methods, but adoption should not be mistaken for proof of universal effectiveness.

Second, evidence is context-dependent. Online experimentation is unusually powerful where assignment, exposure, and outcomes are digitally observable. Its lessons do not transfer automatically to low-volume industrial products, enterprise sales, public policy, or safety-critical systems.

Third, measurable outcomes can crowd out important but less observable values. Accessibility, dignity, employee discretion, resilience, privacy, and long-term trust may not fit a short experiment window. Guardrails and qualitative evidence partly address this problem but do not eliminate judgment.

Fourth, local optimization can damage the system. Improving one screen, department, or metric may shift work downstream, exclude difficult cases, or degrade long-run capability. Whole-service mapping and cross-functional review are necessary counterweights.

Finally, uncertainty cannot be eliminated. Some decisions must be made with small samples, changing environments, delayed outcomes, and contested objectives. The aim is not certainty but a transparent relationship among claims, evidence, risk, and authority.

## Conclusion

Product and service development is best understood as a governed sequence of evidence-producing commitments. Discovery clarifies situations and needs; prototypes test selected properties; experiments estimate comparative effects; pilots expose operational behavior; verification checks requirements; validation connects the design to intended use; and monitoring tests whether prior conclusions remain true.

The discipline lies in matching each uncertainty to an appropriate method, stating validity conditions before interpreting results, and preserving a traceable record of what changed. Speed is valuable when it accelerates credible learning. Iteration is valuable when it reduces consequential uncertainty. Data is valuable when its provenance and limitations are understood. None of these is an end in itself.

A mature development system therefore asks not merely whether a team shipped, experimented, or followed a fashionable framework. It asks whether the organization produced evidence strong enough for the decision at stake, recognized what that evidence could not establish, and changed its commitments accordingly.

## References

- Design Council. [“The Double Diamond.”](https://www.designcouncil.org.uk/resources/the-double-diamond/)
- Fabijan, Aleksander, et al. [“Diagnosing Sample Ratio Mismatch in Online Controlled Experiments: A Taxonomy and Rules of Thumb for Practitioners.”](https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/)
- Kohavi, Ronny, et al. [“Online Experimentation at Microsoft.”](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/)
- National Institute of Standards and Technology. [*NIST/SEMATECH Engineering Statistics Handbook.*](https://www.nist.gov/programs-projects/nistsematech-engineering-statistics-handbook)
- Thomke, Stefan, and David E. Bell. [“Sequential Testing in Product Development.”](https://doi.org/10.1287/mnsc.47.2.308.9838)
- UK Government Digital Service. [“Make the service simple to use.”](https://www.gov.uk/service-manual/service-standard/point-4-make-the-service-simple-to-use)
- US Food and Drug Administration. [*Design Control Guidance for Medical Device Manufacturers.*](https://www.hhs.gov/guidance/sites/default/files/hhs-guidance-documents/FDA/Design-Control-Guidance-For-Medical-Device-Manufacturers.pdf)
- [*Principles behind the Agile Manifesto.*](https://agilemanifesto.org/principles)
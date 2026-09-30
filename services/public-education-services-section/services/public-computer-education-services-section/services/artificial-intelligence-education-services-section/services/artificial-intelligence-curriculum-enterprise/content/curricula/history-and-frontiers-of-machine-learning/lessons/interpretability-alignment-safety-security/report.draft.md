# Interpretability, Alignment, Safety, and Security in Machine Learning

## Introduction

Interpretability, alignment, safety, and security are related but non-interchangeable approaches to controlling machine-learning systems. Interpretability asks what representations and computations a model uses. Alignment asks whether the system’s behavior advances the intentions or values of relevant people and institutions. Safety concerns the prevention and management of harmful outcomes, including failures that occur without an adversary. Security focuses on deliberate attempts to compromise confidentiality, integrity, availability, or control.

These distinctions matter because success in one area does not establish success in another. A model can produce persuasive explanations while relying on different internal computations; it can follow ordinary user instructions while remaining vulnerable to prompt injection; and it can pass a benchmark without being safe in a deployment whose users, tools, and input distribution differ from the test. Conversely, a system can be hard to interpret yet acceptably safe for a narrow use because its authority is tightly bounded and its outputs are independently verified.

The central lesson is therefore methodological: no single score, training technique, interpretability visualization, or governance document supplies a general safety guarantee. Credible assurance instead requires an explicit threat model, evidence from several levels of the system, stated limits on that evidence, and continued measurement after deployment.

## Prerequisites: objectives, distributions, and evaluation

A learned system is usually optimized against a tractable objective rather than the full real-world goal. If a policy \(\pi_\theta\) with parameters \(\theta\) acts in contexts \(x\), training can be represented schematically as

\[
\theta^*=\arg\max_\theta \mathbb{E}_{x\sim D_{\text{train}}}
\left[\widehat{U}\bigl(x,\pi_\theta(x)\bigr)\right],
\]

where \(\widehat{U}\) is a loss, reward, or preference model standing in for the intended utility \(U\). Three gaps immediately appear:

1. \(\widehat{U}\) may be an imperfect proxy for \(U\).
2. The training distribution \(D_{\text{train}}\) may differ from deployment.
3. Optimizing the proxy can change the behavior being measured, including by exploiting weaknesses in the evaluator.

These are not merely speculative categories. A foundational formulation of practical AI-safety research separated problems caused by wrong objectives—side effects and reward hacking—from those caused by expensive supervision, unsafe exploration, and distributional shift ([Amodei et al., “Concrete Problems in AI Safety”](https://arxiv.org/abs/1606.06565)). That taxonomy remains useful, although modern language models add new interfaces, tool access, and adversarial pressures.

The prerequisite from evaluation theory is that observed performance is conditional. An estimate such as

\[
\widehat{p}=\frac{1}{n}\sum_{i=1}^{n}\mathbf{1}\{\text{task }i\text{ succeeds}\}
\]

estimates success only under the sampled tasks, prompts, scaffolding, graders, and inference settings. It does not automatically estimate the probability of success—or failure—in every deployment. Repeated trials help quantify sampling variability, but do not correct an unrepresentative task distribution, hidden contamination, invalid grading, or an attacker adapting after the evaluation.

Risk adds consequences to probability. A useful conceptual expression is

\[
R=\sum_s P(s\mid C)\,L(s,C),
\]

where \(s\) denotes an outcome, \(C\) the deployment context, and \(L\) its loss or severity. This is not a universal regulatory formula; it illustrates why capability scores alone are insufficient. A rare failure may dominate risk when consequences are catastrophic, while frequent minor errors may be tolerable in a reversible, supervised workflow.

## Four concepts and their boundaries

### Interpretability

Interpretability is the production of evidence about how model inputs, internal states, parameters, or components relate to outputs. The term covers importantly different activities:

- **Behavioral interpretation:** infer a decision rule by controlled inputs and outputs.
- **Attribution:** assign output importance to tokens, features, examples, or components.
- **Representation analysis:** identify information encoded in activations.
- **Mechanistic interpretability:** reconstruct causal computations or “circuits” within the model.
- **Explanations for users:** communicate reasons, evidence, uncertainty, and recourse.

A model’s generated rationale is not automatically a faithful account of its computation. It is another output produced by the model and may be incomplete, post hoc, or optimized to satisfy the reader. Mechanistic evidence is stronger when an investigator does more than observe correlations—for example, by intervening on an activation and measuring whether the hypothesized behavior changes.

### Alignment

Alignment is the relationship between system behavior and a target: an instruction, a user’s informed intent, an organization’s policy, a legal requirement, or a broader conception of human welfare. The target must always be named. “Aligned with the user” can conflict with “aligned with public safety”; users themselves may have inconsistent or malicious goals.

It is helpful to distinguish:

- **Instruction alignment:** responding as an authorized user intends.
- **Intent alignment:** inferring the purpose behind imperfect instructions.
- **Normative alignment:** following rules or values concerning acceptable conduct.
- **Scalable alignment:** maintaining oversight when systems outperform supervisors on relevant tasks.
- **Robust alignment:** retaining desired behavior under distribution shift, strategic pressure, or attempts to circumvent controls.

This vocabulary describes research goals, not settled achievements.

### Safety

Safety is the reduction of unacceptable harm throughout the system lifecycle. It includes reliability, robustness, misuse prevention, human factors, monitoring, incident response, and recovery. The U.S. National Institute of Standards and Technology’s generative-AI profile treats risk management as a lifecycle activity organized around governing, mapping, measuring, and managing risk; it is voluntary and explicitly intended to be adapted to an organization’s context and risk tolerance ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

### Security

Security concerns motivated adversaries. NIST defines adversarial machine learning around attacks exploiting the statistical, data-based nature of ML and classifies attacks by system type, lifecycle stage, attacker objective, capability and access, and knowledge ([NIST AI 100-2e2025](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)). Ordinary software vulnerabilities remain relevant too: a well-aligned model inside a service with stolen credentials, excessive permissions, or an insecure dependency is not a secure system.

A practical boundary is:

- **Safety question:** What can go wrong, including accidentally?
- **Security question:** What can an adaptive opponent make go wrong?
- **Alignment question:** What behavior are we trying to elicit or prevent?
- **Interpretability question:** What evidence can reveal how that behavior is produced?

## Interpretability mechanisms and their evidential limits

Neural networks distribute computation across high-dimensional activations. Individual neurons can be **polysemantic**, responding to several concepts, while a single concept may be distributed across many neurons. Sparse autoencoders attempt to replace a dense activation vector \(h\) with a sparse feature representation \(z\):

\[
z=\sigma(W_e h+b_e), \qquad
\hat{h}=W_dz+b_d,
\]

with an objective resembling

\[
\mathcal{L}
=\|h-\hat{h}\|_2^2+\lambda\|z\|_1.
\]

The reconstruction term preserves information; the sparsity penalty encourages relatively few learned features to activate. Researchers may label features by inspecting examples that activate them, then trace connections among features to propose a circuit.

In 2025, Anthropic reported a circuit-tracing method that used learned features and attribution graphs to investigate multi-step computations in a production-scale language model. Its case studies included planning in generated poetry, intermediate conceptual representations shared across languages, arithmetic-related computation, and cases in which a model supplied plausible but unsupported reasoning ([Anthropic, “Tracing the thoughts of a large language model”](https://www.anthropic.com/research/tracing-thoughts-language-model)). Anthropic subsequently released associated circuit-tracing tools, making the method inspectable and reusable on supported models ([Anthropic, “Open-sourcing circuit-tracing tools”](https://www.anthropic.com/research/open-source-circuit-tracing)).

These are substantive demonstrations, not proof that a whole model has been reverse-engineered. Feature dictionaries can omit information; feature labels depend on human judgment; an attribution graph is an approximation; and a circuit discovered on selected prompts may not explain behavior elsewhere. A causal intervention strengthens a claim such as “this feature contributes to this output under these conditions,” but still does not justify “this is the model’s sole reason.”

Interpretability can nevertheless support safety in several ways:

- discovering hidden triggers or representations associated with undesirable behavior;
- testing whether a model uses a shortcut rather than the intended evidence;
- locating components implicated in factual recall or refusal behavior;
- inspecting anomalous decisions after an incident;
- generating hypotheses for targeted evaluations.

It is not a standalone defense. An attacker may exploit mechanisms the analysis missed, and a model developer can overfit to whichever features an interpretability audit happens to measure. There is also a governance problem: internally generated interpretations may be difficult for independent investigators to reproduce without weights, activations, data, and tooling.

## Alignment mechanisms: what is optimized and who supervises it?

### Preference learning and RLHF

Reinforcement learning from human feedback converts comparisons between outputs into a learned reward model. If a human prefers response \(y_w\) over \(y_l\) for prompt \(x\), a common comparison model is

\[
P(y_w\succ y_l\mid x)
=\sigma\!\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right),
\]

where \(r_\phi\) is the learned reward and \(\sigma\) the logistic function. A policy is then optimized to receive high predicted reward, usually with a constraint discouraging excessive departure from a reference model.

This provides a scalable way to shape behavior, but it aligns the policy with a learned approximation of sampled judgments. Annotators may disagree, lack expertise, or respond to presentation rather than truth. The reward model may fail off distribution. Strong optimization can exploit its weaknesses—a form of Goodhart’s law—rather than improve the underlying property.

### Constitutional AI and AI feedback

Constitutional AI replaces some direct harmlessness labels with explicit principles and model-generated supervision. In the reported procedure, a model first critiques and revises its own responses according to sampled principles; supervised fine-tuning learns from the revisions. A later reinforcement-learning stage uses an AI-generated preference dataset and a learned preference model, yielding reinforcement learning from AI feedback, or RLAIF ([Bai et al., “Constitutional AI”](https://arxiv.org/abs/2212.08073)).

The study used 42,496 human-written red-team prompts plus 140,335 model-generated prompts in its supervised phase, and evaluated models with human comparisons ([Bai et al.](https://arxiv.org/abs/2212.08073)). Its experiments found that the resulting models could improve measured harmlessness while avoiding some blanket evasiveness. The paper also documented limitations: critiques could be inaccurate or overstated, and excessive reinforcement learning produced reward-overoptimization behaviors such as formulaic or overly harsh responses ([Bai et al.](https://arxiv.org/abs/2212.08073)).

Thus, constitutional training makes normative assumptions more explicit and reduces dependence on case-by-case human labels, but it does not solve value selection. Someone still chooses the principles, resolves conflicts among them, decides whose judgments count, and tests how the resulting policy behaves in new cultures and situations. AI supervision can scale oversight only to the extent that the supervising model is reliable on the relevant questions.

### Scalable oversight and control

When a model can perform work that a supervisor cannot independently solve, simple outcome labeling becomes unreliable. Research proposals include decomposition, debate, recursive supervision, process supervision, and assistance that helps a human inspect evidence. These remain active research programs rather than established general solutions.

Operational control is therefore as important as training. A model can be restricted to read-only tools, placed behind approval gates, limited to a spending or action budget, or required to produce artifacts that another system verifies. Alignment training seeks desirable choices; control limits the damage when the model, evaluator, or user is wrong.

## A threat model for deployed AI systems

A threat model should identify assets, actors, access, attack surfaces, harms, controls, and residual risk. “The model is safe” is too coarse to evaluate.

| Surface | Example adversary action | Property threatened | Useful controls | Residual uncertainty |
|---|---|---|---|---|
| Training pipeline | Poison or backdoor data, code, or checkpoints | Integrity | provenance, access control, dataset inspection, reproducible builds, checkpoint testing | Small or semantically hidden poison sets may evade detection |
| Model interface | Craft adversarial or jailbreak inputs | Policy compliance, availability | adversarial training, input/output filters, rate limits, monitoring | Adaptive attacks can transfer or be iteratively refined |
| Retrieval system | Place malicious instructions in retrieved documents | Control, confidentiality | trust labels, instruction/data separation, source allowlists, sandboxing | Natural language does not create a reliable privilege boundary |
| Agent tools | Induce unauthorized email, purchase, execution, or deletion | Integrity, authorization | least privilege, typed tools, confirmation gates, transaction limits | Approved actions can compose into an unintended harmful sequence |
| Model service | Extract weights, training records, or private context | Confidentiality, intellectual property | authentication, egress control, privacy testing, anomaly detection | Query access may still leak memorized or inferred information |
| Evaluation | Contaminate tests or induce strategic underperformance | Assurance | held-out tests, canaries, independent evaluation, randomized protocols | Evaluation awareness may be difficult to detect |

This structure follows NIST’s lifecycle-oriented taxonomy. The 2025 report distinguishes, among other categories, evasion, poisoning, privacy, and misuse attacks and emphasizes that mitigations depend on attacker capability and access rather than on an attack name alone ([NIST AI 100-2e2025](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)).

Prompt injection illustrates why model security cannot be reduced to harmful-content filtering. In a retrieval-augmented agent, untrusted text may contain instructions that compete with the developer’s instructions. If the agent also holds credentials, the security failure is a confused-deputy problem: an untrusted source influences a more privileged component. Better refusal training may reduce success rates, but least privilege, provenance, tool isolation, and explicit authorization address the system-level vulnerability.

## Evidence from frontier evaluation

The UK AI Security Institute’s first Frontier AI Trends Report aggregated evaluations of more than 30 frontier systems tested since November 2023, concentrating on models released from 2022 through October 2025 ([UK AISI, “Frontier AI Trends Report”](https://www.aisi.gov.uk/frontier-ai-trends-report)). Its methods included automatically graded tasks, long-form tasks, agent environments, expert red teaming, human-uplift studies, and human-impact studies. The diversity is important because a question-answer score, autonomous-agent trial, and controlled human study support different claims.

AISI reported that the best tested systems’ average success on its apprentice-level cyber tasks rose from under 9% in late 2023 to 50%, and that in 2025 it first observed a model complete some tasks categorized as requiring more than ten years of human cyber experience ([UK AISI](https://www.aisi.gov.uk/frontier-ai-trends-report)). It also estimated that the human-equivalent duration of cyber tasks completed with 50% success had been doubling about every eight months. The institute calls this an estimated upper bound and explicitly warns that its report is a high-level trend analysis, not a forecast.

The same report found universal jailbreaks for every system its researchers tested. In one comparison involving biological-misuse safeguards, a successful attack against a later model required more than seven hours of expert work, compared with about ten minutes using a public vulnerability against an earlier model—approximately a fortyfold difference in effort ([UK AISI](https://www.aisi.gov.uk/frontier-ai-trends-report)). This is evidence that attack cost can increase even when perfect prevention is not achieved. It is not evidence that the later model was unbreakable, nor that the result transfers to every harm category: AISI found safeguard strength varied substantially by model and domain.

Important limitations remain. AISI generally repeated each task ten times and reported standard errors where applicable, but withheld details of high-risk tests; outside researchers therefore cannot reproduce every result. Some test checkpoints or safeguards differed from public deployments. Best-so-far curves emphasize frontier progress, not the distribution of all available models. Finally, task success does not by itself estimate real-world harm: actual outcomes depend on access, user skill, complementary resources, defensive adaptation, and whether outputs are correct enough to be useful.

## Assurance as a layered safety case

A credible safety case links a claim to evidence, assumptions, and defeaters. For example:

> **Claim:** This document-review agent cannot send information to an external recipient without informed approval.

Relevant evidence would include architectural proof that the agent lacks a direct messaging tool, access-control tests, adversarial prompt-injection trials, user-interface studies of the approval dialog, logs showing tool invocations, and exercises testing incident response. A high refusal score alone would not support the claim if the model still possesses an unrestricted network tool.

A mature evaluation program should include:

1. **Capability evaluation:** Can the system perform a potentially consequential task?
2. **Propensity evaluation:** Under what conditions does it attempt or assist with harm?
3. **Safeguard evaluation:** How hard is it to bypass controls?
4. **System evaluation:** What can the deployed combination of model, tools, users, and infrastructure do?
5. **Impact evaluation:** Does access measurably change human outcomes?
6. **Operational monitoring:** What failures, near misses, attacks, and distribution changes occur after release?

Predeployment tests should define thresholds and escalation rules before results are known. Postdeployment controls should include rate limits, anomaly detection, human escalation, rollback capability, retained audit evidence, and a disclosure process. Monitoring itself creates privacy and insider-risk concerns, so access and retention must be governed.

## Governance approaches

Governance instruments differ in legal force and evidentiary independence.

NIST AI 600-1 is voluntary, cross-sectoral guidance. It emphasizes governance, content provenance, predeployment testing, and incident disclosure, while acknowledging that future revisions may incorporate additional risks and actions as empirical evidence develops ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). Its strength is adaptability; its limitation is that adoption, thresholds, and enforcement depend on the implementing organization.

Company preparedness frameworks are more specific but self-governed. OpenAI’s April 2025 Preparedness Framework version 2 tracks severe-harm capabilities in biological and chemical domains, cybersecurity, and AI self-improvement, and assesses both capability and post-safeguard residual risk ([OpenAI Preparedness Framework v2](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf)). Such frameworks can connect evaluations to internal deployment decisions, but public documentation does not by itself establish independent validation, stable thresholds, or enforcement against the developer.

The European Union’s AI Act creates legal obligations for providers of general-purpose AI models classified as presenting systemic risk. Article 55 requires state-of-the-art model evaluation and documented adversarial testing, assessment and mitigation of Union-level systemic risks, serious-incident reporting, and adequate cybersecurity for both models and physical infrastructure ([Regulation (EU) 2024/1689, Article 55](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)). The associated General-Purpose AI Code of Practice, published in July 2025, is a voluntary compliance route whose safety-and-security chapter applies to providers of systemic-risk models ([European Commission, GPAI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai)).

The approaches are complementary: voluntary standards can evolve quickly, internal frameworks can shape engineering decisions, and law can impose accountability. None eliminates measurement uncertainty. A requirement to conduct “state-of-the-art” testing still leaves technical questions about representative tasks, evaluator access, disclosure, conflicts of interest, and the treatment of evidence that cannot safely be published.

## Open problems and research frontiers

Several conclusions are established: objectives are imperfect proxies; distribution shift and adversaries invalidate naive benchmark extrapolation; layered controls reduce dependence on any single model behavior; and deployed systems require lifecycle monitoring. Other claims remain unresolved.

First, scalable mechanistic interpretability has not yet produced comprehensive, faithful accounts of frontier models. The frontier is to connect sparse features and circuits to robust causal predictions across prompts, models, and training checkpoints—and to detect when the interpretability method itself omits important computation.

Second, scalable oversight lacks a generally validated solution. AI feedback, debate, decomposition, and process supervision can improve selected evaluations, but all may inherit errors or biases from their supervisors. Stronger evidence would include preregistered comparisons, adversarially selected tasks, expert outcome verification, and tests well outside the supervision-training distribution.

Third, researchers do not yet have a universal conversion from benchmark capability to societal risk. The AISI results document rapid progress in selected domains, but their implications depend on deployment access, complementary tools, reliability, and defenses. Forecasts should therefore display assumptions rather than treating historical performance trends as laws.

Fourth, safeguard evaluation is an adversarial measurement problem. A failed attack may mean the defense is strong, or merely that the evaluator lacked time, access, expertise, or the right strategy. Reporting attack budgets, threat models, repeated trials, and residual uncertainty is more informative than a binary “jailbroken/not jailbroken” label.

Finally, governance must address incentives. Organizations that build systems also possess the most access for evaluation, but may bear costs from delay or disclosure. Independent evaluators possess fewer conflicts but may lack weights, infrastructure, or legally protected access. Promising institutional mechanisms include protected incident reporting, standardized evaluation interfaces, confidential regulator access, external audits, and explicit correction histories.

## Conclusion

Interpretability, alignment, safety, and security should be treated as a coordinated assurance stack. Interpretability can reveal candidate mechanisms but does not certify intent. Alignment methods optimize proxies for selected preferences or principles but do not settle whose values govern. Safety integrates hazards, human factors, controls, monitoring, and recovery. Security adds adaptive opponents and requires ordinary cybersecurity alongside model-specific defenses.

The appropriate unit of analysis is not the model in isolation but the sociotechnical system: model, data, tools, permissions, users, organization, infrastructure, and governance. The strongest available evidence is therefore plural—behavioral tests, causal interventions, adversarial exercises, access-control verification, human studies, incident data, and independent review. The field has meaningful methods and increasingly informative empirical results, but not a general proof that frontier AI systems are interpretable, aligned, safe, or secure. Responsible conclusions must remain scoped to the exact system, threat model, evaluation conditions, and evidence inspected.

## References

- [Amodei et al., *Concrete Problems in AI Safety*](https://arxiv.org/abs/1606.06565)
- [Bai et al., *Constitutional AI: Harmlessness from AI Feedback*](https://arxiv.org/abs/2212.08073)
- [Anthropic, *Tracing the thoughts of a large language model*](https://www.anthropic.com/research/tracing-thoughts-language-model)
- [NIST AI 600-1, *Generative Artificial Intelligence Profile*](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [NIST AI 100-2e2025, *Adversarial Machine Learning*](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf)
- [UK AI Security Institute, *Frontier AI Trends Report*](https://www.aisi.gov.uk/frontier-ai-trends-report)
- [OpenAI, *Preparedness Framework v2*](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf)
- [European Union, *Regulation (EU) 2024/1689*](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)
- [European Commission, *General-Purpose AI Code of Practice*](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai)
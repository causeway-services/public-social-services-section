# Evaluation, Generalization, Robustness, and Distribution Shift

## Introduction: what does a test score actually warrant?

Machine-learning evaluation asks an inferential question: what does observed performance on a finite dataset justify believing about performance elsewhere? A model may score highly on a benchmark yet fail for a new hospital, a later time period, an underrepresented population, an unusual input, or an adversarially chosen case. Conversely, a performance drop does not automatically prove that the learning algorithm is intrinsically defective; the test population, labeling process, metric, decision threshold, or task itself may have changed.

This distinction matters especially for foundation models. Pretraining exposes a model to broad, often incompletely documented data, while prompting and fine-tuning create many possible downstream systems. A single average score cannot characterize this large behavioral surface. Stanford’s original Holistic Evaluation of Language Models project therefore evaluated multiple properties—including accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency—and explicitly treated incomplete scenario coverage as something to document rather than conceal ([HELM project report](https://crfm.stanford.edu/2022/11/17/helm.html)).

The central lesson is that **evaluation is an argument supported by measurements, not merely the production of a number**. Sound evaluation identifies:

1. the intended population and use;
2. the training, validation, and test distributions;
3. the model-selection process;
4. the metrics and their uncertainty;
5. plausible shifts and failure modes;
6. the limits of the resulting claim.

Generalization, robustness, and distribution shift are related but not interchangeable. Generalization usually concerns performance beyond the training sample. Robustness asks whether performance remains acceptable when specified aspects of the problem change. Distribution shift describes a mismatch between the probability distributions generating training and deployment data. None of these can be judged without specifying what changes, what remains invariant, and which loss matters.

## Prerequisites: predictors, losses, and empirical risk

Let \(X\) denote an input, \(Y\) a target, and \(f_\theta(X)\) a model with parameters \(\theta\). For a loss function \(\ell\), the population risk under distribution \(P\) is

\[
R_P(f_\theta)
=
\mathbb{E}_{(X,Y)\sim P}
\left[\ell(f_\theta(X),Y)\right].
\]

Because \(P\) is not directly available, training normally minimizes empirical risk over \(n\) observations:

\[
\widehat R_{\text{train}}(f_\theta)
=
\frac{1}{n}\sum_{i=1}^{n}
\ell(f_\theta(x_i),y_i).
\]

Under the classical independent-and-identically-distributed assumption, training and future examples are sampled from the same fixed population. A held-out test set then estimates \(R_P(f_\theta)\), provided that it is independent of model fitting and selection. This is an estimate, not the true risk: finite samples produce sampling error, and repeated decisions based on the same test set compromise its independence.

The learning objective, evaluation metric, and deployment utility may differ. Cross-entropy can train a classifier, accuracy can rank models, and an application may care about the cost of false negatives at a particular operating threshold. In reinforcement learning or planning, the object of interest may instead be expected discounted return,

\[
J(\pi)=
\mathbb{E}_{\tau\sim P_\pi}
\left[
\sum_{t=0}^{T}\gamma^t r_t
\right],
\]

where policy \(\pi\) changes the distribution of trajectories \(\tau\). Evaluation is consequently harder than evaluating a static predictor: deploying a new policy changes which states and outcomes are observed. Logged behavior-policy data may poorly cover the actions selected by the candidate policy, making off-policy estimates highly assumption-dependent.

These formulas expose three different sources of failure:

- **Estimation error:** the test sample is too small or noisy to estimate performance precisely.
- **Optimization or approximation error:** training does not find, or the model family cannot represent, a suitable predictor.
- **Distribution mismatch:** the relevant deployment risk is \(R_Q(f)\) for a target distribution \(Q\neq P\), while evaluation estimated \(R_P(f)\).

More test examples reduce ordinary sampling error but do not, by themselves, repair an unrepresentative test distribution.

## Generalization is always relative to a distribution

A train–test gap is the most familiar sign of poor generalization, but a small gap establishes only that the model behaves similarly on two samples constructed by the same procedure. It does not show that the procedure represents deployment.

This was demonstrated by the ImageNetV2 recollection study. Recht and colleagues created new CIFAR-10 and ImageNet test sets by attempting to reproduce the original data-collection processes. Across the evaluated ImageNet classifiers, accuracy on the new data fell substantially even though model rankings remained broadly preserved; the paper described the ImageNet decrease as roughly equivalent to five years of reported benchmark progress ([Recht et al., 2019](https://proceedings.mlr.press/v97/recht19a)). The result does not mean that the original test scores were incorrectly calculated. It shows that seemingly minor variations in sampling and filtering can change the numerical level of performance.

A complementary question-answering study rebuilt SQuAD-style evaluations. A newly collected Wikipedia test set did not reveal clear adaptive overfitting to the original holdout, but test sets drawn from the *New York Times*, Reddit, and Amazon reviews produced average losses of 3.8, 14.0, and 17.4 F1 points, respectively; a strong human baseline showed little or no corresponding decline ([Miller et al., 2020](https://proceedings.mlr.press/v119/miller20a.html)). This separates two hypotheses that are often conflated:

- repeated benchmark use may cause overfitting to a fixed test set;
- domain change may expose features that never generalized beyond the source domain.

In that experiment, the evidence favored domain shift as the larger problem. It would be unsafe to universalize that conclusion to every benchmark, particularly contemporary foundation-model evaluations whose test items may occur in pretraining corpora.

Generalization can also be **underspecified**. Many predictors can achieve almost identical validation loss while relying on different features. Some use stable relationships; others exploit shortcuts such as background, documentation style, hospital identity, or demographic proxies. An empirical study spanning computer vision, medical imaging, natural-language processing, electronic health records, and genomics found that models with similar in-domain performance could differ materially under stress tests and deployment-relevant shifts ([D’Amour et al., 2022](https://www.jmlr.org/beta/papers/v23/20-1335.html)). Thus, successful optimization does not uniquely determine a reliable solution.

## A practical taxonomy of distribution shift

Write \(P(X,Y)=P(Y\mid X)P(X)\). Different changes to these factors have different consequences.

### Covariate shift

Under covariate shift,

\[
P_{\text{train}}(X)\neq P_{\text{test}}(X),
\qquad
P_{\text{train}}(Y\mid X)=P_{\text{test}}(Y\mid X).
\]

The frequency of inputs changes, but the correct conditional mapping is assumed stable. A medical example would be a new clinic serving different proportions of otherwise comparable patient types. When the support of the target distribution is covered by training data, importance weighting can express target risk as

\[
R_Q(f)
=
\mathbb{E}_{P}
\left[
\frac{q(X)}{p(X)}\ell(f(X),Y)
\right].
\]

This identity is mathematically simple but operationally demanding. Density ratios must be estimated, large ratios create high variance, and the method cannot recover behavior in target regions where \(p(X)=0\). Most importantly, the invariance of \(P(Y\mid X)\) is an assumption, not something guaranteed by detecting a change in \(P(X)\).

### Label or prior shift

Under label shift,

\[
P_{\text{train}}(Y)\neq P_{\text{test}}(Y),
\qquad
P_{\text{train}}(X\mid Y)=P_{\text{test}}(X\mid Y).
\]

Disease prevalence might change while the class-conditional measurement process remains stable. The same sensitivity and specificity can then yield a different positive predictive value. Thresholds, posterior probabilities, and operational workload may need adjustment even if discrimination is unchanged.

### Concept or conditional shift

Under concept shift,

\[
P_{\text{train}}(Y\mid X)\neq P_{\text{test}}(Y\mid X).
\]

Examples include changing fraud strategies, revised diagnostic definitions, semantic drift, or users adapting to a deployed system. Covariate reweighting alone cannot repair a changed input–outcome relationship.

### Subpopulation and spurious-correlation shifts

The overall task may remain recognizable while correlations between labels and nuisance attributes change. A classifier might associate “cow” with pasture or a toxicity label with a dialect marker. High average accuracy can hide near-total failure for a rare group. Evaluation should therefore report group-conditional performance and, where justified, a worst-group objective:

\[
R_{\max}(f)=\max_{g\in\mathcal G}R_g(f).
\]

This metric protects only the groups that were defined and measured. Missing, mislabeled, or very small groups remain unresolved, and an aggressive worst-group criterion may be statistically unstable.

### Temporal, geographic, institutional, and feedback shifts

Time, location, equipment, institutions, and policy changes often produce mixtures of the preceding categories. Feedback adds a further complication: predictions can influence treatment, policing, lending, recommendations, or user behavior, thereby changing future data. A static retrospective split may not reproduce this causal loop.

The WILDS benchmark was designed around naturally occurring shifts rather than only synthetic perturbations. Its ten datasets include hospital shifts in tumor detection, camera-location shifts in wildlife monitoring, and temporal or geographic shifts in satellite applications. The authors found lower out-of-distribution than in-distribution performance under standard training, and the robustness methods they tested did not uniformly eliminate the gaps ([Koh et al., 2021](https://proceedings.mlr.press/v139/koh21a)). WILDS is strong evidence that realistic shift matters across modalities, but it is not proof that one algorithm or benchmark predicts every deployment.

## Robustness is a quantified property, not a personality trait

Calling a model “robust” is incomplete. Robust to what perturbations, within which magnitude, under which metric and threat model?

### Natural and synthetic corruption

A corruption benchmark may apply blur, noise, compression, weather effects, or transformations at controlled severity. Such tests are reproducible and useful for diagnosis, but synthetic perturbations become less informative if training data already include them. LAION-C was motivated by precisely this problem: its authors argued that many ImageNet-C corruptions were no longer truly out of distribution for models pretrained on web-scale image collections. They introduced six new distortion types intended to remain outside LAION-like training distributions and found them challenging even for contemporary multimodal models ([Li et al., 2025](https://proceedings.mlr.press/v267/li25aw.html)).

This illustrates benchmark aging. Rising performance can represent genuine transferable capability, exposure to the benchmark’s transformations, or both. Because large pretraining corpora are not fully observable, proving that a test is uncontaminated may be impossible. Evaluators should state whether “OOD” means outside a documented training set, unlikely in a presumed web distribution, or merely absent from a named downstream dataset.

### Adversarial robustness

An adversarial example is deliberately selected to increase loss while remaining inside a specified perturbation set. For a norm-bounded threat model, robust risk is often written as

\[
R_{\mathrm{adv}}(f)
=
\mathbb{E}_{(X,Y)}
\left[
\max_{\lVert\delta\rVert_p\leq\varepsilon}
\ell(f(X+\delta),Y)
\right].
\]

Goodfellow, Shlens, and Szegedy showed that small worst-case perturbations could transfer across models and proposed the fast-gradient-sign construction

\[
x_{\text{adv}}
=
x+\varepsilon\operatorname{sign}
\left(\nabla_x\ell(f(x),y)\right).
\]

In their MNIST experiment, adversarial training reduced ordinary test error from 0.94% to 0.84% for one maxout setup and reduced fast-gradient-sign adversarial error from 89.4% to 17.9%, although erroneous adversarial predictions remained highly confident ([Goodfellow et al., 2014](https://arxiv.org/abs/1412.6572)).

These are historically important experimental findings, not universal guarantees. Robustness at one \(\ell_p\) radius does not imply resistance to semantic edits, physical attacks, prompt injection, distributional change, or a stronger optimization procedure. An attack that fails to find a counterexample establishes only a lower bound on the adversary’s success unless the evaluation supplies a certificate.

### Calibration and selective prediction

Accuracy measures how often a decision is correct; calibration asks whether stated probabilities correspond to empirical frequencies. If predictions assigned confidence \(0.8\) are calibrated, approximately 80% should be correct in the relevant population. A perfectly accurate classifier can still provide poor probabilities, while a calibrated predictor can have modest discrimination.

Expected calibration error is commonly approximated by binning predictions:

\[
\operatorname{ECE}
=
\sum_{b=1}^{B}
\frac{|S_b|}{n}
\left|
\operatorname{acc}(S_b)-\operatorname{conf}(S_b)
\right|.
\]

Its value depends on the binning scheme and can obscure subgroup or local miscalibration. Guo and colleagues found that the modern neural networks they studied were often miscalibrated and that temperature scaling—a single fitted scalar applied to logits—was surprisingly effective on most of their image and document-classification datasets ([Guo et al., 2017](https://proceedings.mlr.press/v70/guo17a)). Temperature scaling preserves class ranking, so it cannot repair poor accuracy, and calibration learned on one distribution may fail after shift.

When uncertainty can trigger deferral, evaluators should report **coverage**—the fraction of cases answered—and **selective risk** on the answered cases. A system that is accurate only because it abstains on most difficult cases is not comparable to a full-coverage model. Deferral also needs an evaluated destination: handing uncertain cases to overloaded humans is not automatically safe.

## Why aggregate benchmark scores mislead

An aggregate score compresses decisions about task selection, sample weighting, prompts, decoding, thresholds, and error costs. Two systems with the same mean can have opposite failure profiles. A credible benchmark audit should ask:

- Is the unit of analysis an item, user, patient, conversation, or institution?
- Were correlated observations kept in the same split?
- Does a micro-average allow common classes to dominate?
- Are subgroup sizes and confidence intervals reported?
- Was the test set used during prompt, checkpoint, or hyperparameter selection?
- Could training or retrieval data contain test questions or close paraphrases?
- Are missing outputs counted as failures?
- Do human and automated graders agree, and can formatting change the result?
- Are latency, cost, memory, and energy measured under comparable conditions?

HELM’s design makes two especially useful points: evaluation should be multi-metric, and incompleteness should be explicit. Its initial core evaluation applied seven metrics to each of 16 scenarios rather than relegating non-accuracy properties to unrelated tests ([HELM methodology](https://crfm.stanford.edu/2022/11/17/helm.html)). Even this is not exhaustive. Standardization improves comparability, but a standardized generic prompt may understate the best achievable application-specific system; customized prompts improve each model’s score but introduce another optimization budget that must be disclosed.

Statistical uncertainty also matters. For an accuracy estimate \(\hat p=k/n\), the rough standard error \(\sqrt{\hat p(1-\hat p)/n}\) assumes independent Bernoulli trials. That assumption fails when examples share authors, templates, patients, videos, or source documents. Cluster-aware resampling or hierarchical analysis may be needed. When comparing systems on identical cases, paired analysis is preferable because item difficulty is shared. Multiple benchmarks, model variants, and prompts also create opportunities for selective reporting.

Effect size should accompany significance. A precisely estimated 0.2-percentage-point improvement may have negligible deployment value, while a statistically uncertain worst-group collapse may demand investigation because its harm is large.

## From benchmark audit to deployment evidence

A responsible evaluation program should progress through layers of evidence.

### 1. Specify the claim

State the intended users, geography, time horizon, modalities, decision threshold, acceptable failure rates, and excluded uses. “Works on medical questions” is not testable enough; “supports licensed clinicians answering English-language medication questions in these jurisdictions, with mandatory review” is closer to an auditable claim.

### 2. Construct independent splits

Split by the entities that will be new at deployment: future time, hospital, customer, author, geographic region, device, or policy regime. Random row-level splits are inappropriate when the same entity contributes highly correlated observations to training and test sets.

### 3. Establish simple baselines and ablations

Compare against constant, linear, rules-based, retrieval-only, and prior-production systems where relevant. Remove candidate features or data sources to discover shortcuts. Retrain across random seeds: large behavioral variation among equally accurate models is evidence of underspecification, not harmless noise.

### 4. Measure multiple dimensions

At minimum, consider task loss, calibration, subgroup performance, robustness, abstention, latency, resource use, and the consequences of failures. For sequential systems, include return distributions, constraint violations, tail outcomes, and sensitivity to simulator assumptions—not only mean reward.

### 5. Stress plausible shifts

Use naturally separated target domains when possible, supplemented by controlled corruptions and adversarial tests. Each stress test should explain its causal or operational relevance. Performance on an arbitrary perturbation is diagnostic evidence, not a generic robustness certificate.

### 6. Evaluate the whole system

Retrieval indexes, preprocessing, tool calls, safety filters, user interfaces, and human escalation policies can dominate real performance. Foundation-model evaluations should preserve prompts, model versions, decoding parameters, external tools, timestamps, and grader versions. Otherwise a nominally identical model may denote a different system later.

### 7. Monitor prospectively

After deployment, track input distributions, missingness, confidence, abstentions, error reports, subgroup outcomes, latency, and downstream effects. Input drift is an alarm, not proof of performance degradation; stable input statistics likewise do not prove that \(P(Y\mid X)\) remains stable. Delayed labels, selective labels, and intervention effects can make real error rates difficult to observe.

Predefine responses: collect labels, recalibrate, change thresholds, route to humans, retrain, restrict scope, or roll back. Monitoring without decision rights and operational triggers is only observation.

## Established findings, open questions, and limits

Several conclusions are well supported by the cited primary studies:

- Test performance can decline under carefully recollected or cross-domain data even when the nominal task is unchanged ([Recht et al., 2019](https://proceedings.mlr.press/v97/recht19a); [Miller et al., 2020](https://proceedings.mlr.press/v119/miller20a.html)).
- Naturally occurring shifts across institutions, locations, and time are not uniformly solved by existing robustness methods ([Koh et al., 2021](https://proceedings.mlr.press/v139/koh21a)).
- Similar in-distribution performance can conceal materially different behavior under stress tests ([D’Amour et al., 2022](https://www.jmlr.org/beta/papers/v23/20-1335.html)).
- Adversarial vulnerability, ordinary generalization, calibration, and natural-shift robustness are distinct properties; success on one does not logically establish the others ([Goodfellow et al., 2014](https://arxiv.org/abs/1412.6572); [Guo et al., 2017](https://proceedings.mlr.press/v70/guo17a.html)).
- Benchmarks can lose diagnostic power as training distributions and model capabilities change ([Li et al., 2025](https://proceedings.mlr.press/v267/li25aw.html)).

Important uncertainty remains. There is no complete taxonomy of future shifts, and stress tests inevitably encode evaluator judgment. Proprietary or undocumented pretraining data make contamination difficult to exclude. Some target outcomes arrive only after long delays; others are altered by the model’s intervention. Rare catastrophic failures cannot be estimated precisely from ordinary sample sizes. Human ratings have their own disagreement, cultural scope, and anchoring effects. Moreover, an empirical benchmark cannot establish that a system is safe under every untested use.

The correct response is neither to abandon benchmarking nor to treat it as proof. Evaluation should be understood as cumulative, scoped evidence. Strong evidence combines independent data, meaningful target populations, multiple metrics, explicit uncertainty, realistic stress tests, system-level trials, and post-deployment monitoring. The most credible conclusion is often conditional: *under these data-generating conditions, with this system configuration and these measured limitations, performance met—or failed to meet—the stated criterion.*

## References

- D’Amour, A. et al. “Underspecification Presents Challenges for Credibility in Modern Machine Learning.” *Journal of Machine Learning Research* 23, 2022. <https://www.jmlr.org/beta/papers/v23/20-1335.html>
- Goodfellow, I., Shlens, J., and Szegedy, C. “Explaining and Harnessing Adversarial Examples.” 2014. <https://arxiv.org/abs/1412.6572>
- Guo, C. et al. “On Calibration of Modern Neural Networks.” *ICML*, 2017. <https://proceedings.mlr.press/v70/guo17a.html>
- Koh, P. W. et al. “WILDS: A Benchmark of in-the-Wild Distribution Shifts.” *ICML*, 2021. <https://proceedings.mlr.press/v139/koh21a>
- Li, F. et al. “LAION-C: An Out-of-Distribution Benchmark for Web-Scale Vision Models.” *ICML*, 2025. <https://proceedings.mlr.press/v267/li25aw.html>
- Miller, J. et al. “The Effect of Natural Distribution Shift on Question Answering Models.” *ICML*, 2020. <https://proceedings.mlr.press/v119/miller20a.html>
- Recht, B. et al. “Do ImageNet Classifiers Generalize to ImageNet?” *ICML*, 2019. <https://proceedings.mlr.press/v97/recht19a>
- Stanford Center for Research on Foundation Models. “Language Models are Changing AI: The Need for Holistic Evaluation.” 2022. <https://crfm.stanford.edu/2022/11/17/helm.html>
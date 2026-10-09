# Causal Machine Learning and Structural Modeling

## The central question

Suppose a hospital trains a model to predict whether patients will recover. In historical data, patients who received an intensive treatment were less likely to recover. Should the hospital conclude that the treatment is harmful?

Not necessarily. Doctors may have preferentially given the treatment to the sickest patients. The model has learned the association

\[
P(Y=1\mid A=1)<P(Y=1\mid A=0),
\]

where \(A\) denotes treatment and \(Y\) denotes recovery. But the decision-relevant quantity is instead the outcome distribution under an intervention:

\[
P(Y=1\mid do(A=1)).
\]

The first expression conditions on treatment as it occurred; the second asks what would happen if treatment were assigned. Judea Pearl’s causal calculus formalized precisely this distinction between ordinary conditioning and externally setting a variable, while also showing that interventional quantities can sometimes—but not always—be identified from observational data under explicit structural assumptions ([Pearl, 1995](https://proceedings.mlr.press/r0/pearl95a.html)).

This distinction is the organizing idea of causal machine learning. Associative learning estimates regularities in an observed distribution. Causal learning adds assumptions about how that distribution was generated and how it would change under interventions or shifts of environment. These assumptions can improve generalization, robustness, and interpretation when they are approximately correct. They can also produce confident errors when they are wrong. Causality is therefore not a magical property extracted from a large dataset; it is a disciplined way of connecting data, assumptions, interventions, and empirical tests.

**Observable learning outcome:** after reading this report, a learner should be able to take a prediction problem, distinguish an associational target from a causal one, state the structural or potential-outcome assumptions needed for identification, derive a simple adjustment estimand, and propose empirical checks that could falsify or refine—not conclusively prove—the assumptions.

## Prerequisites and definitions

A **joint probability distribution** \(P(X_1,\ldots,X_p,Y)\) describes which values tend to occur together. Standard supervised learning usually estimates a function \(f(X)\) that minimizes expected predictive loss,

\[
R(f)=\mathbb E[\ell(f(X),Y)].
\]

Empirical risk minimization replaces this expectation with an average over training examples. Its usual guarantee concerns new examples generated under assumptions related to the training distribution. It does not, by itself, say what happens after a policy changes the process generating \(X\) or \(Y\).

A **distribution shift** occurs when the deployment distribution differs from the training distribution. Shifts may come from changes in population, measurement, policy, selection, incentives, or interventions. Some shifts leave a useful conditional distribution stable; others break it. Without assumptions about what changed, no method can generally extrapolate to every possible unseen distribution.

A **confounder** is a common cause of a candidate cause and an outcome. Confounding can make observational conditioning differ from intervention. A **mediator** lies on a causal pathway from treatment to outcome. A **collider** is a common effect of two variables; conditioning on it can create an association between its causes. These roles are causal, not merely statistical: the same covariance matrix can sometimes be compatible with different causal structures.

An **estimand** is the precise population quantity one seeks, such as an average treatment effect. **Identification** means that the estimand is uniquely expressible using the distribution of observed data under stated assumptions. **Estimation** is the subsequent statistical problem of learning that expression from a finite sample. A causal effect may be well defined but unidentified, identified but imprecisely estimated, or accurately estimated for a population that does not match deployment.

## Two complementary causal languages

### Structural causal models

A structural causal model represents each endogenous variable as the output of a mechanism:

\[
X_j := f_j(PA_j,U_j),
\]

where \(PA_j\) are the modeled direct causes, or parents, of \(X_j\), and \(U_j\) collects factors outside the modeled system. A directed graph records these parent relations. The assignment symbol emphasizes mechanism rather than algebraic equality: changing the equation for one variable need not change the other equations.

An ideal intervention \(do(A=a)\) replaces the structural equation for \(A\) with \(A:=a\), severing the ordinary causes of treatment while leaving the remaining mechanisms intact. Pearl’s original formulation used this “surgical” semantics to derive rules for deciding when observational or partial experimental information suffices to estimate intervention effects ([Pearl, 1995](https://proceedings.mlr.press/r0/pearl95a.html)).

Consider

\[
\begin{aligned}
S &:= f_S(U_S),\\
A &:= f_A(S,U_A),\\
Y &:= f_Y(A,S,U_Y),
\end{aligned}
\]

where \(S\) is severity. Because \(S\to A\) and \(S\to Y\), the association between \(A\) and \(Y\) mixes the treatment effect with differences in severity. If the graph is causally adequate, all relevant common causes are measured in \(S\), and the required probabilities are positive, the back-door adjustment is

\[
P(Y\mid do(A=a))
  = \sum_s P(Y\mid A=a,S=s)P(S=s).
\]

This is not a consequence of regression alone. It follows from assumptions encoded by the graph: severity precedes treatment, severity affects outcome, treatment does not cause pre-treatment severity, and no omitted common cause remains after adjustment.

Structural equations also distinguish direct, indirect, and total effects. If treatment changes a mediator \(M\), which then changes \(Y\), an ordinary feature-attribution method may report that \(M\) is predictive. A causal analysis instead asks which paths should be included in a particular estimand. That distinction matters because conditioning on a mediator can remove part of the total treatment effect, while conditioning on a collider can introduce bias.

### Potential outcomes

The potential-outcomes framework starts with counterfactual outcomes. For a binary treatment, \(Y_i(1)\) is unit \(i\)’s outcome under treatment and \(Y_i(0)\) its outcome under control. The individual effect is

\[
\tau_i=Y_i(1)-Y_i(0),
\]

but only one potential outcome is normally observed. A common target is the average treatment effect,

\[
ATE=\mathbb E[Y(1)-Y(0)].
\]

Three assumptions clarify what is required to identify this quantity observationally:

1. **Consistency:** when a unit receives \(A=a\), the observed outcome equals \(Y(a)\). This requires treatment versions to be defined sufficiently well for the intended question.
2. **Conditional exchangeability:** \((Y(1),Y(0))\perp A\mid S\). After conditioning on measured \(S\), treated and untreated units are comparable with respect to their potential outcomes.
3. **Positivity:** every treatment being compared has nonzero probability within the covariate strata relevant to the target population.

Hernán and Robins emphasize that these observational identification conditions can be “heroic” and that causal analysis also depends on adequate measurement and statistical modeling ([*Causal Inference: What If*](https://miguelhernan.org/s/hernanrobins_WhatIf_2jan25.pdf)). Under these assumptions,

\[
ATE=
\sum_s
\left[
\mathbb E(Y\mid A=1,S=s)
-\mathbb E(Y\mid A=0,S=s)
\right]P(S=s).
\]

This is the potential-outcome counterpart of graphical adjustment.

The two languages emphasize different aspects of the same problem. Potential outcomes make the estimand and assignment assumptions especially explicit. Structural models make mechanisms, pathways, interventions, and conditional-independence implications especially explicit. Their notation is not interchangeable without care, but in many standard acyclic settings they can encode compatible causal claims.

## Historical continuity

Modern causal ML inherits ideas from several earlier research programs. In econometrics, Trygve Haavelmo argued in 1944 that quantitative economic models should be formulated as probability models so that theoretical restrictions, stochastic variation, and statistical inference could be considered together ([Haavelmo, 1944](https://lies.mat.uc.cl/wp-content/uploads/2020/12/Haavelmo1944.pdf)). Simultaneous-equation models addressed systems in which prices, quantities, income, and policy variables could be jointly determined rather than treated as a one-way regression.

In biometrics and psychometrics, path analysis and latent-variable models linked observable correlations to hypothesized structures involving direct paths, measurement error, and unobserved constructs. Historical scholarship describes twentieth-century structural equation modeling as a convergence of biometric path analysis, econometric simultaneous equations, psychometric factor analysis, and sociological modeling ([Matsueda, 2012](https://csss.uw.edu/research/working-papers/key-advances-history-structural-equation-modeling)). This history is important because “structural equation model” has more than one usage. A covariance-fitting SEM is not automatically causal. It becomes a causal model only when its equations and invariance claims are given causal meaning justified by design or substantive knowledge.

Modern causal ML adds flexible function approximation, high-dimensional representations, automated structure-learning proposals, and multiple-environment training. The central problem remains older: which parts of a statistical regularity describe mechanisms stable enough to support policy, intervention, or transport?

## Why causal assumptions can improve machine learning

### Generalization under structured shifts

A purely associative model may exploit any feature that improves average training loss. If background color predicts an animal label in the training set, empirical risk minimization has no inherent reason to ignore it. Arjovsky and colleagues illustrate this with cow and camel images: backgrounds can become shortcuts, causing errors when cows appear on beaches rather than pastures ([Arjovsky et al., 2019](https://arxiv.org/abs/1907.02893)).

A causal model offers a qualified invariance argument. If

\[
Y := g(C,U_Y)
\]

and environments change variables upstream of the causal predictors \(C\) without changing \(g\) or the distribution of \(U_Y\), then \(P(Y\mid C)\) can remain stable even though \(P(C)\), correlations among noncausal features, or selection processes change. The conclusion is conditional: changing the outcome mechanism itself defeats the invariance.

Invariant Causal Prediction operationalizes this idea using data from multiple environments. In a linear structural model, the direct causes of \(Y\) form a predictor set whose residual distribution remains invariant across interventions that alter other variables but do not intervene on \(Y\). Candidate predictor sets can therefore be tested for stable coefficients or residual distributions across environments ([Peters, Bühlmann, and Meinshausen, 2016](https://arxiv.org/abs/1501.01332)). The method does not claim that stability alone always identifies the unique causal set: with only one observational environment, many sets may be equally invariant, while particular interventions and additional assumptions can make identification possible.

Invariant Risk Minimization extends a related intuition to learned representations. Its ideal objective seeks a representation \(\Phi\) for which one predictor \(w\) is optimal in every training environment:

\[
\min_{\Phi,w}\sum_{e\in\mathcal E_{\mathrm{tr}}}R^e(w\circ\Phi)
\quad\text{such that}\quad
w\in\arg\min_{\bar w}R^e(\bar w\circ\Phi)
\ \text{for every }e.
\]

The practical IRMv1 relaxation adds a gradient penalty encouraging the same classifier to be optimal across environments ([Arjovsky et al., 2019](https://arxiv.org/abs/1907.02893)). This is an architectural and objective-level use of causal motivation: the learner is encouraged to represent stable relationships rather than every predictive correlation.

Yet this is a research proposal, not a universal guarantee. In the DomainBed evaluation, carefully implemented empirical risk minimization achieved the best average performance among the compared domain-generalization methods, and no included method exceeded it by more than one percentage point under matched experimental conditions ([Gulrajani and Lopez-Paz, 2021](https://arxiv.org/abs/2007.01434)). Thus, causal motivation can suggest useful inductive biases, but benchmark evidence does not establish that a particular invariance algorithm has recovered causes or will dominate a strong associative baseline.

### Robustness as a claim about mechanisms

Distributionally robust optimization often protects against a mathematically specified neighborhood of distributions. Causal robustness instead asks which mechanisms may change. These are different guarantees. Robustness over mixtures or small perturbations of observed environments may not cover a policy that breaks a structural equation. Conversely, a valid invariant mechanism can support extrapolation beyond small statistical neighborhoods.

A useful robustness statement therefore has four parts:

- the causal target;
- the mechanisms assumed stable;
- the mechanisms allowed to change;
- the population and intervention range over which support exists.

“Causal models are robust” is too broad. A more defensible claim is: “This predictor remains valid under interventions on specified upstream variables, provided the outcome mechanism and measurement process remain stable.”

### Interpretability for action

Feature importance describes how predictions depend on inputs within a fitted model. It does not establish that changing a feature will change the outcome. A credit model may rely on address because it proxies for income, historical discrimination, or data-collection practices. Removing the address field may leave those pathways encoded in other variables.

Causal interpretation instead forces the analyst to specify an intervention. Is the question about changing an applicant’s income, changing a lender’s decision rule, preventing the use of a protected attribute, or changing the social processes that generated the observed disparities? Different interventions imply different potential outcomes and different graphs.

This makes causal explanations useful for accountability: stakeholders can challenge arrows, omitted causes, treatment definitions, population boundaries, and stability claims. It does not make the model politically neutral. Fairness criteria involving interventions or counterfactuals depend on contested assumptions about which attributes may vary, which pathways are permissible, and which social mechanisms belong inside the model.

## Worked example: treatment prediction versus treatment effect

Assume a simplified observational dataset with equal numbers of mild and severe patients.

| Severity \(S\) | Recovery if treated | Recovery if untreated | Treatment rate |
|---|---:|---:|---:|
| Mild | 90% | 80% | 20% |
| Severe | 40% | 20% | 80% |

Within both severity strata, treatment improves recovery by 10 or 20 percentage points. But treatment is concentrated among severe patients.

For 1,000 mild and 1,000 severe patients:

- Treated mild: \(200\), with \(180\) recoveries.
- Untreated mild: \(800\), with \(640\) recoveries.
- Treated severe: \(800\), with \(320\) recoveries.
- Untreated severe: \(200\), with \(40\) recoveries.

The associational recovery rates are therefore

\[
P(Y=1\mid A=1)=\frac{180+320}{1000}=0.50
\]

and

\[
P(Y=1\mid A=0)=\frac{640+40}{1000}=0.68.
\]

A predictor could accurately learn that treated patients recover less often. Interpreted causally, it would wrongly infer an 18-percentage-point harm.

Adjustment instead averages the within-severity treatment contrasts over the target population:

\[
ATE
=0.5(0.90-0.80)+0.5(0.40-0.20)
=0.15.
\]

Under consistency, positivity, conditional exchangeability given severity, and correct measurement, the estimated average effect is a 15-percentage-point improvement.

This example teaches the learning outcome in concrete form:

1. The predictive target \(P(Y\mid A)\) differs from the intervention target \(P(Y\mid do(A))\).
2. The graph \(S\to A\), \(S\to Y\), \(A\to Y\) identifies \(S\) as an adjustment variable.
3. The potential-outcome statement is \((Y(1),Y(0))\perp A\mid S\).
4. The empirical calculation standardizes stratum-specific outcomes to a common severity distribution.

The conclusion remains conditional. If “severity” omits frailty known to clinicians, exchangeability can fail. If virtually no severe patient remains untreated, positivity is weak and the untreated severe outcome is poorly supported. If treatment varies in dose or timing, consistency may fail. The arithmetic cannot validate those assumptions.

## How assumptions can be tested and refined

### Randomized and targeted interventions

Random assignment breaks systematic dependence between treatment and pre-treatment causes in expectation, directly addressing confounding for the assigned intervention. Factorial experiments, encouragement designs, A/B tests, and perturbation studies can target particular arrows or mechanisms. Experiments still require attention to noncompliance, attrition, interference, measurement, and external validity; they identify the effect of the intervention actually implemented in the experimental population.

### Conditional-independence and model-fit tests

A causal graph can imply observable conditional independences. If the graph predicts \(X\perp Y\mid Z\), data can test that restriction. With hidden variables, models may also impose non-independence functional constraints; Tian and Pearl showed that latent-variable causal structures can have testable implications beyond ordinary d-separation constraints ([Tian and Pearl, 2002](https://arxiv.org/abs/1301.0608)).

Rejection is useful evidence against some combination of the graph, measurement model, sampling assumptions, and statistical test. Non-rejection does not prove the graph: tests may lack power, and different causal graphs can entail the same observed independences.

### Cross-environment invariance

When data come from hospitals, countries, time periods, policies, or designed perturbations, researchers can compare conditional distributions or residuals across environments. Invariant Causal Prediction proposes fitting candidate models and testing whether their coefficients or residual distributions are stable; nonlinear variants can test equality of regression functions or the conditional independence \(Y\perp E\mid X_S\), where \(E\) labels environment ([Peters, Bühlmann, and Meinshausen, 2016](https://arxiv.org/abs/1501.01332)).

Environment choice is decisive. Two environments that perturb the same irrelevant mechanism may provide little information. A change that directly alters the outcome mechanism violates the very invariance being tested. Environments should therefore be documented as interventions or natural shifts, not treated as arbitrary dataset labels.

### Balance, overlap, and propensity scores

The propensity score is

\[
e(S)=P(A=1\mid S).
\]

Rosenbaum and Rubin showed that, under strong ignorability, adjustment for this scalar balancing score can remove bias attributable to observed covariates ([Rosenbaum and Rubin, 1983](https://doi.org/10.1093/biomet/70.1.41)). Researchers can inspect whether weighting or matching balances the measured pre-treatment covariates and whether treated and untreated units have adequate overlap.

Balance is a diagnostic for the implemented adjustment, not proof that unmeasured confounding is absent. Extreme propensity scores reveal practical positivity problems and make estimates sensitive to a few heavily weighted observations.

### Negative controls and placebo tests

A negative-control outcome should not plausibly be caused by the treatment but should share relevant bias pathways; a negative-control exposure should not cause the focal outcome but may share confounding or measurement processes. An unexpected association can reveal residual confounding, selection, or systematic error. Lipsitch, Tchetgen Tchetgen, and Cohen argued for negative controls as a routine way to detect both suspected and unsuspected sources of spurious causal inference in observational research ([Lipsitch, Tchetgen Tchetgen, and Cohen, 2010](https://pubmed.ncbi.nlm.nih.gov/20335814/)).

Negative controls themselves require causal justification. A supposed placebo outcome may actually be affected by treatment, while a null result may arise from low power.

### Sensitivity analysis and specification comparison

Because no-confounding assumptions are rarely fully testable, sensitivity analysis asks how strong an omitted bias would need to be to change the conclusion. Other useful comparisons include alternative adjustment sets justified by the graph, alternative treatment definitions, different outcome windows, subgroup estimates, missing-data models, and bounds rather than point identification.

These analyses refine the scope of a claim. If a result disappears under modest plausible confounding, it is fragile. If several defensible specifications agree, confidence may increase, though correlated errors can make apparently independent checks misleading.

### Prospective validation after deployment

A causal model intended to support decisions should be evaluated when those decisions alter the data-generating process. Staged rollouts, policy discontinuities, randomized pilots, and monitoring across sites can compare predicted intervention effects with observed post-intervention outcomes. Updating should focus not only on parameters but also on whether treatment definitions, measurement, population composition, or structural mechanisms changed.

## Limits and responsible conclusions

Causal assumptions improve ML by narrowing the class of shifts and interventions the learner must handle. That restriction is the source of both power and risk. If the assumed graph, exchangeability condition, or mechanism invariance is correct enough, the model can avoid shortcuts, target actionable quantities, and explain why a prediction should transport. If the restriction is wrong, the causal label does not protect the result.

Several limits follow:

- Observational equivalence means data may not distinguish competing causal graphs.
- Hidden confounding can invalidate adjustment without producing an obvious warning.
- Interference between units violates simple unit-level potential-outcome models.
- Measurement changes can imitate causal mechanism changes.
- Positivity failures force extrapolation into unsupported treatment–covariate combinations.
- A causal effect identified in one population need not transport to another.
- Stable prediction does not alone prove causal direction.
- Average effects may conceal consequential heterogeneity.
- Causal fairness conclusions inherit normative choices as well as empirical assumptions.
- Current invariant-learning algorithms have mixed benchmark evidence and should be compared with well-tuned empirical-risk baselines ([Gulrajani and Lopez-Paz, 2021](https://arxiv.org/abs/2007.01434)).

The appropriate conclusion is therefore neither that association is useless nor that causality automatically solves generalization. Associative prediction is often the right objective when deployment closely matches training and no intervention claim is needed. Causal modeling becomes essential when a system must reason about actions, policies, transport, or structured shifts. Its principal contribution is to expose the extra assumptions that such reasoning always requires.

## Retrieval question

**Question:** Why can \(P(Y\mid A=a)\) differ from \(P(Y\mid do(A=a))\), and under what assumptions does adjustment for \(S\) identify the average treatment effect?

**Expected answer:** Conditioning selects units who happened to receive treatment, whereas intervention sets treatment independently of its ordinary causes. If \(S\) captures the relevant pre-treatment common causes, treatment is conditionally exchangeable given \(S\), treatment levels have positive probability within relevant strata, and consistency holds, then standardizing the stratum-specific outcome contrasts over \(P(S)\) identifies the average treatment effect.

**How to check it:** Compare the distinction between observation and intervention in [Pearl’s causal-calculus paper](https://proceedings.mlr.press/r0/pearl95a.html) with the exchangeability, positivity, and consistency conditions in [Hernán and Robins](https://miguelhernan.org/s/hernanrobins_WhatIf_2jan25.pdf).

## Transfer exercise

A hiring model predicts employee retention using skill-test score, commute distance, prior salary, and whether an applicant accepted a signing bonus. The company wants to know whether increasing the bonus will improve one-year retention at a new office.

Construct two plausible causal graphs that produce similar historical predictions but imply different bonus effects. In one, the bonus directly improves retention; in the other, recruiters offer bonuses to applicants they privately judge likely to leave. Identify the estimand, possible confounders, positivity concerns, and at least three empirical checks—such as a randomized bonus experiment, cross-office invariance test, covariate-balance assessment, or negative-control outcome. State which mechanisms must remain stable for the estimate to transport to the new office.

**How to check it:** Use [Pearl](https://proceedings.mlr.press/r0/pearl95a.html) to verify that the intervention is represented by replacing the bonus-assignment mechanism; use [Peters, Bühlmann, and Meinshausen](https://arxiv.org/abs/1501.01332) to assess whether the proposed cross-office invariance claim is appropriately limited; and use [Rosenbaum and Rubin](https://doi.org/10.1093/biomet/70.1.41) to check whether propensity-score balance addresses only observed covariates.

## References

- Haavelmo, T. (1944). [*The Probability Approach in Econometrics*](https://lies.mat.uc.cl/wp-content/uploads/2020/12/Haavelmo1944.pdf).
- Pearl, J. (1995). [“A Causal Calculus for Statistical Research.”](https://proceedings.mlr.press/r0/pearl95a.html)
- Rosenbaum, P. R., and Rubin, D. B. (1983). [“The Central Role of the Propensity Score in Observational Studies for Causal Effects.”](https://doi.org/10.1093/biomet/70.1.41)
- Tian, J., and Pearl, J. (2002). [“On the Testable Implications of Causal Models with Hidden Variables.”](https://arxiv.org/abs/1301.0608)
- Lipsitch, M., Tchetgen Tchetgen, E., and Cohen, T. (2010). [“Negative Controls: A Tool for Detecting Confounding and Bias in Observational Studies.”](https://pubmed.ncbi.nlm.nih.gov/20335814/)
- Matsueda, R. L. (2012). [“Key Advances in the History of Structural Equation Modeling.”](https://csss.uw.edu/research/working-papers/key-advances-history-structural-equation-modeling)
- Peters, J., Bühlmann, P., and Meinshausen, N. (2016). [“Causal Inference Using Invariant Prediction: Identification and Confidence Intervals.”](https://arxiv.org/abs/1501.01332)
- Arjovsky, M., Bottou, L., Gulrajani, I., and Lopez-Paz, D. (2019). [“Invariant Risk Minimization.”](https://arxiv.org/abs/1907.02893)
- Gulrajani, I., and Lopez-Paz, D. (2021). [“In Search of Lost Domain Generalization.”](https://arxiv.org/abs/2007.01434)
- Hernán, M. A., and Robins, J. M. [*Causal Inference: What If*](https://miguelhernan.org/s/hernanrobins_WhatIf_2jan25.pdf).
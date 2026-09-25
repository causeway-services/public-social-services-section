# Attention, Transformers, Scaling, and Foundation Models

## From learned representations to general-purpose models

A prerequisite for understanding transformers is the neural-network view of learning. A model represents an input as numerical vectors, combines them through parameterized layers, and adjusts its parameters by gradient descent to minimize an empirical loss. Generalization is then an inference from finite training data: low training or validation loss is evidence about performance under related data distributions, not a guarantee of factuality, robustness, or safe behavior in every deployment.

Transformers did not replace this framework. Their importance lies in changing how sequence elements interact, how efficiently training can be parallelized, and how readily a single learned representation can be adapted to many tasks. When researchers combined that architecture with self-supervised objectives, large datasets, specialized accelerators, and distributed systems, the result was the modern foundation-model paradigm.

A **language model** assigns probabilities to sequences of tokens. In an autoregressive model,

\[
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}),
\]

and training commonly minimizes token-level negative log-likelihood,

\[
\mathcal{L}(\theta)
=-\frac{1}{T}\sum_{t=1}^{T}
\log p_\theta(x_t\mid x_{<t}).
\]

Tokens may represent words, subwords, bytes, image patches, audio segments, or other units. The objective rewards accurate prediction of the training distribution. It does not directly require the model to form truthful beliefs, identify causal structure, cite evidence, or follow human intentions. Those behaviors must arise indirectly from prediction, adaptation, post-training, tool use, or additional supervision.

## Why attention mattered

Before transformers, sequence processing was dominated by recurrent neural networks and, increasingly, convolutional sequence models. A recurrent network updates a state one position at a time. This gives it a natural notion of order but makes training difficult to parallelize across sequence positions and creates long paths through which information and gradients must travel. Attention mechanisms already helped encoder–decoder systems retrieve relevant source states, but they remained attached to recurrent architectures.

The 2017 paper [“Attention Is All You Need”](https://arxiv.org/abs/1706.03762) made attention the primary computation. For an input represented by matrices of queries \(Q\), keys \(K\), and values \(V\), scaled dot-product attention is

\[
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V.
\]

Each query is compared with every permitted key. The softmax converts the scores into weights, and the output is a weighted combination of value vectors. Dividing by \(\sqrt{d_k}\), where \(d_k\) is the key dimension, prevents dot products from growing so large that the softmax enters regions with very small gradients.

In **self-attention**, queries, keys, and values are learned projections of the same sequence. **Multi-head attention** performs several such transformations in parallel:

\[
\operatorname{head}_i
=\operatorname{Attention}(QW_i^Q,KW_i^K,VW_i^V),
\]

\[
\operatorname{MultiHead}(Q,K,V)
=\operatorname{Concat}(\operatorname{head}_1,\ldots,\operatorname{head}_h)W^O.
\]

Different heads can learn different patterns of interaction, although interpreting individual heads as stable linguistic or reasoning modules is often unreliable. Attention is a routing operation over representations, not by itself an explanation of a model’s decision.

A transformer block combines attention with position-wise feed-forward layers, residual connections, and normalization. Because bare self-attention is invariant to permutations, the original model added sinusoidal positional encodings; later systems used learned positions or relative and rotary position schemes. Decoder-only language models also apply a causal mask so position \(t\) cannot attend to future tokens.

The original transformer was an encoder–decoder translation system, not a general-purpose chatbot. On WMT 2014 English-to-German translation it reported 28.4 BLEU, more than two BLEU above previously reported ensembles, while its English-to-French model obtained 41.8 BLEU after 3.5 days on eight GPUs. These are historical experimental results under particular data, tokenization, and evaluation conventions—not proof that attention is universally superior.

The architectural gain was partly computational. All positions in a training sequence can be processed simultaneously, turning much of training into accelerator-friendly matrix multiplication. Self-attention also gives any pair of positions a short interaction path. The tradeoff is that conventional attention constructs an \(n\times n\) score matrix for a sequence of length \(n\), producing quadratic time and memory growth with context length. Thus “parallelizable” does not mean inexpensive.

Systems research has changed the practical boundary. [FlashAttention](https://arxiv.org/abs/2205.14135) computes exact attention in tiles, reducing transfers between GPU high-bandwidth memory and on-chip SRAM without changing the mathematical result. Its initial experiments reported a threefold training speedup for GPT-2 at sequence length 1,024 and enabled experiments up to 64,000 tokens. These are hardware- and implementation-dependent results; they do not abolish the underlying quadratic arithmetic of dense attention.

## From architecture to pretraining and adaptation

Transformers became broadly useful through several architectural and objective choices.

An **encoder-only** model can attend bidirectionally to all visible input positions. [BERT](https://arxiv.org/abs/1810.04805), introduced in 2018, pretrained an encoder using masked-token prediction and then fine-tuned it for classification, inference, and extractive question answering. Its reported results included an 80.5 GLUE score and 93.2 F1 on SQuAD 1.1. BERT demonstrated that a common pretrained representation could replace extensive task-specific architecture engineering.

A **decoder-only** model predicts subsequent tokens under a causal mask. This supports open-ended generation and allows tasks to be expressed in text. In 2020, [GPT-3](https://arxiv.org/abs/2005.14165) scaled this design to 175 billion parameters and evaluated tasks through instructions and examples in its context, without gradient updates. The largest model had 96 layers, a hidden width of 12,288, 96 attention heads, and a 2,048-token context. All eight experimental model sizes were trained for 300 billion tokens. Its dataset mixed filtered Common Crawl, WebText-like material, books, and English Wikipedia, with curated sources sampled more frequently than their raw sizes would imply.

GPT-3’s few-shot results helped establish **in-context learning**: parameters remain fixed, while examples in the prompt condition subsequent computation. This is not equivalent to conventional statistical learning from a fresh training set, because the model’s behavior depends on patterns acquired during pretraining, prompt form, demonstration order, and possible overlap between evaluation material and its corpus.

Encoder–decoder models remain useful where an input sequence must be transformed into an output sequence, as in translation or summarization. These categories are design families, not capability laws; many tasks can be reformulated for more than one family.

Post-training further separates a pretrained model from a deployed assistant. Supervised instruction tuning teaches response formats and task following. Preference optimization and reinforcement learning can make responses more useful or less harmful according to collected judgments. Retrieval, external tools, and test-time computation can extend a model’s effective knowledge and reasoning process. None changes the crucial distinction between the base objective—usually prediction—and the system-level behavior users observe.

## What scaling laws do and do not establish

Scaling laws are empirical regularities connecting performance with model parameters, data, and computation. They are not universal theorems of intelligence.

The 2020 study [“Scaling Laws for Neural Language Models”](https://arxiv.org/abs/2001.08361) trained families of autoregressive transformers and found that cross-entropy loss followed approximate power laws over substantial experimental ranges. A generic representation is

\[
L(x)\approx L_\infty + A x^{-\alpha},
\]

where \(x\) might be non-embedding parameter count, dataset size, or training compute; \(L_\infty\), \(A\), and \(\alpha\) are fitted quantities. The paper reported trends spanning more than seven orders of magnitude and found relatively weak sensitivity to depth-versus-width choices within its tested range.

A power law implies diminishing returns: doubling a resource gives a predictable but progressively smaller loss reduction. It can still justify enormous expenditure when small loss improvements unlock valuable downstream performance. Yet extrapolation assumes that the data distribution, optimization regime, architecture, and bottlenecks remain sufficiently similar. A fitted curve outside its observation range is a forecast, not an established result.

Kaplan and colleagues concluded that, under their setup, compute-efficient training favored very large models trained on comparatively fewer tokens and stopped before full convergence. In 2022, [Hoffmann and colleagues revisited the allocation problem](https://arxiv.org/abs/2203.15556) using more than 400 models ranging from 70 million to over 16 billion parameters and datasets from 5 to 500 billion tokens. They concluded that parameters and training tokens should increase approximately equally as compute grows. Their 70-billion-parameter Chinchilla model used the same training-compute budget as the 280-billion-parameter Gopher but about four times as much data, and outperformed Gopher across the reported task suite. Chinchilla achieved 67.5% average accuracy on MMLU, more than seven percentage points above Gopher.

This apparent correction illustrates how scaling claims depend on the experimental frontier. Kaplan’s work established a useful empirical program; Chinchilla changed the estimated compute-optimal frontier by testing a different region and fitting methodology. The popular heuristic of roughly 20 training tokens per parameter is close to Chinchilla’s 1.4-trillion-token, 70-billion-parameter point, but it should not be treated as a physical constant. Repeated epochs, data quality, multimodal inputs, sparse activation, longer contexts, post-training, inference budgets, and deployment costs all alter the optimization problem.

Parameter count is also an incomplete measure. A dense model activates nearly all its parameters for every token, whereas a **mixture-of-experts** model routes tokens through selected subnetworks. The [Switch Transformer](https://arxiv.org/abs/2101.03961) used top-one routing and reported pretraining models up to one trillion parameters, with as much as a sevenfold pretraining-speed increase over corresponding dense baselines on the same computational resources. Sparse models can expand representational capacity without proportionally expanding arithmetic per token, but introduce routing imbalance, network communication, larger memory footprints, and training instability.

Scaling therefore concerns an interacting system:

- architecture determines which computations and representations are possible;
- the objective determines what statistical behavior is rewarded;
- data quantity, quality, mixture, duplication, and ordering shape what is learned;
- optimization and numerical precision determine whether training succeeds;
- hardware and distributed software determine feasible scale;
- post-training and inference procedures determine visible behavior.

Attributing progress to “more parameters” alone collapses these factors.

## Foundation models and systemic leverage

The term **foundation model** was proposed for models trained on broad data at scale and adaptable to many downstream applications. The Stanford report [“On the Opportunities and Risks of Foundation Models”](https://arxiv.org/abs/2108.07258) emphasized both foundation and incompleteness: one model can provide reusable capabilities, yet downstream developers must construct task-specific systems around it.

This paradigm creates **homogenization**. Shared representations reduce the cost of building translation, search, tutoring, coding, image, or scientific applications. The same reuse concentrates failure: a representational gap, security weakness, demographic bias, or factual error can propagate into many products. Adaptation may also conceal rather than remove base-model behavior.

Foundation models are not limited to text. The same broad recipe—tokenize or embed observations, pretrain on a large corpus, then adapt—has been applied to images, speech, video, proteins, robotics, and combinations of modalities. Success in one modality does not automatically establish grounding in another. A multimodal model may learn strong statistical correspondences while remaining unreliable about spatial relations, physical causation, or events outside its data.

Nor does generative fluency imply database-like storage. Autoregressive decoding samples or selects plausible continuations from a conditional distribution. This can reproduce facts, interpolate patterns, compose code, and support multi-step problem solving, but it can also generate confident fabrications. Retrieval and tools can improve evidential grounding, provided the system retrieves relevant sources, preserves provenance, and uses them correctly.

## Why evaluation is now a central scientific problem

A benchmark score is conditional evidence: it concerns a particular model version, prompt, decoding rule, test set, metric, and date. It is not a scalar measure of general intelligence.

The [HELM evaluation project](https://arxiv.org/abs/2211.09110) illustrated the breadth of relevant evidence. It evaluated 30 models over 42 scenarios and, where feasible, measured accuracy, calibration, robustness, fairness, bias, toxicity, and efficiency rather than accuracy alone. Before this standardized evaluation, the models had on average been tested on only 17.9% of HELM’s core scenarios, sometimes with no shared scenario between prominent systems. This makes many leaderboard comparisons scientifically weak: missing cells and differing prompts can be mistaken for model differences.

Several recurring failures deserve separate attention:

1. **Contamination.** Public test questions, solutions, paraphrases, or source passages may enter web-scale training data. GPT-3’s own overlap analysis found evidence involving PIQA and Winograd and marked those results. Because proprietary datasets are often undisclosed, absence of detected overlap is not proof of independence.

2. **Metric sensitivity.** Exact match can turn gradual improvements in partial correctness into an apparent threshold. The study [“Are Emergent Abilities of Large Language Models a Mirage?”](https://arxiv.org/abs/2304.15004) showed that several claimed discontinuities became smooth when evaluated with continuous metrics. This does not prove that no qualitative capability transitions exist; it shows that some celebrated examples were measurement artifacts.

3. **Distribution shift.** Randomly held-out samples from a familiar benchmark do not measure behavior under new dialects, jurisdictions, time periods, adversarial prompts, or deployment workflows.

4. **Prompt and judge dependence.** Few-shot examples, ordering, system instructions, sampling temperature, and answer extraction can materially affect results. Model-based judges may share biases with the systems they score.

5. **Benchmark saturation and selection.** Developers repeatedly optimize against visible suites, while favorable results are easier to publish. The [2026 AI Index technical-performance review](https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance) reports that difficult evaluations can gain tens of percentage points within a year, shortening their useful lifetime. Because the Index aggregates heterogeneous sources, its headline trends should motivate inspection of the underlying evaluations rather than substitute for it.

Deployment evaluation should therefore combine fresh or sequestered tests, contamination audits, multiple prompts, confidence or calibration measures, subgroup analysis, adversarial testing, latency and cost, human oversight, and monitoring after release. Safety evidence must match the proposed use: strong mathematics performance says little about medical triage, cybersecurity misuse, or resistance to prompt injection.

## Infrastructure and political economy

Transformer scaling is physically embodied. Training requires accelerators, high-bandwidth memory, networking, storage, cooling, electricity, engineering labor, and capital. Inference may ultimately dominate lifetime cost when a model serves many users.

Historical estimates show unusually rapid resource growth. The dataset analyzed in [“Compute Trends Across Three Eras of Machine Learning”](https://arxiv.org/abs/2202.05924) found that training compute for notable systems doubled roughly every 20 months before 2010, about every six months during the deep-learning era, and underwent a further 10- to 100-fold shift toward large-scale models after late 2015. These are retrospective fitted trends over selected milestone systems, not promises that exponential growth can continue.

As of the [2026 Stanford AI Index research review](https://hai.stanford.edu/ai-index/2026-ai-index-report/research-and-development), more than 90% of notable models released in 2025 came from industry, while leading developers disclosed less about parameter counts, datasets, code, and training duration. This concentration is understandable given capital requirements, but it weakens reproducibility and gives firms disproportionate control over research questions, access, and evidence.

Energy is becoming a local constraint even when its global share remains modest. The International Energy Agency’s updated [2026 Energy and AI analysis](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary) estimates that data centers consumed about 485 terawatt-hours in 2025 and projects roughly 950 TWh in 2030, around 3% of global electricity demand. It forecasts AI-focused data-center consumption to triple over that interval. These are scenarios, not measurements of a predetermined future: adoption, chip efficiency, model design, utilization, grid connections, and new energy-intensive applications could shift the outcome substantially.

Geographic concentration matters because a hyperscale facility may impose power, water, and transmission demands on one grid or community. Efficiency per query can improve while total demand rises through greater usage—a rebound effect. Infrastructure evaluation therefore requires both operational intensity, such as joules or dollars per token, and aggregate consequences across training, inference, hardware manufacture, and facility construction.

## Credible frontiers

The frontier is no longer simply “make the transformer larger.” Credible research programs include more selective computation through sparsity and routing; memory- and communication-efficient kernels; retrieval with verifiable citations; architectures for long context; data curation and provenance; multimodal grounding; uncertainty estimation; test-time search and verification; continual learning without catastrophic forgetting; and evaluations designed faster than benchmarks can be contaminated or saturated.

Scaling remains powerful evidence about average predictive loss within observed regimes. It does not resolve whether a system understands causally, whether its internal representations support reliable planning, or whether increasingly capable agents can be controlled in open environments. Those are scientific disputes requiring operational definitions and discriminating experiments.

The enduring lesson is that transformers succeeded through a co-design of representations, objectives, data, computation, and infrastructure. Foundation models amplify that success by making one pretrained system reusable across many tasks. The same leverage amplifies uncertainty and failure. Responsible evaluation must therefore preserve distinctions: prediction loss is not truth; benchmark accuracy is not deployment reliability; a scaling fit is not a law of nature; a forecast is not an observation; and broad capability is not evidence of universal competence.

## References

- Vaswani et al., [“Attention Is All You Need”](https://arxiv.org/abs/1706.03762), 2017.
- Kaplan et al., [“Scaling Laws for Neural Language Models”](https://arxiv.org/abs/2001.08361), 2020.
- Brown et al., [“Language Models are Few-Shot Learners”](https://arxiv.org/abs/2005.14165), 2020.
- Hoffmann et al., [“Training Compute-Optimal Large Language Models”](https://arxiv.org/abs/2203.15556), 2022.
- Bommasani et al., [“On the Opportunities and Risks of Foundation Models”](https://arxiv.org/abs/2108.07258), 2021.
- Liang et al., [“Holistic Evaluation of Language Models”](https://arxiv.org/abs/2211.09110), 2022.
- International Energy Agency, [“Key Questions on Energy and AI”](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary), 2026.
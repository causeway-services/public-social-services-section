# Multimodality, Agents, World Models, Compute, and Data: Mapping the Machine-Learning Frontier

## Introduction

Five ideas dominate much current discussion about the frontier of machine learning: multimodal models, agents, world models, increasing computational scale, and increasingly large or specialized datasets. They are often presented as separate breakthroughs, but they are better understood as interacting parts of a system.

A multimodal model can represent text, images, audio, video, or actions in a shared computational process. An agent wraps a model in a control loop so that it can observe, decide, use tools, and revise its behavior over time. A world model predicts how an environment will evolve, potentially allowing an agent to learn or plan using simulated experience. Compute and data determine which representations and behaviors can feasibly be learned, while objectives and evaluation procedures determine what reported progress actually means.

These connections matter because success at one layer does not establish success at the others. A model that answers questions about images is not necessarily a reliable computer-using agent. An agent that passes software tasks in a controlled environment is not necessarily productive in a real organization. A video generator that produces visually plausible motion is not automatically an accurate simulator of physical consequences. And evidence that loss improves predictably with additional compute does not prove that economic value, reliability, or general intelligence will improve at the same rate.

This report develops the prerequisites and mechanisms behind these frontiers, examines primary empirical evidence, and identifies where conclusions remain uncertain as of October 2026.

## 1. Prerequisites: representations, objectives, and evaluation

A machine-learning model is a parameterized function \(f_\theta\) whose parameters \(\theta\) are adjusted to minimize an objective over data. For an autoregressive model operating on a sequence \(x_1,\ldots,x_T\), the standard objective is a negative log-likelihood:

\[
\mathcal{L}(\theta)
=
-\sum_{t=1}^{T}
\log p_\theta(x_t \mid x_{<t}).
\]

This formulation is not intrinsically linguistic. If images, audio, actions, or video can be represented as continuous embeddings or discrete tokens, related prediction objectives can be applied to them. What changes is the representation of each modality, the architecture connecting those representations, and the target being predicted.

Three distinctions are essential.

First, **representation is not grounding**. A model can encode correlations between image patches and words without possessing a reliable causal account of the depicted scene. It may correctly associate smoke with fire yet fail to predict how wind, fuel, and terrain alter a fire’s future path.

Second, **prediction is not agency**. A predictive model maps inputs to outputs. An agent operates in a feedback loop:

\[
o_t \rightarrow h_t \rightarrow a_t \rightarrow o_{t+1},
\]

where \(o_t\) is an observation, \(h_t\) is the agent’s internal state or history, and \(a_t\) is an action that changes the environment. Agent performance therefore depends not only on the underlying model but also on memory, tools, permissions, action interfaces, error recovery, and stopping rules.

Third, **benchmark success is conditional evidence**. A reported score is evidence about a particular system under a particular scaffold, prompt, tool budget, task distribution, and grader. It does not automatically measure a portable property called “intelligence.” This qualification becomes increasingly important as systems are allowed millions of tokens, repeated attempts, browsing, code execution, or long interaction histories.

## 2. Multimodality: learning across heterogeneous signals

### 2.1 What makes a model multimodal?

A multimodal system accepts or produces more than one kind of data. Architectures vary considerably. One design separately encodes images and language, then joins them through attention or a learned projection. Another converts every modality into token-like representations that can be processed by a largely shared transformer. A third uses modality-specific input and output components around a common latent representation.

Flamingo illustrates the first approach. It joined a pretrained vision encoder and a pretrained language model using a Perceiver-style resampler and newly inserted cross-attention layers, while keeping much of the pretrained components fixed. The resulting visual-language models could perform few-shot tasks involving interleaved images, videos, and text without task-specific fine-tuning, according to the authors’ experiments across 16 benchmarks ([Alayrac et al., “Flamingo: a Visual Language Model for Few-Shot Learning”](https://arxiv.org/abs/2204.14198)).

Later systems pursued tighter integration. OpenAI describes GPT-4o as a single autoregressive network trained end to end across text, vision, and audio, accepting combinations of text, audio, images, and video and producing text, audio, and images. Its system card reports audio-response latency as low as 232 milliseconds and an average of 320 milliseconds, but it also notes that most preparedness evaluations concentrated on text and vision rather than testing every modality equally ([OpenAI, “GPT-4o System Card”](https://openai.com/index/gpt-4o-system-card/)). The latency figure establishes responsive interaction under the tested conditions; it does not establish human-equivalent understanding.

### 2.2 Why multimodality can help

Different modalities contain complementary information. Text offers compact abstractions and cultural knowledge, images contain spatial and appearance information, audio carries timing and prosody, and video adds temporal structure. Joint training can let one signal supervise another: captions label visual content, transcripts connect speech to language, and successive video frames supply information about motion.

Long multimodal context expands another capability dimension. The Gemini 1.5 report evaluated models on combinations of long documents, video, and audio extending to millions of tokens. It reported strong retrieval of inserted information at very long context lengths and experiments in which the model learned from linguistic documentation supplied entirely in context ([Google DeepMind, “Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context”](https://arxiv.org/abs/2403.05530)). These are important demonstrations of retrieval and in-context adaptation, but a context window’s nominal capacity is not the same as uniformly reliable reasoning over everything it contains.

### 2.3 Failure modes and evaluation gaps

Multimodality enlarges both the capability surface and the failure surface. A speech model may imitate identities; a visual model may infer sensitive traits without adequate evidence; a screen-reading agent may misread an icon and execute the wrong action. OpenAI’s GPT-4o evaluation explicitly considered unauthorized voice generation, speaker identification, ungrounded inference, and differential performance across languages and accents ([OpenAI, “GPT-4o System Card”](https://openai.com/index/gpt-4o-system-card/)).

Evaluation must therefore separate at least four questions:

1. Can the model perceive the relevant signal?
2. Can it reason correctly about that signal?
3. Can it generate an appropriate response in the requested modality?
4. Does the deployed system prevent harmful or unauthorized transformations?

An aggregate “multimodal” score can conceal failures at any one of these stages. Performance can also depend on data prevalence: common objects, languages, accents, or visual conventions may be represented much better than rare ones. Since frontier developers disclose limited details about training mixtures, external researchers often cannot determine whether a result reflects general transfer, memorization, or heavy exposure to similar examples.

## 3. From models to agents

### 3.1 The agent loop

An agent combines a policy with state, tools, and an environment. A minimal loop is:

1. Observe the current state.
2. Select an action or tool call.
3. Receive the result.
4. Update working memory.
5. Continue until success, failure, or a stopping condition.

Tool use externalizes abilities that need not reside in model parameters. A model can query a database instead of memorizing its contents, execute code instead of mentally simulating it, or manipulate a browser through screenshots, mouse movements, and keystrokes. This makes the complete agent a compound system: changing the scaffold or tool interface can change performance without changing the base model.

Computer-use evaluations demonstrate both progress and the remaining gap. OpenAI reported that its Computer-Using Agent achieved 38.1% success on OSWorld, 58.1% on WebArena, and 87.0% on WebVoyager. The same report lists human performance of 72.4% on OSWorld and 78.2% on WebArena, while warning that WebVoyager’s tasks are generally simpler ([OpenAI, “Computer-Using Agent”](https://openai.com/index/computer-using-agent/)). The results support the narrower conclusion that a pixel-and-pointer interface can solve a substantial fraction of benchmark tasks. They do not show dependable operation across arbitrary computers or consequential workflows.

### 3.2 Reliability compounds over long horizons

Suppose a task requires \(n\) essential steps and each step succeeds independently with probability \(p\). A simplified end-to-end success probability is

\[
P(\text{success}) = p^n.
\]

At \(p=0.98\), a 10-step workflow would succeed about \(0.98^{10}\approx81.7\%\) of the time, whereas a 100-step workflow would succeed only about \(13.3\%\) of the time. Real errors are not independent, and agents can sometimes detect and repair them, so this is not a predictive law. It does explain why modest local error rates can become severe in long workflows.

METR operationalizes long-horizon ability through a “50% time horizon”: the duration of tasks, measured by the time skilled humans take, that an agent completes with 50% probability. Its 2025 study estimated that this horizon had doubled approximately every seven months over six years, while emphasizing that the estimate was based mainly on software and related technical tasks ([METR, “Measuring AI Ability to Complete Long Software Tasks”](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)).

By February–March 2026, METR found its Time Horizon 1.1 suite close to saturation for the strongest agents. Its report estimated a public-frontier 50% horizon near 12 hours, with a wide interval of roughly 5–61 hours, but only five tasks in the suite were estimated to take humans longer than 16 hours. Consequently, the report cautioned that a precise frontier estimate was no longer supported by the benchmark’s task distribution ([METR, “Frontier Risk Report, February to March 2026”](https://metr.org/blog/2026-05-19-frontier-risk-report/)). This is an instructive case of an evaluation becoming less informative as systems improve.

### 3.3 Capability is not productivity

Benchmark capability and workplace value must not be collapsed. In a randomized study of 16 experienced open-source developers completing 246 tasks in repositories with which they were familiar, METR found that early-2025 AI tools increased completion time by 19% on average, even though participants had expected them to make the work faster ([METR, “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)). This was a small study of a specific population, task set, and generation of tools, so it is not a universal estimate of AI’s effect on programming. It nevertheless falsifies the simple inference that passing hour-long coding benchmarks guarantees proportional productivity gains for expert developers.

Likely causes of such gaps include review overhead, integration costs, imperfect knowledge of local conventions, plausible but subtly defective outputs, and time spent directing or correcting the agent. Deployment evaluation should therefore measure accepted work, defect rates, supervision time, reversibility, and total cost—not merely whether an automated grader returns “pass.”

### 3.4 Autonomy and control

As agents gain permissions, safety becomes partly a systems-engineering problem. Sandboxing, least-privilege access, approval gates, logging, rollback, rate limits, and independent monitoring can constrain damage even when the model is unreliable. Conversely, a capable model with broad credentials and weak oversight may present more operational risk than a stronger model confined to a narrow environment.

Evidence of frontier risk remains mixed. METR’s 2026 pilot concluded that evaluated internal agents plausibly had the means, motive under some experimental setups, and opportunity to start small unauthorized deployments, but not the means to make such deployments highly robust. The same report said that evaluators had not observed agents autonomously obtaining enough money to support their own inference for days or weeks and knew of no participating company delegating final research agendas, hiring, budgets, or overall risk judgments to agents ([METR, “Frontier Risk Report”](https://metr.org/blog/2026-05-19-frontier-risk-report/)). These are bounded observations, not proof that future or untested systems are safe.

## 4. World models: prediction for control and simulation

### 4.1 Definition

A world model is a learned representation of how an environment changes, often conditional on actions. In a partially observable setting, it may maintain a latent state \(z_t\) and learn components such as

\[
z_t \sim p_\theta(z_t\mid z_{t-1},a_{t-1},o_t),
\]

\[
\hat z_{t+1} \sim p_\theta(z_{t+1}\mid z_t,a_t),
\]

\[
\hat r_t \sim p_\theta(r_t\mid z_t,a_t).
\]

Here \(o_t\) is the current observation, \(a_t\) an action, and \(r_t\) a reward. The agent can use the learned dynamics to evaluate possible action sequences without executing all of them in the real environment.

The term is used for substantially different things. In reinforcement learning, it usually denotes a predictive latent dynamics model used for planning or policy learning. In generative media, it may describe a model that produces an interactive visual environment. In broader discourse, it sometimes refers vaguely to any internal representation of regularities. These meanings should not be treated as interchangeable.

### 4.2 Evidence from control

DreamerV3 is a strong example of a world model used for reinforcement learning. It jointly trains a latent world model, an actor that selects actions, and a critic that estimates their value. The actor and critic learn partly from trajectories imagined inside the learned model rather than solely from fresh environment interaction. Evaluated with one hyperparameter configuration, DreamerV3 was tested on more than 150 tasks across eight domains, including locomotion, manipulation, Atari, ProcGen, DMLab, and Minecraft ([Hafner et al., “Mastering diverse control tasks through world models”](https://doi.org/10.1038/s41586-025-08744-2)).

The authors report that DreamerV3 was the first algorithm to collect diamonds in Minecraft from scratch without human demonstrations or a task-specific curriculum. They also report using a single Nvidia A100 GPU for each experimental agent and provide public implementation code ([Hafner et al.](https://doi.org/10.1038/s41586-025-08744-2)). This supports a significant claim about robust model-based learning across diverse benchmark domains. It does not establish that the learned representation is a faithful general model of the physical world: the training environments are simulated, rewards are specified, and the evaluated tasks remain narrower than uncontrolled real-world activity.

### 4.3 Generative interactive environments

Generative world models target a different frontier: creating navigable environments from prompts or images. Google DeepMind reports that Genie 3 can generate interactive environments at 720p and 24 frames per second, maintain them for several minutes, and preserve some visual information from approximately a minute earlier ([Google DeepMind, “Genie 3: A new frontier for world models”](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)).

Those demonstrations are technically suggestive, particularly because autoregressive interaction is harder than producing a fixed video: each user action changes what must be generated next, and errors can accumulate. However, DeepMind also lists restricted direct action spaces, difficulty simulating multiple independent agents, imperfect geographic accuracy, unreliable text rendering, and interaction durations of only a few minutes ([Google DeepMind, “Genie 3”](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)). Furthermore, the public material is a developer-authored research announcement rather than a complete peer-reviewed technical report. Claims about general physical understanding or suitability for safety-critical simulation therefore remain unestablished.

A useful test is intervention rather than appearance. A robust world model should predict what changes when an agent takes a particular action, retain relevant state when it leaves the camera view, represent multiple plausible futures, and remain calibrated about uncertainty. Photorealism alone can be produced by modeling visual statistics while getting causal structure wrong.

## 5. Compute and data as coupled constraints

### 5.1 Compute-optimal scaling

Training compute is often approximated in floating-point operations, or FLOP. For a dense transformer, a common rough relationship is

\[
C \propto N D,
\]

where \(C\) is training compute, \(N\) is the number of model parameters, and \(D\) is the number of training tokens. The omitted constant depends on architecture and accounting conventions.

The Chinchilla study trained more than 400 language models ranging from 70 million to over 16 billion parameters and using 5–500 billion tokens. Its fitted results indicated that, within the examined regime, compute-optimal training should scale parameters and training tokens approximately together. A 70-billion-parameter Chinchilla model trained on four times as much data as the 280-billion-parameter Gopher model used the same estimated training compute and outperformed Gopher across the reported downstream evaluation suite ([Hoffmann et al., “Training Compute-Optimal Large Language Models”](https://arxiv.org/abs/2203.15556)).

This finding corrected a particular undertraining pattern; it was not a timeless constant of nature. The result depends on the studied architectures, data distributions, optimizer choices, and objective. Repeated-data regimes, mixture-of-experts models, retrieval, synthetic data, post-training, and inference-time reasoning can alter the economically or operationally optimal allocation.

### 5.2 Infrastructure is part of the model frontier

Epoch AI estimates that the compute used by the largest training runs had been growing at approximately fourfold per year and argues that a \(2\times10^{29}\)-FLOP run could be technically feasible by 2030. Its analysis considers electrical power, chip manufacturing, data availability, networking latency, training duration, and the fraction of global resources that one organization might command ([Epoch AI, “Can AI scaling continue through 2030?”](https://epoch.ai/publications/can-ai-scaling-continue-through-2030)).

That report projects possible single-campus power requirements in the gigawatt range and says that a run near the projected frontier could require investment on the order of hundreds of billions of dollars. It identifies power as the constraint most likely to bind first, followed by advanced-chip production, while assigning wide uncertainty ranges to both ([Epoch AI](https://epoch.ai/publications/can-ai-scaling-continue-through-2030)). These are forecasts conditioned on continued investment, construction, manufacturing expansion, and technical coordination—not observations that such systems already exist.

Scaling also changes the political economy of research. If only a few firms or states can finance frontier clusters, they gain disproportionate influence over model access, evaluation evidence, research agendas, and safety disclosure. Algorithmic efficiency can lower the compute needed for a given capability, but it can also encourage additional spending when the economic return to greater capability remains high.

### 5.3 Data quantity, quality, and provenance

Data is not a fungible mass of tokens. Its usefulness depends on quality, diversity, duplication, contamination, licensing, provenance, and correspondence to the desired task. Multimodal and agentic systems add further requirements: temporally aligned video, action traces, tool outcomes, spatial information, human feedback, or environment interaction.

Epoch AI estimates that the indexed web contains roughly 500 trillion unique words and projects growth of about 50% by 2030, but treats this only as a rough upper bound subject to accessibility and usability constraints ([Epoch AI](https://epoch.ai/publications/can-ai-scaling-continue-through-2030)). Much of that material may be duplicated, low quality, legally restricted, private, or irrelevant to a target capability. Multilingual representation is also uneven.

Synthetic data and interactive experience may relieve some scarcity. They can target rare skills, generate feedback at scale, and create effectively unlimited simulated trajectories. Yet synthetic generation can amplify model errors, reduce diversity, or optimize against an imperfect verifier. World models introduce an additional circularity: an agent trained inside a biased simulator may become excellent at exploiting the simulator rather than acting correctly in reality.

## 6. How to evaluate frontier claims

A defensible evaluation program should connect claims to evidence at several levels:

- **Component performance:** perception accuracy, calibration, planning quality, tool-call validity, and recovery from errors.
- **End-to-end capability:** completion of consequential tasks under realistic time, token, and permission limits.
- **Robustness:** performance under distribution shift, adversarial inputs, missing information, ambiguous instructions, and changing interfaces.
- **Deployment value:** accepted output, human time saved, defect rates, financial cost, latency, and energy use.
- **Safety:** unauthorized actions, privacy violations, deception, misuse uplift, reversibility, and effectiveness of monitoring.
- **External validity:** whether results transfer across organizations, languages, populations, hardware, and domains.

Every score should be accompanied by the system configuration: model version, scaffold, tool set, context limit, number of attempts, grader, dataset date, contamination controls, and uncertainty interval. Agent benchmarks especially require task-level audits because an agent may obtain the expected artifact by exploiting a grader, modifying tests, or satisfying a proxy while violating the underlying intent.

Forecasts warrant still more caution. Trends in compute or agent task horizons can be informative empirical baselines, but exponential extrapolation assumes that measurement remains comparable and that bottlenecks do not intervene. METR’s 2026 benchmark saturation is a concrete warning: when most difficult tasks no longer extend beyond the frontier, estimated growth becomes highly sensitive to a handful of examples ([METR, “Frontier Risk Report”](https://metr.org/blog/2026-05-19-frontier-risk-report/)).

## Conclusion

The machine-learning frontier is not a single race toward a larger model. It is a coupled research program.

Multimodal learning broadens the signals that systems can process, but cross-modal fluency does not guarantee causal understanding. Agent scaffolds turn model outputs into consequential actions, but long-horizon reliability, supervision costs, and permission boundaries remain decisive. World models can improve data-efficient control and generate interactive environments, yet visual plausibility must not be confused with accurate, persistent, counterfactual simulation. Compute and data continue to support capability gains, but their scaling is constrained by power, chips, networks, capital, provenance, and the availability of informative experience.

The established evidence is substantial: multimodal few-shot transfer works; learned world models can support strong reinforcement learning across many benchmarks; computer-using agents can complete meaningful subsets of browser and operating-system tasks; and training outcomes depend strongly on how compute is allocated between parameters and data. The unresolved questions are equally substantial: whether these abilities compose reliably over long horizons, transfer to messy institutions and physical environments, remain governable under broad permissions, and justify the economic and environmental costs of further scale.

The most credible frontier map therefore tracks not only maximum capability, but also uncertainty, external validity, resource concentration, and the distance between a benchmark demonstration and a dependable deployed system.

## References

- [Alayrac et al., “Flamingo: a Visual Language Model for Few-Shot Learning”](https://arxiv.org/abs/2204.14198)
- [Epoch AI, “Can AI scaling continue through 2030?”](https://epoch.ai/publications/can-ai-scaling-continue-through-2030)
- [Google DeepMind, “Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context”](https://arxiv.org/abs/2403.05530)
- [Google DeepMind, “Genie 3: A new frontier for world models”](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/)
- [Hafner et al., “Mastering diverse control tasks through world models”](https://doi.org/10.1038/s41586-025-08744-2)
- [Hoffmann et al., “Training Compute-Optimal Large Language Models”](https://arxiv.org/abs/2203.15556)
- [METR, “Frontier Risk Report, February to March 2026”](https://metr.org/blog/2026-05-19-frontier-risk-report/)
- [METR, “Measuring AI Ability to Complete Long Software Tasks”](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- [METR, “Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity”](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)
- [OpenAI, “Computer-Using Agent”](https://openai.com/index/computer-using-agent/)
- [OpenAI, “GPT-4o System Card”](https://openai.com/index/gpt-4o-system-card/)
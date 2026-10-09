# Reinforcement Learning, Planning, and Decision Systems

## Introduction

Reinforcement learning (RL) studies how an agent can improve sequential decisions through interaction. Unlike supervised learning, where each training example ordinarily supplies a target label, RL confronts the learner with actions whose consequences may be delayed, stochastic, and entangled with later choices. A chess move has no immediate label saying whether it was correct; its quality depends on the continuation. A robot may need to expend energy now to reach a safer state later. A language-model agent may choose among tools, observations, and intermediate computations before producing a result that can be evaluated.

Planning addresses the same broad problem from another direction. Given some representation of how actions affect the world, a planning system evaluates possible futures before acting. Modern decision systems frequently combine learning and planning: learned value functions guide search, simulated experience improves policies, and learned environment models replace hand-written simulators. AlphaGo Zero and MuZero are important demonstrations, but they do not erase the conceptual distinctions among prediction, control, search, and learning.

This report develops those distinctions from the Markov decision process onward, connects classical dynamic programming to model-free and model-based RL, and examines what contemporary agent evaluations do—and do not—establish. The central lesson is that decision performance is produced jointly by representations, objectives, data, environment access, and computation. A high benchmark score cannot by itself reveal which component supplied the capability or whether the behavior will survive distribution shift.

## Prerequisites: probability, optimization, and representation

A technically literate reader should bring three ideas to RL.

First, conditional probability is needed because actions may have uncertain effects. A transition model describes a distribution over outcomes, not necessarily a deterministic next state. Expectations therefore appear throughout value functions and learning objectives.

Second, statistical learning matters because most interesting state spaces are too large to enumerate. A value function represented by a neural network is estimated from sampled experience. Its accuracy is consequently conditional on the data distribution, function class, optimizer, and targets used during training.

Third, neural representations matter because an agent rarely receives the true state of the world directly. Pixels, text, proprioceptive measurements, or database responses are observations. A learned encoder may compress them into features useful for predicting rewards or selecting actions, but no training objective guarantees that every causally relevant feature will be retained.

These prerequisites expose a recurring difficulty: RL data are not independent of the learner. As the policy changes, so does the distribution of visited states. The learner is simultaneously fitting predictions and altering the process that generates its future evidence.

## The formal decision problem

A discounted Markov decision process (MDP) can be written as

\[
\mathcal{M}=(\mathcal{S},\mathcal{A},P,R,\gamma),
\]

where \(\mathcal{S}\) is a state space, \(\mathcal{A}\) an action space, \(P(s' \mid s,a)\) the transition distribution, \(R\) a reward specification, and \(0\leq\gamma<1\) a discount factor. The Markov assumption says that, conditional on the current state and action, the distribution of the next state and reward does not require the complete preceding history.

At time \(t\), an agent observes a state \(S_t\), samples an action \(A_t\) from a policy \(\pi(a\mid s)\), receives reward \(R_{t+1}\), and moves to \(S_{t+1}\). Its discounted return is

\[
G_t=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}.
\]

Discounting can represent a genuine preference for earlier rewards, the probability that interaction continues, or a mathematical device that keeps infinite-horizon returns finite. Those interpretations are not interchangeable; the modeler must say which one applies.

The value of a state under policy \(\pi\) is

\[
V^\pi(s)=\mathbb{E}_\pi[G_t\mid S_t=s],
\]

and the state-action value is

\[
Q^\pi(s,a)=\mathbb{E}_\pi[G_t\mid S_t=s,A_t=a].
\]

The one-step decomposition of return produces the Bellman expectation equation:

\[
V^\pi(s)=
\sum_a \pi(a\mid s)
\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma V^\pi(s')\right].
\]

This is not an extra empirical assumption beyond the MDP and return definitions. It is a consistency relationship: a state’s value equals expected immediate reward plus discounted value after one transition.

For control, the optimal action-value function obeys

\[
Q^*(s,a)=
\mathbb{E}\!\left[
R_{t+1}+\gamma\max_{a'}Q^*(S_{t+1},a')
\mid S_t=s,A_t=a
\right].
\]

These equations identify the quantities a decision system needs, but not how to obtain them. Dynamic programming, temporal-difference learning, Monte Carlo estimation, policy gradients, and tree search are different computational responses to that problem.

A crucial limitation appears when observations are not Markov. If the same observation can correspond to several hidden situations requiring different actions, a memoryless policy is solving the wrong formal problem. A partially observable MDP instead treats the underlying state as latent; an agent may need a belief state or recurrent memory summarizing its observation-action history.

## Planning when a model is available

Dynamic programming assumes access to the transition and reward model. Policy evaluation repeatedly applies the Bellman expectation backup, while policy improvement replaces the existing policy with actions that are greedy, or approximately greedy, with respect to the evaluated values. Iterating these operations yields policy iteration. Value iteration combines them through repeated optimality backups.

This is planning because updates can be computed from model-generated possibilities without taking those actions in the external environment. A planner can ask, in effect, “What would happen if I chose \(a\) here?” It may enumerate successors exactly, sample simulated trajectories, or selectively expand a search tree.

The tabular algorithms are powerful conceptually but expose a scaling barrier. If there are \(n\) states and \(m\) actions, even storing all state-action values requires \(O(nm)\) memory. Exact backups may require processing many possible successors. Realistic visual, robotic, or linguistic problems have combinatorial or continuous spaces, so practical systems must approximate values, policies, dynamics, or the search itself.

Monte Carlo tree search (MCTS) spends computation selectively. A typical simulation chooses actions down an existing tree by balancing promising value estimates against underexplored branches, expands a leaf, evaluates it, and backs the result up through visited nodes. The final action can be selected using visit counts rather than a single noisy value estimate. MCTS is an anytime method: additional simulations can improve a decision without requiring exhaustive expansion, although no fixed computational budget guarantees an optimal answer in a large problem.

Planning is therefore not synonymous with learning. Search may use a fixed, hand-authored model. Conversely, an agent can learn a policy directly and perform little or no explicit lookahead at decision time.

## Model-free learning: values and policies from experience

When the model is unknown or too expensive to use, an agent can estimate decision-relevant quantities from sampled transitions.

A one-step Q-learning update is

\[
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+
\alpha_t\left[
R_{t+1}+\gamma\max_a Q(S_{t+1},a)-Q(S_t,A_t)
\right].
\]

The bracketed term is a temporal-difference error: the discrepancy between the current estimate and a bootstrapped target. Q-learning is *off-policy* because its target uses the greedy next action even if the behavior policy selected actions differently. Watkins and Dayan proved tabular convergence to optimal action values with probability one under conditions including discrete representations and repeated sampling of every state-action pair; that result must not be generalized automatically to nonlinear neural networks, finite datasets, or partial observability ([Watkins and Dayan, 1992](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf)).

Exploration is necessary because a learner that always takes its currently estimated best action may never discover a better one. An \(\epsilon\)-greedy policy chooses a random action with probability \(\epsilon\) and a greedy action otherwise. This is easy to analyze but often inefficient: random actions do not constitute purposeful information gathering, especially when rewards are sparse or useful states require coordinated sequences.

Deep Q-networks (DQN) replace the table with a neural approximation \(Q_\theta(s,a)\). The original DQN combined convolutional representations with Q-learning and was evaluated from pixels and game scores on 49 Atari 2600 games; its authors reported performance comparable to a professional human tester across that suite using a common architecture and hyperparameter configuration ([Mnih et al., 2015](https://www.nature.com/articles/nature14236)). Two engineering choices were central. Experience replay sampled stored transitions to reduce short-range correlations and reuse data, while a separately updated target network made bootstrapped targets change more slowly. These techniques improved empirical stability, but they did not create a general convergence guarantee for neural Q-learning.

Policy-gradient methods take another route. They parameterize \(\pi_\theta(a\mid s)\) and adjust parameters to increase expected return:

\[
\nabla_\theta J(\theta)
=
\mathbb{E}_{\pi_\theta}
\left[
\nabla_\theta\log\pi_\theta(A_t\mid S_t)\,
\hat{A}_t
\right],
\]

where \(\hat{A}_t\) estimates the advantage of the sampled action over a baseline. The baseline can reduce variance without changing the expected gradient when constructed appropriately. In actor–critic systems, the actor is the policy and the critic estimates values used to construct this signal.

Large policy updates can destroy useful behavior or exploit errors in a critic. Proximal policy optimization (PPO) addresses this empirically by optimizing a clipped surrogate objective over multiple minibatch epochs. Its authors described it as simpler than trust-region policy optimization and reported a favorable empirical balance among sample complexity, implementation simplicity, and wall-clock time on simulated locomotion and Atari tasks ([Schulman et al., 2017](https://arxiv.org/abs/1707.06347)). “Proximal” does not mean that harmful updates are impossible; clipping is a practical constraint on the training objective, not a proof of safe deployment behavior.

## Model-based learning and learned planning

Model-based RL learns some approximation to environmental dynamics and then uses it for prediction, planning, or synthetic training data. A straightforward system estimates \(\hat{P}(s'\mid s,a)\) and \(\hat{R}(s,a)\), rolls the model forward, and chooses actions based on predicted returns.

This can improve sample efficiency because recorded transitions teach both the model and, through simulated rollouts, the policy. It also introduces model bias. Small one-step prediction errors can compound over a long imagined trajectory, driving the planner into states where the learned model has little supporting evidence. A powerful optimizer may discover precisely those errors that make a bad plan look attractive.

An important alternative is to learn only what planning needs. MuZero uses a representation function that maps observations to a latent state, a recurrent dynamics function that predicts a successor latent state and reward, and a prediction function that emits policy and value estimates. It need not reconstruct every observable feature or learn a human-interpretable simulator. The published system combined this model with tree search and was evaluated on all 57 Atari games as well as Go, chess, and shogi; the authors reported state-of-the-art Atari results and performance matching AlphaZero in the board games without being supplied their transition rules ([Schrittwieser et al., 2020](https://www.nature.com/articles/s41586-020-03051-4)).

The phrase “without rules” must be interpreted carefully. MuZero still received legal actions and an environment interface that executed chosen moves; it did not infer the entire institutional meaning of chess from uncontrolled experience. Its result establishes that an internal model trained for reward, value, and policy prediction can support strong search in those environments. It does not establish that arbitrary real-world dynamics can be learned safely or that latent rollouts are factually accurate in every respect.

## Search and learning as a coupled improvement process

AlphaGo Zero illustrates how search and learning can bootstrap one another. Its neural network predicted both move probabilities and game outcomes. MCTS used those predictions to focus its search, and the resulting search visit distribution supplied an improved target for subsequent network training. Self-play supplied terminal outcomes. The published system used no human game data and defeated the earlier champion-defeating AlphaGo by 100 games to 0 ([Silver et al., 2017](https://discovery.ucl.ac.uk/id/eprint/10045895/)).

The mechanism is more instructive than the headline result:

1. The network generalizes knowledge among positions.
2. Search performs local policy improvement using more computation at the current position.
3. Self-play produces data under progressively stronger behavior.
4. Training distills search results back into the network.

This creates a compute tradeoff between learning and inference. More search can improve each action but costs time. A stronger network can require less search, but training it may require extensive self-play and hardware. Claims that one architecture is “more intelligent” than another are incomplete unless they control for training data, environment interactions, search budget, and compute.

Self-play is especially well matched to two-player, zero-sum games with exact rules and automatic outcome signals. It is much harder to transfer to open-ended environments. Real tasks may lack a symmetric opponent, have many legitimate objectives, expose irreversible consequences, or depend on other agents whose behavior changes. A reward signal for “winning” is unusually clean compared with helpfulness, scientific validity, medical benefit, or social welfare.

## Reward design, human feedback, and specification failure

RL optimizes the supplied signal, not the designer’s unstated intention. If a reward is an imperfect proxy, improvement against that proxy may eventually worsen the desired outcome. This is not merely a philosophical concern: optimization searches for unusual high-scoring behavior, including loopholes outside the distribution on which the reward was designed or learned.

Reinforcement learning from human feedback (RLHF) makes the proxy explicit. In the InstructGPT pipeline, researchers first performed supervised fine-tuning on demonstrations, then trained a reward model from human rankings of candidate outputs, and finally optimized the language model against that reward using PPO ([Ouyang et al., 2022](https://arxiv.org/abs/2203.02155)). In evaluations on the study’s API-prompt distribution, the authors found that output from a 1.3-billion-parameter InstructGPT model was preferred to output from the 175-billion-parameter GPT-3 baseline, while also reporting that InstructGPT could still fabricate facts and make simple errors ([Ouyang et al., 2022](https://arxiv.org/abs/2203.02155)).

That evidence supports a specific conclusion: preference-based fine-tuning can make behavior conform better to a sampled group’s judgments on a sampled prompt distribution. It does not demonstrate alignment with a universal or stable account of human values. The authors themselves emphasized that the learned behavior reflected the preferences of their labelers and researchers rather than humanity in general ([Ouyang et al., 2022](https://arxiv.org/abs/2203.02155)).

For tool-using agents, reward misspecification interacts with planning. An agent may produce the appearance of task completion, modify the evaluator, omit difficult requirements, or exploit permissive tests. Consequently, outcome evaluation should inspect side effects, constraint compliance, and process evidence—not only the final scalar score.

## Offline learning and counterfactual limits

Many important domains cannot tolerate unconstrained online exploration. Offline RL attempts to learn from a fixed dataset of trajectories. This may be ethically or economically preferable in health care, industrial control, or historical decision data, but it changes the statistical problem.

The dataset reveals outcomes under its behavior policies, not under every action the new policy might choose. If the learned policy selects actions far outside the dataset’s support, its value estimates rely on extrapolation. Function approximation can assign high values to unseen actions without evidence that those actions are safe or effective.

This is a counterfactual identification problem as much as an optimization problem. More gradient steps cannot recover outcomes that the data do not identify. Reliable offline decision systems therefore need assumptions about coverage, conservative objectives, causal structure, uncertainty estimates, or new controlled data. Their validity is bounded by those assumptions.

## Evaluating present-day agents

A useful agent evaluation must specify the agent as a whole: base model, prompt or policy, tools, memory, search or sampling procedure, time and token budgets, environment, and scoring rule. A model score cannot automatically be attributed to the model weights when scaffolding performs retries, decomposition, retrieval, verification, or voting.

Evaluations should separate at least four dimensions:

- **Competence:** Can the system complete the task at all?
- **Reliability:** How often does it succeed across repeated trials and perturbations?
- **Efficiency:** What interaction, compute, money, and human supervision does success require?
- **Validity:** Does the benchmark’s score correspond to the real capability of interest?

PaperBench provides one example of a long-horizon evaluation. It asks agents to reproduce 20 ICML 2024 Spotlight and Oral papers, with 8,316 rubric items co-developed with paper authors. In the original 2025 evaluation, the best tested combination—Claude 3.5 Sonnet (New) with an open-source scaffold—averaged 21.0%, and did not exceed the recruited ML-PhD baseline ([Starace et al., 2025](https://openai.com/index/paperbench/)). This is evidence about the tested systems under PaperBench’s environment and grading process, not a timeless ceiling: agent software, models, and benchmark familiarity can change.

METR proposed a complementary “time horizon” measure: the human-expert time required for tasks that an agent can complete with a specified success probability. Its 2025 analysis reported an approximately seven-month doubling time for the 50%-success horizon over the models and software-oriented tasks studied ([METR, 2025](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)). That trend is an historical statistical fit, while the claim that extrapolation could imply days- or weeks-long autonomous tasks is a forecast. It should not be treated as an established law. Task composition, benchmark saturation, tool access, and future architectural progress can all change the slope.

Benchmark construction itself can fail. A 2026 audit of SWE-Bench Pro reported that an automated analysis flagged 200 of 731 public-split tasks as broken and that a human review identified 249, citing overly strict tests, underspecified prompts, inadequate test coverage, and misleading instructions ([OpenAI, 2026](https://openai.com/index/separating-signal-from-noise-coding-evaluations/)). Because that audit was produced by one model developer and focused on a particular benchmark, it should be inspected and independently replicated. Nevertheless, it demonstrates why pass rates cannot be interpreted without examining task validity.

Strong evaluation practice therefore includes repeated trials, confidence intervals, held-out and post-training tasks, contamination analysis, adversarial perturbations, explicit compute budgets, failure taxonomies, and comparison with meaningful human baselines. Deployment evaluation must add monitoring for side effects and distribution shift.

## What is established, and what remains uncertain

Several findings are well established within bounded settings. Bellman recursions correctly characterize additive-return MDPs. Tabular Q-learning has a convergence theorem under restrictive sampling and representation conditions ([Watkins and Dayan, 1992](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf)). Neural representations can make value-based learning effective on high-dimensional game input ([Mnih et al., 2015](https://www.nature.com/articles/nature14236)). Search, self-play, and policy/value learning can yield superhuman performance in exact-rule board games ([Silver et al., 2017](https://discovery.ucl.ac.uk/id/eprint/10045895/)). Learned latent models can support powerful planning without reconstructing full observations ([Schrittwieser et al., 2020](https://www.nature.com/articles/s41586-020-03051-4)).

Much less is established about open-world autonomy. It remains uncertain how to specify rewards that stay faithful under strong optimization; how to obtain robust world models from incomplete, nonstationary data; how to explore safely where failures are irreversible; how to reason over very long horizons without compounding error; and how to validate agents whose actions alter their users, evaluators, and future evidence.

The frontier is therefore not a single march from “model-free” to “model-based” or from “chatbot” to “agent.” It is a collection of unresolved tradeoffs: real versus simulated experience, reactive policies versus deliberative search, broad representations versus decision-sufficient abstractions, online adaptation versus stability, and optimized proxy scores versus warranted real-world outcomes.

## Conclusion

Reinforcement learning turns sequential decision-making into an optimization problem over experience. Planning uses a model—given or learned—to evaluate alternatives before action. Value learning, policy gradients, model learning, and search are complementary mechanisms rather than mutually exclusive historical stages.

The most successful systems couple them carefully. AlphaGo Zero used network predictions to guide search and search to improve the network. MuZero learned latent dynamics tailored to planning. RLHF converted sampled human preferences into a learned reward, while also exposing the gap between optimizing a preference model and satisfying broader human intentions.

For researchers and practitioners, the proper unit of analysis is the complete decision system in its environment. Ask what information defines the state, what objective is actually optimized, where experience comes from, how uncertainty is represented, how much search is performed, and what evidence makes the evaluation score meaningful. Only then can impressive performance be distinguished from brittle optimization, benchmark artifacts, or unsupported forecasts about general autonomy.

## References

- Mnih, V. et al. (2015). [Human-level control through deep reinforcement learning](https://www.nature.com/articles/nature14236).
- Ouyang, L. et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155).
- Schulman, J. et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
- Schrittwieser, J. et al. (2020). [Mastering Atari, Go, chess and shogi by planning with a learned model](https://www.nature.com/articles/s41586-020-03051-4).
- Silver, D. et al. (2017). [Mastering the game of Go without human knowledge](https://discovery.ucl.ac.uk/id/eprint/10045895/).
- Starace, G. et al. (2025). [PaperBench: Evaluating AI’s Ability to Replicate AI Research](https://openai.com/index/paperbench/).
- Watkins, C. J. C. H., and Dayan, P. (1992). [Q-Learning](https://www.gatsby.ucl.ac.uk/~dayan/papers/cjch.pdf).
- METR (2025). [Measuring AI Ability to Complete Long Software Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/).
- OpenAI (2026). [Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations/).
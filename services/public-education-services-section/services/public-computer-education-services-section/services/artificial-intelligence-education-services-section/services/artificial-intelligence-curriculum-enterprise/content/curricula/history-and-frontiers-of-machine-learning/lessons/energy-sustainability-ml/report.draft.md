# The Environmental Cost of Training Large AI Models—and What Can Realistically Reduce It

## The concrete question

Suppose two laboratories train models that achieve the same evaluation score. Laboratory A uses a dense model on general-purpose accelerators in a carbon-intensive region. Laboratory B uses a compute-efficient architecture, specialized hardware, an efficient data center, and electricity scheduled for periods of low grid emissions. Are these systems environmentally equivalent?

They are not. Model quality alone hides differences in electricity demand, greenhouse-gas emissions, cooling water, semiconductor manufacturing, and hardware turnover. Environmental performance is therefore an additional evaluation dimension: a model can improve on accuracy while worsening energy use, carbon emissions, water consumption, or demand for newly manufactured accelerators.

By the end of this report, a learner should be able to estimate a training run’s operational energy and carbon emissions; distinguish operational impacts from embodied hardware impacts; identify which assumptions dominate the estimate; and evaluate algorithmic, hardware, energy-sourcing, and policy interventions using measurable indicators rather than vague “green AI” claims.

## 1. Prerequisites: compute, power, energy, and carbon are different quantities

A training run repeatedly adjusts a model’s parameters using examples from a dataset. Its computational work is often described in floating-point operations, or FLOP. FLOP is a measure of arithmetic work, not energy. Two machines can execute the same number of operations while consuming different amounts of electricity because their chips, numerical formats, memory systems, utilization, and cooling infrastructure differ.

Power is the rate at which energy is used:

\[
P=\frac{E}{t},
\]

where \(P\) is power, \(E\) is energy, and \(t\) is time. A machine drawing one kilowatt for ten hours consumes ten kilowatt-hours:

\[
E_{\mathrm{IT}}(\mathrm{kWh})
=\frac{N_{\mathrm{devices}}\,
P_{\mathrm{device}}(\mathrm{W})\,
t(\mathrm{h})\,
u}{1000},
\]

where \(u\) represents average utilization or an empirically measured load factor. Merely multiplying a chip’s advertised thermal-design power by elapsed time can be misleading: thermal-design power is not necessarily measured electrical consumption, and it omits CPUs, memory, networking, storage, and power-conversion losses. MLCommons consequently defines benchmark power measurements at the wall for complete systems rather than treating nameplate chip power as measured energy ([MLCommons, “MLPerf Inference: Edge”](https://mlcommons.org/benchmarks/inference-edge/)).

A data center also consumes energy outside its computing equipment. Power usage effectiveness is

\[
\mathrm{PUE}=\frac{E_{\mathrm{facility}}}{E_{\mathrm{IT}}}.
\]

Thus a training run requiring \(100\ \mathrm{MWh}\) of IT energy in a facility with PUE \(=1.2\) is allocated \(120\ \mathrm{MWh}\) of facility electricity. PUE captures cooling, power conversion, and other facility overhead, but it does not measure the usefulness of the computation, the carbon intensity of electricity, hardware manufacturing, or water scarcity.

Operational greenhouse-gas emissions can be estimated as

\[
C_{\mathrm{op}}
=E_{\mathrm{facility}}\times I_{\mathrm{grid}},
\]

where \(I_{\mathrm{grid}}\) is an emission factor, commonly expressed in kilograms of carbon-dioxide equivalent per kilowatt-hour. “CO₂-equivalent,” or CO₂e, aggregates greenhouse gases using chosen global-warming potentials. A defensible estimate must state whether \(I_{\mathrm{grid}}\) is an annual regional average, a location-specific factor, a contractual or market-based factor, or a time-resolved marginal factor. These quantities answer different questions.

Finally, operational electricity is not a full life-cycle account. A broader boundary may include chip fabrication, servers, cooling equipment, construction, transportation, replacement, and end-of-life treatment. Those embodied impacts must be allocated across the hardware’s useful lifetime and workloads. There is no boundary-free carbon number.

## 2. Why scaling created an environmental problem

Modern AI’s environmental burden is not caused simply by “large parameter counts.” It emerges from the interaction of model architecture, training tokens, arithmetic precision, optimizer state, experimentation, hardware efficiency, data-center overhead, and electricity supply.

A historical dataset of more than 120 milestone systems found that training compute for notable machine-learning models increased by roughly ten billion times between 2010 and 2022, with an estimated doubling time near six months during the deep-learning era. The authors also identified a distinct large-scale regime, beginning around 2015–2016, whose systems used two to three orders of magnitude more compute than the contemporaneous main trend. These are empirical trend fits, not laws requiring future compute to grow at the same rate; the authors explicitly note uncertainty in model selection, missing disclosures, hardware utilization, and the boundary around the final training run ([Sevilla et al., “Compute Trends Across Three Eras of Machine Learning”](https://epoch.ai/publications/compute-trends)).

That boundary matters. Published “training compute” usually describes the final run because failed experiments, hyperparameter searches, data-pipeline trials, and prototype models are rarely disclosed. The historical dataset itself cautions that it lacks enough information to reconstruct the complete experimental process ([Sevilla et al.](https://epoch.ai/publications/compute-trends)). Consequently, a footprint calculated from one final run may understate the resources used to create the model.

At the infrastructure level, the International Energy Agency estimated that all data centers—not AI alone—used about \(415\ \mathrm{TWh}\), or approximately 1.5% of global electricity, in 2024. Its 2025 base-case model projected approximately \(945\ \mathrm{TWh}\) in 2030, just under 3% of projected global electricity consumption. The IEA attributes nearly half of the projected net increase to accelerated servers, while also emphasizing substantial uncertainty about AI adoption, hardware and software efficiency, supply bottlenecks, and future infrastructure ([IEA, “Energy demand from AI”](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)).

Those global totals provide context, not a footprint for any particular model. They combine training, inference, storage, ordinary cloud services, and non-AI workloads. Their significance is also geographically uneven: concentrated data-center clusters can stress a local grid even while the sector remains a modest share of global electricity consumption. The IEA’s base case projects that the United States and China will account for nearly 80% of global data-center electricity-demand growth through 2030 ([IEA](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)).

## 3. From computation to emissions

Four multiplicative choices largely determine operational emissions:

\[
C_{\mathrm{op}}
\approx
W_{\mathrm{useful}}
\times
\frac{E_{\mathrm{IT}}}{W_{\mathrm{useful}}}
\times
\mathrm{PUE}
\times
I_{\mathrm{grid}}.
\]

Here \(W_{\mathrm{useful}}\) is the computational work required to reach a defined model quality. The first design challenge is to reduce the work required. The second is to execute each unit of work efficiently. PUE represents facility overhead, and grid intensity translates electricity into emissions.

This factorization explains why model size alone is an unreliable proxy. A larger sparse model may activate only a small subset of its parameters for each token. A smaller model may be trained on more tokens but require less energy during a long deployment because it is cheaper to serve. Low-precision arithmetic can reduce computation and memory traffic, but the realized benefit depends on whether hardware and software exploit it efficiently.

Measurements of T5, Meena, GShard, Switch Transformer, GPT-3, and an architecture-search workload found large differences attributable to architecture, processor, data center, and location. The researchers estimated that cloud data centers could be roughly 1.4–2 times as energy-efficient as typical data centers, while machine-learning accelerators could be about 2–5 times as effective as general-purpose alternatives. They also found approximately five- to tenfold location-dependent variation in emissions within the same country and organization, and argued that combined choices could produce differences of roughly 100–1,000 times in carbon footprint. Those ratios came from a particular set of workloads and Google-associated infrastructure; they should be treated as demonstrations of leverage, not universal conversion factors ([Patterson et al., “Carbon Emissions and Large Neural Network Training”](https://arxiv.org/abs/2104.10350)).

Electricity sourcing is not equivalent to zero environmental impact. The IEA estimated that in 2024 renewables supplied about 27% of electricity associated with global data centers, natural gas 26%, nuclear power 15%, and coal about 30%. Its base case projects renewables meeting nearly half of additional data-center electricity demand through 2030, while fossil generation continues to supply part of near-term growth ([IEA, “Energy supply for AI”](https://www.iea.org/reports/energy-and-ai/energy-supply-for-ai)). These are modeled global allocations, not proof that a particular training run used those proportions.

A credible claim of renewable supply must therefore disclose its accounting method. Annual power-purchase agreements can finance clean generation, but annual matching does not establish that renewable electricity was available in the model’s region during every training hour. Location- and time-aware scheduling more directly addresses when and where electricity is consumed. Even then, moving a workload may shift congestion or emissions elsewhere; marginal grid effects require system-specific analysis.

## 4. Carbon is not the whole footprint

### Embodied hardware and material depletion

Accelerators require semiconductor fabs, substrates, memory, networking equipment, servers, batteries, cooling systems, and buildings. Their production consumes energy, water, chemicals, and mined materials. Rapid replacement can trade lower operational energy for higher manufacturing burdens.

The BLOOM life-cycle study illustrates why system boundaries change the answer. For the 176-billion-parameter model’s final training, the authors estimated approximately 24.7 metric tonnes of CO₂e from dynamic electricity consumption, but approximately 50.5 tonnes when including a broader set of operational and manufacturing processes. The estimate depended on allocation choices and incomplete industry data, so its principal lesson is not that every 176-billion-parameter model emits 50.5 tonnes; it is that excluding infrastructure can omit a material part of the result ([Luccioni, Viguier, and Ligozat, “Estimating the Carbon Footprint of BLOOM”](https://arxiv.org/abs/2211.02001)).

BLOOM also shows why headline comparisons between models are fragile. It was trained on France’s relatively low-carbon electricity system, whereas an otherwise similar run on a more fossil-intensive grid could have much higher operational emissions. Conversely, a model trained on clean electricity could have low operational carbon while still carrying embodied impacts from new hardware.

Material depletion is even harder to reduce to one number. Kilograms of equipment do not indicate which metals are scarce, where they were mined, or how extraction affects local ecosystems and communities. Life-cycle assessments translate inventories into impact categories, but results depend on databases and characterization methods that are less transparent for advanced accelerators than electricity-meter readings. A sound report should therefore publish several indicators—operational energy, operational CO₂e, embodied CO₂e, water, hardware quantity and lifetime—instead of hiding them inside one composite sustainability score.

### Water

Data centers consume water directly in cooling and indirectly through electricity generation and equipment manufacturing. “Withdrawal” means water taken from a source; “consumption” generally means the portion not returned to the same watershed in a readily reusable form, often because it evaporates. Confusing these measures can produce very different claims.

One modeling study estimated that training GPT-3 in Microsoft-operated US data centers could directly consume about 700,000 liters of freshwater through cooling. It also projected global AI-related water withdrawal of 4.2–6.6 billion cubic meters in 2027. These are modeled estimates built from assumed workloads, facility efficiencies, locations, and electricity-related water factors—not metered disclosures for GPT-3 or a settled forecast. The authors’ more robust conclusion is that water efficiency varies by location and time, so carbon-aware scheduling and water-aware scheduling can conflict ([Li et al., “Making AI Less ‘Thirsty’”](https://arxiv.org/abs/2304.03271)).

For example, evaporative cooling may lower electricity consumption and carbon emissions while increasing local water consumption. Scheduling computation for the coolest hours could reduce cooling water, yet those hours may not coincide with the cleanest electricity. The relevant optimization is consequently multi-objective:

\[
\min_{\text{architecture, hardware, place, time}}
\left(
E,\ C_{\mathrm{op}},\ C_{\mathrm{emb}},\ W,\ M
\right)
\]

subject to constraints on model quality, latency, reliability, cost, and completion time. Here \(W\) denotes water impact and \(M\) denotes material impact. There need not be one design that simultaneously minimizes every term.

## 5. Worked example: estimating and reducing a training run

Consider a hypothetical final training run using 2,000 accelerators for 30 days. Suppose direct measurement gives an average of \(550\ \mathrm{W}\) per accelerator, while CPUs, memory, storage, and networking add 25% to accelerator energy. The facility has PUE \(=1.20\), and the applicable grid factor is \(0.35\ \mathrm{kg\ CO_2e/kWh}\).

Accelerator energy is

\[
E_{\mathrm{acc}}
=
2{,}000\times0.550\ \mathrm{kW}
\times(30\times24)\ \mathrm{h}
=
792{,}000\ \mathrm{kWh}.
\]

Including associated IT equipment:

\[
E_{\mathrm{IT}}
=792{,}000\times1.25
=990{,}000\ \mathrm{kWh}.
\]

Including facility overhead:

\[
E_{\mathrm{facility}}
=990{,}000\times1.20
=1{,}188{,}000\ \mathrm{kWh}
=1.188\ \mathrm{GWh}.
\]

Estimated operational emissions are

\[
C_{\mathrm{op}}
=
1{,}188{,}000\times0.35
=
415{,}800\ \mathrm{kg\ CO_2e},
\]

or about \(416\) metric tonnes CO₂e.

Now consider four interventions:

1. A better training recipe reduces required computation by 30%.
2. New accelerators use 25% less IT energy per unit of work.
3. Facility improvements lower PUE from 1.20 to 1.10.
4. Carbon-aware placement lowers the electricity factor from 0.35 to \(0.08\ \mathrm{kg\ CO_2e/kWh}\).

If the benefits combine multiplicatively, the new facility energy is

\[
1.188\ \mathrm{GWh}
\times0.70
\times0.75
\times\frac{1.10}{1.20}
\approx0.572\ \mathrm{GWh}.
\]

Operational emissions become

\[
572{,}000\ \mathrm{kWh}
\times0.08
\approx45{,}800\ \mathrm{kg\ CO_2e},
\]

or about 46 tonnes—an 89% reduction relative to the initial estimate.

This calculation teaches three cautions. First, the percentages must refer to compatible baselines: a chip efficiency measured on one kernel cannot automatically be multiplied by a whole-system saving. Second, lower PUE does not prove lower water use. Third, replacing otherwise usable hardware creates embodied emissions; an honest comparison should ask whether cumulative operational savings repay that manufacturing impact during the equipment’s service life.

A complete report would add uncertainty intervals for measured power, PUE, grid intensity, and allocation. It would separately disclose experimental development runs and expected lifetime inference. If a model is served billions of times, deployment may dominate; if it is rarely used, manufacturing and training may dominate. The break-even number of inferences can be expressed as

\[
N^*
=
\frac{C_{\mathrm{train,A}}-C_{\mathrm{train,B}}}
{c_{\mathrm{infer,B}}-c_{\mathrm{infer,A}}},
\]

provided the denominator is positive and both systems deliver comparable quality. This turns “smaller models are greener” into a testable, workload-dependent claim.

## 6. What mitigation strategies can realistically deliver?

### Algorithmic efficiency

The strongest first step is to reduce computation required for a defined capability. Compute-optimal scaling research trained more than 400 models and found that, under its experimental regime, parameters and training tokens should increase together. Its resulting 70-billion-parameter Chinchilla model used the same training-compute budget as the 280-billion-parameter Gopher while outperforming it on the reported downstream suite; its smaller parameter count also reduced subsequent inference requirements. This is an established result for those models and data, not a universal rule for every architecture or objective ([Hoffmann et al., “Training Compute-Optimal Large Language Models”](https://arxiv.org/abs/2203.15556)).

Sparse mixture-of-experts models offer another route. Switch Transformer selected only part of a very large parameter set for each example and reported up to sevenfold pretraining speedups on the same computational resources, plus a fourfold speedup over T5-XXL in one comparison. The paper also documents routing complexity, communication costs, and training instability, so nominal sparsity does not guarantee proportional wall-plug savings ([Fedus, Zoph, and Shazeer, “Switch Transformers”](https://arxiv.org/abs/2101.03961)).

Other candidates include better data selection, early stopping, reuse of pretrained checkpoints, distillation, pruning, quantization, parameter-efficient adaptation, and avoiding redundant searches. Each should be evaluated at fixed quality and over the intended lifecycle. Efficiency per token is insufficient if cheaper computation induces vastly more training or use—a rebound effect.

### Hardware and system design

Specialized tensor hardware, lower-precision arithmetic, high-bandwidth memory, efficient interconnects, and higher utilization can reduce joules per useful operation. Yet maximum throughput is not the same as minimum energy. MLCommons reports that adding accelerators can shorten training time while increasing energy nonlinearly because communication grows and utilization falls. This makes full-system energy-to-target-quality a more meaningful metric than peak FLOP/s or training duration alone ([MLCommons, “MLPerf Power at HPCA”](https://mlcommons.org/2025/03/ml-commons-power-hpca/)).

Hardware policy should also reward longevity, repairability, reuse, and high utilization. Manufacturing a more efficient accelerator is environmentally favorable only when avoided operational impacts exceed its embodied burden and when displaced equipment has a responsible second life or end-of-life path.

### Renewable sourcing and spatial-temporal flexibility

Organizations can contract for new low-carbon generation, colocate flexible workloads with abundant clean power, and shift training to low-emission hours. The realistic constraint is that grids, transmission, and generation take longer to build than data centers. In the IEA’s high-adoption scenario, connection queues cause much of the additional demand beyond available renewable growth to be met by fossil fuels ([IEA, “Energy supply for AI”](https://www.iea.org/reports/energy-and-ai/energy-supply-for-ai)).

Accordingly, annual “100% renewable” accounting should be supplemented with hourly and regional data, evidence of additional generation, and disclosure of residual electricity. Flexibility also has limits: tightly synchronized training jobs, data-residency rules, hardware availability, and deadlines may restrict movement across times or regions.

### Measurement standards and policy incentives

Policy can correct a central information failure: operators often possess detailed energy and hardware data that researchers, customers, grids, and regulators cannot see. The European Union’s Delegated Regulation 2024/1364 requires operators of data centers with at least 500 kW of installed IT power demand to report defined information and indicators. It formalizes PUE, water usage effectiveness,

\[
\mathrm{WUE}=\frac{W_{\mathrm{in}}}{E_{\mathrm{IT}}},
\]

energy reuse factor,

\[
\mathrm{ERF}=\frac{E_{\mathrm{reuse}}}{E_{\mathrm{facility}}},
\]

and renewable energy factor,

\[
\mathrm{REF}=\frac{E_{\mathrm{renewable}}}{E_{\mathrm{facility}}}.
\]

Public release is aggregated to protect confidential information, so the regulation improves sector visibility without necessarily enabling model-level auditing ([Commission Delegated Regulation (EU) 2024/1364](https://eur-lex.europa.eu/eli/reg_del/2024/1364/oj)).

Reporting is a foundation, not a guaranteed reduction. Stronger incentives could tie procurement, tax benefits, grid connections, or research funding to independently measured energy-to-quality, hourly carbon matching, water-stress safeguards, heat reuse, and life-cycle disclosure. Poorly designed thresholds may encourage accounting optimization or move facilities outside regulated boundaries. Rules should therefore specify system boundaries, verification methods, uncertainty, and separate operational from embodied impacts.

## 7. Evidence limits and a practical evaluation framework

The selected evidence supports four conclusions with different levels of confidence.

First, it is well established that training compute and data-center electricity demand have grown rapidly. The exact future trajectory remains a forecast, not an observation.

Second, architecture, hardware, facility, and location can each change energy or emissions substantially. The size of the improvement is workload-specific, and multiplicative headline savings should not be generalized without measurement.

Third, operational electricity alone is incomplete. BLOOM’s life-cycle estimate and water-footprint modeling demonstrate potentially important omitted categories, but both depend on allocation assumptions and limited infrastructure disclosure.

Fourth, efficiency can reduce impact per training run or inference while total impact still rises through scale and increased demand. Absolute energy, emissions, water, and hardware throughput should therefore accompany intensity metrics.

A useful model card or environmental report should state:

- the capability or quality target;
- total training FLOP and tokens, if known;
- development compute as well as the final run;
- measured whole-system IT and facility energy;
- PUE, WUE, location, dates, and electricity accounting method;
- operational and embodied emissions reported separately;
- hardware type, quantity, utilization, age, and assumed lifetime;
- anticipated inference volume and energy per task;
- uncertainty ranges and excluded lifecycle stages.

This information allows comparisons without pretending that one number captures every ecological consequence.

## Conclusion

The environmental footprint of large-scale AI is not an unavoidable property of intelligence or parameter count. It is the product of decisions: how much work an algorithm requires, which parameters it activates, how efficiently hardware executes the workload, how fully that hardware is used, where and when electricity is drawn, how cooling is provided, how often equipment is replaced, and which impacts are measured.

The most credible mitigation portfolio follows that causal chain. Reduce computation at fixed capability; measure wall-plug energy rather than infer it from peak specifications; choose efficient, well-utilized and long-lived hardware; lower facility overhead without exporting the burden to water-stressed regions; match flexible loads to genuinely low-carbon electricity; and require comparable lifecycle disclosure. Renewable procurement alone cannot compensate for unlimited demand, while algorithmic efficiency alone cannot guarantee falling absolute consumption. The realistic goal is coordinated reduction across computation, infrastructure, energy, materials, and demand.

## Retrieval question

A training run consumes \(800\ \mathrm{MWh}\) of IT energy in a data center with PUE \(=1.25\), using electricity with an intensity of \(0.40\ \mathrm{kg\ CO_2e/kWh}\). What are its facility electricity use and operational emissions?

**Answer check:** Facility electricity is \(800\times1.25=1{,}000\ \mathrm{MWh}\). Converting to \(1{,}000{,}000\ \mathrm{kWh}\) and multiplying by \(0.40\) gives \(400{,}000\ \mathrm{kg}\), or 400 metric tonnes CO₂e. Check the PUE definition against the formula in the [EU regulation](https://eur-lex.europa.eu/eli/reg_del/2024/1364/oj) and the distinction between energy and carbon intensity against the accounting approach in [Patterson et al.](https://arxiv.org/abs/2104.10350).

## Transfer exercise

Compare two proposals for the same target-quality model:

- Proposal A reduces training computation by 40% but requires newly manufactured accelerators.
- Proposal B uses existing hardware, shifts half the workload to lower-carbon hours, and reduces grid intensity by 30%, but increases cooling-water consumption by 20%.

Construct a lifecycle comparison containing operational energy, operational CO₂e, allocated embodied emissions, water consumption, expected inference demand, and uncertainty. Determine the hardware manufacturing “carbon break-even” value at which A and B have equal total emissions. Then explain why the lower-carbon option may still be environmentally inferior in a water-stressed location.

To check the analysis, use the lifecycle-boundary contrast in the [BLOOM study](https://arxiv.org/abs/2211.02001), the location sensitivity in [Patterson et al.](https://arxiv.org/abs/2104.10350), and the distinction between water withdrawal, consumption, place, and time in [Li et al.](https://arxiv.org/abs/2304.03271).

## References

- Sevilla et al., [“Compute Trends Across Three Eras of Machine Learning”](https://epoch.ai/publications/compute-trends).
- Patterson et al., [“Carbon Emissions and Large Neural Network Training”](https://arxiv.org/abs/2104.10350).
- Luccioni, Viguier, and Ligozat, [“Estimating the Carbon Footprint of BLOOM”](https://arxiv.org/abs/2211.02001).
- Li et al., [“Making AI Less ‘Thirsty’”](https://arxiv.org/abs/2304.03271).
- Hoffmann et al., [“Training Compute-Optimal Large Language Models”](https://arxiv.org/abs/2203.15556).
- Fedus, Zoph, and Shazeer, [“Switch Transformers”](https://arxiv.org/abs/2101.03961).
- International Energy Agency, [“Energy demand from AI”](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai) and [“Energy supply for AI”](https://www.iea.org/reports/energy-and-ai/energy-supply-for-ai).
- European Union, [Commission Delegated Regulation (EU) 2024/1364](https://eur-lex.europa.eu/eli/reg_del/2024/1364/oj).
- MLCommons, [“MLPerf Power at HPCA”](https://mlcommons.org/2025/03/ml-commons-power-hpca/).
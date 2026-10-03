# Data Provenance, Curation, and Systemic Bias in Foundation Models

## Introduction

Foundation models are often described as learning from “the internet,” but the phrase obscures a long chain of consequential decisions. Digital material must first exist; become accessible to crawlers, archives, vendors, or institutions; be selected and copied; pass through language, quality, safety, and deduplication filters; receive labels or preference judgments; and finally be sampled during training. Each stage changes the distribution of evidence available to the model.

Bias therefore does not enter only through overtly prejudiced examples. It can arise from unequal access to publishing infrastructure, historical systems of classification, platform moderation, search-engine rankings, copyright constraints, annotation instructions, missing metadata, and decisions about what counts as “high quality.” These influences are systemic when they consistently privilege some populations, languages, institutions, or viewpoints over others.

The central lesson is that a training corpus is not a transparent sample of humanity. It is a constructed artifact. Modern foundation models compress regularities from that artifact, while their broad deployment can carry those regularities into settings far removed from the data’s original context. Technical mitigation is possible, but no single fairness score, filtering rule, or post-training intervention can repair every distortion. Effective mitigation requires a combination of provenance infrastructure, statistically informed curation, contextual evaluation, participatory governance, and continuing oversight.

## Prerequisites and key distinctions

A **foundation model** is a broadly applicable model trained on extensive data—often using self-supervision—and adapted to many downstream tasks. In language modeling, a common objective is next-token prediction:

\[
\mathcal{L}(\theta)
=
-\sum_{i=1}^{N}\sum_{t=1}^{T_i}
\log p_\theta(x_{i,t}\mid x_{i,<t}),
\]

where document \(i\) contains tokens \(x_{i,1},\ldots,x_{i,T_i}\). This loss rewards accurate prediction under the *training distribution*. It does not ask whether that distribution is historically just, geographically representative, consensually collected, or appropriate for a future application. NIST consequently characterizes harmful bias in generative AI as including the amplification of historical and systemic biases, subgroup or language performance disparities, and homogenization that may follow from non-representative data ([NIST Generative AI Profile, pp. 7–12](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

**Data provenance** is the recorded origin and history of data: sources, collection dates, licenses or permissions, transformations, filters, versions, and responsible actors. NIST’s broader definition includes metadata capable of tracking origins, modifications, and sources across text, images, audio, video, and datasets ([NIST, pp. 54–55](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). Provenance is not synonymous with proof of truth or legitimacy. Knowing where an item came from enables audit and accountability; it does not establish that the item is accurate, representative, lawful, or ethically usable.

**Curation** comprises selection, exclusion, transformation, labeling, weighting, and organization. “Raw data” is therefore a misleading ideal. A web crawl already reflects crawler schedules, robots exclusions, link structure, hosting availability, and platform policy. A curated corpus introduces further judgments through language identification, quality classifiers, blocklists, deduplication, source weighting, and removal policies.

**Representation bias** concerns who or what appears and in what proportions. **Measurement bias** arises when recorded features or labels are poor proxies for the construct of interest. **Historical bias** persists even if sampling is statistically faithful because the underlying society was unequal. **Aggregation bias** occurs when one model or decision rule is imposed on heterogeneous groups whose relationships differ. **Evaluation bias** appears when test data, metrics, or subgroup categories fail to represent deployment conditions.

These forms interact. Adding more examples from an underrepresented population may improve coverage but will not fix a demeaning label ontology. Equal average accuracy may conceal intersecting disparities. Removing identity terms may suppress legitimate community discourse while leaving subtler stereotypes intact.

## How historical collection practices become model behavior

### Digitization is already a social selection process

A model can learn only from material that was recorded, preserved, digitized, and made technically available. Wealthy institutions, highly connected regions, dominant languages, and prolific platforms consequently contribute disproportionate amounts of machine-readable material. Oral traditions, private communication, paywalled research, locally hosted resources, low-resource languages, and communities with limited connectivity are less visible.

Visibility is also shaped by power. Government records reflect administrative categories. News archives emphasize events considered publishable by particular institutions. Search and recommendation systems determine which pages acquire links and remain easy to crawl. Online harassment can silence members of marginalized communities, while coordinated propaganda can create abundant but misleading signals. A web corpus may therefore reproduce both social inequality and platform-specific behavior without explicitly encoding either as a design goal.

The problem is not simply imbalance. Frequency and legitimacy are different concepts. A stereotype may be frequent because it has been repeated for generations; a factual correction may be rare because specialized knowledge is expensive to produce. Maximum-likelihood learning tends to preserve predictive associations whether they represent useful knowledge, prejudice, or artifacts of the collection process.

### Historical categories survive through labels

Supervised datasets convert social concepts into operational categories. Labels such as “professional,” “criminal,” “toxic,” “male,” “female,” or “high quality” appear objective once stored in a column, but each embodies a definition, boundary, and annotation protocol. Some categories erase people who do not fit a binary or institutional taxonomy. Others turn contested judgments into ground truth.

This history can become hard to reconstruct when datasets are redistributed without annotation instructions, demographic information, source records, or version history. The documentation proposal known as **Datasheets for Datasets** was designed for precisely this problem: it calls for recording a dataset’s motivation, composition, collection process, preprocessing, uses, distribution, and maintenance ([Gebru et al., *Datasheets for Datasets*](https://arxiv.org/abs/1803.09010)). Its authors stress that dataset characteristics fundamentally influence model behavior and that mismatches between training, evaluation, and deployment contexts can be especially consequential in high-stakes applications.

Documentation does not remove the inherited category, but it makes the decision inspectable. Without it, downstream users may mistake a historically local convention for a universal measurement.

### Web-scale collection magnifies upstream choices

The scale of contemporary corpora can create a false sense that individual choices average out. In practice, automation makes small choices systematic. If a quality classifier favors formal prose resembling prestigious reference sources, the corpus may lose dialectal, conversational, or community-specific text. If a blocklist removes every document containing an identity term that also appears in pornography or abuse, the filter can suppress benign discussion by and about the named group.

An audit of the English Colossal Clean Crawled Corpus, or C4, illustrates the mechanism. C4 was produced by filtering a single Common Crawl snapshot, but researchers later found unexpected source concentrations, including patents and United States military sites, machine-generated material, and examples overlapping established NLP evaluation datasets. They also found that blocklist filtering disproportionately removed text from and about minority identities ([Dodge et al., *Documenting Large Webtext Corpora*](https://aclanthology.org/2021.emnlp-main.98/)). This is evidence about a particular corpus and pipeline, not proof that every web dataset has the same composition. It nevertheless demonstrates that “cleaning” is distribution-changing rather than neutral.

Deduplication has similarly ambiguous effects. Removing exact or near duplicates can reduce memorization and prevent highly replicated pages from dominating training. But duplication is socially structured: syndicated news, copied reference pages, spam, sacred texts, software documentation, and community campaigns replicate for different reasons. A deduplication threshold may alter the relative influence of each source class. If the pipeline does not preserve pre- and post-filter statistics, the effect becomes difficult to audit.

### Human annotation carries institutional context

Labels and preference data depend on annotators’ language competence, cultural experience, compensation, instructions, and working conditions. Majority voting can improve consistency while erasing legitimate disagreement. Ambiguous items may reveal contested norms rather than annotation error. A toxicity annotation task, for example, can confuse the quotation of a slur, its reclamation within a community, and its use as an attack unless context and speaker relationships are represented.

Institutional incentives compound these issues. In interviews with 53 high-stakes AI practitioners working in India, East and West African countries, and the United States, Sambasivan and colleagues defined **data cascades** as compounding downstream effects caused by data problems. Ninety-two percent of participants reported at least one cascade in a project ([Sambasivan et al., *Data Cascades in High-Stakes AI*](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/)). This was a qualitative, interview-based study rather than a prevalence estimate for the entire AI industry. Its geographic and occupational sample limits generalization, but it provides direct evidence that neglected data work can produce delayed, hard-to-see failures across multiple domains.

## How inherited distortions persist in foundation models

### Optimization can amplify rather than merely copy

Suppose a corpus contains a correlation between group marker \(G\) and occupation \(Y\). A sufficiently capable predictor benefits from encoding that correlation whenever it improves likelihood. If training examples repeatedly associate “nurse” with feminine pronouns and “engineer” with masculine pronouns, embeddings and hidden representations can internalize those associations even if no explicit demographic label is supplied.

The resulting behavior is not necessarily a verbatim copy. Representations combine signals across examples, enabling models to generalize stereotypes to new names, dialects, images, or contexts. Research on neural coreference and language models found occupational gender bias and reported that bias grew as training loss fell on the original data; counterfactual data augmentation reduced the measured bias while largely preserving task accuracy ([Lu et al., *Gender Bias in Neural Natural Language Processing*](https://arxiv.org/abs/1807.11714)). That finding supports a mechanism of optimization-driven amplification in the studied systems, but it does not establish that every model or bias measure behaves monotonically with training.

Scale also increases the number of contexts a model can connect. A foundation model can infer demographic proxies from names, locations, dialect, schools, medical histories, or image backgrounds even if protected attributes are removed. “Fairness through unawareness” is therefore weak when correlated proxies remain.

### Bias appears as both allocative and representational harm

An **allocative harm** changes access to resources or opportunities: hiring recommendations, credit decisions, medical prioritization, or fraud investigations. A **representational harm** demeans, stereotypes, erases, or systematically misdescribes people. Foundation models can generate both. An assistant may recommend different occupations based on a name, perform worse in a low-resource language, sexualize images of particular groups, or answer ambiguous questions using a social stereotype.

Historical computer-vision evidence shows why aggregate performance is inadequate. Buolamwini and Gebru found that the IJB-A and Adience facial-analysis benchmarks contained 79.6% and 86.2% lighter-skinned subjects, respectively. On a newly balanced evaluation set, three commercial gender-classification systems had error rates as high as 34.7% for darker-skinned women, while the maximum error for lighter-skinned men was 0.8% ([Buolamwini and Gebru, *Gender Shades*](https://proceedings.mlr.press/v81/buolamwini18a.html)). The experiment concerned binary gender classification products available in 2017–2018, so its exact rates should not be projected onto present systems. Its established lesson is methodological: intersectional disaggregation can reveal failures hidden by overall accuracy or one-axis analysis.

Language-model evaluations expose a related pattern. The BBQ benchmark uses ambiguous and disambiguated question-answering contexts across nine dimensions relevant to U.S. English-speaking settings. Tested models frequently relied on stereotypes when the context did not contain enough information; when it did, accuracy was on average up to 3.4 percentage points higher where the correct answer aligned with a stereotype, with gender gaps exceeding five points for most tested models ([Parrish et al., *BBQ*](https://aclanthology.org/2022.findings-acl.165/)). These results establish failure on controlled prompts, not the rate of discriminatory conduct in every deployment.

### Post-training changes expression, not necessarily representation

Instruction tuning, preference optimization, system prompts, and safety filters can suppress stereotyped outputs. They are valuable controls, especially when harmful content is readily identifiable. Yet a model that refuses an explicit prejudicial question may still use demographic proxies in recommendations, display performance disparities, or reproduce stereotypes under indirect prompts.

Post-training data have their own provenance problems. Preference labels may represent a narrow set of cultural expectations; safety policies can over-refuse discussion of marginalized identities; adversarial filtering can privilege users familiar with dominant-language phrasing. Mitigation must therefore be evaluated against both under-control—harmful behavior that survives—and over-control—legitimate content that is unnecessarily blocked.

## Technical interventions across the data lifecycle

### Build lineage that survives transformation

A provenance system should assign stable identifiers to source snapshots and record collection time, origin domain or repository, license or permission status, language, geography where responsibly inferable, transformations, filter versions, deduplication relationships, and inclusion or exclusion decisions. Dataset and model versions should be connected so that an incident can be traced to relevant artifacts.

Cryptographic hashes can establish whether an item changed, but they do not determine legality, consent, or semantic equivalence. Source-level manifests and aggregate summaries remain necessary when item-level disclosure would expose personal information or copyrighted material. NIST recommends documenting training-data curation policies, establishing collection and retention rules, tracking provenance limitations, preserving evaluation records, and maintaining inventories that include sources and version information ([NIST, pp. 17–30 and 54–55](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

Provenance should extend to removals. A filter audit needs counts and rates before and after each stage:

\[
r_g=\frac{N^{\text{removed}}_g}{N^{\text{input}}_g},
\]

where \(g\) may represent a language, source class, dialect, topic, or carefully governed demographic category. Comparing \(r_g\) across groups can reveal disparate filtering, although a difference is a diagnostic signal rather than automatic proof of injustice.

### Curate for purpose, not an abstract universal distribution

Representativeness must be defined relative to an intended use. A multilingual public-service assistant needs different coverage from a protein model or a historical-literature model. Teams should specify target populations, geographic and temporal scope, supported languages, foreseeable exclusions, and contexts in which the model should not be used.

Possible interventions include:

- stratified sampling or weighting to improve coverage;
- targeted collection developed with underrepresented communities;
- source caps that limit domination by highly replicated domains;
- quality models evaluated separately across languages and dialects;
- context-sensitive safety filtering instead of term-only blocklists;
- deduplication audits across source and subgroup strata;
- removal or quarantine processes for illegal, non-consensual, or highly sensitive data;
- counterfactual augmentation, such as exchanging gendered entities while holding the rest of an example constant.

Counterfactual augmentation can weaken an unwanted association, as the neural NLP study above demonstrated, but naïve substitutions can produce ungrammatical or culturally implausible examples. Reweighting can improve a chosen metric while sacrificing calibration or utility elsewhere. Synthetic data can fill coverage gaps but may recycle the generating model’s errors; NIST specifically recommends measuring the proportion of synthetic material and guarding against excessive homogeneity or model collapse ([NIST, pp. 39–40](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

### Evaluate distributions of harm

Evaluation should report subgroup sample sizes, uncertainty intervals, false-positive and false-negative rates, calibration, abstention behavior, and intersectional results. For a binary outcome, a disparity such as

\[
\Delta_{\mathrm{FPR}}
=
P(\hat{Y}=1\mid Y=0,G=a)
-
P(\hat{Y}=1\mid Y=0,G=b)
\]

has meaning only after defining \(Y\), the groups, sampling process, threshold, and deployment consequence. Different fairness criteria can conflict when base rates differ, so metric choice is a normative decision tied to the application.

Behavioral testing should include ambiguous prompts, indirect proxies, multiple languages, long-form generation, red teaming, and realistic workflows. Localization matters: KoBBQ researchers found that translating a U.S.-oriented bias benchmark was insufficient for Korean social contexts, motivating culturally specific categories and validation ([Jin et al., *KoBBQ*](https://aclanthology.org/2024.tacl-1.28/)). A benchmark can become stale, leaked into training data, or gamed; it should be treated as one measurement instrument rather than a certification of fairness.

## Governance interventions

Technical controls require authority, resources, and accountability. A serious governance program assigns data stewardship roles; conducts privacy, rights, and social-impact review before collection; includes domain experts and affected communities; establishes mechanisms for correction, removal, appeal, and incident reporting; and requires downstream users to respect documented restrictions.

Procurement is important because many organizations use third-party models whose training data they cannot inspect. Contracts can require provenance summaries, known-limitations disclosures, evaluation evidence, change notifications, audit rights, and incident-response commitments. NIST recommends continuous monitoring of third-party generative systems and communication of incidents to downstream stakeholders, including potentially affected parties ([NIST, pp. 19–25](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

Law can establish a transparency floor. Article 53 of the European Union’s AI Act requires providers of general-purpose AI models to maintain technical documentation, provide information to downstream integrators, implement a policy for compliance with Union copyright law, and publish a sufficiently detailed summary of training content; the Act’s recitals explain that such summaries should identify major collections or databases while accounting for trade-secret concerns ([Regulation (EU) 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)). This is a disclosure obligation, not a guarantee that the data are unbiased or lawfully usable in every circumstance.

Documentation also creates tensions. Publishing item-level provenance can expose personal data, enable reconstruction of sensitive datasets, or compromise security. Trade-secret claims may conceal information necessary for accountability. Community participation can become tokenistic if participants lack decision rights or compensation. Governance must consequently specify who receives what information, under what safeguards, and with what power to demand remediation.

## Limits of current evidence and a defensible practice

The cited empirical studies establish that collection and curation can produce measurable disparities, that filters can disproportionately exclude minority-related content, and that trained systems can reproduce stereotypes. They do not yield a universal numerical estimate of foundation-model bias. Results depend on model version, prompt, sampling settings, language, benchmark construction, and deployment context.

Nor does statistical parity settle the social question. Historical inequalities can make observed base rates unjust; forcing equal rates can hide relevant differences or introduce new harms; demographic categories vary across cultures and change over time. Some sensitive attributes cannot ethically or legally be collected, limiting direct measurement. Foundation-model opacity further complicates causal attribution because pretraining data, post-training data, retrieval systems, prompts, and user interfaces jointly determine outcomes.

The most defensible approach is therefore layered:

1. Preserve lineage and document uncertainty.
2. Define the intended population and prohibited uses.
3. Audit every major transformation, including removals.
4. Evaluate intersecting groups and culturally relevant contexts.
5. Combine data interventions with model- and application-level controls.
6. Give affected people meaningful channels for correction and appeal.
7. Monitor deployment and connect incidents back to dataset and model versions.
8. Revise datasets and policies openly rather than treating release as the end of governance.

Systemic bias is not merely dirt in an otherwise neutral data stream. It is produced through relationships among historical institutions, digital infrastructure, statistical objectives, and organizational incentives. Foundation models inherit those relationships because prediction rewards patterns present in curated evidence, not because models independently understand which patterns are legitimate. Mitigation is credible when it changes the infrastructure and authority surrounding data—not only the appearance of model outputs.

## References

- Buolamwini, J., and Gebru, T. (2018). [“Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification.”](https://proceedings.mlr.press/v81/buolamwini18a.html)
- Dodge, J., et al. (2021). [“Documenting Large Webtext Corpora: A Case Study on the Colossal Clean Crawled Corpus.”](https://aclanthology.org/2021.emnlp-main.98/)
- European Union (2024). [Regulation (EU) 2024/1689—the Artificial Intelligence Act.](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689)
- Gebru, T., et al. (2021). [“Datasheets for Datasets.”](https://arxiv.org/abs/1803.09010)
- Jin, J., et al. (2024). [“KoBBQ: Korean Bias Benchmark for Question Answering.”](https://aclanthology.org/2024.tacl-1.28/)
- Lu, K., et al. (2018). [“Gender Bias in Neural Natural Language Processing.”](https://arxiv.org/abs/1807.11714)
- NIST (2024). [*Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*, NIST AI 600-1.](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- Parrish, A., et al. (2022). [“BBQ: A Hand-Built Bias Benchmark for Question Answering.”](https://aclanthology.org/2022.findings-acl.165/)
- Sambasivan, N., et al. (2021). [“‘Everyone Wants to Do the Model Work, Not the Data Work’: Data Cascades in High-Stakes AI.”](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/)
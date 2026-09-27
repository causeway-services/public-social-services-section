# Digital Twins: Who Owns the Data, Who Decides?

## Introduction

A digital twin is often described as a virtual copy of something real: a machine, building, neighborhood, river basin, electrical grid, or even the Earth. That description is useful but incomplete. The consequential feature is not visual resemblance. It is the continuing connection between a modeled system and observations of its real-world counterpart, combined with computation intended to support prediction, optimization, or control. The US National Institute of Standards and Technology (NIST) describes digital twins as representations that help operators diagnose, predict, optimize, and sometimes control real systems across their life cycles ([NIST, “Digital Twin Core Conceptual Models and Services”](https://www.nist.gov/publications/digital-twin-core-conceptual-models-and-services)).

This connection makes a digital twin a decision-making institution as well as a technical system. Its sensors determine what becomes visible; its categories determine how observations are interpreted; its objective function defines what counts as improvement; and its interfaces determine who can investigate alternatives. A twin used to regulate traffic, predict floods, schedule electricity, or plan redevelopment can redistribute authority even if it never makes a legally binding decision by itself.

The central question is therefore not simply who possesses a database. It is how rights, capabilities, costs, and risks are divided among residents, governments, technology vendors, infrastructure operators, researchers, and the communities represented in—or omitted from—the model. Digital twins can widen access to public knowledge, make dangerous experimentation unnecessary, and help governments test environmental policies. They can also concentrate expertise and operational control, expand surveillance, lock public institutions into proprietary systems, and place electricity, water, and material burdens far from the people who receive the modeled benefits.

The evidence does not support a universal verdict that digital twins either empower or dispossess communities. Outcomes depend on design and governance choices: who defines the purpose, who supplies and validates data, who can contest a result, whether the system merely advises or automatically acts, and whether environmental and social costs enter the accounting.

## 1. What makes a model a digital twin?

The term has no single universally applied technical boundary. NIST notes that a basic digital-twin implementation combines a virtual representation with a link to the represented system over its life cycle, while its scope may range from one machine to a facility or supply chain ([NIST manufacturing study](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=933613)). A static three-dimensional model of a building is therefore not necessarily a twin. A building model continually updated with occupancy, temperature, energy, and equipment-state data is a stronger candidate.

A simplified twin can be expressed as a state-estimation and decision system:

\[
x_{t+1}=f(x_t,u_t,w_t), \qquad y_t=h(x_t)+v_t.
\]

Here:

- \(x_t\) is the modeled state at time \(t\), such as soil moisture, traffic density, or equipment condition;
- \(u_t\) represents an intervention, such as changing a signal schedule or opening a floodgate;
- \(w_t\) represents unresolved external influences;
- \(y_t\) is what sensors or administrative systems actually observe;
- \(v_t\) represents measurement error; and
- \(f\) and \(h\) encode assumptions about how the system behaves and how observations relate to it.

Software estimates \(x_t\) from \(y_t\), simulates the consequences of possible actions \(u_t\), and may recommend or execute an action intended to minimize an objective such as:

\[
J=\sum_{t=0}^{T}\left(
\alpha C_t+\beta E_t+\gamma R_t+\delta I_t
\right),
\]

where \(C\), \(E\), \(R\), and \(I\) might represent financial cost, emissions, risk, and inequity. The coefficients \(\alpha,\beta,\gamma,\delta\) are not facts discovered by sensors. They are value choices. If travel time is measured precisely while displacement risk is absent, the system can optimize mobility while treating housing insecurity as though it did not exist.

A working twin usually combines several layers:

1. **Instrumentation:** sensors, meters, satellite observations, cameras, surveys, transaction records, or administrative datasets.
2. **Data infrastructure:** networks, identifiers, databases, metadata, access controls, and retention systems.
3. **Models:** physical simulations, statistical estimators, machine-learning components, and rules.
4. **Interfaces:** maps, dashboards, alerts, application-programming interfaces, and control panels.
5. **Institutions:** procurement contracts, professional practices, laws, budgets, and accountability procedures.
6. **Physical action:** maintenance, emergency response, pricing, permitting, infrastructure operation, or automated control.

Power can concentrate at every layer. A community may legally “own” some observations yet lack the software, metadata, computing resources, or expertise needed to use them. Conversely, publishing a model’s code does not provide meaningful authority if residents cannot alter the policy objectives or stop automated actions.

## 2. From representation to decision-making power

Digital twins distribute power through three related mechanisms: visibility, simulation, and intervention.

### Visibility

Instrumentation decides which conditions become legible to an organization. A utility may gain minute-by-minute knowledge of electricity demand; a city may observe pedestrian flows; an environmental agency may combine remote sensing with river gauges. But measurement is selective. Informal activity, unpaid care, cultural significance, distrust of authorities, and unequal exposure within households may resist sensor-based representation.

Missing data are not always random. Lower-income areas may have older infrastructure, fewer calibrated sensors, less reliable connectivity, or residents who rationally decline participation. A twin trained on well-instrumented places may therefore appear technically precise while being socially unrepresentative.

### Simulation

Simulation changes whose arguments carry institutional weight. A modeled flood map can make future risk visible before a disaster occurs. It can also privilege assumptions chosen by model designers over residents’ observations of drainage failures or historical flooding.

Scenario results are conditional statements: *if the model structure, input data, boundary conditions, and intervention assumptions are adequate, then this outcome is estimated*. They are not observations of the future. Responsible interfaces should distinguish measured values, estimates, forecasts, and hypothetical scenarios and should expose sensitivity to uncertain parameters.

### Intervention

The political stakes rise as a twin moves from description toward control. A dashboard that informs a maintenance worker leaves room for deliberation. A system that automatically adjusts ventilation or electricity dispatch makes decisions through code and equipment. NIST identifies remote control, massive instrumentation, centralized measurements, and detailed operational representations as features requiring special cybersecurity attention ([NIST IR 8356](https://csrc.nist.gov/pubs/ir/8356/final)).

Automation also changes accountability. When a harmful outcome involves faulty sensors, a vendor’s model, a government objective, and an operator’s reliance on a recommendation, responsibility can become fragmented. “The model decided” is not an adequate explanation: people and institutions selected the data, rules, thresholds, and authority delegated to it.

## 3. Data ownership is a bundle of rights, not one switch

“Who owns the data?” is necessary but often too blunt. At least eight distinct powers may be separated:

- deciding what is collected;
- consenting to or refusing collection;
- physically possessing or hosting records;
- accessing and interpreting them;
- correcting or deleting them;
- combining them with other datasets;
- licensing, selling, or deriving commercial products from them;
- deciding which actions may be taken from the resulting analysis.

These powers may belong to different actors. A resident generates occupancy data, a sensor manufacturer designs the measurement format, a cloud provider stores it, a building operator purchases the service, a municipality regulates its use, and a vendor retains rights in an inferred model. Contractual access can matter more in practice than an abstract claim of ownership.

The European Union’s Data Act illustrates a rights-based approach rather than simply declaring that one actor owns machine-generated data. It requires, in applicable circumstances, data from connected products and related services—along with metadata needed to interpret them—to be made accessible to users in a structured, commonly used, machine-readable format. It also enables users to share data with third parties and limits some contractual imbalances ([Regulation (EU) 2023/2854, especially Articles 3–5](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R2854)). The regulation generally began applying on 12 September 2025, while its design obligation under Article 3(1) applies to connected products and related services placed on the market after 12 September 2026 ([Data Act, Article 50](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=OJ%3AL_202302854)).

The Act does not abolish privacy, trade-secret, or cybersecurity restrictions. Nor does access automatically create the ability to interpret complex data. Its public-sector access mechanism is limited to defined “exceptional need,” including public emergencies or certain legally specified public-interest tasks, rather than establishing routine government entitlement to all privately held data ([Data Act, Articles 14–15](https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng)). These qualifications show why data sovereignty cannot be reduced to downloading a file.

### Individual privacy and collective sovereignty

Individual consent is also insufficient for datasets that describe groups, territories, or shared environments. A high-resolution model can reveal collective patterns even after direct identifiers are removed. Mobility records may expose where a small community gathers; ecological observations may identify culturally sensitive sites; aggregate building data may disclose patterns about tenants.

The Global Indigenous Data Alliance’s CARE principles—Collective Benefit, Authority to Control, Responsibility, and Ethics—address this collective dimension. They were developed because data frameworks focused on making data findable and reusable often overlooked historical power differences, Indigenous rights, and self-determination ([Global Indigenous Data Alliance, CARE Principles](https://www.gida-global.org/careprinciples)). CARE does not imply that one governance formula applies to every Indigenous nation. It instead directs institutions toward locally defined authority and benefit. The Alliance expressly states that locally designed Indigenous data-sovereignty and governance standards should take priority where they exist ([GIDA communiqués](https://www.gida-global.org/gidacommuniques)).

Applied to a territorial digital twin, this means that technically open environmental data may still be governed unjustly if Indigenous peoples cannot determine how knowledge about their lands is interpreted, attributed, shared, or used. “Open” and “sovereign” are not synonyms, and openness can transfer value to outside institutions without transferring authority back to the source community.

## 4. Two public-system examples

### Destination Earth: public capacity at continental scale

The European Union’s Destination Earth initiative demonstrates the public-service potential and institutional scale of digital twins. Its first operational release launched in June 2024 with a core platform, data lake, and twins focused on climate adaptation and weather-related extremes. The system combines Earth observation, Internet-of-Things, socioeconomic, and model-generated data; the European Space Agency operates the platform, EUMETSAT operates the data lake, and the European Centre for Medium-Range Weather Forecasts develops the initial twins ([European Commission, Destination Earth](https://digital-strategy.ec.europa.eu/en/policies/destination-earth)).

The stated purpose is to let users examine hazards and adaptation scenarios using high-resolution observations and predictive modeling. Potential applications include flood planning, water management, disaster response, and assessment of socioeconomic consequences ([European Commission Destination Earth overview](https://digital-strategy.ec.europa.eu/en/policies/destination-earth)). This is a meaningful public capability: individual municipalities generally cannot build global Earth-system models or operate the required supercomputing infrastructure.

Yet scale creates a representational problem. Continental models can support local decisions without containing local priorities. A technically accurate flood simulation does not itself decide whose property should be protected first, whether retreat is acceptable, how compensation should work, or whose knowledge counts when modeled drainage differs from lived experience. The Commission reports that it established stakeholder dialogue and recurring user exchanges, but consultation and co-decision are not equivalent forms of authority ([Destination Earth stakeholder arrangements](https://digital-strategy.ec.europa.eu/en/policies/destination-earth)).

Destination Earth therefore illustrates subsidiarity’s practical challenge: wider public systems can supply shared infrastructure and cross-border models, while legitimate local decisions still require local knowledge, contestability, and political authorization.

### Toronto’s Quayside: governance contested before deployment

Toronto’s proposed Quayside “smart neighborhood” shows how digital-governance disputes can arise before a full twin is operational. A 2018 Toronto staff report described Sidewalk Labs’ proposed “Digital Layer” as potentially involving coordinated data collection through sensors, cameras, and smartphone applications, along with continuing information exchange between the company and the city. Staff emphasized that data collected for the city or under authority to collect on public land would be subject to Ontario’s municipal privacy law and that substantial changes in personal-information practices required privacy-impact assessment ([City of Toronto staff report](https://www.toronto.ca/legdocs/mmis/2018/ex/bgrd/backgroundfile-110745.pdf)).

Waterfront Toronto subsequently formed an arm’s-length Digital Strategy Advisory Panel to examine accountability, privacy, cybersecurity, data governance, and equitable distribution of benefits from intellectual property and data ([Waterfront Toronto panel report](https://www.waterfrontoronto.ca/sites/default/files/connect/waterfront/521b1d08-3499-4a49-9d2c-b5fc34990ce5/dsap-report---appendices.pdf)). Sidewalk Labs withdrew in May 2020, publicly citing pandemic-related economic uncertainty and other factors, so the proposal did not yield a completed neighborhood against which its claimed benefits could be tested ([City of Toronto, 2020 project update](https://secure.toronto.ca/council/agenda-item.do?item=2020.EX19.4)).

This is consequently not evidence that a deployed twin caused a measured harm or benefit. It is evidence that public authority, intellectual property, privacy, and data control were recognized as planning questions rather than matters to settle after installation. It also demonstrates the value of keeping pilots non-exclusive and preserving public procurement authority: technical experimentation need not grant a vendor long-term control over civic infrastructure.

## 5. Environmental benefits and environmental costs

Digital twins may reduce environmental damage when they help avoid physical experiments, identify equipment failure, coordinate energy use, or compare adaptation options. NIST notes that engineers can use twins to test design changes or analyze incidents without conducting expensive or hazardous experiments on real equipment ([NIST digital-twin core report](https://www.nist.gov/publications/digital-twin-core-conceptual-models-and-services)). Destination Earth is explicitly intended to support climate adaptation and extreme-event planning, although its stated aims should not be confused with independently demonstrated environmental outcomes ([European Commission, Destination Earth](https://digital-strategy.ec.europa.eu/en/policies/destination-earth)).

The environmental ledger must also include the twin itself:

\[
B_{\mathrm{net}}
=
D_{\mathrm{avoided}}
-
\left(
E_{\mathrm{sensing}}
+E_{\mathrm{network}}
+E_{\mathrm{compute}}
+W_{\mathrm{cooling}}
+M_{\mathrm{hardware}}
+D_{\mathrm{rebound}}
\right),
\]

where avoided damage or resource use is offset by sensing, network and computing energy, cooling water, hardware’s material life cycle, and rebound effects. The terms cannot all be combined directly without converting them into a common impact measure; the equation is an accounting framework, not a universal physical law.

The International Energy Agency estimates that data centers consumed about 415 terawatt-hours of electricity worldwide in 2024, roughly 1.5% of global electricity use. Its 2025 base case projected approximately 945 TWh in 2030, while alternative assumptions about adoption, efficiency, and constraints produce materially different pathways ([IEA, “Energy demand from AI”](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)). Those totals cover all data-center workloads, not digital twins specifically. They should not be presented as the footprint of twins.

Environmental burdens are geographically concentrated. The IEA notes that data centers cluster in particular electricity markets, making local grid effects more severe than their global percentage suggests ([IEA regional analysis](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)). A US national laboratory study estimated that American data centers directly consumed roughly 66 billion liters of water in 2023 and projected a broad range of approximately 60–124 billion liters of additional annual direct consumption by 2028, depending on scenario and interpretation of the report’s baseline and projections; it also emphasizes indirect water use and emissions from electricity generation ([Lawrence Berkeley National Laboratory, 2024 US Data Center Energy Usage Report](https://datacenters.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report)). National aggregates do not reveal whether withdrawals occur in water-stressed basins or which communities bear infrastructure expansion.

There is a major evidence gap: neither these energy reports nor public descriptions of most twin projects provide workload-level life-cycle assessments capable of attributing servers, network traffic, cooling, sensors, and hardware replacement to a particular twin. Claims that a twin is “green” should therefore be tested against a counterfactual—what would happen without it—and audited using actual operational data rather than inferred from its environmental purpose.

## 6. Security, reliability, and the politics of uncertainty

A twin can be wrong because sensors drift, data arrive late, model structure is incomplete, behavioral relationships change, or adversaries manipulate inputs. NIST’s security analysis identifies risks arising from widespread instrumentation, centralized operational measurements, detailed visualization, and remote control. Compromise could reveal physical operations or allow interference with them ([NIST IR 8356](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957183)).

Security and openness must therefore be designed together. Publishing every real-time detail of a water plant or electrical substation may create operational risk, but treating the entire system as secret prevents public scrutiny. A layered architecture can separate:

- public assumptions, aggregate results, and environmental accounts;
- controlled research access to sensitive microdata;
- tightly restricted operational commands and credentials; and
- immutable logs recording who changed models, data, or control policies.

Validation should evaluate more than average prediction error. Relevant questions include error across neighborhoods and demographic groups, performance during rare extremes, robustness to missing sensors, calibration of confidence intervals, and consequences of false alarms versus missed events. A model may be accurate on average while consistently underestimating hazards in poorly monitored communities.

Human oversight is meaningful only when people have time, authority, and information to reject a recommendation. A nominal “human in the loop” who must approve hundreds of opaque alerts is not exercising substantive control.

## 7. A practical governance framework

A fair public-interest twin should be treated as revisable civic infrastructure. Before procurement or deployment, institutions can ask:

1. **Purpose:** What decision will the twin inform, and what decisions are explicitly outside its scope?
2. **Authority:** Who may alter objectives, thresholds, model assumptions, and automated controls?
3. **Data lineage:** Which observations come from residents, private platforms, public agencies, or Indigenous territories, and under what rights?
4. **Representation:** Which conditions are unmeasured, and who is most likely to be absent or misclassified?
5. **Access:** Can affected communities obtain understandable outputs, relevant raw data, metadata, and independent technical assistance?
6. **Contestability:** Is there a procedure to challenge data, predictions, and actions before irreversible harm?
7. **Procurement:** Can the public export data and models, replace vendors, and continue essential operations if a contract ends?
8. **Benefit sharing:** Do communities supplying data receive useful services, funding, employment, or decision rights?
9. **Environmental accounting:** Are electricity, water, embodied materials, hardware replacement, and avoided impacts measured in the same system boundary?
10. **Retirement:** Who deletes sensitive records, preserves public archives, and safely decommissions sensors and hardware?

Governance should match the risk. A research-only visualization does not require the same safeguards as a system that changes utility service or emergency dispatch. Higher-impact systems warrant independent validation, appeal routes, incident reporting, periodic reauthorization, and a tested manual fallback.

Community participation must also occur early enough to change the project. Asking residents to select dashboard colors after sensors and objectives have been fixed is not shared governance. Meaningful participation can include community seats on governing bodies, authority to veto specified uses, participatory definition of success metrics, community-run data repositories, and budgets for independent expertise.

## Conclusion

Digital twins distribute power through architecture. Sensors allocate visibility; models allocate credibility; interfaces allocate comprehension; contracts allocate control; and automated links allocate the ability to act. Legal ownership of a file is only one part of that distribution.

Wider public systems can provide capabilities that local communities cannot efficiently reproduce, including interoperable infrastructure, continental environmental models, and emergency coordination. Local institutions and communities contribute contextual knowledge, democratic legitimacy, and direct awareness of unequal consequences. The strongest arrangement is therefore neither total centralization nor purely local isolation. It is a layered system in which large-scale infrastructure remains interoperable and publicly accountable while affected communities retain meaningful authority over purposes, sensitive data, local interpretation, and consequential actions.

The environmental balance is similarly conditional. Twins may avert waste, failures, and climate damage, but they also require sensors, networks, servers, electricity, cooling water, and hardware. Project-specific net benefits remain difficult to establish because workload-level resource reporting and credible counterfactual evaluations are uncommon. Environmental claims should be treated as hypotheses until measured.

Ultimately, a trustworthy twin is not the one that most completely duplicates reality. No model can do that. It is one whose boundaries, uncertainties, costs, and governing choices are visible; whose outputs can be challenged; whose operators remain accountable; and whose communities have power not merely to contribute data, but to shape what the system is permitted to decide.

## References

- [European Commission — Destination Earth](https://digital-strategy.ec.europa.eu/en/policies/destination-earth)
- [European Union — Regulation (EU) 2023/2854, Data Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R2854)
- [Global Indigenous Data Alliance — CARE Principles](https://www.gida-global.org/careprinciples)
- [International Energy Agency — Energy demand from AI](https://www.iea.org/reports/energy-and-ai/energy-demand-from-ai)
- [Lawrence Berkeley National Laboratory — 2024 United States Data Center Energy Usage Report](https://datacenters.lbl.gov/publications/2024-lbnl-data-center-energy-usage-report)
- [NIST — Digital Twin Core Conceptual Models and Services](https://www.nist.gov/publications/digital-twin-core-conceptual-models-and-services)
- [NIST — Security and Trust Considerations for Digital Twin Technology](https://csrc.nist.gov/pubs/ir/8356/final)
- [City of Toronto — Sidewalk Toronto staff report](https://www.toronto.ca/legdocs/mmis/2018/ex/bgrd/backgroundfile-110745.pdf)
- [Waterfront Toronto — Digital Strategy Advisory Panel report](https://www.waterfrontoronto.ca/sites/default/files/connect/waterfront/521b1d08-3499-4a49-9d2c-b5fc34990ce5/dsap-report---appendices.pdf)
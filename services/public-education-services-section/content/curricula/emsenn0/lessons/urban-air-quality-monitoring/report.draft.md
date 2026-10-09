# Urban Air Quality Monitoring: Who Pays, Who Benefits, and Who Decides?

## The opening question

Imagine that residents living beside a freight corridor repeatedly report diesel odors, coughing, and soot, but the city’s nearest official air-monitoring station is several kilometers away. A technology company offers compact sensors that could map pollution block by block. The municipal government can purchase them, a foundation might fund community groups to host them, and a public health agency could use the resulting measurements to target outreach.

Who should choose the sensor locations? Who pays for installation, connectivity, calibration, maintenance, analysis, and eventual replacement? Who owns the raw measurements? Most importantly, what happens if a neighborhood’s sensors reveal a pollution hotspot?

These are governance questions as much as technical ones. An air-quality network does not merely detect pollution. Its funding model, spatial design, data platform, quality standards, and decision rules distribute costs, information, credibility, and political influence among municipalities, vendors, communities, regulators, and health agencies.

**Learning outcome:** By the end of this report, a reader should be able to examine an urban sensor program and explain how its technical architecture, financing, and governance determine who can produce evidence, who can challenge it, and whether measurements can lead to enforceable or equitable action.

## What an air-quality sensor network measures

Air pollution is not one substance. A monitoring project must specify a target pollutant, time scale, location, and intended use. Common urban targets include nitrogen dioxide, often associated with combustion sources, and fine particulate matter, conventionally called PM2.5 because the particles have aerodynamic diameters of 2.5 micrometers or less. London’s monitoring system, for example, combines reference stations, low-cost sensors reporting hourly nitrogen-dioxide and PM2.5 averages, and diffusion tubes that provide monthly nitrogen-dioxide averages ([Greater London Authority, “Monitoring and reporting on air quality”](https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/monitoring-and-predicting-air-pollution)).

A concentration is generally expressed as a pollutant mass per volume of air, such as micrograms per cubic meter:

\[
C=\frac{m}{V},
\]

where \(C\) is concentration, \(m\) is the measured or estimated pollutant mass, and \(V\) is the sampled air volume. A sensor does not necessarily count that mass directly. Its detector produces an electrical or optical signal, which hardware or software converts into a reported concentration. That conversion can be influenced by temperature, humidity, particle composition, interfering gases, component aging, and the correction algorithm.

It is therefore important to distinguish three broad monitoring technologies:

- **Reference or regulatory monitors** are high-accuracy instruments operated under prescribed quality-assurance procedures. Their observations can support formal regulatory reporting.
- **Lower-cost sensors** are generally smaller, less expensive, and easier to deploy densely. The US Environmental Protection Agency identifies their primary role as *non-regulatory supplemental and informational monitoring*, including trend analysis, participatory science, education, forecasting, and emergency response ([EPA, “Air Sensor Use and Study Design”](https://www.epa.gov/air-sensor-toolbox/air-sensor-use-and-study-design)).
- **Passive devices such as diffusion tubes** collect pollution over a longer period and are later analyzed, trading fine time resolution for relatively inexpensive spatial coverage. London describes its nitrogen-dioxide diffusion tubes as “indicative” devices producing monthly averages rather than hourly readings ([Greater London Authority](https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/monitoring-and-predicting-air-pollution)).

“Low cost” is relational, not absolute. It normally means less expensive than a reference instrument; it does not mean that a complete network is cheap. The network still needs suitable sites, electricity or batteries, communications, weather protection, field visits, data storage, software, calibration or correction, technical staff, and replacement equipment.

## From signal to usable evidence

A sensor becomes part of an evidence system through a chain:

\[
\text{polluted air}
\rightarrow \text{detector signal}
\rightarrow \text{conversion algorithm}
\rightarrow \text{quality checks}
\rightarrow \text{stored data}
\rightarrow \text{visualization}
\rightarrow \text{interpretation}
\rightarrow \text{decision}.
\]

Power is exercised at every link. A vendor may design the conversion algorithm. A municipality may control where equipment is installed. A university may perform quality assurance. A community organization may interpret a local peak as evidence of a freight problem. A regulator may decide that the measurement is informative but insufficient for enforcement.

The EPA warns that air sensors can produce questionable individual readings or systematic bias and may lack sufficient sensitivity or selectivity for the intended pollutant. Temperature and humidity can also distort readings, and some devices need field calibration or additional weather protection ([EPA, “Frequent Questions About Air Sensors”](https://www.epa.gov/air-sensor-toolbox/frequent-questions-about-air-sensors)). These limitations do not make sensor data useless. They mean that usefulness depends on whether data quality is adequate for the question being asked.

One important technique is **collocation**: operating a sensor beside a trusted reference monitor under the same real-world conditions for a defined period. The comparison can reveal bias, noise, missing observations, environmental sensitivity, or the need for a correction equation. EPA defines collocation precisely in these terms and emphasizes that non-reference sensors are often used for applications that do not require the accuracy and reliability expected of regulatory instruments ([EPA, “Air Sensor Collocation Instruction Guide”](https://www.epa.gov/air-sensor-toolbox/air-sensor-collocation-instruction-guide)).

Suppose a collocated sensor reports hourly observations \(S_i\), while the reference monitor reports \(R_i\). A basic mean bias is

\[
\text{Mean bias}=\frac{1}{n}\sum_{i=1}^{n}(S_i-R_i).
\]

A positive result suggests average overestimation during that test; a negative result suggests underestimation. But this statistic alone cannot show whether the error changes with humidity, concentration, season, or pollutant mixture. Nor does one collocation guarantee performance at every neighborhood site. A defensible program documents its correction method, preserves raw data, periodically reassesses sensors, and communicates residual uncertainty.

The EPA’s 2022 *Enhanced Air Sensor Guidebook* treats project design as a sequence of defining a question, planning, setting up equipment, collecting data, and evaluating results. It calls for explicit decisions about maintenance, quality control, verification, data processing, ownership, access, storage, analysis, communication, and action ([EPA, *Enhanced Air Sensor Guidebook*](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1017AWL.TXT)). These are not administrative details added after measurement. They help determine whether observations become credible public evidence.

## Deployment distributes visibility

Sensor placement determines which experiences become measurable. A reference network with a few carefully operated stations can describe regional trends but miss street-level differences near ports, warehouses, roads, construction sites, or industrial boundaries. A denser network can reveal spatial variation, but it introduces new choices: whether to prioritize population coverage, suspected hotspots, vulnerable institutions, scientific representativeness, or politically vocal neighborhoods.

Three deployment models allocate authority differently.

In a **municipally planned network**, city staff or contractors select sites using technical and policy criteria. This can provide consistent coverage and integration with existing infrastructure, but residents may have limited influence over which local concerns receive attention.

In a **community-hosted network**, residents or civic organizations help select locations and may maintain devices or interpret results. This brings lived knowledge into network design: residents often know when truck queues form, which playground lies downwind, or when odors occur. Yet participation can reproduce inequalities if affluent neighborhoods have more volunteer time, technical expertise, stable internet access, or secure mounting locations.

A **hybrid network** combines reference stations, publicly funded sensors, and community-selected sites. London illustrates this model. Its public dashboard integrates high-accuracy stations owned and operated by boroughs, Breathe London sensors, community-network sensors, and diffusion-tube data ([Greater London Authority](https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/monitoring-and-predicting-air-pollution)). The Greater London Authority directly funded an initial 136 sensors at locations intended to serve groups such as schoolchildren, patients, and older people; it also reported that 60 sensors were supplied to community groups through a partnership involving the mayor, Bloomberg Philanthropies, and Imperial College London ([GLA decision MD3217](https://www.london.gov.uk/who-we-are/governance-and-spending/promoting-good-governance/decision-making/decisions/md3217-breathe-london-network-continuation)).

This arrangement broadens who can nominate places for observation, but it does not erase institutional hierarchy. Community groups can produce local evidence and campaign with it, while public authorities retain statutory powers, contracting authority, and control over many policy responses. Measurement participation is therefore not identical to shared decision-making.

## Who pays—and what the payment buys

Financing determines whether monitoring is a temporary demonstration, a commercial service, or durable public infrastructure.

Municipal funding can pay for equipment while also purchasing continuity, staff expertise, quality assurance, and public access. In February 2024, the Mayor of London approved up to £800,000 in revenue expenditure over four financial years and £600,000 in capital expenditure over three years for continuation and expansion of Breathe London. The decision also authorized procurement of a service provider to operate and grow the system ([GLA decision MD3217](https://www.london.gov.uk/who-we-are/governance-and-spending/promoting-good-governance/decision-making/decisions/md3217-breathe-london-network-continuation)). The same document assigned capital funding to sensor replacement and additional equipment, while revenue funding supported continuing operation; it noted that future budgets remained subject to formal approval and contemplated contract break clauses if resources were insufficient.

That distinction matters. A capital grant may buy devices, but it does not automatically finance four years of connectivity, calibration, repair, community engagement, interpretation, and data hosting. Programs that advertise only the unit price of hardware risk hiding the continuing labor and infrastructure needed to make readings useful.

Philanthropic money can lower barriers for communities and allow experimentation. London’s community component used outside philanthropic support to offer equipment to groups that might not otherwise afford it ([GLA decision MD3217](https://www.london.gov.uk/who-we-are/governance-and-spending/promoting-good-governance/decision-making/decisions/md3217-breathe-london-network-continuation)). The benefit is wider access; the risk is dependence on time-limited funding whose priorities are not set through municipal elections or permanent public budgets.

Vendor financing and service contracts solve different problems. A city may avoid building its own platform by buying a managed service that bundles hardware, communications, dashboards, maintenance, and analysis. This can accelerate deployment, but contractual design becomes part of data governance. Important questions include:

- Does the city own the raw and corrected measurements?
- Can residents download complete historical data through an open format or application programming interface?
- Is the correction algorithm documented?
- Can the city move the archive to a different provider?
- Who pays when communications fail or sensors drift?
- May the vendor reuse measurements commercially?
- What performance, uptime, accessibility, and retention obligations survive the initial contract?

The EPA guide explicitly advises purchasers to determine how data are processed and stored, who can access them, who owns them, and how long they remain available. It also notes that network communications may create subscription costs and that publishing a precise address can create privacy concerns ([EPA, *Enhanced Air Sensor Guidebook*](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1017AWL.TXT)). A seemingly technical purchasing decision can therefore shift long-term control from a public institution to a proprietary platform.

## Governance: participation, authority, and accountability

Governance answers four distinct questions:

1. Who sets the monitoring question?
2. Who controls data and quality standards?
3. Who interprets the findings?
4. Who has authority and resources to act?

A public dashboard addresses access but not all four questions. Open data can allow independent analysis, journalism, teaching, and community advocacy. Yet openness does not guarantee intelligibility: a downloadable file without metadata, uncertainty estimates, siting information, correction history, or technical support may remain practically inaccessible.

California’s Community Air Protection Program offers a more formal example of participatory governance. Established in response to Assembly Bill 617, it uses a process in which communities can be nominated, the California Air Resources Board considers selections, local air districts form community steering committees, and districts and committees co-develop monitoring or emissions-reduction programs. CARB also provides grants for technical assistance, monitoring, and capacity building, while air districts distribute incentive funding for projects ([CARB, “AB 617 Community Air Protection Program Fact Sheet”](https://ww2.arb.ca.gov/sites/default/files/2025-09/Community_Air_Protection_Program_by_the_Numbers_2025.pdf)).

This is more consequential than inviting comments on a completed sensor map: it creates an institutional place for residents in plan development. Nevertheless, authority remains distributed rather than equal. CARB selects communities, air districts administer plans and funds, steering committees contribute priorities and knowledge, and regulated entities or local governments may control many of the emissions sources. “Community-centered” consequently should not be interpreted as complete community control.

CARB’s monitoring guidance says program plans should identify the community-specific purpose, define objectives and roles, establish data-quality goals, choose methods and equipment, specify quality-control procedures, manage data, interpret results, communicate findings, and connect monitoring to action ([CARB, “Community Air Monitoring Plan Guidance”](https://ww2.arb.ca.gov/our-work/programs/community-air-protection-program/community-air-monitoring/community-air)). That structure links technical decisions to accountability: if roles and intended actions are not specified at the beginning, agencies can later disagree about whether a signal was sufficiently reliable or relevant to justify intervention.

Compensation also affects whose voice is heard. CARB issued guidance allowing stipends for community steering-committee participation; its guidance recorded that, as of May 2020, committees already paying stipends through local districts provided at least $75 ([CARB, “Guidance to California Air Districts on Stipends”](https://ww2.arb.ca.gov/sites/default/files/2023-09/Community%20Air%20Protection%20Program_Final%20Guidance_Stipends.pdf)). Paying residents does not eliminate power imbalances, but it recognizes that attending meetings, reviewing technical material, and representing neighbors require labor. An unpaid participation system transfers part of a publicly valuable monitoring program’s cost onto community members.

## Worked example: evaluating a proposed neighborhood network

Consider a hypothetical city proposing 100 PM2.5 sensors for five years. The hardware costs $900 per unit. Annual connectivity, hosting, maintenance, and quality assurance cost $450 per sensor. The city also budgets $120,000 for community planning and technical support.

The visible hardware cost is

\[
100 \times \$900=\$90{,}000.
\]

The five-year operating cost is

\[
100 \times \$450 \times 5=\$225{,}000.
\]

Adding participation and technical support gives

\[
\$90{,}000+\$225{,}000+\$120{,}000=\$435{,}000.
\]

Thus, hardware represents only about

\[
\frac{\$90{,}000}{\$435{,}000}\times100\approx20.7\%
\]

of the stated program budget. This fictional calculation illustrates why comparing projects only by sensor price is misleading. It does not estimate the cost of London, California, or any particular real network.

Now suppose the city proposes placing 80 sensors according to a uniform geographic grid and lets communities select 20 sites. That sounds participatory, but a governance audit asks more:

| Question | Arrangement A | Arrangement B |
|---|---|---|
| Site selection | Residents suggest 20 sites | A community–agency committee allocates all 100 using exposure and coverage criteria |
| Raw data | Vendor-only storage | City archive plus public download |
| Corrections | Proprietary algorithm | Documented method with retained raw values |
| Validation | Initial factory test | Initial and periodic collocation |
| Community labor | Unpaid meetings | Stipends and technical assistance |
| Action rule | No commitment | Agency review triggered by a defined, quality-checked pattern |
| Contract exit | Data remain on vendor platform | Export and transfer requirements |

Arrangement B distributes more informational and procedural power to the public, although the municipality or regulator still retains legal authority. Its safeguards also cost money. The comparison reveals the central lesson: equity cannot be inferred from sensor density alone.

A reasonable evaluation would separate three levels of claim:

- **Observation:** A corrected sensor recorded elevated PM2.5 at particular times and places.
- **Interpretation:** The pattern is consistent with a nearby source or activity, considering wind, reference measurements, and other contextual data.
- **Decision:** An authorized institution will investigate, enforce a rule, alter traffic operations, fund mitigation, or explain why it will not act.

The sensor directly supports only the first level. Source attribution usually requires additional evidence, and action requires institutional authority.

## Benefits and their unequal distribution

Municipalities gain finer spatial information, a way to evaluate interventions, and a public-facing account of local conditions. Public health agencies may gain evidence for targeting communication, exposure-reduction programs, or further investigation. Researchers gain observations at spatial and temporal resolutions that sparse reference networks may not provide. Vendors gain sales, service revenue, operational data, and potentially a position as an indispensable intermediary.

Communities may gain the ability to make previously invisible patterns publicly legible. But they also bear costs: hosting equipment, supplying electricity or internet access, attending meetings, interpreting ambiguous results, protecting location privacy, and campaigning for action. If agencies treat community measurements as inadequate while declining to conduct higher-grade monitoring, participation can produce information without remedy.

Environmental justice therefore has at least three dimensions:

- **Distributional justice:** Are monitors and pollution-reduction resources directed toward communities carrying high exposure burdens?
- **Procedural justice:** Can affected residents shape questions, sites, budgets, interpretations, and responses?
- **Epistemic justice:** Is local knowledge treated as relevant evidence, and are residents given access to the expertise needed to contest official or vendor interpretations?

London’s official decision documents state that priority locations include schools, hospitals, deprived areas, and communities facing poor air quality, while California’s program formally connects community steering, technical assistance, monitoring, and emissions-reduction planning ([GLA decision MD3217](https://www.london.gov.uk/who-we-are/governance-and-spending/promoting-good-governance/decision-making/decisions/md3217-breathe-london-network-continuation); [CARB fact sheet](https://ww2.arb.ca.gov/sites/default/files/2025-09/Community_Air_Protection_Program_by_the_Numbers_2025.pdf)). These are documented program designs and public commitments. They should not be treated, without independent outcome evaluation, as proof that benefits were equally distributed or that pollution was reduced.

## Limits of the evidence

The selected sources establish how public agencies describe sensor performance, financing, and governance. They do not by themselves prove that any specific network caused better health outcomes. The EPA materials are technical guidance rather than controlled trials. The London decision is an official authorization and rationale, not an independent impact evaluation. CARB’s documents describe institutional requirements and reported program structure, not a complete assessment of whose preferences ultimately prevailed.

Nor can local sensor readings automatically establish an individual’s clinical risk or identify the source responsible for a pollution episode. Those stronger conclusions may require validated exposure models, source-apportionment work, epidemiological evidence, or regulatory investigation. Air-quality information can support public health decisions, but it is not individualized medical guidance.

There is also a selection problem: official sources are strongest for explaining formal rules and public expenditures, but the institutions publishing them have an interest in presenting their programs as useful. A fuller evaluation would add independent audits, community-authored assessments, contract documents, outcome data, and before-and-after pollution analyses.

## Conclusion

Urban air-quality networks distribute more than sensors. Municipal budgets determine whether equipment becomes lasting infrastructure. Procurement contracts determine whether public institutions retain data and technical independence. Quality-assurance practices determine which observations acquire official credibility. Site-selection rules determine whose exposure becomes visible. Community stipends and technical assistance determine who can realistically participate. Public health and regulatory agencies determine whether information produces advice, investigation, enforcement, investment, or no action.

A well-governed network therefore needs more than many inexpensive devices. It needs a clearly stated purpose, appropriate instruments, documented calibration and correction, secure preservation of raw observations, open and understandable access, compensated participation where possible, explicit ownership and contract-exit terms, and a defined pathway from credible evidence to accountable decisions.

The central question is not simply, “Who owns the sensor?” It is: **Who can turn a measurement into a claim that institutions must answer?**

## Retrieval question

Why can a dense low-cost sensor network improve neighborhood visibility without replacing regulatory reference monitors?

**How to check:** Compare the EPA’s descriptions of sensor limitations and non-regulatory uses with its definition of collocation, then examine how London integrates lower-cost sensors with reference stations rather than treating the two as interchangeable ([EPA sensor FAQ](https://www.epa.gov/air-sensor-toolbox/frequent-questions-about-air-sensors); [EPA collocation guide](https://www.epa.gov/air-sensor-toolbox/air-sensor-collocation-instruction-guide); [London monitoring overview](https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/monitoring-and-predicting-air-pollution)).

## Transfer exercise

Choose a proposed sensor network in your city—or invent one—and draw the path from sensor signal to public decision. Identify who pays for hardware, recurring operations, community labor, and replacement; who chooses sites; who owns raw and corrected data; how performance is checked; and which agency must respond to a verified hotspot. Then identify one place where power could become concentrated and propose one contractual or institutional safeguard.

**How to check:** Test the proposal against the ownership, access, maintenance, quality-control, privacy, and action questions in the EPA guide; the financing and procurement details in London’s decision; and the shared planning structures in CARB’s monitoring guidance.

## References

- [US Environmental Protection Agency, *Enhanced Air Sensor Guidebook* (2022)](https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P1017AWL.TXT)
- [US Environmental Protection Agency, “Air Sensor Use and Study Design”](https://www.epa.gov/air-sensor-toolbox/air-sensor-use-and-study-design)
- [US Environmental Protection Agency, “Frequent Questions About Air Sensors”](https://www.epa.gov/air-sensor-toolbox/frequent-questions-about-air-sensors)
- [US Environmental Protection Agency, “Air Sensor Collocation Instruction Guide”](https://www.epa.gov/air-sensor-toolbox/air-sensor-collocation-instruction-guide)
- [Greater London Authority, “Monitoring and reporting on air quality”](https://www.london.gov.uk/programmes-and-strategies/environment-and-climate-change/pollution-and-air-quality/monitoring-and-predicting-air-pollution)
- [Greater London Authority, Mayoral Decision MD3217: Breathe London network continuation](https://www.london.gov.uk/who-we-are/governance-and-spending/promoting-good-governance/decision-making/decisions/md3217-breathe-london-network-continuation)
- [California Air Resources Board, “AB 617 Community Air Protection Program Fact Sheet”](https://ww2.arb.ca.gov/sites/default/files/2025-09/Community_Air_Protection_Program_by_the_Numbers_2025.pdf)
- [California Air Resources Board, “Community Air Monitoring Plan Guidance”](https://ww2.arb.ca.gov/our-work/programs/community-air-protection-program/community-air-monitoring/community-air)
- [California Air Resources Board, “Guidance to California Air Districts on Stipends for Community Steering Committee Members”](https://ww2.arb.ca.gov/sites/default/files/2023-09/Community%20Air%20Protection%20Program_Final%20Guidance_Stipends.pdf)
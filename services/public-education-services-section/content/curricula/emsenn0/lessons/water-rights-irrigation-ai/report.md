# Water Rights and AI: Who Owns the Flow?

## Introduction

Artificial intelligence does not own water. Neither does an irrigation algorithm, a data-center operator, or—usually—an individual farmer in the ordinary sense of owning a physical stock of water. What these actors may possess are legally defined rights, permits, contracts, or utility entitlements to divert, pump, receive, and use water under specified conditions. AI enters this system as a control technology: it can change when, where, and how efficiently water is consumed, but it does not by itself rewrite the underlying allocation rules.

That distinction is central to understanding who retains access during scarcity. Historical water law establishes priorities among users. Infrastructure determines which legally recognized rights can actually be exercised. Markets, contracts, and public subsidies determine who can afford that infrastructure. AI then operates within—and sometimes intensifies—those arrangements. A highly optimized farm may still be curtailed if its water right is junior. A water-efficient data center may still impose substantial local demand if its computing load is enormous. A Tribal nation may hold a senior reserved right yet lack the pipelines, treatment facilities, or quantified settlement needed to put that right to use.

This report concentrates primarily on the United States, especially the arid West, because its mixture of prior-appropriation law, federal reserved rights, interstate allocations, irrigation districts, groundwater regulation, and municipal utilities makes the interaction unusually visible. Examples from India and international water accounting are used to evaluate claims about AI-assisted irrigation. The central finding is that technical efficiency matters, but legal priority, physical access, scale, and control over data often matter more. Scarcity costs fall on whoever lacks a protected entitlement, infrastructure, bargaining power, or political voice—not necessarily on whoever uses water least efficiently.

## Prerequisites: withdrawal, consumption, efficiency, and scarcity

A water **withdrawal** is water removed from a river, reservoir, aquifer, or other source. **Consumption** is the portion not promptly returned to the same local water system because it evaporates, becomes incorporated into crops or products, or otherwise leaves the immediately available supply. The distinction is consequential. A cooling system may withdraw a large volume and return much of it, while an evaporative tower may withdraw less but consume a larger fraction. Irrigation runoff or deep percolation may appear to be a “loss” from one farm while supplying downstream users or recharging groundwater.

A simplified basin accounting identity is

\[
W = C + R + \Delta S,
\]

where \(W\) is withdrawal, \(C\) is consumptive use, \(R\) is recoverable return flow, and \(\Delta S\) represents changes in storage and nonrecoverable losses under the chosen accounting boundary. This is an accounting relationship, not a complete hydrologic model: timing, water quality, location, groundwater connectivity, and ecological requirements all affect whether a nominal return flow is genuinely reusable.

“Efficiency” must therefore specify both its numerator and its spatial boundary. At field scale, application efficiency may be expressed as

\[
\eta_a = \frac{\text{water stored in the crop root zone}}{\text{water delivered to the field}}.
\]

Crop-water productivity may instead mean crop yield divided by evapotranspiration or by water applied. A system can improve either measure without increasing the water available to other people. The UN Food and Agriculture Organization’s guidance defines real savings in terms of reduced consumption and reduced nonrecoverable flows, warning that apparent field-level savings usually cannot simply be treated as new water available elsewhere in a basin ([FAO, *Guidance on Realizing Real Water Savings with Crop Water Productivity Interventions*](https://openknowledge.fao.org/3/cb3844en/cb3844en.pdf)).

Scarcity is likewise relational. A shortage occurs not merely because rainfall is low but because available supply is insufficient for the legally recognized, physically deliverable, and politically accepted demands placed on it. Two communities exposed to the same drought can experience very different outcomes if one holds senior rights and storage capacity while the other relies on a shallow well or interruptible municipal service.

## The legal inheritance: rights to use, not simple ownership

### Riparian and prior-appropriation systems

In much of the eastern United States, surface-water rights developed from the riparian doctrine: ownership of land adjoining a watercourse carries a right to make reasonable use, subject to the comparable rights of other riparian owners. In much of the West, scarcity and mining and irrigation practices produced prior appropriation. Under that doctrine, the state generally treats water as a public resource while recognizing an appropriator’s right to use a defined quantity for a beneficial purpose. Priority commonly follows “first in time, first in right”: during shortage, senior rights are satisfied before junior rights.

The Bureau of Reclamation describes appropriation as acquiring a water right for beneficial use through a prescribed legal procedure, rather than acquiring unrestricted ownership of the water itself ([Bureau of Reclamation glossary](https://www.usbr.gov/library/glossary/)). Reclamation’s historical legal materials also emphasize that prior appropriation does not confer a right to waste water: the protected quantity is constrained by beneficial use and reasonable economy under prevailing conditions ([Bureau of Reclamation, *Federal Reclamation and Related Laws Annotated*](https://usbr.gov/lc/region/programs/contracts/Legislation.pdf)).

This creates both security and rigidity. A senior farmer may retain access before a newer industrial facility, but the outcome depends on the data center’s source. A facility connected to a municipal system may receive water under city ordinances and service contracts rather than holding a direct river appropriation. Its city may possess senior rights, stored water, groundwater authority, or imported supplies. The practical contest is therefore not necessarily “farm right versus data-center right.” It may be a contest among an irrigation district, a municipality, rural wells, ecosystems protected by public law, and users located elsewhere on an interconnected electrical grid.

Groundwater adds another layer. States use differing doctrines and permitting systems, and hydrologically connected groundwater and surface water have not always been administered together. Pumping can therefore diminish river flow or neighboring wells even when the relevant legal categories treat the sources separately. AI can optimize a pump’s schedule, but it cannot correct a legal accounting system that ignores the pump’s effect on a connected stream.

### Federal and Tribal reserved rights

Federal reserved rights complicate state priority systems. When the United States reserves land for a federal purpose, water needed to fulfill that purpose may be implicitly reserved. In the Tribal context, the principle is associated with *Winters v. United States* (1908). The Department of the Interior explains that Tribal reserved rights generally carry a priority no later than the reservation’s creation, may in some circumstances have an aboriginal or “time immemorial” priority, and are not lost merely through nonuse ([Department of the Interior briefing on Indian water rights](https://www.doi.gov/sites/doi.gov/files/uploads/doi_transition_briefing_book.pdf)).

Legal seniority, however, is not equivalent to usable water. Rights may remain unquantified; settlements and general stream adjudications may take years; and communities need wells, pipes, treatment systems, power, and operating funds. Interior’s testimony concerning the Fort Belknap Indian Community illustrates the gap: despite the Tribes’ victory in *Winters*, the department stated that they had not been able fully to put their reserved rights to use ([Department of the Interior testimony on S. 1987](https://www.doi.gov/ocl/s-1987)).

The Supreme Court’s 2023 decision in *Arizona v. Navajo Nation* sharpened this distinction. The majority held that the 1868 treaty reserved water needed to accomplish the Navajo Reservation’s purpose, but did not impose an affirmative duty on the United States to assess the Nation’s needs, formulate a plan, or build infrastructure to secure that water ([Supreme Court opinion in *Arizona v. Navajo Nation*](https://www.supremecourt.gov/opinions/22pdf/21-1484_aplc.pdf?cid=eml_dl)). The decision did not erase Navajo reserved rights; it rejected the particular claimed federal duty. For this report’s question, the lesson is crucial: one party can possess a legally recognized claim while another party, through earlier infrastructure investment or a municipal contract, enjoys more water in practice.

### Interstate allocations and public administration

Rivers crossing state boundaries may also be governed by interstate compacts, federal statutes, treaties, court decrees, and reservoir operating rules. These instruments allocate legal entitlements before any AI system decides whether to irrigate a particular field or cool a particular server rack. A technically optimal decision at one site can therefore be unlawful, impossible, or harmful at the larger scale if it disregards compact deliveries, downstream senior rights, environmental requirements, or reservoir constraints.

“Who owns the flow?” is consequently the wrong question if it implies one universal owner. The more useful questions are:

1. Who has authority to authorize a withdrawal?
2. Who has priority during shortage?
3. Who controls storage and delivery infrastructure?
4. Who pays the capital and operating costs?
5. Who receives or loses return flows?
6. Who can observe and challenge the allocation decision?

## Irrigation’s scale and the promise of AI

Irrigation is already a dominant component of U.S. freshwater use. The U.S. Geological Survey estimated that irrigation withdrew 118 billion gallons per day in 2015, all freshwater. That was 42% of total U.S. freshwater withdrawals; estimated irrigation consumption was 73.2 billion gallons per day, or about 62% of irrigation withdrawals and reclaimed wastewater counted in the study ([USGS, *Estimated Use of Water in the United States in 2015*](https://pubs.usgs.gov/publication/cir1441)). Those figures are national estimates for 2015, not present-day measurements of every basin, but they establish why even modest percentage changes in agricultural water use attract attention.

AI-assisted irrigation is not one technology. A typical system may combine soil-moisture probes, weather observations, satellite or drone imagery, crop models, forecasts, pump and valve controls, and a statistical or machine-learning model. The system can perform at least four different tasks:

- classify whether irrigation is presently needed;
- estimate how much water to apply;
- forecast soil moisture or crop stress;
- allocate limited water among fields, crop zones, or dates.

These mechanisms can reduce overwatering caused by fixed calendars or incomplete observation. They can also detect spatial variability that a farmer cannot continuously inspect. Yet a high model-accuracy score is not itself evidence of water savings. A study must compare actual water delivery or consumption against an appropriate baseline while checking yield, crop quality, weather, and soil conditions.

A 2026 field study in Ponneri taluk, Tamil Nadu, offers a useful but limited example. Its prototype measured soil moisture and weather-related variables, used an isolation forest to screen anomalies, and used XGBoost models to decide whether to irrigate and to estimate pump duration. Over a 90-day dry-season deployment on one smallholder plot, the authors reported 3,395 liters used by the two-stage system versus 5,230 liters under a fixed-schedule manual baseline—a 35.1% reduction ([Frontiers study, “Sustainable agriculture through IoT-driven smart irrigation with explainable AI”](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2026.1847041/full)).

That result is evidence that the prototype outperformed its selected baseline at that site; it is not evidence that all AI irrigation saves 35.1%. The same paper identifies one plot, one 90-day season, red loamy soil, particular crop rotations, sensor drift, rainfall-gauge maintenance, and possible seasonal errors in reference-evapotranspiration estimation as limitations. The authors explicitly describe the deployment as a first validation rather than a general proof ([Frontiers study limitations and deployment details](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2026.1847041/full)).

Adoption is also uneven. USDA survey research found that, through 2019, technologies such as yield maps, soil maps, and variable-rate application appeared on only 5–25% of planted acreage for several major crops, while automated guidance exceeded 50% for several crops ([USDA Economic Research Service, *Precision Agriculture in the Digital Era*](https://www.ers.usda.gov/publications/105893)). These categories are not identical to AI irrigation, but the pattern cautions against imagining an instantaneous technological transformation. Capital cost, connectivity, technical support, sensor maintenance, farm size, and confidence in vendor systems affect who can participate.

## Why farm efficiency may not create water for others

Suppose a farmer formerly diverted 100 units, of which 60 were consumed and 40 returned to the river or aquifer. A more precise system might allow the farm to divert 75 units while still consuming 60. The farmer’s withdrawal falls by 25, but basin consumption does not change; return flow falls from 40 to 15. If downstream rights depended on the former return flow, the apparent saving is not entirely available for reassignment.

A rebound can be stronger. Greater precision may make a water-intensive crop more profitable, extend irrigation to additional acreage, or enable more production with the same legal entitlement. If consumption rises from 60 to 70 units, the technology has improved farm-level productivity while worsening basin depletion. Research using global water accounting has found that increases in beneficial crop consumption can offset regional savings associated with water-saving irrigation, illustrating why field efficiency and regional availability can move in opposite directions ([Jägermeyr and colleagues’ global irrigation analysis](https://www.sciencedirect.com/science/article/pii/S0378377421000585)).

Water law influences the rebound. Where conserving water risks reducing a right defined by historical beneficial use, users may perceive a reason to keep applying their full entitlement. Where saved water can be leased, banked, or legally dedicated to environmental flows without forfeiting the underlying right, conservation has a clearer beneficiary. Effective policy must therefore identify the disposition of conserved water before subsidizing equipment. Otherwise public funds may buy higher farm output rather than additional water for communities or ecosystems.

AI also redistributes informational power. A platform that measures soil conditions and controls pumps produces valuable records about actual water use. Those data can help verify conservation, administer a drought plan, or document a farmer’s compliance. They can also expose the farmer to enforcement, vendor lock-in, cybersecurity risks, or unilateral model changes. If large farms can afford calibrated sensors and legal assistance while small farms cannot, digital verification can make the better-resourced users’ claims easier to prove. The allocation hierarchy then becomes partly a data hierarchy.

## AI computation and data-center cooling

AI has a second relationship to water: training and serving computational models require data centers, and servers produce heat that must be removed. Cooling may use refrigeration, outside air, liquid circulated near processors, evaporative systems, or combinations of these methods. “Liquid cooling” does not automatically mean that coolant is continually consumed; the decisive question is how the facility ultimately rejects heat to the environment.

Two standard metrics clarify the mechanism:

\[
\mathrm{PUE} =
\frac{\text{total facility electricity}}
{\text{IT-equipment electricity}},
\]

and

\[
\mathrm{WUE}_{site} =
\frac{\text{on-site water consumed}}
{\text{IT-equipment electricity}},
\]

usually reported in liters per kilowatt-hour. Lawrence Berkeley National Laboratory distinguishes site WUE from source WUE, which accounts for water consumed in generating electricity. Its definitions and simulations show that climate, cooling design, operating practice, and facility type all affect the result ([LBNL, *2024 United States Data Center Energy Usage Report*](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)).

The trade-off is physical rather than merely managerial. Evaporating water can reject heat with less electricity than fully air-cooled refrigeration under many conditions. An air-cooled design may therefore lower on-site water consumption but increase electricity demand—and potentially increase water consumption at power plants. LBNL consequently warns that low site WUE is not necessarily preferable if it comes with higher source water use; both boundaries must be examined ([LBNL discussion of cooling trade-offs](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)).

LBNL estimated that U.S. data centers used 176 terawatt-hours of electricity in 2023, 4.4% of national electricity consumption. Its modeled scenarios project 325–580 TWh in 2028, or 6.7–12.0% of forecast U.S. consumption, with the wide range reflecting uncertainty about accelerator shipments, operational practices, and cooling ([LBNL 2024 report](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)). These are sector-wide estimates and scenarios, not measurements attributable solely to generative AI.

For direct water consumption, the report estimates 66 billion liters in 2023, with hyperscale and colocation facilities accounting for 84%. It projects 60–124 billion liters for hyperscale facilities alone in 2028 ([LBNL water-impact estimates](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)). Indirect consumption was much larger in the model: nearly 800 billion liters associated with 2023 electricity use, averaging 4.52 L/kWh. LBNL cautions that this indirect estimate assigns facilities their regional grid mix and does not incorporate facility-specific power-purchase agreements or behind-the-meter generation, so it should not be read as a precise operational account for an individual company ([LBNL indirect-water methodology and limitation](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)).

National totals can nevertheless conceal local severity. Sixty-six billion liters spread across the country is a different problem from a large peak demand placed on one municipal system during a hot, dry week. Conversely, a dramatic facility-level number may not indicate serious scarcity if it comes from reclaimed water in a water-abundant basin with ample treatment and delivery capacity. Meaningful evaluation requires at least the source, timing, consumptive fraction, water quality, local hydrology, competing uses, and legal priority.

## How the two AI systems meet the same legal order

AI irrigation and AI data centers appear to occupy opposite sides of a ledger: one promises to save water, while the other creates demand. In law and political economy, however, they interact through several channels.

First, they may depend on different entitlements. A farmer can hold a direct appropriation or receive district water, while a data center purchases treated water from a municipality. Curtailing the farm would not automatically increase the city’s legal supply unless the conserved water could be transferred, stored, or left instream under applicable rules.

Second, location transfers impacts. A cloud service used to optimize irrigation in one basin may run in a data center whose direct cooling water is consumed in another. Its electricity may impose still more water consumption at generating plants across a balancing area. A claim that “AI saved water” is incomplete unless its accounting boundary says whether computational infrastructure is included. The data-center footprint will usually be small relative to the water managed by a large irrigation system, but that cannot be assumed for every application or every locality.

Third, optimization objectives encode institutional choices. A model can maximize crop revenue, yield, water productivity, utility reliability, computing output, ecological flow, or some weighted combination. It cannot determine from hydrology alone how much weight a household, a Tribal right, a senior irrigator, a wetland, or a data center should receive. Those are questions of law and public judgment.

Fourth, scarcity costs can be displaced. A municipal utility may finance treatment plants, wells, storage, and transmission sized partly for a major industrial customer. Whether the customer pays the incremental cost depends on connection charges, rate design, tax concessions, minimum-purchase contracts, and who bears the risk if demand projections fail. Farmers may bear costs through curtailed junior rights, deeper pumping, or the purchase of monitoring equipment. Households may bear them through rates or deteriorating wells. Ecosystems often bear costs when their water requirements lack enforceable priority. None of these distributions follows automatically from technical efficiency.

## A framework for fairer decisions

A defensible governance process should evaluate rights, hydrology, technology, and finance together.

**Account for water at basin scale.** Report withdrawal and consumption separately, identify return flows, and disclose monthly or seasonal peaks. For data centers, publish both site and electricity-related water estimates with their assumptions. For irrigation projects, verify whether reduced diversions produce reduced depletion.

**Protect conserved water explicitly.** An irrigation subsidy should specify whether savings remain with the farmer, can support additional acreage, become transferable credits, recharge an aquifer, or remain instream. Without a legal destination, a modeled saving is only a technical possibility.

**Tie new demand to shortage rules.** Large facilities should know before construction whether their service is firm or interruptible, what drought stage triggers curtailment, and whether essential household supplies and senior or reserved rights take precedence. This reduces the temptation to resolve scarcity through emergency political bargaining.

**Use marginal-cost and risk-based finance.** Charges can be designed so that a large new user funds the capacity, treatment, and resilience investments it necessitates. Contracts should also assign the risk of stranded infrastructure if projected computing demand fails to materialize.

**Require auditable models without mistaking transparency for neutrality.** Irrigation recommendations should expose relevant inputs, confidence ranges, failure modes, and override procedures. Water-allocation models should disclose objective functions and priority rules. Explainable output helps scrutiny, but an interpretable model can still implement an inequitable policy.

**Support practical access to rights.** Legal recognition without measurement, infrastructure, or administrative capacity is incomplete. Tribal settlements, small-farm assistance, rural well monitoring, and public technical expertise are not peripheral to AI governance; they determine whose claims enter the optimization system as enforceable constraints.

## Evidence gaps and conclusion

The evidence supports several established findings. Irrigation is a major component of U.S. freshwater withdrawal and consumption. Field-scale precision can reduce water applied relative to fixed schedules. Those reductions do not necessarily become basin-scale savings because return flows, expansion, and crop consumption matter. Data centers consume water both directly and through electricity, and cooling designs trade on-site water against energy in ways that depend heavily on climate and grid composition. Historical rights and infrastructure shape access before an algorithm begins optimizing.

Greater uncertainty surrounds the magnitude and distribution of future effects. Public facility-level data remain incomplete; national data-center estimates depend partly on market information and modeled operation; AI-specific demand is difficult to separate from conventional computing; and short, single-site irrigation trials do not establish performance across crops, climates, or institutions. Claims that AI will either solve agricultural scarcity or overwhelm water supplies everywhere go beyond the inspected evidence.

The answer to “who owns the flow?” is therefore institutional. During scarcity, access tends to remain with actors whose rights are senior or legally protected, whose contracts are firm, whose infrastructure can deliver water, and whose records make their claims administratively legible. Costs tend to fall on junior, unquantified, poorly connected, or politically weak users—and on ecosystems when their needs are not protected. AI can reduce waste and make trade-offs more visible, but it can also enlarge demand, suppress return flows, and give an appearance of scientific inevitability to choices made by law and politics.

The governing question should not be whether an AI system is efficient in isolation. It should be whether the whole arrangement reduces consumptive pressure at the relevant scale, preserves enforceable access for vulnerable users, assigns infrastructure and shortage costs transparently, and permits affected communities to contest the objectives being optimized.

## References

- [Lawrence Berkeley National Laboratory, *2024 United States Data Center Energy Usage Report*](https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf?stream=top)
- [U.S. Geological Survey, *Estimated Use of Water in the United States in 2015*](https://pubs.usgs.gov/publication/cir1441)
- [U.S. Supreme Court, *Arizona v. Navajo Nation* (2023)](https://www.supremecourt.gov/opinions/22pdf/21-1484_aplc.pdf?cid=eml_dl)
- [U.S. Department of the Interior, Indian water-rights briefing](https://www.doi.gov/sites/doi.gov/files/uploads/doi_transition_briefing_book.pdf)
- [FAO, *Guidance on Realizing Real Water Savings with Crop Water Productivity Interventions*](https://openknowledge.fao.org/3/cb3844en/cb3844en.pdf)
- [Frontiers, “Sustainable agriculture through IoT-driven smart irrigation with explainable AI”](https://www.frontiersin.org/journals/sustainable-food-systems/articles/10.3389/fsufs.2026.1847041/full)
- [USDA Economic Research Service, *Precision Agriculture in the Digital Era*](https://www.ers.usda.gov/publications/105893)
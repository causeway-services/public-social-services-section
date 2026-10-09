# Satellite Mega-Constellations: Who Controls the Sky and Who Pays for Space Debris?

## Introduction

A satellite mega-constellation is a coordinated fleet—usually hundreds or thousands of similar spacecraft—placed in complementary orbits and operated as one system. The most prominent contemporary examples provide broadband communications, although large constellations can also perform Earth observation, navigation, weather monitoring, or military sensing. Falling launch costs, standardized spacecraft, rideshare missions, and mass production have made such fleets technically and financially possible. In 2025 alone, more than 300 launches placed over 4,000 payloads into orbit, according to the [European Space Agency’s 2026 Space Environment Report](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2026).

These systems can extend communications to ships, aircraft, disaster zones, and places where terrestrial infrastructure is costly. Their expansion nevertheless raises a distributional question that engineering alone cannot answer: who receives the services and revenue, and who absorbs collision hazards, astronomy losses, atmospheric uncertainties, regulatory expenses, and the diminished future usability of orbital space?

The phrase “owning an orbital slot” can be misleading. Low-Earth-orbit, or LEO, operators generally do not acquire a parcel of outer space comparable to private land. Instead, control emerges from a bundle of advantages: national authorization, internationally recognized frequency assignments, operating licenses, deployed hardware, coordination capacity, capital, launch access, and the practical ability to occupy useful orbital shells. International law rejects national appropriation of outer space, yet it allows ownership of spacecraft and gives the state of registry continuing jurisdiction and control over them. Thus, no firm legally owns a shell at 550 kilometres, but a well-financed operator with thousands of licensed spacecraft can obtain powerful *de facto* control over how that shell and associated radio spectrum are used.

The result is a coupled social, technical, and economic system. Satellite design determines congestion and disposal risks; financing determines which precautions appear affordable; regulation assigns rights and duties unevenly; and the benefits and external costs fall on different groups.

## 1. Technical prerequisites: why orbital design governs risk

An orbit is persistent motion, not a fixed parking place. For a simplified circular orbit,

\[
v=\sqrt{\frac{\mu}{r}}, \qquad
T=2\pi\sqrt{\frac{r^3}{\mu}},
\]

where \(v\) is orbital speed, \(T\) is orbital period, \(r\) is distance from Earth’s centre, and \(\mu=GM\) is Earth’s standard gravitational parameter. A satellite at roughly 550 kilometres altitude travels at about 7.6 kilometres per second and circles Earth in approximately 95½ minutes. Satellites in intersecting orbital planes can approach one another at much higher relative velocities. The U.S. Government Accountability Office reports that LEO objects commonly move at 6.9–7.9 kilometres per second, while average relative impact speed is about 10 kilometres per second and can reach roughly 15 kilometres per second; at such speeds, even small fragments can damage a spacecraft ([GAO, *Large Constellations of Satellites*](https://www.gao.gov/assets/gao-22-105166.pdf)).

A constellation designer chooses altitude, inclination, number of orbital planes, satellites per plane, propulsion, redundancy, communication frequencies, and spacecraft lifetime. Each choice redistributes costs and risks.

### Altitude

Lower altitudes usually offer lower signal latency and stronger atmospheric drag. Drag makes failed satellites decay more quickly, but also requires operational satellites to expend propulsion or use other methods to maintain altitude. Higher LEO shells may need less station-keeping but can retain failed spacecraft and fragments for much longer.

This makes altitude a governance decision disguised as a technical parameter. A satellite deliberately operated low enough to decay promptly after failure imposes less persistent risk on future operators, but its owner may face shorter service life or greater propellant and replacement costs. Operating higher can improve private economics while transferring long-duration collision risk to others.

### Scale and redundancy

A large fleet can tolerate individual spacecraft failures: service may continue because traffic is routed through other satellites. Society’s tolerance for those failures should not automatically be the same. A failed satellite remains a massive uncontrolled object even when it is commercially irrelevant to its owner.

Scale also alters traffic management. In heavily populated shells, every operator must repeatedly screen predicted trajectories, assess conjunction warnings, communicate with neighbours, and sometimes manoeuvre. These are real operating costs in staff time, computing, propellant, interrupted observations, and shortened spacecraft life. ESA reports that avoidance procedures are increasingly unavoidable in busy LEO regions and that the density of active spacecraft near popular constellation altitudes is now of the same order of magnitude as threatening debris density ([ESA Space Environment Report 2025](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025)).

### Reliability, manoeuvrability, and disposal

Responsible design can include propulsion for collision avoidance and controlled disposal, autonomous fault detection, reliable command links, shielding, redundant subsystems, and “passivation”—removing stored energy by discharging batteries, venting pressurized gases, or depleting residual propellant after use. U.S. government mitigation practices recommend that the integrated probability of debris-generating explosions remain below 0.001 during deployment and operations, and that stored energy be depleted or made safe after mission completion ([U.S. Government Orbital Debris Mitigation Standard Practices](https://orbitaldebris.jsc.nasa.gov/library/usg_orbital_debris_mitigation_standard_practices_november_2019.pdf)).

Those protections add mass, engineering work, tests, and sometimes launch cost. They also conflict with “minimum viable spacecraft” economics, under which operators replace short-lived satellites frequently and value cheap production more than repairability. A rapid replacement cycle can keep consumer hardware current, but it creates a continuous flow of launches and re-entries.

Disposal reliability is especially important. A plan to deorbit every spacecraft is not equivalent to successful disposal if propulsion or communications fail first. Regulators therefore need fleet-level evidence: failure rates, manoeuvre success, fuel margins, and disposal outcomes, not merely a description of intended behaviour.

## 2. The debris environment: established findings and uncertain futures

Space debris includes abandoned spacecraft, rocket bodies, mission-related objects, and fragments from explosions, collisions, or destructive tests. ESA’s statistics updated through July 2026 list about 47,140 regularly tracked objects, approximately 15,900 functioning satellites, more than 1.5 million estimated debris objects between 1 and 10 centimetres, and more than 660 recorded fragmentation events ([ESA Space Environment Statistics](https://sdup.esoc.esa.int/discosweb/statistics/)). Counts below tracking thresholds are model-based estimates rather than direct catalogues, so their precision should not be confused with that of tracked-object counts.

The central mechanism is cumulative. A collision can convert two large objects into many fragments; those fragments raise the probability of later collisions. This feedback is commonly called the Kessler syndrome. It does not mean that all of LEO suddenly becomes an impassable solid barrier. The more defensible claim is that debris growth can progressively make particular altitude and inclination regions riskier and more expensive over decades or centuries. ESA’s models indicate that debris can continue increasing even with no additional launches because collisions among existing objects can create fragments faster than atmospheric drag removes them ([ESA Space Environment Report 2025](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025)).

Mega-constellations affect this environment in two opposing ways. Newer spacecraft are often manoeuvrable, actively tracked, and designed for rapid disposal. At the same time, a vast fleet introduces more physical objects, more conjunctions, and more opportunities for failures. Even a low percentage failure rate can leave a substantial number of dead satellites when multiplied across tens of thousands of units.

Uncertainty remains material. Collision forecasts depend on future launch rates, spacecraft reliability, atmospheric density, solar activity, tracking accuracy, operator behaviour, and the effectiveness of disposal rules. Small debris between about 1 and 10 centimetres is especially problematic: it can be destructive yet difficult to track reliably. Forecasts should therefore be read as conditional scenarios, not exact predictions.

The atmospheric consequences of frequent launches and re-entries are less settled than the basic collision mechanism. Rockets and vaporizing spacecraft inject particles and gases into the upper atmosphere, but observational evidence remains limited and the magnitude of effects on ozone and climate is not yet firmly quantified. GAO consequently classifies upper-atmospheric effects as plausible but poorly understood, while treating the existence of debris and satellite interference with astronomy as much more directly established ([GAO-22-105166](https://www.gao.gov/products/gao-22-105166)).

## 3. What “control of the sky” means in law

### Outer space is not property, but spacecraft are

Article II of the 1967 Outer Space Treaty states that outer space is not subject to national appropriation by sovereignty, use, occupation, or other means. Article VI makes states internationally responsible for national space activities, including private ones, and requires authorization and continuing supervision. Article VIII provides that the state of registry retains jurisdiction and control over a registered object, while ownership of that object is not changed by its presence in space ([UN Office for Outer Space Affairs, Outer Space Treaty](https://www.unoosa.org/oosa/en/ourwork/spacelaw/treaties/outerspacetreaty.html)).

Three conclusions follow:

1. A company does not obtain legal sovereignty over an orbit by deploying satellites there.
2. It continues to own its spacecraft.
3. A national government is the legal gateway through which private operation becomes internationally attributable and supervised.

The Registration Convention adds traceability. A launching state must place a launched space object in an appropriate national registry and inform the UN Secretary-General; when several states qualify as launching states, they jointly determine which will register it ([official text of the Registration Convention](https://digitallibrary.un.org/record/247990/files/A%28092%29_IN4-EN.pdf)). Registration helps connect an object with jurisdiction and potential responsibility, but it does not itself guarantee accurate tracking, compliance, or compensation.

### Frequencies, not orbital real estate

Communication constellations need access to radio spectrum. The International Telecommunication Union coordinates frequency assignments submitted by national administrations, studies compatibility, and records assignments and their regulatory status in the Master International Frequency Register. It does not license companies directly; states file on their behalf. Coordination is intended to prevent harmful interference, not to convey ownership of outer space ([ITU, “Satellite regulation and coordination”](https://www.itu.int/en/mediacentre/backgrounders/Pages/Regulation-of-Satellite-Systems.aspx)).

Nevertheless, earlier filings can create priority advantages. A state and operator with legal specialists, engineering studies, diplomatic reach, and capital can move through filing and coordination processes more effectively than a poorer country or a new entrant. To discourage speculative “warehousing,” ITU Resolution 35 uses staged deployment milestones for covered non-geostationary systems: operators must report initial implementation and later deployment stages rather than preserve enormous filings indefinitely with token activity ([ITU Resolution 35](https://www.itu.int/en/ITU-R/space/Pages/res35main.aspx)).

This does not make access economically equal. Formal non-appropriation coexists with unequal capacity to launch, coordinate interference, maintain global ground infrastructure, and defend regulatory priority. Occupancy becomes path-dependent: the first large systems generate operational experience, customers, revenue, tracking data, and political influence that later entrants cannot easily reproduce.

### National licensing

National regulators govern market access, communications, launch and re-entry safety, and sometimes debris mitigation. The United States Federal Communications Commission, for example, authorized 7,500 second-generation Starlink satellites in 2022 subject to conditions and continuing review, including potential suspension if reliable-disposal targets were not met ([FCC Order 22-91](https://docs.fcc.gov/public/attachments/FCC-22-91A1.pdf)). The FCC also adopted a rule requiring covered spacecraft ending missions in or passing through LEO below 2,000 kilometres to complete disposal as soon as practicable and no later than five years after mission end; it applies to U.S.-licensed systems and foreign systems seeking U.S. market access ([FCC orbital-debris order fact sheet](https://docs.fcc.gov/public/attachments/DOC-387024A1.pdf)).

This illustrates both regulatory power and fragmentation. A major consumer market can impose standards beyond its territory through market-access conditions. But rules vary between jurisdictions, potentially encouraging operators to seek favourable licensing states. International coordination is slow, while unilateral regulation can be undermined if operators relocate filings, launches, or corporate structures.

The UN’s 21 Long-Term Sustainability Guidelines encourage states and international organizations to act on policy, safety, information sharing, capacity-building, and technical practices. They were adopted by consensus in 2019, but implementation is voluntary “to the greatest extent feasible and practicable” ([UNOOSA history of the guidelines](https://lts.unoosa.org/unoosa_lts/en/resources/guidelines/guidelinesabout.html)). They are therefore norms, not a global traffic code backed by a single enforcement authority.

## 4. Liability: who pays after something goes wrong?

The 1972 Liability Convention assigns liability primarily between states. A launching state is absolutely liable for damage caused by its space object on Earth’s surface or to aircraft. For damage elsewhere—such as one spacecraft striking another in orbit—the launching state is liable only when the damage is due to its fault or the fault of persons for whom it is responsible. “Damage” includes death, personal injury, impairment of health, and loss of or damage to property ([UNOOSA, Liability Convention](https://www.unoosa.org/oosa/en/ourwork/spacelaw/treaties/liability-convention.html)).

This framework leaves several gaps:

- In-orbit liability requires proof of fault rather than merely proof that an object caused damage.
- Small fragments may be impossible to attribute conclusively.
- The convention concerns state-to-state claims, not an automatic compensation process through which every affected operator or community can directly recover.
- Diffuse harms—lost astronomical observing time, increased avoidance work, or reduced future orbital capacity—may not fit comfortably within the treaty’s property-centred definition of damage.
- The treaty does not create an international cleanup fund or require every operator to prepay the eventual cost of removing its spacecraft.

Domestic law can shift financial exposure from governments to operators through licensing conditions, indemnification, insurance, or penalties. But the state remains the international legal interface. If a corporation fails or dissolves before its satellites become hazardous, remediation may fall to governments, other operators, or nobody at all.

Active debris removal deepens the ownership problem. Because ownership survives launch and return, an abandoned satellite is not legally ownerless rubbish. Capturing or altering it without consent could interfere with the registry state’s jurisdiction and control. Removal missions therefore require identification, authorization, technical cooperation, and payment—each difficult when the object is old, politically sensitive, or attributable to a defunct enterprise.

## 5. Financing structures and the allocation of costs

Mega-constellations require large up-front expenditure on satellites, launches, ground stations, spectrum coordination, user terminals, software, and replacements. Revenue arrives later through subscriptions, enterprise contracts, government procurement, wholesale capacity, or bundled services. Scale is financially attractive because fixed costs can be spread across many customers, and vertically integrated firms may combine launch, manufacturing, network operation, and terminal sales.

Financing also affects safety incentives. Equity investors can absorb long development periods but may prioritize rapid market capture. Debt increases pressure for predictable cash flow. Government contracts can stabilize demand and support capabilities valuable for defence, disasters, or remote public services. Cross-subsidy from another profitable business can let an operator deploy faster than stand-alone competitors. Conversely, bankruptcy can leave hardware in orbit after the commercial organization responsible for it has disappeared.

The economic problem is an externality. An operator generally pays for its spacecraft, launches, manoeuvres, replacements, and insured losses. It may not pay fully for:

- additional conjunction analysis imposed on every neighbouring operator;
- future debris risk after corporate failure;
- scientific observations spoiled by reflected light or radio transmissions;
- public tracking infrastructure;
- atmospheric monitoring;
- reduced opportunity for later entrants; or
- active removal whose primary benefit accrues to the whole orbital environment.

A 2023 NASA cost-benefit analysis summarized by the OECD estimated annual costs from existing debris to U.S. operators at approximately USD 58 million, mainly borne by military and civilian government missions in LEO. The estimate included conjunction assessment, avoidance manoeuvres, vehicle losses, and interrupted services, but excluded traffic costs caused by other active satellites and omitted much non-market scientific and social value. It should therefore be treated as a bounded estimate, not the total social cost of orbital debris ([OECD, *The Economics of Space Sustainability*](https://www.oecd.org/en/publications/the-economics-of-space-sustainability_b2257346-en/full-report/component-6.html)).

Possible “polluter pays” instruments include mandatory third-party insurance, launch or orbit-use fees, performance bonds, and deposit-refund systems. A disposal bond could be returned after verified deorbiting; a risk-adjusted fee could charge more for long-lived, unreliable, or non-manoeuvrable spacecraft. Tradable permits could cap activity in a congested shell. Public procurement could reward repairability, transparency, and disposal success rather than choosing solely on service price.

None is effortless. Insurance prices may not reflect long-horizon systemic risk. A bond set too low becomes merely a business expense; one set too high can exclude universities and smaller firms. Orbit fees require agreement about how collision risk should be measured. Tradable rights might entrench wealthy incumbents. OECD research therefore treats these as proposals whose design and enforcement remain unsettled, not established solutions ([OECD discussion of fiscal measures](https://www.oecd.org/en/publications/the-economics-of-space-sustainability_b2257346-en/full-report/component-11.html)).

## 6. Benefits and their uneven distribution

The public case for constellations is not imaginary. Satellites can serve moving platforms and sparsely populated regions without building a terrestrial cable to every destination. They can restore links after disasters and provide redundancy when local infrastructure is damaged. Yet potential coverage is not the same as equitable access.

In 2025, the ITU estimated that 6 billion people were online and 2.2 billion remained offline. Internet use reached 94% in high-income countries but only 23% in low-income countries; globally, 85% of urban residents used the Internet compared with 58% of rural residents, and only 14% of rural residents in low-income countries were online. Affordability, devices, skills, and perceived need—not coverage alone—remain major barriers ([ITU, *Facts and Figures 2025*](https://www.itu.int/itu-d/reports/statistics/facts-figures-2025/); [ITU Global Connectivity Report 2025](https://www.itu.int/itu-d/reports/statistics/global-connectivity-report-2025/)).

A constellation may therefore pass over a community without making service affordable to it. Revenue can accrue to an operator headquartered elsewhere; terminals may be imported; subscription prices may be denominated for wealthier markets; and national governments may collect limited tax if corporate structures shift profits across jurisdictions. Benefits depend on local pricing, electricity, equipment, digital skills, public subsidy, regulatory permission, and whether service complements or displaces locally owned infrastructure.

Governments can receive taxes, license fees, strategic communications, military resilience, and domestic industrial employment. They also incur costs for spectrum administration, launch oversight, collision tracking, diplomacy, research, and possible cleanup. Countries without launch capacity may receive connectivity while having little influence over orbital rules. Communities near observatories or culturally important dark-sky landscapes may bear visibility and radio interference costs without sharing proportionately in constellation revenue.

## 7. Astronomy and the sky as a shared environment

Satellites reflect sunlight and transmit radio signals. Optical trails can saturate pixels, create artifacts, complicate automated surveys, and consume observing or processing time. Radio transmissions can overwhelm faint astronomical signals, including through leakage or operation near protected bands.

The impact varies with satellite brightness, altitude, orientation, season, latitude, twilight, telescope field of view, and observing strategy. It is therefore inaccurate to claim that every satellite ruins every image. It is equally inaccurate to treat mitigation as costless. An ESO study of 18 proposed constellations totaling more than 26,000 satellites estimated that up to 3% of long, roughly 1,000-second exposures with large telescopes could be ruined during twilight, while wide-field surveys would be more strongly affected ([European Southern Observatory study summary](https://www.eso.org/public/australia/news/eso2004/)).

Engineering can help. Dark coatings, dielectric films, altered orientation, reduced orbital altitude, accurate ephemerides, and dynamic radio coordination can reduce interference. A 2022 NSF–SpaceX agreement included efforts toward satellites of seventh visual magnitude or fainter, operation around 700 kilometres or below, public orbital information, and dynamic coordination to avoid illuminating major U.S. radio observatories during observations ([National Science Foundation agreement](https://www.nsf.gov/news/statement-nsf-astronomy-coordination-agreement)).

These measures demonstrate that mitigation is feasible, but also reveal a governance asymmetry: observatories often negotiate individually with private operators after deployment plans are advanced. Astronomers may have to alter schedules or software, effectively absorbing part of the mitigation cost. Moreover, agreements in one country do not automatically protect every observatory or the unaided experience of the night sky worldwide.

## 8. A fairer governance approach

No single rule can resolve every trade-off, but several principles follow from the evidence.

First, authorization should be based on fleet-level effects. Evaluating one spacecraft at a time understates cumulative collision, re-entry, and astronomy impacts. Environmental assessment should cover replacement cadence and plausible failure rates, not merely the initial deployment. GAO found that the FCC had generally treated large satellite systems as categorically excluded from detailed environmental review without reassessing whether that treatment remained appropriate, and it recommended clearer evaluation of extraordinary circumstances ([GAO-23-105005](https://www.gao.gov/products/gao-23-105005)).

Second, operators should disclose comparable performance data: spacecraft failures, conjunction thresholds, manoeuvres, disposal attempts, successful re-entries, brightness, radio interference, and anomalies. Regulators cannot price or manage risks that are hidden behind incompatible reporting.

Third, financial assurance should survive corporate failure. A risk-adjusted bond or escrowed disposal fund could make end-of-life obligations credible, although charges should be structured so responsible scientific and developing-country missions are not priced out.

Fourth, spectrum coordination and physical safety must be linked. A system should not retain valuable frequency priority while failing deployment, interference, or disposal obligations. Conversely, cancellation and transfer rules must prevent powerful incumbents from warehousing rights.

Fifth, affected communities need standing before authorization, not merely consultation after deployment. This includes astronomers, Indigenous communities for whom the night sky has cultural significance, nations without major launch industries, and future operators whose access depends on orbital preservation.

Finally, public subsidy and procurement should purchase public value explicitly. If governments support constellation service for remote regions, contracts can require affordable tariffs, local capacity-building, transparent coverage, resilient terminals, astronomy protection, and verified disposal. Connectivity claims should be tested by adoption and affordability, not by whether a signal technically reaches the ground.

## Conclusion

Mega-constellations do not literally privatize outer space, but they can convert financial and regulatory advantage into durable practical control. The operator owns its spacecraft; a state authorizes and supervises it; the ITU coordinates its frequencies; and physical deployment establishes facts that later entrants must work around. Formal access remains universal, while effective access is conditioned by capital, launch capacity, expertise, and political power.

Technical design determines how serious this asymmetry becomes. Low altitude, reliable propulsion, passivation, transparency, and prompt disposal reduce long-lived harm. High failure rates, persistent orbital shells, weak coordination, and disposable corporate structures transfer costs outward. International liability law provides an important state-based foundation, but it does not automatically compensate diffuse harms or finance cleanup. Voluntary guidelines and bilateral agreements can improve behaviour, yet they cannot substitute fully for enforceable, internationally compatible rules.

The central policy question is therefore not whether satellite broadband or Earth observation is “good” or whether astronomy and orbital preservation are “anti-technology.” It is whether operators must account for the full life-cycle costs of the infrastructure from which they earn revenue—and whether communities and future users receive a meaningful voice in allocating a finite environmental resource. A sustainable regime would preserve the real benefits of satellite services while making congestion, interference, disposal, and remediation part of project economics from the beginning.

## References

- [European Space Agency, *Space Environment Report 2025*](https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025)
- [United Nations Office for Outer Space Affairs, Outer Space Treaty](https://www.unoosa.org/oosa/en/ourwork/spacelaw/treaties/outerspacetreaty.html)
- [United Nations Office for Outer Space Affairs, Liability Convention](https://www.unoosa.org/oosa/en/ourwork/spacelaw/treaties/liability-convention.html)
- [International Telecommunication Union, satellite regulation and coordination](https://www.itu.int/en/mediacentre/backgrounders/Pages/Regulation-of-Satellite-Systems.aspx)
- [U.S. Government Accountability Office, *Large Constellations of Satellites*](https://www.gao.gov/products/gao-22-105166)
- [OECD, *The Economics of Space Sustainability*](https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/06/the-economics-of-space-sustainability_5236a39b/b2257346-en.pdf)
- [International Telecommunication Union, *Global Connectivity Report 2025*](https://www.itu.int/itu-d/reports/statistics/global-connectivity-report-2025/)
- [National Science Foundation, NSF–SpaceX Astronomy Coordination Agreement](https://www.nsf.gov/news/statement-nsf-astronomy-coordination-agreement)
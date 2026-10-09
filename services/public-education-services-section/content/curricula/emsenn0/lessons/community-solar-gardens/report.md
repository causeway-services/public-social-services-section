# Community Solar Gardens: Who Benefits, Who Pays, and Who Decides?

## Opening question

Imagine a renter who cannot install rooftop panels but is offered a share of a solar array across town. Each month, the utility promises to credit the renter for part of the array’s output, while a solar company charges a subscription fee. The offer is advertised as “guaranteed savings.”

Who actually finances the panels? Who sets the value of the bill credit? Who pays if connecting the project to the grid requires expensive equipment? Who receives federal tax benefits? And who decides whether farmland, a warehouse roof, or a contaminated industrial site should host the array?

Those questions reveal that a community solar garden is not merely a collection of photovoltaic panels. It is a contractual and regulatory system connecting at least four parties:

1. Subscribers receive assigned financial benefits and accept contractual obligations.
2. Developers or other owners finance, build, operate, and market the project.
3. Utilities connect the array, receive its electricity, administer credits, and protect distribution-system reliability.
4. State and local governments establish program rules, approve rates or capacity, issue permits, and determine where projects may be built.

By the end of this report, a learner should be able to take a proposed community-solar contract or program rule and identify, separately, who supplies capital, who receives each revenue stream or credit, who bears each major risk, and which institution controls each important decision.

## What counts as community solar?

The U.S. Department of Energy defines community solar broadly as a solar project or purchasing program within a geographic area whose benefits flow to multiple customers. Participants usually receive benefits from an off-site array rather than panels installed on their own buildings; they may buy or lease a share and ordinarily receive a utility-bill credit linked to that share’s generation ([Department of Energy, “Community Solar and Low-Income Utility Allowances”](https://www.energy.gov/cmei/systems/community-solar-and-low-income-utility-allowances)).

Several terms must be kept distinct:

- **Capacity**, measured in kilowatts or megawatts, is the array’s maximum rated power under specified conditions.
- **Generation**, measured in kilowatt-hours (kWh) or megawatt-hours (MWh), is the electricity actually produced over time.
- A **subscription** is the contractual claim assigned to a customer—often expressed as a share of capacity, a percentage of output, or a specified amount of generation.
- A **bill credit** is the monetary or energy credit that the utility places on a subscriber’s bill.
- A **subscription payment** is what the subscriber pays the developer or owner. It is not the same thing as the bill credit.
- A **renewable energy certificate** or REC is the transferable legal instrument associated with specified renewable attributes. A subscriber who receives bill savings does not necessarily receive or retain the project’s RECs; Minnesota’s consumer guidance therefore tells subscribers to determine whether the subscriber, developer, or utility owns them ([Minnesota Department of Commerce, “Tips and Resources”](https://mn.gov/commerce/energy/consumer/energy-programs/community-solar-gardens-tips.jsp)).

Electricity from a community array enters the distribution system and mixes with electricity from other sources. The subscriber does not receive a dedicated stream of electrons. The economic relationship is established through metering, allocation records, contracts, and bill credits.

That distinction explains community solar’s accessibility advantage. A household need not own a suitable roof or install equipment at home. In an 11-state study of 2023 adopters, community-solar adopters were approximately 6.1 times as likely as rooftop-solar adopters to live in multifamily buildings, 4.4 times as likely to rent, and had 23 percent lower annual incomes. The study’s statistical analysis also found that targeted policies explained part—but not all—of those differences, indicating that both the off-site business model and public policy contributed to broader access ([Lawrence Berkeley National Laboratory, “Evaluating community solar as a measure to promote equitable clean energy access”](https://emp.lbl.gov/publications/evaluating-community-solar-measure)).

Those findings support the proposition that community solar can expand access. They do **not** prove that every subscription saves money, that every project is equitably sited, or that subscribers control the project.

## The basic financial mechanism

A typical third-party-owned project can be represented as four linked flows:

1. The developer or its investors pay development and construction costs.
2. The array supplies electricity to the utility’s distribution system.
3. The utility assigns bill credits to subscribers according to reported project output and subscription shares.
4. Subscribers pay the developer under their subscription contracts.

For subscriber \(i\) in month \(t\), a simplified calculation is

\[
C_{i,t}=G_t \times s_i \times r_t,
\]

where:

- \(C_{i,t}\) is the subscriber’s bill credit,
- \(G_t\) is the array’s metered generation,
- \(s_i\) is the subscriber’s allocated share, and
- \(r_t\) is the applicable credit rate in dollars per kWh.

If the subscription charge is tied directly to allocated generation,

\[
P_{i,t}=G_t \times s_i \times p_t,
\]

where \(p_t\) is the subscription price per kWh. Before taxes, fixed utility charges, and other adjustments, the subscriber’s monthly net benefit is

\[
S_{i,t}=C_{i,t}-P_{i,t}.
\]

This equation exposes the central allocation question. A project can generate abundant electricity without producing large subscriber savings if the subscription price nearly equals the credit rate. Conversely, a well-designed discount can produce predictable savings even when monthly generation varies.

Payment structures alter who bears risk. An upfront purchase gives the project capital early and may offer greater long-term savings, but the subscriber bears more risk from underperformance or an unexpectedly short period of participation. A pay-as-you-go plan requires less initial money and can shift some production risk away from the subscriber, but many contracts include annual price escalators. Commitments may last 20 to 25 years, so transfer, relocation, termination, and escalation clauses matter as much as the opening price ([Minnesota Department of Commerce, “Tips and Resources”](https://mn.gov/commerce/energy/consumer/energy-programs/community-solar-gardens-tips.jsp)).

Billing architecture also affects whether promised savings are legible. With dual billing, the utility shows a credit while the developer sends a separate invoice; customers must combine the two to calculate savings. Consolidated billing puts utility charges, solar credits, and subscription charges on one statement. A national-laboratory review found that consolidated billing can improve transparency and customer experience, but implementing it requires administrative coordination, software changes, and decisions about collection risk and data exchange ([Lawrence Berkeley National Laboratory, “Community Solar Consolidated Billing”](https://emp.lbl.gov/publications/community-solar-consolidated-billing)).

## Who receives the benefits?

### Subscribers

A subscriber’s most immediate benefit is the difference between the bill credit and the subscription cost. Other possible benefits include protection against future electricity-price changes, portability within an eligible service territory, or ownership of a project share. None is automatic: each depends on the tariff and contract.

DOE measures subscription affordability using net present value, or NPV—the present value of future credits minus the present value of future payments. Through mid-2024, the capacity-weighted median NPV in DOE’s tracked community-solar data was approximately \(+\$0.27\) per watt of alternating-current capacity. That is evidence of a positive median value among the tracked subscriptions, not a guarantee for every customer; NPV changes with the discount rate, contract duration, escalation assumptions, expected generation, and future credit rates ([Department of Energy, “Community Solar Market Trends”](https://www.energy.gov/cmei/systems/community-solar-market-trends)).

For an income-qualified household, gross credits are insufficient if participation costs consume nearly all of them. DOE’s Clean Energy Connector therefore uses an explicit discount metric:

\[
\text{discount rate}
=
\frac{\text{financial benefit}-\text{participation cost}}
{\text{financial benefit}}.
\]

Subscriptions offered through that system must provide qualifying households a discount of at least 20 percent, counting subscription payments and other fees as participation costs ([Department of Energy, “Clean Energy Connector”](https://www.energy.gov/cmei/systems/clean-energy-connector)). This definition usefully prevents an offer with a large bill credit but an almost equally large fee from being described as substantial savings.

### Developers and investors

Developers assemble the site, land rights, permits, interconnection agreement, equipment, construction contracts, financing, subscribers, and operating system. Their revenues may include subscription payments, electricity sales, incentives, and the monetized value of tax credits. From those revenues they must cover development expenses, debt service, operations, maintenance, insurance, land costs, subscriber acquisition, billing, and investor returns.

Ownership determines who can use federal tax benefits. Under the clean electricity investment credit in Internal Revenue Code §48E, the base credit is 6 percent of qualified investment, potentially rising to 30 percent when prevailing-wage and apprenticeship requirements are satisfied; domestic-content and energy-community provisions can add percentage points. The credit can also be transferable, while eligible tax-exempt and government entities may use elective payment, subject to registration and other requirements ([IRS, “Clean Electricity Investment Credit”](https://www.irs.gov/credits-deductions/clean-electricity-investment-credit)).

The low-income-communities bonus can add 10 or 20 percentage points to §48E for awarded facilities with maximum net output below 5 MW. The larger bonus applies to qualified low-income residential-building or economic-benefit projects, while location in a low-income community or on Indian land supports the smaller addition ([IRS, “Clean Electricity Low-Income Communities Bonus Credit Amount Program”](https://www.irs.gov/credits-deductions/clean-electricity-low-income-communities-bonus-credit-amount-program)). Because this is an allocated program with eligibility conditions, a project cannot treat the bonus as automatic.

Federal policy is also time-sensitive. As of October 2026, IRS Notice 2025-42 explains that §45Y and §48E terminate for applicable solar and wind facilities placed in service after December 31, 2027 when construction begins after July 4, 2026. The notice uses a physical-work test, generally coupled with continuous construction, to determine whether construction began in time ([IRS Notice 2025-42](https://www.irs.gov/irb/2025-36_IRB)). Consequently, an older description of §48E as extending well beyond 2027 without qualification is no longer a reliable guide for a newly proposed solar project.

A tax credit initially belongs to the qualifying taxpayer, not automatically to subscribers or neighbors. Whether its value lowers subscription prices, increases developer returns, pays for interconnection, or finances community benefits depends on competition, program rules, financing agreements, and contractual design.

### Utilities and other ratepayers

The utility performs functions that neither the subscriber nor developer can perform alone: studying the proposed connection, approving protection and control equipment, executing an interconnection agreement, metering production, receiving allocation data, and placing credits on subscriber accounts. It may also administer consolidated billing.

The utility may bear administrative costs initially, but regulated utilities commonly seek to recover prudently incurred costs through approved rates or program charges. That can shift some costs to participating customers, the developer, or the broader ratepayer population. The result depends on the governing tariff and commission order, not simply on which institution writes the first check.

Interconnection is a particularly important allocation point. A nearby circuit may lack capacity to accept the proposed generation without upgraded conductors, voltage-control equipment, protection systems, or substation work. If the developer pays those costs, they may reappear in subscription pricing or make the project unfinanceable. If costs are spread among ratepayers, nonparticipants may help fund an upgrade that could have broader system value. The engineering study determines what is necessary; regulation determines who pays.

## Who makes the decisions? Minnesota as a concrete institutional example

Community solar law varies substantially by jurisdiction. Minnesota’s current Low- and Moderate-Income Accessible Community Solar Garden program provides an unusually clear example of divided authority; it should not be mistaken for a nationwide template.

Under Minnesota law, a “subscriber organization”—the developer or owner—owns and operates the garden, while subscribers receive credits in proportion to their subscription. An eligible new garden must connect to the utility’s distribution system, may not exceed 5 MW, and generally must have at least 25 individual subscribers per MW, with no subscriber holding more than 40 percent of total capacity ([Minnesota Statutes §216B.1641, subdivisions 2 and 6](https://www.revisor.mn.gov/statutes/cite/216b.1641)).

Decision-making is then divided:

- **The developer** chooses a potential site, secures site control, designs and finances the project, negotiates subscription contracts, and applies for interconnection and program approval.
- **The utility** conducts the technical interconnection review and decides what equipment or upgrades are necessary under the applicable process. Minnesota Commerce states that Xcel Energy handles this technical review before the subscriber organization completes the program-approval process ([Minnesota Department of Commerce, “Key Program Details”](https://mn.gov/commerce/energy/consumer/energy-programs/community-solar-gardens-key-details.jsp)).
- **Local authorities** retain land-use and permitting power. A state application must include approved nonministerial permits required by the local authority with jurisdiction, so state program eligibility does not erase local zoning, conditional-use, environmental, drainage, road-access, or building decisions ([Minnesota Statutes §216B.1641, subdivision 5](https://www.revisor.mn.gov/statutes/cite/216b.1641)).
- **The Minnesota Department of Commerce** evaluates applications, verifies eligibility, allocates limited annual program capacity, and enforces specified consumer protections. It can reject an otherwise complete application when the annual threshold has been reached or approval would not serve the public interest ([Minnesota Statutes §216B.1641, subdivisions 4, 5, and 7](https://www.revisor.mn.gov/statutes/cite/216b.1641)).
- **The Public Utilities Commission** governs relevant utility tariffs and bill-credit rates rather than negotiating each subscriber’s private contract.

Minnesota’s capacity-allocation criteria show how public rules can redirect benefits. Commerce must consider how tax incentives benefit subscribers, ratepayers, or the surrounding community; benefits for income-qualified households and public-interest subscribers; public, nonprofit, cooperative, or Tribal ownership; use of rooftops, carports, and contaminated sites; workforce development; and resilience. Each project’s subscription plan must allocate at least 30 percent of capacity to low- and moderate-income subscribers and at least 55 percent collectively to those households, affordable-housing providers, and public-interest subscribers ([Minnesota Statutes §216B.1641, subdivision 7](https://www.revisor.mn.gov/statutes/cite/216b.1641)).

These rules do more than invite disadvantaged households to participate after a project is built. They make subscriber composition part of access to scarce program capacity. Minnesota also prohibits credit checks for residential subscribers, residential exit fees, involuntary enrollment, and misleading representations ([Minnesota Department of Commerce, “Key Program Details”](https://mn.gov/commerce/energy/consumer/energy-programs/community-solar-gardens-key-details.jsp)). Those protections reduce particular barriers, although they cannot by themselves guarantee good service, high savings, or community control.

The same statute illustrates utility power and obligation. The utility must purchase the approved garden’s electricity for 25 years and compensate each subscriber with a proportional bill credit ([Minnesota Statutes §216B.1641, subdivision 8](https://www.revisor.mn.gov/statutes/cite/216b.1641)). The developer therefore controls the physical asset and private subscription relationship, while law and regulatory institutions create the crediting obligation that makes the subscription valuable.

## Worked example: following one dollar through the system

Consider a hypothetical 2 MW garden. The following values are teaching assumptions, not reported terms from an actual project:

- Annual generation: 3,000,000 kWh
- One household’s share: 0.10 percent
- Bill-credit rate: \$0.12/kWh
- Subscription charge: \$0.096/kWh
- No additional monthly fee

The household’s allocated annual generation is

\[
3{,}000{,}000 \times 0.001 = 3{,}000\text{ kWh}.
\]

Its annual bill credit is

\[
3{,}000 \times \$0.12 = \$360.
\]

Its annual subscription payment is

\[
3{,}000 \times \$0.096 = \$288.
\]

Its simple first-year net saving is

\[
\$360-\$288=\$72.
\]

Using DOE’s discount convention,

\[
\frac{\$360-\$288}{\$360}=20\%.
\]

Now change one term. Suppose the contract price rises by 2 percent annually while the credit rate remains constant. In year ten, the subscription price is approximately

\[
\$0.096(1.02)^9 \approx \$0.1147/\text{kWh}.
\]

At unchanged generation, the household would pay about \$344 and save only about \$16. This is not a forecast: generation and credit rates would probably change too. It demonstrates why an initial discount cannot describe a long-term contract without escalation, production, and credit-rate assumptions.

Now follow the risks:

- If cloudy weather reduces generation proportionally, both credits and per-kWh subscription payments fall under this assumed design; the subscriber retains approximately the same percentage discount.
- If the household had paid a fixed amount upfront, reduced generation would lower credits without reducing the prior payment, placing more performance risk on the subscriber.
- If an interconnection study discovers a \$1 million upgrade, the developer may absorb it, raise financing, alter subscriber pricing, seek a cost-sharing mechanism, or abandon the project.
- If the local government denies a required conditional-use permit, the utility’s willingness to interconnect cannot authorize construction.
- If the project earns a federal tax credit, the owner receives the legal benefit first. Subscribers benefit only if program rules or commercial pressures translate some value into lower charges or other benefits.
- If the contract transfers the RECs to another buyer, the household may still save \$72 but should not assume that paying for the subscription also conveys the project’s renewable attributes.

A careful evaluation therefore needs at least four ledgers: project finance, subscriber cash flow, utility and ratepayer costs, and community or land-use effects.

## Equity, local control, and unresolved tensions

Community solar can remove the roof-ownership barrier, but access and power are not identical. A renter may receive savings while having no vote over ownership, siting, vegetation management, labor practices, or the sale of the project. Community, cooperative, municipal, or nonprofit ownership can distribute governance differently, but such organizations may face limited capital, tax-credit expertise, and development capacity.

Low-income participation requirements can reserve benefits for households otherwise excluded from solar. Yet income verification can itself discourage enrollment through paperwork, privacy concerns, or unstable-income documentation. Program designers therefore face a real tradeoff between accurate targeting and low-friction enrollment.

Local control creates another tension. Municipal permitting can protect farmland, habitats, drainage, views, cultural resources, and neighboring landowners. It can also delay or prevent projects needed to meet broader clean-energy goals. State limits or standardized rules can reduce delay but may weaken the community’s influence over land use. Neither “local” nor “state” control is inherently equitable; the important questions are who participates, what evidence is considered, and who can appeal.

The available evidence also has limits. DOE reported about 7.87 GW of operating U.S. community solar across 44 states and localities as of June 2024, with more than three-quarters concentrated in Florida, New York, Massachusetts, and Minnesota ([Department of Energy, “Community Solar Market Trends”](https://www.energy.gov/cmei/systems/community-solar-market-trends)). Results from leading states therefore cannot automatically be generalized to every utility territory. Likewise, the 11-state adopter study strongly supports improved access relative to rooftop solar, but it does not establish identical causal effects in states with different tariffs, housing markets, or participation rules ([Lawrence Berkeley National Laboratory, “Evaluating community solar as a measure to promote equitable clean energy access”](https://emp.lbl.gov/publications/evaluating-community-solar-measure)).

## Conclusion

Community solar reallocates the functions that rooftop solar combines in one place. Generation occurs at a shared site; ownership may sit with a developer or community entity; the utility converts allocated production into bill credits; subscribers enter financial contracts; and governments determine eligibility, compensation, interconnection procedures, consumer protections, and land use.

The central lesson is that “who benefits?” cannot be answered by naming the technology. It must be answered by reading the tariff, subscription agreement, financing structure, tax rules, interconnection agreement, and permit together.

A well-designed program can give renters and lower-income households meaningful, enforceable savings without upfront investment. A poorly designed one can give subscribers small or opaque benefits while concentrating tax advantages and control in the project owner, shifting grid costs elsewhere, or excluding host communities from decisions. Panels produce electricity; institutions determine how its value and authority are divided.

## Retrieval question

A subscriber receives a \$500 annual utility credit and pays \$425 in subscription charges. Who creates the bill credit, who receives the subscription payment, and what is the subscriber’s discount rate?

**Check:** The utility applies the bill credit; the project owner or subscription provider receives the contractual payment. Net savings are \$75, and the DOE-style discount is

\[
(\$500-\$425)/\$500=15\%.
\]

Compare the formula with the [DOE Clean Energy Connector’s definition](https://www.energy.gov/cmei/systems/clean-energy-connector), and compare the division of responsibilities with [Minnesota Statutes §216B.1641](https://www.revisor.mn.gov/statutes/cite/216b.1641).

## Transfer exercise

Find a real community-solar offer or program in your utility territory. Build a four-column table labeled **Subscribers**, **Owner/developer**, **Utility**, and **Government/community**. Place each benefit, payment, risk, and decision in the appropriate column. At minimum, identify:

- the bill-credit formula;
- the subscription price and escalation rule;
- contract length and exit terms;
- REC ownership;
- responsibility for interconnection costs;
- eligibility and income-verification rules;
- ownership of federal tax benefits;
- the permitting authority; and
- who can approve, reject, or appeal the project.

Check the financial categories against the [DOE market-trends methodology](https://www.energy.gov/cmei/systems/community-solar-market-trends), the current federal-credit rules against the [IRS clean electricity investment-credit page](https://www.irs.gov/credits-deductions/clean-electricity-investment-credit) and [Notice 2025-42](https://www.irs.gov/irb/2025-36_IRB), and the allocation of public, utility, and developer authority against the actual statute, tariff, and permit documents for your jurisdiction. If the offer does not disclose enough information to complete the table, record that nondisclosure as a finding rather than guessing.

## References

- [U.S. Department of Energy — Community Solar Market Trends](https://www.energy.gov/cmei/systems/community-solar-market-trends)
- [U.S. Department of Energy — Clean Energy Connector](https://www.energy.gov/cmei/systems/clean-energy-connector)
- [Lawrence Berkeley National Laboratory — Evaluating Community Solar as a Measure to Promote Equitable Clean Energy Access](https://emp.lbl.gov/publications/evaluating-community-solar-measure)
- [Lawrence Berkeley National Laboratory — Community Solar Consolidated Billing](https://emp.lbl.gov/publications/community-solar-consolidated-billing)
- [Internal Revenue Service — Clean Electricity Investment Credit](https://www.irs.gov/credits-deductions/clean-electricity-investment-credit)
- [Internal Revenue Service — Notice 2025-42](https://www.irs.gov/irb/2025-36_IRB)
- [Minnesota Statutes §216B.1641](https://www.revisor.mn.gov/statutes/cite/216b.1641)
- [Minnesota Department of Commerce — Community Solar Garden Key Program Details](https://mn.gov/commerce/energy/consumer/energy-programs/community-solar-gardens-key-details.jsp)
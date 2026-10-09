# Causal Witnesses and Their Geometric Representation in Kinematic Space

## Executive answer

An operational causal witness can be associated with kinematic space, but only after several distinct ideas are kept separate.

First, spacetime causal order is an order relation: one event or region can influence another only when a future-directed causal curve connects them. Order identifies causal comparability, not elapsed time or distance. Under suitable causality assumptions, causal order determines a Lorentzian metric only up to a position-dependent conformal factor; volume information is needed to recover the missing scale. This is summarized by the continuum relation “causal structure + volume element = Lorentzian geometry” in the causal-set literature ([Surya, 2019](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

Second, in the best-developed holographic construction, a point of kinematic space is not a spacetime event. It is an oriented boundary interval—or equivalently, in a static AdS\(_3\) setting, the bulk geodesic anchored at that interval’s endpoints. Containment of intervals becomes causal order in an auxiliary Lorentzian geometry, while a second derivative of interval entropy supplies a measure and metric on that geometry. Bulk lengths can then be written as Crofton integrals over sets of geodesics ([Czech et al., 2015](https://arxiv.org/abs/1505.05515)).

Third, an operational witness should be defined by interventions and observed response, not merely by geometric overlap or correlation. A practical proposal is therefore to assign to each pair of spacetime regions \(A,B\) an intervention-dependent signalling functional, and then lift the pairs for which that functional is nonzero into loci in kinematic space. Their support, boundaries, and weighted density can be compared with the causal and metric structure induced by interval containment and entropy.

This construction is mathematically coherent and potentially useful, but it is not presently an established general theorem that the curvature of such witness loci uniquely reconstructs the curvature of the underlying spacetime. That correspondence is firm only in restricted settings—especially static, effectively two-dimensional holographic geometries with adequate boundary interval data and no obstructing geodesic pathologies. Elsewhere it remains a research proposal.

## 1. Prerequisites: order is not distance

Let \((M,g)\) be a time-oriented Lorentzian spacetime. For events \(p,q\in M\),

- \(p\ll q\) means that a future-directed **timelike** curve runs from \(p\) to \(q\);
- \(p\preceq q\) means that \(p=q\) or a future-directed **causal** curve—timelike or null—runs from \(p\) to \(q\);
- events are causally incomparable when neither can causally precede the other.

With suitable restrictions excluding causal loops, \(\preceq\) is a partial order: it is reflexive, antisymmetric, and transitive. The corresponding causal future and past are denoted \(J^+(p)\) and \(J^-(p)\), while \(I^\pm(p)\) conventionally denote their timelike interiors. The Alexandrov or causal diamond between timelike-related events is

\[
A(p,q)=I^+(p)\cap I^-(q), \qquad p\ll q.
\]

A causal diamond therefore represents the region capable of receiving influence from \(p\) and influencing \(q\). It does not, by itself, assign a length to any curve or a proper time between its tips.

That distinction is essential. If \(g\) is rescaled to

\[
g'=\Omega^2(x)g,\qquad \Omega(x)>0,
\]

then timelike, null, and spacelike directions remain of the same type, so the causal cones and causal order are unchanged, while proper times, lengths, volumes, and curvature generally change. The continuum reconstruction result reviewed by Surya says that causal structure determines conformal geometry, with the volume element supplying the missing conformal scale ([Surya, 2019](https://link.springer.com/article/10.1007/s41114-019-0023-1)). In four dimensions the symmetric metric has ten independent components, which motivates the informal statement that causal structure fixes “nine tenths” of the metric; this is component counting, not a claim that metric error has literally been reduced by 90 percent ([Surya, 2019](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

For regions rather than point events, a minimal order relation is

\[
A\rightsquigarrow B
\quad\Longleftrightarrow\quad
J^+(A)\cap B\neq\varnothing.
\]

This says only that at least one causal channel is geometrically possible. It does not prove that a given physical theory contains a controllable signal from \(A\) to \(B\), nor that an experiment has detected one.

## 2. What “operational causal witness” should mean

An operational witness must refer to actions that could be varied and effects that could be observed. Suppose an agent in region \(A\) chooses an intervention \(x\), and an agent in \(B\) records outcome \(b\) under a local measurement choice \(y\). A direct signalling strength is

\[
W_{A\to B}
=
\sup_{x,x',y}
D\!\left(
P(b\mid x,y),P(b\mid x',y)
\right),
\]

where \(D\) is a statistical distance, such as total variation distance,

\[
D_{\mathrm{TV}}(P,Q)=\frac12\sum_b|P(b)-Q(b)|.
\]

Then \(W_{A\to B}>0\) means that changing the intervention in \(A\) changes observable statistics in \(B\). In an idealized experiment with freely selectable interventions and adequate control of common causes, this is an operational witness of influence from \(A\) to \(B\).

This definition is deliberately asymmetric: \(W_{A\to B}\) need not equal \(W_{B\to A}\). It is also stronger than observing correlation. Shared preparation, entanglement, or a common cause may correlate measurements in spacelike-separated regions without allowing either party to signal to the other. The process-matrix literature similarly identifies causal influence with the possibility that one laboratory’s setting changes another laboratory’s outcome probabilities ([Giarmatzi and Costa, 2018](https://www.nature.com/articles/s41534-018-0062-6)).

For quantum operations, local interventions can be represented by completely positive maps, grouped into quantum instruments whose sum is trace-preserving. A process matrix \(W\) then returns joint probabilities through a generalized Born rule and can represent states, channels, or more general connections among laboratories ([Branciard, 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4870702/)). This framework is useful because it treats causal claims as constraints on experimentally accessible probabilities rather than as labels assigned in advance.

There is, however, a terminological trap. A **causal witness** in process-matrix theory usually tests *causal nonseparability*, not ordinary \(A\to B\) signalling. A bipartite causally separable process has the form

\[
W^{\mathrm{sep}}
=
pW^{A\to B}+(1-p)W^{B\to A},
\qquad 0\le p\le1.
\]

A Hermitian witness \(S\) satisfies

\[
\operatorname{Tr}(SW^{\mathrm{sep}})\ge 0
\]

for all causally separable processes but

\[
\operatorname{Tr}(SW^{\mathrm{nsep}})<0
\]

for at least one causally nonseparable process. Such separating witnesses exist because the set of causally separable process matrices is convex ([Rubino et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5365250/)). The quantum SWITCH provides the standard example: it coherently controls the alternatives \(A\to B\) and \(B\to A\), rather than implementing their classical probabilistic mixture ([Rubino et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5365250/)).

Thus two concepts should not be conflated:

1. A **signalling witness** detects nonzero operational influence in a particular direction.
2. A **causal-nonseparability witness** rules out every classical mixture of definite orders.

The first is the appropriate starting point for probing ordinary Lorentzian propagation. The second becomes relevant if kinematic space is extended to settings with quantum-indefinite order.

## 3. Kinematic space: intervals become points

Consider an oriented interval on a one-dimensional boundary time slice, written as

\[
I=(u,v),\qquad u<v.
\]

The ordered pair \((u,v)\) labels one point of a two-dimensional kinematic space \(K\). In a static AdS\(_3\)/CFT\(_2\) construction, the same pair labels the boundary-anchored bulk geodesic \(\gamma_{uv}\). Thus

\[
(u,v)\in K
\quad\longleftrightarrow\quad
I(u,v)
\quad\longleftrightarrow\quad
\gamma_{uv}.
\]

This is a space of regions or geodesics, not a copy of the original spacetime. Confusing its points with bulk events is one of the easiest conceptual errors.

Interval containment supplies a causal order on \(K\). If \(I_1\subset I_2\), their corresponding kinematic points are timelike related under a conventional choice of time orientation. Intervals whose endpoints vary in opposite directions trace timelike directions; moving only one endpoint gives a null direction; intervals that overlap without containing one another are spacelike separated in the auxiliary geometry. Czech and collaborators explicitly construct the kinematic partial order from interval containment and show that it supports a preferred Lorentzian metric ([Czech et al., 2015](https://arxiv.org/abs/1505.05515)).

Let \(S(u,v)\) denote the entanglement entropy of the boundary interval. Up to normalization conventions, the Crofton form is

\[
\omega
=
\frac{\partial^2 S(u,v)}{\partial u\,\partial v}\,
du\wedge dv,
\]

and the associated line element is commonly written

\[
ds_K^2
=
\frac{\partial^2 S(u,v)}{\partial u\,\partial v}\,du\,dv.
\]

The mixed derivative measures a conditional-mutual-information density. Strong subadditivity makes the appropriate density nonnegative, while the factor \(du\,dv\) gives the auxiliary geometry Lorentzian signature. The construction therefore combines two pieces of information: interval containment supplies causal ordering, and entropy variation supplies an invariant density or scale ([Czech et al., 2015](https://arxiv.org/abs/1505.05515)).

For a vacuum two-dimensional conformal field theory on a line,

\[
S(u,v)
=
\frac{c}{3}\log\!\left(\frac{v-u}{\epsilon}\right),
\]

where \(c\) is the central charge and \(\epsilon\) is a short-distance regulator. Hence

\[
\frac{\partial^2 S}{\partial u\,\partial v}
=
\frac{c}{3(v-u)^2}.
\]

Writing interval center and half-width as

\[
\theta=\frac{u+v}{2},
\qquad
\alpha=\frac{v-u}{2},
\]

gives \(du\,dv=d\theta^2-d\alpha^2\), so, apart from an overall constant,

\[
ds_K^2
\propto
\frac{d\theta^2-d\alpha^2}{\alpha^2}.
\]

This is a planar-coordinate form of two-dimensional de Sitter geometry. The identification of the static AdS\(_3\) geodesic space with \(dS_2\), and the recovery of its metric from interval entropy, are established within this holographic construction ([Czech et al., 2015](https://arxiv.org/abs/1505.05515); [Asplund, Callebaut, and Zukowski, 2016](https://arxiv.org/abs/1604.02687)).

## 4. From an operational witness to a kinematic locus

The simplest lift begins with a family of intervals or causal diamonds \(\{R_\lambda\}\), where \(\lambda\in K\) labels each region. For two such regions, define

\[
\mathcal{W}(\lambda,\mu)
=
\sup_{\mathcal I_\lambda,\mathcal M_\mu}
D\!\left[
P_\mu(\cdot\mid \mathcal I_\lambda),
P_\mu(\cdot\mid \mathcal I'_\lambda)
\right].
\]

Here \(\mathcal I_\lambda\) ranges over admissible interventions supported in \(R_\lambda\), while \(\mathcal M_\mu\) ranges over measurements in \(R_\mu\). The associated witness locus can be defined as

\[
L_\tau
=
\{(\lambda,\mu)\in K\times K:
\mathcal W(\lambda,\mu)>\tau\},
\]

where \(\tau\) is an experimental detection threshold. A one-point locus may instead be formed by fixing a source region \(\lambda_0\):

\[
L_{\lambda_0,\tau}
=
\{\mu\in K:
\mathcal W(\lambda_0,\mu)>\tau\}.
\]

This construction has three layers:

- **Order support:** which \(\mu\) are causally eligible to respond?
- **Operational support:** for which eligible \(\mu\) is a response actually detectable?
- **Weight:** how large is the distinguishability \(\mathcal W\)?

In a local relativistic theory, the operational support should respect spacetime causal constraints: a controlled intervention cannot produce a detectable response entirely outside its future causal domain. But equality between the geometric future and operational support is not automatic. A channel may be geometrically allowed yet carry no signal because of symmetry, selection rules, an inaccessible degree of freedom, destructive interference, an unsuitable observable, or insufficient experimental sensitivity.

This proposal is naturally covariant only if the admissible interventions and measurements are defined geometrically. If they depend on a preferred regulator, detector family, time slicing, or boundary parametrization, the resulting locus inherits that dependence.

## 5. What shape can encode

Even before introducing entropy, the **incidence pattern** of witness loci can reveal conformal causal structure. A sharp boundary separating allowed and forbidden influence plays the role of a light cone. Nesting relations among regions determine which points of \(K\) are timelike related. These are order-theoretic properties and therefore survive conformal rescalings of the underlying metric.

Metric information requires more. Candidate weights include:

\[
\mathcal W(\lambda,\mu),\qquad
\frac{\partial^2 S}{\partial u\,\partial v},\qquad
\operatorname{Vol}_K(L),\qquad
\int_L\omega.
\]

In the static AdS\(_3\) construction, the length of a bulk curve \(\Gamma\) is obtained from a Crofton integral,

\[
\operatorname{Length}(\Gamma)
=
\frac14\int_K
\omega(\gamma)\,
n_\Gamma(\gamma),
\]

where \(n_\Gamma(\gamma)\) counts intersections between \(\Gamma\) and a bulk geodesic \(\gamma\). Nonconvex curves require intersection multiplicity rather than a simple unweighted region count ([Czech et al., 2015](https://arxiv.org/abs/1505.05515)). This is a precise instance in which a bulk metric observable is encoded as a volume in a space whose points are geodesics.

Pointlike bulk objects also acquire extended representations. The set of all boundary-anchored geodesics passing through a fixed bulk point forms a **point-curve** in kinematic space. Relations among these curves can reconstruct bulk points, distances, and angles when the relevant geodesic data are sufficiently complete. Czech and collaborators state that their kinematic data are sufficient for reconstruction when the bulk has no conjugate points, identifying the absence of such geodesic degeneracies as an important condition ([Czech et al., 2015](https://arxiv.org/abs/1505.05515)).

The lesson is subtle: shape alone tends to encode incidence and conformal information, while weighted shape can encode scale. A proposed witness-locus reconstruction should therefore specify whether it uses only the subset \(L\), its causal boundary, the Crofton density on it, or the full response function \(\mathcal W\).

## 6. Does locus curvature equal spacetime curvature?

Not in general.

The intrinsic scalar curvature \(R_K\) of kinematic space is computed from \(ds_K^2\), so it depends on derivatives of the entropy-derived density. It is consequently sensitive to changes in the state’s interval-entanglement pattern. Non-vacuum holographic examples—including thermal BTZ geometries and conical defects—produce kinematic spaces differing from the full vacuum \(dS_2\); entropy phase transitions can also appear as defects in the kinematic description ([Asplund, Callebaut, and Zukowski, 2016](https://arxiv.org/abs/1604.02687)).

But three distinct curvatures must be distinguished:

1. the curvature of the original Lorentzian spacetime;
2. the intrinsic curvature of kinematic space;
3. the extrinsic or intrinsic curvature of a witness locus embedded in kinematic space.

No universal identity makes these equal. A curved locus can arise from the mapping between spacetime regions and \(K\), from the choice of detector or threshold, or from state-dependent response functions even when the underlying spacetime geometry is fixed. Conversely, distinct conformally related spacetime metrics have identical causal order, so any locus built solely from yes-or-no causal comparability cannot distinguish their scale or generally recover their curvature.

The defensible claim is conditional: in a restricted holographic model where interval entropies determine a Crofton form and the relevant geodesic transform is invertible, the weighted geometry of kinematic space can reconstruct aspects of the bulk spatial metric. Whether a newly defined operational witness provides enough data for that inversion must be proved for the particular witness family; it does not follow merely from calling its support “geometric.”

## 7. Failure modes and open questions

Several limitations prevent a general affirmative theorem.

**Correlation is not influence.** Mutual information can reveal dependence but does not by itself identify a signalling direction. An operational witness needs interventions or equivalent causal assumptions.

**Order lacks scale.** Binary causal data determine, at best, conformal structure. Recovering proper time, volume, or full curvature requires a measure, clock, entropy density, or other normalization.

**Kinematic space is model-dependent.** The clean interval/geodesic construction applies most directly to static AdS\(_3\)/CFT\(_2\). Higher dimensions replace geodesics with higher-dimensional extremal surfaces, while time-dependent situations require covariant extremal surfaces and introduce additional branch and reconstruction problems.

**Incomplete probes create shadows.** If no accessible interval corresponds to a geodesic through some bulk region, witness data cannot directly reconstruct that region. Multiple extremal surfaces and phase transitions can make the interval-to-surface map nonunique or nonsmooth.

**Quantum fields do not factorize naively by arbitrary regions.** Gauge constraints and continuum ultraviolet divergences complicate the assignment of independent regional Hilbert spaces and finite entropies. Regulator-independent derivatives or relative quantities are generally safer than raw entropy.

**Thresholds deform loci.** A finite \(\tau\) turns instrumental sensitivity into apparent geometry. Reconstruction should test stability as the threshold, detector basis, and noise model vary.

**Indefinite order is a separate extension.** Process-matrix causal-nonseparability witnesses diagnose failure of classical mixtures of orders. They do not automatically provide a Lorentzian metric or a spacetime embedding, although they may motivate a generalized, nonclassical kinematic space.

Accordingly, the strongest current conclusion is that causal-witness loci are a plausible reconstruction tool, with rigorous precedents in integral geometry and operational quantum causality, but their universal curvature interpretation remains open.

## 8. Worked checks and exercises

### Exercise 1: causal order does not determine distance

Let Minkowski spacetime have

\[
ds^2=-dt^2+dx^2,
\]

and define \(g'=4g\). Determine whether the causal ordering changes and compare the proper time from \((0,0)\) to \((1,0)\).

**Solution.** Multiplication by the positive conformal factor \(4\) preserves all causal cones and therefore every causal comparison. Under \(g\), the proper time is \(1\) in the chosen units. Under \(g'\), it is \(2\). Thus identical causal order does not imply identical metric distance. This is the required negative control against inferring a metric from order alone.

### Exercise 2: classify kinematic separation

Let \(I_1=(0,4)\), \(I_2=(1,3)\), and \(I_3=(3,5)\). Classify their relationships in interval kinematic space.

**Solution.** Since \(I_2\subset I_1\), their kinematic points are timelike related. Neither \(I_1\) nor \(I_3\) contains the other, so their points are not timelike related by containment. They overlap, but overlap alone is not the kinematic causal order.

### Exercise 3: distinguish correlation from signalling

Suppose \(P(a=b)=1\) for measurements in spacelike-separated regions, but Bob’s marginal distribution \(P(b\mid x,y)\) is independent of Alice’s setting \(x\). Is \(W_{A\to B}\) nonzero?

**Solution.** No. Perfect correlation may be present, but Alice’s intervention does not change Bob’s marginal statistics. Therefore the signalling witness vanishes.

### Exercise 4: recover the vacuum kinematic metric

Starting from

\[
S(u,v)=\frac{c}{3}\log\frac{v-u}{\epsilon},
\]

calculate \(\partial_u\partial_v S\).

**Solution.**

\[
\partial_vS=\frac{c}{3(v-u)},\qquad
\partial_u\partial_vS=\frac{c}{3(v-u)^2}.
\]

The positive density diverges near coincident endpoints, reflecting ultraviolet sensitivity, while its dependence on \((v-u)^{-2}\) produces the \(dS_2\)-type kinematic metric.

### Exercise 5: test a reconstruction claim

A researcher records only whether \(W_{A\to B}\) is zero and claims to reconstruct proper times everywhere. What information is missing?

**Solution.** The binary support can constrain causal order and hence conformal structure, but it supplies no independent scale. A volume element, calibrated clock data, response magnitude with a justified metric relation, or an entropy/Crofton measure is required.

## Conclusion

Operational causal witnesses can be placed inside kinematic space by mapping intervention-and-response experiments on spacetime regions to points or pairs of points representing those regions. The resulting loci can reliably encode causal eligibility, containment, and signalling support. When augmented by an entropy-derived Crofton density in suitable holographic systems, kinematic geometry can encode quantitative bulk lengths and support reconstruction of spatial geometry.

The answer to the lesson question is therefore qualified. **Yes:** operational witnesses can be defined and geometrically represented in kinematic space. **Sometimes:** their weighted shapes can carry information about an underlying Lorentzian or bulk geometry. **Not yet in general:** locus shape or curvature alone is not a universal, model-independent measure of spacetime curvature. Establishing such a result requires explicit intervention definitions, sufficient regional coverage, a normalization beyond causal order, control of state and detector dependence, and an invertibility theorem linking witness data to the desired metric.

## References

- Bartlomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515), 2015.
- Curtis T. Asplund, Nele Callebaut, and Claire Zukowski, [“Equivalence of Emergent de Sitter Spaces from Conformal Field Theory”](https://arxiv.org/abs/1604.02687), 2016.
- Cyril Branciard, [“Witnesses of causal nonseparability: an introduction and a few case studies”](https://pmc.ncbi.nlm.nih.gov/articles/PMC4870702/), 2016.
- Giulia Rubino et al., [“Experimental verification of an indefinite causal order”](https://pmc.ncbi.nlm.nih.gov/articles/PMC5365250/), 2017.
- Christina Giarmatzi and Fabio Costa, [“A quantum causal discovery algorithm”](https://www.nature.com/articles/s41534-018-0062-6), 2018.
- Sumati Surya, [“The causal set approach to quantum gravity”](https://link.springer.com/article/10.1007/s41114-019-0023-1), 2019.
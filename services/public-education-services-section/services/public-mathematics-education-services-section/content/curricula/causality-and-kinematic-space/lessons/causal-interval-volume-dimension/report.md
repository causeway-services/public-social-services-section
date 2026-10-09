# Causal-Interval Volume as a Measure of Effective Spacetime Dimension

## The question in concrete form

Imagine receiving a finite collection of events with only one kind of information attached: for some pairs \(x\) and \(y\), you know that \(x\) can causally precede \(y\). You are not given coordinates, rulers, clocks, spatial distances, or even the number of dimensions. Could you nevertheless determine whether the data resemble a two-, three-, or four-dimensional spacetime?

Under specific assumptions, the answer is yes. A causal interval—also called an Alexandrov interval or causal diamond—is the set of events that lie to the causal future of one endpoint and the causal past of another. In flat \(d\)-dimensional spacetime, the interval’s spacetime volume scales as the \(d\)th power of its duration. If a discrete causal structure samples continuum volume uniformly, counting its elements estimates volume; order-theoretic constructions can then estimate duration or compare nested volumes. The scaling exponent supplies an **effective dimension**.

There are two closely related implementations:

1. **Midpoint scaling:** divide a causal interval into two approximately half-duration subintervals and measure how their volumes compare.
2. **Myrheim–Meyer estimation:** count how many pairs—or more generally chains—inside an interval are causally related and compare the result with dimension-dependent predictions for Minkowski spacetime.

By the end of this report, a learner should be able to define a causal interval, distinguish causal order from metric distance, calculate a midpoint-scaling dimension from interval counts, interpret a Myrheim–Meyer estimate, and explain why either result is only evidence for an effective continuum dimension rather than proof of a unique underlying geometry.

## 1. The minimum vocabulary

### Events and causal order

An **event** is an idealized point in spacetime. Write

\[
x\prec y
\]

when \(x\) causally precedes \(y\): roughly, a signal moving no faster than light could travel from \(x\) to \(y\).

In a causal set, this relation is taken as fundamental. It is transitive, acyclic, and locally finite. Transitivity means that \(x\prec y\) and \(y\prec z\) imply \(x\prec z\). Acyclicity excludes causal loops of distinct elements. Local finiteness means that only finitely many elements lie between any two related elements. These are the basic conditions used by Abajian and Carlip in their primary study of causal-set dimension estimators ([Abajian and Carlip, “Dimensional reduction in manifold-like causal sets”](https://arxiv.org/abs/1710.00938)).

Two events need not be comparable. If neither \(x\prec y\) nor \(y\prec x\), causal order alone says that neither can influence the other. This is analogous to spacelike separation in a continuum spacetime.

Crucially, \(x\prec y\) is not a numerical distance. It answers a yes-or-no question about causal comparability, not “how far apart?” Indeed, conformally related Lorentzian metrics have the same light cones and hence the same causal order while differing in their volume and proper-time assignments. For suitable distinguishing spacetimes in dimension greater than two, causal structure determines the conformal geometry but leaves a local scale factor undetermined ([Surya, “The causal set approach to quantum gravity,” §2](https://arxiv.org/html/1903.11544v2)). This is why causal order must be supplemented by volume information before one can hope to reconstruct the full metric geometry.

### Causal intervals

For causally related endpoints \(p\prec q\), the open causal interval is

\[
I(p,q)=\{x\mid p\prec x\prec q\}.
\]

In a continuum spacetime it is the intersection of the causal future of \(p\) with the causal past of \(q\). In a spacetime diagram it appears as a diamond: the future light cone of \(p\) meets the past light cone of \(q\).

A finite causal set replaces this continuum region by a finite order interval. Authors differ on whether the endpoints are included in its cardinality, so a calculation must state its convention. For a large interval, adding or removing two endpoints is negligible; for a very small interval it can materially alter the estimate.

In this report, **kinematic space** means the space of causal configurations or intervals being examined, not automatically a second physical spacetime. An interval can be treated as one kinematic object, and collections of nested intervals provide observables from which continuum properties may be inferred. One must not assume that the dimension of an arbitrary “space of intervals” equals the dimension of the spacetime whose intervals it represents.

### Volume, number, and sprinkling

A discrete count can stand in for continuum volume if elements sample spacetime at a known uniform mean density \(\rho\). The standard construction is a Poisson sprinkling: the probability that a continuum region of spacetime volume \(V\) contains \(m\) elements is

\[
P_V(m)=\frac{(\rho V)^m}{m!}e^{-\rho V}.
\]

Consequently,

\[
\langle N\rangle=\rho V.
\]

This is an expectation value, not an exact identity for every finite sample. The fluctuations are Poissonian, with standard deviation \(\sqrt{\rho V}\), so relative number fluctuations fall like \(1/\sqrt{\rho V}\). Reid derives the same number–volume correspondence and uses it as the basis of both principal estimators discussed below ([Reid, “The Manifold Dimension of a Causal Set,” Eqs. 2–3](https://arxiv.org/html/gr-qc/0207103v2)).

The combination of order and counting is therefore essential:

- **Order** identifies which events lie inside an interval and which pairs are causally related.
- **Number** estimates the interval’s spacetime volume.
- Neither ingredient, used alone, supplies the complete metric.

## 2. Why volume carries information about dimension

In ordinary Euclidean geometry, scaling every length by a factor \(s\) multiplies area by \(s^2\) and three-dimensional volume by \(s^3\). More generally,

\[
V(sL)=s^d V(L)
\]

in \(d\) dimensions. Taking logarithms gives

\[
d=\frac{\ln[V(sL)/V(L)]}{\ln s}.
\]

A corresponding rule holds for causal diamonds in flat Lorentzian spacetime. If two timelike-separated events have proper-time separation \(\tau\), the \(d\)-dimensional spacetime volume of their Alexandrov interval is

\[
V_d(\tau)
=
\frac{\pi^{(d-1)/2}}
     {2^{d-2}d(d-1)\Gamma\!\left(\frac{d-1}{2}\right)}
\,\tau^d.
\]

The coefficient depends on \(d\), but the crucial feature is the exponent \(\tau^d\). Reid gives this expression as the continuum basis for midpoint scaling ([Reid, Eq. 6](https://arxiv.org/html/gr-qc/0207103v2)).

Some checks make the formula tangible. In \(1+1\) dimensions, meaning one time and one space dimension,

\[
V_2(\tau)=\frac{\tau^2}{2}.
\]

In \(2+1\) dimensions,

\[
V_3(\tau)=\frac{\pi\tau^3}{12}.
\]

In \(3+1\) dimensions,

\[
V_4(\tau)=\frac{\pi\tau^4}{24}.
\]

These are spacetime volumes, not spatial volumes at a chosen instant. Their units are length\(^d\) if time is expressed in length units by setting \(c=1\).

Now place a midpoint \(m\) halfway along the timelike geodesic from \(p\) to \(q\). Each half has duration \(\tau/2\), so

\[
V_d(\tau/2)=2^{-d}V_d(\tau).
\]

Therefore,

\[
\frac{V_d(\tau)}{V_d(\tau/2)}=2^d,
\qquad
d=\log_2\!\left(\frac{V_d(\tau)}{V_d(\tau/2)}\right).
\]

Uniform sprinkling converts the volume ratio into a count ratio:

\[
d_{\mathrm{mid}}
\approx
\log_2\!\left(\frac{N}{N_{\mathrm{small}}}\right).
\]

Here \(N\) is the number of elements in the full interval. For every candidate midpoint \(x\), form the two subintervals \(I(p,x)\) and \(I(x,q)\), take the smaller cardinality, and choose the \(x\) that maximizes that smaller value. Reid’s prescription uses this maximization because a true temporal midpoint makes the two sides as balanced and as large as possible ([Reid, Eqs. 6–7](https://arxiv.org/html/gr-qc/0207103v2)).

## 3. Worked example: estimating four dimensions

Suppose an order interval contains

\[
N=4096
\]

elements under a fixed endpoint convention. Searching over its internal elements, we find a candidate midpoint for which the two subintervals contain 258 and 250 elements. The estimator uses the smaller count:

\[
N_{\mathrm{small}}=250.
\]

The estimate is

\[
d_{\mathrm{mid}}
=
\log_2\left(\frac{4096}{250}\right)
=
\log_2(16.384)
\approx 4.03.
\]

The result is close to four. Its interpretation is not “the data prove that spacetime is exactly four-dimensional.” It is:

> At the interval scale sampled here, the observed volume ratio is close to the flat-spacetime scaling expected in four dimensions.

Why use the smaller subinterval instead of their average? If the candidate \(x\) is not exactly centered, one side can be too large while the other is too small. Maximizing the smaller side penalizes this imbalance. In the ideal four-dimensional case, each half-duration diamond has \(1/2^4=1/16\) of the full volume, so the target count is

\[
4096/16=256.
\]

The observed value \(250\) is plausible in a finite random sample.

The statistical limitation is visible immediately. A Poisson count near \(256\) has a standard deviation near \(16\), so a deviation of six elements is small. But the uncertainty in \(d\) is nonlinear. For a small perturbation \(\delta N_{\mathrm{small}}\),

\[
\delta d
\approx
\frac{1}{\ln 2}
\frac{\delta N_{\mathrm{small}}}{N_{\mathrm{small}}},
\]

if uncertainty in the full count is neglected. A \(16\)-element uncertainty at \(N_{\mathrm{small}}=250\) corresponds to roughly \(0.09\) dimension units. Candidate-midpoint selection and correlations between nested intervals add complications, so this is only a quick uncertainty estimate, not a complete error analysis.

### A useful negative control

Suppose another interval has exactly the same ordering relations but every continuum length has been multiplied by three through a constant conformal rescaling. Its causal comparabilities are unchanged: the same pairs satisfy \(x\prec y\). Yet proper times are three times larger and \(d\)-volume is \(3^d\) times larger.

It would therefore be invalid to infer the absolute proper-time separation of the endpoints from causal order alone. The midpoint ratio can still reveal a scale exponent because its unknown overall coefficient cancels, but it does not produce a calibrated ruler without number density or some other volume information. This exposes the central distinction: **dimension can be encoded in how volumes scale even when absolute metric distance is not contained in the bare order.**

## 4. Estimating dimension without reconstructing a midpoint

Midpoint scaling uses a chain- or volume-based proxy for halving proper time. The Myrheim–Meyer estimator takes a different route: it uses the density of causal relations inside one interval.

Let

- \(C_1=N\) be the number of elements in the interval;
- \(C_2\) be the number of ordered pairs \((x,y)\) for which \(x\prec y\).

For a Poisson sprinkling into a \(d\)-dimensional Minkowski causal diamond,

\[
\frac{\langle C_2\rangle}{\langle C_1\rangle^2}
=
f(d)
=
\frac{\Gamma(d+1)\Gamma(d/2)}
     {4\Gamma(3d/2)}.
\]

The right-hand side decreases monotonically with \(d\), so an observed ratio can be inverted numerically to define the Myrheim–Meyer effective dimension. This formula appears both in Reid’s tests and in Abajian and Carlip’s later investigation ([Reid, Eqs. 4–5](https://arxiv.org/html/gr-qc/0207103v2); [Abajian and Carlip, Eq. 2.2](https://arxiv.org/abs/1710.00938)).

For the first few dimensions,

\[
f(2)=\frac14,\qquad
f(3)\approx0.1143,\qquad
f(4)=0.05.
\]

Because \(C_2/N^2\) uses \(N^2\) rather than the exact number \(N(N-1)/2\) of distinct unordered pairs, it is half of the more colloquial “ordering fraction” in the large-\(N\) limit. Mixing these normalizations would produce a serious error.

### Example using relation counts

Suppose an interval has \(N=1000\) elements and \(C_2=50{,}800\) causal relations. Then

\[
\frac{C_2}{N^2}=0.0508.
\]

This is close to \(f(4)=0.05\), so the Myrheim–Meyer dimension is slightly below four but near it. The result says that the interval’s relation abundance resembles that of a random sprinkling in four-dimensional Minkowski spacetime.

Why does relation abundance depend on dimension? In a low-dimensional causal diamond, two randomly selected points are relatively likely to be timelike related. As spatial dimensionality increases, there are more directions in which two points can be spacelike separated, reducing the causal-ordering fraction. This is a statistical property of the whole interval, not a distance measurement for any individual pair.

The construction extends to \(k\)-element chains. Surya’s review records the expectation

\[
\langle C_k\rangle
=
\rho^k\chi_k V^k,
\]

where

\[
\chi_k
=
\frac{1}{k}
\left(\frac{\Gamma(d+1)}{2}\right)^{k-1}
\frac{\Gamma(d/2)\Gamma(d)}
     {\Gamma(kd/2)\Gamma((k+1)d/2)}.
\]

Ratios formed from different chain abundances can eliminate \(\rho V\), leaving functions of dimension alone; the chain counts are order invariants of a finite causal set ([Surya, §3.3.1, Eq. 19](https://arxiv.org/html/1903.11544v2)). Agreement among several chain-based estimates is stronger evidence than agreement with only the two-chain statistic.

## 5. What the numerical evidence establishes

Reid tested midpoint scaling and Myrheim–Meyer estimation on random sprinklings into flat and conformally flat spacetimes of total dimension two, three, and four. The study used 512-point examples and compared small subintervals with reference sprinklings in Minkowski space. In the two-dimensional curved example, applying the estimators to the full interval produced values \(2.77\) and \(2.65\), while sufficiently small subintervals followed the two-dimensional Minkowski reference much more closely. This supports a **local** use of the estimators: large diamonds can be distorted by curvature even though small diamonds recover the local manifold dimension ([Reid, results for \(1+1\) dimensions](https://arxiv.org/html/gr-qc/0207103v2)).

The same study reported that small subintervals in its three- and four-dimensional conformally flat examples fit the Minkowski reference of the correct dimension better than the competing reference dimensions. Reid also found that a causal set generated by transitive percolation could have a full-set Myrheim–Meyer value of two while its subinterval behavior failed to track any Minkowski reference curve well. Thus, a plausible dimension number by itself did not establish manifoldlikeness ([Reid, percolation test and conclusions](https://arxiv.org/html/gr-qc/0207103v2)).

This distinction is fundamental:

- An estimator can show that one statistic resembles its Minkowski expectation in dimension \(d\).
- It cannot, by itself, prove that the causal set embeds faithfully into a \(d\)-dimensional manifold.
- Consistency across interval sizes, locations, and independent observables is part of the evidence for a geometric interpretation.

## 6. Scale-dependent dimension and finite-size artifacts

“Effective dimension” may depend on the scale being probed. That can indicate curvature, non-manifoldlike structure, discreteness artifacts, or a genuine scale-dependent phenomenon. The estimator alone does not decide which explanation is correct.

Abajian and Carlip examined successively smaller causal diamonds drawn from sprinklings into three-, four-, and five-dimensional Minkowski space. They averaged results over 10,000 sprinklings and reported that the Myrheim–Meyer dimension remained near the background dimension above a small-volume transition, then fell rapidly when the interval contained very few elements. The transition began at about 8 points in three dimensions, 16 in four, and 22 in five ([Abajian and Carlip, §§3–4](https://arxiv.org/abs/1710.00938)).

The limiting result depended on how causally disconnected samples were treated. Assigning dimension zero to edgeless causal sets drove the average toward zero. Omitting them produced minima near two: \(2.08\pm0.26\), \(2.13\pm0.39\), and \(2.19\pm0.40\) for background dimensions three, four, and five respectively. The authors emphasized that this dependence on convention matters only for very small sets but is decisive there ([Abajian and Carlip, results](https://arxiv.org/abs/1710.00938)).

These findings are evidence for the behavior of a particular estimator on finite Poisson-sprinkled causal sets. They do not, by themselves, demonstrate that physical spacetime truly becomes two-dimensional at short distances. The smallest related causal set contains two elements and one relation, whose Myrheim–Meyer value is two by construction; the observed minimum is therefore partly tied to the estimator and sample-selection rule. The authors also acknowledged that their method relied on the background Minkowski geometry to choose genuinely small subdiamonds, rather than identifying all local regions intrinsically from causal order alone ([Abajian and Carlip, discussion and limitations](https://arxiv.org/abs/1710.00938)).

## 7. A practical estimation protocol

Given only a finite causal order, a defensible analysis would proceed as follows:

1. Choose many related endpoint pairs \(p\prec q\), and construct their order intervals.
2. State whether endpoints are included in each count.
3. Reject intervals that are too small for stable inference, or at least report them separately.
4. For midpoint scaling, find the internal element maximizing the smaller of \(N[I(p,x)]\) and \(N[I(x,q)]\), then calculate
   \[
   d_{\mathrm{mid}}=\log_2(N/N_{\mathrm{small}}).
   \]
5. For Myrheim–Meyer estimation, count all transitive causal relations—not merely the links drawn in a Hasse diagram—and solve
   \[
   C_2/N^2=f(d).
   \]
6. Repeat over intervals of different sizes and locations.
7. Compare the estimators with finite-sample reference simulations using the same conventions.
8. Treat agreement as a local effective dimension only when a scale window displays stable values and independent estimators agree.

For curved spacetime, intervals should be large compared with the discreteness scale but small compared with the curvature radius. Reid’s particular simulations used subinterval sizes from roughly 3 to 100 elements as a comparison window, but that numerical range was empirical and model-specific, not a universal prescription ([Reid, discussion of the “local Minkowski region”](https://arxiv.org/html/gr-qc/0207103v2)).

## 8. Limitations and unresolved questions

The method rests on assumptions that must remain visible.

First, **uniform sampling is essential**. If point density varies for reasons unrelated to the metric volume element, element number no longer estimates volume straightforwardly.

Second, **flat-space formulas are local approximations** in curved spacetime. Large intervals contain curvature corrections; using the Minkowski formula on them can bias the inferred dimension. More elaborate chain-count expressions can incorporate curvature, but they require additional assumptions and observables ([Surya, discussion following Eqs. 19–20](https://arxiv.org/html/1903.11544v2)).

Third, **finite samples fluctuate**. Very small intervals can be empty, disconnected, or dominated by individual relations. A single numerical estimate without an uncertainty distribution or interval-size study is weak evidence.

Fourth, **dimension does not imply manifoldlikeness**. Many non-geometric partial orders can share the same relation fraction. Surya explicitly cautions that matching the dimension estimator of a typical Minkowski sprinkling does not imply that the causal set itself is manifoldlike ([Surya, §3.3.1](https://arxiv.org/html/1903.11544v2)).

Fifth, different notions of effective dimension need not coincide outside a continuum regime. Midpoint-scaling, Myrheim–Meyer, spectral, and other dimensions probe different structural features. Their disagreement may diagnose curvature, nonlocality, discreteness, or failure of the manifold approximation rather than reveal one uniquely “correct” number.

## Conclusion

The volume of a causal interval estimates dimension because flat-spacetime causal-diamond volume obeys a power law,

\[
V_d(\tau)\propto \tau^d.
\]

In a uniformly sprinkled causal set, element number estimates volume. Dividing an interval at its effective midpoint therefore yields

\[
d_{\mathrm{mid}}\approx
\log_2\!\left(\frac{N}{N_{\mathrm{small}}}\right).
\]

Alternatively, the proportion of causally related pairs depends monotonically on dimension, giving the Myrheim–Meyer estimate through

\[
\frac{C_2}{N^2}
=
\frac{\Gamma(d+1)\Gamma(d/2)}
     {4\Gamma(3d/2)}.
\]

These constructions turn causal data into an observable probe of geometric scaling. Their real strength is not that they recover a number from order alone, but that they combine two logically distinct ingredients: causal order identifies the interval and its internal relations, while counting supplies volume. Stable agreement across nested intervals and independent estimators can support an effective \(d\)-dimensional spacetime interpretation. It cannot, without further tests, establish absolute distances, unique geometry, or manifoldlikeness.

## Retrieval question

An interval contains \(N=2048\) elements, and its best-balanced candidate midpoint has a smaller subinterval containing \(N_{\mathrm{small}}=256\) elements. What midpoint-scaling dimension is inferred?

\[
d=\log_2(2048/256)=\log_2 8=3.
\]

This answer can be checked directly against Reid’s midpoint relation \(d\approx\log_2(N/N_{\mathrm{small}})\) ([Reid, Eq. 7](https://arxiv.org/html/gr-qc/0207103v2)).

## Transfer exercise

Two causal intervals have the same number of elements, but interval A has \(C_2/N^2=0.25\) while interval B has \(C_2/N^2=0.05\).

1. Which interval has the larger Myrheim–Meyer dimension?
2. Why would it be invalid to conclude that either interval has a greater absolute proper-time duration?
3. What additional checks would you perform before calling either interval manifoldlike?

Using the source equation, \(0.25=f(2)\) and \(0.05=f(4)\), so B has the larger estimated dimension. Absolute duration does not follow because the ratio cancels the interval’s overall volume and sprinkling density. Manifoldlikeness should be tested through multiple interval sizes, midpoint scaling, higher-chain abundances, finite-sample reference distributions, and stability across locations. The numerical mapping can be checked from the Myrheim–Meyer formula in [Abajian and Carlip](https://arxiv.org/abs/1710.00938), while the warning that a matching dimension statistic does not establish manifoldlikeness can be checked in [Surya’s review](https://arxiv.org/html/1903.11544v2).

## References

- David D. Reid, [“The Manifold Dimension of a Causal Set: Tests in Conformally Flat Spacetimes”](https://arxiv.org/html/gr-qc/0207103v2), *Physical Review D* 67, 024034 (2003; revised 2004).
- J. Abajian and S. Carlip, [“Dimensional Reduction in Manifold-Like Causal Sets”](https://arxiv.org/abs/1710.00938), *Physical Review D* 97, 066007 (2018).
- Sumati Surya, [“The Causal Set Approach to Quantum Gravity”](https://arxiv.org/html/1903.11544v2), *Living Reviews in Relativity* 22, 5 (2019).
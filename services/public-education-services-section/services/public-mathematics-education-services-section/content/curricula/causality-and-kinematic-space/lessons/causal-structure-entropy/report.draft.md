# Causal-Order Entropy and the Reconstruction of Lorentzian Spacetime

## Executive summary

A causal order records which spacetime events can influence which others. In a Lorentzian spacetime, this information is extraordinarily rich: under suitable causality assumptions, the complete chronological order determines the topology, differentiable structure, and conformal metric—the light cones—but not the metric’s local scale. Recovering the full Lorentzian metric therefore requires an additional volume measure. In causal-set theory, the proposed discrete replacement is “order plus number”: order represents causal structure, while the number of elements in a region estimates its spacetime volume. This proposal originated in the causal-set program introduced by Bombelli, Lee, Meyer, and Sorkin in 1987 ([original paper](https://doi.org/10.1103/PhysRevLett.59.521)).

The phrase “entropy of the causal order” needs care. At least three inequivalent quantities might be intended:

1. the number \(R\) of causally related pairs in one finite order;
2. an information-style function of the related-pair fraction \(r=2R/[n(n-1)]\);
3. the logarithm of the number of distinct partial orders compatible with specified macroscopic data.

Only the third is literally a state-counting entropy. The first is an order statistic, and the second is a chosen summary of that statistic. These distinctions matter because \(R\), \(r\), or an entropy derived from \(r\) cannot by itself determine a Lorentzian metric.

For causal sets already known to be dense random samples of approximately flat Alexandrov intervals, \(r\) constrains the spacetime dimension. More generally, distributions of interval sizes, chain lengths, and local relation abundances can constrain dimension, timelike distance, curvature, and topology. But no single scalar count reconstructs an entire metric field. Nor does a plausible value of \(r\) prove that an arbitrary partial order is manifold-like. Indeed, most large finite partial orders are highly non-manifold-like layered orders, creating an entropy problem for causal-set dynamics rather than a shortcut to reconstruction ([Mathur, Singh, and Surya](https://arxiv.org/abs/2009.07623)).

The defensible conclusion is therefore conditional:

> Relation-count entropy can narrow the class of candidate Lorentzian geometries—most directly by constraining effective dimension—but full reconstruction requires the detailed causal order, volume calibration, manifold-likeness assumptions, and usually several additional order observables.

## 1. Prerequisites: Lorentzian causality without metric distance

A spacetime is a smooth manifold \(M\) equipped with a Lorentzian metric \(g\), conventionally of signature \((-+\cdots +)\). At every event, the metric divides tangent directions into:

- **timelike**, lying inside the light cone;
- **null**, lying on the light cone;
- **spacelike**, lying outside the light cone.

For events \(p\) and \(q\), write \(p\ll q\) when a future-directed timelike curve runs from \(p\) to \(q\), and \(p\preceq q\) when a future-directed causal curve—timelike or null—does so. The chronological future \(I^+(p)\) contains events timelike-related to \(p\); the causal future \(J^+(p)\) also includes null-related events.

Causal comparability is not distance. If \(p\prec q\), one learns that \(q\) lies to the causal future of \(p\), but not how much proper time separates them. If \(p\) and \(q\) are incomparable, they may be spacelike separated, but their spatial distance is not encoded in that fact alone. This is a fundamental negative control: neither “related” nor “unrelated” is a numerical length.

The causal relation behaves like a partial order after an appropriate convention is chosen:

- **transitivity:** \(p\prec q\) and \(q\prec r\) imply \(p\prec r\);
- **acyclicity or antisymmetry:** causal loops are excluded;
- **reflexivity or irreflexivity:** one may use either \(p\preceq p\) or the strict convention \(p\nprec p\), provided the choice is consistent.

For \(p\prec q\), the Alexandrov interval or causal diamond is

\[
A(p,q)=I^+(p)\cap I^-(q).
\]

It consists of events that can be influenced by \(p\) and can themselves influence \(q\). Alexandrov diamonds are important because their order structure and volume jointly probe local Lorentzian geometry.

## 2. What the complete continuum order determines

The foundational reconstruction result is often summarized as “causal structure determines conformal geometry.” Malament proved that, for past- and future-distinguishing spacetimes, causal structure determines the topology; together with related results, the timelike-curve structure determines the differentiable and conformal structures ([Malament’s 1977 paper](https://doi.org/10.1063/1.523436)). “Distinguishing” means, roughly, that different events have different chronological pasts and futures. Without such causal regularity, distinct points can become causally indistinguishable and reconstruction may fail.

A conformal transformation rescales the metric by a positive function:

\[
g'_{ab}(x)=\Omega^2(x)g_{ab}(x),\qquad \Omega(x)>0.
\]

This transformation preserves which tangent vectors are timelike, null, and spacelike. It therefore preserves light cones and causal order, even though it changes proper times, spatial lengths, and volumes. Consequently, the complete causal order cannot distinguish \(g\) from \(\Omega^2g\).

In \(d\) spacetime dimensions, the volume element transforms as

\[
dV_{g'}=\Omega^d\,dV_g.
\]

Thus a volume measure, combined with the conformal class supplied by the causal order, fixes \(\Omega\) and hence the full metric. The causal-set literature describes this as “order plus number”: order supplies conformal structure, and counting supplies volume. A modern review emphasizes both the scope of this result and its hypotheses ([Surya’s review](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

This continuum theorem concerns the **complete relation on a continuum of events**, not merely the total number of comparable pairs. Compressing the full order into one number discards almost all of its structural information. That distinction is the central answer to the lesson question.

## 3. From a continuum to a causal set

A causal set \(C\) is a locally finite partial order. Local finiteness means that for any \(x\prec y\), the interval

\[
I(x,y)=\{z\in C:x\prec z\prec y\}
\]

contains finitely many elements. The 1987 causal-set proposal identifies elements with elementary spacetime events and the order relation with causal precedence ([Bombelli et al.](https://doi.org/10.1103/PhysRevLett.59.521)).

To obtain a causal set from a known continuum spacetime, one normally uses a Poisson sprinkling with density \(\rho\), measured in elements per unit \(d\)-volume. For a region of spacetime volume \(V\),

\[
\Pr(N=n)=e^{-\rho V}\frac{(\rho V)^n}{n!},
\qquad
\mathbb E[N]=\rho V,
\qquad
\operatorname{Var}(N)=\rho V.
\]

Therefore

\[
\widehat V=\frac{N}{\rho}
\]

is a volume estimator, with relative counting fluctuation \(1/\sqrt{\rho V}=1/\sqrt{N}\). These formulas and their role in continuum approximation are set out in [Surya’s review](https://link.springer.com/article/10.1007/s41114-019-0023-1).

A **faithful embedding** must do more than preserve order. Its image should have approximately uniform density and Poisson-like fluctuations, while the continuum geometry should vary slowly relative to the discreteness scale \(\rho^{-1/d}\). A partial order that merely admits some order-preserving placement in a manifold need not be a typical discretization of that manifold.

This makes reconstruction an inverse problem:

1. Given only a finite order \(C\), is it manifold-like?
2. If it is, what dimension, topology, volume scale, and metric best approximate it?
3. Is that approximation unique above the discreteness scale?

The last question is the causal-set **Hauptvermutung**: a causal set should not faithfully approximate two macroscopically inequivalent spacetimes at the same density. A general proof remains unavailable; the established results instead recover individual geometric invariants under restricted assumptions ([Surya’s discussion](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

## 4. Three meanings of “causal-order entropy”

### 4.1 Number of causal relations

For an \(n\)-element causal set, let

\[
R=\#\{(x,y):x\prec y\}.
\]

Because at most one direction can hold for each unordered pair, the maximum is

\[
R_{\max}=\binom n2=\frac{n(n-1)}2.
\]

The normalized **ordering fraction** is

\[
r=\frac{R}{\binom n2}
  =\frac{2R}{n(n-1)},\qquad 0\le r\le1.
\]

The cases \(r=0\) and \(r=1\) are an antichain and a total chain, respectively. This normalization is standard in causal-set dimension estimation ([Surya, equations 14–18](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

Calling \(R\) an “entropy” is potentially misleading. It counts realized comparabilities, not possible microstates. Two non-isomorphic orders can have identical \(n\) and \(R\), just as two graphs can have the same number of vertices and edges but different geometry.

### 4.2 Binary information of comparability

If one samples an unordered pair uniformly, the binary variable “comparable/incomparable” has probabilities \(r\) and \(1-r\). Its Shannon entropy is

\[
H_{\mathrm{pair}}(r)
 =-r\log r-(1-r)\log(1-r),
\]

with the logarithm base determining the unit. This entropy is maximal at \(r=1/2\) and vanishes at \(r=0\) or \(1\).

This is a legitimate information statistic, but it is a definition imposed on pair sampling. It ignores which pairs are related, causal orientation, correlations between pairs, transitivity patterns, interval sizes, and chain structure. Moreover, because \(H_{\mathrm{pair}}(r)=H_{\mathrm{pair}}(1-r)\), it loses information even about \(r\) unless one also specifies the relevant branch.

### 4.3 Ensemble or state-counting entropy

A more conventional statistical entropy counts how many orders satisfy coarse constraints. If \(\Omega(n,R)\) denotes the set of \(n\)-element partial orders with \(R\) relations, one may define

\[
S(n,R)=\log |\Omega(n,R)|.
\]

This is not the entropy of one order in isolation; it is the entropy of an ensemble defined by \(n\), \(R\), and a choice about labelled versus unlabelled orders.

In causal-set path sums, this distinction becomes physical. The number of large non-manifold-like orders can overwhelm manifold-like configurations unless the dynamics suppresses them. Mathur, Singh, and Surya report that the number of dominant Kleitman–Rothschild orders grows as

\[
2^{\,n^2/4+3n/2+o(n)},
\]

and study conditions under which a link-dependent action suppresses their contribution ([primary analysis](https://arxiv.org/abs/2009.07623)). This is a genuine state-counting use of “entropy,” but it does not mean that high entropy improves metric reconstruction. Here entropy favors orders that do **not** resemble extended spacetime.

## 5. What relation counts actually constrain

Assume that \(C\) was produced by sprinkling density \(\rho\) into a large Alexandrov interval in \(d\)-dimensional Minkowski spacetime. Under that strong prior, the expected relation abundance depends on \(d\). Specifically,

\[
\frac{\mathbb E[R]}{\mathbb E[N]^2}
=
f_0(d)
=
\frac{\Gamma(d+1)\Gamma(d/2)}
     {4\Gamma(3d/2)}.
\]

For large \(N\), the expected ordering fraction is approximately

\[
r(d)=2f_0(d)
=
\frac{\Gamma(d+1)\Gamma(d/2)}
     {2\Gamma(3d/2)}.
\]

These expressions, including the normalization by \(N^2\), are given in [Surya’s account of the Myrheim–Meyer estimator](https://link.springer.com/article/10.1007/s41114-019-0023-1). For example,

\[
r(2)=\frac12,\qquad
r(3)\approx0.2286,\qquad
r(4)=0.1.
\]

Higher dimension produces a smaller fraction of comparable pairs in a fixed-shape Alexandrov interval because more pairs are spacelike separated. An observed \(r\) may therefore be inverted numerically to obtain an effective **Myrheim–Meyer dimension**.

This is a useful constraint, not a reconstruction theorem. It is conditional on:

- manifold-likeness;
- an approximately flat Alexandrov region;
- sufficiently large cardinality;
- representative Poisson sampling;
- control of finite-size and curvature effects.

The estimator also fluctuates. The review explicitly warns that the correct dimension cannot generally be obtained from one small realization and that convergence improves with increasing density or interval size ([Surya](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

Most importantly, matching \(r(d)\) does not prove that the causal set resembles \(d\)-dimensional Minkowski spacetime. It proves only that this one statistic fails to distinguish the order from that model. Many structurally different orders share the same relation count.

## 6. Why no scalar entropy can reconstruct the metric

A Lorentzian metric \(g_{ab}(x)\) is a field with position-dependent components. By contrast, \(R\), \(r\), \(H_{\mathrm{pair}}\), or \(S(n,R)\) is a single scalar. Without extreme symmetry assumptions, a scalar cannot specify an entire field.

Several explicit degeneracies illustrate the loss:

- Conformally related metrics \(g\) and \(\Omega^2g\) possess the same causal order even before the order is reduced to a count.
- Orders with identical \(n\) and \(R\) can distribute relations differently among intervals.
- Pair entropy identifies \(r\) with \(1-r\).
- Equal global ordering fractions can conceal strong local variation in dimension or curvature.
- A non-manifold-like layered order can share a coarse statistic with a sprinkled spacetime.

Even metric distance is not directly recoverable from comparability. For causally related elements, the length of the longest chain can estimate proper time after dimension and sprinkling density are calibrated. Spacelike distance is harder: the causal-set literature’s naive minimization construction fails in dimensions above two, and improved proposals require averaging over special common-past/common-future configurations ([review of spatial-distance constructions](https://link.springer.com/article/10.1007/s41114-019-0023-1)). Thus the inference

\[
\text{“fewer causal relations”}\Longrightarrow
\text{“larger metric distances”}
\]

is invalid. A lower relation fraction could indicate higher dimension, a different region shape, curvature, boundaries, sampling noise, or a non-manifold-like order.

## 7. What a credible reconstruction pipeline requires

A practical reconstruction must retain far more than entropy.

First, one tests **manifold-likeness** across several scales. Relevant observables include ordering fractions in nested intervals, distributions of interval cardinalities, chain abundances, maximal-chain lengths, antichain structure, and dimension estimates. Agreement of one observable is weak evidence; simultaneous agreement of several scale-dependent observables is stronger.

Second, one estimates dimension locally rather than only globally. If the inferred dimension changes systematically with interval size, the possibilities include curvature, boundaries, finite-density artifacts, genuine scale dependence, or failure of the manifold model. These alternatives must be compared rather than selecting a preferred interpretation from one curve.

Third, cardinality estimates volume:

\[
V(I(x,y))\approx \frac{|I(x,y)|}{\rho}.
\]

If \(\rho\) is unknown, the reconstruction remains determined only up to an overall scale. Local scale recovery additionally assumes that sprinkling density is uniform or that its variation is independently known.

Fourth, timelike distance can be inferred from longest chains only after calibrating the dimension-dependent proportionality. Spatial distance requires more global constructions. Curvature can be probed using counts of small order intervals; causal-set versions of the d’Alembertian and Einstein–Hilbert action use weighted combinations of such counts, not merely \(R\). Surya’s review catalogs reconstructed invariants including dimension, topology, distances, scalar curvature, actions, and field operators, while stressing that their collection does not yet constitute a complete proof of uniqueness ([review](https://link.springer.com/article/10.1007/s41114-019-0023-1)).

Finally, candidate geometries should be forward-tested: sprinkle points into each candidate at the inferred density and compare the resulting joint distribution of order observables with the observed causal set. This yields statistical support, not deductive certainty.

## 8. Causal diamonds and kinematic space

Kinematic space provides a complementary organizational idea: a “point” in kinematic space can represent an interval, causal diamond, boundary interval, or bulk geodesic. Geometry on that space describes relations among regions rather than distances among original spacetime points.

For example, a causal diamond can be represented by its ordered pair of tips \((p,q)\) with \(p\ll q\). Inclusion of diamonds then becomes an order-like relation on the space of regions. In conformal field theory, researchers have studied observables on the moduli space of causal diamonds; entanglement entropy perturbations can be treated as fields on that auxiliary space, and in two-dimensional settings the moduli space has de Sitter factors ([de Boer, Haehl, Heller, and Myers](https://arxiv.org/abs/1606.03307)).

This does not identify relation-count entropy with quantum entanglement entropy. The former summarizes a finite partial order or an ensemble of orders. The latter is defined from a quantum state and a subsystem or algebra of observables. Their connection, when present, requires additional holographic or quantum-field-theoretic structure. Kinematic-space methods may help organize interval-by-interval reconstruction data, but they do not remove the need for volume information or solve the causal-set Hauptvermutung.

## 9. Established results, conditional inferences, and open gaps

### Established under stated hypotheses

- Complete chronological structure determines conformal geometry for suitably distinguishing spacetimes ([Malament](https://doi.org/10.1063/1.523436)).
- Volume information fixes the conformal factor once the conformal metric is known.
- Poisson sprinkling converts cardinality into an unbiased volume estimator with relative noise of order \(N^{-1/2}\) ([Surya](https://link.springer.com/article/10.1007/s41114-019-0023-1)).
- For sprinklings into flat Alexandrov intervals, expected ordering fraction depends on dimension through the Myrheim–Meyer relation.
- Large finite-order sample spaces are entropically dominated by non-manifold-like layered orders; certain action-weighted suppression results have been proved for specified subclasses and parameter ranges ([Mathur, Singh, and Surya](https://arxiv.org/abs/2009.07623)).

### Conditional or model-dependent

- Inferring dimension from \(r\) assumes approximate Minkowski-interval behavior.
- Inferring volume from number assumes a known, uniform sprinkling density.
- Inferring distances and curvature requires calibration, sufficient density, and manifold-likeness.
- Treating interval entropies as geometric fields in kinematic space requires a specific quantum or holographic framework.

### Unresolved or insufficiently supported

- There is no general algorithm that maps an arbitrary finite order uniquely to a smooth Lorentzian metric.
- The full causal-set Hauptvermutung has not been proved.
- A universally accepted “entropy of one causal order” defined only by \(R\) does not exist.
- Relation abundance alone does not decide manifold-likeness, topology, curvature, or local metric scale.
- Existing suppression results do not yet establish that a complete quantum causal-set dynamics selects four-dimensional semiclassical spacetime.

## 10. Worked exercises

### Exercise 1: Partial order versus distance

Let \(C=\{a,b,c\}\) with \(a\prec c\), \(b\prec c\), and \(a,b\) incomparable.

**Question:** What distances can be inferred?

**Resolution:** One may infer only that \(a\) and \(b\) can causally precede \(c\), while neither precedes the other. No proper time from \(a\) to \(c\), spatial distance between \(a\) and \(b\), or angle is fixed. Assigning equal distances because the Hasse diagram looks symmetric would import an unsupported metric.

### Exercise 2: Relation fraction and dimension

For \(n=100\) and \(R=495\),

\[
r=\frac{2(495)}{100\cdot99}=0.1.
\]

**Question:** Does this reconstruct four-dimensional Minkowski spacetime?

**Resolution:** No. It matches the large-sample expectation \(r(4)=0.1\) for a sprinkled four-dimensional Minkowski Alexandrov interval. It therefore supports an effective dimension of four only under the manifold-like, flat-diamond, and adequate-sample assumptions. It neither proves those assumptions nor fixes curvature, topology, volume scale, or coordinates.

### Exercise 3: Conformal ambiguity

Suppose \(g'=\Omega^2g\).

**Question:** Why can causal order not determine \(\Omega\)?

**Resolution:** Positive conformal rescaling preserves light cones, so it preserves causal order. But \(dV_{g'}=\Omega^d dV_g\). A volume measure distinguishes the metrics and determines \(\Omega\) once the conformal class is fixed.

### Exercise 4: Interval as a point of kinematic space

Let \(D(p,q)=I^+(p)\cap I^-(q)\).

**Question:** What is the associated kinematic-space point?

**Resolution:** It is the interval label \((p,q)\), not an event inside the original spacetime. A curve in this kinematic space is a family of changing diamonds. Its metric, if defined, measures changes or relations among regions; it should not automatically be interpreted as the original spacetime metric.

### Exercise 5: Information observables

Two orders have \(n=20\) and \(R=95\).

**Question:** Must their information content and geometry coincide?

**Resolution:** They have the same ordering fraction \(r=190/380=1/2\) and hence the same binary pair entropy \(H_{\mathrm{pair}}=\log 2\). They need not be isomorphic, have the same interval distribution, or approximate the same spacetime. Pair entropy is only one compressed observable.

### Exercise 6: Critiquing an invalid reconstruction

Claim: “Order \(C_1\) has fewer causal relations than \(C_2\), so all corresponding points in \(C_1\) are farther apart.”

**Resolution:** Invalid. Relation fraction is sensitive to dimension, region shape, curvature, boundary effects, sampling fluctuations, and non-manifold-like organization. Even the complete order fixes only conformal geometry until volume is supplied. A relation count cannot establish pairwise metric inequalities.

## Conclusion

The entropy or abundance of causal relations constrains spacetime reconstruction only in a limited, model-dependent sense. The normalized number of relations is especially valuable as a dimension estimator for causal sets known—or independently shown—to approximate sufficiently large Alexandrov intervals. State-counting entropy also reveals a major dynamical challenge: generic partial orders are overwhelmingly non-manifold-like.

Neither result makes entropy a substitute for geometry. Complete causal order supplies light-cone structure under appropriate causal regularity; volume information supplies scale. A single relation count, its binary Shannon entropy, or an ensemble multiplicity discards the local pattern needed to recover topology, distances, curvature, and a position-dependent metric. Reliable reconstruction therefore requires order plus number, evidence of manifold-likeness, multiple scale-dependent observables, and explicit uncertainty analysis. The strongest uniqueness claim remains a research conjecture rather than an established general theorem.

## References

- Luca Bombelli, Joohan Lee, David Meyer, and Rafael D. Sorkin, “[Space-time as a causal set](https://doi.org/10.1103/PhysRevLett.59.521),” *Physical Review Letters* 59 (1987), 521–524.
- David B. Malament, “[The Class of Continuous Timelike Curves Determines the Topology of Spacetime](https://doi.org/10.1063/1.523436),” *Journal of Mathematical Physics* 18 (1977), 1399–1404.
- Sumati Surya, “[The causal set approach to quantum gravity](https://link.springer.com/article/10.1007/s41114-019-0023-1),” *Living Reviews in Relativity* 22, 5 (2019).
- Abhishek Mathur, Anup Anand Singh, and Sumati Surya, “[Entropy and the Link Action in the Causal Set Path-Sum](https://arxiv.org/abs/2009.07623),” arXiv:2009.07623 (2020).
- Jan de Boer, Felix M. Haehl, Michal P. Heller, and Robert C. Myers, “[Entanglement, Holography and Causal Diamonds](https://arxiv.org/abs/1606.03307),” *Journal of High Energy Physics* 2016, 162.
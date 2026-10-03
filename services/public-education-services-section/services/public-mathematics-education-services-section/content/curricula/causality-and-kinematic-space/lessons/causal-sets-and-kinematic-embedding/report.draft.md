# Causal Sets and Kinematic-Space Embedding

## The central question

A causal set contains two elementary ingredients: discrete events and a relation saying which events can causally precede which others. A continuous Lorentzian spacetime contains much more apparent structure—a differentiable manifold, a metric, light cones, volumes, proper times, curvature, and geodesics. The lesson question is therefore an inverse problem:

> If a causal set can be embedded faithfully into a Lorentzian manifold, what does that embedding force the geometry of a kinematic space built from its intervals or geodesics to be?

The short answer is conditional. An order-preserving embedding fixes the causal and nesting structure of the relevant intervals. Under appropriate continuum assumptions, causal order fixes the conformal geometry—that is, light cones and angles but not an absolute local scale. A statistically uniform embedding supplies the missing volume information through element counts. Together, order and volume can constrain continuum lengths, dimension, curvature estimators, and hence the measure or metric placed on kinematic space. But none of these conclusions follows from an arbitrary finite partial order alone. They require manifoldlikeness, sufficient sampling density, a specified embedding class, and often additional holographic or integral-geometric assumptions.

Most importantly, there is no general theorem saying that every causal set has a unique continuous kinematic geometry. The embedding acts as a bridge, and the strength of the result depends on how trustworthy and unique that bridge is.

## 1. Prerequisites: causal order is not metric distance

A **partially ordered set**, or poset, is a set \(C\) with a relation \(\prec\) that is transitive and irreflexive:

\[
x\prec y,\quad y\prec z \;\Longrightarrow\; x\prec z,
\qquad
x\nprec x.
\]

One may instead use a reflexive convention \(x\preceq x\); the two conventions carry the same ordering information after a minor change of notation. A **causal set** is normally also required to be locally finite: between two comparable elements \(x\prec y\), there are only finitely many intervening elements. Its discrete order interval is

\[
I(x,y)=\{z\in C\mid x\prec z\prec y\}.
\]

A Lorentzian manifold \((M,g)\) supplies an analogous causal relation. If \(q\) lies in the causal future \(J^+(p)\), then \(p\preceq q\). If a future-directed timelike curve connects them, one writes \(p\ll q\). Their Alexandrov interval, or causal diamond, is

\[
A(p,q)=I^+(p)\cap I^-(q),
\]

where \(I^\pm\) denote chronological future and past.

Comparability is not a numerical distance. The assertion \(x\prec y\) tells us that a causal curve may run from \(x\) to \(y\); it does not say whether the proper time is one second or one millennium. Likewise, incomparable elements need not be “far apart.” They may be arbitrarily close but spacelike separated.

This distinction is visible even in \(1+1\)-dimensional Minkowski spacetime. With metric

\[
ds^2=-dt^2+dx^2,
\]

the origin \(p=(0,0)\) causally precedes both \(q_1=(2,0)\) and \(q_2=(100,0)\). The order relation records \(p\prec q_1\) and \(p\prec q_2\), but not their respective proper times \(2\) and \(100\) in the chosen units. A bare three-element chain therefore cannot, by itself, determine the proper-time gaps between successive elements.

The distinction is fundamental because conformally related metrics,

\[
g'_{ab}(x)=\Omega^2(x)g_{ab}(x), \qquad \Omega(x)>0,
\]

have the same null cones and causal ordering while generally assigning different lengths, times, and volumes. For suitably distinguishing spacetimes, causal structure determines the smooth conformal geometry, not the conformal factor. This is the content of the causal-reconstruction results associated with Malament and later formulations; Levichev’s primary paper explicitly establishes that causal structure determines conformal geometry under its stated hypotheses ([Levichev, 1987](https://www.mathnet.ru/eng/dan8158)).

Thus one should remember the causal-set slogan in two parts:

\[
\text{order} \longleftrightarrow \text{conformal causal structure},
\qquad
\text{number} \longleftrightarrow \text{volume}.
\]

Only their combination can aspire to recover a full metric at continuum scales.

## 2. What counts as a faithful embedding?

Let \(C\) be a causal set and \((M,g)\) a Lorentzian manifold. An embedding \(\phi:C\rightarrow M\) must at minimum preserve and reflect order:

\[
x\prec y
\quad\Longleftrightarrow\quad
\phi(x)\in J^-\!\bigl(\phi(y)\bigr),
\]

with the precise use of chronological or causal order depending on convention. Order preservation alone is too weak: all elements could be mapped into a highly nonuniform cluster, leaving most of the manifold empty.

Causal-set theory therefore supplements order preservation with statistical uniformity. The usual construction selects points by a Poisson process of density \(\rho\). For a measurable region \(R\) of spacetime volume \(V(R)\),

\[
\Pr[N(R)=n]
   =\frac{\bigl(\rho V(R)\bigr)^n}{n!}
      e^{-\rho V(R)},
\]

so

\[
\mathbb E[N(R)]=\rho V(R),
\qquad
\operatorname{Var}[N(R)]=\rho V(R).
\]

Henson’s embedding study states this correspondence directly: sprinkled points inherit the manifold’s causal order, while the number of elements estimates spacetime volume; it also stresses that identifying a suitable embedding from a given causal set is computationally difficult and that no necessary-and-sufficient manifoldlikeness criterion was known ([Henson, “Constructing an interval of Minkowski space from a causal set”](https://arxiv.org/abs/gr-qc/0601069)).

A faithful embedding is therefore not simply a graph drawing. It entails:

1. causal relations matching those of the target manifold;
2. an approximately Poisson distribution at a specified density;
3. no physically relevant geometric structure below the discreteness scale; and
4. curvature varying slowly enough, over the sampled regions, for continuum estimators to be meaningful.

The density introduces a physical conversion between cardinality and volume:

\[
V(R)\approx \frac{N(R)}{\rho}.
\]

This estimate fluctuates. Since the standard deviation is \(\sqrt{\rho V}\), the relative counting fluctuation is

\[
\frac{\sqrt{\operatorname{Var}N}}{\mathbb E N}
=\frac{1}{\sqrt{\rho V}}.
\]

A region with \(10^4\) expected elements has a characteristic Poisson relative fluctuation of about \(1\%\); a region with only \(25\) expected elements has about \(20\%\). This elementary calculation explains why continuum geometry can be stable for large intervals yet noisy or meaningless near the discreteness scale.

## 3. What “kinematic space” means here

A kinematic space is not usually the original spacetime. Its points represent extended objects in another geometry.

For a causal set, a natural discrete construction is the set of order intervals

\[
K_C=\{(x,y)\in C\times C\mid x\prec y\},
\]

where the point \((x,y)\) stands for the interval \(I(x,y)\). One can order these interval-points by inclusion. If endpoint conventions are fixed appropriately,

\[
I(x,y)\subseteq I(x',y')
\]

corresponds to the outer interval starting no later and ending no earlier. The resulting kinematic object is a “space of regions”: its points are not events but causal diamonds.

A more specialized construction appears in static \(\mathrm{AdS}_3/\mathrm{CFT}_2\). There, a kinematic-space point can represent either a boundary interval \((u,v)\) or its associated oriented, boundary-anchored bulk geodesic. Czech, Lamprou, McCandlish, and Sully define kinematic space as the space of these geodesics and equip it with a Crofton form and a Lorentzian metric; in pure \(\mathrm{AdS}_3\), the resulting two-dimensional geometry is de Sitter space ([Czech et al., “Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515)).

These two ideas are related but not identical. The first can be constructed combinatorially from any causal set. The second requires a boundary, a suitable bulk geometry, a geodesic/interval correspondence, and—if entropy is invoked—a holographic quantum state satisfying additional conditions. A causal-set embedding into an arbitrary Lorentzian manifold does not automatically produce a holographic kinematic space.

## 4. The constraints inherited from a continuum embedding

### 4.1 Incidence and containment

Suppose \(\phi:C\rightarrow M\) is order preserving. Every discrete interval \(I(x,y)\) then maps into the continuum diamond \(A(\phi(x),\phi(y))\). Consequently, relations among intervals—overlap, disjointness, shared endpoints, and containment—must be compatible with relations among continuum diamonds.

This is the most robust kinematic constraint because it needs no distance formula. If

\[
I(x,y)\subseteq I(x',y'),
\]

the corresponding kinematic points must occur in the continuum region representing nested diamonds. An alleged embedding that reverses many such relations is not faithful, even if its plotted points look visually plausible.

In interval-based kinematic space, inclusion supplies a causal order. For boundary intervals, Czech and collaborators interpret this order operationally: an interval \(B\) lies in the kinematic past of \(A\) when the reduced density matrix on \(B\) can be obtained from that on \(A\) by tracing out degrees of freedom. Their construction geometrizes interval containment as Lorentzian causality in kinematic space ([Czech et al.](https://arxiv.org/abs/1505.05515)).

Thus the embedding constrains the **light-cone structure** of kinematic space before it determines any kinematic distance. Nested intervals must be causally related; intervals whose endpoint variations have opposite nesting behavior lie in other causal sectors.

### 4.2 Conformal geometry

Because continuum causal order fixes a Lorentzian metric only up to a positive conformal factor, the order-induced geometry of interval space is likewise initially conformal. It determines which infinitesimal changes of endpoints are null, timelike, or spacelike in the auxiliary geometry, but not the normalization of their squared separation.

For intervals labelled by two endpoint coordinates \((u,v)\), the most general two-dimensional metric compatible with null coordinate directions has the local form

\[
ds_K^2=F(u,v)\,du\,dv,
\]

up to signature and normalization conventions. The order structure tells us that the \(u=\text{constant}\) and \(v=\text{constant}\) directions are null. It does not, by itself, determine \(F(u,v)\).

This is the kinematic-space counterpart of the conformal ambiguity in spacetime. Inferring a particular \(F\), a de Sitter radius, or a curvature scalar from the Hasse diagram alone would be an invalid promotion of causal information into metric information.

### 4.3 Volume and scale from counting

A faithful Poisson embedding adds statistical volume data. For comparable elements,

\[
|I(x,y)|\approx \rho\,\operatorname{Vol}\!\left(A(\phi(x),\phi(y))\right).
\]

In \(d\)-dimensional Minkowski spacetime, the volume of an Alexandrov interval scales as

\[
V_d(\tau)=\kappa_d\,\tau^d,
\]

where \(\tau\) is the proper time between its tips and \(\kappa_d\) is a dimension-dependent constant. Once \(d\), \(\rho\), and \(\kappa_d\) are known,

\[
\tau\approx
\left(\frac{|I(x,y)|}{\rho\kappa_d}\right)^{1/d}.
\]

This is not an exact distance assigned by order. It is an estimator justified by an embedding model, an assumed dimension, and large-number statistics.

Related estimators use the ordering fraction

\[
r=\frac{2R}{N(N-1)},
\]

where \(R\) is the number of related unordered pairs among \(N\) elements. For sprinklings into flat Alexandrov intervals, its expectation depends on dimension. Agreement among several estimators can support a proposed continuum dimension, but it does not prove unique embeddability.

Longest chains provide another bridge to timelike distance. In a dense sprinkling, the length of a longest chain between two comparable elements scales with continuum proper time after a dimension- and density-dependent calibration. Again, the metric estimate comes from the statistical behavior of an ensemble of embeddings—not from the mere fact that a chain exists.

### 4.4 Curvature and nonuniform kinematic density

Curvature changes the volumes and shapes of small causal diamonds relative to flat spacetime. Accordingly, deviations in interval abundances and discrete differential operators can carry curvature information. Benincasa and Dowker constructed retarded causal-set operators that approximate the continuum d’Alembertian in suitable manifoldlike causal sets; in curved spacetime, the continuum limit contains a scalar-curvature contribution \(\Box-\tfrac12R\) in the setting they analyze ([Benincasa and Dowker, “The Scalar Curvature of a Causal Set”](https://arxiv.org/abs/1001.2725)).

This matters for kinematic space because its measure is generally not uniform. If nearby continuum diamonds contain systematically different expected numbers of elements, their corresponding region in interval space acquires a position-dependent density. After smoothing over many elements, that density can constrain the conformal factor \(F(u,v)\), the volume form, or a Crofton measure.

The inference remains indirect:

\[
\text{interval statistics}
\longrightarrow
\text{continuum volume/curvature estimates}
\longrightarrow
\text{kinematic measure or metric}.
\]

Each arrow depends on assumptions and can fail independently.

## 5. Worked continuum example: intervals in vacuum \(\mathrm{AdS}_3\)

On a static slice of pure \(\mathrm{AdS}_3\), oriented geodesics can be labelled by boundary endpoints \(u<v\). Equivalently, write

\[
\theta=\frac{u+v}{2},
\qquad
\alpha=\frac{v-u}{2},
\]

where \(\theta\) is the interval center and \(\alpha\) its half-opening angle.

For the hyperbolic plane, the invariant Crofton form is

\[
\omega
=
\frac{1}{2\sin^2\!\left(\frac{v-u}{2}\right)}
\,du\wedge dv,
\]

up to the stated orientation convention. Czech and collaborators derive this form and use the Crofton relation

\[
\operatorname{length}(\gamma)
=
\frac14\int_K \omega\,n_\gamma,
\]

where \(n_\gamma\) counts intersections between the bulk curve \(\gamma\) and the geodesic represented by a point of \(K\) ([Czech et al.](https://arxiv.org/abs/1505.05515)).

In holographic normalization, the corresponding expression is

\[
\frac{\operatorname{length}(\gamma)}{4G}
=
\frac14\int_K \omega\,n_\gamma.
\]

The associated kinematic metric is conformal to \(du\,dv\), with the same endpoint-dependent density. In \((\theta,\alpha)\) coordinates it has the de Sitter form, up to overall sign and scale convention,

\[
ds_K^2
\propto
\frac{-d\alpha^2+d\theta^2}{\sin^2\alpha}.
\]

What would a causal-set approximation constrain?

- The endpoint or interval order constrains which kinematic directions are null and which pairs of intervals are nested.
- Counts inside corresponding causal regions constrain the continuum volume scale.
- A recovered bulk metric constrains which geodesics the kinematic points represent.
- Intersection counts approximate the discrete analogue of \(n_\gamma\).
- Only after these ingredients are supplied can one approximate the Crofton density.

The de Sitter result is therefore not a universal consequence of discreteness. It follows from the highly symmetric hyperbolic bulk geometry. A different embedded manifold generally produces a different geodesic space and a nonconstant kinematic curvature.

## 6. Information-theoretic geometry—and its limits

In a two-dimensional holographic conformal field theory, the Ryu–Takayanagi relation identifies the entropy of a suitable boundary interval with the length of an associated bulk extremal geodesic divided by \(4G\). In that setting, the kinematic two-form can be written schematically as

\[
\omega(u,v)
=
\frac{\partial^2 S(u,v)}
     {\partial u\,\partial v}
\,du\wedge dv,
\]

subject to coordinate and sign conventions. Infinitesimal kinematic volumes then correspond to conditional mutual information for neighboring intervals, and strong subadditivity supplies the appropriate positivity property. These relationships are central results of the holographic kinematic-space construction, not general identities for arbitrary causal sets ([Czech et al.](https://arxiv.org/abs/1505.05515)).

A faithful causal-set embedding can constrain the geometric side of this correspondence: geodesic incidence, lengths after calibration, and Crofton volumes. It does not by itself provide a Hilbert space, quantum state, reduced density matrices, or von Neumann entropies. Therefore,

\[
\text{causal-set interval count}
\neq
\text{entanglement entropy}
\]

without an independently justified dictionary. Treating cardinality as entropy merely because both are dimensionless would be an unsupported identification.

Even within holography, the simple interval/geodesic picture has a restricted domain. It is clearest for static, asymptotically \(\mathrm{AdS}_3\) geometries and boundary intervals whose relevant extremal surfaces are geodesics. Time dependence, multiple extremal surfaces, entanglement shadows, horizons, conjugate points, or nontrivial topology can obstruct a one-to-one reconstruction. Czech and collaborators explicitly note that reconstruction from geodesic data is well behaved when the bulk has no conjugate points ([Czech et al.](https://arxiv.org/abs/1505.05515)).

## 7. Failure cases and unresolved questions

### Nonmanifoldlike orders

Most finite posets should not be presumed to approximate low-dimensional Lorentzian manifolds. Passing one dimension estimator or producing an attractive coordinate plot is only evidence, not proof. Henson emphasizes both the prevalence of nonmanifoldlike causal sets and the absence, in the studied framework, of a complete practical criterion for faithful embeddability ([Henson](https://arxiv.org/abs/gr-qc/0601069)).

### Finite-size fluctuations

Sparse intervals have large Poisson noise. At small cardinality, two continuum regions with meaningfully different volumes can produce the same element count, while regions of equal volume can produce different counts. Fine kinematic curvature inferred at that scale may be sampling noise.

### Conformal degeneracy

Order alone cannot select \(\Omega(x)\) in \(g'=\Omega^2g\). Any proposed kinematic metric normalization derived purely from comparability is therefore underdetermined. Density, a volume measure, boundary lengths, or equivalent scale data must enter.

### Approximate versus exact embedding

Adding or deleting a few elements may destroy exact embeddability even when the causal set remains close to a manifoldlike sample. Henson’s reconstruction algorithm was designed as an approximate procedure for finite causal-set intervals and was tested specifically in two-dimensional Minkowski settings; it is not a proof that arbitrary causal sets possess faithful continuum embeddings ([Henson](https://arxiv.org/abs/gr-qc/0601069)).

### Uniqueness

The causal-set **Hauptvermutung** proposes, roughly, that one causal set should not faithfully approximate two macroscopically inequivalent spacetimes. A fully general uniqueness theorem of the required strength is not established. Until such uniqueness is secured in the relevant class, a causal set may constrain a family of candidate kinematic geometries more strongly than it selects one exact geometry.

### No general causal-set-to-kinematic-space theorem

The reviewed primary literature establishes important pieces: causal reconstruction, statistical embeddings, curvature estimators, and holographic kinematic geometry. It does not establish a universal functor taking every causal set to a unique smooth kinematic manifold with a canonical metric. Any such construction should be presented as a model or proposal unless its existence, convergence, and uniqueness have been proved for the specified class.

## 8. Resolvable exercises

### Exercise 1: order is not distance

Consider three events on the time axis of Minkowski spacetime:

\[
a=(0,0),\qquad b=(1,0),\qquad c=(10,0).
\]

They form the chain \(a\prec b\prec c\).

1. What part of this information survives if only the partial order is retained?
2. Can the order alone determine whether \(\tau(a,b)=1\) and \(\tau(b,c)=9\), rather than \(4\) and \(6\)?

**Resolution:** Only the sequence \(a\prec b\prec c\) survives. Both proposed assignments are compatible with the same three-element chain. Inferring the metric gaps from the order is invalid.

### Exercise 2: causal diamond

In \(1+1\)-dimensional Minkowski spacetime, let \(p=(0,0)\) and \(q=(2,0)\). Show that the diamond \(A(p,q)\) is bounded by the null lines

\[
x=\pm t,
\qquad
x=\pm(2-t).
\]

**Resolution:** Future-directed causal curves from \(p\) require \(|x|\le t\); causal curves reaching \(q\) require \(|x|\le 2-t\). Their intersection is the diamond. The construction uses light cones, not Euclidean circles.

### Exercise 3: interval-space order

Let \(x_0\prec x_1\prec x_2\prec x_3\) be a four-element chain. Compare the intervals \(I(x_0,x_3)\) and \(I(x_1,x_3)\).

**Resolution:** With open intervals,

\[
I(x_0,x_3)=\{x_1,x_2\},
\qquad
I(x_1,x_3)=\{x_2\},
\]

so the second is contained in the first. The corresponding kinematic points are causally comparable under the interval-containment order.

### Exercise 4: statistical scale

A sprinkling density is \(\rho=100\) elements per unit spacetime volume. A diamond contains \(N=900\) elements.

1. Estimate its volume.
2. Estimate the characteristic relative Poisson fluctuation.

**Resolution:**

\[
V\approx \frac{N}{\rho}=9,
\qquad
\frac{\sigma_N}{N}\approx \frac1{\sqrt{900}}=\frac1{30}\approx3.3\%.
\]

The result is an estimator with sampling uncertainty, not an exact volume identity.

### Exercise 5: what entropy requires

Suppose a causal set supplies interval cardinalities and inclusion relations but no quantum state. Is the quantity \(|I(x,y)|\) automatically a von Neumann entropy?

**Resolution:** No. Von Neumann entropy requires a density operator and a subsystem decomposition. Cardinality can estimate spacetime volume under a faithful sprinkling, but an entropy interpretation requires additional quantum and, in the discussed example, holographic assumptions.

## Conclusion

Embedding a causal set into a continuous Lorentzian manifold constrains kinematic space in layers. Order preservation first fixes incidence, interval containment, and the auxiliary causal structure. Continuum causal-reconstruction results then support recovery of a conformal geometry when their distinguishing and regularity hypotheses hold. Statistical uniformity adds volume through element counts, permitting calibrated estimates of dimension, proper time, curvature, and the kinematic measure. In special holographic geometries, that measure becomes a Crofton form related to geodesic lengths and conditional mutual information.

None of these layers should be collapsed into the claim that causal order directly gives metric distance. The strongest justified statement is instead:

\[
\boxed{
\text{faithful order}
+\text{statistical volume}
+\text{continuum and geometric assumptions}
\;\Longrightarrow\;
\text{a constrained, approximate kinematic geometry}
}
\]

The result is exact only in idealized continuum constructions. For finite causal sets it is statistical; for nonmanifoldlike orders it may fail; and in the absence of a uniqueness theorem it may select a class of continuum kinematic geometries rather than a single one.

## References

- A. V. Levichev, [“The causal structure of a Lorentzian manifold determines its conformal geometry”](https://www.mathnet.ru/eng/dan8158), 1987.
- Joe Henson, [“Constructing an interval of Minkowski space from a causal set”](https://arxiv.org/abs/gr-qc/0601069), 2006.
- Dionigi M. T. Benincasa and Fay Dowker, [“The Scalar Curvature of a Causal Set”](https://arxiv.org/abs/1001.2725), 2010.
- Bartłomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515), 2015.
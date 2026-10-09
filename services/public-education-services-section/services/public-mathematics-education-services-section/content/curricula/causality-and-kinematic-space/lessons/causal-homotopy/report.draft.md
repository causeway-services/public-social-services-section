# Causal Diamonds and Homotopy in Kinematic Space

## The short answer

Causal diamonds can help define or compute homotopy classes of loops in kinematic space, but only after several choices and hypotheses are made explicit. A causal diamond is a region determined by causal order. A homotopy class, by contrast, is defined by continuous deformation in a topology. Causal order therefore does not automatically supply homotopy classes, nor does it assign lengths to loops.

There are two defensible constructions:

1. **Topology from diamonds.** If kinematic space is a sufficiently well-behaved Lorentzian manifold—strong causality is the standard sufficient condition—small Alexandrov diamonds form a basis for its manifold topology. Ordinary loop homotopy can then be defined using that recovered topology.

2. **A combinatorial model from a diamond cover.** If kinematic space admits a locally finite cover by suitably small causal diamonds whose nonempty finite intersections are contractible, the nerve of the cover has the same homotopy type as the covered space. Edge loops in that nerve can then represent ordinary homotopy classes.

Neither statement means that a loop must be future-directed causal. In a causal spacetime, a nonconstant closed future-directed causal curve is forbidden. The relevant loops are ordinary continuous loops assembled from, or tracked through, causal diamonds. A distinct notion of “causal-path homotopy” can be proposed, but it is additional structure and need not coincide with the ordinary fundamental group.

For the canonical example—kinematic space of oriented geodesics on a static slice of pure \(\mathrm{AdS}_3\)—the space is two-dimensional de Sitter space, topologically a cylinder. Its ordinary fundamental group is therefore

\[
\pi_1(K)\cong \mathbb Z.
\]

A loop’s integer class is its winding number around the angular direction. Small causal diamonds can detect that global topology through their overlap pattern, even though every sufficiently small diamond is itself contractible.

## 1. Prerequisites: three different structures

The lesson requires keeping three structures separate.

### 1.1 Causal order

Let \(K\) be a time-oriented Lorentzian space. Write

\[
p\ll q
\]

when \(q\) lies in the chronological future of \(p\), meaning that a future-directed timelike curve connects them. One may instead use \(p\leq q\) for causal reachability, allowing null curves and equality. With suitable causality assumptions, reachability is reflexive, transitive, and antisymmetric, and hence a partial order.

This order says which events can causally precede which others. It does **not** say how many metres or seconds separate them. Multiplying a Lorentzian metric \(g\) by any smooth positive conformal factor,

\[
g'=\Omega^2 g,\qquad \Omega>0,
\]

preserves the light cones and causal relations while generally changing proper times, spacelike lengths, volumes, and curvature. Results surveyed by Parrikar and Surya emphasize that causal structure can determine conformal spacetime geometry under appropriate distinguishing conditions, not a fully normalized metric by itself ([Parrikar and Surya, *Causal Topology in Future and Past Distinguishing Spacetimes*](https://arxiv.org/abs/1102.0936)).

This is the essential negative control: **causal comparability is not metric distance**.

### 1.2 Causal diamonds

For \(p\ll q\), the open Alexandrov interval, or causal diamond, is

\[
A(p,q)=I^+(p)\cap I^-(q).
\]

It consists of events chronologically after \(p\) and before \(q\). In \(1+1\)-dimensional Minkowski coordinates \((t,x)\), introduce null coordinates

\[
u=t-x,\qquad v=t+x.
\]

If \(p=(u_p,v_p)\) and \(q=(u_q,v_q)\) with \(u_p<u_q\) and \(v_p<v_q\), then

\[
A(p,q)=
\{(u,v):u_p<u<u_q,\;v_p<v<v_q\}.
\]

Thus a diamond is an open rectangle in null coordinates. Locally it is contractible.

In a strongly causal spacetime, Alexandrov diamonds generate the same topology as the manifold’s original topology. Outside that regime, the Alexandrov topology may be too coarse; causal order alone can then fail to reproduce the intended local topology. Parrikar and Surya specifically study how weaker future-and-past distinguishing conditions complicate this recovery problem and motivate a topology finer than the ordinary Alexandrov topology ([Parrikar and Surya](https://arxiv.org/abs/1102.0936)).

### 1.3 Homotopy

A loop based at \(x_0\in K\) is a continuous map

\[
\gamma:S^1\to K,\qquad \gamma(1)=x_0.
\]

Two based loops \(\gamma_0\) and \(\gamma_1\) are homotopic if there is a continuous map

\[
H:S^1\times[0,1]\to K
\]

such that

\[
H(s,0)=\gamma_0(s),\qquad
H(s,1)=\gamma_1(s),\qquad
H(1,\lambda)=x_0.
\]

The resulting equivalence classes form the fundamental group \(\pi_1(K,x_0)\). This definition depends on the topology of \(K\), not on a Lorentzian metric or causal order by itself.

Consequently, the phrase “define homotopy using causal diamonds” is incomplete until one specifies whether diamonds are being used:

- as a basis for a topology;
- as elements of an open cover whose nerve models the topology; or
- as objects in a new, specifically causal equivalence relation.

These are related but inequivalent constructions.

## 2. What kinematic space is

In the best-developed holographic example, begin with a two-dimensional spatial bulk geometry \(M\), such as the hyperbolic plane forming a constant-time slice of pure \(\mathrm{AdS}_3\). Its kinematic space \(K_M\) is the space of oriented boundary-anchored geodesics in \(M\). Equivalently, its points can be labelled by oriented boundary intervals.

Let \(u\) and \(v\) be the ordered boundary endpoints of an interval. A point of kinematic space is then

\[
(u,v),\qquad u\neq v.
\]

For a circular boundary it is often useful to write

\[
u=\theta-\alpha,\qquad v=\theta+\alpha,
\]

where \(\theta\) is the interval’s centre and \(0<\alpha<\pi\) is its half-opening angle. Because \(\theta\) is periodic,

\[
\theta\sim\theta+2\pi,
\]

the parameter space is topologically

\[
K\simeq S^1\times(0,\pi)\simeq S^1\times\mathbb R.
\]

Czech, Lamprou, McCandlish, and Sully identify this kinematic space for pure \(\mathrm{AdS}_3\) with two-dimensional de Sitter space and interpret its Lorentzian causal ordering as interval containment ([Czech et al., *Integral Geometry and Holography*](https://arxiv.org/html/1505.05515v1)). Zhang and Chen give the corresponding de Sitter metric as

\[
ds_K^2=
\frac{-d\alpha^2+d\theta^2}{\sin^2\alpha},
\]

with \(0<\alpha<\pi\) and periodic \(\theta\) ([Zhang and Chen, *Kinematic Space and Wormholes*](https://arxiv.org/html/1610.07134v2)).

A crucial change of level has occurred:

- a **point in the physical spatial slice** is a bulk location;
- a **point in kinematic space** is an entire bulk geodesic or boundary interval;
- a **region in kinematic space** is a family of geodesics or intervals.

Confusing these levels makes statements about causal diamonds ambiguous.

## 3. Causal order as interval inclusion

Suppose \(A=(u_A,v_A)\) and \(B=(u_B,v_B)\) are boundary intervals. If \(B\subset A\), the reduced state on \(B\) can be obtained by partially tracing degrees of freedom from the state on \(A\). In the convention used by Czech and collaborators, \(B\) lies in the causal past of \(A\) in kinematic space when this partial-trace relation holds ([Czech et al.](https://arxiv.org/html/1505.05515v1)).

In endpoint coordinates, interval inclusion imposes inequalities on both endpoints. Locally these inequalities are precisely the inequalities that define Lorentzian past and future sets. Null changes move only one endpoint; timelike changes move both endpoints so that one interval contains the other; spacelike-separated points correspond to overlapping interval data with neither interval containing the other. The causal structure therefore records **nestedness**, not physical signal propagation between bulk geodesics.

A kinematic causal diamond bounded by four endpoint constraints is a family of intervals. Its infinitesimal volume form can be written

\[
\omega(u,v)
=
\frac{\partial^2 S(u,v)}{\partial u\,\partial v}\,
du\wedge dv,
\]

where \(S(u,v)\) is the geodesic length in the chosen holographic normalization, or the interval entanglement entropy when the Ryu–Takayanagi relation applies ([Czech et al.](https://arxiv.org/html/1505.05515v1)).

For three adjacent boundary regions

\[
A=(u-du,u),\qquad
B=(u,v),\qquad
C=(v,v+dv),
\]

the infinitesimal diamond volume is

\[
\begin{aligned}
I(A:C\mid B)
&=S(AB)+S(BC)-S(B)-S(ABC)\\
&\approx
\frac{\partial^2S(u,v)}{\partial u\,\partial v}\,du\,dv
\geq 0.
\end{aligned}
\]

The inequality is strong subadditivity. Finite rectangles are assembled using the conditional-mutual-information chain rule,

\[
I(A:CD\mid B)
=
I(A:C\mid B)+I(A:D\mid BC),
\]

which geometrically corresponds to adding adjacent kinematic regions ([Czech et al.](https://arxiv.org/html/1505.05515v1)).

This is an established correspondence within the stated static holographic setting. It does **not** imply that the area of every causal diamond in every proposed kinematic space is an entropy, nor that entropy determines global homotopy. Entropic density supplies a Lorentzian measure; topology requires additional global information about how the parameter space is identified and covered.

## 4. Construction I: diamonds as a topological basis

Assume that kinematic space \(K\) is a strongly causal Lorentzian manifold. Define a collection

\[
\mathcal B=\{A(p,q):p\ll q\}.
\]

Under strong causality, every manifold-open neighbourhood of a point contains a sufficiently small Alexandrov diamond around that point. The collection \(\mathcal B\) is therefore a basis for the manifold topology.

One can now define continuity without first mentioning coordinates: a set \(O\subset K\) is open when it is a union of members of \(\mathcal B\). Loop homotopy is then the ordinary topological definition applied to this diamond-generated topology.

In this qualified sense, **causal diamonds can be used to define homotopy classes**. More precisely, they define the open sets from which continuity and homotopy are defined.

Several limitations matter:

- Strong causality, or another condition proving equivalence with the intended topology, cannot simply be omitted.
- The diamonds must be diamonds **in kinematic space**, not in the original bulk spacetime.
- Knowing only that two kinematic points are comparable does not automatically provide the full set of points, its identifications, or a reliable topology.
- A conformal rescaling leaves the diamond basis unchanged while altering metric volumes and lengths. The resulting homotopy classes are therefore conformal-topological data, not metric measurements.

This construction also clarifies why a homotopy loop is not generally a causal loop. The loop may move alternately toward larger and smaller intervals, or through spacelike directions. Requiring its tangent to be everywhere future-directed would prevent it from closing in a causal spacetime.

## 5. Construction II: the nerve of a diamond cover

A more computational construction replaces the continuum by overlap data.

Choose a cover

\[
\mathcal U=\{D_i\}_{i\in I}
\]

of \(K\) by sufficiently small causal diamonds. Form its nerve \(N(\mathcal U)\):

- one vertex for each \(D_i\);
- an edge between \(D_i\) and \(D_j\) when \(D_i\cap D_j\neq\varnothing\);
- a filled triangle when \(D_i\cap D_j\cap D_k\neq\varnothing\);
- higher-dimensional simplices for higher nonempty intersections.

If every nonempty finite intersection of covering diamonds is contractible, the cover is a **good cover**. The nerve theorem then identifies the homotopy type of the nerve with that of \(K\). A continuous loop can be approximated by a sequence of diamonds it visits,

\[
D_{i_0},D_{i_1},\ldots,D_{i_n}=D_{i_0},
\]

producing an edge loop in the nerve. Filling triangles supplies elementary deformations of that edge loop. The resulting edge-loop classes compute \(\pi_1(K)\).

The contractibility condition is substantive. Although individual small diamonds in a convex normal neighbourhood are contractible, intersections of arbitrary large diamonds need not be. Horizons, excised regions, quotient identifications, caustics, phase-transition loci, or incomplete interval families can invalidate the good-cover assumptions. In those cases the nerve still describes the chosen cover, but it is not automatically a faithful model of \(K\).

There is also a scale problem. If sampled diamonds are too large, they may bridge a genuine hole and erase a homotopy class. If they are too small or the sampling is sparse, false gaps may appear. A robust computation should therefore show stability under refinement rather than report the fundamental group of a single arbitrary discretization.

## 6. Worked example: pure \(\mathrm{AdS}_3\) kinematic space

Consider

\[
K=\{(\theta,\alpha):
\theta\in\mathbb R/2\pi\mathbb Z,\;
0<\alpha<\pi\}.
\]

Define a deformation retraction

\[
H\big((\theta,\alpha),s\big)
=
\left(\theta,(1-s)\alpha+s\frac{\pi}{2}\right).
\]

At \(s=0\), \(H\) is the identity. At \(s=1\), every point lies on the central circle \(\alpha=\pi/2\). Thus

\[
K\simeq S^1
\]

and

\[
\pi_1(K)\cong\pi_1(S^1)\cong\mathbb Z.
\]

Representative loops are

\[
\gamma_n(\lambda)
=
\left(\theta_0+2\pi n\lambda\!\!\!\pmod{2\pi},
\frac{\pi}{2}\right),
\qquad 0\leq\lambda\leq1.
\]

The integer \(n\) is the winding number. A loop with \(n=0\) is contractible; one with \(n\neq0\) is not.

Cover the cylinder by narrow diamonds whose angular widths are less than \(2\pi\). Locally each looks like an open rectangle in null coordinates. Arrange them cyclically around \(\theta\). Their nerve contains a cycle winding once around the cover. Local overlaps and filled triangles permit small deformations, but they do not fill the global cyclic hole. The nerve therefore recovers the \(\mathbb Z\) winding classification.

This example also exposes an invalid metric inference. The loops

\[
\gamma_1(\lambda)
=
(2\pi\lambda,\pi/2)
\]

and

\[
\widetilde\gamma_1(\lambda)
=
(2\pi\lambda,\pi/3)
\]

have the same winding class, yet their metric lengths under the de Sitter metric need not agree. Conversely, changing the metric by a positive conformal factor preserves the causal diamonds and winding classes while changing those lengths. Homotopy records obstruction to contraction, not distance travelled.

## 7. Quotients, wormholes, and what changes globally

For quotient geometries such as BTZ black holes and multiboundary wormholes, the underlying geodesic families and their identifications are more complicated. Zhang and Chen construct fundamental regions in kinematic space by tracking the action of discrete Fuchsian-group elements and show that a hyperbolic transformation determines a timelike geodesic in kinematic space; in their construction, an associated timelike separation encodes a BTZ horizon length ([Zhang and Chen](https://arxiv.org/html/1610.07134v2)).

This is strong evidence that quotient data can leave global and metric signatures in kinematic space. It is not, however, a general theorem saying that causal diamonds alone reconstruct every wormhole’s fundamental group. One must still specify:

- whether geodesics are oriented;
- which geodesic sectors are included;
- whether winding geodesics count as distinct points;
- which quotient identifications act on kinematic space;
- whether entanglement phase transitions create nonsmooth or degenerate loci;
- and whether the selected diamond cover remains good across those loci.

Two constructions using different geodesic sectors may produce different kinematic spaces and hence different homotopy groups even when they refer to the same bulk quotient. “The topology of kinematic space” is therefore model-dependent until its point set and identifications are fixed.

## 8. A distinct possibility: causal-path homotopy

One could instead define an equivalence relation on causal paths by allowing deformations that remain causal at every stage. That is not ordinary loop homotopy. It is closer to directed topology or categorical causal geometry.

Christensen and Crane’s causal-site proposal illustrates this distinction. Their basic objects are spacetime regions equipped with both containment and causal precedence. They construct classifying-space-like objects from sequences of causally related regions and refinements of causal paths, proposing these structures as candidates for relational quantum geometry ([Christensen and Crane, *Causal Sites as Quantum Geometry*](https://arxiv.org/abs/gr-qc/0410104)).

That work establishes a mathematically explicit proposal, not a standard equivalence between causal-site homotopy and the fundamental group of holographic kinematic space. Importing it into the present problem would require proving a comparison theorem between:

1. the classifying space built from causal regions and path refinements; and
2. the ordinary topological space of intervals or geodesics.

Without such a theorem, the two notions should be reported separately.

## 9. Exercises with resolutions

### Exercise 1: causal order without distance

Let

\[
g=-dt^2+dx^2,\qquad
g'=e^{2x}(-dt^2+dx^2)
\]

on \(\mathbb R^{1,1}\).

**Question:** Do \(g\) and \(g'\) define the same causal order? Must they assign the same proper time to every timelike curve?

**Resolution:** They have the same light cones because \(g'\) is a positive conformal rescaling of \(g\). Hence their causal orders and Alexandrov diamonds agree. Proper time under \(g'\) contains the position-dependent factor \(e^x\), so it generally differs. Inferring metric distance from causal comparability alone is invalid.

### Exercise 2: topology of the canonical kinematic space

Let \(K=S^1\times(0,\pi)\).

**Question:** Compute \(\pi_1(K)\).

**Resolution:** The interval \((0,\pi)\) contracts to \(\pi/2\), giving a deformation retraction \(K\to S^1\). Therefore \(\pi_1(K)\cong\mathbb Z\).

### Exercise 3: why future-directed loops fail

**Question:** Can a nonconstant loop in a causal kinematic spacetime be everywhere future-directed causal?

**Resolution:** No. Such a loop would be a closed causal curve. Causality excludes closed causal curves. Loops representing \(\pi_1(K)\) must therefore be ordinary continuous loops, not necessarily causal curves.

### Exercise 4: diamond volumes and information

For adjacent regions \(A,B,C\), calculate

\[
S(AB)+S(BC)-S(B)-S(ABC).
\]

**Resolution:** This is \(I(A:C\mid B)\), the conditional mutual information, and it is nonnegative by strong subadditivity. In the static holographic construction of Czech and collaborators, it represents the Crofton volume of the corresponding kinematic rectangle ([Czech et al.](https://arxiv.org/html/1505.05515v1)). The correspondence is conditional on that construction; it is not a universal definition of entropy for arbitrary Lorentzian diamonds.

## Conclusion

Causal diamonds can support a rigorous definition or computation of loop homotopy in kinematic space, but the exact claim should be:

> When causal diamonds generate the intended topology—or form a good cover whose nerve reproduces that topology—ordinary homotopy classes of loops can be recovered from them.

The causal order supplies interval containment and light-cone structure. It does not by itself supply metric distance, and future-directed causal paths do not ordinarily form closed loops. In pure \(\mathrm{AdS}_3\) kinematic space, the global cylinder topology produces \(\pi_1\cong\mathbb Z\), while local diamonds provide contractible pieces whose overlap pattern detects winding. Entropic quantities measure certain kinematic volumes in the static holographic regime, but they do not automatically determine global topology.

For quotient geometries, incomplete geodesic families, non-strongly-causal spaces, or coarse discrete data, the construction requires additional analysis. A specifically causal homotopy theory is also possible, but it is a new directed or categorical invariant and should not be identified with ordinary homotopy without a proof.

## References

- Bartłomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/html/1505.05515v1), 2015.
- Jian-dong Zhang and Bin Chen, [“Kinematic Space and Wormholes”](https://arxiv.org/html/1610.07134v2), 2017.
- Onkar Parrikar and Sumati Surya, [“Causal Topology in Future and Past Distinguishing Spacetimes”](https://arxiv.org/abs/1102.0936), 2011.
- J. Daniel Christensen and Louis Crane, [“Causal Sites as Quantum Geometry”](https://arxiv.org/abs/gr-qc/0410104), 2004.
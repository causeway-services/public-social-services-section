# Kinematic Space and Entanglement Entropy

## 1. The central idea

Kinematic space is an auxiliary geometry whose points represent extended objects—typically boundary intervals or the bulk geodesics anchored on their endpoints—rather than ordinary locations in physical spacetime. In the best-understood setting, a static state of a two-dimensional conformal field theory (CFT\(_2\)) with a classical asymptotically AdS\(_3\) gravitational dual, the entanglement entropy of every boundary interval supplies both:

1. a causal ordering on the space of intervals, determined by interval containment; and  
2. a measure or Lorentzian metric on that space, determined by second derivatives of entropy.

The resulting construction turns information-theoretic quantities into geometric ones. Infinitesimal conditional mutual information becomes a volume element in kinematic space, while integrals of that volume element reproduce lengths of curves in the bulk. This correspondence was developed explicitly by Czech, Lamprou, McCandlish, and Sully in their work on integral geometry and holography, where kinematic space is simultaneously interpreted as the space of boundary intervals and the space of oriented bulk geodesics ([Czech et al., *Integral Geometry and Holography*](https://arxiv.org/abs/1505.05515)).

The construction is precise, but its domain must be stated carefully. Interval containment and entropy inequalities exist in ordinary quantum field theories, so parts of the kinematic description do not require holography. The interpretation of a kinematic point as a bulk geodesic, and of kinematic volume as a bulk length, requires additional assumptions: a holographic CFT state, an appropriate semiclassical bulk, and the validity of the Ryu–Takayanagi prescription or one of its generalizations.

---

## 2. Prerequisites: regions, reduced states, and entropy

Let a quantum system be divided into a spatial region \(A\) and its complement \(\bar A\). If the complete state is described by a density operator \(\rho\), the reduced state accessible in \(A\) is

\[
\rho_A=\operatorname{Tr}_{\bar A}\rho .
\]

Its von Neumann entropy is

\[
S(A)=-\operatorname{Tr}\!\left(\rho_A\log \rho_A\right).
\]

For a globally pure state, \(S(A)=S(\bar A)\), even though the complete state has zero entropy. This equality reflects entanglement between \(A\) and its complement, not ignorance about a classical ensemble. These definitions, including the reduction by partial trace, appear in the original holographic-entanglement proposal of Ryu and Takayanagi ([Ryu and Takayanagi, 2006](https://arxiv.org/abs/hep-th/0603001)).

For adjoining subsystems \(A,B,C\), the conditional mutual information is

\[
I(A:C\mid B)
   =S(AB)+S(BC)-S(B)-S(ABC).
\]

Strong subadditivity states that

\[
I(A:C\mid B)\geq 0.
\]

This inequality is crucial: in kinematic space it ensures that the proposed local volume density is nonnegative with the chosen orientation. It is therefore not merely an analogy between information and geometry; a quantum entropy inequality supplies the positivity needed to treat an entropy derivative as a geometric measure ([Czech et al.](https://arxiv.org/abs/1505.05515)).

In continuum QFT, the entropy of a sharp spatial region is generally ultraviolet divergent. For a vacuum interval of length \(\ell\) on an infinite line in a CFT\(_2\),

\[
S(\ell)=\frac{c}{3}\log\!\left(\frac{\ell}{\epsilon}\right),
\]

where \(c\) is the central charge and \(\epsilon\) is a short-distance cutoff. On a circle of circumference \(L\), the corresponding vacuum result is

\[
S(\ell)=\frac{c}{3}
\log\!\left[
\frac{L}{\pi\epsilon}
\sin\!\left(\frac{\pi\ell}{L}\right)
\right].
\]

Ryu and Takayanagi explicitly compared this CFT formula with a regulated geodesic length in AdS\(_3\), obtaining the same dependence on \(c\), \(\ell\), \(L\), and the cutoff ([Ryu and Takayanagi, 2006](https://arxiv.org/abs/hep-th/0603001)). Although the entropy itself diverges as \(\epsilon\to0\), suitable differences and endpoint derivatives can eliminate an endpoint-independent regulator term.

---

## 3. Causal order before metric geometry

Consider oriented intervals on a one-dimensional spatial slice. Write an interval as

\[
[u,v], \qquad u<v.
\]

Each ordered pair \((u,v)\) is a point of kinematic space \(\mathcal K\). Orientation matters on a circle: reversing the endpoints changes an interval into its complementary interval and reverses containment relations.

There is a natural partial order:

\[
[u_1,v_1]\preceq [u_2,v_2]
\quad\Longleftrightarrow\quad
[u_1,v_1]\subseteq [u_2,v_2].
\]

This is a partial order because it is reflexive, antisymmetric, and transitive. It is not a total order: two overlapping or disjoint intervals need not contain one another.

The order contains no notion of distance. It tells us whether one interval contains another, but not how much larger it is, how much entropy lies between them, or how far apart their corresponding kinematic points should be. Many inequivalent metric or volume assignments can preserve the same containment relation. This is the essential negative control: **causal comparability alone does not determine metric distance**.

Kinematic space packages interval containment as a Lorentzian causal structure. Two intervals are timelike related when one contains the other. They are null related when they share a left endpoint or share a right endpoint. If neither contains the other, they are generically spacelike related. Czech and collaborators show that \(u\) and \(v\) therefore serve as null coordinates on kinematic space ([Czech et al.](https://arxiv.org/abs/1505.05515)).

This “causality” is not the causal order of events in the original CFT spacetime. It is an emergent order on regions. Its future direction conventionally points toward larger intervals. If \(B\subset A\), the reduced density matrix \(\rho_B\) can be obtained from \(\rho_A\) by tracing out \(A\setminus B\). Thus the causal order also records the direction of quantum-information coarse-graining.

A kinematic causal diamond is the set of intervals lying between a smaller interval and a larger one in this containment order. Its boundaries consist of intervals sharing one endpoint with an extremal interval. This construction uses order alone; assigning a volume to that diamond requires entropy data.

---

## 4. From entropy to the kinematic metric

Let \(S(u,v)\) be the entanglement entropy of the interval \([u,v]\). The central local object is the mixed endpoint derivative

\[
\omega
=
\frac{\partial^2 S(u,v)}{\partial u\,\partial v}\,
du\wedge dv .
\]

This two-form is called the Crofton form in the bulk integral-geometric interpretation. The corresponding Lorentzian line element is conventionally written

\[
ds_{\mathcal K}^{2}
=
\frac{\partial^2 S(u,v)}{\partial u\,\partial v}\,
du\,dv.
\]

Overall conventions can differ, especially in whether a factor of two is absorbed into the definition of \(du\,dv\). The meaningful invariant statements are that \(u\) and \(v\) are null coordinates, that the coefficient is the mixed entropy derivative, and that the associated volume form is the Crofton measure used in the length formula ([Czech et al.](https://arxiv.org/abs/1505.05515)).

Why does the mixed derivative have an information-theoretic meaning? Choose three adjacent small or finite intervals,

\[
A=[u-\delta u,u],\qquad
B=[u,v],\qquad
C=[v,v+\delta v].
\]

Their conditional mutual information is

\[
\begin{aligned}
I(A:C\mid B)
={}&S(u-\delta u,v)+S(u,v+\delta v)\\
&-S(u,v)-S(u-\delta u,v+\delta v).
\end{aligned}
\]

Expanding for small positive \(\delta u,\delta v\) gives

\[
I(A:C\mid B)
=
\frac{\partial^2 S}{\partial u\,\partial v}
\,\delta u\,\delta v
+O(\delta^3).
\]

Consequently, an infinitesimal kinematic area is an infinitesimal conditional mutual information. For finite adjacent intervals, the full conditional mutual information equals the integral of \(\omega\) over the corresponding rectangular causal diamond. Strong subadditivity supplies

\[
\frac{\partial^2 S}{\partial u\,\partial v}\geq 0
\]

where the derivative exists and the orientation is chosen as above. If strong subadditivity is locally saturated, the Crofton density can vanish and the entropy-defined metric becomes degenerate ([Czech et al.](https://arxiv.org/abs/1505.05515)).

This result clarifies what “entanglement builds geometry” means here. The entropy \(S(u,v)\) is not itself a distance between two kinematic points. Rather, its Hessian-like mixed derivative determines the local measure and conformal factor of a Lorentzian geometry on the space of intervals.

---

## 5. Worked example: the vacuum of a CFT\(_2\)

Take a CFT vacuum on a spatial circle and use dimensionless angular coordinates of period \(2\pi\). Up to a cutoff-dependent additive constant,

\[
S(u,v)
=
\frac{c}{3}
\log\!\left[
\frac{2}{\epsilon}
\sin\!\left(\frac{v-u}{2}\right)
\right].
\]

Differentiating gives

\[
\frac{\partial^2 S}{\partial u\,\partial v}
=
\frac{c}{12}
\csc^2\!\left(\frac{v-u}{2}\right).
\]

Hence

\[
ds_{\mathcal K}^{2}
=
\frac{c}{12}
\frac{du\,dv}{\sin^2\!\left(\frac{v-u}{2}\right)}.
\]

Introduce center and half-width coordinates,

\[
\theta=\frac{u+v}{2},
\qquad
\alpha=\frac{v-u}{2}.
\]

Then \(u=\theta-\alpha\), \(v=\theta+\alpha\), and

\[
du\,dv=d\theta^2-d\alpha^2.
\]

Therefore,

\[
ds_{\mathcal K}^{2}
=
\frac{c}{12}
\frac{d\theta^2-d\alpha^2}{\sin^2\alpha}.
\]

This is two-dimensional de Sitter geometry up to normalization and signature convention. The coordinate \(\alpha\), which measures interval size, acts as a timelike coordinate; \(\theta\), the interval center, is spacelike. The kinematic space of the static hyperbolic slice of pure AdS\(_3\) is therefore \(dS_2\), and the two orientations of a single bulk geodesic correspond to antipodal kinematic points ([Czech et al.](https://arxiv.org/abs/1505.05515)).

Several lessons follow.

First, the additive cutoff term disappears under \(\partial_u\partial_v\). Second, the causal structure could already be inferred from containment, but the factor \(c\,\csc^2\alpha/12\) cannot: it depends on the state’s entropy. Third, the de Sitter geometry is an auxiliary geometry of intervals, not an assertion that the AdS bulk has physically become de Sitter spacetime.

On an infinite line, using

\[
S(u,v)=\frac{c}{3}\log\!\left(\frac{v-u}{\epsilon}\right),
\]

one instead obtains

\[
ds_{\mathcal K}^{2}
=
\frac{c}{3}\frac{du\,dv}{(v-u)^2}.
\]

This is another coordinate patch of \(dS_2\). The circle and line expressions differ because of their global spatial geometry, while their local conformal structure is consistent.

---

## 6. Why bulk geodesics enter

The Ryu–Takayanagi prescription states that, for an appropriate static holographic state,

\[
S(A)=\frac{\operatorname{Area}(\gamma_A)}{4G_N},
\]

where \(\gamma_A\) is the minimal bulk codimension-two surface homologous to \(A\). In AdS\(_3\), \(\gamma_A\) is a spacelike geodesic, so

\[
S(u,v)=\frac{\operatorname{Length}(\gamma_{u,v})}{4G_N}.
\]

Ryu and Takayanagi checked that regulated geodesic lengths in AdS\(_3\) reproduce the known vacuum and thermal CFT\(_2\) interval entropies; for example, at inverse temperature \(\beta\),

\[
S_\beta(\ell)
=
\frac{c}{3}
\log\!\left[
\frac{\beta}{\pi\epsilon}
\sinh\!\left(\frac{\pi\ell}{\beta}\right)
\right]
\]

for an interval of length \(\ell\) on an infinite line ([Ryu and Takayanagi, 2006](https://arxiv.org/abs/hep-th/0603001)).

Thus one kinematic point has two equivalent labels in this regime:

\[
\text{boundary interval }[u,v]
\quad\longleftrightarrow\quad
\text{boundary-anchored bulk geodesic }\gamma_{u,v}.
\]

Integral geometry then supplies a Crofton formula. If \(\gamma\) is a bulk curve and \(n_\gamma(u,v)\) counts how many times the geodesic \(\gamma_{u,v}\) intersects it, then the normalization used by Czech and collaborators is

\[
\frac{\operatorname{Length}(\gamma)}{4G_N}
=
\frac14
\int_{\mathcal K}
\omega(u,v)\,n_\gamma(u,v).
\]

For a closed convex curve, almost every intersecting geodesic crosses it twice; tangent geodesics form a measure-zero boundary of the relevant kinematic region. The formula therefore says that a bulk length is the weighted volume of the set of geodesics intersecting that curve ([Czech et al.](https://arxiv.org/abs/1505.05515)).

Combining this formula with the information-theoretic interpretation of \(\omega\), a bulk curve’s length is an aggregate of conditional mutual informations. That is stronger and more precise than saying simply that “entanglement corresponds to area”: changes of entropy across neighboring intervals furnish the local density whose integral measures bulk curves.

A bulk point is represented nonlocally in kinematic space. The collection of all geodesics passing through a given bulk point forms a one-dimensional “point-curve” in the two-dimensional kinematic space. In pure AdS\(_3\), these point-curves are spacelike geodesics of the auxiliary \(dS_2\). Distances between bulk points can be recovered by integrating the Crofton form over geodesics that separate one point from the other, subject to assumptions such as uniqueness of relevant boundary-anchored geodesics ([Czech et al.](https://arxiv.org/abs/1505.05515)).

---

## 7. What is established, and what is conditional

Several layers of the construction have different evidential status.

### General quantum-information structure

Reduced states, von Neumann entropy, conditional mutual information, and strong subadditivity are not holographic assumptions. Interval containment also defines a partial order independently of gravity. Given a sufficiently differentiable interval-entropy function, its mixed derivative can be studied in any 1+1-dimensional QFT state.

However, calling that derivative a nondegenerate Lorentzian metric requires care. It may vanish in some regions, fail to be smooth across phase transitions, or depend on how continuum divergences are regulated. The safest generally valid object is the entropy-derived measure or distribution, not necessarily a smooth metric everywhere.

### Classical holographic correspondence

The identification of interval entropy with geodesic length is a leading semiclassical holographic result. Static situations use the Ryu–Takayanagi minimal surface. Time-dependent states require a covariant extremal-surface prescription: Hubeny, Rangamani, and Takayanagi proposed replacing static minimal surfaces by codimension-two extremal surfaces with appropriate causal and homological conditions ([Hubeny, Rangamani, and Takayanagi](https://arxiv.org/abs/0705.0016)). A kinematic construction restricted to one static slice therefore should not be assumed to describe arbitrary dynamical states unchanged.

### Quantum corrections

At finite bulk Newton constant, boundary entropy is not exhausted by classical area. Faulkner, Lewkowycz, and Maldacena found that the leading bulk quantum correction includes the entanglement entropy of quantum fields across the bulk surface ([Faulkner, Lewkowycz, and Maldacena](https://arxiv.org/abs/1307.2892)). Schematically,

\[
S_{\text{boundary}}(A)
=
\frac{\operatorname{Area}(\gamma_A)}{4G_N}
+
S_{\text{bulk}}(\Sigma_A)
+\cdots .
\]

Consequently, the Hessian of the exact boundary entropy contains both geometric-area and bulk-quantum contributions. Interpreting all of it as a classical density of geodesics would overstate the original Crofton construction.

### Dimensional and geometric limitations

The especially simple two-dimensional kinematic space arises because an interval on a one-dimensional boundary is labeled by two endpoints, and a static AdS\(_3\) geodesic is likewise determined by its boundary endpoints. In higher dimensions, regions and extremal surfaces require more data, and there is no universal direct replacement in which all region entropies form a two-dimensional Lorentzian manifold. The original work discusses higher-dimensional generalizations using spaces of codimension-one totally geodesic surfaces, but the interval/de Sitter picture is special to AdS\(_3\)/CFT\(_2\) ([Czech et al.](https://arxiv.org/abs/1505.05515)).

Multiple geodesics with the same endpoints, conjugate points, horizons, and minimal-surface phase transitions can also obstruct a one-to-one interval–geodesic dictionary. The reconstruction argument is cleanest when relevant boundary points are connected by unique geodesics and the bulk has no conjugate points. Entanglement entropy selects the minimal extremal surface, so nonminimal geodesics are not automatically encoded by single-interval entropy alone.

Finally, entanglement entropy is not generally a directly measured laboratory observable in the same sense as a local correlation function. It is an information-theoretic property of a reduced state and may be estimated indirectly in controlled quantum systems. The kinematic formalism provides a bridge between quantum information and gravitational geometry, not a universal experimental procedure for imaging spacetime.

---

## 8. Exercises with resolutions

### Exercise 1: order is not distance

Suppose four intervals satisfy

\[
A\subset B\subset C,
\qquad
A\subset B'\subset C,
\]

while \(B\) and \(B'\) are incomparable. Can the containment order alone determine whether \(B\) or \(B'\) is metrically closer to \(A\)?

**Resolution:** No. The order fixes only causal comparability. Any positive conformal rescaling of a compatible Lorentzian metric preserves the same null cones and containment relations while changing lengths and volumes. Entropy data such as \(\partial_u\partial_vS\) are required to choose a measure. Inferring numerical distance from the partial order alone is invalid.

### Exercise 2: classify separation

Let \(I_1=[1,4]\). Classify its kinematic relation to \(I_2=[2,3]\), \(I_3=[1,6]\), and \(I_4=[3,5]\).

**Resolution:** \(I_2\subset I_1\), so \(I_1\) and \(I_2\) are timelike related. \(I_1\) and \(I_3\) share their left endpoint and are null related. Neither \(I_1\) nor \(I_4\) contains the other, so they are spacelike related; they overlap, meaning their corresponding bulk geodesics can intersect in the simple AdS\(_3\) setting.

### Exercise 3: derive the vacuum density

Starting from

\[
S(u,v)=\frac{c}{3}\log\!\left(\frac{v-u}{\epsilon}\right),
\]

compute \(\partial_u\partial_vS\).

**Resolution:**

\[
\partial_vS=\frac{c}{3(v-u)},\qquad
\partial_u\partial_vS=\frac{c}{3(v-u)^2}.
\]

The cutoff disappears because it contributes only an additive constant.

### Exercise 4: identify a causal-diamond volume

For adjacent regions \(A,B,C\), what information quantity equals the kinematic volume of the diamond bounded by the intervals \(B\), \(AB\), \(BC\), and \(ABC\)?

**Resolution:**

\[
\operatorname{Vol}_{\mathcal K}
=
S(AB)+S(BC)-S(B)-S(ABC)
=
I(A:C\mid B)\geq0.
\]

### Exercise 5: test the bulk claim

Does a positive function \(\partial_u\partial_vS\) in an arbitrary CFT prove that the theory has a classical AdS\(_3\) dual?

**Resolution:** No. Positivity follows from strong subadditivity under the interval arrangement used above. A classical bulk interpretation additionally requires holographic and semiclassical assumptions, plus control over extremal surfaces and reconstruction ambiguities.

---

## 9. Conclusion

Kinematic space reorganizes interval entanglement into geometry. Interval containment supplies a causal partial order; shared endpoints define null relations; and the mixed derivative of interval entropy supplies a local volume density. Infinitesimal volumes are conditional mutual informations, so strong subadditivity becomes geometric positivity. In the vacuum of a CFT\(_2\), the resulting metric is \(dS_2\).

For holographic CFT states with a suitable semiclassical AdS\(_3\) dual, the same kinematic points label boundary-anchored bulk geodesics. The Ryu–Takayanagi relation turns their lengths into interval entropies, and the Crofton formula turns volumes of sets of geodesics into lengths of bulk curves. This creates a concrete dictionary:

\[
\text{containment}
\leftrightarrow
\text{causal order},
\qquad
\text{conditional mutual information}
\leftrightarrow
\text{kinematic volume},
\qquad
\text{aggregate kinematic volume}
\leftrightarrow
\text{bulk length}.
\]

The dictionary is powerful precisely when its qualifications are preserved. Causal order does not determine metric distance; entropy geometry need not imply a gravitational dual; classical area omits bulk quantum corrections; and the simplest interval construction is special to low-dimensional, well-controlled settings. Within those limits, kinematic space is one of the clearest established examples of information-theoretic relations acquiring a precise auxiliary geometry.

## References

- [B. Czech, L. Lamprou, S. McCandlish, and J. Sully, “Integral Geometry and Holography” (2015)](https://arxiv.org/abs/1505.05515)
- [S. Ryu and T. Takayanagi, “Holographic Derivation of Entanglement Entropy from AdS/CFT” (2006)](https://arxiv.org/abs/hep-th/0603001)
- [V. E. Hubeny, M. Rangamani, and T. Takayanagi, “A Covariant Holographic Entanglement Entropy Proposal” (2007)](https://arxiv.org/abs/0705.0016)
- [T. Faulkner, A. Lewkowycz, and J. Maldacena, “Quantum Corrections to Holographic Entanglement Entropy” (2013)](https://arxiv.org/abs/1307.2892)
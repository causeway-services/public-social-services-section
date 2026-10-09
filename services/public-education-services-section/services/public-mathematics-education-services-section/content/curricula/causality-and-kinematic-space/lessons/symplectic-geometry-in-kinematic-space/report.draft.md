# Symplectic Geometry in Kinematic Space: Can It Encode a Poisson Bracket of Observables?

## Short answer

Yes—but only after specifying what “kinematic space,” “observables,” and “encode” mean.

For the best-understood example—the space of oriented spacelike geodesics on a constant-time slice of pure \(\mathrm{AdS}_3\), equivalently the space of boundary intervals in the vacuum of a two-dimensional conformal field theory—kinematic space carries a nondegenerate closed two-form. This form has three mutually consistent interpretations:

1. it is the Crofton measure used to reconstruct lengths of bulk curves;
2. through holographic entanglement entropy, it is the mixed endpoint derivative  
   \[
   \omega_C=\partial_u\partial_v S(u,v)\,du\wedge dv;
   \]
3. after identifying kinematic space with a coadjoint orbit of \(SO(2,1)\), it is, up to normalization, the orbit’s Kirillov–Kostant symplectic form.

These statements were established explicitly for the static \(\mathrm{AdS}_3\) example in [Czech, Lamprou, McCandlish, and Sully](https://arxiv.org/abs/1505.05515) and [Penna and Zukowski](https://arxiv.org/abs/1812.02176). Because the form is symplectic, its inverse defines a Poisson bracket on smooth functions over kinematic space.

What is *not* established by this result is that arbitrary quantum observables of the boundary theory automatically acquire their physical commutator algebra from this bracket. The proven construction gives a classical Poisson algebra of functions on a phase space of geodesics. Relating selected functions to CFT operators, quantizing the orbit, and establishing equality with a particular operator algebra require additional arguments. Moreover, the extension to generic, weakly symmetric, dynamical spacetimes remains incomplete.

## 1. Prerequisites: three geometries that must not be conflated

### 1.1 Causal order is not metric distance

A partial order is a relation \(\preceq\) that is reflexive, antisymmetric, and transitive. In interval kinematic space, a natural order is inclusion:

\[
I_1\preceq I_2 \quad\Longleftrightarrow\quad I_1\subseteq I_2.
\]

Some pairs are incomparable: neither interval contains the other. This order says which regions include which other regions; by itself it supplies no numerical length, duration, angle, or curvature.

In the holographic construction, a point \((u,v)\) represents the oriented boundary interval \(I=(u,v)\). The original integral-geometry analysis explicitly identifies interval inclusion as a partial order and then introduces a metric as an *additional* object that packages this order together with the Crofton density ([Czech et al., §2.4](https://arxiv.org/pdf/1505.05515)). Thus it would be invalid to reason, “\(I_1\subset I_2\), so the distance between their kinematic-space points is the difference of their endpoint separations.” Inclusion fixes causal comparability, not a distance scale.

### 1.2 Lorentzian causal language

A Lorentzian metric distinguishes timelike, null, and spacelike tangent directions. In two-dimensional kinematic space, the interval endpoints \(u\) and \(v\) act as null coordinates. For the conventional orientation:

- nested intervals are timelike related;
- intervals sharing an endpoint are null related;
- intervals for which neither contains the other are generically spacelike related.

This classification is stated directly for the \(\mathrm{AdS}_3\) construction by both [Czech et al.](https://arxiv.org/pdf/1505.05515) and [Penna and Zukowski](https://arxiv.org/abs/1812.02176). A causal diamond in kinematic space is therefore a set of intervals lying between a smaller and a larger interval under inclusion. It should not be confused with a causal diamond in the original bulk spacetime: kinematic-space points are themselves intervals or geodesics, not bulk events.

### 1.3 Symplectic and Poisson structures

A symplectic form on a smooth manifold \(K\) is a two-form \(\omega\) satisfying

\[
d\omega=0,
\qquad
\omega_p(X,\cdot)=0\ \Longrightarrow\ X=0.
\]

The second condition is nondegeneracy. It implies that \(\omega\) has an inverse bivector \(\Pi=\omega^{-1}\), with a sign depending on the convention used to associate Hamiltonian vector fields to functions. One common convention is

\[
\iota_{X_f}\omega=df,
\qquad
\{f,g\}=\omega(X_f,X_g)=\Pi(df,dg).
\]

Other authors use \(\iota_{X_f}\omega=-df\), reversing the displayed bracket’s overall sign. That convention does not affect antisymmetry, the Leibniz rule, or the Jacobi identity, but it matters in coordinate calculations.

A symplectic structure is richer than a volume element: it identifies differentials of functions with Hamiltonian vector fields and thereby defines a Poisson algebra. It does *not* select a Hamiltonian or a preferred physical time evolution. Those require an additional function \(H\), after which an observable evolves as \(\dot f=\{f,H\}\).

## 2. Constructing kinematic space from intervals and geodesics

Take a static time slice of global \(\mathrm{AdS}_3\). Its spatial geometry is the hyperbolic plane. An oriented boundary-anchored geodesic is fixed by the ordered pair of boundary angles \((u,v)\). It is often useful to write

\[
u=\theta-\alpha,\qquad v=\theta+\alpha,
\]

where \(\theta\) is the angular midpoint and \(\alpha\) is half the opening angle. Consequently, every oriented geodesic becomes one point of a two-dimensional auxiliary manifold \(K\).

In the boundary description, the same ordered pair represents an interval. This creates the chain of identifications

\[
\text{point of }K
\longleftrightarrow
\text{oriented boundary interval}
\longleftrightarrow
\text{oriented bulk geodesic}.
\]

The last equivalence assumes the static \(\mathrm{AdS}_3\) setting and the relevant choice of geodesic. In more complicated geometries, multiple extremal geodesics can share endpoints, so endpoints alone may not label the branches uniquely.

For the vacuum CFT on a circle of circumference \(\Sigma=2\pi R\), Penna and Zukowski use

\[
S_{\mathrm{ent}}(u,v)
 =
 \frac{c}{3}
 \log\!\left[
 \frac{\Sigma}{\epsilon\pi}
 \sin\!\left(\frac{\pi L}{\Sigma}\right)
 \right],
\qquad
L=R(v-u),
\]

where \(\epsilon\) is a UV cutoff and \(c=3\ell/(2G)\) is the Brown–Henneaux central charge in terms of the AdS radius \(\ell\) and three-dimensional Newton constant \(G\) ([Penna and Zukowski, eqs. 3.1–3.2](https://arxiv.org/pdf/1812.02176)). Since \(\pi L/\Sigma=(v-u)/2\), differentiating gives

\[
\partial_u\partial_v S_{\mathrm{ent}}
 =
 \frac{c}{12}
 \csc^2\!\left(\frac{v-u}{2}\right).
\]

The associated two-form is therefore

\[
\boxed{
\omega_C
 =
 \frac{c}{12}
 \csc^2\!\left(\frac{v-u}{2}\right)
 du\wedge dv
}
\]

and, because \(du\wedge dv=2\,d\theta\wedge d\alpha=-2\,d\alpha\wedge d\theta\), it may also be written—after choosing a consistent orientation—as a constant multiple of

\[
\csc^2\alpha\,d\alpha\wedge d\theta.
\]

The sign encountered when changing coordinates is an orientation convention; the source’s displayed convention is

\[
\omega_C=\frac{c}{12}\csc^2\alpha\,d\alpha\wedge d\theta
\]

([Penna and Zukowski, eq. 3.9](https://arxiv.org/abs/1812.02176)).

## 3. Why the Crofton form is symplectic

In two dimensions, every smooth two-form is automatically closed because its exterior derivative would be a three-form. Nondegeneracy is therefore the substantive local condition. Away from degenerate intervals, the coefficient

\[
\Omega(u,v)=\frac{c}{12}\csc^2\!\left(\frac{v-u}{2}\right)
\]

is nonzero, so \(\omega_C=\Omega\,du\wedge dv\) is nondegenerate.

The endpoints \(u=v\) correspond to zero-size intervals. The coefficient diverges there; this is a boundary or limiting locus rather than an ordinary smooth interior point in the coordinate patch. The antipodal or complementary limits similarly require attention to orientation and global identifications. Hence one should say that the regular interior of the oriented-geodesic space is symplectic, not that every naïve endpoint coordinate value belongs to one globally regular chart.

This same two-form is the Crofton measure. For a bulk curve \(\gamma\),

\[
\frac{\operatorname{length}(\gamma)}{4G}
 =
 \frac14\int_K \omega_C(u,v)\,n_\gamma(u,v),
\]

where \(n_\gamma(u,v)\) is the number of intersections between \(\gamma\) and the geodesic represented by \((u,v)\). The normalization, the factor \(1/4\), and the intersection multiplicity are part of the stated holographic Crofton formula, not arbitrary additions ([Czech et al., eq. 2.3](https://arxiv.org/pdf/1505.05515); [Penna and Zukowski, eq. 3.3](https://arxiv.org/pdf/1812.02176)).

Thus a region of kinematic space measures a family of geodesics, while a bulk curve determines such a region through intersection. Geometry on \(K\) is consequently a geometry of regions or probes: integrating over points of \(K\) means aggregating over geodesics, not summing over bulk events.

## 4. The induced Poisson bracket

Let

\[
\omega_C=\Omega(u,v)\,du\wedge dv.
\]

With the convention \(\iota_{X_f}\omega_C=df\), its inverse gives

\[
\boxed{
\{f,g\}_K
 =
 \Omega^{-1}
 \left(
 \partial_u f\,\partial_v g
 -
 \partial_v f\,\partial_u g
 \right)
}
\]

up to the previously noted overall sign convention. For the vacuum circle,

\[
\boxed{
\{f,g\}_K
 =
 \frac{12}{c}
 \sin^2\!\left(\frac{v-u}{2}\right)
 \left(
 \partial_u f\,\partial_v g
 -
 \partial_v f\,\partial_u g
 \right)
}.
\]

In particular,

\[
\{u,v\}_K
 =
 \frac{12}{c}
 \sin^2\!\left(\frac{v-u}{2}\right).
\]

This coordinate bracket is not constant, so \(u\) and \(v\) are not Darboux coordinates. Locally one can define

\[
q=u,\qquad
p(u,v)=\int^v \Omega(u,s)\,ds
       =-\frac{c}{6}\cot\!\left(\frac{v-u}{2}\right)
\]

while holding \(u\) fixed. Then \(dq\wedge dp=\omega_C\), and the bracket becomes the canonical expression \(\{q,p\}=1\), subject again to the chosen sign convention.

This calculation gives a definite affirmative answer: kinematic space supports a Poisson bracket of smooth functions on the space of geodesics. If \(f\) measures some property assigned to each geodesic and \(g\) another, their bracket measures the antisymmetric response generated by their Hamiltonian flows on \(K\).

It does not follow that \(u\) and \(v\) are the position and momentum of an ordinary particle, or that every function on \(K\) is a gauge-invariant observable of quantum gravity. “Phase space of geodesics” means that its points label geodesics on a fixed background; Penna and Zukowski explicitly distinguish this from coadjoint-orbit phase spaces whose points are different spacetime metrics ([Penna and Zukowski, discussion preceding §2](https://arxiv.org/pdf/1812.02176)).

## 5. The coadjoint-orbit mechanism

The deeper reason for the symplectic form comes from representation theory.

For a Lie group \(G\) with Lie algebra \(\mathfrak g\), the dual space \(\mathfrak g^*\) carries the Lie–Poisson bracket

\[
\{F,G\}(\mu)
 =
 \left\langle
 \mu,
 \left[
 \frac{\delta F}{\delta\mu},
 \frac{\delta G}{\delta\mu}
 \right]
 \right\rangle.
\]

Its symplectic leaves are the coadjoint orbits. On an orbit through \(p\), tangent vectors generated by \(\eta,\chi\in\mathfrak g\) have Kirillov–Kostant form

\[
\omega_p(\widetilde\eta,\widetilde\chi)
 =
 \langle p,[\eta,\chi]\rangle.
\]

Penna and Zukowski present this construction and identify the restriction of the Lie–Poisson bracket to each orbit as symplectic ([their §2](https://arxiv.org/abs/1812.02176)).

For the static \(\mathrm{AdS}_3\) slice, the relevant residual symmetry is \(SO(2,1)\). Its Lie algebra can be identified with three-dimensional Minkowski space. Orbits of positive Minkowski norm are single-sheeted hyperboloids,

\[
dS_2\simeq SO(2,1)/SO(1,1).
\]

Meanwhile, the interval space with metric

\[
ds^2=
\frac{c}{12}
\csc^2\!\left(\frac{v-u}{2}\right)du\,dv
\]

is also two-dimensional de Sitter space ([Penna and Zukowski, eq. 3.6](https://arxiv.org/pdf/1812.02176)). In hyperboloid coordinates \((T,\theta')\),

\[
ds^2=\ell^2\csc^2T(-dT^2+d\theta'^2),
\qquad
\omega_K=\ell\csc^2T\,dT\wedge d\theta'.
\]

The geometric map from a hyperbolic-plane geodesic to its normal vector on the single-sheeted hyperboloid gives \(T=\alpha\) and \(\theta'=\theta+\text{constant}\). Consequently, the Kirillov–Kostant and Crofton forms have the same coordinate dependence and coincide up to an overall normalization ([Penna and Zukowski, §3.3](https://arxiv.org/abs/1812.02176)).

This is stronger than merely noticing that a two-dimensional space admits some area form. The form is fixed invariantly by the symmetry orbit, and its induced Poisson bracket is the restriction of the group’s Lie–Poisson structure. Moment-map functions associated with symmetry generators therefore reproduce the \(SO(2,1)\) Lie algebra under Poisson brackets, with normalization determined by the pairing and orbit radius. This is the clearest rigorous sense in which the symplectic form “encodes the Poisson bracket of observables.”

## 6. Information-theoretic meaning—and its limits

The same form is generated by entanglement entropy:

\[
\omega_C
 =
 \partial_u\partial_v S(u,v)\,du\wedge dv.
\]

For adjacent infinitesimal intervals, the integrated density is a conditional mutual information. Strong subadditivity implies

\[
\partial_u\partial_v S(u,v)\,du\,dv\ge 0
\]

for the orientation used in the construction, giving a positive geodesic density ([Czech et al., eq. 2.11 and §2.3](https://arxiv.org/pdf/1505.05515)). Finite coordinate rectangles represent finite conditional mutual informations through the chain rule, while rectangles reaching the zero-size-interval boundary represent mutual information between adjacent regions ([Czech et al., §2.3](https://arxiv.org/pdf/1505.05515)).

This establishes an important but carefully bounded correspondence:

\[
\text{entropy Hessian}
\longleftrightarrow
\text{Crofton density}
\longleftrightarrow
\text{symplectic form}.
\]

It does **not** mean that entropy itself is canonically conjugate to interval size, nor that the Poisson bracket of two entropy values is automatically a boundary quantum commutator. Entanglement entropy acts analogously to a potential whose mixed derivative produces the form. Penna and Zukowski describe it as playing the role of a Kähler potential and note that the relevant structure is Lorentzian rather than positive-definite Kähler geometry ([their §3.4](https://arxiv.org/pdf/1812.02176)).

Quantization of the \(dS_2\) orbit is related to principal-series representations of \(SO(2,1)\), but the orbit method is not a universal one-to-one classification: the same authors note missing or unresolved cases, including the complementary series and the null cone ([Penna and Zukowski, §3.2](https://arxiv.org/pdf/1812.02176)). Accordingly, “the orbit can be quantized” should not be inflated into “the complete holographic quantum theory has been derived.”

## 7. Higher dimensions and generic geometries

For pure \(\mathrm{AdS}_{d+1}\), the space of codimension-two spacelike extremal surfaces associated with spherical boundary regions can be represented as an orbit of \(SO(d,2)\). Penna and Zukowski identify the relevant homogeneous space and argue that it inherits the natural symplectic structure of a coadjoint orbit ([their §4](https://arxiv.org/abs/1812.02176)). This establishes a symmetry-based higher-dimensional symplectic structure for the appropriate highly symmetric kinematic space.

However, the detailed equality between a higher-dimensional information-theoretic form and the Kirillov–Kostant form was not completed there. The authors explicitly leave the relationship between a Kähler-like metric potential and the orbit form for future exploration ([Penna and Zukowski, eqs. 4.14–4.15](https://arxiv.org/pdf/1812.02176)).

The restriction is sharper for generic bulk geometries. A space of extremal surfaces can still be defined, but broken symmetry leaves smaller group orbits containing less information. Penna and Zukowski emphasize that if only a \(U(1)\) bulk symmetry remained, its relevant coadjoint orbit could collapse to a point even though curve lengths still vary with radial position; they therefore caution against assuming that the orbit construction reconstructs arbitrary spacetimes ([their discussion](https://arxiv.org/abs/1812.02176)). Multiple geodesics, conjugate points, caustics, extremal-surface phase transitions, time dependence, and degeneracies can also obstruct the simple endpoint-space picture.

The responsible conclusion is therefore stratified:

- **Established:** the regular \(\mathrm{AdS}_3\) interval/geodesic space has a Crofton symplectic form whose inverse defines a Poisson bracket.
- **Established:** in the symmetric static example, this form agrees up to normalization with the Kirillov–Kostant form of an \(SO(2,1)\) coadjoint orbit.
- **Established:** the form’s density is the mixed derivative of interval entropy and integrates over rectangles to conditional mutual information.
- **Supported in symmetric higher dimensions:** pure-AdS kinematic spaces can be realized as conformal-group orbits and consequently inherit orbit symplectic structures.
- **Not generally established:** that arbitrary local or nonlocal CFT observables have their full physical Poisson or commutator algebra encoded by this form.
- **Open or model-dependent:** a comparably useful construction for generic dynamical or weakly symmetric spacetimes.

## 8. Worked competency checks

### Exercise 1: order without distance

Let \(I_1=(0,1)\), \(I_2=(-1,2)\), and \(I_3=(3,4)\).

**Question:** Which pairs are comparable by inclusion, and what metric distances follow?

**Resolution:** \(I_1\subset I_2\), so their kinematic points are timelike comparable. Neither \(I_3\subset I_1\) nor \(I_1\subset I_3\), and similarly for \(I_2,I_3\). No numerical distance follows from these facts. The inference “the distance from \(I_1\) to \(I_2\) is \(2\), because the larger interval extends one unit on each side” is invalid: it imports a coordinate-dependent boundary length into a partial order.

### Exercise 2: causal classification

Let \(A=(0,2)\), \(B=(-1,3)\), \(C=(0,4)\), and \(D=(1,5)\).

**Resolution:** \(A\subset B\), so \(A\) and \(B\) are timelike related. \(A\) and \(C\) share the endpoint \(u=0\), so they are null related. Neither \(C\) nor \(D\) contains the other, so they are spacelike related in interval kinematic space.

### Exercise 3: compute a bracket

For the vacuum circle, choose \(f=u+v\) and \(g=v-u\). Then

\[
\partial_u f=\partial_v f=1,\qquad
\partial_u g=-1,\quad \partial_v g=1.
\]

Therefore,

\[
\{f,g\}_K
 =
 \frac{12}{c}\sin^2\!\left(\frac{v-u}{2}\right)
 [1\cdot1-1\cdot(-1)]
 =
 \frac{24}{c}\sin^2\!\left(\frac{v-u}{2}\right).
\]

The bracket vanishes only in the degenerate-interval limit and is otherwise nonzero.

### Exercise 4: interpret a region

A rectangle in \((u,v)\) bounded by constant endpoint coordinates represents a family of intervals. Its symplectic area

\[
\int_R\omega_C
\]

is a conditional mutual information for the corresponding adjacent boundary regions, under the entropy construction and its assumptions. It is not the proper area of a bulk region.

### Exercise 5: locate the failure of generalization

Suppose a geometry has many geodesics with identical boundary endpoints or too little symmetry to produce a sufficiently dimensional coadjoint orbit.

**Resolution:** endpoint pairs no longer label all geodesics uniquely, or the group orbit no longer retains enough geometric information. A formal orbit symplectic form may then fail to be the Crofton measure needed for reconstruction. One must enlarge the labels, separate branches, introduce a different phase space, or concede that the simple construction does not apply.

## Conclusion

Kinematic space can indeed be equipped with a symplectic form that encodes a Poisson bracket, and the static \(\mathrm{AdS}_3/\mathrm{CFT}_2\) example makes this statement unusually concrete. The entropy Hessian is the Crofton measure; the Crofton measure is, up to normalization, the Kirillov–Kostant form; and its inverse supplies an explicit Poisson bracket for functions of interval endpoints.

The conceptual payoff is a three-way translation among bulk integral geometry, boundary information measures, and the representation theory of spacetime symmetry. Its limits are equally important. Causal inclusion alone does not determine metric distance; a symplectic structure does not select dynamics; functions on geodesic space are not automatically all physical observables; and orbit quantization is not by itself a derivation of the complete boundary operator algebra. Beyond highly symmetric backgrounds, the existence and usefulness of an equally informative symplectic kinematic space remain partly open.

## References

1. Bartlomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515), arXiv:1505.05515 (2015).

2. Robert F. Penna and Claire Zukowski, [“Kinematic Space and the Orbit Method”](https://arxiv.org/abs/1812.02176), arXiv:1812.02176; *Journal of High Energy Physics* 07 (2019) 045.
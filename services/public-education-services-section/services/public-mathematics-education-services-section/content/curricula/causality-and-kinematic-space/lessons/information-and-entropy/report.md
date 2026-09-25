# Information, Entropy, and Kinematic Geometry

## 1. What does it mean for information to become geometry?

In ordinary geometry, points represent locations. In **kinematic space**, a point instead represents an extended object—typically a boundary interval or the bulk geodesic anchored at that interval’s endpoints. This change of viewpoint makes it possible to organize a family of entanglement entropies geometrically.

The central construction is not a universal identity between information and distance. It is a sequence of maps:

\[
\text{quantum state}
\longrightarrow
S(u,v)
\longrightarrow
\frac{\partial^2 S}{\partial u\,\partial v}\,du\wedge dv
\longrightarrow
\text{kinematic measure}
\longrightarrow
\text{bulk length}.
\]

Every arrow has hypotheses. The first derivative construction makes sense whenever interval entropy varies smoothly enough with its endpoints. The final interpretation as a classical bulk length requires substantially more: a suitable holographic conformal field theory, a semiclassical asymptotically anti-de Sitter bulk, and an applicable holographic entropy prescription. If these conditions fail, entropy remains a valid quantum-information quantity, but the geometric interpretation need not survive.

This lesson develops that chain carefully, distinguishes its ingredients, and explains where the analogy stops.

## 2. Entanglement entropy and its regulator

Let a quantum system be divided into a subsystem \(A\) and its complement \(\bar A\). For a global density operator \(\rho\), the reduced state of \(A\) is

\[
\rho_A=\operatorname{Tr}_{\bar A}\rho .
\]

Its von Neumann entropy is

\[
S(A)=-\operatorname{Tr}(\rho_A\log\rho_A).
\]

For a globally pure state, \(S(A)=S(\bar A)\). The entropy then measures entanglement between the two parts, although for a mixed global state it also contains classical and thermal contributions.

In continuum quantum field theory, the entropy of a sharply bounded spatial region is generally ultraviolet divergent because degrees of freedom immediately across the boundary remain correlated at arbitrarily short distances. Therefore \(S(A)\) depends on a short-distance cutoff \(a\), lattice spacing, or another regulator. It is important not to interpret a bare divergent entropy as a directly measurable distance.

For a vacuum two-dimensional conformal field theory on an infinite line, an interval of length \(\ell\) has

\[
S(\ell)=\frac{c}{3}\log\frac{\ell}{a},
\]

where \(c\) is the central charge and \(a\) is the ultraviolet cutoff. Ryu and Takayanagi reproduced this expression from the regulated length of a geodesic in \(\mathrm{AdS}_3\), using \(c=3R/(2G_N^{(3)})\), where \(R\) is the AdS radius and \(G_N^{(3)}\) is the three-dimensional Newton constant. Their calculation gives

\[
S(A)=\frac{L_{\gamma_A}}{4G_N^{(3)}}
     =\frac{c}{3}\log\frac{\ell}{a}.
\]

The cutoff \(a\) on the boundary corresponds to a radial cutoff near the AdS boundary. Thus both sides of the equality are regulated quantities, not independently finite observables. See the original calculation in [Ryu and Takayanagi, “Holographic Derivation of Entanglement Entropy from AdS/CFT”](https://arxiv.org/abs/hep-th/0603001).

## 3. RT and HRT: minimal versus extremal surfaces

The static Ryu–Takayanagi prescription states, at leading semiclassical order,

\[
S(A)=\frac{\operatorname{Area}(\gamma_A)}{4G_N},
\]

where \(\gamma_A\) is an appropriate codimension-two bulk minimal surface anchored on \(\partial A\) and homologous to \(A\). In \(\mathrm{AdS}_3\), the surface is one-dimensional, so “area” means geodesic length.

“Minimal” here is tied to a suitable static spatial slice. Applying this language uncritically to a time-dependent Lorentzian spacetime would be wrong: Lorentzian area functionals are not minimized over all spacetime directions in the same way as lengths on a Riemannian spatial slice.

Hubeny, Rangamani, and Takayanagi proposed the covariant replacement now called the HRT prescription. The relevant surface is spacelike, codimension two, anchored on \(\partial A\), and **extremal** in the full Lorentzian spacetime:

\[
S(A)=\frac{\operatorname{Area}(\mathcal{Y}_{\mathrm{ext}})}
{4G_N}.
\]

Extremality means that the first variation of area vanishes; equivalently, both null expansions of the surface vanish. In a static spacetime with an appropriate time-reflection-symmetric slice, HRT reduces to RT. The 2007 paper explicitly presented this as a proposal and noted that part of its original equivalence argument was not a rigorous proof; later work supplied stronger derivations in appropriate semiclassical settings. The original construction and qualifications appear in [Hubeny, Rangamani, and Takayanagi, “A Covariant Holographic Entanglement Entropy Proposal”](https://arxiv.org/abs/0705.0016).

Neither formula says that every quantum system has a hidden classical geometry. They apply to special states and theories admitting a suitable holographic gravitational dual.

## 4. Interval space as kinematic space

Consider oriented intervals \((u,v)\) on a one-dimensional spatial boundary, with \(u\) the left endpoint and \(v\) the right endpoint. A point of the two-dimensional kinematic space \(K\) is the ordered pair

\[
(u,v)\in K.
\]

When RT applies on a static \(\mathrm{AdS}_3\) slice, this point may equally be viewed as the oriented bulk geodesic connecting \(u\) and \(v\). Thus one kinematic point represents an interval and a geodesic—not a bulk event.

Intervals have a containment order. If

\[
(u_1,v_1)\subseteq (u_2,v_2),
\]

then the corresponding points are causally comparable in kinematic space. Changing only \(u\) or only \(v\) gives a null direction, while intervals for which neither contains the other are generally spacelike separated in the kinematic metric.

This causal order records inclusion. It does **not** by itself determine metric distances. A partial order can remain unchanged under many positive conformal rescalings of a Lorentzian metric. Therefore the inference

> “Interval \(X\) is in the causal past of interval \(Y\), so their kinematic distance is a particular number”

is invalid. Order tells us which intervals are comparable, not how far apart their representative points are. Quantitative geometry requires additional data, supplied here by entropy derivatives.

## 5. From entropy to a local kinematic density

Write the entropy of interval \((u,v)\) as \(S(u,v)\). Czech, Lamprou, McCandlish, and Sully define the Crofton two-form

\[
\boxed{
\omega(u,v)
=
\frac{\partial^2S(u,v)}{\partial u\,\partial v}\,
du\wedge dv
}
\]

in their static \(\mathrm{AdS}_3/\mathrm{CFT}_2\) construction. The same coefficient defines a Lorentzian kinematic line element, subject to coordinate and sign conventions,

\[
ds_K^2=
\frac{\partial^2S(u,v)}{\partial u\,\partial v}\,du\,dv.
\]

These expressions should not be conflated:

- \(S(u,v)\) is an entropy associated with one interval.
- \(\partial_u\partial_vS\) is an endpoint-response density.
- \(\omega\) is a two-form and integration measure on interval space.
- \(ds_K^2\) is a Lorentzian metric form on that space.
- A bulk curve’s length is an integral involving \(\omega\) and intersection numbers.

The derivative’s information-theoretic meaning follows from a finite difference. Take three adjacent intervals

\[
A=(u-du,u),\qquad B=(u,v),\qquad C=(v,v+dv).
\]

Their conditional mutual information is

\[
I(A:C\mid B)
=
S(AB)+S(BC)-S(B)-S(ABC).
\]

Substitution gives

\[
\begin{aligned}
I(A:C\mid B)
={}&S(u-du,v)+S(u,v+dv)\\
&-S(u,v)-S(u-du,v+dv).
\end{aligned}
\]

For small positive \(du,dv\),

\[
I(A:C\mid B)
=
\frac{\partial^2S}{\partial u\,\partial v}\,du\,dv
+O(du^2,dv^2,du\,dv^2,\ldots).
\]

Thus a small coordinate rectangle in kinematic space measures a conditional mutual information to leading order. Strong subadditivity states

\[
I(A:C\mid B)\geq 0,
\]

which supplies the required positivity of the oriented density. Finite rectangles work as well: the conditional-mutual-information chain rule,

\[
I(A:CD\mid B)=I(A:C\mid B)+I(A:D\mid BC),
\]

corresponds to adding adjacent kinematic rectangles. This construction, including the finite-difference normalization, is developed in [Czech et al., “Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515).

Conditional mutual information is not entropy itself. It is a four-entropy combination that measures how much correlation remains between \(A\) and \(C\) after conditioning on \(B\). It is finite in many configurations because local cutoff-dependent boundary terms cancel.

## 6. Worked vacuum example

On a circle, the vacuum entropy of an interval with angular endpoints \(u\) and \(v\) can be written

\[
S(u,v)=\frac{c}{3}
\log\!\left[
\frac{\sin\!\big((v-u)/2\big)}{\mu}
\right],
\]

where \(\mu\) represents the dimensionless cutoff convention. Differentiating,

\[
\frac{\partial S}{\partial u}
=
-\frac{c}{6}\cot\frac{v-u}{2},
\]

and hence

\[
\frac{\partial^2 S}{\partial u\,\partial v}
=
\frac{c}{12\sin^2\!\big((v-u)/2\big)}.
\]

Therefore

\[
\omega
=
\frac{c}{12\sin^2\!\big((v-u)/2\big)}
\,du\wedge dv .
\]

The additive cutoff term disappears after the mixed derivative. This illustrates one benefit of using entropy combinations rather than the entropy alone, although it does not prove that every regulator dependence vanishes in every state or scheme.

In this maximally symmetric example, the resulting kinematic metric is two-dimensional de Sitter geometry. That statement concerns the space of boundary intervals or bulk geodesics. It does not assert that the original boundary theory literally lives in de Sitter spacetime.

On an infinite line, using \(S(u,v)=(c/3)\log[(v-u)/a]\) gives

\[
\frac{\partial^2 S}{\partial u\,\partial v}
=\frac{c}{3(v-u)^2}.
\]

For infinitesimal endpoint additions \(\delta u,\delta v>0\),

\[
I(A:C\mid B)\approx
\frac{c}{3}\frac{\delta u\,\delta v}{(v-u)^2}.
\]

The result depends on interval scale: identical endpoint shifts produce less conditional mutual information when the central interval is longer.

## 7. From kinematic density to bulk length

Integral geometry reconstructs the length of a curve from the family of geodesics intersecting it. For a bulk curve \(\gamma\), let \(n_\gamma(u,v)\) be the number of intersections between \(\gamma\) and the oriented geodesic represented by \((u,v)\). The Crofton formula used in the holographic construction is

\[
\boxed{
\frac{\operatorname{length}(\gamma)}{4G_N}
=
\frac14
\int_K
\omega(u,v)\,n_\gamma(u,v)
}
\]

with the stated orientation and normalization conventions. For a nonconvex curve, a geodesic may intersect several times, so the multiplicity \(n_\gamma\) is essential. One cannot merely count whether a geodesic intersects.

This formula gives a precise but conditional meaning to “length from information.” Each infinitesimal kinematic cell contributes a conditional mutual information; integrating the cells associated with geodesics that cross \(\gamma\), with intersection multiplicity, reconstructs the curve’s gravitationally normalized length.

The result is not

\[
\text{length}=S(A)
\]

for an arbitrary curve. The entropy of one interval gives, under RT, the length of its associated geodesic. A general curve instead requires an aggregate of entropy derivatives or finite conditional mutual informations over a family of intervals.

For a closed convex curve, the Crofton formula can also be reduced to a boundary integral known as **differential entropy**. If \(v(u)\) labels the geodesic tangent to the curve, then in the conventions of Czech and collaborators,

\[
\frac{\operatorname{length}(\gamma)}{4G_N}
=
-\int du\,
\left.
\frac{\partial S(u,v)}{\partial u}
\right|_{v=v(u)} .
\]

This is another aggregate quantity. Despite its name, differential entropy is not generally the von Neumann entropy of one subsystem.

## 8. A numerical conditional-mutual-information example

Suppose three adjacent subsystems have entropies, in bits,

\[
S(AB)=4.8,\quad S(BC)=5.1,\quad
S(B)=3.0,\quad S(ABC)=6.4.
\]

Then

\[
\begin{aligned}
I(A:C\mid B)
&=S(AB)+S(BC)-S(B)-S(ABC)\\
&=4.8+5.1-3.0-6.4\\
&=0.5\ \text{bits}.
\end{aligned}
\]

This is a finite kinematic-rectangle volume in information units. It is not automatically a bulk length. To turn it into a contribution to length one must establish the holographic dictionary, choose consistent logarithm and gravitational normalizations, and identify the relevant family of RT geodesics. If the entropies came from a generic spin chain with no known gravitational dual, \(0.5\) bits would remain a valid conditional mutual information but would not thereby become \(0.5\) metres—or even \(0.5\) Planck lengths.

## 9. Assumptions and failure modes

### Holographic and state assumptions

The Crofton reconstruction in the cited work concerns static or time-reflection-symmetric spatial slices of asymptotically \(\mathrm{AdS}_3\) geometries dual to suitable \(1+1\)-dimensional holographic states. Boundary-anchored geodesics must adequately probe the region being reconstructed. Horizons, entanglement shadows, phase transitions between competing extremal surfaces, nontrivial topology, or incomplete boundary access can hide regions or make \(S(u,v)\) nonsmooth.

The 2015 construction does not by itself establish a general covariant Crofton formula for arbitrary time-dependent HRT geometries. HRT tells us how to associate extremal surfaces with boundary regions, but converting those surfaces into a complete time-dependent integral-geometric reconstruction requires further structure.

### Semiclassical approximation

RT and classical HRT supply the leading area term in a semiclassical expansion. At the next order, bulk quantum fields contribute their own entanglement. Faulkner, Lewkowycz, and Maldacena found that the one-loop correction is essentially bulk entanglement entropy across the RT surface; see [“Quantum Corrections to Holographic Entanglement Entropy”](https://arxiv.org/abs/1307.2892). Consequently,

\[
S_{\text{boundary}}
\neq
\frac{\operatorname{Area}}{4G_N}
\]

exactly once quantum corrections are appreciable. The relevant object becomes generalized entropy, schematically

\[
S_{\mathrm{gen}}
=
\frac{\operatorname{Area}}{4G_N}
+
S_{\mathrm{bulk}}
+\text{counterterms}.
\]

A mixed derivative of the full boundary entropy may therefore contain both classical geometric and bulk quantum-information contributions. Calling all of it “geodesic density” would overstate the classical correspondence.

### Regulator and differentiability assumptions

Entropy itself is regulator-dependent, while mutual information and conditional mutual information often cancel local divergences when the regions are arranged appropriately. “Often” is important: cancellation depends on the theory, region geometry, regulator, and whether endpoints coincide. The derivatives also assume sufficient smoothness. At an RT phase transition, the dominant surface can switch, producing a kink in \(S(u,v)\); ordinary Hessians may fail there and distributional or piecewise treatment may be required.

### Order is not distance

Containment determines the causal ordering of interval space:

\[
(u_1,v_1)\subseteq(u_2,v_2).
\]

But it does not determine \(\partial_u\partial_v S\), a conformal scale, or a numerical kinematic distance. Two states can share the same interval-containment relations while possessing different entropy functions. Therefore they can have the same causal order but different kinematic measures and reconstructed geometries.

### “More entropy means more distance” is false

Several counterexamples expose the mistake:

1. Adding a cutoff-dependent constant increases every interval entropy but leaves \(\partial_u\partial_vS\) unchanged.
2. Thermal entropy can grow extensively with interval size, while its geometric dual may involve a horizon and competing surfaces rather than a uniform increase of all distances.
3. A bulk curve’s length depends on an integral of entropy derivatives and intersection multiplicities, not on the magnitude of one entropy.
4. Two intervals can have equal entropy but occupy different positions or belong to states with different correlation structures.

The robust statement is narrower: in the specified semiclassical holographic setting, particular entropy combinations define a measure on interval space whose Crofton integral reconstructs particular bulk lengths.

## 10. Exercises with resolutions

### Exercise 1: Identify the local density

Let

\[
S(u,v)=k\log(v-u),\qquad v>u.
\]

Compute the kinematic density.

**Resolution.**

\[
\partial_uS=-\frac{k}{v-u},
\qquad
\partial_v\partial_uS=\frac{k}{(v-u)^2}.
\]

Hence

\[
\omega=\frac{k}{(v-u)^2}\,du\wedge dv.
\]

For \(k>0\), its coefficient is positive in the chosen orientation, consistently with strong subadditivity.

### Exercise 2: Compute conditional mutual information

Given

\[
S(AB)=7,\quad S(BC)=6,\quad S(B)=4,\quad S(ABC)=8.5
\]

in nats, find \(I(A:C\mid B)\).

**Resolution.**

\[
I(A:C\mid B)=7+6-4-8.5=0.5\ \text{nats}.
\]

The nonnegative result is consistent with strong subadditivity.

### Exercise 3: Reject an invalid metric inference

Two interval spaces have identical containment relations, but their entropy functions are \(S_1(u,v)\) and \(S_2(u,v)=2S_1(u,v)\). Must their metric distances agree?

**Resolution.** No. Their causal order agrees because interval containment is unchanged, but

\[
\partial_u\partial_vS_2
=
2\,\partial_u\partial_vS_1.
\]

Their kinematic metrics differ by an overall factor, so numerical lengths need not agree. Causal comparability alone does not fix metric scale.

### Exercise 4: State the geometric hypotheses

When may a kinematic Crofton integral be interpreted as the length of a curve on a classical bulk spatial slice?

**Resolution.** At minimum, one needs a suitable holographic boundary state with a semiclassical asymptotically \(\mathrm{AdS}_3\) bulk; a static or time-reflection-symmetric slice on which RT applies; a consistent regulator and normalization; boundary-anchored geodesics probing the relevant region; a sufficiently regular entropy function; and the correct Crofton domain, orientation, and intersection multiplicities. Quantum corrections, extremal-surface phase transitions, shadows, or time dependence require modifications or may obstruct the interpretation.

## Conclusion

Kinematic geometry does not turn “information” generically into “space.” It organizes a precise hierarchy of quantities. An interval has an entropy. Four nearby interval entropies form a conditional mutual information. Infinitesimal conditional mutual information supplies a positive local measure on interval space. Under static semiclassical \(\mathrm{AdS}_3/\mathrm{CFT}_2\) assumptions, that measure is also the Crofton density on the space of bulk geodesics. Integrating it with intersection multiplicity reconstructs bulk curve length.

The distinction among entropy, entropy derivative, conditional mutual information, measure, and length is therefore essential. Removing the holographic or semiclassical hypotheses breaks the final geometric arrow, but it does not invalidate the underlying information-theoretic quantities. That is where the analogy is most useful—and where it must stop.

## References

- Shinsei Ryu and Tadashi Takayanagi, [“Holographic Derivation of Entanglement Entropy from AdS/CFT”](https://arxiv.org/abs/hep-th/0603001), 2006.
- Veronika E. Hubeny, Mukund Rangamani, and Tadashi Takayanagi, [“A Covariant Holographic Entanglement Entropy Proposal”](https://arxiv.org/abs/0705.0016), 2007; revised 2012.
- Bartłomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515), 2015.
- Thomas Faulkner, Aitor Lewkowycz, and Juan Maldacena, [“Quantum Corrections to Holographic Entanglement Entropy”](https://arxiv.org/abs/1307.2892), 2013.
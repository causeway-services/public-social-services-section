# Causal Entropy Density in Kinematic Space and Its Relation to Spacetime Curvature

## Executive answer

“Causal entropy density” is not a single standardized quantity. In the kinematic-space literature, the phrase most naturally refers to the mixed second derivative

\[
\rho_K(u,v)\equiv \frac{\partial^2 S(u,v)}{\partial u\,\partial v},
\]

where \(S(u,v)\) is the entanglement entropy of the boundary interval with endpoints \(u<v\). The associated two-form,

\[
\omega=\rho_K(u,v)\,du\wedge dv,
\]

is simultaneously the Crofton measure on the space of boundary-anchored geodesics and the infinitesimal conditional mutual information of neighboring intervals. It also supplies the conformal factor of a Lorentzian metric on kinematic space,

\[
ds_K^2=\rho_K(u,v)\,du\,dv.
\]

These identifications are established most cleanly for static, time-reflection-symmetric geometries in AdS\(_3\)/CFT\(_2\) obeying the Ryu–Takayanagi prescription [as developed by Czech, Lamprou, McCandlish, and Sully](https://arxiv.org/html/1505.05515).

The density is related to the curvature of the underlying bulk spacetime, but generally not by a pointwise formula such as “entropy density equals scalar curvature.” Instead:

1. \(\rho_K\) records how the lengths of an entire family of boundary-anchored geodesics vary when their endpoints move.
2. Those geodesic lengths constitute boundary-distance data from which, under suitable assumptions, the spatial bulk metric—and therefore its curvature—can be reconstructed.
3. Perturbations of appropriate entropy densities can also equal integrals of curvature or Einstein-tensor components along extremal surfaces, rather than the curvature at one bulk point.
4. The curvature of kinematic space itself is a different object from the curvature of the underlying spacetime. In the vacuum AdS\(_3\) example, a negatively curved hyperbolic spatial slice has a positively curved de Sitter kinematic space; their curvatures are related through integral geometry, not equality.

Thus the careful conclusion is: **local entropy density in kinematic space is local in the space of intervals but nonlocal in the underlying spacetime. It encodes spacetime curvature through geodesic and extremal-surface transforms, usually requiring inversion or tomography to recover local curvature.**

## 1. Prerequisites and definitions

### Causal order is not metric distance

A causal order states which events or regions can influence, include, or be derived from which others. Mathematically, a partial order is a relation \(\preceq\) that is reflexive, antisymmetric, and transitive. It does not by itself assign a numerical distance. Two elements can be incomparable, and even when \(A\preceq B\), the order alone does not specify how far apart they are.

In a Lorentzian spacetime, light cones divide separations into timelike, null, and spacelike classes. A causal diamond can be written

\[
D(p,q)=J^+(p)\cap J^-(q),
\]

for timelike-related tips \(p\) and \(q\). This definition determines a region using causal accessibility, not a ruler. Additional geometric data—a conformal factor or volume measure, for example—are needed to recover metric scales.

Kinematic space uses the same distinction. Its causal ordering arises from interval containment: one interval lies to the causal future of another when it contains the other interval. Intervals that overlap without either containing the other are spacelike separated in kinematic space, while intervals sharing an endpoint are null-related. Czech and collaborators explicitly construct this order before combining it with the entropy-derived Crofton form to obtain a Lorentzian metric [in their discussion of kinematic causal structure](https://arxiv.org/html/1505.05515#S2.SS4).

Consequently, interval containment supplies the light-cone structure of kinematic space, but it does not determine \(\rho_K\). Different entropy functions can have the same containment order and different metric scales.

### What is kinematic space?

On a two-dimensional static bulk spatial slice, a point of kinematic space \(K\) represents an oriented bulk geodesic. For an asymptotically AdS geometry, such a geodesic can usually be labeled by its ordered boundary endpoints \((u,v)\). Through holography, the same pair labels the boundary interval \((u,v)\). Kinematic space is therefore both:

- a space of bulk geodesics; and
- a space of boundary intervals.

This dual interpretation is central to the construction in [*Integral Geometry and Holography*](https://arxiv.org/html/1505.05515). It also prevents a common category error: a point \((u,v)\in K\) is not normally a point of the original bulk. It represents an extended curve there.

A bulk point \(x\) is instead represented by a *point-curve* in \(K\): the collection of all boundary-anchored geodesics passing through \(x\). Reconstructing these point-curves is part of reconstructing bulk locality from kinematic data [as described in the paper’s reconstruction discussion](https://arxiv.org/html/1505.05515#S8).

### Entropy, conditional mutual information, and density

For a quantum state with reduced density matrix \(\rho_A\) on a region \(A\), the von Neumann entropy is

\[
S(A)=-\operatorname{Tr}(\rho_A\log\rho_A).
\]

For three adjacent regions \(A,B,C\), their conditional mutual information is

\[
I(A:C\mid B)
 =S(AB)+S(BC)-S(B)-S(ABC).
\]

Strong subadditivity states that

\[
I(A:C\mid B)\ge 0.
\]

Take \(B=(u,v)\), enlarge it slightly to the left by \(du\), and enlarge it independently to the right by \(dv\). To leading order, the resulting conditional mutual information is

\[
I(A:C\mid B)
   =\frac{\partial^2S(u,v)}
           {\partial u\,\partial v}\,du\,dv
     +O(du^2,dv^2,du\,dv^2).
\]

The coefficient \(\rho_K=\partial_u\partial_vS\) is therefore a density of failure to saturate strong subadditivity. Its nonnegativity, with the orientation conventions used here, follows from strong subadditivity. Finite causal diamonds in \(K\) carry finite conditional mutual information because the chain rule makes adjacent infinitesimal contributions additive [as shown explicitly in the kinematic-space construction](https://arxiv.org/html/1505.05515#S2.SS3).

Calling \(\rho_K\) “entropy per bulk volume” would be misleading. Its coordinate units are entropy divided by the product of two endpoint-coordinate units, and it is a density on interval space.

## 2. Why the density defines geometry

For a static holographic state, the Ryu–Takayanagi relation identifies the entropy of a boundary interval with the length of its associated bulk geodesic:

\[
S(u,v)=\frac{\operatorname{Length}(\gamma_{uv})}{4G_N}.
\]

Using this identification, Czech and collaborators obtain the Crofton form

\[
\omega(u,v)
  =\frac{\partial^2S(u,v)}
          {\partial u\,\partial v}\,du\wedge dv.
\]

For a bulk curve \(\Gamma\),

\[
\frac{\operatorname{Length}(\Gamma)}{4G_N}
 =\frac14\int_K \omega(u,v)\,
                     n_\Gamma(u,v),
\]

where \(n_\Gamma(u,v)\) counts intersections between \(\Gamma\) and the geodesic labeled by \((u,v)\). The formula includes intersection multiplicity, so it extends beyond closed convex curves [according to the derivation and examples in the primary paper](https://arxiv.org/html/1505.05515#S2).

This is the first precise link to underlying geometry: integrating entropy density over a suitable region of the *space of geodesics* returns the length of a curve in the bulk. Because enough curve lengths determine the bulk distance function, sufficiently complete kinematic data can reconstruct the spatial metric. Curvature can then be calculated from that reconstructed metric in the ordinary way.

The same density supplies the kinematic metric

\[
ds_K^2
 =\frac{\partial^2S(u,v)}
        {\partial u\,\partial v}\,du\,dv.
\]

The coordinates \(u\) and \(v\) are null coordinates of this metric. The sign structure geometrizes interval containment, while its volume form is the Crofton form [as established in equations (29) and the accompanying discussion](https://arxiv.org/html/1505.05515#S2.SS4).

This step introduces more information than causal order alone. The partial order specifies which coordinate directions are null or timelike; \(\rho_K\) fixes a conformal factor and hence numerical areas and lengths in \(K\).

## 3. The canonical vacuum example

Consider a \(1+1\)-dimensional conformal field theory on a spatial circle, in its vacuum. Using dimensionless angular coordinates and a UV regulator \(\mu\), the interval entropy is

\[
S(u,v)
 =\frac{c}{3}\log\!\left[
       \frac{\sin\!\big((v-u)/2\big)}{\mu}
   \right],
\]

up to regulator-dependent conventions. Differentiation gives

\[
\rho_K(u,v)
 =\frac{\partial^2S}{\partial u\,\partial v}
 =\frac{c}{12}\,
   \csc^2\!\left(\frac{v-u}{2}\right).
\]

Accordingly,

\[
ds_K^2
 =\frac{c}{12}
   \frac{du\,dv}
        {\sin^2\!\big((v-u)/2\big)}.
\]

This is the metric of two-dimensional de Sitter space, up to coordinate and normalization conventions. The derivation, including the Brown–Henneaux normalization \(c=3L/(2G_N)\), appears in [the pure-AdS example of Czech and collaborators](https://arxiv.org/html/1505.05515#S4).

The underlying constant-time slice of pure AdS\(_3\) is the hyperbolic plane, which has negative Gaussian curvature. Its oriented-geodesic space is de Sitter, which has positive Lorentzian scalar curvature. Therefore,

\[
R_K\ne R_{\text{bulk slice}}.
\]

This sign difference is not a contradiction. Kinematic and bulk curvature live on different manifolds and answer different questions. The bulk metric measures separation between bulk points; the kinematic metric measures relations among geodesics or intervals.

There is nevertheless a strong correspondence. The particular \(\csc^2((v-u)/2)\) density is the invariant Crofton measure of hyperbolic geometry. If the spatial bulk geometry changes, geodesic lengths change, hence \(S(u,v)\) changes, and so does its mixed derivative. The alteration is a tomographic signature of the new metric.

## 4. How underlying curvature enters the density

### Through geodesic response

A boundary-anchored geodesic samples an extended path. Moving one endpoint changes that path, and the first derivative of its length is controlled by endpoint data. Moving both endpoints probes how neighboring geodesics separate. Geodesic separation is governed by the Jacobi, or geodesic-deviation, equation,

\[
\frac{D^2J^a}{ds^2}
 +R^{a}{}_{bcd}\,
    \dot\gamma^bJ^c\dot\gamma^d=0,
\]

where \(J^a\) is a connecting vector between nearby geodesics. This explains geometrically why second endpoint derivatives of length are sensitive to curvature along the geodesic.

However, that sensitivity is generally integrated and boundary-conditioned. A single value \(\rho_K(u,v)\) is associated with the whole geodesic \(\gamma_{uv}\), not one selected point upon it. Local bulk curvature is recovered only by combining data from many intersecting geodesics and solving an inverse problem.

The reconstruction described by Czech and collaborators requires qualifications. Their clean static construction assumes time-reflection symmetry and the applicability of Ryu–Takayanagi. They further emphasize the importance of avoiding conjugate points when claiming that kinematic data suffice for reconstruction [in their summary of the reconstruction conditions](https://arxiv.org/html/1505.05515#S5). Conjugate points, trapped geodesics, phase transitions between competing extremal surfaces, and incomplete boundary coverage can make the inverse map nonunique or incomplete.

### Through integrated Einstein curvature

A related but distinct definition of entanglement density uses second variations of entropy under null deformations of a causal diamond. Bhattacharya, Hubeny, Rangamani, and Takayanagi define such densities and study them for perturbations around AdS\(_3\). In endpoint null coordinates, their vacuum-subtracted quantities include

\[
\widehat n_+
 =-\frac{\partial}{\partial u_R}
    \frac{\partial}{\partial v_L}\Delta S_A,
\qquad
\widehat n_-
 =-\frac{\partial}{\partial u_L}
    \frac{\partial}{\partial v_R}\Delta S_A.
\]

For linear perturbations about AdS\(_3\), they relate these densities to integrals along the extremal geodesic of null-null components of the cosmological Einstein tensor:

\[
\widehat n_\pm
 =\frac{1}{8G_N}
   \int_{\mathcal E_A}
       d\xi\,\sqrt{\gamma_{\xi\xi}}\,
       N_{(\pm)}^\mu N_{(\pm)}^\nu
       E_{\mu\nu},
\]

with

\[
E_{\mu\nu}
 =R_{\mu\nu}
  -\frac12Rg_{\mu\nu}
  +\Lambda g_{\mu\nu}.
\]

Using Einstein’s equation, this becomes an integral of the corresponding null-null stress tensor component. Their explicit result is restricted to linear deviations from the AdS\(_3\) vacuum; the proposed nonlinear and higher-dimensional extensions are conjectural, and the authors identify divergence-related obstacles in higher dimensions [in the original analysis](https://arxiv.org/html/1412.5472).

This result is perhaps the closest rigorous answer to a direct entropy-density/curvature question: under the stated assumptions, the density is an **extremal-surface average of a curvature combination**. It is still not a pointwise scalar-curvature measurement.

It is also important not to identify \(\widehat n_\pm\) automatically with the Crofton density \(\rho_K=\partial_u\partial_vS\). They differentiate different combinations of endpoint coordinates and answer different information-theoretic questions. In particular, Bhattacharya and collaborators’ null-deformation density vanishes for the two-dimensional CFT vacuum and for certain conformal descendants, whereas the vacuum Crofton density above is nonzero. The two uses of “entanglement density” are related by their reliance on second shape variations and strong subadditivity, but they are not interchangeable [as is apparent from the definitions and vacuum discussion in their paper](https://arxiv.org/html/1412.5472).

## 5. Curvature of kinematic space

The entropy function can also behave as a field or potential on the moduli space of causal diamonds. De Boer, Haehl, Heller, and Myers construct this moduli space for a \(d\)-dimensional CFT as the space of pairs of timelike-separated points. It has \(d\) spacelike and \(d\) timelike directions: translating a diamond’s center is spacelike in moduli space, while changing its size and orientation supplies timelike directions [in their explicit metric analysis](https://arxiv.org/html/1606.03307#S2.SS2).

For \(d=2\), the moduli space factorizes into two copies of dS\(_2\). For a universal family of states generated from the vacuum by conformal transformations, right- and left-moving entropy contributions obey Liouville-type equations. One representative equation is

\[
\delta^2\,\partial_u\partial_v S_R
  =\frac{c}{6}
     \exp\!\left(-\frac{12}{c}S_R\right).
\]

In their chosen conformal parametrization, this equation is equivalent to demanding constant positive curvature for the corresponding dS\(_2\) metric [as derived in the paper’s nonlinear two-dimensional analysis](https://arxiv.org/html/1606.03307#S4).

This is a relation between entropy and **kinematic-space curvature**, not a universal equation identifying entropy density with bulk curvature. It holds for a restricted universal sector with special two-dimensional conformal factorization. The authors themselves frame extensions to generic states and generic gravitational backgrounds as open problems [in their discussion of constant-curvature variations](https://arxiv.org/html/1606.03307#S7).

The distinction can be summarized as

\[
\boxed{
\begin{array}{c}
S(u,v)
\\[2mm]
\downarrow\;\partial_u\partial_v
\\[2mm]
\rho_K(u,v)
\end{array}}
\quad
\begin{cases}
\text{directly defines the kinematic metric and volume form},\\
\text{indirectly encodes the bulk metric through geodesic data},\\
\text{may encode integrated Einstein curvature under perturbations}.
\end{cases}
\]

## 6. Worked examples and failure cases

### Example 1: an infinitesimal causal diamond

Let

\[
S(u,v)=\frac{c}{3}
 \log\!\left[\frac{v-u}{\epsilon}\right]
\]

for the vacuum CFT on an infinite line. Then

\[
\rho_K(u,v)
 =\frac{c}{3(v-u)^2}.
\]

For small adjacent endpoint increments \(du,dv>0\),

\[
I(A:C\mid B)
 \approx \frac{c}{3(v-u)^2}\,du\,dv.
\]

The density grows as the interval becomes short. This divergence is tied to short-distance vacuum correlations and the continuum limit; it should not be read as a divergent bulk scalar curvature at the associated geodesic.

### Example 2: causal order without distance

Consider intervals

\[
A=(0,1),\qquad B=(0,2),\qquad C=(1,3).
\]

Since \(A\subset B\), their kinematic points are causally comparable. Neither \(B\subset C\) nor \(C\subset B\), so \(B\) and \(C\) are not comparable by containment.

Now replace the entropy by \(\widetilde S=\lambda S\), with \(\lambda>0\). The interval order is unchanged, but

\[
\widetilde\rho_K=\lambda\rho_K,
\qquad
d\widetilde s_K^2=\lambda\,ds_K^2.
\]

Areas and curvature radii inferred from the metric normalization change. Therefore the inference “same causal order implies same distance” is invalid.

### Example 3: why one density value is insufficient

Suppose \(\rho_K(u_0,v_0)\) is known for one interval. This constrains how the length of one geodesic changes under a particular two-endpoint deformation. Many different spatial metrics can agree on that datum while differing elsewhere. Recovering curvature near a candidate bulk point requires densities for a sufficiently rich family of geodesics crossing the neighborhood, together with reconstruction assumptions. Locality in \(K\) is therefore not locality in the bulk.

## 7. Established results, limitations, and open questions

The following claims are well established within their domains:

- For static AdS\(_3\)/CFT\(_2\) geometries obeying Ryu–Takayanagi, \(\partial_u\partial_vS\) is the Crofton density and generates bulk curve lengths through an intersection integral [Czech et al.](https://arxiv.org/html/1505.05515).
- The same density gives infinitesimal conditional mutual information and is nonnegative by strong subadditivity [Czech et al.](https://arxiv.org/html/1505.05515#S2.SS3).
- Interval inclusion defines the causal order of kinematic space, while the density supplies metric normalization [Czech et al.](https://arxiv.org/html/1505.05515#S2.SS4).
- In the pure-AdS example, the hyperbolic spatial slice has dS\(_2\) as its kinematic space [Czech et al.](https://arxiv.org/html/1505.05515#S4).
- For linear perturbations around AdS\(_3\), a particular null-deformation entanglement density can be expressed as an extremal-geodesic integral of a null-null Einstein-tensor component [Bhattacharya et al.](https://arxiv.org/html/1412.5472).
- In special two-dimensional conformal families, entropy components satisfy Liouville equations interpretable as constant-curvature conditions on causal-diamond moduli space [de Boer et al.](https://arxiv.org/html/1606.03307#S4).

What is not established is a universal pointwise law

\[
\rho_K(u,v)=F(R(x))
\]

for an arbitrary bulk point \(x\), arbitrary spacetime, and arbitrary quantum state. The association of a kinematic point with an extended geodesic already makes such a formula structurally unlikely without an additional inverse transform.

Higher dimensions add further complications: intervals are replaced by balls, causal diamonds, or extremal surfaces; their moduli spaces have more dimensions; ultraviolet divergences are more elaborate; and extremal-surface data need not determine the full metric without extra assumptions. Time-dependent geometries require covariant extremal surfaces rather than geodesics confined to a static slice. Quantum corrections replace the classical area alone by generalized entropy, so matter entanglement across the bulk surface also contributes.

The most defensible overall statement is therefore:

> Causal entropy density is a measure of distinguishable entanglement associated with neighboring regions in kinematic space. It determines a measure and often a Lorentzian metric on that auxiliary space. Through holographic extremal-surface formulas, its values constitute nonlocal probes of the underlying spacetime metric and curvature. Curvature recovery is tomographic and assumption-dependent, while direct integrated curvature formulas are presently established only in restricted settings.

## 8. Exercises

1. **Causal order.** For \(A=(0,1)\), \(B=(-1,2)\), and \(C=(1/2,3)\), list every containment relation. Explain why the list alone cannot determine any numerical kinematic distance.

2. **Vacuum density.** Starting from  
   \[
   S(u,v)=\frac{c}{3}\log\frac{v-u}{\epsilon},
   \]
   verify that  
   \[
   \partial_u\partial_vS=\frac{c}{3(v-u)^2}.
   \]
   Show that it is positive for \(u<v\).

3. **Conditional mutual information.** Expand  
   \[
   S(u-du,v)+S(u,v+dv)-S(u,v)-S(u-du,v+dv)
   \]
   to mixed second order, correcting the orientation of the combination if necessary so that it equals \(+\rho_K\,du\,dv\). Relate the result to strong subadditivity.

4. **Negative control.** Two theories have identical interval-containment orders but entropies \(S_2=2S_1\). Determine how their Crofton forms and kinematic metrics compare. Identify the invalid inference: “identical causal order implies identical metric distance.”

5. **Region geometry.** Explain why a bulk point corresponds to a curve in kinematic space, whereas a kinematic point corresponds to a bulk geodesic. State what family of geodesics would be needed to localize a bulk point.

6. **Curvature critique.** Compare  
   \[
   \rho_K=\partial_u\partial_vS
   \]
   with \(\widehat n_\pm\) defined by crossed null-endpoint derivatives of \(\Delta S\). Give one reason they cannot be treated as the same observable.

## References

- Bartlomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/html/1505.05515), 2015.
- Jyotirmoy Bhattacharya, Veronika E. Hubeny, Mukund Rangamani, and Tadashi Takayanagi, [“Entanglement Density and Gravitational Thermodynamics”](https://arxiv.org/html/1412.5472), 2014.
- Jan de Boer, Felix M. Haehl, Michal P. Heller, and Robert C. Myers, [“Entanglement, Holography and Causal Diamonds”](https://arxiv.org/html/1606.03307), 2016.
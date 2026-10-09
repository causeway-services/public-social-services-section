# Measuring a Curve by Counting the Geodesics That Cross It

## The central idea

Ordinary geometry measures a curve locally: divide it into tiny pieces, approximate each piece by a straight segment, and add their lengths. Crofton’s formula offers a strikingly different description. Instead of moving along the curve, consider every straight line in the plane, count how many times each line crosses the curve, and average those counts with the correct measure on the space of lines. The result is the curve’s length.

For a rectifiable plane curve \(\gamma\), one standard oriented-line convention gives

\[
\boxed{
\operatorname{Length}(\gamma)
=
\frac14
\int_{0}^{2\pi}
\int_{-\infty}^{\infty}
n_\gamma(\theta,p)\,dp\,d\theta
}
\]

where \(n_\gamma(\theta,p)\) is the number of intersections between \(\gamma\) and the line

\[
x\cos\theta+y\sin\theta=p.
\]

This formula, including the factor \(1/4\), the intersection multiplicity, and the invariant measure \(dp\,d\theta\), is reviewed explicitly in Czech, Lamprou, McCandlish, and Sully’s [*Integral Geometry and Holography*](https://arxiv.org/html/1505.05515#S1.SS1). The same paper then replaces Euclidean lines by hyperbolic geodesics and ultimately interprets the resulting “space of geodesics” as kinematic space.

The phrase “counting lines” is therefore shorthand. There are infinitely many lines, so one does not take an ordinary count. One integrates an intersection-counting function over a continuously parameterized line space. Length emerges from a weighted volume in that auxiliary space.

## Prerequisites and definitions

A **rectifiable curve** is a curve with finite length. Smooth and piecewise-smooth curves are familiar examples, but Crofton’s formula is not limited to closed or convex curves. Subject to the usual measure-theoretic interpretation of intersections, the multiplicity \(n_\gamma\) makes the formula additive across pieces and allows nonconvex and open curves; the cited holographic treatment states the Euclidean result for all finite-length plane curves and illustrates how different regions of line space carry different intersection multiplicities ([Czech et al., §1.1](https://arxiv.org/html/1505.05515#S1.SS1)).

A **geodesic** is, locally, a straightest possible path in a geometry. In the Euclidean plane, complete geodesics are ordinary straight lines. In the hyperbolic plane, they are hyperbolic straight lines—for example, semicircles orthogonal to the boundary in the Poincaré half-plane model.

The **intersection number** \(n_\gamma(\ell)\) is the number of times a line or geodesic \(\ell\) meets \(\gamma\). For a generic line crossing a simple convex closed curve, this number is \(2\). For an open line segment it is normally \(1\) or \(0\). A nonconvex curve can be crossed \(0,2,4,\ldots\) times, while a curve that retraces or self-intersects may require multiplicities to be handled explicitly. Tangent lines and lines passing through corners form lower-dimensional exceptional sets and therefore do not change the integral under the standard line measure.

The **kinematic space** of a two-dimensional geometry is the space whose points represent its oriented geodesics. This reverses the usual roles:

- a point of the original plane is an ordinary location;
- a point of kinematic space is an entire line or geodesic;
- a curve in the original plane determines a region of kinematic space: the set of geodesics that intersect it;
- the curve’s length becomes a weighted area of that region.

This “geometry of geometric objects” is the conceptual bridge from classical integral geometry to holographic kinematic space.

## Parameterizing Euclidean lines

Every Euclidean line can be written in normal form as

\[
\ell(\theta,p):
\qquad
x\cos\theta+y\sin\theta=p.
\]

Here

\[
\mathbf n(\theta)=(\cos\theta,\sin\theta)
\]

is a unit normal to the line, and \(p\) is its signed perpendicular displacement from the origin. Translating \(p\) moves the line in its normal direction; changing \(\theta\) rotates its normal.

There is a two-to-one redundancy:

\[
\ell(\theta,p)=\ell(\theta+\pi,-p)
\]

as an unoriented geometric line. The two parameter pairs attach opposite normal orientations to the same underlying line. Czech and collaborators consequently use \(\theta\in[0,2\pi)\), \(p\in\mathbb R\) for oriented lines and identify the resulting parameter space as the Euclidean kinematic space ([Czech et al., equations (1)–(5)](https://arxiv.org/html/1505.05515#S1.SS1)).

The natural measure is

\[
d\mu = dp\,d\theta,
\]

or, with orientation retained as a differential form,

\[
\omega=dp\wedge d\theta.
\]

This measure is invariant under Euclidean rigid motions. Rotation shifts \(\theta\) without changing \(d\theta\). Under a translation by \(\mathbf a=(a_x,a_y)\),

\[
p\longmapsto p+\mathbf a\cdot\mathbf n(\theta),
\]

and the extra \(\theta\)-dependent term contributes no change to \(dp\wedge d\theta\). Thus the measure does not privilege an origin or direction. Its normalization, however, remains conventional until a test object fixes the numerical prefactor.

### The unoriented-line convention

If each physical line is to be counted only once, use

\[
0\leq\theta<\pi,\qquad -\infty<p<\infty.
\]

Then Crofton’s formula becomes

\[
\boxed{
\operatorname{Length}(\gamma)
=
\frac12
\int_{0}^{\pi}
\int_{-\infty}^{\infty}
n_\gamma(\theta,p)\,dp\,d\theta
}
\]

because the oriented parameter space is a double cover of the unoriented one. The two formulas are equivalent:

\[
\frac14\int_{\text{oriented lines}}n_\gamma\,d\mu
=
\frac12\int_{\text{unoriented lines}}n_\gamma\,d\mu.
\]

The factors \(1/4\) and \(1/2\) are therefore not competing mathematical results. They reflect whether the line space counts each geometric line twice or once. Any use of Crofton’s formula must state this convention.

## Why a line segment fixes the normalization

Let \(\gamma\) be the segment from \((0,0)\) to \((L,0)\), where \(L>0\). For a fixed \(\theta\), a point \((x,0)\) on the segment has normal coordinate

\[
p=x\cos\theta,\qquad 0\leq x\leq L.
\]

The set of \(p\)-values whose lines cross the segment is therefore the interval between \(0\) and \(L\cos\theta\). Its width is

\[
L|\cos\theta|.
\]

Except on a measure-zero set of lines through an endpoint or coincident with the segment, each crossing line meets the segment exactly once. Using unoriented lines,

\[
\begin{aligned}
\frac12\int_0^\pi\int_{-\infty}^{\infty}
n_\gamma(\theta,p)\,dp\,d\theta
&=
\frac12\int_0^\pi L|\cos\theta|\,d\theta\\
&=
\frac12 L\left(2\right)\\
&=L.
\end{aligned}
\]

This calculation explains the normalization rather than merely checking it. For each direction, the measure of crossing lines equals the width of the segment’s orthogonal projection onto that direction’s normal axis. Averaging those projected widths over all directions and multiplying by \(1/2\) reproduces length.

A rotated segment gives the same answer. If its direction angle is \(\phi\), the relevant projected width becomes \(L|\cos(\theta-\phi)|\), whose integral over any interval of length \(\pi\) is still \(2L\). Rotational invariance is visible directly.

## Worked example: the circumference of a circle

Let \(\gamma\) be the circle

\[
x^2+y^2=R^2.
\]

A line \(\ell(\theta,p)\) intersects the circle when \(|p|<R\). It is tangent when \(|p|=R\), and misses the circle when \(|p|>R\). For \(|p|<R\), there are two intersection points, so

\[
n_\gamma(\theta,p)=2.
\]

With the unoriented-line convention,

\[
\begin{aligned}
\operatorname{Length}(\gamma)
&=
\frac12
\int_0^\pi
\int_{-R}^{R}2\,dp\,d\theta\\
&=
\frac12
\int_0^\pi 4R\,d\theta\\
&=
2\pi R.
\end{aligned}
\]

The two tangent values \(p=\pm R\) do not affect the result because they form a measure-zero subset of the two-dimensional line space.

The same calculation also separates three quantities that are easy to conflate:

1. The set of unoriented lines intersecting the disk has measure
   \[
   \int_0^\pi\int_{-R}^{R}dp\,d\theta=2\pi R.
   \]

2. The boundary circle is crossed twice by almost every such line, producing a multiplicity-weighted integral of \(4\pi R\).

3. Crofton’s factor \(1/2\) converts that weighted line-space measure to the circumference \(2\pi R\).

For a convex closed curve more generally, almost every intersecting line crosses the boundary twice. In that special case, the factor \(2\) from the intersection number cancels the \(1/2\) in the unoriented formula, so the perimeter equals the measure of the set of intersecting unoriented lines. That simplification fails for open or nonconvex curves, where the full function \(n_\gamma\) remains essential.

## Mechanism: local projection averaged over direction

The segment calculation contains the local mechanism behind the general formula. Take a small curve element of length \(ds\), with tangent direction \(\phi\). For lines whose normal has angle \(\theta\), the range of offsets \(p\) that cross this element is approximately

\[
dp=|\cos(\theta-\phi)|\,ds.
\]

Integrating over all unoriented normal directions gives

\[
\int_0^\pi |\cos(\theta-\phi)|\,d\theta\,ds
=2\,ds.
\]

Multiplication by \(1/2\) returns \(ds\). Integrating these local contributions along the curve gives its total length. When a line crosses several separated pieces, the intersection number adds those contributions rather than collapsing them into a yes-or-no indicator. That additivity is why Crofton’s formula survives self-intersections and nonconvexity more successfully than a formula based only on whether a line intersects at least once.

This argument is an explanatory derivation for sufficiently regular curves. A fully general theorem for arbitrary rectifiable curves requires measure theory to control exceptional lines, multiplicity, and limiting approximations. One should not treat the local projection argument alone as a complete proof of the broadest theorem.

## From Euclidean lines to hyperbolic geodesics

The slogan “measure a curve by the geodesics crossing it” survives in the hyperbolic plane, but the measure changes. Euclidean \(dp\,d\theta\) cannot simply be reused because hyperbolic isometries act differently on the geodesic space.

For the unit-curvature hyperbolic metric

\[
ds^2=d\rho^2+\sinh^2\rho\,d\tilde\theta^2,
\]

an oriented geodesic can be labeled by a center angle \(\theta\) and opening half-angle \(\alpha\). Czech and collaborators give the invariant Crofton form as

\[
\omega(\theta,\alpha)
=
-\frac{1}{\sin^2\alpha}\,
d\alpha\wedge d\theta,
\]

with the length formula

\[
\operatorname{Length}(\gamma)
=
\frac14\int_K
n_\gamma(\theta,\alpha)\,
\omega(\theta,\alpha).
\]

They obtain endpoint coordinates

\[
u=\theta-\alpha,\qquad v=\theta+\alpha,
\]

in which

\[
\omega(u,v)
=
\frac{1}{2\sin^2\!\left(\frac{v-u}{2}\right)}
\,du\wedge dv
\]

([Czech et al., equations (6)–(12)](https://arxiv.org/html/1505.05515#S1.SS2)). These formulas use a curvature radius set to one; restoring a radius introduces the corresponding length scale.

This is an extension of the *structure* of the Euclidean formula, not an assertion that hyperbolic and Euclidean line spaces have the same measure. In both cases:

- points of kinematic space represent geodesics;
- a curve selects the geodesics that cross it;
- intersections are counted with multiplicity;
- an isometry-invariant measure converts the crossing data into length.

What changes is the density assigned to different geodesics. The factor \(1/\sin^2\alpha\) expresses hyperbolic geometry; it becomes large as boundary endpoints approach one another, corresponding to geodesics concentrated near the asymptotic boundary.

An independent mathematical result by Guyan Robertson proves a Crofton-type formula for distances in real hyperbolic spaces using an invariant measure on totally geodesic codimension-one submanifolds. Robertson emphasizes that invariance and two-point homogeneity make the intersection integral depend only on geodesic distance, after which its normalization is fixed on a reference segment ([Robertson, *Crofton formulae and geodesic distance in hyperbolic spaces*](https://arxiv.org/html/1302.5790)). This supports the general hyperbolic mechanism while addressing a somewhat different formulation and dimensional scope from the two-dimensional holographic construction.

## Kinematic space as a geometry of intervals

In a static asymptotically \(\mathrm{AdS}_3\) setting, a boundary-anchored bulk geodesic is labeled by its ordered boundary endpoints \((u,v)\). The same ordered pair labels a boundary interval. Thus one point of kinematic space simultaneously represents:

- an oriented bulk geodesic;
- an ordered boundary interval.

Intervals possess a containment partial order. If one interval contains another, the corresponding kinematic points are causally related; if neither contains the other, they are spacelike-related in kinematic space; intervals sharing an endpoint are null-related. Czech and collaborators encode this in the Lorentzian metric

\[
ds_K^2=
\frac{\partial^2 S(u,v)}
{\partial u\,\partial v}\,du\,dv,
\]

whose volume form is the Crofton form ([Czech et al., §2.4](https://arxiv.org/html/1505.05515#S2.SS4)).

This statement must be read carefully. Interval containment supplies causal comparability, not a complete metric distance. A partial order can tell us that one interval contains another, but it does not determine the numerical factor \(\partial_u\partial_v S\). Different positive conformal factors can preserve the same null directions and containment order while assigning different volumes and distances. The Crofton density contributes quantitative information beyond order alone.

## The holographic extension and its assumptions

The holographic step depends on the Ryu–Takayanagi relation. Ryu and Takayanagi proposed that, in an appropriate static holographic state, the entanglement entropy of a boundary region is the area of a homologous bulk minimal surface divided by \(4G_N\); in \(\mathrm{AdS}_3/\mathrm{CFT}_2\), that surface is a geodesic and its “area” is a length ([Ryu and Takayanagi, 2006](https://arxiv.org/abs/hep-th/0603001)).

Writing \(S_{\mathrm{EE}}(u,v)\) for boundary entanglement entropy, the kinematic density becomes

\[
\omega
=
\frac{\partial^2 S_{\mathrm{EE}}(u,v)}
{\partial u\,\partial v}\,
du\wedge dv.
\]

With this entropy-normalized form, the static holographic Crofton formula is

\[
\boxed{
\frac{\operatorname{Length}(\gamma)}{4G_N}
=
\frac14
\int_K
n_\gamma(u,v)\,
\omega
}
\]

as stated in [Czech et al., equations (15)–(16)](https://arxiv.org/html/1505.05515#S2.SS1). Infinitesimally,

\[
\frac{\partial^2 S_{\mathrm{EE}}}{\partial u\,\partial v}\,du\,dv
\]

is the leading conditional mutual information of three adjacent boundary intervals. Strong subadditivity makes this quantity nonnegative, supplying the Crofton density with a definite sign ([Czech et al., equations (21)–(26)](https://arxiv.org/html/1505.05515#S2.SS3)).

The correspondence is therefore precise only under substantial assumptions:

- the boundary state has a suitable semiclassical holographic bulk;
- the static Ryu–Takayanagi prescription applies;
- the relevant boundary-anchored geodesics are minimal and obey the homology constraint;
- endpoint entropies are sufficiently differentiable for the mixed derivative;
- the chosen geodesic family adequately probes the region;
- multiplicities, phase transitions between competing minimal surfaces, and horizons are handled correctly.

Entanglement entropy does not become geometric length in an arbitrary quantum theory merely because one can differentiate it twice. The geometric interpretation requires the holographic dictionary.

Time dependence also requires more than replacing the static variables by time-dependent ones. Czech, Olivas, and Wang derive covariant Crofton formulas for spacelike curves in asymptotically \(\mathrm{AdS}_3\) and show that the relevant relation becomes null-vector alignment rather than ordinary tangency. In pure \(\mathrm{AdS}_3\), their covariant formula can be written as an integral over null planes intersecting the curve; for nonconvex curves, intersection multiplicity remains necessary ([Czech, Olivas, and Wang, *Holographic Integral Geometry with Time Dependence*](https://arxiv.org/html/1905.07413#S4.SS1)). The authors also report that in general time-dependent geometries they did not find a universally sharper characterization of the integration region than the required homotopy between null-vector-aligned geodesic families ([discussion](https://arxiv.org/html/1905.07413#S5)). That is a genuine limitation, not merely a missing pedagogical detail.

## What Crofton’s formula does—and does not—establish

Crofton’s formula establishes that length can be reconstructed from incidence data plus a normalized measure on geodesic space. Incidence alone is insufficient. Knowing only which lines cross a curve, without multiplicity or measure, generally loses quantitative information.

Nor does the existence of a Crofton representation automatically imply every desirable property one might associate with a metric. Robertson gives projective-space examples possessing Crofton formulas even though their geodesic distance is not of negative type ([Robertson, §5](https://arxiv.org/html/1302.5790#S5)). A Crofton formula is a powerful integral representation, not a universal certificate of Euclidean embeddability, quantum-information meaning, or holographic origin.

Finally, “counting crossings” is exact in the continuum theorem but only approximate in numerical sampling. A Monte Carlo implementation must choose a finite sampling region in line space, specify a probability distribution, and control missed intersections, tangencies, discretization error, and truncation. The invariant measure determines how samples should be weighted; uniform sampling in an arbitrary visual parameterization need not be geometrically uniform.

## Exercises with answer checks

### 1. A rotated segment

A segment has length \(L\) and direction angle \(\phi\). Show that the set of offsets crossed at fixed normal angle \(\theta\) has width \(L|\cos(\theta-\phi)|\), then evaluate the unoriented Crofton integral.

**Answer check:**

\[
\frac12\int_0^\pi L|\cos(\theta-\phi)|\,d\theta=L.
\]

The answer is independent of \(\phi\).

### 2. Circle normalization

For a circle of radius \(R\), compute the Crofton integral under both conventions.

**Answer check:**

\[
\int_{\text{unoriented}}n\,dp\,d\theta=4\pi R,
\qquad
\frac12(4\pi R)=2\pi R.
\]

The oriented space doubles the integral to \(8\pi R\), and \(1/4\) again gives \(2\pi R\).

### 3. Why multiplicity matters

Sketch a deeply indented simple closed curve and identify lines that cross it four times. Explain why replacing \(n_\gamma\) by the indicator \(\mathbf 1_{\{n_\gamma>0\}}\) undercounts length.

**Answer check:** The indicator records only the outer range of crossed offsets. It cannot distinguish two crossings from four, so added folds can increase length without proportionally increasing the set of lines that intersect at least once.

### 4. An invalid inference from causal order

Suppose two kinematic-space metrics are

\[
ds_1^2=f(u,v)\,du\,dv,
\qquad
ds_2^2=10f(u,v)\,du\,dv,
\]

with \(f>0\). Do they encode the same interval-containment order? Do they assign the same Crofton volumes?

**Answer check:** They have the same null directions and causal order, so they encode the same comparability relation. Their volume densities differ by a factor of \(10\), so they do not assign the same Crofton volumes or reconstructed lengths. Causal order must not be mistaken for metric normalization.

### 5. Diagnose a holographic overclaim

Evaluate the statement: “For every quantum field theory, \(\partial_u\partial_v S_{\mathrm{EE}}\) measures the density of bulk geodesics.”

**Answer check:** Strong subadditivity can give the mixed entropy difference a nonnegative information-theoretic meaning, but a literal bulk-geodesic density requires a suitable holographic dual and the relevant Ryu–Takayanagi or covariant assumptions. The general information quantity and the geometric interpretation are not equivalent claims.

## Conclusion

Crofton’s formula converts a one-dimensional quantity in physical space into a two-dimensional integral over a space of lines. Its content lies in three ingredients taken together: the incidence relation between lines and the curve, the intersection multiplicity, and the correctly normalized invariant measure.

For Euclidean unoriented lines,

\[
\operatorname{Length}(\gamma)
=
\frac12\int n_\gamma\,dp\,d\theta;
\]

for the oriented double cover, the prefactor is \(1/4\). A segment exposes the projection mechanism and fixes the normalization, while a circle shows how the factor of two from entering and leaving a convex boundary participates in the count.

Hyperbolic geometry preserves the logic but replaces the flat measure by an isometry-invariant Crofton form on hyperbolic geodesic space. In static \(\mathrm{AdS}_3/\mathrm{CFT}_2\), boundary intervals label those geodesics, the mixed derivative of interval entropy supplies the Crofton density, and conditional mutual information gives that density an information-theoretic interpretation. These extensions are established within stated geometric and holographic assumptions; they do not turn arbitrary causal orders or arbitrary entropy functions into metric geometry.

## References

- Bartłomiej Czech, Lampros Lamprou, Samuel McCandlish, and James Sully, [“Integral Geometry and Holography”](https://arxiv.org/abs/1505.05515), 2015.
- Guyan Robertson, [“Crofton formulae and geodesic distance in hyperbolic spaces”](https://arxiv.org/abs/1302.5790), manuscript dated 1997; arXiv posting 2013.
- Shinsei Ryu and Tadashi Takayanagi, [“Holographic Derivation of Entanglement Entropy from AdS/CFT”](https://arxiv.org/abs/hep-th/0603001), 2006.
- Bartłomiej Czech, Yaithd D. Olivas, and Zi-zhi Wang, [“Holographic Integral Geometry with Time Dependence”](https://arxiv.org/abs/1905.07413), 2019.
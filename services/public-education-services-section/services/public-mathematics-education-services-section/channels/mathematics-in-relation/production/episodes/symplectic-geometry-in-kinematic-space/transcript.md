[00:00:00] Our goal today is to determine how we can construct a symplectic form directly from boundary entanglement entropy,

[00:00:07] and use it to compute a Poisson bracket for the static ADS3 vacuum.

[00:00:11] We will achieve this by following a specific five-step mathematical pipeline.

[00:00:16] We begin with interval endpoints, use them to define the entanglement entropy,

[00:00:21] take its Hessian matrix, derive the symplectic form, and finally invert that form to find our Poisson bracket.

[00:00:28] it. To start, we need to define what a point is in two-dimensional kinematic space. In

[00:00:34] this framework, a single point does not represent a physical location in the bulk space-time.

[00:00:39] Instead, it represents an entire oriented boundary interval, defined entirely by two

[00:00:44] endpoints, U and V. This setup creates specific rules for causality based on inclusion. If

[00:00:51] one interval is entirely contained inside another, like interval A sitting completely

[00:00:56] inside interval B, we classify their causal relation as time-like. If we adjust the intervals

[00:01:02] so that they sit side-by-side and share exactly one endpoint, they become null-related. Finally,

[00:01:08] if the intervals overlap or are completely disjoint but neither fully contains the other,

[00:01:13] we classify their relation as space-like. This inclusion classification tells us which regions

[00:01:19] include other regions, establishing causal comparability. It is crucial to note that it

[00:01:24] provides absolutely no metric distance scale.

[00:01:27] Causal order here is a partial order,

[00:01:29] not a measure of numerical length.

[00:01:31] This equation shows the entanglement entropy formula

[00:01:34] for a vacuum conformal field theory on a circle.

[00:01:37] We use this as our pipeline's engine.

[00:01:39] To find the metric density of kinematic space,

[00:01:42] we apply a mixed partial derivative to this entropy

[00:01:44] with respect to endpoints u and v.

[00:01:47] This yields the Crofton density,

[00:01:49] denoted as omega of u comma v.

[00:01:52] Next, we construct our two-form by multiplying our Crofton density by the wedge product of differentials du and dv.

[00:01:59] To prove this two-form acts as a valid symplectic form, it must be closed and non-degenerate.

[00:02:05] It satisfies both.

[00:02:06] In two dimensions, the exterior derivative of a two-form is a three-form, making it automatically closed.

[00:02:12] And as long as our density omega is non-zero, the form is non-degenerate.

[00:02:17] There is one edge case. When endpoint U equals endpoint V, the interval has zero size, and the density diverges.

[00:02:25] This is a boundary limit, so we specify that only the regular interior of the oriented geodesic space is symplectic.

[00:02:32] Because this valid symplectic form is also the Crofton measure, we gain a specific geometric utility.

[00:02:38] By integrating regions of kinematic space, we are actually aggregating families of geodesics, rather than summing over individual bulk events.

[00:02:46] Establishing a symplectic structure gives us a powerful tool.

[00:02:50] It allows us to map the differentials of functions to Hamiltonian vector fields.

[00:02:54] Doing this defines a Poisson algebra over our kinematic space.

[00:02:58] This equation shows the baseline Poisson bracket for smooth functions on that space.

[00:03:03] We get this by taking the inverse of our specific two-form, omega c.

[00:03:07] We can substitute the specific inverse of the Crofton density we just derived into this general bracket,

[00:03:12] expanding the formula to include the sine squared of v minus u over 2, multiplied by the partial derivatives.

[00:03:19] Now we can put this formula into practice.

[00:03:21] Let's assign two basic functions, f equals u plus v, and g equals v minus u.

[00:03:27] Pause the video here.

[00:03:29] Calculate the four required partial derivatives for f and g, plug them into the equation, and compute the final Poisson bracket.

[00:03:35] Before we resolve the math, keep in mind that this translation depends heavily on orientation conventions.

[00:03:41] The overall sign of the resulting bracket will always depend strictly on the convention you choose for your Hamiltonian vector field.

[00:03:47] Taking the partial derivatives of our functions gives us 1 and 1 for f, and negative 1 and positive 1 for g.

[00:03:54] Plugging those into our equation evaluates cleanly to exactly 2.

[00:04:00] Multiplying this by our inverse density changes the coefficient to 24 over c, resolving our Poisson bracket.

[00:04:09] This mathematics works out so cleanly because of representation theory.

[00:04:13] The two-dimensional kinematic space aligns perfectly with a coadjoint orbit of the symmetry group SO21.

[00:04:20] This exact alignment matches the Crofton measure we derived directly to the orbit's Kirilov constant form.

[00:04:27] We must keep precise about what this result means.

[00:04:30] We have calculated a classical Poisson algebra of functions on a phase space of geodesics.

[00:04:36] This does not automatically grant us the full quantum commutator algebra of boundary CFT operators.

[00:04:43] The framework we mapped out accurately translates the entropy Hessian into a Crofton density,

[00:04:48] and then into a symplectic form.

[00:04:50] But we must define its limits.

[00:04:53] This construction relies on highly symmetric static spaces.

[00:04:57] It resists extension to generic or...

[00:05:00] space-times. And causal inclusion in this space yields causal comparability, but

[00:05:05] never metric distance.

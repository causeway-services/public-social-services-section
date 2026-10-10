[00:00:00] Ordinary geometry measures a curve locally.

[00:00:02] You divide it into tiny pieces,

[00:00:04] approximate each piece with a straight segment,

[00:00:06] and add up their lengths.

[00:00:08] Crofton's formula takes a different route.

[00:00:11] Instead of moving along the curve,

[00:00:13] consider every possible straight line in the plane.

[00:00:16] Throw all of them at the curve

[00:00:17] and count exactly how many times each line crosses it.

[00:00:21] To track this mathematically,

[00:00:23] we identify each Euclidean line using its normal form.

[00:00:26] We use two parameters,

[00:00:28] p, the perpendicular displacement from the origin, and theta, the rotation angle of that normal line.

[00:00:35] Translating p shifts the line in its normal direction, and changing theta rotates it.

[00:00:40] We organize these parameters into the unoriented Crofton formula.

[00:00:44] This equation states that the length of the curve equals one-half the double integral of n-gamma

[00:00:50] over our two parameters, p and theta.

[00:00:52] That term inside the integral, n-gamma, is the intersection of multiplicity.

[00:00:56] It is a count of exactly how many times our specific line intersects the curve at

[00:01:01] any given moment. The formula reimagines length. It translates a one-dimensional

[00:01:07] physical property into a two-dimensional weighted volume within an abstract

[00:01:11] parameter space of lines. Let's test this on a simple case. A flat line segment on

[00:01:16] the x-axis with a length of L. If we hold the angle theta constant and sweep

[00:01:22] lines across the plane, only a specific range of p-values will hit the segment.

[00:01:26] This range matches the segment's orthogonal projection.

[00:01:29] Its width is exactly L times the absolute value of cosine theta.

[00:01:33] Because this is a straight segment, every line within that range crosses it exactly once.

[00:01:38] Our multiplicity, and gamma, is 1.

[00:01:41] Now, we integrate that width over all directions, from 0 to pi.

[00:01:45] This yields 2L.

[00:01:47] When we multiply by the one-half prefactor at the front of the formula, we arrive back at L.

[00:01:52] This shows how the one-half factor works.

[00:01:54] it averages those projected widths over every possible direction to reconstruct the true length.

[00:02:00] Now consider a circle with radius r.

[00:02:03] This introduces a closed boundary.

[00:02:05] When a line passes through the circle, it enters and exits.

[00:02:09] The multiplicity, n gamma, is now 2 for nearly every line that hits the shape.

[00:02:15] Pause and try to set up the integral for this circle.

[00:02:18] Use the unoriented bounds for the angle and find the range of displacement p that hits the circle.

[00:02:24] The angle runs from 0 to pi, and the displacement p ranges from negative r to positive r.

[00:02:31] With a multiplicity of 2, the math evaluates step-by-step to 2 pi r, the standard circumference.

[00:02:38] This result depends on that count of 2.

[00:02:41] If we only recorded whether a line hit the circle once, the factors wouldn't cancel out,

[00:02:46] and the formula would fail to produce the correct length.

[00:02:48] We must also be consistent with how we count the lines themselves.

[00:02:53] Using a range of 0 to pi counts each physical line once.

[00:02:57] If we use the full 2 pi range, we are using oriented lines,

[00:03:01] effectively counting each geometric line twice.

[00:03:04] To correct for this, we switch the prefactor from 1 half to 1 quarter.

[00:03:08] This additive counting is the only way to handle complex, folded shapes.

[00:03:13] A single line can cross a physical boundary 4, 6, or 8 times.

[00:03:17] Simply knowing that a line intersects the curve is not enough information.

[00:03:21] We must count every crossing to accurately map the line space back to physical length.

[00:03:26] The logic of counting crossings survives even in curved geometry.

[00:03:31] In a hyperbolic plane, straight Euclidean lines are replaced by the straightest possible curved paths, called geodesics.

[00:03:38] We can label these geodesics by where they hit the boundary.

[00:03:41] Each geodesic anchors to two specific points, which defines a boundary interval.

[00:03:46] This means the space of lines is now a space of boundary intervals.

[00:03:51] In holographic physics, the length of these geodesics is exactly the entanglement entropy of that boundary interval.

[00:03:58] Because length is now tied to entropy, the weight we assign to each line in our integral must also be derived from that entropy.

[00:04:05] We find this weight by calculating how the entropy changes as we shift the endpoints of the interval.

[00:04:11] Mathematically, this is a mixed partial derivative.

[00:04:14] This derivative provides the density we need to use Crofton's formula in this new informational space.

[00:04:20] However, this translation isn't automatic.

[00:04:23] We can only interpret this informational density as a geometric count of lines

[00:04:27] when the specific rules of holography apply.

[00:04:30] Without those assumptions, the derivative is just a piece of information theory,

[00:04:34] not a measure of physical space.

[00:04:36] Comparing these formulas side by side shows their shared logic.

[00:04:40] Whether we are in a flat plane or a complex holographic bulk,

[00:04:44] the core mechanism is the same.

[00:04:45] We reconstruct a curve's length by counting the objects that cross it.

[00:04:50] To use this bridge, you must have three things.

[00:04:52] The incidence of the lines, the multiplicity of the crossings, and a properly normalized measure.

[00:04:58] Remember the pre-factor rule.

[00:05:00] Use one-half for unoriented lines and one-quarter if you are counting oriented ones.

[00:05:05] Multiplicity is your safeguard.

[00:05:07] Counting every entry and exit ensures the formula remains accurate for folded or closed shapes.

[00:05:14] Crofton's formula works because length and information share the same underlying structure.

[00:05:18] By counting intersections correctly, we can reconstruct physical dimensions from simple line segments all the way to the fabric of quantum space-time.

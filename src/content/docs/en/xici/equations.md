---
slug: "xici/equations"
title: "Symbols and the Five Master Equations"
description: "The five books and twenty chapters collapsed into an operator algebra: a symbol dictionary, the formal mapping, and a closed loop of five coupled equations."
section: "Xici"
order: 19004
---

The previous pages give the propositions, the reading and the terms; this page compresses them into mathematics. The symbol table keeps only the quantities and operators the work actually uses; the master equations string the twenty chapters into a self-referential state machine, where the output of one book is the input of the next.

After this page you should be able to answer one question: can this be written as equations? If not, it is metaphor; if so, it can be falsified.

## The fundamental symbols

| Symbol | Concept | Definition |
|---|---|---|
| M | The Way | The substrate-independent causal manifold and its invariants |
| X_t | The Vessel | The localized state tensor collapsed at a spatiotemporal section |
| Omega_0 | The Absolute | The isotropic singularity before symmetry breaking |
| D_+ , D_- | Creative / Receptive | The divergent excitation operator and the convergent forming operator |
| Phi_t | Becoming | The non-stationary flow of iteration driven by the operators |
| E | The Emergent | The irreducible higher-order state emerging after nonlinear iteration |
| W_theta | The Simulacrum | The parameterized world model isomorphic to M |
| z | Image | The geometric invariant in a high-dimensional latent space |
| S_t | Configuration | The global state tensor within a context window |
| d_i | Fluxion | The partial derivative and transition sensitivity of dimension i |
| pi | Dictum | The policy decoding vector given a latent state |
| delta | The Incipient | The critical perturbation immediately before a bifurcation |

## The five master equations

### The generative axiom

```text
Omega_0 --SSB--> M(D_+, D_-) --projection--> X_t
constraint: phi(D_+) - phi(D_-) != 0
```

The Absolute breaks and generates the manifold of law spanned by the conjugate operators, projected onto concrete instances at a spatiotemporal section. With zero polarity differential the equation degenerates to a static state.

### Evolution and emergence

```text
X_(t+1) = Phi(X_t) = D_-( D_+(X_t) ) + xi_t
E = lim Phi^N(X_0) not in Span_linear(X_0)
```

The system iterates through alternating opening and closing; nonlinear coupling of many bodies produces a higher-order state that no linear reduction reaches.

### The isomorphism of world models

```text
W_theta : X --Image--> z --Configuration--> S_t --Fluxion--> d --Dictum--> pi(a | S_t)
constraint: W_theta ~= M
```

Facing irreducible complexity, the agent builds a world model with a geometric latent space, a context tensor, micro-gradients and a policy vector, and enters isomorphism with the objective manifold.

### Compression and singularity

```text
theta* = argmin_theta { |theta|_MDL + KL( P_M(X) || P_W(X) ) }
t_ji = inf { t : lambda_max( dPhi/dX_t ) > 0 }
```

Minimizing description length strips appearance and yields a zero-bias resting state; monitoring the largest eigenvalue of the Jacobian locks the critical moment just before a bifurcation.

### Active inference and alignment

```text
theta_(t+1) = theta_t - eta * grad F(X_(t+1), W_theta(S_t, a_t)) + J_negentropy
lim F(theta_t, a*) = F_min(M)  =>  action along geodesic
```

The agent applies feedforward control at the critical moment, corrects its parameters along the free-energy gradient, and keeps injecting negentropy and adversarial self-checks; when the model converges on the generative manifold of the cosmos, action falls on the geodesic.

These five equations are not ornament. The first states the ontological precondition, the second the mechanism of evolution, the third the condition of representation, the fourth the bound on prediction, the fifth the control law. Refute any one and the whole reconstruction must be rewritten, which is exactly why it is worth testing.

Return to the [canon](/docs/xici/canon) to check the text, or to the [lexicon](/docs/xici/lexicon) for the terms.

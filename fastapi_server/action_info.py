ACTION_INFO: dict = {
    0: {
        "name": "Constant Multiple Rule",
        "name_en": "linear basic",
        "color": "#7000ff",
        "description": (
            "Pull a constant multiplier factor c outside of the integration operator: "
            "∫ c · f(x) dx = c · ∫ f(x) dx."
        ),
        "steps": [
            "Scan integrand for multiplication node where one factor is a constant.",
            "Apply linearity of integration to move the constant outside.",
            "Compute the integral of the remaining function.",
            "Multiply the antiderivative by the constant.",
        ],
        "formulas": [
            "∫ c · f(x) dx = c · ∫ f(x) dx",
            "∫ c dx = cx + C",
            "∫ c · xⁿ dx = c · xⁿ⁺¹/(n+1) + C  (n ≠ -1)",
            "∫ c · eˣ dx = c · eˣ + C",
        ],
    },
    1: {
        "name": "Sum and Difference Rule",
        "name_en": "split sum",
        "color": "#ff00c8",
        "description": (
            "Distribute integration over addition/subtraction: "
            "∫ [f(x) ± g(x)] dx = ∫ f(x) dx ± ∫ g(x) dx."
        ),
        "steps": [
            "Identify terms separated by addition or subtraction.",
            "Distribute the integral sign to each term.",
            "Integrate each component separately.",
            "Combine results with original signs and append C.",
        ],
        "formulas": [
            "∫ [f(x) + g(x)] dx = ∫ f(x) dx + ∫ g(x) dx",
            "∫ [f(x) - g(x)] dx = ∫ f(x) dx - ∫ g(x) dx",
        ],
    },
    2: {
        "name": "Algebraic / Trig Identities",
        "name_en": "special formula",
        "icon": "✨",
        "color": "#ffd700",
        "description": (
            "Simplify using algebraic transformations or trigonometric identities "
            "to rewrite into standard integrable forms."
        ),
        "steps": [
            "Scan for composite algebraic structures or trig powers.",
            "Apply appropriate expansion or identity.",
            "Rewrite the integrand in expanded/simplified form.",
            "Integrate term-by-term.",
        ],
        "formulas": [
            "(a ± b)² = a² ± 2ab + b²",
            "sin²x + cos²x = 1",
            "cos(2x) = 2cos²x - 1 = 1 - 2sin²x",
            "sin(2x) = 2sin(x)cos(x)",
        ],
    },
    3: {
        "name": "Linear Substitution (u = ax + b)",
        "name_en": "u-substitution",
        "color": "#00ff88",
        "description": (
            "Simplify composite function f(ax+b) by setting u = ax+b, "
            "yielding dx = (1/a) du, so the integral scales by 1/a."
        ),
        "steps": [
            "Identify composite function with linear inner expression ax + b.",
            "Set u = ax + b, compute du = a · dx.",
            "Substitute u and dx into the integral.",
            "Evaluate simplified integral and back-substitute.",
        ],
        "formulas": [
            "u = ax + b  →  dx = (1/a) du",
            "∫ f(ax+b) dx = (1/a) · F(ax+b) + C",
            "∫ eᵃˣ dx = (1/a) · eᵃˣ + C",
            "∫ f'(x)/f(x) dx = ln|f(x)| + C",
        ],
    },
    4: {
        "name": "Integration by Parts",
        "name_en": "integration by parts",
        "color": "#ff6b35",
        "description": (
            "Solve integrals of products using: ∫ u · dv = u · v − ∫ v · du. "
            "Choose u/dv by LIATE mnemonic."
        ),
        "steps": [
            "Choose u and dv via LIATE: Log > Inverse trig > Algebraic > Trig > Exp.",
            "Compute du (derivative of u) and v (antiderivative of dv).",
            "Apply formula: u·v - ∫ v·du.",
            "Evaluate ∫ v·du and simplify.",
        ],
        "formulas": [
            "∫ u dv = uv - ∫ v du",
            "LIATE: Log > Inverse trig > Algebraic > Trig > Exp",
        ],
    },
}


def get_action_info(action: int) -> dict:
    return ACTION_INFO.get(action, {})

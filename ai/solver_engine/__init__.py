"""
ai/solver_engine/__init__.py
-----------------------------
Re-export SolverEngine để các file cũ vẫn import được:

    from ai.solver_engine import SolverEngine   # ← vẫn hoạt động
    # hoặc
    from ai.solver_engine.engine import SolverEngine
"""

from ai.solver_engine.engine import SolverEngine

__all__ = ["SolverEngine"]

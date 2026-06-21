"""
predict_gnn.py
──────────────
GNN model definition and inference wrapper.

Architecture is identical to what was trained in train_gnn.ipynb:
    IntegralGNN  – 3-layer SAGEConv + global_mean_pool + Linear head
    IntegralGNNPredictor – loads saved weights, converts LaTeX → graph → prediction
"""

import os
import torch
import torch.nn.functional as F
from torch.nn import Linear

# pyrefly: ignore [missing-import]
from torch_geometric.nn import SAGEConv, global_mean_pool
# pyrefly: ignore [missing-import]
from torch_geometric.data import Data, Batch

from ai.utils.integral import Integral

# ── Node vocabulary (must match train_gnn.ipynb) ──────────────────────────────
NODE_TYPE_MAP = {
    'VarExprNode':   0,
    'ConstExprNode': 1,
    'AddExprNode':   2,
    'SubExprNode':   3,
    'MulExprNode':   4,
    'FracExprNode':  5,
    'PowerExprNode': 6,
    'MonoExprNode':  7,
    'SqrtExprNode':  8,
    'SinExprNode':   9,
    'CosExprNode':  10,
    'TanExprNode':  11,
    'ExpExprNode':  12,
    'LogExprNode':  13,
}
NUM_NODE_FEATURES = len(NODE_TYPE_MAP)   # 14
NUM_CLASSES       = 5                  # actions 0-4 (khớp với best_gnn_model.pth mới)


# ── Model definition ──────────────────────────────────────────────────────────

class IntegralGNN(torch.nn.Module):
    """3-layer GraphSAGE classifier for integral action prediction."""

    def __init__(self, num_features: int = NUM_NODE_FEATURES,
                 hidden_channels: int = 64,
                 num_classes: int = NUM_CLASSES):
        super().__init__()
        self.conv1 = SAGEConv(num_features, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.conv3 = SAGEConv(hidden_channels, hidden_channels)
        self.fc    = Linear(hidden_channels, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch

        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))
        x = F.relu(self.conv3(x, edge_index))
        x = global_mean_pool(x, batch)

        x = F.dropout(x, p=0.5, training=self.training)
        return self.fc(x)


# ── Graph conversion ──────────────────────────────────────────────────────────

def _expr_to_graph(latex_str: str) -> Data | None:
    """Parse a LaTeX integral string into a PyG Data object (no label)."""
    try:
        parsed = Integral(latex_str)
        body   = parsed.integrand
        if body is None:
            return None
    except Exception:
        return None

    node_features: list[list[float]] = []
    edges: list[list[int]] = []

    def traverse(curr_node, current_id: int):
        node_type = type(curr_node).__name__
        feature   = [0.0] * NUM_NODE_FEATURES
        if node_type in NODE_TYPE_MAP:
            feature[NODE_TYPE_MAP[node_type]] = 1.0
        node_features.append(feature)

        if hasattr(curr_node, 'left') and curr_node.left is not None:
            left_id = len(node_features)
            edges.extend([[current_id, left_id], [left_id, current_id]])
            traverse(curr_node.left, left_id)

        if hasattr(curr_node, 'right') and curr_node.right is not None:
            right_id = len(node_features)
            edges.extend([[current_id, right_id], [right_id, current_id]])
            traverse(curr_node.right, right_id)

    traverse(body, 0)

    x = torch.tensor(node_features, dtype=torch.float)
    edge_index = (
        torch.tensor(edges, dtype=torch.long).t().contiguous()
        if edges
        else torch.empty((2, 0), dtype=torch.long)
    )
    return Data(x=x, edge_index=edge_index)


# ── Predictor wrapper ─────────────────────────────────────────────────────────

class IntegralGNNPredictor:
    """
    High-level wrapper around IntegralGNN.

    Usage
    -----
    predictor = IntegralGNNPredictor(model_path="saved_models/best_gnn_model.pth")
    action, probs = predictor.predict(r"\\int_{0}^{1}x*e^{x}dx")
    # action → int (0-4)
    # probs  → dict[int, float]  (class → probability 0-1)
    """

    def __init__(self, model_path: str,
                 hidden_channels: int = 64,
                 num_classes: int = NUM_CLASSES):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.num_classes = num_classes

        self.model = IntegralGNN(
            num_features=NUM_NODE_FEATURES,
            hidden_channels=hidden_channels,
            num_classes=num_classes,
        ).to(self.device)

        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"GNN weights not found at: {model_path}\n"
                "Run ai/model/train_gnn.ipynb first to generate the file."
            )

        state = torch.load(model_path, map_location=self.device, weights_only=True)
        self.model.load_state_dict(state)
        self.model.eval()

    # ------------------------------------------------------------------
    def predict_with_proba(self, latex_str: str) -> tuple[int, list[float]]:
        """
        Interface expected by solver_engine/helpers.py → predict_action().

        Returns
        -------
        (action, probs_array)
            action      – predicted class index (0-4), or -1 on parse failure
            probs_array – list of probabilities indexed by class (sums to 1.0)
        """
        action, probs_dict = self.predict(latex_str)
        probs_array = [probs_dict.get(i, 0.0) for i in range(self.num_classes)]
        return action, probs_array

    # ------------------------------------------------------------------
    def predict(self, latex_str: str) -> tuple[int, dict[int, float]]:
        """
        Predict the integration action for a LaTeX expression.

        Returns
        -------
        (action, probabilities)
            action        – predicted class index (0-4), or -1 on parse failure
            probabilities – {class_idx: probability}  (sums to 1.0)
        """
        graph = _expr_to_graph(latex_str)
        if graph is None:
            return -1, {i: 0.0 for i in range(self.num_classes)}

        # Wrap in a single-graph batch (PyG requires a batch dimension)
        graph.batch = torch.zeros(graph.num_nodes, dtype=torch.long)
        graph = graph.to(self.device)

        with torch.no_grad():
            logits = self.model(graph)                      # (1, num_classes)
            probs  = F.softmax(logits, dim=-1).squeeze(0)  # (num_classes,)

        action = int(probs.argmax().item())
        probs_dict = {i: float(probs[i].item()) for i in range(self.num_classes)}
        return action, probs_dict

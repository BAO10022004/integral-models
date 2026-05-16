import os
import sys
import pandas as pd
import numpy as np

# Bạn cần cài đặt thư viện trước khi chạy: 
# pip install torch
# pip install torch_geometric

import torch
import torch.nn.functional as F
from torch.nn import Linear
from torch_geometric.data import Data
from torch_geometric.loader import DataLoader
from torch_geometric.nn import SAGEConv, global_mean_pool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ai.utils.integral import Integral

# 1. Định nghĩa từ điển cho các loại Node
NODE_TYPE_MAP = {
    'VarExprNode': 0,
    'ConstExprNode': 1,
    'AddExprNode': 2,
    'SubExprNode': 3,
    'MulExprNode': 4,
    'FracExprNode': 5,
    'PowerExprNode': 6,
    'MonoExprNode': 7,
    'SqrtExprNode': 8,
    'SinExprNode': 9,
    'CosExprNode': 10,
    'TanExprNode': 11,
    'ExpExprNode': 12,
    'LogExprNode': 13,
}

NUM_NODE_FEATURES = len(NODE_TYPE_MAP)

def expr_to_graph(latex_str, label):
    """
    Chuyển đổi biểu thức LaTeX thành đồ thị PyG Data
    """
    try:
        parsed = Integral(latex_str)
        body = parsed.integrand
        if body is None:
            return None
    except Exception:
        return None

    node_features = []
    edges = []

    def traverse(curr_node, current_id):
        node_type = type(curr_node).__name__
        # Dùng One-hot encoding cho loại Node
        feature = [0.0] * NUM_NODE_FEATURES
        if node_type in NODE_TYPE_MAP:
            feature[NODE_TYPE_MAP[node_type]] = 1.0
        node_features.append(feature)

        if hasattr(curr_node, 'left') and curr_node.left is not None:
            left_id = len(node_features)
            edges.append([current_id, left_id])
            edges.append([left_id, current_id])
            traverse(curr_node.left, left_id)

        if hasattr(curr_node, 'right') and curr_node.right is not None:
            right_id = len(node_features)
            edges.append([current_id, right_id])
            edges.append([right_id, current_id])
            traverse(curr_node.right, right_id)

    traverse(body, 0)

    x = torch.tensor(node_features, dtype=torch.float)
    
    if len(edges) > 0:
        edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    else:
        # Nếu đồ thị chỉ có 1 node (vd: x)
        edge_index = torch.empty((2, 0), dtype=torch.long)

    y = torch.tensor([label], dtype=torch.long)
    return Data(x=x, edge_index=edge_index, y=y)

# 2. Định nghĩa mô hình GNN
class IntegralGNN(torch.nn.Module):
    def __init__(self, num_features, hidden_channels, num_classes):
        super(IntegralGNN, self).__init__()
        self.conv1 = SAGEConv(num_features, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.conv3 = SAGEConv(hidden_channels, hidden_channels)
        self.fc = Linear(hidden_channels, num_classes)

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch

        # Message Passing
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        x = self.conv3(x, edge_index)
        x = F.relu(x)

        # Global Pooling (Gộp thông tin đồ thị)
        # N node -> 1 vector
        x = global_mean_pool(x, batch)

        # Phân loại
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.fc(x)
        return x

# 3. Chuẩn bị dữ liệu và Huấn luyện
def main():
    print("Đang đọc dữ liệu từ dataset...")
    # Đường dẫn file dataset tùy theo vị trí chạy script
    _ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    df = pd.read_csv(os.path.join(_ROOT, "ai", "data", "processed", "dataset.csv"))
    df['action'] = pd.to_numeric(df['action'], errors='coerce').astype('Int64')
    df = df.dropna(subset=['action'])

    print("Đang tạo Graph Dataset từ Abstract Syntax Tree...")
    graph_dataset = []
    for _, row in df.iterrows():
        latex = row['integrand']
        label = int(row['action'])
        data = expr_to_graph(latex, label)
        if data is not None:
            graph_dataset.append(data)

    print(f"Tổng số mẫu đồ thị hợp lệ: {len(graph_dataset)}")

    # Chia tập Train / Test
    from sklearn.model_selection import train_test_split
    train_data, test_data = train_test_split(graph_dataset, test_size=0.2, random_state=42)

    train_loader = DataLoader(train_data, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_data, batch_size=64, shuffle=False)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Sử dụng thiết bị huấn luyện: {device}")

    model = IntegralGNN(num_features=NUM_NODE_FEATURES, hidden_channels=64, num_classes=6).to(device)
    
    # Class weights để xử lý imbalanced data (giống như trong bài tập cũ của bạn)
    # Cập nhật weight tương ứng với 6 classes
    from sklearn.utils.class_weight import compute_class_weight
    labels = [data.y.item() for data in train_data]
    classes = np.unique(labels)
    class_weights = compute_class_weight('balanced', classes=classes, y=labels)
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float).to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005)
    criterion = torch.nn.CrossEntropyLoss(weight=class_weights_tensor)

    print("Bắt đầu huấn luyện...")
    for epoch in range(1, 101):
        model.train()
        total_loss = 0
        for data in train_loader:
            data = data.to(device)
            optimizer.zero_grad()
            out = model(data)
            loss = criterion(out, data.y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item() * data.num_graphs
        
        train_loss = total_loss / len(train_loader.dataset)

        # Test
        model.eval()
        correct = 0
        # Có thể dùng F1-Score từ sklearn thay vì chỉ độ chính xác
        from sklearn.metrics import f1_score
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for data in test_loader:
                data = data.to(device)
                out = model(data)
                pred = out.argmax(dim=1)
                
                all_preds.extend(pred.cpu().numpy())
                all_labels.extend(data.y.cpu().numpy())
                
                correct += int((pred == data.y).sum())
        
        test_acc = correct / len(test_loader.dataset)
        test_f1 = f1_score(all_labels, all_preds, average='macro')
        
        if epoch % 10 == 0:
            print(f'Epoch: {epoch:03d}, Loss: {train_loss:.4f}, Test Acc: {test_acc:.4f}, Test F1-Macro: {test_f1:.4f}')

    # LƯU MÔ HÌNH SAU KHI TRAIN XONG
    _SAVED = os.path.join(_ROOT, "ai", "saved_models")
    os.makedirs(_SAVED, exist_ok=True)
    model_path = os.path.join(_SAVED, "best_gnn_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"\n✅ Đã lưu mô hình GNN tốt nhất tại: {model_path}")

if __name__ == '__main__':
    main()

import os
import sys
import torch

# Mở rộng đường dẫn để import được utils của project
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."  )))

# Load classes từ file train_gnn
# - Khi chạy trực tiếp (python predict_gnn.py) từ thư mục ai/model/: dùng bare import
# - Khi import qua API (ai.model.predict_gnn): dùng absolute package path
try:
    from ai.model.train_gnn import expr_to_graph, IntegralGNN, NUM_NODE_FEATURES
except ImportError:
    from train_gnn import expr_to_graph, IntegralGNN, NUM_NODE_FEATURES

class IntegralGNNPredictor:
    def __init__(self, model_path='../../saved_models/best_gnn_model.pth'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Khởi tạo kiến trúc mô hình (phải giống hệt lúc train)
        self.model = IntegralGNN(num_features=NUM_NODE_FEATURES, hidden_channels=64, num_classes=6)
        
        # Tải trọng số đã huấn luyện
        if os.path.exists(model_path):
            # Load trọng số vào thiết bị hiện hành (CPU/GPU)
            self.model.load_state_dict(torch.load(model_path, map_location=self.device, weights_only=True))
            self.model.to(self.device)
            self.model.eval() # Chuyển mô hình sang chế độ inference (không tính gradient, tắt dropout)
        else:
            print(f"❌ Không tìm thấy file mô hình tại {model_path}. Vui lòng chạy train_gnn.py trước để tạo file này.")
            
    def predict_with_proba(self, latex_str):
        """
        Dự đoán Action và trả về cả mảng xác suất (dùng cho Web API)
        """
        data = expr_to_graph(latex_str, label=0)
        if data is None:
            return -1, []
        
        data = data.to(self.device)
        with torch.no_grad():
            output = self.model(data)
            # Áp dụng softmax để biến đổi raw scores thành xác suất tổng bằng 1
            import torch.nn.functional as F
            probs = F.softmax(output, dim=1)[0]
            predicted_class = output.argmax(dim=1).item()
            
        return predicted_class, probs.cpu().numpy()

    def predict(self, latex_str):
        """
        Dự đoán Action (từ 0 đến 5) cho một phương trình Tích phân LaTeX
        """
        pred, _ = self.predict_with_proba(latex_str)
        return pred

# ==========================================
# VÍ DỤ CÁCH SỬ DỤNG
# ==========================================
if __name__ == '__main__':
    predictor = IntegralGNNPredictor()
    
    test_cases = [
        r"\int_{0}^{1} x \sin(x) dx",             # Từng phần (Action 5)
        r"\int_{0}^{1} \frac{2*x}{x^2 + 1} dx",   # Đổi biến (Action 4)
        r"\int_{0}^{1} 5*\sin(x) dx",             # Tách hằng số (Action 1)
        r"\int_{0}^{1} x^3 + x^2 dx",             # Tách tổng (Action 2)
        r"\int_{0}^{1} 8 dx",                     # Cơ bản (Action 0)
    ]
    
    print("\n--- THỬ NGHIỆM MÔ HÌNH GNN ---")
    for expr in test_cases:
        action = predictor.predict(expr)
        print(f"Phương trình: {expr:30s} -> Dự đoán Action: {action}")

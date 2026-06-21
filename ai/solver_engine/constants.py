MAX_DEPTH = 12   # giới hạn đệ quy tránh vòng lặp vô hạn


def action_desc(action: int) -> str:
    """Mô tả ngắn gọn cho từng action ID (model output).
    
    apply_direct KHÔNG phải nhãn model — engine tự phát hiện và xử lý nội bộ.
    """
    descs = {
        0: "Rút hằng số ra ngoài dấu tích phân (Action 0 — apply_const):  c·∫f dx",
        1: "Tách tổng / hiệu thành hai tích phân (Action 1 — apply_split): ∫(f±g) = ∫f ± ∫g",
        2: "Áp dụng công thức đặc trưng / khai triển (Action 2 — apply_special)",
        3: "Đổi biến u = ax + b (Action 3 — apply_usub)",
        4: "Tích phân từng phần / IBP (Action 4 — apply_byparts)",
    }
    return descs.get(action, f"Action {action}")

MAX_DEPTH = 12   # giới hạn đệ quy tránh vòng lặp vô hạn


def action_desc(action: int) -> str:
    """Mô tả ngắn gọn cho từng action ID."""
    descs = {
        0: "Áp dụng công thức tích phân trực tiếp (Action 0 — apply_direct)",
        1: "Rút hằng số ra ngoài dấu tích phân (Action 1 — apply_const):  c·∫f dx",
        2: "Tách tổng / hiệu thành hai tích phân (Action 2 — apply_split): ∫(f±g) = ∫f ± ∫g",
        3: "Áp dụng công thức đặc trưng / khai triển (Action 3 — apply_special)",
        4: "Đổi biến u = ax + b (Action 4 — apply_usub)",
        5: "Tích phân từng phần / IBP (Action 5 — apply_byparts)",
    }
    return descs.get(action, f"Action {action}")

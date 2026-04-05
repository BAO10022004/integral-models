class ActionData:
    def __init__(self, integral, action=1):
        self.integral = integral
        self.action = action

    def __str__(self):
        return f"Integral: {self.integral}, Action: {self.action}"\
        
    def save(self, filename='C://Users//giaba//source//repos//4//Ky2//integral_models//data//raw//data_raw.json'):
        import json
        import os

        # nếu file tồn tại → load data cũ
        data = []
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                try:
                    data = json.load(f)
                except:
                    data = []

        # thêm dữ liệu mới
        data.append(self.to_dict())

        # ghi lại file
        with open(filename, 'w') as f:
            json.dump(data, f, indent=4)
    def to_dict(self):
        return  {
            "integrand": str(self.integral),
            "action": self.action
        }
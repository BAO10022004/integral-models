import conceptAntiderivativeImg from "../assets/concept_antiderivative.png";
import conceptIndefiniteImg from "../assets/concept_indefinite_integral.png";
import defGeometricImg from "../assets/def_geometric_area.png";
import defRiemannImg from "../assets/def_riemann_sum.png";

export const DEFAULT_PAGE_CONFIG = {
  headline: "GIẢI TÍCH PHÂN",
  subtitle: "THƯ VIỆN KIẾN THỨC",
  desc: "Nơi tổng hợp toàn bộ tri thức toán học từ định lý nguyên hàm nền tảng, định nghĩa Riemann, tính chất đại số đến các phương pháp giải tích phân nâng cao do AI mô hình hóa.",
  group_algebraic_title: "Nhóm Tính Chất Đại Số (Algebraic)",
  group_geometric_title: "Nhóm Tính Chất Phân Đoạn & So Sánh",
  group_symmetry_title: "Nhóm Tính Chất Đối Xứng (Symmetry)"
};

export const DEFAULT_CONCEPTS = [
  {
    id: "concept_default_1",
    title: "Khái niệm Nguyên hàm",
    desc: "Cho hàm số f(x) xác định trên tập K. Hàm số F(x) được gọi là nguyên hàm của f(x) trên K nếu đạo hàm của F(x) bằng f(x) với mọi x thuộc K.",
    formula: "F'(x) = f(x) \\quad \\forall x \\in K",
    tagColor: "#2ed6ff",
    badge: "Cơ sở",
    image: conceptAntiderivativeImg,
    content: "Nguyên hàm là một trong những khái niệm nền tảng quan trọng nhất trong Giải tích, là cơ sở để xây dựng toàn bộ lý thuyết tích phân.\n\nNếu hàm F(x) là nguyên hàm của f(x) trên tập K, điều đó có nghĩa là khi lấy đạo hàm F(x) theo x, ta thu được chính xác hàm f(x). Về mặt hình học, điều này đồng nghĩa với việc độ dốc (slope) của đường cong F(x) tại mọi điểm x đều bằng giá trị hàm f(x) tại điểm đó.\n\nKhái niệm nguyên hàm là bước cầu nối quan trọng giữa phép tính vi phân và tích phân — nó chính là 'phép toán ngược' của đạo hàm, cho phép chúng ta đi từ f(x) trở lại F(x)."
  },
  {
    id: "concept_default_2",
    title: "Họ Nguyên hàm & Tích phân bất định",
    desc: "Nếu F(x) là một nguyên hàm của f(x) trên K thì mọi nguyên hàm của f(x) đều có dạng F(x) + C. Tập hợp các nguyên hàm này được gọi là tích phân bất định.",
    formula: "\\int f(x) dx = F(x) + C",
    tagColor: "#f843c2",
    badge: "Lý thuyết",
    image: conceptIndefiniteImg,
    content: "Nếu F(x) là một nguyên hàm cụ thể của f(x), thì toàn bộ họ nguyên hàm của f(x) được biểu diễn qua biểu thức F(x) + C, trong đó C là một hằng số tùy ý (hằng số tích phân).\n\nTích phân bất định, ký hiệu ∫f(x)dx, được định nghĩa chính là họ nguyên hàm đầy đủ này. Ký hiệu ∫ (dấu tích phân) xuất phát từ chữ 'S' kéo dài, tượng trưng cho tổng — vì bản chất sâu xa của tích phân là tính tổng liên tục.\n\nHằng số C (+C) trong biểu thức là điều không thể bỏ qua — nó thể hiện sự không xác định duy nhất của nguyên hàm: từ một hàm f(x), ta có thể tìm được vô số nguyên hàm khác nhau, tất cả đều đúng và chỉ khác nhau đúng một hằng số."
  }
];

export const DEFAULT_DEFINITIONS = [
  {
    id: "definition_default_1",
    title: "Ý nghĩa Hình học (Hình thang cong)",
    desc: "Cho hàm số f(x) liên tục và không âm trên đoạn [a, b]. Tích phân xác định biểu diễn diện tích S của hình thang cong giới hạn bởi đồ thị y=f(x), trục hoành y=0 và hai đường biên x=a, x=b.",
    formula: "S = \\int_{a}^{b} f(x) dx",
    tagColor: "#a2ea13",
    badge: "Hình học",
    image: defGeometricImg,
    content: "Ý nghĩa hình học là cách hiểu trực quan nhất về tích phân xác định. Khi hàm f(x) ≥ 0 trên đoạn [a, b], tích phân ∫[a,b] f(x)dx chính xác bằng diện tích phần hình phẳng được bao bởi:\n\n• Đường cong y = f(x) phía trên\n• Trục hoành Ox phía dưới\n• Hai đường thẳng đứng x = a và x = b ở hai bên\n\nKhi f(x) có thể âm, tích phân đo 'diện tích đại số' — phần trên trục hoành tính dương (+), phần dưới trục hoành tính âm (−). Đây là nền tảng để tính diện tích hình phẳng trong thực tế."
  },
  {
    id: "definition_default_2",
    title: "Định nghĩa Giới hạn Tổng Riemann",
    desc: "Tích phân xác định của hàm số f(x) trên đoạn [a, b] được định nghĩa bằng giới hạn của tổng diện tích các cột hình chữ nhật chia nhỏ khi số phân hoạch tiến ra vô hạn.",
    formula: "\\int_{a}^{b} f(x) dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i^*) \\Delta x_i",
    tagColor: "#2ed6ff",
    badge: "Giới hạn",
    image: defRiemannImg,
    content: "Đây là định nghĩa toán học chặt chẽ và chính xác nhất của tích phân xác định, được đặt theo tên nhà toán học Bernhard Riemann (1826–1866).\n\nQuy trình xây dựng tổng Riemann:\n1. Chia đoạn [a, b] thành n đoạn nhỏ bằng nhau, mỗi đoạn có độ rộng Δx = (b−a)/n\n2. Trong mỗi đoạn nhỏ [x_{i-1}, x_i], chọn điểm đại diện x*_i\n3. Xây dựng hình chữ nhật có chiều rộng Δx và chiều cao f(x*_i)\n4. Tính tổng diện tích tất cả hình chữ nhật: Σ f(x*_i)·Δx\n\nKhi n → ∞, tổng Riemann hội tụ về một giá trị xác định — đó chính là tích phân xác định. Định nghĩa này bảo đảm tính nghiêm ngặt và nhất quán toán học."
  }
];

export const DEFAULT_THEOREMS = [
  {
    id: "theorem_default_1",
    title: "Định lý Newton-Leibniz",
    desc: "Định lý cơ bản nhất của Giải tích liên kết đạo hàm và tích phân, cho phép tính nhanh tích phân bằng cách lấy hiệu giá trị nguyên hàm tại hai đầu mút cận.",
    formula: "\\int_{a}^{b} f(x) dx = F(b) - F(a) = F(x) \\Big|_{a}^{b}",
    tagColor: "#f843c2",
    badge: "Quan trọng"
  },
  {
    id: "theorem_default_2",
    title: "Định lý Giá trị Trung bình Tích phân",
    desc: "Nếu f(x) liên tục trên đoạn [a, b], tồn tại một điểm c thuộc (a, b) sao cho diện tích dưới đồ thị f(x) bằng diện tích hình chữ nhật có chiều rộng (b-a) và chiều cao f(c).",
    formula: "\\int_{a}^{b} f(x) dx = f(c)(b-a) \\quad \\text{với } c \\in (a, b)",
    tagColor: "#a2ea13",
    badge: "Định lý"
  }
];

export const DEFAULT_PROPERTIES = [
  {
    id: "prop_default_1",
    group: "algebraic",
    title: "Tính Tuyến Tính (Linearity)",
    desc: "Tách tổng/hiệu nguyên hàm và đưa hằng số nhân tử ra ngoài dấu tích phân.",
    formula: "\\int [k \\cdot f(x) + l \\cdot g(x)] dx = k \\int f(x) dx + l \\int g(x) dx",
    image: "",
    content: "Tính tuyến tính là tính chất cơ bản nhất của tích phân xác định cũng như tích phân bất định. Nó cho phép chúng ta chia tách một tích phân phức tạp thành tổng các tích phân đơn giản hơn.\n\nTính chất này gồm hai phần:\n1. Tích phân của một tổng bằng tổng các tích phân.\n2. Hằng số nhân tử có thể được đưa ra ngoài dấu tích phân."
  },
  {
    id: "prop_default_2",
    group: "algebraic",
    title: "Đổi Cận Tích Phân (Bounds Swap)",
    desc: "Đảo ngược vị trí cận trên và cận dưới sẽ đảo ngược dấu số học của tích phân.",
    formula: "\\int_{a}^{b} f(x) dx = -\\int_{b}^{a} f(x) dx",
    image: "",
    content: "Khi ta hoán đổi vị trí của cận trên và cận dưới trong tích phân xác định, giá trị tuyệt đối của kết quả không đổi nhưng dấu của nó sẽ bị đổi ngược.\n\nĐiều này tương thích với ý nghĩa tích phân là tổng giới hạn Riemann: khi đi ngược từ phải sang trái (từ b về a), độ rộng phân hoạch Δx đổi dấu từ dương sang âm."
  },
  {
    id: "prop_default_3",
    group: "algebraic",
    title: "Cận Trùng Nhau (Zero Width)",
    desc: "Tích phân trên khoảng rộng bằng 0 luôn cho kết quả bằng 0.",
    formula: "\\int_{a}^{a} f(x) dx = 0",
    image: "",
    content: "Nếu cận trên và cận dưới của tích phân trùng nhau, diện tích hình giới hạn có chiều rộng bằng 0, do đó tích phân luôn bằng 0."
  },
  {
    id: "prop_default_4",
    group: "geometric",
    title: "Cộng Tính Đoạn (Interval Split)",
    desc: "Tách khoảng tích phân [a, b] thành các đoạn nhỏ nối tiếp nhau (hữu ích cho hàm trị tuyệt đối).",
    formula: "\\int_{a}^{b} f(x) dx = \\int_{a}^{c} f(x) dx + \\int_{c}^{b} f(x) dx",
    image: "",
    content: "Chúng ta có thể chia khoảng lấy tích phân [a, b] thành hai đoạn nhỏ [a, c] và [c, b] nối tiếp nhau. Tính chất này vô cùng hữu dụng khi cần tính tích phân của các hàm số cho bởi nhiều công thức khác nhau hoặc các hàm chứa dấu giá trị tuyệt đối."
  },
  {
    id: "prop_default_5",
    group: "geometric",
    title: "Tính So Sánh (Inequality)",
    desc: "Nếu hàm số f luôn lớn hơn g trên [a, b] thì diện tích hình giới hạn bởi f cũng lớn hơn g.",
    formula: "f(x) \\ge g(x) \\implies \\int_{a}^{b} f(x) dx \\ge \\int_{a}^{b} g(x) dx",
    image: "",
    content: "Nếu hàm số f(x) lớn hơn hoặc bằng g(x) tại mọi điểm x trên đoạn [a, b] thì tích phân của f(x) cũng lớn hơn hoặc bằng tích phân của g(x) trên đoạn đó. Về mặt hình học, diện tích hình phẳng nằm dưới đồ thị f(x) bao trùm diện tích nằm dưới g(x)."
  },
  {
    id: "prop_default_6",
    group: "symmetry",
    title: "Tích Phân Hàm Số Lẻ",
    desc: "Tích phân trên đoạn đối xứng quanh gốc tọa độ của hàm lẻ luôn bằng 0.",
    formula: "\\int_{-a}^{a} f(x) dx = 0 \\quad (\\text{nếu } f(-x) = -f(x))",
    image: "",
    content: "Đối với hàm lẻ f(x), phần diện tích bên trái trục tung (phía âm) và phần diện tích bên phải trục tung (phía dương) có giá trị đại số trái dấu nhau và triệt tiêu lẫn nhau hoàn toàn trên đoạn đối xứng [-a, a]. Do đó, tích phân bằng 0."
  },
  {
    id: "prop_default_7",
    group: "symmetry",
    title: "Tích Phân Hàm Số Chẵn",
    desc: "Tích phân đoạn đối xứng của hàm chẵn bằng 2 lần tích phân trên nửa khoảng dương.",
    formula: "\\int_{-a}^{a} f(x) dx = 2 \\int_{0}^{a} f(x) dx \\quad (\\text{nếu } f(-x) = f(x))",
    image: "",
    content: "Đồ thị hàm số chẵn đối xứng qua trục tung. Do đó, phần diện tích bên trái và bên phải trục tung trên đoạn [-a, a] là hoàn toàn bằng nhau, dẫn đến tích phân bằng 2 lần tích phân trên nửa đoạn [0, a]."
  }
];

export const DEFAULT_PROPERTY_GROUPS = [
  { id: "algebraic", title: "Nhóm Tính Chất Đại Số (Algebraic)" },
  { id: "geometric", title: "Nhóm Tính Chất Phân Đoạn & So Sánh" },
  { id: "symmetry", title: "Nhóm Tính Chất Đối Xứng (Symmetry)" }
];


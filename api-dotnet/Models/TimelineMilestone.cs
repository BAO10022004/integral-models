using Google.Cloud.Firestore;

namespace IntegralApi.Models;

[FirestoreData]
public class TimelineMilestone
{
    [FirestoreProperty]
    public int Id { get; set; }

    [FirestoreProperty]
    public string Year { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Image { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Desc { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Article { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ArticleType { get; set; } = "text"; // "text" | "html"

    [FirestoreProperty]
    public string Url { get; set; } = string.Empty;
}

[FirestoreData]
public class HistoryConfig
{
    [FirestoreProperty]
    public string HeroImgUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ShowcaseImgUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Headline { get; set; } = "The Journey of AI Innovation";

    [FirestoreProperty]
    public string IntroText { get; set; } = "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.";

    [FirestoreProperty]
    public List<string> MarqueeImages { get; set; } = [];
}

[FirestoreData]
public class HistoryConfigDto
{
    [FirestoreProperty]
    public HistoryConfig Config { get; set; } = new();

    [FirestoreProperty]
    public List<TimelineMilestone> Milestones { get; set; } = [];

    public static HistoryConfigDto GetDefault()
    {
        return new HistoryConfigDto
        {
            Config = new HistoryConfig
            {
                HeroImgUrl = "",
                ShowcaseImgUrl = "",
                Headline = "Hành Trình Đổi Mới Của Trí Tuệ Nhân Tạo",
                IntroText = "Hệ thống giải tích phân thông minh ra đời từ khát vọng rút ngắn khoảng cách giữa các học thuyết toán học phức tạp và ứng dụng thực tế trong thời đại số.\n\nTrải qua vô số chu trình nghiên cứu và tối ưu hóa thuật toán chuyên sâu, chúng tôi đã phát triển thành công mô hình học máy phân loại hành động tiên tiến được vận hành bởi Học Sâu. Ngày nay, mọi bài toán tích phân—từ những khái niệm cơ bản nhất cho đến các hệ thức suy dẫn cực kỳ phức tạp—đều được phân tích và giải quyết chỉ trong nháy mắt với độ chính xác tuyệt đối."
            },
            Milestones = new List<TimelineMilestone>
            {
                new TimelineMilestone
                {
                    Id = 1,
                    Year = "1687",
                    Title = "Kỷ nguyên Newton & Leibniz",
                    Image = "",
                    Desc = "Đặt nền móng độc lập cho phép tính giải tích, định nghĩa tích phân là phép toán ngược của vi phân.",
                    Article = "<h3>Thời kỳ Newton & Leibniz</h3><p>Năm 1687 đánh dấu bước ngoặt vĩ đại khi Isaac Newton xuất bản tác phẩm kiệt tác <i>Philosophiæ Naturalis Principia Mathematica</i>. Cùng thời gian đó, Gottfried Wilhelm Leibniz cũng phát triển độc lập hệ thống vi phân và tích phân của riêng mình với các ký hiệu trực quan mà chúng ta vẫn sử dụng ngày nay.</p><p>Hệ thống của họ đã liên kết hai bài toán tưởng chừng độc lập: tìm tiếp tuyến (đạo hàm) và tìm diện tích dưới đường cong (tích phân).</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/History_of_calculus"
                },
                new TimelineMilestone
                {
                    Id = 2,
                    Year = "1854",
                    Title = "Sự Chặt Chẽ Của Tích Phân Riemann",
                    Image = "",
                    Desc = "Bernhard Riemann định nghĩa tích phân thông qua giới hạn phân hoạch, thiết lập nền tảng toán học chặt chẽ.",
                    Article = "Bernhard Riemann đã giới thiệu định nghĩa chặt chẽ về tích phân trong luận án của mình vào năm 1854. Định nghĩa này, ngày nay được gọi là tích phân Riemann, dựa trên việc xấp xỉ diện tích dưới đường cong bằng cách cộng diện tích của các hình chữ nhật đứng hẹp (tổng Riemann).\n\nBằng cách lấy giới hạn khi chiều rộng của các hình chữ nhật tiến dần về 0, Riemann đã thiết lập một nền tảng toán học vững chắc cho khái niệm tích lũy liên tục.",
                    ArticleType = "text",
                    Url = "https://en.wikipedia.org/wiki/Riemann_integral"
                },
                new TimelineMilestone
                {
                    Id = 3,
                    Year = "1960",
                    Title = "Kỷ Nguyên Số Hóa Máy Tính",
                    Image = "",
                    Desc = "Các thuật toán tích phân hiệu năng cao được triển khai trên máy tính lớn để xấp xỉ các phép tính số phức tạp.",
                    Article = "<h3>Kỷ nguyên Số hóa Máy tính</h3><p>Với sự ra đời của các máy tính mainframe vào thập niên 1960, các nhà toán học đã chuyển đổi các lý thuyết vi tích phân thành các thuật toán xấp xỉ số học hiệu năng cao.</p><p>Các phương pháp như Simpson, Runge-Kutta hay Gauss Quadrature được lập trình để giải quyết các hệ phương trình tích phân phức tạp trong hàng không vũ trụ và vật lý hạt nhân.</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/Numerical_integration"
                },
                new TimelineMilestone
                {
                    Id = 4,
                    Year = "2020",
                    Title = "Hệ Thống Đại Số Máy Tính (CAS)",
                    Image = "",
                    Desc = "Hệ thống đại số máy tính tự động hóa các chuỗi biến đổi công thức giải tích và các bước giải ký hiệu.",
                    Article = "Vào cuối thập niên 2010 và đầu thập niên 2020, các Hệ thống Đại số Máy tính (CAS) như Mathematica, Maple, và SymPy đã cách mạng hóa giáo dục toán học và kỹ thuật. Các công cụ này tự động hóa chuỗi đạo hàm công thức ký hiệu, thực hiện các bước tích phân bất định phức tạp chỉ trong tích tắc mà không mắc lỗi tính toán của con người.",
                    ArticleType = "text",
                    Url = "https://en.wikipedia.org/wiki/Computer_algebra_system"
                },
                new TimelineMilestone
                {
                    Id = 5,
                    Year = "2026",
                    Title = "Bộ Giải AI Thần Kinh GNN Sâu",
                    Image = "",
                    Desc = "Mạng nơ-ron phân loại và dự đoán các bước giải tích phân ngay lập tức, kết nối trực giác nơ-ron với logic toán học chặt chẽ.",
                    Article = "<h3>Trí Tuệ Nhân Tạo & Mô Hình GNN</h3><p>Năm 2026 đánh dấu đỉnh cao của AI trong Toán học. Bằng việc kết hợp Đồ thị Mạng Thần Kinh (GNN) với các mô hình Phân loại Hành động Học Sâu (Deep Learning Action Classification), hệ thống Solver của chúng tôi có khả năng 'hiểu' trực giác cấu trúc toán học của các bài toán tích phân cực kỳ phức tạp.</p><p>Hệ thống không chỉ đưa ra đáp án cuối cùng mà còn phân tích và giải thích chi tiết từng bước chuyển đổi logic tựa như một nhà toán học thực thụ.</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/Graph_neural_network"
                }
            }
        };
    }
}

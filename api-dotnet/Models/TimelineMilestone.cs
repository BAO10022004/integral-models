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
                Headline = "The Journey of AI Innovation",
                IntroText = "The intelligent calculus solver system was born from a desire to bridge the gap between complex mathematical theories and real-world digital applications.\n\nThrough numerous cycles of research and algorithmic optimization, we developed a state-of-the-art action classification model powered by Deep Learning. Today, any integral problem—from fundamental concepts to highly complex derivations—is processed in the blink of an eye with absolute precision."
            },
            Milestones = new List<TimelineMilestone>
            {
                new TimelineMilestone
                {
                    Id = 1,
                    Year = "1687",
                    Title = "Newton & Leibniz Era",
                    Image = "",
                    Desc = "Independent formulation of analytical calculus, introducing integrations as inverse derivative steps.",
                    Article = "<h3>Thời kỳ Newton & Leibniz</h3><p>Năm 1687 đánh dấu bước ngoặt vĩ đại khi Isaac Newton xuất bản tác phẩm kiệt tác <i>Philosophiæ Naturalis Principia Mathematica</i>. Cùng thời gian đó, Gottfried Wilhelm Leibniz cũng phát triển độc lập hệ thống vi phân và tích phân của riêng mình với các ký hiệu trực quan mà chúng ta vẫn sử dụng ngày nay.</p><p>Hệ thống của họ đã liên kết hai bài toán tưởng chừng độc lập: tìm tiếp tuyến (đạo hàm) và tìm diện tích dưới đường cong (tích phân).</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/History_of_calculus"
                },
                new TimelineMilestone
                {
                    Id = 2,
                    Year = "1854",
                    Title = "Riemann Calculus Rigor",
                    Image = "",
                    Desc = "Bernhard Riemann defines analytical integration through partition limits, establishing rigorous mathematics proofs.",
                    Article = "Bernhard Riemann introduced a rigorous definition of the integral in his 1854 Habilitation thesis. This definition, now known as the Riemann integral, is based on approximating the area under a curve by summing up the areas of narrow vertical rectangles (Riemann sums).\n\nBy taking the limit as the rectangles approaches zero, Riemann mathematically established the concept of continuous accumulation.",
                    ArticleType = "text",
                    Url = "https://en.wikipedia.org/wiki/Riemann_integral"
                },
                new TimelineMilestone
                {
                    Id = 3,
                    Year = "1960",
                    Title = "Mainframe Numerics",
                    Image = "",
                    Desc = "High-performance integration algorithms are deployed on computer processors for complex numerical approximations.",
                    Article = "<h3>Kỷ nguyên Số hóa Máy tính</h3><p>Với sự ra đời của các máy tính mainframe vào thập niên 1960, các nhà toán học đã chuyển đổi các lý thuyết vi tích phân thành các thuật toán xấp xỉ số học hiệu năng cao.</p><p>Các phương pháp như Simpson, Runge-Kutta hay Gauss Quadrature được lập trình để giải quyết các hệ phương trình tích phân phức tạp trong hàng không vũ trụ và vật lý hạt nhân.</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/Numerical_integration"
                },
                new TimelineMilestone
                {
                    Id = 4,
                    Year = "2020",
                    Title = "Symbolic CAS Systems",
                    Image = "",
                    Desc = "Computer Algebra Systems automate analytical formula derivation chains and symbolic step solutions.",
                    Article = "In the late 2010s and early 2020s, Computer Algebra Systems (CAS) like Mathematica, Maple, and SymPy revolutionized mathematics education and engineering. These tools automate symbolic formula derivation chains, performing complex indefinite integration steps in fractions of a second without human calculation error.",
                    ArticleType = "text",
                    Url = "https://en.wikipedia.org/wiki/Computer_algebra_system"
                },
                new TimelineMilestone
                {
                    Id = 5,
                    Year = "2026",
                    Title = "Deep AI GNN Solver",
                    Image = "",
                    Desc = "Neural networks classify and predict calculus action steps instantly, bridging neural intuition with rigorous math logic.",
                    Article = "<h3>Trí Tuệ Nhân Tạo & Mô Hình GNN</h3><p>Năm 2026 đánh dấu đỉnh cao của AI trong Toán học. Bằng việc kết hợp Đồ thị Mạng Thần Kinh (GNN) với các mô hình Phân loại Hành động Học Sâu (Deep Learning Action Classification), hệ thống Solver của chúng tôi có khả năng 'hiểu' trực giác cấu trúc toán học của các bài toán tích phân cực kỳ phức tạp.</p><p>Hệ thống không chỉ đưa ra đáp án cuối cùng mà còn phân tích và giải thích chi tiết từng bước chuyển đổi logic tựa như một nhà toán học thực thụ.</p>",
                    ArticleType = "html",
                    Url = "https://en.wikipedia.org/wiki/Graph_neural_network"
                }
            }
        };
    }
}

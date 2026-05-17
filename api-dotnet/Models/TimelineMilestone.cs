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
}

[FirestoreData]
public class HistoryConfigDto
{
    [FirestoreProperty]
    public HistoryConfig Config { get; set; } = new();

    [FirestoreProperty]
    public List<TimelineMilestone> Milestones { get; set; } = [];
}

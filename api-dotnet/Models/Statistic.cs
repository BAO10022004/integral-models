using Google.Cloud.Firestore;

namespace IntegralApi.Models;

[FirestoreData]
public class UserStatistics
{
    [FirestoreProperty]
    public string UserId { get; set; } = string.Empty;

    [FirestoreProperty]
    public int TotalSolved { get; set; }

    [FirestoreProperty]
    public int CorrectSolutions { get; set; }

    [FirestoreProperty]
    public double AverageSolveTimeMs { get; set; }

    [FirestoreProperty]
    public int DailyStreak { get; set; }

    [FirestoreProperty]
    public DateTime LastSolvedAt { get; set; }
}
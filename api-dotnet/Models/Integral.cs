using Google.Cloud.Firestore;

namespace IntegralApi.Models;

public class IntegralRequest
{
    public string Latex { get; set; } = string.Empty;

    public bool ShowSteps { get; set; } = true;

    public bool UseAI { get; set; } = true;
}

[FirestoreData]
public class IntegralResponse
{
    [FirestoreProperty]
    public bool Success { get; set; }

    [FirestoreProperty]
    public string Input { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Result { get; set; } = string.Empty;

    [FirestoreProperty]
    public string FinalAnswer { get; set; } = string.Empty;

    [FirestoreProperty]
    public double Confidence { get; set; }

    [FirestoreProperty]
    public List<SolutionStep> Steps { get; set; } = [];

    [FirestoreProperty]
    public string Error { get; set; } = string.Empty;

    [FirestoreProperty]
    public double ExecutionTimeMs { get; set; }
}

[FirestoreData]
public class SolutionStep
{
    [FirestoreProperty]
    public int StepNumber { get; set; }

    [FirestoreProperty]
    public string Action { get; set; } = string.Empty;

    [FirestoreProperty]
    public int ActionId { get; set; }

    [FirestoreProperty]
    public string Expression { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Explanation { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Kind { get; set; } = string.Empty;

    [FirestoreProperty]
    public int Depth { get; set; }

    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Formula { get; set; } = string.Empty;

    [FirestoreProperty]
    public string IntegralStr { get; set; } = string.Empty;

    [FirestoreProperty]
    public double? Value { get; set; }
}
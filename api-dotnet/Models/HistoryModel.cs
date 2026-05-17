namespace IntegralApi.Models;

public class IntegralHistory
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string UserId { get; set; } = string.Empty;

    public string Latex { get; set; } = string.Empty;

    public string Result { get; set; } = string.Empty;

    public List<SolutionStep> Steps { get; set; } = [];

    public double SolveTimeMs { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
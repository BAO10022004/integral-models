namespace IntegralApi.Models;

public class Exercise
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string Title { get; set; } = string.Empty;

    public string Latex { get; set; } = string.Empty;

    public string Solution { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "easy";

    public List<string> Tags { get; set; } = [];

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
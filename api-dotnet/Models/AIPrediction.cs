namespace IntegralApi.Models;

public class ActionPrediction
{
    public int ActionId { get; set; }

    public string ActionName { get; set; } = string.Empty;

    public double Probability { get; set; }

    public List<double> Scores { get; set; } = [];
}
public class FeatureVector
{
    public bool HasFraction { get; set; }

    public bool HasTrig { get; set; }

    public bool HasLog { get; set; }

    public bool HasExponential { get; set; }

    public int PolynomialDegree { get; set; }

    public int TreeDepth { get; set; }

    public int NodeCount { get; set; }
}
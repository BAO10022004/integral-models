namespace IntegralApi.Models;

public class FirebaseVerifyRequest
{
    public string Token { get; set; } = string.Empty;
}

public class UserResponse
{
    public string Uid { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
}

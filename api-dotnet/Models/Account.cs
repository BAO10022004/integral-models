using Google.Cloud.Firestore;

namespace IntegralApi.Models;

[FirestoreData]
public class Account
{
    [FirestoreProperty]
    public string Uid { get; set; } = string.Empty;
    [FirestoreProperty]
    public string Email { get; set; } = string.Empty;
    [FirestoreProperty]
    public string DisplayName { get; set; } = string.Empty;
    [FirestoreProperty]
    public string PhotoUrl { get; set; } = string.Empty;
    [FirestoreProperty]
    public string ProviderId { get; set; } = string.Empty; // e.g., "password", "google.com"
    [FirestoreProperty]
    public bool EmailVerified { get; set; }
    [FirestoreProperty]
    public string Role { get; set; } = "user"; // "admin" | "user"
    [FirestoreProperty]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [FirestoreProperty]
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
}

public class EmailLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class SocialLoginRequest
{
    public string Token { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty; // "google", "github", etc.
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string DisplayName { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
}

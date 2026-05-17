using FirebaseAdmin.Auth;
using IntegralApi.Models;
using System.Net.Http.Json;

namespace IntegralApi.Services;

public interface IAccountService
{
    Task<Account> RegisterWithEmailAsync(string email, string password, string displayName);
    Task<Account> LoginWithEmailAsync(string email, string password);
    Task<Account> GetAccountAsync(string uid);
    Task<Account> UpdateAccountAsync(string uid, string displayName, string photoUrl);
    Task DeleteAccountAsync(string uid);
    Task<string> CreateCustomTokenAsync(string uid);
}

public class AccountService : IAccountService
{
    private readonly FirestoreService _firestoreService;
    private readonly HttpClient _httpClient;
    private readonly string _firebaseApiKey = "AIzaSyBy1Cru6XT5EPDegCtWWhfc6Oy74teb_3U";

    public AccountService(FirestoreService firestoreService, HttpClient httpClient)
    {
        _firestoreService = firestoreService;
        _httpClient = httpClient;
    }

    public async Task<Account> RegisterWithEmailAsync(string email, string password, string displayName)
    {
        var userArgs = new UserRecordArgs
        {
            Email = email,
            Password = password,
            DisplayName = displayName,
            EmailVerified = false,
        };

        UserRecord userRecord = await FirebaseAuth.DefaultInstance.CreateUserAsync(userArgs);

        var account = new Account
        {
            Uid = userRecord.Uid,
            Email = userRecord.Email,
            DisplayName = userRecord.DisplayName,
            ProviderId = "password",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        await _firestoreService.SaveAccountAsync(account);
        return account;
    }

    public async Task<Account> LoginWithEmailAsync(string email, string password)
    {
        var requestBody = new
        {
            email,
            password,
            returnSecureToken = true
        };

        var response = await _httpClient.PostAsJsonAsync(
            $"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={_firebaseApiKey}",
            requestBody);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Login failed: {error}");
        }

        var result = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
        string uid = result.GetProperty("localId").GetString()!;

        return await GetAccountAsync(uid);
    }

    public async Task<Account> GetAccountAsync(string uid)
    {
        var account = await _firestoreService.GetAccountAsync(uid);
        if (account == null)
        {
            // Fallback to Auth if not in Firestore
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);
            account = new Account
            {
                Uid = userRecord.Uid,
                Email = userRecord.Email,
                DisplayName = userRecord.DisplayName,
                PhotoUrl = userRecord.PhotoUrl,
                EmailVerified = userRecord.EmailVerified
            };
            await _firestoreService.SaveAccountAsync(account);
        }
        return account;
    }

    public async Task<Account> UpdateAccountAsync(string uid, string displayName, string photoUrl)
    {
        var userArgs = new UserRecordArgs
        {
            Uid = uid,
            DisplayName = displayName,
            PhotoUrl = photoUrl
        };

        await FirebaseAuth.DefaultInstance.UpdateUserAsync(userArgs);
        
        var account = await GetAccountAsync(uid);
        account.DisplayName = displayName;
        account.PhotoUrl = photoUrl;
        
        await _firestoreService.SaveAccountAsync(account);
        return account;
    }

    public async Task DeleteAccountAsync(string uid)
    {
        await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid);
        // Note: You might want to delete from Firestore too
    }

    public async Task<string> CreateCustomTokenAsync(string uid)
    {
        return await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync(uid);
    }
}

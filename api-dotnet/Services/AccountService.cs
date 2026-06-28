using FirebaseAdmin.Auth;
using IntegralApi.Models;
using System.Net.Http.Json;
using System.Collections.Concurrent;
using System.IO;
using MimeKit;
using MailKit.Net.Smtp;

namespace IntegralApi.Services;

public interface IAccountService
{
    Task<Account> RegisterWithEmailAsync(string email, string password, string displayName, string role = "user");
    Task<Account> LoginWithEmailAsync(string email, string password);
    Task<Account> GetAccountAsync(string uid);
    Task<Account> UpdateAccountAsync(string uid, string displayName, string photoUrl, string phone);
    Task DeleteAccountAsync(string uid);
    Task<string> CreateCustomTokenAsync(string uid);
    Task SendOtpAsync(string email);
    Task<Account> VerifyOtpAsync(string email, string code);
    Task<List<Account>> GetAllAccountsAsync();
    Task<Account> UpdateRoleAsync(string uid, string role);
    Task<Account> UpdateStatusAsync(string uid, string status);
    Task ChangePasswordAsync(string uid, string newPassword);
}

public class AccountService : IAccountService
{
    #region Dependencies & Fields
    private readonly FirestoreService _firestoreService;
    private readonly HttpClient _httpClient;
    private readonly string _firebaseApiKey = "AIzaSyBy1Cru6XT5EPDegCtWWhfc6Oy74teb_3U";

    public AccountService(FirestoreService firestoreService, HttpClient httpClient)
    {
        _firestoreService = firestoreService;
        _httpClient = httpClient;
    }
    #endregion

    #region Registration & Standard Login
    public async Task<Account> RegisterWithEmailAsync(string email, string password, string displayName, string role = "user")
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
            DisplayName = userRecord.DisplayName ?? "",
            Role = role,
            Status = "Hoạt động",
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
    #endregion

    #region Firestore & Firebase Account Management
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

    public async Task<Account> UpdateAccountAsync(string uid, string displayName, string photoUrl, string phone)
    {
        var userArgs = new UserRecordArgs
        {
            Uid = uid,
            DisplayName = displayName,
            PhotoUrl = photoUrl
        };

        try
        {
            await FirebaseAuth.DefaultInstance.UpdateUserAsync(userArgs);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Firebase Auth update profile exception ignored: {ex.Message}");
        }
        
        var account = await GetAccountAsync(uid);
        account.DisplayName = displayName;
        account.PhotoUrl = photoUrl;
        account.Phone = phone;
        
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
    #endregion

    #region OTP Verification & Email Dispatch
    private static readonly ConcurrentDictionary<string, OtpSession> _otpSessions = new();

    public async Task SendOtpAsync(string email)
    {
        // 1. Verify if the account exists in Firebase Auth to enforce "no self-registration via OTP"
        try
        {
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(email);
        }
        catch (FirebaseAuthException ex) when (ex.AuthErrorCode == AuthErrorCode.UserNotFound)
        {
            throw new Exception("Tài khoản không tồn tại trên hệ thống.");
        }
        catch (Exception ex) when (ex.Message.Contains("no user record found"))
        {
            throw new Exception("Tài khoản không tồn tại trên hệ thống.");
        }

        // 2. Generate a 6-digit OTP
        var random = new Random();
        string otpCode = random.Next(100000, 999999).ToString();

        // 3. Store OTP in memory
        var session = new OtpSession
        {
            Email = email,
            Code = otpCode,
            Expiry = DateTime.UtcNow.AddMinutes(5)
        };
        _otpSessions[email.ToLower()] = session;

        // 4. Send email via SMTP
        try
        {
            await SendVerificationCodeAsync(email, otpCode);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending OTP email: {ex.Message}");
            throw new Exception($"Không thể gửi email xác thực OTP: {ex.Message}");
        }

        // 5. Write to last_otp.json inside the workspace root (or api-dotnet) directory
        try
        {
            var otpData = new { Email = email, Code = otpCode, Timestamp = DateTime.UtcNow };
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "last_otp.json");
            await File.WriteAllTextAsync(filePath, System.Text.Json.JsonSerializer.Serialize(otpData));
            
            // Sibling check for web-ui (to make it extremely easy to read)
            var siblingPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "web-ui", "last_otp.json");
            if (Directory.Exists(Path.GetDirectoryName(siblingPath)))
            {
                await File.WriteAllTextAsync(siblingPath, System.Text.Json.JsonSerializer.Serialize(otpData));
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to write OTP to file: {ex.Message}");
        }
    }

    public async Task SendVerificationCodeAsync(string toEmail, string code)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Integral.AI", "giabaoonutc2@gmail.com"));
        message.To.Add(new MailboxAddress("", toEmail));
        message.Subject = "Mã xác thực đăng nhập - Integral.AI";

        message.Body = new TextPart("html")
        {
            Text = CreateVerificationEmailTemplate(code)
        };

        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, false);
        await client.AuthenticateAsync("giabaoonutc2@gmail.com", "zaxhlxwulmedygre");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private string CreateVerificationEmailTemplate(string code)
    {
        return $@"
        <div style=""font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0b0f; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1f1f2e;"">
            <div style=""text-align: center; margin-bottom: 30px;"">
                <h1 style=""color: #e8c96a; font-size: 28px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;"">INTEGRAL.AI</h1>
                <p style=""color: #888899; font-size: 14px; margin: 5px 0 0;"">Secured Intelligent Calculus Engine</p>
            </div>
            
            <div style=""background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 12px; text-align: center;"">
                <h2 style=""color: #ffffff; font-size: 20px; margin-top: 0; font-weight: 600;"">Mã Xác Thực Đăng Nhập (OTP)</h2>
                <p style=""color: #b0b0c0; font-size: 15px; line-height: 1.6;"">
                    Bạn vừa yêu cầu đăng nhập bằng mã OTP tại hệ thống Integral.AI. Vui lòng sử dụng mã bảo mật dưới đây để hoàn tất quá trình xác minh.
                </p>
                
                <div style=""background: #1a1a24; border: 1px solid #e8c96a; padding: 15px 30px; border-radius: 8px; display: inline-block; margin: 25px 0; letter-spacing: 5px; font-size: 32px; font-weight: bold; color: #e8c96a; font-family: 'Courier New', Courier, monospace;"">
                    {code}
                </div>
                
                <p style=""color: #ff5555; font-size: 13px; margin: 15px 0 0; font-weight: 600;"">
                    Mã xác thực này chỉ có hiệu lực trong vòng 5 phút. Không chia sẻ mã này với bất kỳ ai.
                </p>
            </div>
            
            <div style=""text-align: center; margin-top: 35px; border-top: 1px solid #1f1f2e; padding-top: 20px; color: #666677; font-size: 12px;"">
                <p style=""margin: 0 0 5px;"">&copy; {DateTime.UtcNow.Year} Integral.AI. All rights reserved.</p>
                <p style=""margin: 0;"">Dedicated to advanced mathematical intelligence.</p>
            </div>
        </div>";
    }

    public async Task<Account> VerifyOtpAsync(string email, string code)
    {
        string key = email.ToLower();
        if (!_otpSessions.TryGetValue(key, out var session))
        {
            throw new Exception("Mã OTP chưa được gửi hoặc đã bị hủy.");
        }

        if (session.Code != code)
        {
            throw new Exception("Mã OTP không chính xác.");
        }

        if (DateTime.UtcNow > session.Expiry)
        {
            _otpSessions.TryRemove(key, out _);
            throw new Exception("Mã OTP đã hết hạn (5 phút). Vui lòng gửi lại mã mới.");
        }

        // OTP is correct! Remove it from active sessions
        _otpSessions.TryRemove(key, out _);

        // Fetch user from Firebase Auth
        UserRecord userRecord;
        try
        {
            userRecord = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(email);
        }
        catch (Exception ex)
        {
            throw new Exception($"Không thể tải hồ sơ người dùng: {ex.Message}");
        }

        // Fetch user from Firestore
        var account = await GetAccountAsync(userRecord.Uid);
        account.LastLoginAt = DateTime.UtcNow;
        await _firestoreService.SaveAccountAsync(account);

        return account;
    }
    #endregion

    public async Task<List<Account>> GetAllAccountsAsync()
    {
        return await _firestoreService.GetAllAccountsAsync();
    }

    public async Task<Account> UpdateRoleAsync(string uid, string role)
    {
        var account = await GetAccountAsync(uid);
        account.Role = role;
        await _firestoreService.SaveAccountAsync(account);
        return account;
    }

    public async Task<Account> UpdateStatusAsync(string uid, string status)
    {
        var account = await GetAccountAsync(uid);
        account.Status = status;
        await _firestoreService.SaveAccountAsync(account);

        // Also update Firebase Auth User disabled state:
        // If status is "Bị khóa", disable user in Firebase Auth.
        var userArgs = new UserRecordArgs
        {
            Uid = uid,
            Disabled = status == "Bị khóa"
        };

        try
        {
            await FirebaseAuth.DefaultInstance.UpdateUserAsync(userArgs);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Firebase Auth disable status exception ignored: {ex.Message}");
        }

        return account;
    }

    public async Task ChangePasswordAsync(string uid, string newPassword)
    {
        var userArgs = new UserRecordArgs
        {
            Uid = uid,
            Password = newPassword
        };
        await FirebaseAuth.DefaultInstance.UpdateUserAsync(userArgs);
    }
}

public class OtpSession
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
}

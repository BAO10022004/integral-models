using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using IntegralApi.Models;
using IntegralApi.Services;

namespace IntegralApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly FirestoreService _firestoreService;

    public AccountController(IAccountService accountService, FirestoreService firestoreService)
    {
        _accountService = accountService;
        _firestoreService = firestoreService;
    }
    [HttpPost("google-login")]
    public async Task<IActionResult> LoginWithGoogle([FromBody] SocialLoginRequest request)
    {
        try
        {
            // Verify the Firebase ID Token sent from the frontend
            FirebaseToken decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.Token);
            
            // Extract user information
            var uid = decodedToken.Uid;
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(uid);

            // Fetch existing account from Firestore to preserve its Role, CreatedAt, etc.
            var account = await _firestoreService.GetAccountAsync(uid);
            if (account == null)
            {
                account = new Account
                {
                    Uid = uid,
                    Email = userRecord.Email,
                    DisplayName = userRecord.DisplayName,
                    PhotoUrl = userRecord.PhotoUrl,
                    ProviderId = "google.com",
                    EmailVerified = userRecord.EmailVerified,
                    Role = "user", // Default role for new users
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow
                };
            }
            else
            {
                // Update profile info but preserve existing Role and CreatedAt
                account.Email = userRecord.Email;
                account.DisplayName = userRecord.DisplayName;
                account.PhotoUrl = userRecord.PhotoUrl;
                account.ProviderId = "google.com";
                account.EmailVerified = userRecord.EmailVerified;
                account.LastLoginAt = DateTime.UtcNow;
            }

            // Save to Firestore
            await _firestoreService.SaveAccountAsync(account);

            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Invalid Google Token", Message = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var account = await _accountService.RegisterWithEmailAsync(request.Email, request.Password, request.DisplayName, request.Role);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Registration failed", Message = ex.Message });
        }
    }

    [HttpGet("{uid}")]
    public async Task<IActionResult> GetProfile(string uid)
    {
        try
        {
            var account = await _accountService.GetAccountAsync(uid);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return NotFound(new { Error = "User not found", Message = ex.Message });
        }
    }

    [HttpPut("{uid}")]
    public async Task<IActionResult> UpdateProfile(string uid, [FromBody] UpdateProfileRequest request)
    {
        try
        {
            var account = await _accountService.UpdateAccountAsync(uid, request.DisplayName, request.PhotoUrl, request.Phone);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Update failed", Message = ex.Message });
        }
    }

    [HttpPost("email-login")]
    public async Task<IActionResult> LoginWithEmail([FromBody] EmailLoginRequest request)
    {
        try
        {
            var account = await _accountService.LoginWithEmailAsync(request.Email, request.Password);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Login failed", Message = ex.Message });
        }
    }

    [HttpPost("verify-token")]
    public async Task<IActionResult> VerifyToken([FromBody] string token)
    {
        try
        {
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
            var account = await _accountService.GetAccountAsync(decodedToken.Uid);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Invalid Token", Message = ex.Message });
        }
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        try
        {
            await _accountService.SendOtpAsync(request.Email);
            return Ok(new { Message = "Mã OTP đã được gửi thành công!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Gửi OTP thất bại", Message = ex.Message });
        }
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        try
        {
            var account = await _accountService.VerifyOtpAsync(request.Email, request.Code);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Xác thực OTP thất bại", Message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAccounts()
    {
        try
        {
            var accounts = await _accountService.GetAllAccountsAsync();
            return Ok(accounts);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Failed to fetch accounts", Message = ex.Message });
        }
    }

    [HttpDelete("{uid}")]
    public async Task<IActionResult> DeleteAccount(string uid)
    {
        try
        {
            await _accountService.DeleteAccountAsync(uid);
            return Ok(new { Message = "Account deleted successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Failed to delete account", Message = ex.Message });
        }
    }

    [HttpPut("{uid}/role")]
    public async Task<IActionResult> UpdateRole(string uid, [FromBody] UpdateRoleRequest request)
    {
        try
        {
            var account = await _accountService.UpdateRoleAsync(uid, request.Role);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Failed to update role", Message = ex.Message });
        }
    }

    [HttpPut("{uid}/status")]
    public async Task<IActionResult> UpdateStatus(string uid, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var account = await _accountService.UpdateStatusAsync(uid, request.Status);
            return Ok(account);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Failed to update status", Message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            await _accountService.ChangePasswordAsync(request.Uid, request.NewPassword);
            return Ok(new { Message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = "Failed to change password", Message = ex.Message });
        }
    }
}

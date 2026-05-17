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

            var account = new Account
            {
                Uid = uid,
                Email = userRecord.Email,
                DisplayName = userRecord.DisplayName,
                PhotoUrl = userRecord.PhotoUrl,
                ProviderId = "google.com",
                EmailVerified = userRecord.EmailVerified,
                LastLoginAt = DateTime.UtcNow
            };

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
            var account = await _accountService.RegisterWithEmailAsync(request.Email, request.Password, request.DisplayName);
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
            var account = await _accountService.UpdateAccountAsync(uid, request.DisplayName, request.PhotoUrl);
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
}

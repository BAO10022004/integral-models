using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin;
using FirebaseAdmin.Auth;
using IntegralApi.Models;
using IntegralApi.Services;

namespace IntegralApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FirebaseController : ControllerBase
{
    private readonly FirestoreService _firestoreService;

    public FirebaseController(FirestoreService firestoreService)
    {
        _firestoreService = firestoreService;
    }
    [HttpGet("check-init")]
    public IActionResult CheckInitialization()
    {
        var isInitialized = FirebaseApp.DefaultInstance != null;
        return Ok(new { 
            Message = isInitialized ? "Firebase is ready!" : "Firebase not initialized.",
            Status = isInitialized 
        });
    }

    [HttpPost("test-save")]
    public async Task<IActionResult> TestSaveData()
    {
        try
        {
            var testAccount = new Account
            {
                Uid = "test-uid-" + Guid.NewGuid().ToString().Substring(0, 8),
                Email = "test@example.com",
                DisplayName = "Test User",
                CreatedAt = DateTime.UtcNow
            };
            await _firestoreService.SaveAccountAsync(testAccount);
            return Ok(new { Message = "Test data saved successfully!", Data = testAccount });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpPost("verify-token")]
    public async Task<IActionResult> VerifyToken([FromBody] FirebaseVerifyRequest request)
    {
        try
        {
            var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(request.Token);
            
            // Extract user info from token
            var userRecord = await FirebaseAuth.DefaultInstance.GetUserAsync(decodedToken.Uid);
            
            var account = new Account
            {
                Uid = userRecord.Uid,
                Email = userRecord.Email,
                DisplayName = userRecord.DisplayName ?? "User",
                PhotoUrl = userRecord.PhotoUrl,
                ProviderId = userRecord.ProviderId,
                EmailVerified = userRecord.EmailVerified,
                LastLoginAt = DateTime.UtcNow
            };

            // Save to Firestore
            await _firestoreService.SaveAccountAsync(account);

            return Ok(new { 
                Uid = decodedToken.Uid, 
                Email = userRecord.Email,
                Message = "Token verified and account synced to Firestore."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

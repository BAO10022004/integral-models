using Microsoft.AspNetCore.Mvc;
using IntegralApi.Models;
using IntegralApi.Services;
using System.Text.Json;
using System.Text;

namespace IntegralApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegralController : ControllerBase
{
    private readonly FirestoreService _firestoreService;
    private readonly HttpClient _httpClient;
    private readonly string _aiApiUrl;

    public IntegralController(FirestoreService firestoreService, HttpClient httpClient, IConfiguration configuration)
    {
        _firestoreService = firestoreService;
        _httpClient = httpClient;
        _aiApiUrl = configuration["AiApiUrl"] ?? "http://localhost:5000";
    }

    [HttpPost("solve")]
    public async Task<IActionResult> Solve([FromBody] IntegralRequest request, [FromQuery] string? userId = null)
    {
        try
        {
            // 1. Call Python AI API
            var flaskRequest = new { latex = request.Latex };
            var content = new StringContent(JsonSerializer.Serialize(flaskRequest), Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_aiApiUrl}/solve", content);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Error from AI Service");
            }

            var jsonResult = await response.Content.ReadAsStringAsync();
            var flaskResponse = JsonSerializer.Deserialize<JsonElement>(jsonResult);

            // 2. Map to our IntegralResponse model
            var integralResponse = new IntegralResponse
            {
                Success = flaskResponse.GetProperty("success").GetBoolean(),
                Input = request.Latex,
                Result = flaskResponse.TryGetProperty("answer", out var ans) ? ans.ToString() : "",
                FinalAnswer = flaskResponse.TryGetProperty("answer", out var ans2) ? ans2.ToString() : "",
                Error = flaskResponse.TryGetProperty("error", out var err) ? err.GetString() ?? "" : "",
                Steps = new List<SolutionStep>()
            };

            if (flaskResponse.TryGetProperty("steps", out var stepsArray))
            {
                int count = 1;
                foreach (var stepItem in stepsArray.EnumerateArray())
                {
                    integralResponse.Steps.Add(new SolutionStep
                    {
                        StepNumber = count++,
                        Action = stepItem.TryGetProperty("description", out var desc) ? desc.GetString() ?? "" : "",
                        Expression = stepItem.TryGetProperty("integral", out var integ) ? integ.GetString() ?? "" : "",
                        Explanation = stepItem.TryGetProperty("kind", out var kind) ? kind.GetString() ?? "" : ""
                    });
                }
            }

            // 3. Save to Firebase if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _firestoreService.SaveIntegralResultAsync(userId, integralResponse);
            }

            return Ok(integralResponse);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { Error = "userId is required" });
        }

        try
        {
            var historyList = await _firestoreService.GetIntegralHistoryAsync(userId);
            return Ok(historyList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = $"Internal server error: {ex.Message}" });
        }
    }
}

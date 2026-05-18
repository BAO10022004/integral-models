using Microsoft.AspNetCore.Mvc;
using IntegralApi.Models;
using IntegralApi.Services;

namespace IntegralApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoryTimelineController : ControllerBase
{
    private readonly IHistoryTimelineService _timelineService;

    public HistoryTimelineController(IHistoryTimelineService timelineService)
    {
        _timelineService = timelineService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _timelineService.GetHistoryTimelineAsync();
        if (data != null)
        {
            return Ok(data);
        }

        return Ok(HistoryConfigDto.GetDefault());
    }

    [HttpGet("default")]
    public IActionResult GetDefault()
    {
        return Ok(HistoryConfigDto.GetDefault());
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] HistoryConfigDto data)
    {
        if (data == null)
        {
            return BadRequest("Data cannot be null");
        }

        try
        {
            await _timelineService.SaveHistoryTimelineAsync(data);
            return Ok(new { message = "Configuration saved successfully to Firebase Firestore!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = $"Internal server error: {ex.Message}" });
        }
    }

    
}

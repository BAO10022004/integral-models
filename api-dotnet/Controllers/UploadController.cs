using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace IntegralApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { Error = "No file uploaded." });
            }

            try
            {
                string wwwrootPath = _env.WebRootPath;
                if (string.IsNullOrEmpty(wwwrootPath))
                {
                    wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }
                
                string uploadsPath = Path.Combine(wwwrootPath, "uploads");
                if (!Directory.Exists(uploadsPath))
                {
                    Directory.CreateDirectory(uploadsPath);
                }

                string fileName = Path.GetFileName(file.FileName);
                string filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var request = HttpContext.Request;
                string baseUrl = $"{request.Scheme}://{request.Host}";
                string fileUrl = $"{baseUrl}/uploads/{fileName}";

                return Ok(new { url = fileUrl, filename = fileName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet]
        public IActionResult GetFiles()
        {
            try
            {
                string wwwrootPath = _env.WebRootPath;
                if (string.IsNullOrEmpty(wwwrootPath))
                {
                    wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }
                
                string uploadsPath = Path.Combine(wwwrootPath, "uploads");
                if (!Directory.Exists(uploadsPath))
                {
                    return Ok(Array.Empty<object>());
                }

                var files = Directory.GetFiles(uploadsPath);
                var request = HttpContext.Request;
                string baseUrl = $"{request.Scheme}://{request.Host}";

                var fileList = files.Select(file =>
                {
                    var fileInfo = new FileInfo(file);
                    return new
                    {
                        name = fileInfo.Name,
                        url = $"{baseUrl}/uploads/{fileInfo.Name}",
                        size = fileInfo.Length,
                        createdAt = fileInfo.CreationTimeUtc
                    };
                }).OrderByDescending(f => f.createdAt).ToList();

                return Ok(fileList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpDelete("{fileName}")]
        public IActionResult DeleteFile(string fileName)
        {
            try
            {
                string wwwrootPath = _env.WebRootPath;
                if (string.IsNullOrEmpty(wwwrootPath))
                {
                    wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                }

                string filePath = Path.Combine(wwwrootPath, "uploads", fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { Error = $"File '{fileName}' not found." });
                }

                System.IO.File.Delete(filePath);
                return Ok(new { Message = $"File '{fileName}' deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = $"Internal server error: {ex.Message}" });
            }
        }
    }
}

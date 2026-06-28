using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.OpenApi.Models;
using IntegralApi.Services;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<FirestoreService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IHistoryTimelineService, HistoryTimelineService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Integral API", Version = "v1" });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});
var pathToServiceAccount = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "firebase-service-account.json");
if (File.Exists(pathToServiceAccount))
{
    FirebaseApp.Create(new AppOptions()
    {
        Credential = GoogleCredential.FromFile(pathToServiceAccount),
    });
    Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", pathToServiceAccount);
    Console.WriteLine("Firebase Admin SDK initialized successfully.");
}
else
{
    Console.WriteLine("Warning: firebase-service-account.json not found. Firebase features will not work.");
}

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Integral API V1");
    c.RoutePrefix = string.Empty; 
});


app.UseStaticFiles();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("API is running on http://localhost:5100");
app.Run();

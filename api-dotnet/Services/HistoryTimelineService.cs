using IntegralApi.Models;

namespace IntegralApi.Services;

public interface IHistoryTimelineService
{
    Task<HistoryConfigDto?> GetHistoryTimelineAsync();
    Task SaveHistoryTimelineAsync(HistoryConfigDto data);
}

public class HistoryTimelineService : IHistoryTimelineService
{
    private readonly FirestoreService _firestoreService;

    public HistoryTimelineService(FirestoreService firestoreService)
    {
        _firestoreService = firestoreService;
    }

    public async Task<HistoryConfigDto?> GetHistoryTimelineAsync()
    {
        return await _firestoreService.GetHistoryTimelineAsync();
    }

    public async Task SaveHistoryTimelineAsync(HistoryConfigDto data)
    {
        await _firestoreService.SaveHistoryTimelineAsync(data);
    }
}

using Google.Cloud.Firestore;
using IntegralApi.Models;

namespace IntegralApi.Services;

public class FirestoreService
{
    private readonly FirestoreDb _db;

    public FirestoreService(IConfiguration configuration)
    {
        string projectId = "ogiabao-dcbd3"; // From service account
        _db = FirestoreDb.Create(projectId);
    }

    public async Task SaveAccountAsync(Account account)
    {
        DocumentReference docRef = _db.Collection("accounts").Document(account.Uid);
        await docRef.SetAsync(account);
    }

    public async Task SaveIntegralResultAsync(string userId, IntegralResponse response)
    {
        CollectionReference colRef = _db.Collection("users").Document(userId).Collection("integrals");
        await colRef.AddAsync(response);
    }

    public async Task UpdateUserStatisticsAsync(UserStatistics stats)
    {
        DocumentReference docRef = _db.Collection("statistics").Document(stats.UserId);
        await docRef.SetAsync(stats);
    }

    public async Task<Account?> GetAccountAsync(string uid)
    {
        DocumentReference docRef = _db.Collection("accounts").Document(uid);
        DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();
        if (snapshot.Exists)
        {
            return snapshot.ConvertTo<Account>();
        }
        return null;
    }

    public async Task<List<IntegralResponse>> GetIntegralHistoryAsync(string userId)
    {
        var list = new List<IntegralResponse>();
        try
        {
            CollectionReference colRef = _db.Collection("users").Document(userId).Collection("integrals");
            QuerySnapshot snapshot = await colRef.GetSnapshotAsync();
            foreach (DocumentSnapshot doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    var response = doc.ConvertTo<IntegralResponse>();
                    list.Add(response);
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching Firestore integral history for user {userId}: {ex.Message}");
        }
        return list;
    }

    public async Task SaveHistoryTimelineAsync(HistoryConfigDto data)
    {
        try
        {
            DocumentReference docRef = _db.Collection("settings").Document("history_timeline");
            await docRef.SetAsync(data);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving history timeline in Firestore: {ex.Message}");
            throw;
        }
    }

    public async Task<HistoryConfigDto?> GetHistoryTimelineAsync()
    {
        try
        {
            DocumentReference docRef = _db.Collection("settings").Document("history_timeline");
            DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<HistoryConfigDto>();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading history timeline from Firestore: {ex.Message}");
        }
        return null;
    }
}

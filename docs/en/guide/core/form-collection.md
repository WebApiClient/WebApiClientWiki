# Form Collection Handling

> This document is machine translated and requires review.

According to OpenApi, a collection in Uri Query or form supports 5 representation formats:

| Format | Description |
|------|------|
| Csv | Comma-separated |
| Ssv | Space-separated |
| Tsv | Backslash-separated |
| Pipes | Pipe-separated |
| Multi | Multiple key-value pairs with the same name |

## Example

For an array value like `id = ["001","002"]`, after being processed by PathQueryAttribute and FormContentAttribute:

| CollectionFormat | Data |
|------------------|------|
| `[PathQuery(CollectionFormat = CollectionFormat.Csv)]` | `id=001,002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Ssv)]` | `id=001 002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Tsv)]` | `id=001\002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Pipes)]` | `id=001\|002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Multi)]` | `id=001&id=002` |

## Usage Example

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    Task<List<User>> GetAsync(
        [PathQuery(CollectionFormat = CollectionFormat.Multi)] int[] ids);
}
```

Request result: `api/users?ids=1&ids=2&ids=3`

# 表单集合处理

按照 OpenApi，一个集合在 Uri 的 Query 或表单中支持 5 种表述方式：

| 格式 | 说明 |
|------|------|
| Csv | 逗号分隔 |
| Ssv | 空格分隔 |
| Tsv | 反斜杠分隔 |
| Pipes | 竖线分隔 |
| Multi | 多个同名键的键值对 |

## 示例

对于 `id = ["001","002"]` 这样的数组值，在 PathQueryAttribute 与 FormContentAttribute 处理后分别是：

| CollectionFormat | Data |
|------------------|------|
| `[PathQuery(CollectionFormat = CollectionFormat.Csv)]` | `id=001,002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Ssv)]` | `id=001 002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Tsv)]` | `id=001\002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Pipes)]` | `id=001\|002` |
| `[PathQuery(CollectionFormat = CollectionFormat.Multi)]` | `id=001&id=002` |

## 使用示例

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    Task<List<User>> GetAsync(
        [PathQuery(CollectionFormat = CollectionFormat.Multi)] int[] ids);
}
```

请求结果：`api/users?ids=1&ids=2&ids=3`

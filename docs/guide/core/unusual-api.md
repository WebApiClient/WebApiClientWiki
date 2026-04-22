# 适配畸形接口

某些服务端 API 的设计可能不符合常规规范，WebApiClientCore 提供了多种方式来适配这些情况。

## 不友好的参数名别名

例如服务器要求一个 Query 参数的名字为 `field-Name`，这个是 C# 关键字或变量命名不允许的，我们可以使用 `[AliasAsAttribute]` 来达到这个要求：

```csharp
public interface IUserApi
{
    [HttpGet("api/users")]
    ITask<string> GetAsync([AliasAs("field-Name")] string fieldName);
}
```

最终请求 uri 变为 `api/users/?field-name=fileNameValue`

## Form 的某个字段为 json 文本

| 字段 | 值 |
|------|-----|
| field1 | someValue |
| field2 | `{"name":"sb","age":18}` |

field2 对应的 .NET 模型为：

```csharp
public class Field2
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

常规下我们得把 field2 的实例 json 序列化得到 json 文本，然后赋值给 field2 这个 string 属性。使用 `[JsonFormField]` 特性可以自动完成 Field2 类型的 json 序列化并将结果字符串作为表单的一个字段。

```csharp
public interface IUserApi
{
    Task PostAsync([FormField] string field1, [JsonFormField] Field2 field2);
}
```

## Form 的字段多层嵌套

| 字段 | 值 |
|------|-----|
| field1 | someValue |
| field2.name | sb |
| field2.age | 18 |

Form 对应的 .NET 模型：

```csharp
public class FormModel
{
    public string Field1 { get; set; }
    public Field2 Field2 { get; set; }
}

public class Field2
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

合理情况下，对于复杂嵌套结构的数据模型，应当设计为使用 `application/json` 提交 FormModel，但服务提供方设计为使用 `x-www-form-urlencoded` 来提交 FormModel，我们可以配置 KeyValueSerializeOptions 来达到这个格式要求：

```csharp
services.AddHttpApi<IUserApi>().ConfigureHttpApi(o =>
{
    o.KeyValueSerializeOptions.KeyNamingStyle = KeyNamingStyle.FullName;
});
```

## 响应的 Content-Type 不是预期值

响应的内容通过肉眼看上是 json 内容，但响应头里的 Content-Type 为非预期值 `application/json` 或 `application/xml`，而是诸如 `text/html` 等。这好比客户端提交 json 内容时指示请求头的 Content-Type 值为 `text/plain` 一样，让服务端无法处理。

解决办法是在 Interface 或 Method 声明 `[JsonReturn]` 特性，并设置其 EnsureMatchAcceptContentType 属性为 false，表示 Content-Type 不是期望值匹配也要处理：

```csharp
[JsonReturn(EnsureMatchAcceptContentType = false)]
public interface IUserApi
{
}
```

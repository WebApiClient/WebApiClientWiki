# 常用内置特性

内置特性指框架内提供的一些特性，拿来即用就能满足一般情况下的各种应用。当然，开发者也可以在实际应用中，编写满足特定场景需求的特性，然后将自定义特性修饰到接口、方法或参数即可。

> 执行前顺序

参数值验证 -> IApiActionAttribute -> IApiParameterAttribute -> IApiReturnAttribute -> IApiFilterAttribute

> 执行后顺序

IApiReturnAttribute -> 返回值验证 -> IApiFilterAttribute

## 各特性的位置

```csharp
    [IApiFilterAttribute]/*作用于接口内所有方法的Filter*/
    [IApiReturnAttribute]/*作用于接口内所有方法的ReturnAttribute*/
    public interface DemoApiInterface
    {

        [IApiActionAttribute]
        [IApiFilterAttribute]/*作用于本方法的Filter*/
        [IApiReturnAttribute]/*作用于本方法的ReturnAttribute*/
        ITask<HttpResponseMessage> DemoApiMethod([IApiParameterAttribute] ParameterClass parameterClass);
    }
```

## Return 特性

| 特性名称            | 功能描述             | 备注       |
| ------------------- | -------------------- | ---------- |
| RawReturnAttribute  | 处理原始类型返回值   | 缺省也生效 |
| JsonReturnAttribute | 处理 Json 模型返回值 | 缺省也生效 |
| XmlReturnAttribute  | 处理 Xml 模型返回值  | 缺省也生效 |
| NoneReturnAttribute | 处理空返回值         | 缺省也生效 |

## 常用 Action 特性

| 特性名称                | 功能描述                       | 备注                                                       |
| ----------------------- | ------------------------------ | ---------------------------------------------------------- |
| HttpHostAttribute       | 请求服务 http 绝对完整主机域名 | 优先级比 Options 配置低、它也支持直接在 interface 级别使用 |
| HttpGetAttribute        | 声明 Get 请求方法与路径        | 支持 null、绝对或相对路径                                  |
| HttpPostAttribute       | 声明 Post 请求方法与路径       | 支持 null、绝对或相对路径                                  |
| HttpPutAttribute        | 声明 Put 请求方法与路径        | 支持 null、绝对或相对路径                                  |
| HttpDeleteAttribute     | 声明 Delete 请求方法与路径     | 支持 null、绝对或相对路径                                  |
| _HeaderAttribute_       | 声明请求头                     | 常量值                                                     |
| _TimeoutAttribute_      | 声明超时时间                   | 常量值                                                     |
| _FormFieldAttribute_    | 声明 Form 表单字段与值         | 常量键和值                                                 |
| _FormDataTextAttribute_ | 声明 FormData 表单字段与值     | 常量键和值                                                 |

## 常用 Parameter 特性

| 特性名称                 | 功能描述                                           | 备注                                  |
| ------------------------ | -------------------------------------------------- | ------------------------------------- |
| PathQueryAttribute       | 参数值的键值对作为 url 路径参数或 query 参数的特性 | 缺省特性的参数默认为该特性            |
| FormContentAttribute     | 参数值的键值对作为 x-www-form-urlencoded 表单      |
| FormDataContentAttribute | 参数值的键值对作为 multipart/form-data 表单        |
| JsonContentAttribute     | 参数值序列化为请求的 json 内容                     |
| XmlContentAttribute      | 参数值序列化为请求的 xml 内容                      |
| UriAttribute             | 参数值作为请求 uri                                 | 只能修饰第一个参数                    |
| ParameterAttribute       | 聚合性的请求参数声明                               | 不支持细颗粒配置                      |
| _HeaderAttribute_        | 参数值作为请求头                                   |
| _TimeoutAttribute_       | 参数值作为超时时间                                 | 值不能大于 HttpClient 的 Timeout 属性 |
| _FormFieldAttribute_     | 参数值作为 Form 表单字段与值                       | 只支持简单类型参数                    |
| _FormDataTextAttribute_  | 参数值作为 FormData 表单字段与值                   | 只支持简单类型参数                    |

## Filter 特性

| 特性名称               | 功能描述                           | 备注 |
| ---------------------- | ---------------------------------- | ---- |
| ApiFilterAttribute     | Filter 特性抽象类                  |
| LoggingFilterAttribute | 请求和响应内容的输出为日志的过滤器 |

## 自解释参数类型

| 类型名称          | 功能描述                  | 备注                               |
| ----------------- | ------------------------- | ---------------------------------- |
| FormDataFile      | form-data 的一个文件项    | 无需特性修饰，等效于 FileInfo 类型 |
| JsonPatchDocument | 表示将 JsonPatch 请求文档 | 无需特性修饰                       |

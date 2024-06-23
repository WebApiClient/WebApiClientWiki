# POST/PUT/DELETE Requests

## Submitting with Json or Xml

Use `[XmlContent]` or `[Parameter(Kind.XmlBody)]` to annotate strong-typed model parameters for submitting xml.
Use `[JsonContent]` or `[Parameter(Kind.JsonBody)]` to annotate strong-typed model parameters for submitting json.

```csharp
// POST webapi/user  
// Body user's json text
[HttpPost("webapi/user")]
ITask<UserInfo> AddUserWithJsonAsync([JsonContent] UserInfo user);

// PUT webapi/user  
// Body user's xml text
[HttpPut("webapi/user")]
ITask<UserInfo> UpdateUserWithXmlAsync([XmlContent] UserInfo user);
```

## Submitting with x-www-form-urlencoded

Use `[FormContent]` or `[Parameter(Kind.Form)]` to annotate strong-typed model parameters.
Use `[FormField]` or `[Parameter(Kind.Form)]` to annotate simple type parameters.

```csharp
// POST webapi/user  
// Body Account=laojiu&Password=123456
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithFormAsync(
    [FormContent] UserInfo user);

// POST webapi/user  
// Body Account=laojiu&Password=123456&fieldX=xxx
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithFormAsync(
    [FormContent] UserInfo user,
    [FormField] string fieldX);

// POST webapi/user  
// Body Account=laojiu&Password=123456&fieldX=xxx
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserAsync(
    [Parameter(Kind.Form)] UserInfo user,
    [Parameter(Kind.Form)] string fieldX);
```

## Submitting with multipart/form-data

Use `[MulitpartContent]` or `[Parameter(Kind.FormData)]` to annotate strong-typed model parameters.
Use `[MulitpartText]` or `[Parameter(Kind.FormData)]` to annotate simple type parameters.
Use `MulitpartFile` type for submitting files.

```csharp
// POST webapi/user  
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithMulitpartAsync(
    [MulitpartContent] UserInfo user);

// POST webapi/user  
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithMulitpartAsync(
    [MulitpartContent] UserInfo user,
    [MulitpartText] string nickName,
    MulitpartFile file);

// POST webapi/user  
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithMulitpartAsync(
    [Parameter(Kind.FormData)] UserInfo user,
    [Parameter(Kind.FormData)] string nickName,
    MulitpartFile file);
```

## Submitting with specific HttpContent types

```csharp
// POST webapi/user  
// Body Account=laojiu&Password=123456
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithFormAsync(
    FormUrlEncodedContent user);

// POST webapi/user  
// Body Account=laojiu&Password=123456&age=18
[HttpPost("webapi/user")]
ITask<UserInfo> UpdateUserWithFormAsync(
    FormUrlEncodedContent user,
    [FormField] int age);
```

If the parameter is a subclass of `HttpContent`, such as `StringContent`, `ByteArrayContent`, `StreamContent`, `FormUrlEncodedContent`, etc., it can be directly used as a parameter, **but it must be placed before other parameters**.

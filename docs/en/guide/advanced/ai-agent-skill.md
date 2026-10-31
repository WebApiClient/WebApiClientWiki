# AI-Assisted Development

WebApiClientCore officially maintains an **Agent Skill** (`webapiclientcore`) for AI coding assistants that support the Agent Skills convention, such as Claude Code and Cursor. It teaches the assistant the correct usage of WebApiClientCore, so generated interface declarations, DI registration, retry, and AOT configurations follow official best practices instead of "guessing" the API from training memory.

## What the Skill Does

Once installed, when your conversation touches on declarative HTTP clients, `WebApiClientCore`, `AddHttpApi`, `ITask` retries, OAuth token management, and similar topics, the AI automatically loads the skill and gains access to:

- **Decision tree**: when to use WebApiClientCore and when a plain HttpClient is enough
- **Interface declaration templates**: correct combinations of HttpHost / HttpGet / JsonContent attributes
- **Common code patterns**: ITask conditional retry, default-value-on-exception, file upload, filters, OAuth2 Client Credentials, AOT publishing, JSON-RPC
- **Attribute cheat sheets**: request body formats (Json/Xml/Form/FormData/RawString), response parsing, authentication and headers
- **Exception handling reference**: concrete exception types wrapped by `HttpRequestException` and handling advice
- **A full reference manual** (`reference.md`, ~1000 lines): custom serialization, dynamic HttpHost, data validation, cookie refresh, adapting unusual APIs, and more

## Getting and Installing

The skill lives in the [`skills/webapiclientcore`](https://github.com/dotnetcore/WebApiClient/tree/master/skills/webapiclientcore) directory of the [WebApiClient repository](https://github.com/dotnetcore/WebApiClient) and contains two files:

| File | Description |
|------|-------------|
| `SKILL.md` | Agent instructions: triggers, decision tree, templates and patterns |
| `reference.md` | Full reference manual |

Copy the entire `webapiclientcore` directory into your AI tool's project skill directory:

| Tool | Skill directory |
|------|-----------------|
| Claude Code | `.claude/skills/webapiclientcore/` |
| Cursor | `.cursor/skills/webapiclientcore/` |
| Other tools supporting the Agent Skills convention | Place the `SKILL.md` directory as documented |

For example, with Claude Code, run in your project root:

```bash
git clone --depth 1 https://github.com/dotnetcore/WebApiClient.git tmp-wac
mkdir -p .claude/skills
cp -r tmp-wac/skills/webapiclientcore .claude/skills/
rm -rf tmp-wac
```

You can also download just the two files into the directory above:

- [SKILL.md](https://github.com/dotnetcore/WebApiClient/raw/master/skills/webapiclientcore/SKILL.md)
- [reference.md](https://github.com/dotnetcore/WebApiClient/raw/master/skills/webapiclientcore/reference.md)

## Usage Example

No extra steps are needed after installation — just chat with your AI as usual:

```
> Help me call the user API of https://api.example.com with retry on failure

(The AI loads the webapiclientcore skill automatically and generates
 code that follows official practice)
[LoggingFilter]
[HttpHost("https://api.example.com/")]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<User> GetUserAsync(string id, CancellationToken token = default);
}

// Usage: exponential backoff, retry only on network exceptions
var user = await api.GetUserAsync(id)
    .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i)))
    .WhenCatch<HttpRequestException>();
```

## Maintenance

- The skill evolves with the main repository; API changes (such as the ITokenProvider cancellation token support in `v2.1.6`) are reflected in both the skill and this documentation.
- If the AI generates code that does not follow best practices, feel free to open an issue in the [WebApiClient repository](https://github.com/dotnetcore/WebApiClient/issues).

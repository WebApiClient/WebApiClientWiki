# AI 辅助开发

WebApiClientCore 官方维护了一个 **Agent Skill**（`webapiclientcore`），让 Claude Code、Cursor 等支持 Agent Skills 约定的 AI 编程助手掌握 WebApiClientCore 的正确用法：让 AI 生成的接口声明、DI 注册、重试与 AOT 配置都符合官方最佳实践，而不是凭训练记忆"猜" API。

## Skill 能做什么

安装后，当你在对话中提到声明式 HTTP 客户端、`WebApiClientCore`、`AddHttpApi`、`ITask` 重试、OAuth Token 管理等话题时，AI 会自动加载该技能，获得：

- **选型决策树**：什么时候用 WebApiClientCore、什么时候直接用 HttpClient
- **接口声明模板**：HttpHost / HttpGet / JsonContent 等特性的正确组合
- **常用代码模式**：ITask 条件重试、异常返回默认值、文件上传、过滤器、OAuth2 Client Credentials、AOT 发布、JSON-RPC
- **特性速查表**：请求体格式（Json/Xml/Form/FormData/RawString）、响应解析、认证与请求头
- **异常处理速查**：`HttpRequestException` 包装下的具体异常类型与处理建议
- **完整的参考手册**（`reference.md`，约 1000 行）：覆盖自定义序列化、动态 HttpHost、数据验证、Cookie 刷新、畸形 API 适配等进阶场景

## 获取与安装

Skill 位于 [WebApiClient 仓库](https://github.com/dotnetcore/WebApiClient)的 [`skills/webapiclientcore`](https://github.com/dotnetcore/WebApiClient/tree/master/skills/webapiclientcore) 目录，包含两个文件：

| 文件 | 说明 |
|------|------|
| `SKILL.md` | Agent 执行指令：触发词、决策树、模板与模式 |
| `reference.md` | 完整参考手册 |

将整个 `webapiclientcore` 目录复制到你使用的 AI 工具对应的项目技能目录即可：

| 工具 | 技能目录 |
|------|---------|
| Claude Code | `.claude/skills/webapiclientcore/` |
| Cursor | `.cursor/skills/webapiclientcore/` |
| 其他支持 Agent Skills 约定的工具 | 按其文档放置 `SKILL.md` 所在目录 |

以 Claude Code 为例，在项目根目录执行：

```bash
git clone --depth 1 https://github.com/dotnetcore/WebApiClient.git tmp-wac
mkdir -p .claude/skills
cp -r tmp-wac/skills/webapiclientcore .claude/skills/
rm -rf tmp-wac
```

也可以只下载两个文件，放入上述目录：

- [SKILL.md](https://github.com/dotnetcore/WebApiClient/raw/master/skills/webapiclientcore/SKILL.md)
- [reference.md](https://github.com/dotnetcore/WebApiClient/raw/master/skills/webapiclientcore/reference.md)

## 使用示例

安装后无需额外操作，正常与 AI 对话即可。例如：

```
> 帮我调用 https://api.example.com 的用户接口，要支持失败重试

（AI 自动加载 webapiclientcore skill，生成符合官方实践的代码）
[LoggingFilter]
[HttpHost("https://api.example.com/")]
public interface IUserApi
{
    [HttpGet("api/users/{id}")]
    ITask<User> GetUserAsync(string id, CancellationToken token = default);
}

// 使用：指数退避重试，仅网络异常时触发
var user = await api.GetUserAsync(id)
    .Retry(3, i => TimeSpan.FromSeconds(Math.Pow(2, i)))
    .WhenCatch<HttpRequestException>();
```

## 维护说明

- Skill 随主仓库演进，API 变化（如 `v2.1.6` 的 ITokenProvider 取消令牌支持）会同步更新到 skill 与本文档。
- 如果发现 AI 生成的代码不符合最佳实践，欢迎在 [WebApiClient 仓库](https://github.com/dotnetcore/WebApiClient/issues)提 issue 反馈。

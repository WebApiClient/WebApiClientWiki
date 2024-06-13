# 将OpenApi(swagger)生成代码

使用这个工具可以将 OpenApi 的本地或远程文档解析生成 WebApiClientCore 的接口定义代码文件，aspnetcore 的 swagger json 文件也适用

## 1、安装工具

```shell
dotnet tool install WebApiClientCore.OpenApi.SourceGenerator -g
```

## 2、使用工具

运行以下命令，会将对应的 WebApiClientCore 的接口定义代码文件输出到当前目录的 output 文件夹下

```shell
#举例
WebApiClientCore.OpenApi.SourceGenerator -o https://petstore.swagger.io/v2/swagger.json
```

### 2.1 命令介绍

```text
  -o OpenApi, --openapi=OpenApi          Required. openApi的json本地文件路径或远程Uri地址
  -n Namespace, --namespace=Namespace    代码的命名空间，如WebApiClientCore
  --help                                 Display this help screen.
```

### 2.2 工作流程

1. 使用 NSwag 解析 OpenApi 的 json 得到 OpenApiDocument 对象
2. 使用 RazorEngine 将 OpenApiDocument 传入 cshtml 模板编译得到 html
3. 使用 XDocument 将 html 的文本代码提取，得到 WebApiClientCore 的声明式代码
4. 代码美化，输出到本地文件

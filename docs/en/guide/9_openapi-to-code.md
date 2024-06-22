# Generate Code from OpenApi (Swagger)

This tool allows you to parse the local or remote documentation of OpenApi and generate interface definition code files for WebApiClientCore. It also works with `ASP.NET Core` swagger json files.

## Installation

```shell
dotnet tool install WebApiClientCore.OpenApi.SourceGenerator -g
```

## Usage

Run the following command to output the corresponding interface definition code files for WebApiClientCore to the "output" folder in the current directory.

```shell
# Example
WebApiClientCore.OpenApi.SourceGenerator -o https://petstore.swagger.io/v2/swagger.json
```

### Command Introduction

```text
  -o OpenApi, --openapi=OpenApi          Required. The local file path or remote Uri address of the openApi json.
  -n Namespace, --namespace=Namespace    The namespace of the code, such as WebApiClientCore.
  --help                                 Display this help screen.
```

### Tool Principle

1. Use NSwag to parse the json of OpenApi and obtain the OpenApiDocument object.
2. Use RazorEngine to compile the OpenApiDocument into html using a cshtml template.
3. Use XDocument to extract the textual code from the html, obtaining the declarative code for WebApiClientCore.
4. Beautify the code and output it to a local file.

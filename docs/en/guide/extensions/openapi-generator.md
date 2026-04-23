# Generate Code from OpenAPI (Swagger)

This tool allows you to parse local or remote OpenAPI documentation and generate interface definition code files for WebApiClientCore. It also works with `ASP.NET Core` Swagger JSON files.

## Installation

```shell
dotnet tool install WebApiClientCore.OpenApi.SourceGenerator -g
```

## Usage

Run the following command to generate WebApiClientCore interface definition code files and output them to the "output" folder in the current directory.

```shell
# Example
WebApiClientCore.OpenApi.SourceGenerator -o https://petstore.swagger.io/v2/swagger.json
```

### Command Reference

```text
  -o OpenApi, --openapi=OpenApi          Required. The local file path or remote URI of the OpenAPI JSON.
  -n Namespace, --namespace=Namespace    The namespace of the code, such as WebApiClientCore.
  --help                                 Display this help screen.
```

### How It Works

1. Uses NSwag to parse the OpenAPI JSON and obtain the `OpenApiDocument` object.
2. Uses RazorEngine to compile the `OpenApiDocument` into HTML using a cshtml template.
3. Uses XDocument to extract the code text from the HTML, obtaining the declarative code for WebApiClientCore.
4. Beautifies the code and outputs it to a local file.

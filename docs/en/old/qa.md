# Frequently Asked Questions

## Why do declared HTTP interfaces need to inherit the IHttpApi interface?

One reason is to facilitate the generation of proxy classes for the interfaces by the WebApiClient library, serving as a marker. Another reason is that by inheriting the `IHttpApi` interface, the proxy classes for the HTTP interfaces have a Dispose method.

## Can an HTTP interface inherit from another HTTP interface?

Yes, it is possible to inherit from another HTTP interface. The methods of the parent interface will also be treated as API methods. However, it is important to note that the interface-level attributes of the parent interface will be overridden by those of the child interface. Therefore, for better understanding, it is recommended not to use this kind of inheritance.

## How can I validate the validity of a proxy before using the `[ProxyAttribute(host,port)]` attribute?

You can use the Validate method of the ProxyValidator object to validate the validity of a proxy.

## Why is it not supported to declare the return type of an interface method as `Task` instead of `Task<>` or `ITask<>`?

This is a design principle. Regardless of whether the developer is interested in the return value or not, an HTTP request will either have a response or throw an exception. If you are not interested in parsing the response, you can declare the return type as `Task<HttpResponseMessage>` without actually parsing the `HttpResponseMessage`.

## How can I download a file using WebApiClient?

You should declare the return type of the interface as `ITask<HttpResponseFile>`.

## Besides declaring the return type of an interface as `ITask<HttpResponseMessage>`, what other abstract return types can be declared?

Other abstract return types that can be declared include `ITask<string>`, `ITask<Stream>`, and `ITask<Byte[]>`.

## Can the parameters declared in an interface be of type Object or certain base classes?

Yes, you can declare parameters in an interface as Object or certain base classes. However, there may be issues with XML serialization for the data. In general, it is recommended to declare the parameters according to the specific types expected by the server.

## How can I use synchronous requests with WebApiClient?

WebApiClient is a wrapper for HttpClient. Since HttpClient does not provide synchronous request methods, WebApiClient also does not support synchronous requests. Incorrectly blocking ITask and Task return values can easily lead to deadlocks in certain environments.

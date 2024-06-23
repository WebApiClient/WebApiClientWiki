# Overview

> [!warning]
> You are viewing the documentation for the old versions of `WebApiClient.JIT` and `WebApiClient.AOT`.  
> There will be no new feature updates, and we cannot guarantee quick bug fixes.  
> We recommend migrating to the new version, `WebApiClientCore`, as soon as possible.

## WebApiClient.JIT

Creates proxy classes for HTTP request interfaces at runtime using Emit. When calling HttpApiClient.Create(), a proxy class for TInterface is created in a new assembly with the same class name and namespace as TInterface. Since the proxy class and TInterface are not in the same assembly, TInterface must be public.

+ Can be directly referenced in the project by including WebApiClient.JIT.dll;
+ Not suitable for platforms that do not support JIT technology (iOS, UWP);
+ The interface must be public.

## WebApiClient.AOT

Modifies the compiled assembly using Mono.Cecil during the compilation process to insert IL instructions for proxy classes of HTTP request interfaces. This step is done before the AOT compilation phase. The assembly, module, and namespace of the proxy type are the same as the interface type, and its name is the interface type name with a $ prefix. These proxy classes can be seen by inspecting the compiled assembly using a decompiler.

+ The project must install WebApiClient.AOT via NuGet to work properly;
+ No JIT, supports a wide range of platforms;
+ The interface does not need to be public and can be nested within a class.

# Scope and Priority of Attributes

## Scope of Attributes

Some attributes, such as `[Header]`, can be applied to interfaces, methods, and parameters, with slightly different meanings and results depending on where they are used:

When applied to an interface, it means that all methods under the interface will have this request header added before the request is made.
When applied to a method, it means that this method will have this request header added before the request is made.
When applied to a parameter, it means that the value of the parameter will be used as the value of the request header, which can be dynamically passed in by the caller.

## Priority of Attributes

Method-level attributes have higher priority than interface-level attributes.
When `AllowMultiple` is set to `true`, both method-level and interface-level attributes take effect.
When `AllowMultiple` is set to `false`, only the method-level attribute takes effect, and the interface-level attribute is ignored.

# 动态 Host

针对大家经常提问的动态 Host,提供以下简单的示例供参阅；实现的方式不仅限于示例中提及的，**原则上在请求还没有发出去之前的任何环节，都可以修改请求消息的 RequestUri 来实现动态目标的目的**

## 方案 1：直接传入绝对目标的方式

```csharp
    [LoggingFilter]
    public interface IDynamicHostDemo
    {
        [HttpGet]
        ITask<HttpResponseMessage> ByUrlString([Uri] string urlString);
    }
```

## 方案 2：通过 ApiFilterAttribute

```csharp
    [LoggingFilter]
    [UriFilter]//可以放在interface级别
    public interface IDynamicHostDemo
    {
        [HttpGet]
        [UriFilter]//也可以放在Method(Action)级别
        ITask<HttpResponseMessage> ByFilter();

        //也可以选择在配置接口时通过GlobalFilter添加
    }
    /// <summary>
    ///用来处理动态Uri的拦截器
    /// </summary>
    public class UriFilterAttribute : ApiFilterAttribute
    {
        public override Task OnRequestAsync(ApiRequestContext context)
        {
            var options = context.HttpContext.HttpApiOptions;
            //获取注册时为服务配置的服务名
            options.Properties.TryGetValue("serviceName", out object serviceNameObj);
            string serviceName = serviceNameObj as string;
            IServiceProvider sp = context.HttpContext.ServiceProvider;
            HostProvider hostProvider = sp.GetRequiredService<HostProvider>();
            string host = hostProvider.ResolveService(serviceName);
            HttpApiRequestMessage requestMessage = context.HttpContext.RequestMessage;
            //和原有的Uri组合并覆盖原有Uri
            //并非一定要这样实现，只要覆盖了RequestUri,即完成了替换
            requestMessage.RequestUri = requestMessage.MakeRequestUri(new Uri(host));
            return Task.CompletedTask;
        }

        public override Task OnResponseAsync(ApiResponseContext context)
        {
            //不处理响应的信息
            return Task.CompletedTask;
        }
    }
    public class HostProvider
    {
        public string ResolveService(string name)
        {
            string servicehost=string.Empty;
            //TODO get service host
            return servicehost;
        }
    }
```

## 方案 3：通过 ApiActionAttribute

```csharp
    [LoggingFilter]
    [ServiceName("baiduService")]//可以放在interface级别
    public interface IDynamicHostDemo
    {
        [HttpGet]
        [ServiceName("baiduService")]//也可以放在Method(Action)级别
        ITask<HttpResponseMessage> ByAttribute();
    }
    /// <summary>
    /// 表示对应的服务名
    /// </summary>
    public class ServiceNameAttribute : ApiActionAttribute
    {
        public ServiceNameAttribute(string name)
        {
            Name = name;
            OrderIndex = int.MinValue;
        }

        public string Name { get; set; }

        public override async Task OnRequestAsync(ApiRequestContext context)
        {
            await Task.CompletedTask;
            IServiceProvider sp = context.HttpContext.ServiceProvider;
            HostProvider hostProvider = sp.GetRequiredService<HostProvider>();
            //服务名也可以在接口配置时挂在Properties中
            string host = hostProvider.ResolveService(this.Name);
            HttpApiRequestMessage requestMessage = context.HttpContext.RequestMessage;
            //和原有的Uri组合并覆盖原有Uri
            //并非一定要这样实现，只要覆盖了RequestUri,即完成了替换
            requestMessage.RequestUri = requestMessage.MakeRequestUri(new Uri(host));
        }
    }

    public class HostProvider
    {
        public string ResolveService(string name)
        {
            string servicehost=string.Empty;
            //TODO get service host
            return servicehost;
        }
    }
```

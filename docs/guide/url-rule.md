# Uri 拼接规则

所有的 Uri 拼接都是通过 Uri(Uri baseUri, Uri relativeUri)这个构造器生成。

## 带`/`结尾的 baseUri

- `http://a.com/` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/` + `b/c/d` = `http://a.com/path1/b/c/d`
- `http://a.com/path1/path2/` + `b/c/d` = `http://a.com/path1/path2/b/c/d`

## 不带`/`结尾的 baseUri

- `http://a.com` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1` + `b/c/d` = `http://a.com/b/c/d`
- `http://a.com/path1/path2` + `b/c/d` = `http://a.com/path1/b/c/d`

事实上`http://a.com`与`http://a.com/`是完全一样的，他们的 path 都是`/`，所以才会表现一样。为了避免低级错误的出现，请使用的标准 baseUri 书写方式，即使用`/`作为 baseUri 的结尾的第一种方式。

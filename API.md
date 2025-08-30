# API 文档

您可以通过调用 API 接口以编程方式生成短链接。

### API 调用地址

自部署的 Cloudflare Worker 地址，例如：`https://url.dem0.workers.dev` 或您自绑定的域名。

### 调用方法：HTTP POST

**请求格式：JSON**

**示例：**

```json
{
  "cmd": "add",
  "url": "https://example.com",
  "key": "ilikeu",
  "password": "bodongshouqulveweifengci"
}
```

### 请求参数：

*   `cmd`: `add` (添加) | `del` (删除) | `qry` (查询)
*   `url`: 长链接
*   `key`: 短链接
*   `password`: 认证密码

### 示例响应 (JSON)：

```json
{
  "status": 200,
  "error": "",
  "key": "HcAx62",
  "url": ""
}
```

### 响应参数：

*   `status`: `200` (成功) | `500` (失败)
*   `error`: 错误详情
*   `key`: 短链接
*   `url`: 长链接

`status` 为 `200` 表示成功，其他代码表示失败。

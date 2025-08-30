let res; // 用于存储API响应结果

// 获取当前页面的路径，作为API服务器的地址
let apiSrv = window.location.pathname;
// 从HTML中获取密码值
let password_value = document.querySelector("#passwordText").value;

// 以下注释掉的代码是用于本地测试或指定API服务器和密码的示例
// let apiSrv = "https://journal.crazypeace.workers.dev";
// let password_value = "journaljournal";

// 这是默认的显示长链接的函数，你可以在不同的 index.html 中设置为不同的显示行为
// This is default, you can define it to different funciton in different theme index.html
let buildValueItemFunc = buildValueTxt;

/**
 * 生成短链接的函数
 */
function shorturl() {
  // 检查长链接输入是否为空
  if (document.querySelector("#longURL").value === "") {
    alert("原始链接不能为空！"); // Url cannot be empty!
    return;
  }
  
  // 短链接中不能有空格，将空格替换为连字符 "-"
  // key can't have space in it
  document.getElementById('keyPhrase').value = document.getElementById('keyPhrase').value.replace(/\s/g, "-");

  // 禁用按钮并显示加载状态
  document.getElementById("addBtn").disabled = true;
  document.getElementById("addBtn").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>请稍候...'; // Please wait...

  // 发送POST请求到API服务器
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "add", url: document.querySelector("#longURL").value, key: document.querySelector("#keyPhrase").value, password: password_value })
  }).then(function (response) {
    // 将响应转换为JSON格式
    return response.json();
  }).then(function (myJson) {
    res = myJson; // 存储响应结果
    // 重新启用按钮并恢复原始文本
    document.getElementById("addBtn").disabled = false;
    document.getElementById("addBtn").innerHTML = '生成短链接'; // Shorten it

    // 检查API响应状态，判断是否成功生成短链接
    // 成功生成短链 Succeed
    if (res.status == "200") {
      let keyPhrase = res.key; // 获取生成的短链接key
      let valueLongURL = document.querySelector("#longURL").value; // 获取原始长链接
      // 将短链接和长链接保存到本地存储 (localStorage)
      localStorage.setItem(keyPhrase, valueLongURL);
      // 将新的短链接添加到页面列表
      addUrlToList(keyPhrase, valueLongURL);

      // 在结果区域显示生成的短链接
      document.getElementById("result").innerHTML = window.location.protocol + "//" + window.location.host + "/" + res.key;
    } else {
      // 如果生成失败，显示错误信息
      document.getElementById("result").innerHTML = res.error;
    }

    // 弹出结果模态框 Popup the result
    var modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();

  }).catch(function (err) {
    // 处理网络请求或API调用过程中发生的未知错误
    alert("未知错误。请重试！"); // Unknow error. Please retry!
    console.log(err);
    // 重新启用按钮并恢复原始文本
    document.getElementById("addBtn").disabled = false;
    document.getElementById("addBtn").innerHTML = '生成短链接'; // Shorten it
  });
}

/**
 * 复制文本到剪贴板的函数
 * @param {string} id - 要复制内容的元素的ID
 * @param {string} attr - 如果是元素的属性（如.value），则指定属性名；否则直接复制元素内容
 */
function copyurl(id, attr) {
  let target = null; // 用于存放待复制内容的临时元素

  if (attr) {
    // 如果指定了属性，则创建一个临时的div来存放属性值
    target = document.createElement('div');
    target.id = 'tempTarget';
    target.style.opacity = '0'; // 设置为透明，不影响页面布局
    if (id) {
      let curNode = document.querySelector('#' + id); // 获取目标元素
      target.innerText = curNode[attr]; // 将属性值赋给临时div
    } else {
      target.innerText = attr; // 如果没有id，直接将attr作为内容
    }
    document.body.appendChild(target); // 将临时div添加到body
  } else {
    target = document.querySelector('#' + id); // 直接获取目标元素
  }

  try {
    let range = document.createRange(); // 创建一个Range对象
    range.selectNode(target); // 选择目标元素内的所有内容
    window.getSelection().removeAllRanges(); // 清除当前的选区
    window.getSelection().addRange(range); // 添加新的选区
    document.execCommand('copy'); // 执行复制命令
    window.getSelection().removeAllRanges(); // 再次清除选区
    // console.log('Copy success') // 复制成功日志
  } catch (e) {
    console.log('Copy error'); // 复制失败日志
  }

  if (attr) {
    // 如果是复制属性值，则移除临时div
    target.parentElement.removeChild(target);
  }
}

/**
 * 从本地存储加载短链接列表并显示在页面上
 */
function loadUrlList() {
  // 首先清空当前显示的列表
  let urlList = document.querySelector("#urlList");
  while (urlList.firstChild) {
    urlList.removeChild(urlList.firstChild);
  }

  // 获取输入框中的长链接，用于筛选
  let longUrl = document.querySelector("#longURL").value;
  // console.log(longUrl)

  // 遍历localStorage中的所有项
  let len = localStorage.length;
  // console.log(+len);
  for (; len > 0; len--) {
    let keyShortURL = localStorage.key(len - 1); // 获取key
    let valueLongURL = localStorage.getItem(keyShortURL); // 获取value (长链接)

    // 如果输入框为空，则加载所有localStorage中的项；
    // 如果输入框不为空，则只加载匹配的长链接项。
    // If the long url textbox is empty, load all in localStorage
    // If the long url textbox is not empty, only load matched item in localStorage
    if (longUrl === "" || (longUrl === valueLongURL)) {
      // 调用addUrlToList函数将匹配的项添加到页面列表
      addUrlToList(keyShortURL, valueLongURL);
    }
  }
}

/**
 * 将一个短链接条目添加到页面列表
 * @param {string} shortUrl - 短链接的key
 * @param {string} longUrl - 对应的长链接
 */
function addUrlToList(shortUrl, longUrl) {
  let urlList = document.querySelector("#urlList"); // 获取列表容器

  let child = document.createElement('div'); // 创建一个新的列表项div
  child.classList.add("mb-3", "list-group-item"); // 添加Bootstrap的样式类

  // 创建包含短链接、删除按钮和查询按钮的组
  let keyItem = document.createElement('div');
  keyItem.classList.add("input-group");

  // 创建删除按钮
  let delBtn = document.createElement('button');
  delBtn.setAttribute('type', 'button');
  delBtn.classList.add("btn", "btn-danger", "rounded-bottom-0");
  delBtn.setAttribute('onclick', 'deleteShortUrl("' + shortUrl + '")'); // 设置点击事件为删除该项
  delBtn.setAttribute('id', 'delBtn-' + shortUrl); // 设置唯一的ID
  delBtn.innerText = "X"; // 按钮文本
  keyItem.appendChild(delBtn); // 将删除按钮添加到组

  // 创建查询访问次数按钮
  let qryCntBtn = document.createElement('button');
  qryCntBtn.setAttribute('type', 'button');
  qryCntBtn.classList.add("btn", "btn-info");
  qryCntBtn.setAttribute('onclick', 'queryVisitCount("' + shortUrl + '")'); // 设置点击事件为查询次数
  qryCntBtn.setAttribute('id', 'qryCntBtn-' + shortUrl); // 设置唯一的ID
  qryCntBtn.innerText = "?"; // 按钮文本
  keyItem.appendChild(qryCntBtn); // 将查询按钮添加到组

  // 创建显示短链接的span
  let keyTxt = document.createElement('span');
  keyTxt.classList.add("form-control", "rounded-bottom-0");
  keyTxt.innerText = window.location.protocol + "//" + window.location.host + "/" + shortUrl; // 显示完整的短链接
  keyItem.appendChild(keyTxt); // 将短链接span添加到组

  // 创建显示二维码的按钮
  let qrcodeBtn = document.createElement('button');
  qrcodeBtn.setAttribute('type', 'button');
  qrcodeBtn.classList.add("btn", "btn-info");
  qrcodeBtn.setAttribute('onclick', 'buildQrcode("' + shortUrl + '")'); // 设置点击事件为生成二维码
  qrcodeBtn.setAttribute('id', 'qrcodeBtn-' + shortUrl); // 设置唯一的ID
  qrcodeBtn.innerText = "QR"; // 按钮文本
  keyItem.appendChild(qrcodeBtn); // 将二维码按钮添加到组
  
  child.appendChild(keyItem); // 将包含按钮和短链接的组添加到列表项

  // 插入一个用于存放二维码的div占位符
  let qrcodeItem = document.createElement('div');
  qrcodeItem.setAttribute('id', 'qrcode-' + shortUrl);
  child.appendChild(qrcodeItem);

  // 调用buildValueItemFunc（默认为buildValueTxt）来处理长链接的显示，并将其添加到列表项
  child.appendChild(buildValueItemFunc(longUrl));

  urlList.append(child); // 将完整的列表项添加到URL列表容器
}

/**
 * 清除所有本地存储中的数据
 */
function clearLocalStorage() {
  localStorage.clear();
}

/**
 * 删除指定的短链接（从KV和localStorage中）
 * @param {string} delKeyPhrase - 要删除的短链接key
 */
function deleteShortUrl(delKeyPhrase) {
  // 改变删除按钮的状态，显示加载指示器
  document.getElementById("delBtn-" + delKeyPhrase).disabled = true;
  document.getElementById("delBtn-" + delKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  // 发送POST请求到API服务器，命令为"del"来从KV中删除
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "del", key: delKeyPhrase, password: password_value })
  }).then(function (response) {
    return response.json(); // 将响应转换为JSON
  }).then(function (myJson) {
    res = myJson; // 存储响应结果

    // 检查API响应状态，判断是否成功删除
    // 成功删除 Succeed
    if (res.status == "200") {
      // 从localStorage中移除对应的项
      localStorage.removeItem(delKeyPhrase);

      // 重新加载页面上的URL列表以更新显示
      loadUrlList();

      // 在结果区域显示成功信息
      document.getElementById("result").innerHTML = "删除成功"; // Delete Successful
    } else {
      // 如果删除失败，显示错误信息
      document.getElementById("result").innerHTML = res.error;
    }

    // 弹出结果模态框 Popup the result
    var modal = new bootstrap.Modal(document.getElementById('resultModal'));
    modal.show();

  }).catch(function (err) {
    // 处理网络请求或API调用过程中发生的未知错误
    alert("未知错误。请重试！"); // Unknow error. Please retry!
    console.log(err);
  });
}

/**
 * 查询指定短链接的访问次数
 * @param {string} qryKeyPhrase - 要查询访问次数的短链接key
 */
function queryVisitCount(qryKeyPhrase) {
  // 改变查询按钮状态，显示加载指示器
  document.getElementById("qryCntBtn-" + qryKeyPhrase).disabled = true;
  document.getElementById("qryCntBtn-" + qryKeyPhrase).innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

  // 发送POST请求到API服务器，命令为"qry"，查询key为短链接key加上"-count"的项
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "qry", key: qryKeyPhrase + "-count", password: password_value })
  }).then(function (response) {
    return response.json(); // 将响应转换为JSON
  }).then(function (myJson) {
    res = myJson; // 存储响应结果

    // 检查API响应状态，判断是否成功查询
    // 成功查询 Succeed
    if (res.status == "200") {
      // 如果成功，将访问次数（res.url）显示在查询按钮上
      document.getElementById("qryCntBtn-" + qryKeyPhrase).innerHTML = res.url;
    } else {
      // 如果查询失败，显示错误信息并在结果模态框中展示
      document.getElementById("result").innerHTML = res.error;
      // 弹出结果模态框 Popup the result
      var modal = new bootstrap.Modal(document.getElementById('resultModal'));
      modal.show();
    }

  }).catch(function (err) {
    // 处理网络请求或API调用过程中发生的未知错误
    alert("未知错误。请重试！"); // Unknow error. Please retry!
    console.log(err);
  });
}

/**
 * 根据用户输入的key，从KV中查询对应的长链接并填充到输入框
 */
function query1KV() {
  let qryKeyPhrase = document.getElementById("keyForQuery").value; // 获取用户输入的key
  if (qryKeyPhrase === "") { // 如果key为空，则不执行任何操作
    return;
  }

  // 发送POST请求到API服务器，命令为"qry"，查询用户输入的key
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "qry", key: qryKeyPhrase, password: password_value })
  }).then(function (response) {
    return response.json(); // 将响应转换为JSON
  }).then(function (myJson) {
    res = myJson; // 存储响应结果

    // 检查API响应状态，判断是否成功查询
    // 成功查询 Succeed
    if (res.status == "200") {
      document.getElementById("longURL").value = res.url; // 将查询到的长链接填充到长链接输入框
      document.getElementById("keyPhrase").value = qryKeyPhrase; // 将查询到的key填充到自定义短链接输入框
      // 触发长链接输入框的input事件，以便进行可能的后续操作（如自动加载列表）
      document.getElementById("longURL").dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true,
      }));
    } else {
      // 如果查询失败，显示错误信息并在结果模态框中展示
      document.getElementById("result").innerHTML = res.error;
      // 弹出结果模态框 Popup the result
      var modal = new bootstrap.Modal(document.getElementById('resultModal'));
      modal.show();
    }

  }).catch(function (err) {
    // 处理网络请求或API调用过程中发生的未知错误
    alert("未知错误。请重试！"); // Unknow error. Please retry!
    console.log(err);
  });
}

/**
 * 将KV中的所有数据加载到本地存储 (localStorage)
 */
function loadKV() {
  //首先清空本地存储
  clearLocalStorage(); 

  // 从KV中查询所有数据，使用命令"qryall"
  fetch(apiSrv, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd: "qryall", password: password_value })
  }).then(function (response) {    
    return response.json(); // 将响应转换为JSON
  }).then(function (myJson) {
    res = myJson; // 存储响应结果
    // 检查API响应状态，判断是否成功查询
    // 成功查询 Succeed
    if (res.status == "200") {

      // 遍历从KV获取到的列表 (kvlist)
      res.kvlist.forEach(item => {      
        keyPhrase = item.key; // 获取key
        valueLongURL = item.value; // 获取value (长链接)
        // 将KV中的数据保存到localStorage
        localStorage.setItem(keyPhrase, valueLongURL);  
      });

    } else {
      // 如果查询失败，显示错误信息并在结果模态框中展示
      document.getElementById("result").innerHTML = res.error;
      // 弹出结果模态框 Popup the result
      var modal = new bootstrap.Modal(document.getElementById('resultModal'));
      modal.show();
    }
  }).catch(function (err) {
    // 处理网络请求或API调用过程中发生的未知错误
    alert("未知错误。请重试！"); // Unknow error. Please retry!
    console.log(err);
  });
}

/**
 * 生成指定短链接的二维码
 * @param {string} shortUrl - 要生成二维码的短链接key
 */
function buildQrcode(shortUrl) {
  // 感谢项目 https://github.com/lrsjng/jquery-qrcode
  var options = {
    // 渲染方法: 'canvas', 'image' 或 'div'
    render: 'canvas',

    // 版本范围：1 .. 40
    minVersion: 1,
    maxVersion: 40,

    // 容错级别: 'L', 'M', 'Q' 或 'H'
    ecLevel: 'Q',

    // 绘制在现有canvas上的偏移量 (像素)
    left: 0,
    top: 0,

    // 大小 (像素)
    size: 256,

    // 码颜色或图片元素
    fill: '#000',

    // 背景颜色或图片元素，null 表示透明背景
    background: null,

    // 内容
    // 要转换的文本
    text: window.location.protocol + "//" + window.location.host + "/" + shortUrl,

    // 角落半径 (相对于模块宽度的比例: 0.0 .. 0.5)
    radius: 0,

    // 静区 (模块数)
    quiet: 0,

    // 模式
    // 0: normal
    // 1: label strip
    // 2: label box
    // 3: image strip
    // 4: image box
    mode: 0,

    // 中间Logo大小 (相对于模块宽度的比例)
    mSize: 0.1,
    // 中间Logo位置 X (相对于二维码中心: 0.0 .. 1.0)
    mPosX: 0.5,
    // 中间Logo位置 Y (相对于二维码中心: 0.0 .. 1.0)
    mPosY: 0.5,

    // 标签文本
    label: 'no label',
    // 字体名称
    fontname: 'sans',
    // 字体颜色
    fontcolor: '#000',

    // 中间Logo图片
    image: null
  };
  // 使用jQuery选择器生成二维码，并处理特殊字符以免ID选择器出错
  $("#qrcode-" + shortUrl.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1").replace(/(:|\#|\[|\]|,|=|@)/g, "\\$1") ).empty().qrcode(options);
}

/**
 * 构建显示长链接的文本元素
 * @param {string} longUrl - 长链接文本
 * @returns {HTMLDivElement} - 包含长链接的div元素
 */
function buildValueTxt(longUrl) {
  let valueTxt = document.createElement('div'); // 创建一个div元素
  valueTxt.classList.add("form-control", "rounded-top-0"); // 添加Bootstrap样式
  valueTxt.innerText = longUrl; // 设置div的文本内容为长链接
  return valueTxt; // 返回创建的div元素
}

// 在DOM加载完成后执行初始化操作
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Bootstrap的Popover组件
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });

  // 页面加载时先加载一次本地存储中的URL列表
  loadUrlList();
});

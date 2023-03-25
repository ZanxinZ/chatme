// 获取表单元素
const form = document.getElementById('login-form');
const username = form.elements['username'];

alert("通行证过期，请添加新的一个通行证。联系方式微信号： setupself ")

// 监听表单提交事件
form.addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单默认提交事件
    const isValidCode = validateUsername(username.value); // 验证用户名是否合法

    var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
    httpRequest.open('POST', '/validate', true);
    httpRequest.setRequestHeader("Content-type","application/json");
    var obj = { token: username.value};
    httpRequest.send(JSON.stringify(obj));//发送请求 将json写入send中

    /**
     * 获取数据后的处理程序
     */
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var json = httpRequest.responseText;//获取到服务端返回的数据
            var isValid = JSON.parse(json).isValid

            if (isValid === 'true') {
                // 跳转至主页面
                var localStorage = window.localStorage;
                if (localStorage) {
                    localStorage.setItem('token', username.value);
                }
                window.location.replace("/")

            } else {
                alert('通行证无效！');
                // 展示获取渠道
            }
            console.log(json);
        }
    };

});

// 验证用户名是否合法
function validateUsername(value) {
if(value.trim() === '') {
username.classList.add('invalid'); // 添加样式类
return false;
} else {
username.classList.remove('invalid'); // 移除样式类
return true;
}
}

const confirmButton = document.getElementById('confirm-button');
const clearSendAreaBtn = document.getElementById('clear-send-button');
const inputField = document.getElementById('input-field');
const copyButton = document.getElementById('copy-button')
const clearButton = document.getElementById('clear-button')
const chatArea = document.getElementById('chat-area')
const body = document.getElementById('body')
const waitAnswerCanvas = document.getElementById('wait-answer-canvas')
var messages = []
var timerForCanvas
function bindSendBtn() {
    confirmButton.addEventListener('click', () => {
      const inputValue = inputField.value;
      if (inputField.value === ''){
        Toastify({
                text: "请输入问题后再发送(⊙o⊙)~",
                duration: 2000,
                newWindow: false,
                close: false,
                gravity: "top",
                position: "center",
                offset: {
                  x: 0,
                  y: 0
                },
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
              }).showToast();
        return
      }
      messages.push({role: 'user', content: inputValue})
      addUserQuestion(inputValue)


      var localStorage = window.localStorage;
      var token = '';
      if (localStorage) {
        token = localStorage.getItem('token');
      }
      if (token === '') {
        window.location.replace("/login")
      }
      const url = '/ask';

      Toastify({
        text: "问题提交中，耐心等待，马上输出~",
        duration: 3000,
        newWindow: false,
        close: false,
        gravity: "top",
        position: "center",
        offset: {
          x: 20,
          y: 20
        },
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();

      timerForCanvas = setInterval(drawWaiting, 20);
      waitAnswerCanvas.style.display = "inline";
      confirmButton.disabled = true;

      console.log(inputValue)
      inputField.value = ''
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({input: messages, token: [{role: token}]})
      })
      .then(response =>
        response.json())
      .then(data => {
        //console.log(data)
        if (data.isValid === 'false') {

            var localStorage = window.localStorage;
            if (localStorage) {
                localStorage.setItem('token', '');
            }
            window.location.replace("/login");
            ;
            return;
        } else if (data.isValid === 'true') {
            confirmButton.disabled = false;

            waitAnswerCanvas.style.display = "none";
            clearInterval(timerForCanvas);

            console.log(data.result)
            content = JSON.parse(data.result).choices[0].message.content
            content = content.replace(/^\n+|\n+$/g, '')
            messages.push(JSON.parse(data.result).choices[0].message)
            addContent(content)
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });

    });
}

function bindCopyBtn() {
    copyButton.addEventListener('click', function() {
                if (messages.length !== 0) {
                    var dummy = document.createElement("textarea");
                    document.body.appendChild(dummy);
                    dummy.setAttribute("id", "dummy_id");
                    document.getElementById("dummy_id").value=messages2String(messages);
                    dummy.select();
                    document.execCommand("copy");
                    document.body.removeChild(dummy);
                    alert('复制成功!');
                }
            });
}

function bindClearBtn() {
    clearButton.addEventListener('click', function() {
        clearChatArea();
        messages = [];
    });
}

function bindClearAreaBtn() {
    clearSendAreaBtn.addEventListener('click', function() {
            inputField.value = '';
        });
}

function addContent(content) {
    const textOne = document.createElement('textarea');

    const block = document.createElement('div');
    textOne.textContent = content;
    const textStyles = {
                      position: 'relative',
                      border: '4px solid #477DF2',
                      borderRadius: '10px',
                      margin: '10px',
                      align: 'center',
                      width: '75%',
                      word_break: 'break-all',
                      line_break: 'normal',
                      padding: '4px',
                      resize: 'none',
                      overflow: 'hidden',
                      fontFamily: 'math',
                      fontSize: '18px'
    };
    const bubbleStyles = {
                        content: '',
                        position: 'absolute',
                        top: '20px',
                        left: '-10px',
                        width: '0',
                        height: '0',
                        border: '2px solid #477DF2',
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent',
                        borderLeftColor: '#477DF2',
                        zIndex: '1'
    };
    const bubble = document.createElement('div');
    for (let style in textStyles) {
            bubble.style[style] = bubbleStyles[style];
    }



    for (let style in textStyles) {
        textOne.style[style] = textStyles[style];
    }

    //block.appendChild(bubble)
    block.appendChild(textOne)

    chatArea.appendChild(textOne);

    textAreaAdjust(textOne);

    chatArea.scrollTop = chatArea.scrollHeight;
}

function addUserQuestion(content) {
    const block = document.createElement('textarea');
        chatArea.appendChild(block);
        block.textContent = content;
        const textStyles = {
                          border: '4px solid #5FAB48',
                          borderRadius: '10px',
                          margin: '10px',
                          align: 'right',
                          width: '75%',
                          word_break: 'break-all',
                          line_break: 'normal',
                          padding: '4px',
                          resize: 'none',
                          overflow: 'hidden',
                          fontFamily: 'math',
                          fontSize: '18px',
                          float: 'right'
                        };
        for (let style in textStyles) {
            block.style[style] = textStyles[style];
        }
        textAreaAdjust(block);
        chatArea.scrollTop = chatArea.scrollHeight;
}

function messages2String(messages) {
    var res = '';
    var l = messages.length

    for (var i = 0; i < l; i++) {

        var r = messages[i]['role']
        var c = messages[i]['content']
        res = res + '**' + r + '**:\n\n' + c + '\n\n';
    }
    return res;
}

function textAreaAdjust(element) {
  element.style.height = "1px";
  element.style.height = (element.scrollHeight)+"px";
}

function adjustAllText() {
    const children = chatArea.childNodes;
    children.forEach(child => {
        textAreaAdjust(child)
    });
}

function bindShortcut() {
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.keyCode === 13) {
        event.preventDefault(); // 阻止默认行为
        confirmButton.click(); // 模拟点击c按钮
      }
    });
}

function bindScreenListener() {
    window.addEventListener('resize', function() {
        const rate = window.innerHeight / window.innerWidth;
        adjustAllText();
    });

}

function bindMouseMoveEffect() {
    body.addEventListener('mousemove', () => {
      // 随机创建 3-6 个气泡
      for (let i = 0; i < Math.random() * 4 ; i++) {
        createBubble();
      }
    });
}

function createBubble() {
  const bubble = document.createElement('div');
  // 设置气泡样式和位置
  bubble.style.backgroundColor = randomColor();
  radius = Math.random() * 10 + 'px'
  bubble.style.width = radius;
  bubble.style.height = radius;
  bubble.style.borderRadius = '50%';
  bubble.style.position = 'absolute';
  bubble.style.pointerEvents = 'none';
  bubble.style.left = (event.clientX + Math.floor(Math.random() * 20) - 10) + 'px';
  bubble.style.top = (event.clientY + Math.floor(Math.random() * 20) - 10) + 'px';

  // 将气泡添加到页面中
  document.body.appendChild(bubble);

  setTimeout(() => bubble.remove(), Math.random()*200);


}

function randomColor() {
  const colors = ['#87CEFA', '#ADD8E6', '#B0E0E6', '#AFEEEE', '#E0FFFF', '#F0FFFF', '#F0FFF0', '#98FB98', '#87CEEB', '#00BFFF', '#87CEEB', '#00BFFF', '#87CEEB', '#00BFFF', '#87CEEB', '#00BFFF'];

  return colors[Math.floor(Math.random() * colors.length)];
}

function drawWaiting() {
  var canvas = document.getElementById('wait-answer-canvas');
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  var radius = 5;
  var x = 10;
  var y = 50 ;
  for (var i = 0; i < 4; i++) {
    if (i !== 0) {
        context.beginPath();
            context.arc(x, y, Math.abs(radius), 0, 2 * Math.PI, false);
            context.fillStyle = '#ABD1EB';
            context.fill();
            context.lineWidth = 1;
            context.strokeStyle = '#75858F';
            context.stroke();
    }

    x += 20;
    radius = 8 * Math.sin(Date.now() / 160 + i * Math.PI / 2) + 10;
  }


}



function clearChatArea() {
    while (chatArea.lastElementChild) {
        chatArea.removeChild(chatArea.lastElementChild);
    }
}


function setup() {
    bindSendBtn()
    bindShortcut()
    bindScreenListener()
    bindMouseMoveEffect()
    bindCopyBtn()
    bindClearBtn()
    bindClearAreaBtn()
    waitAnswerCanvas.style.display = "none";

}



setup()

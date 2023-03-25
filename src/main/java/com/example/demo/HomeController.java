package com.example.demo;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.InetSocketAddress;
import java.net.Proxy;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Controller
public class HomeController {

    @Value("${needProxy}")
    private String needProxy;

    @RequestMapping("/")
    public String home() {
        return "home";
    }

    @RequestMapping("/login")
    public String login() {
        return "login/login";
    }

    @Value("${proxy_ip}")
    String proxy_ip;
    @Value("${proxy_port}")
    String proxy_port;

    @Value("${my-api-key}")
    private String apiKey;
    public String chat(ArrayList<Map<String, String>> records) {
        // record 包含 多条 message，每条 message 可能来自用户，可能来自 assistant

        String url = "https://api.openai.com/v1/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // 设置聊天请求参数
        Map<String, Object> request = new HashMap<>();
        request.put("model", "gpt-3.5-turbo");

        request.put("messages", records);

        // 发送POST请求
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();

        if (needProxy.equals("true")) {
            Proxy proxy = new Proxy(Proxy.Type.HTTP, new InetSocketAddress(proxy_ip, Integer.parseInt(proxy_port)));
            requestFactory.setProxy(proxy);
        }

        RestTemplate restTemplate = new RestTemplate(requestFactory);

        HttpEntity<?> requestEntity = new HttpEntity<>(request, headers);
        ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, requestEntity, String.class);

        String response = null;

        // 解析响应
        if (responseEntity.getStatusCode().is2xxSuccessful()) {
            response = responseEntity.getBody();
            //System.out.println(response);
        } else {
            System.out.println("Error: " + responseEntity.getBody());
        }
        if (response == null) {
            response = "无内容";
        }
        JSONObject jsonObject = new JSONObject(response);
        JSONArray jsonArray = jsonObject.getJSONArray("choices");
        JSONObject messageObject = jsonArray.getJSONObject(0).getJSONObject("message");
        String role = messageObject.getString("role");
        String content = messageObject.getString("content");

        return response;
    }

    @PostMapping(value = "/ask")
    @ResponseBody
    public Map<String, String> ask(@RequestBody HashMap<String, ArrayList<Map<String, String>>> m) {
        Map<String, String> response = new HashMap<>();

        ArrayList<Map<String, String>> input = m.get("input");// 是一个包含多条 message 的list

        String token = m.get("token").get(0).get("role");


        boolean isTokenValid = checkToken(token);
        if (!isTokenValid) {
            response.put("isValid", "false");
            return response;
        }

        String output = chat(input);

        response.put("isValid", "true");
        response.put("result", output);

        return response;
    }

    @Value("${my-token}")
    private String myToken;

    @PostMapping(value = "/validate")
    @ResponseBody
    public  Map<String, String> validate(@ RequestBody HashMap<String, String> request) {
        String token = request.get("token");
        Map<String, String> response = new HashMap<>();
        //System.out.println(token);
        if (checkToken(token)){
            response.put("isValid", "true");
        } else {
            response.put("isValid", "false");
        }

        return response;
    }

    public boolean checkToken(String token) {
        return Objects.equals(token, myToken);
    }
}

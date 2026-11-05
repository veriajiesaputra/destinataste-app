import sys
import requests

def check_health(api_url, api_key="sk-gemini-web2api-sec-9a8f"):
    headers = {"Authorization": f"Bearer {api_key}"}
    endpoints = ["/v1/models"]
    results = {}
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{api_url}{endpoint}", headers=headers, timeout=5)
            results[endpoint] = response.status_code == 200
        except Exception as e:
            results[endpoint] = str(e)
            
    try:
        payload = {
            "model": "gemini-3.6-flash",
            "messages": [{"role": "user", "content": "ping"}]
        }
        res = requests.post(f"{api_url}/v1/chat/completions", headers=headers, json=payload, timeout=15)
        results["/v1/chat/completions"] = res.status_code == 200 and "choices" in res.json()
    except Exception as e:
        results["/v1/chat/completions"] = str(e)

    return results

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8081"
    key = sys.argv[2] if len(sys.argv) > 2 else "sk-gemini-web2api-sec-9a8f"
    res = check_health(url, key)
    print("Healthcheck Result:", res)

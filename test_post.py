import requests

try:
    resp1 = requests.post("http://localhost:8000/api/v1/auth/login", data={"username":"admin","password":"admin123"})
    print("Login:", resp1.status_code, resp1.text)
    token = resp1.json().get("access_token")
    if token:
        resp2 = requests.post("http://localhost:8000/api/v1/orders/", json={
            "items": [{"product_id": 1, "quantity": 1}],
            "address": "test address"
        }, headers={"Authorization": f"Bearer {token}"})
        print("Order POST:", resp2.status_code, resp2.text)
except Exception as e:
    print("Error:", e)

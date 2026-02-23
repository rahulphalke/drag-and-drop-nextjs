import http.client
import json

conn = http.client.HTTPConnection("localhost", 5000)
conn.request("GET", "/api/forms/2")
response = conn.getresponse()
data = response.read().decode()
try:
    obj = json.loads(data)
    print(json.dumps(obj, indent=2))
except Exception as e:
    print(f"Error parsing JSON: {e}")
    print(f"Raw data: {data}")
conn.close()

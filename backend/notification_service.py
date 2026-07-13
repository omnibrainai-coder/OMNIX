import http.client
import json

def send_push_notification(fcm_token, sender_username, message_text):
    """AWS EC2 server se FCM ke zariye user ke device par push notification bhejne ka function"""
    connection = http.client.HTTPSConnection("fcm.googleapis.com")
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_FCM_SERVER_KEY" # Firebase console se key yahan aayegi
    }
    
    payload = {
        "to": fcm_token,
        "notification": {
            "title": f"💬 New Message from @{sender_username}",
            "body": message_text,
            "sound": "default"
        }
    }
    
    connection.request("POST", "/fcm/send", json.dumps(payload), headers)
    response = connection.getresponse()
    print(f"🔔 Notification Status: {response.status} {response.reason}")
    return response.read()

if __name__ == "__main__":
    print("🚀 Notification infrastructure ready on EC2 backend!")

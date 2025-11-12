"""
客服端 WebSocket 测试脚本（无认证版本）
测试管理后台客服连接并与用户沟通
"""

import socketio
import time

# 配置
SERVER_URL = "https://agent.kaimen.site"  # 基础 URL
AGENT_NAME = "张三客服"  # 客服名称
AGENT_ID = "test_agent_001"  # 客服ID

# 创建 SocketIO 客户端
sio = socketio.Client(logger=True, engineio_logger=True)

current_conversation_id = "7adc30ae-71e7-4512-8be6-24c16f4ecff8"


# 事件处理器
@sio.event(namespace="/v1/chat/human-service/human")
def connect():
    print("✅ [Human] Connected to server")
    print("📤 [Human] Sending human_online...")

    # 发送客服上线
    sio.emit("human_online", {
        "type": "human_online",
        "data": {
            "agent_id": AGENT_ID,
            "agent_name": AGENT_NAME,
            "timestamp": int(time.time())
        }
    }, namespace="/v1/chat/human-service/human")


@sio.event(namespace="/v1/chat/human-service/human")
def human_online_ack(data):
    print(f"\n✅ [Human] Online acknowledged: {data}")
    human_id = data.get("data", {}).get("human_id")
    human_name = data.get("data", {}).get("human_name")
    waiting_count = data.get("data", {}).get("waiting_count", 0)
    waiting_queue = data.get("data", {}).get("waiting_queue", [])

    print(f"   - Human ID: {human_id}")
    print(f"   - Human Name: {human_name}")
    print(f"   - Waiting Queue: {waiting_count} conversations")

    if waiting_queue:
        print("\n📋 Waiting conversations:")
        for conv in waiting_queue:
            print(f"   - Conversation ID: {conv.get('conversation_id')}")
            print(f"     User ID: {conv.get('user_id')}")
            print(f"     Wait time: {conv.get('wait_time', 0)}s")


@sio.event(namespace="/v1/chat/human-service/human")
def new_conversation(data):
    """新用户等待接入"""
    global current_conversation_id
    print(f"\n🔔 [Human] New conversation waiting:")
    conv_data = data.get("data", {})
    conversation_id = conv_data.get("conversation_id")
    user_id = conv_data.get("user_id")
    first_message = conv_data.get("first_message", "")

    print(f"   - Conversation ID: {conversation_id}")
    print(f"   - User ID: {user_id}")
    print(f"   - First Message: {first_message}")

    # 自动接受会话
    print(f"\n📤 [Human] Accepting conversation {conversation_id}...")
    current_conversation_id = conversation_id
    time.sleep(1)

    sio.emit("accept_conversation", {
        "type": "accept_conversation",
        "data": {
            "conversation_id": conversation_id,
            "timestamp": int(time.time())
        }
    }, namespace="/v1/chat/human-service/human")


@sio.event(namespace="/v1/chat/human-service/human")
def accept_conversation_ack(data):
    print(f"\n✅ [Human] Conversation accepted: {data}")

    # 发送欢迎消息
    print("\n📤 [Human] Sending welcome message...")
    time.sleep(1)

    sio.emit("human_message", {
        "type": "human_message",
        "data": {
            "conversation_id": current_conversation_id,
            "message_content": f"您好！我是{AGENT_NAME}，有什么可以帮您的吗？",
            "message_type": "text",
            "timestamp": int(time.time())
        }
    }, namespace="/v1/chat/human-service/human")


@sio.event(namespace="/v1/chat/human-service/human")
def user_message(data):
    """接收用户消息"""
    print(f"\n💬 [Human] Received message from user:")
    msg_data = data.get("data", {})
    user_id = msg_data.get("user_id")
    content = msg_data.get("message_content")
    conversation_id = msg_data.get("conversation_id")

    print(f"   - User ID: {user_id}")
    print(f"   - Content: {content}")
    print(f"   - Conversation ID: {conversation_id}")

    # 自动回复
    print("\n📤 [Human] Sending reply...")
    time.sleep(2)

    reply = f"收到您的消息：「{content}」。我会尽快为您处理！"

    sio.emit("human_message", {
        "type": "human_message",
        "data": {
            "conversation_id": conversation_id,
            "message_content": reply,
            "message_type": "text",
            "timestamp": int(time.time())
        }
    }, namespace="/v1/chat/human-service/human")


@sio.event(namespace="/v1/chat/human-service/human")
def human_message(data):
    print(f"\n✅ [Human] Message sent confirmation: {data}")


@sio.event(namespace="/v1/chat/human-service/human")
def error(data):
    print(f"\n❌ [Human] Error: {data}")


@sio.event(namespace="/v1/chat/human-service/human")
def disconnect():
    print("\n❌ [Human] Disconnected from server")


@sio.event
def connect_error(data):
    print(f"\n❌ [Human] Connection error: {data}")


# 连接到服务器
try:
    print(f"🔌 Connecting to {SERVER_URL}")
    print(f"   Namespace: /v1/chat/human-service/human")
    print(f"   Agent: {AGENT_NAME} (ID: {AGENT_ID})")
    print(f"   No authentication required (testing mode)")

    sio.connect(
        SERVER_URL,
        namespaces=["/v1/chat/human-service/human"],
        transports=["websocket", "polling"]
    )

    # 保持连接
    print("\n⏳ Waiting for events... (Press Ctrl+C to exit)")
    print("💡 Tip: Run test_user_no_auth.py in another terminal to simulate a user")
    sio.wait()

except KeyboardInterrupt:
    print("\n\n👋 Disconnecting...")
    sio.disconnect()
except Exception as e:
    print(f"\n❌ Connection failed: {e}")
    import traceback

    traceback.print_exc()


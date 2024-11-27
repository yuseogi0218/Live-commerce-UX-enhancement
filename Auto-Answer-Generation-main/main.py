import json

from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from qaservice import QAService
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from request import Information

app = FastAPI()
qa_service = QAService()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Langchain이 질문에 대한 답변 생성시 참고할 정보 추가
@app.post("/{broadcast_id}/detail")
def add_info(broadcast_id, information: Information):
    qa_service.add_info(broadcast_id, information)


# 질문에 대한 답변 생성
@app.get("/{broadcast_id}/query")
def get_answer(broadcast_id, q: str):
    return qa_service.get_answer(broadcast_id, q)

connected_room = defaultdict(list)

# webSocket 서버 연결 : QA(질문, 답변) 쌍 전송
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    connected_room[room_id].append(websocket)
    try:
        while True:
            json_data = await websocket.receive_text()
            data = json.loads(json_data)

            # 관리자가 사용한 답변을 추후, Langchain이 질문에 대한 답변 생성시 참고할 정보에 추가
            # vector store 에 추가
            qa_service.add_admin_answer_info(room_id, data["question"], data["message"])

            # 메시지를 받았을 때 모든 연결된 클라이언트에게 broadcast 합니다.
            for client in connected_room[room_id]:
                await client.send_text(json_data)
    except WebSocketDisconnect:
        # 연결이 닫힌 경우 클라이언트를 connected_clients에서 제거합니다.
        connected_room[room_id].remove(websocket)

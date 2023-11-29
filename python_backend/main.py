from fastapi.middleware.cors import CORSMiddleware
from routes import chats_router, socket_app
from fastapi import FastAPI

app = FastAPI(title="Reco API", version="0.1.0",
              description="API for Reco chatbot.",
              docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(app.root_path + "/openapi.json")
def custom_swagger_ui_html():
    return app.openapi()

app.mount("/wss/", socket_app)
app.include_router(chats_router, prefix="/api", tags=["Chats"])

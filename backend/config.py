from pydantic import BaseModel


class AppConfig(BaseModel):
    app_name: str = "OptiSolve Support Backend"
    app_version: str = "0.1.0"
    cors_allow_origins: list[str] = ["*"]
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]


settings = AppConfig()

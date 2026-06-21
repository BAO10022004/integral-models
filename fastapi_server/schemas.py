"""
Schemas (Pydantic models) cho FastAPI Integral Solver API.
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# ─── Request Models ───────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    latex: str = Field(
        ...,
        description="Biểu thức tích phân dạng LaTeX",
        examples=[r"\int_{0}^{1} x^2 dx", r"\int x \sin(x) dx"],
        min_length=1,
    )


class SolveRequest(BaseModel):
    latex: str = Field(
        ...,
        description="Biểu thức tích phân dạng LaTeX",
        examples=[r"\int_{0}^{1} x^2 dx", r"\int \frac{x+2}{x^2+1} dx"],
        min_length=1,
    )


# ─── Step Models ──────────────────────────────────────────────────────────────

class SolveStep(BaseModel):
    kind: str = Field(..., description="Loại bước: predict | transform | antiderivative | result | info | error")
    depth: int = Field(..., description="Độ sâu đệ quy")
    description: str = Field(..., description="Mô tả bước")
    action: Optional[Any] = Field(None, description="Action được chọn (int hoặc string)")
    formula: Optional[str] = Field(None, description="Công thức / kết quả")
    integral: Optional[str] = Field(None, description="Biểu thức tích phân hiện tại")
    value: Optional[float] = Field(None, description="Giá trị số (cho bước result xác định)")
    probabilities: Optional[Dict[str, float]] = Field(None, description="Xác suất các action")


# ─── Response Models ──────────────────────────────────────────────────────────

class Probability(BaseModel):
    action: int
    name: str
    probability: float
    color: str


class PredictResponse(BaseModel):
    latex: str
    action: int
    action_name: str
    action_name_en: str
    icon: str
    color: str
    description: str
    confidence: float = Field(..., description="Độ tin cậy (%)")
    steps: List[str] = Field(default_factory=list, description="Các bước thực hiện")
    formulas: List[str] = Field(default_factory=list, description="Công thức liên quan")
    probabilities: List[Probability]


class SolveResponse(BaseModel):
    latex: str
    steps: List[SolveStep]
    answer: Optional[Any] = Field(None, description="Kết quả: số (xác định) hoặc string (bất định)")
    success: bool
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    api_version: str


class InfoResponse(BaseModel):
    api_version: str
    model: str
    f1_macro: Optional[float]
    n_classes: int
    actions: List[int]
    description: str


class ExampleItem(BaseModel):
    latex: str
    description: str
    type: str


class ExamplesResponse(BaseModel):
    examples: List[ExampleItem]


# ─── Chat Models ──────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' hoặc 'assistant'")
    content: str = Field(..., description="Nội dung tin nhắn")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Nội dung câu hỏi của người dùng")
    history: Optional[List[ChatMessage]] = Field(default=None, description="Lịch sử cuộc trò chuyện")


class ChatResponse(BaseModel):
    response: str = Field(..., description="Phản hồi từ AI Assistant")


class ChatConfigResponse(BaseModel):
    configured: bool
    key_preview: Optional[str] = None


class ChatConfigRequest(BaseModel):
    api_key: str = Field(..., description="Google Gemini API Key", min_length=1)



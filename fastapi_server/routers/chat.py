import os
import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from dotenv import load_dotenv

# Load schemas
from fastapi_server.schemas import ChatRequest, ChatResponse, ChatMessage, ChatConfigResponse, ChatConfigRequest

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger("integral_api.chat")

# System instruction for the Gemini Model
SYSTEM_INSTRUCTION = (
    "Bạn là 'Trợ lý Giải tích' (Calculus Assistant) trực tuyến thuộc hệ thống Integral Solver. "
    "Nhiệm vụ của bạn là giải đáp các câu hỏi liên quan đến toán học, đặc biệt là giải tích (tích phân, đạo hàm, giới hạn, chuỗi số, phương trình vi phân...) bằng tiếng Việt. "
    "Hãy trả lời một cách rõ ràng, chi tiết, logic từng bước và chuyên nghiệp. "
    "Khi viết các công thức toán học, hãy luôn sử dụng định dạng LaTeX chuẩn để ứng dụng web hiển thị đẹp mắt: "
    "sử dụng dấu đô la đơn '$' cho công thức nội dòng (inline, ví dụ: $f(x) = x^2$) và dấu đô la kép '$$' cho công thức hiển thị riêng biệt (block, ví dụ: $$\\int x dx = \\frac{x^2}{2} + C$$). "
    "Hãy thân thiện và luôn sẵn sàng hỗ trợ người học."
)

@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Trò chuyện với trợ lý ảo",
    description="Gửi tin nhắn và lịch sử trò chuyện đến Gemini API để nhận phản hồi từ AI Assistant.",
)
async def chat_with_assistant(body: ChatRequest) -> ChatResponse:
    # 1. Check for API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Check root dotenv just in case it wasn't loaded
        _ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        load_dotenv(os.path.join(_ROOT, ".env"))
        api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        logger.warning("GEMINI_API_KEY is not configured.")
        return ChatResponse(
            response=(
                "⚠️ **Không tìm thấy cấu hình API Key cho AI.**\n\n"
                "Để kích hoạt Trợ lý Giải tích AI, vui lòng:\n"
                "1. Tạo file `.env` tại thư mục gốc của backend (nếu chưa có).\n"
                "2. Thêm dòng cấu hình sau: `GEMINI_API_KEY=your_gemini_api_key_here`\n"
                "3. Khởi động lại server để áp dụng thay đổi."
            )
        )

    try:
        import google.generativeai as genai
    except ImportError:
        logger.error("google-generativeai package is not installed.")
        return ChatResponse(
            response=(
                "⚠️ **Thư viện AI chưa được cài đặt đầy đủ trên server.**\n\n"
                "Vui lòng chạy lệnh sau trong thư mục backend để cài đặt thư viện giao tiếp với Gemini:\n"
                "`pip install google-generativeai`"
            )
        )

    try:
        # Configure the generative AI SDK
        genai.configure(api_key=api_key)

        # Use gemini-1.5-flash for speed and lower latency
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_INSTRUCTION
        )

        # Format history for Gemini API:
        # Gemini expects history format to be a list of Content dicts:
        # [{'role': 'user', 'parts': ['Hello']}, {'role': 'model', 'parts': ['Hi there']}]
        gemini_history = []
        if body.history:
            for msg in body.history:
                # Map role: user -> user, assistant -> model (Gemini uses 'model' instead of 'assistant')
                role = "user" if msg.role == "user" else "model"
                gemini_history.append({
                    "role": role,
                    "parts": [msg.content]
                })

        # Start a chat session with history
        chat = model.start_chat(history=gemini_history)
        
        # Send the user message
        response = chat.send_message(body.message)
        
        return ChatResponse(response=response.text)

    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}", exc_info=True)
        return ChatResponse(
            response=(
                "⚠️ **Đã xảy ra lỗi khi kết nối với AI API.**\n\n"
                f"Chi tiết lỗi: `{str(e)}`\n\n"
                "Vui lòng kiểm tra lại API Key hoặc kết nối mạng của máy chủ."
            )
        )


def update_env_file(key: str, value: str):
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    env_path = os.path.join(root_dir, ".env")
    
    lines = []
    key_found = False
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
    for i, line in enumerate(lines):
        if line.strip().startswith(f"{key}="):
            lines[i] = f"{key}={value}\n"
            key_found = True
            break
            
    if not key_found:
        if lines and not lines[-1].endswith("\n"):
            lines[-1] = lines[-1] + "\n"
        lines.append(f"{key}={value}\n")
        
    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)


@router.get(
    "/config",
    response_model=ChatConfigResponse,
    summary="Lấy trạng thái cấu hình Gemini API Key",
)
async def get_chat_config() -> ChatConfigResponse:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        _ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        load_dotenv(os.path.join(_ROOT, ".env"))
        api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return ChatConfigResponse(configured=False)
    
    # Show first 6 and last 4 characters for preview
    preview = None
    if len(api_key) > 10:
        preview = f"{api_key[:6]}...{api_key[-4:]}"
    else:
        preview = "Configured"
        
    return ChatConfigResponse(configured=True, key_preview=preview)


@router.post(
    "/config",
    response_model=ChatConfigResponse,
    summary="Cấu hình hoặc cập nhật Gemini API Key",
)
async def save_chat_config(body: ChatConfigRequest) -> ChatConfigResponse:
    new_key = body.api_key.strip()
    if not new_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API Key không được để trống"
        )
        
    try:
        # Write to .env file
        update_env_file("GEMINI_API_KEY", new_key)
        
        # Load immediately into memory
        os.environ["GEMINI_API_KEY"] = new_key
        
        preview = None
        if len(new_key) > 10:
            preview = f"{new_key[:6]}...{new_key[-4:]}"
        else:
            preview = "Configured"
            
        return ChatConfigResponse(configured=True, key_preview=preview)
    except Exception as e:
        logger.error(f"Failed to update API key in config: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể lưu cấu hình API Key: {str(e)}"
        )


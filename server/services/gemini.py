import google.generativeai as genai
from core.config import settings
from schemas.llm import LLMQueryRequest, LLMQueryResponse, DifficultyLevel, Language
from services.cache import get_cached_response, cache_response
import logging
import asyncio

logger = logging.getLogger(__name__)

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Initialize the model
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)


def get_system_prompt(difficulty: DifficultyLevel, language: Language, allow_code_mixing: bool) -> str:
    """
    Generate system prompt based on difficulty level and language
    """
    language_names = {
        Language.ENGLISH: "English",
        Language.HINDI: "Hindi (हिंदी)",
        Language.KANNADA: "Kannada (ಕನ್ನಡ)"
    }
    
    lang_name = language_names[language]
    code_mixing_note = ""
    if allow_code_mixing and language != Language.ENGLISH:
        code_mixing_note = " You may use code-mixing (e.g., Hinglish for Hindi, mixing English technical terms with the local language) if it helps explain concepts better to the audience."
    
    difficulty_instructions = {
        DifficultyLevel.BASIC: f"""
Explain gene editing concepts in {lang_name} at a BASIC level.
- Use simple, everyday language
- Explain technical terms briefly when needed
- Be direct and concise - get to the point quickly
- Use 1-2 brief examples if helpful
- Keep explanations focused and avoid unnecessary detail
{code_mixing_note}
""",
        DifficultyLevel.INTERMEDIATE: f"""
Explain gene editing concepts in {lang_name} at an INTERMEDIATE level.
- Use appropriate technical terms with brief explanations
- Provide essential context only
- Be concise while maintaining scientific accuracy
- Focus on answering the question directly
{code_mixing_note}
""",
        DifficultyLevel.ADVANCED: f"""
Explain gene editing concepts in {lang_name} at an ADVANCED level.
- Use proper scientific terminology
- Focus on key mechanisms and processes
- Be precise and concise
- Address the question directly without excessive background
{code_mixing_note}
"""
    }
    
    base_prompt = f"""
You are an expert assistant explaining gene editing, CRISPR technology, and related biology concepts.

{difficulty_instructions[difficulty]}

RESPONSE GUIDELINES:
- Respond in {lang_name} (understand questions in English, Hindi, or Kannada)
- By default, be concise and direct - answer the question without unnecessary elaboration
- However, if the user explicitly requests more detail, simpler explanations, or specific depth (e.g., "explain like I'm 10", "tell me more", "go into detail", "simplify this"), adapt your response accordingly
- Focus on the core answer first, add context based on the user's request
- Use clear, structured format (paragraphs or brief lists)
- Be accurate and scientifically sound
- If uncertain, acknowledge it briefly
"""
    
    return base_prompt


async def generate_response(request: LLMQueryRequest) -> LLMQueryResponse:
    """
    Generate a response using Gemini LLM based on the query request.
    Checks cache first, then generates and caches the response if not found.
    """
    try:
        # Check cache first
        cached_response = await get_cached_response(request)
        if cached_response:
            logger.info("Returning cached LLM response")
            return cached_response
        
        # Cache miss - generate new response
        logger.info("Cache miss - generating new LLM response")
        system_prompt = get_system_prompt(
            request.difficulty,
            request.language,
            request.allow_code_mixing
        )
        
        # Construct the full prompt
        full_prompt = f"{system_prompt}\n\nQuestion: {request.question}\n\nAnswer:"
        
        # Generate response (run in thread pool to avoid blocking event loop)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(full_prompt)
        )
        
        answer = response.text.strip()
        
        llm_response = LLMQueryResponse(
            answer=answer,
            question=request.question,
            difficulty=request.difficulty,
            language=request.language
        )
        
        # Cache the response for future requests
        await cache_response(request, llm_response)
        
        return llm_response
    
    except Exception as e:
        logger.error(f"Error generating Gemini response: {str(e)}")
        raise Exception(f"Failed to generate response: {str(e)}")


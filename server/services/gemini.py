import google.generativeai as genai
from core.config import settings
from schemas.llm import LLMQueryRequest, LLMQueryResponse, DifficultyLevel, Language
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
You are an expert biology educator explaining gene editing concepts in {lang_name} at a BASIC level.
- Use simple, everyday language
- Avoid technical jargon or explain it immediately when used
- Use analogies and real-world examples
- Break down complex concepts into smaller, digestible parts
- Target audience: General public, students new to biology
{code_mixing_note}
""",
        DifficultyLevel.INTERMEDIATE: f"""
You are an expert biology educator explaining gene editing concepts in {lang_name} at an INTERMEDIATE level.
- Use some technical terms but explain them clearly
- Provide context and background information
- Use examples from real-world applications
- Balance simplicity with scientific accuracy
- Target audience: Students with basic biology knowledge, interested general public
{code_mixing_note}
""",
        DifficultyLevel.ADVANCED: f"""
You are an expert researcher explaining gene editing concepts in {lang_name} at an ADVANCED level.
- Use proper scientific terminology
- Include detailed mechanisms and processes
- Reference current research and methodologies
- Discuss technical nuances and limitations
- Target audience: Researchers, graduate students, professionals in biotechnology
{code_mixing_note}
"""
    }
    
    base_prompt = f"""
You are an AI assistant specialized in explaining gene editing, CRISPR technology, and related biology concepts.

Your expertise includes:
1. Basic Biology: DNA, genes, chromosomes, mutations, proteins, cells
2. Gene Editing: CRISPR-Cas9, guide RNA (gRNA), DNA repair mechanisms, gene knockouts, gene knock-ins
3. CRISPR Applications in Crops: Crop improvement, disease resistance, yield enhancement, drought tolerance, nutritional enhancement
4. Benefits: Increased yield, disease resistance, reduced pesticide use, climate resilience, nutritional improvements
5. Risks & Ethics: Off-target effects, environmental concerns, regulatory issues, ethical considerations, GMO debates
6. Scientific Terms: Ability to explain complex terminology in accessible ways

{difficulty_instructions[difficulty]}

IMPORTANT GUIDELINES:
- The user's question may be in English, Hindi (हिंदी), or Kannada (ಕನ್ನಡ) - understand and respond appropriately
- Always respond in {lang_name}
- Be accurate and scientifically sound
- If asked about risks or ethics, present balanced perspectives
- Use examples relevant to agriculture and crop improvement when appropriate
- If the question is unclear, ask for clarification
- If you don't know something, admit it rather than guessing
- Structure your response clearly with paragraphs
- Use bullet points or numbered lists when helpful
"""
    
    return base_prompt


async def generate_response(request: LLMQueryRequest) -> LLMQueryResponse:
    """
    Generate a response using Gemini LLM based on the query request
    """
    try:
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
        
        return LLMQueryResponse(
            answer=answer,
            question=request.question,
            difficulty=request.difficulty,
            language=request.language
        )
    
    except Exception as e:
        logger.error(f"Error generating Gemini response: {str(e)}")
        raise Exception(f"Failed to generate response: {str(e)}")


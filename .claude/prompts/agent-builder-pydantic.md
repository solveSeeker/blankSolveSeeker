# Construir Agentes con Pydantic AI

Guía para construir agentes IA con Pydantic AI + OpenRouter en backend Python.

---

## Cuándo Usar

- Backend FastAPI con capacidades IA
- Necesitas seguridad de tipos y validación estricta
- Quieres reintentos automáticos en respuestas malformadas del LLM
- Creando agentes con herramientas personalizadas

---

## Inicio Rápido

### Instalación

```bash
pip install pydantic-ai httpx pydantic python-dotenv
```

### Variables de Entorno

```bash
OPENROUTER_API_KEY=sk-or-v1-...
FRONTEND_URL=http://localhost:3000
```

---

## Patrón Básico

```python
from pydantic_ai import Agent
from pydantic import BaseModel

class AgentResponse(BaseModel):
    result: str
    confidence: float

agent = Agent(
    model='openrouter:openai/gpt-4o',
    output_type=AgentResponse,
    system_prompt="You are a helpful AI assistant."
)

# Uso
result = await agent.run("user message")
```

---

## Definición de Herramientas

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, Tool

class GenerateImageArgs(BaseModel):
    prompt: str = Field(description="Descripción de la imagen")
    num_images: int = Field(ge=1, le=10, default=1)

async def generate_image_tool(args: GenerateImageArgs) -> dict:
    # Tu implementación
    return {"images": [...]}

agent.add_tool(
    Tool(
        name="generate_image",
        description="Genera imágenes usando IA",
        parameters=GenerateImageArgs,
        execute=generate_image_tool
    )
)
```

---

## Integración FastAPI

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    history: list = []

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        result = await agent.run(
            request.message,
            context={"history": request.history}
        )
        return {"response": result.result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Manejo de Errores y Reintentos

```python
from pydantic_ai import Agent, RetryConfig

agent = Agent(
    model='openrouter:openai/gpt-4o',
    retry_config=RetryConfig(
        max_retries=3,
        retry_on=[ValidationError, TimeoutError]
    )
)
```

---

## Mejores Prácticas

1. **Seguridad de Tipos**: Siempre definir modelos Pydantic para entradas/salidas
2. **Reintentos Automáticos**: Configurar lógica de reintentos para robustez
3. **Logging**: Agregar logging estructurado
4. **Pruebas**: Escribir tests con pytest para comportamientos del agente
5. **Contexto**: Pasar dict de contexto para conversaciones con estado

---

## Recursos

- [Pydantic AI Docs](https://ai.pydantic.dev)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from openai import OpenAI
import uvicorn
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# Set up SQLite
DATABASE_URL = "sqlite:///./fridgechef.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    name = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# Request Models
class IngredientInput(BaseModel):
    user_id: int
    ingredients: list[str]

class RecipeRequest(BaseModel):
    user_id: int

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OpenAI client (initialize with env var key)
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY is not set! Add it to your .env file or set it in your environment.")
client = OpenAI(api_key=api_key)

# Store ingredients
@app.post("/store_ingredients/")
def store_ingredients(data: IngredientInput, db: Session = Depends(get_db)):
    for item in data.ingredients:
        db.add(Ingredient(user_id=data.user_id, name=item))
    db.commit()
    return {"message": "Ingredients saved", "ingredients": data.ingredients}

# Get ingredients
@app.get("/get_ingredients/{user_id}")
def get_ingredients(user_id: int, db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user_id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")
    return {"ingredients": [ing.name for ing in ingredients]}

# Generate recipe (Single OpenAI Request)
@app.post("/generate_recipe/")
def generate_recipe(request: RecipeRequest, db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == request.user_id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")

    ingredient_list = ", ".join([ing.name for ing in ingredients])
    prompt = f"Suggest a simple, tasty recipe using: {ingredient_list}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[{"role": "user", "content": prompt}]
        )
        recipe = response.choices[0].message.content
        return {"recipe": recipe}
    except Exception as e:
        logger.error(f"OpenAI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")


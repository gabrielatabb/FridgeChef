from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from openai import OpenAI
import uvicorn
import os
import logging
from dotenv import load_dotenv
import secrets

# Load environment variables
load_dotenv()

app = FastAPI()

DATABASE_URL = "sqlite:///./fridgechef.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBasic()

# Define Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class Ingredient(Base):
    __tablename__ = "ingredients"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    name = Column(String)

class GeneratedRecipe(Base):
    __tablename__ = "generated_recipes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    recipe_text = Column(String)

Base.metadata.create_all(bind=engine)

# Pydantic models
class RegisterInput(BaseModel):
    username: str
    password: str

class IngredientInput(BaseModel):
    ingredients: list[str]

class AcceptRecipeRequest(BaseModel):
    accept: bool

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth helper
def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user and secrets.compare_digest(user.password, credentials.password):
        return user
    raise HTTPException(status_code=401, detail="Invalid credentials")

# OpenAI setup
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not set!")
client = OpenAI(api_key=api_key)

# Register new user
@app.post("/register")
def register_user(data: RegisterInput, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(username=data.username, password=data.password)
    db.add(user)
    db.commit()
    return {"message": "User registered"}

# Login check
@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user and secrets.compare_digest(user.password, credentials.password):
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Store ingredients
@app.post("/store_ingredients/")
def store_ingredients(data: IngredientInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for item in data.ingredients:
        db.add(Ingredient(user_id=user.id, name=item))
    db.commit()
    return {"message": "Ingredients saved", "ingredients": data.ingredients}

# Get ingredients
@app.get("/get_ingredients/")
def get_ingredients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user.id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")
    return {"ingredients": [ing.name for ing in ingredients]}

# Generate recipe
@app.post("/generate_recipe/")
def generate_recipe(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user.id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")

    ingredient_list = ", ".join([ing.name for ing in ingredients])
    prompt = f"Suggest a simple, tasty recipe using ONLY: {ingredient_list}. Not every ingredient needs to be used. Make it something a sane person would eat."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[{"role": "user", "content": prompt}]
        )
        recipe_text = response.choices[0].message.content

        new_recipe = GeneratedRecipe(user_id=user.id, recipe_text=recipe_text)
        db.add(new_recipe)
        db.commit()

        return {
            "message": "Recipe generated. Accept or request a new one.",
            "recipe": recipe_text
        }

    except Exception as e:
        logger.error(f"OpenAI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

# Accept or reject recipe
@app.post("/accept_recipe/")
def accept_recipe(request: AcceptRecipeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    latest_recipe = db.query(GeneratedRecipe).filter(
        GeneratedRecipe.user_id == user.id
    ).order_by(GeneratedRecipe.id.desc()).first()

    if not latest_recipe:
        raise HTTPException(status_code=404, detail="No recipe found. Generate one first.")

    recipe_text = latest_recipe.recipe_text.lower()

    if request.accept:
        all_ingredients = db.query(Ingredient).filter(
            Ingredient.user_id == user.id
        ).all()

        used = []
        kept = []

        for ing in all_ingredients:
            if ing.name.lower() in recipe_text:
                db.delete(ing)
                used.append(ing.name)
            else:
                kept.append(ing.name)

        db.commit()
        db.delete(latest_recipe)
        db.commit()

        return {
            "message": "Recipe accepted. Used ingredients removed.",
            "recipe": latest_recipe.recipe_text,
            "ingredients_removed": used,
            "ingredients_kept": kept
        }

    else:
        db.delete(latest_recipe)
        db.commit()
        return generate_recipe(user, db)

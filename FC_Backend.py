import openai
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import uvicorn
import logging

# Initialize FastAPI
app = FastAPI()

# Set up SQLite database
DATABASE_URL = "sqlite:///./fridgechef.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

# Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)

# Define Ingredient Model
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

# Dependency: Get DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Store Ingredients
@app.post("/store_ingredients/")
def store_ingredients(data: IngredientInput, db: Session = Depends(get_db)):
    for item in data.ingredients:
        db.add(Ingredient(user_id=data.user_id, name=item))
    db.commit()
    return {"message": "Ingredients saved", "ingredients": data.ingredients}

# Get Ingredients
@app.get("/get_ingredients/{user_id}")
def get_ingredients(user_id: int, db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user_id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")
    return {"ingredients": [ing.name for ing in ingredients]}

# openai.api_key = "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"  
# @app.post("/generate_recipe/")
# def generate_recipe(request: RecipeRequest, db: Session = Depends(get_db)):
#     ingredients = db.query(Ingredient).filter(Ingredient.user_id == request.user_id).all()
#     if not ingredients:
#         raise HTTPException(status_code=404, detail="No ingredients found")

#     ingredient_list = ", ".join([ing.name for ing in ingredients])
#     prompt = f"Suggest a recipe using: {ingredient_list}"

#     response = openai.ChatCompletion.create(
#         model="gpt-4",
#         messages=[{"role": "user", "content": prompt}]
#     )
    
#     return {"recipe": response.choices[0].message['content']}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

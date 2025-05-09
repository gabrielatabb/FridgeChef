from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from openai import OpenAI
import uvicorn
import os
import logging
from dotenv import load_dotenv
load_dotenv()
import secrets

app = FastAPI()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY not set!")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./fridgechef.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)
Base = declarative_base()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

security = HTTPBasic()

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

class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    recipe_text = Column(String)

class NonConsumable(Base): #New class for pots, spices, ETC
    __tablename__ = "non_consumables"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    name = Column(String)

class NonConsumableInput(BaseModel):
    non_consumables: list[str]

class RegisterInput(BaseModel):
    username: str
    password: str

class IngredientInput(BaseModel):
    ingredients: list[str]

class AcceptRecipeRequest(BaseModel):
    accept: bool

class RecipeRequest(BaseModel):
    prompt: str

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user and secrets.compare_digest(user.password, credentials.password):
        return user
    raise HTTPException(status_code=401, detail="Invalid credentials")

client = OpenAI(api_key=api_key)

@app.post("/register") #Register a new user 
def register_user(data: RegisterInput, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists") #Check to see if the username exists already
    user = User(username=data.username, password=data.password)
    db.add(user)
    db.commit()
    return {"message": "User registered"}

@app.post("/login") #Simple login function.
def login(credentials: HTTPBasicCredentials = Depends(security), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if user and secrets.compare_digest(user.password, credentials.password):
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/store_ingredients/")
def store_ingredients(data: IngredientInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for item in data.ingredients:
        db.add(Ingredient(user_id=user.id, name=item)) #Add ingredients to the database BY user ensuring compliant with security practices.
    db.commit()
    return {"message": "Ingredients saved", "ingredients": data.ingredients}

@app.get("/get_ingredients/")
def get_ingredients(user: User = Depends(get_current_user), db: Session = Depends(get_db)): #Simply get the ingredients, this was used for testing originally but now generates the list on front-end.
    ingredients = db.query(Ingredient).filter(Ingredient.user_id == user.id).all()
    if not ingredients:
        raise HTTPException(status_code=404, detail="No ingredients found")
    return {"ingredients": [ing.name for ing in ingredients]}

@app.post("/generate_recipe/") #Recipe generation, sends prompt, ingredients, and "non-perishables" to GPT-3.5
def generate_recipe(
    request: RecipeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ingredients = db.query(Ingredient).filter(
        Ingredient.user_id == user.id,
        Ingredient.name.isnot(None),
        Ingredient.name != ''
    ).all()

    if not ingredients:
        raise HTTPException(status_code=404, detail="No valid ingredients found, please add ingredients to the list and then enter a new prompt!")

    ingredient_list = ", ".join([ing.name for ing in ingredients])
    tools = db.query(NonConsumable).filter(NonConsumable.user_id == user.id).all()
    tool_list = ", ".join([tool.name for tool in tools])
    prompt = (
        f"User request: {request.prompt}\n" #I'm not sure if this is the best practice but I found this was the best "script" to send to GPT
        f"Available ingredients: {ingredient_list}\n"
        f"Available tools and spices: {tool_list}\n"
        "Respond with a recipe that fits the request, uses some of the available ingredients (not all required), BUT only use the ingredients, tools, and spices available to you in the list. The recipe can be "
        "as simple or as complex as you need it to be and includes health and nutritional information.\n"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=[{"role": "user", "content": prompt}]
        )
        recipe_text = response.choices[0].message.content

        new_recipe = GeneratedRecipe(user_id=user.id, recipe_text=recipe_text) #Recipe saved with userID for security.
        db.add(new_recipe)
        db.commit()

        return {
            "message": "Recipe generated. Accept or request a new one.",
            "recipe": recipe_text
        }

    except Exception as e:
        logger.error(f"OpenAI error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")

@app.post("/accept_recipe/")
def accept_recipe(request: AcceptRecipeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    latest_recipe = db.query(GeneratedRecipe).filter(
        GeneratedRecipe.user_id == user.id
    ).order_by(GeneratedRecipe.id.desc()).first()

    if not latest_recipe:
        raise HTTPException(status_code=404, detail="No recipe found. Generate one first.")

    recipe_text = latest_recipe.recipe_text.lower()

    if request.accept: #Clear used ingredients to fulfill request.
        all_ingredients = db.query(Ingredient).filter(Ingredient.user_id == user.id).all()
        used, kept = [], []

        for ing in all_ingredients:
            if ing.name.lower() in recipe_text:
                db.delete(ing)
                used.append(ing.name)
            else:
                kept.append(ing.name)

        saved = SavedRecipe(user_id=user.id, recipe_text=latest_recipe.recipe_text)
        db.add(saved)

        db.delete(latest_recipe)
        db.commit()

        return {
            "message": "Recipe accepted. Ingredients removed and recipe saved. Enter another prompt!",
            "recipe": latest_recipe.recipe_text,
            "ingredients_removed": used,
            "ingredients_kept": kept
        }
    db.delete(latest_recipe)
    db.commit()
    return {"message": "Okay! Recipe will not be saved and ingredients will not be removed. Please enter another prompt!"}


@app.get("/get_saved_recipes/") #For output to front-end
def get_saved_recipes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    recipes = db.query(SavedRecipe).filter(SavedRecipe.user_id == user.id).all()
    return {"recipes": [r.recipe_text for r in recipes]}


@app.delete("/delete_ingredient/{ingredient_name}")
def delete_ingredient(ingredient_name: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(
        Ingredient.user_id == user.id,
        Ingredient.name.ilike(ingredient_name)
    ).first()

    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    db.delete(ingredient)
    db.commit()

    return {"message": f"Ingredient '{ingredient_name}' deleted."}



@app.post("/store_non_consumables/") #same as ingredient storage, non-consumable new database member
def store_non_consumables(data: NonConsumableInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for item in data.non_consumables:
        db.add(NonConsumable(user_id=user.id, name=item))
    db.commit()
    return {"message": "Non-consumables saved", "items": data.non_consumables}


@app.get("/get_non_consumables/")
def get_non_consumables(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(NonConsumable).filter(NonConsumable.user_id == user.id).all()
    return {"non_consumables": [i.name for i in items]}

@app.delete("/delete_non_consumable/{item_name}")
def delete_non_consumable(item_name: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(NonConsumable).filter(
        NonConsumable.user_id == user.id,
        NonConsumable.name.ilike(item_name)
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"message": f"Non-consumable '{item_name}' deleted."}
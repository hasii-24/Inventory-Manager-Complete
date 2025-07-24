from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pymongo
from bson import ObjectId

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Use MongoDB URI from environment
MONGO_URI = os.environ.get("MONGO_URI")
client = pymongo.MongoClient(MONGO_URI)
db = client["inventoryDB"]
products = db["products"]
orders = db["orders"]

@app.route('/predict', methods=['GET'])
def predict_stock():
    # Step 1: Get all products
    products = list(db.products.find({}, {"_id": 0, "name": 1, "quantity": 1}))

    # Step 2: Aggregate purchases based on productName
    pipeline = [
        {"$group": {
            "_id": "$productName",
            "totalPurchased": {"$sum": "$quantity"}
        }}
    ]
    purchases = list(db.orders.aggregate(pipeline))

    # Step 3: Map productName to totalPurchased
    purchased_map = {p["_id"]: p["totalPurchased"] for p in purchases}

    # Step 4: Combine product data with purchased data
    result = []
    for product in products:
        name = product["name"]
        available = product["quantity"]
        purchased = purchased_map.get(name, 0)

        result.append({
            "name": name,
            "available": available,
            "purchased": purchased
        })

    return jsonify(result)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))  # Render provides PORT env var
    app.run(host="0.0.0.0", port=port, debug=True)


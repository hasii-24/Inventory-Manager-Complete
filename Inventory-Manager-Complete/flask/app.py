from flask import Flask, jsonify
from flask_cors import CORS
import pymongo
from bson import ObjectId

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient("mongodb://localhost:27017/")
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
if __name__ == '__main__':
    app.run(port=5001, debug=True)

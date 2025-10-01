// Create collections

db.createCollection ("users") ;
db.createCollection ("categories"); 
db.createCollection ("products");
db.createCollection ("orders");

// Insert to collections

db.users.insertMany([
  {
    "_id": 1,
    "first_name": "Oluwasegun",
    "last_name": "Adedeji",
    "email": "oluwasheges@gmail.com",
    "phone": "08132638235",
    "role": "user",
    "is_active": true,
    "password_hash": "123456789",
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 2,
    "first_name": "Abiola",
    "last_name": "Adedeji",
    "email": "oluwasegunadedeji@yahoo.com",
    "phone": "08132638235",
    "role": "admin",
    "is_active": true,
    "password_hash": "123456789",
    "created_at": new Date(),
    "updated_at": null
  }
]);

db.categories.insertMany([
  {
    "_id": 1,
    "name": "Shirt",
    "description": "Men shirt",
    "is_active": true,
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 2,
    "name": "Trouser",
    "description": "Men Trousers",
    "is_active": true,
    "created_at": new Date(),
    "updated_at": null
  }
]);

// INSERT PRODUCTS WITH EMBEDDED SKUs

db.products.insertMany([
  {
    "_id": 1,
    "name": "Classic Oxford Button-Down Shirt",
    "description": "Elevate your everyday style with this timeless Oxford button-down shirt. Crafted from premium cotton blend fabric, it features a tailored fit that looks sharp whether tucked or untucked.",
    "is_active": true,
    "category_id": 1,
    "image_url": null,
    "created_by": 2,
    "skus": [
      {
        "sku_id": "SKU-SHIRT-SM-WHT",
        "size": "small",
        "colour": "White",
        "cost_price": 1500.00,
        "sell_price": 2500.00,
        "quantity": 50,
        "reorder_level": 10,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      },
      {
        "sku_id": "SKU-SHIRT-MD-WHT",
        "size": "medium",
        "colour": "White",
        "cost_price": 1500.00,
        "sell_price": 2500.00,
        "quantity": 75,
        "reorder_level": 15,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      },
      {
        "sku_id": "SKU-SHIRT-LG-WHT",
        "size": "large",
        "colour": "White",
        "cost_price": 1500.00,
        "sell_price": 2500.00,
        "quantity": 40,
        "reorder_level": 10,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 2,
    "name": "Slim Fit Dress Shirt",
    "description": "Modern slim fit dress shirt perfect for formal occasions",
    "is_active": true,
    "category_id": 1,
    "image_url": "https://example.com/dress-shirt.jpg",
    "created_by": 2,
    "skus": [
      {
        "sku_id": "SKU-DRESS-SM-WHT",
        "size": "small",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 25,
        "reorder_level": 8,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      },
      {
        "sku_id": "SKU-DRESS-MD-WHT",
        "size": "medium",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 35,
        "reorder_level": 10,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 3,
    "name": "Casual Chino Trousers",
    "description": "Comfortable cotton chino trousers for everyday wear",
    "is_active": true,
    "category_id": 2,
    "image_url": null,
    "created_by": 2,
    "skus": [
      {
        "sku_id": "SKU-TRO-SM-WHT",
        "size": "small",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 25,
        "reorder_level": 8,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      },
      {
        "sku_id": "SKU-TRO-MD-WHT",
        "size": "medium",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 35,
        "reorder_level": 10,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 4,
    "name": "Casual Chino Trousers",
    "description": "Professional black trousers with wrinkle-resistant fabric",
    "is_active": true,
    "category_id": 2,
    "image_url": "https://example.com/tro-shirt.jpg",
    "created_by": 2,
    "skus": [
      {
        "sku_id": "SKU-TRO-SM-WHT",
        "size": "small",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 25,
        "reorder_level": 8,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      },
      {
        "sku_id": "SKU-TRO-MD-WHT",
        "size": "medium",
        "colour": "White",
        "cost_price": 1800.00,
        "sell_price": 3000.00,
        "quantity": 35,
        "reorder_level": 10,
        "is_active": true,
        "added_by": 2,
        "created_at": new Date(),
        "updated_at": null
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  },
]);

// INSERT ORDERS WITH EMBEDDED ITEMS

db.orders.insertMany([
  {
    "_id": 1,
    "order_number": "ORD-2025-0001",
    "customer_id": 1,
    "order_status": "pending",
    "total_amount": 9000.00,
    "order_note": "Need these items for office uniform",
    "approved_by": null,
    "approved_at": null,
    "rejection_notes": null,
    "items": [
      {
        "order_item_id": "ITEM-001-001",
        "product_id": 1,
        "sku_id": 1,
        "quantity": 2,
        "unit_price": 2500.00,
        "cost_price": 1500.00,
        "profit": 1000.00,
        "sub_total": 5000.00
      },
      {
        "order_item_id": "ITEM-001-002",
        "product_id": 1,
        "sku_id": 2,
        "quantity": 1,
        "unit_price": 3500.00,
        "cost_price": 2000.00,
        "profit": 1500.00,
        "sub_total": 3500.00
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  },
  {
    "_id": 2,
    "order_number": "ORD-2025-0002",
    "customer": 2,
    "order_status": "approved",
    "total_amount": 7000.00,
    "order_note": "Urgent order for event",
    "approved_by": 2,
    "approved_at": new Date(),
    "rejection_notes": null,
    "items": [
      {
        "order_item_id": "ITEM-002-001",
        "product": 1,
        "sku": 1,
        "quantity": 2,
        "unit_price": 2500.00,
        "cost_price": 1500.00,
        "profit": 1000.00,
        "sub_total": 5000.00
      }
    ],
    "created_at": new Date(),
    "updated_at": null
  }
]);


// QUERY DATABASE

db.products.find({"is_active": true});
db.users.find({"role": "admin"});
db.orders.find({"order_number": "ORD-2025-0001"});

// UPDATE

db.products.updateOne(
  { "_id": 2 },
  {
    $set: {
      "is_active": false,
      "skus.$[].is_active": false,
      "updated_at": new Date()
    }
  }
);

db.orders.updateOne(
  {
    "order_number": "ORD-2025-0001",
    "order_status": "pending"
  },
  {
    $set: {
      "order_status": "approved",
      "approved_by": 2,
      "approved_at": new Date(),
      "updated_at": new Date()
    }
  }
)

// DELETE

db.orders.deleteOne({
  "order_number": "ORD-2025-0001"
});

db.categories.deleteOne({
  "_id": 2
})

// QUERY USING LOOKUP

db.products.aggregate([
  {
    $lookup: {
      from: "categories",
      localField: "category_id",
      foreignField: "_id",
      as: "category_details"
    }
  },
  {
    $unwind: "$category_details"
  },
  {
    $project: {
      "product_name": "$name",
      "description": "$description",
      "category_name": "$category_details.name",
      "category_description": "$category_details.description",
      "is_active": "$is_active",
      "created_at": "$created_at"
    }
  }
]);

db.products.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "created_by",
      foreignField: "_id",
      as: "creator"
    }
  },
  {
    $unwind: "$creator"
  },
  {
    $project: {
      "product_name": "$name",
      "description": "$description",
      "created_by_name": {
        $concat: ["$creator.first_name", " ", "$creator.last_name"]
      },
      "creator_role": "$creator.role",
      "created_at": "$created_at"
    }
  }
])
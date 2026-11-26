const foodCategories = {

    breakfast: [
        "Poha", "Kanda Poha", "Vegetable Upma",
        "Suji Upma", "Oats Porridge", "Masala Oats",
        "Dalia", "Vegetable Dalia", "Besan Chilla",
        "Moong Dal Chilla", "Bread Butter",
        "Bread Jam", "Bread Pakora", "French Toast",
        "Vegetable Sandwich", "Grilled Sandwich",
        "Cheese Sandwich", "Cornflakes", "Muesli",
        "Pancakes", "Sprouts Chaat", "Sabudana Khichdi",
        "Sabudana Vada", "Masala Omelette", "Boiled Eggs"
    ],

    rotiAndParatha: [
        "Plain Roti", "Butter Roti", "Tandoori Roti",
        "Missi Roti", "Makki Ki Roti", "Bajra Roti",
        "Jowar Roti", "Rumali Roti", "Ragi Roti",
        "Plain Paratha", "Aloo Paratha", "Gobhi Paratha",
        "Paneer Paratha", "Mooli Paratha", "Methi Paratha",
        "Onion Paratha", "Lachha Paratha", "Ajwain Paratha",
        "Plain Naan", "Butter Naan", "Garlic Naan",
        "Cheese Naan", "Puri", "Bhatura", "Amritsari Kulcha"
    ],

    vegetableSabzi: [
        "Aloo Gobhi", "Aloo Matar", "Aloo Jeera",
        "Aloo Palak", "Bhindi Masala", "Bhindi Fry",
        "Baingan Bharta", "Bharwa Baingan", "Lauki Sabzi",
        "Tinda Sabzi", "Tori Sabzi", "Karela Sabzi",
        "Kadhi Pakora", "Sarson Ka Saag", "Palak Sabzi",
        "Mix Vegetable", "Gajar Matar", "Patta Gobhi",
        "Mushroom Masala", "Matar Mushroom", "Dum Aloo",
        "Aloo Beans", "Kathal Sabzi", "Arbi Masala",
        "Soya Chunks Curry"
    ],

    paneerAndCurry: [
        "Shahi Paneer", "Kadai Paneer", "Palak Paneer",
        "Matar Paneer", "Paneer Butter Masala",
        "Paneer Tikka Masala", "Paneer Bhurji",
        "Malai Kofta", "Vegetable Kofta", "Lauki Kofta",
        "Navratan Korma", "Chana Masala", "Punjabi Chole",
        "Rajma Curry", "White Chana Curry",
        "Kala Chana Curry", "Soya Chaap Curry",
        "Malai Chaap", "Masala Chaap", "Achari Chaap",
        "Paneer Tikka", "Achari Paneer", "Paneer Lababdar",
        "Paneer Do Pyaza", "Methi Malai Matar"
    ],

    dalAndRice: [
        "Dal Makhani", "Dal Tadka", "Dal Fry",
        "Moong Dal", "Masoor Dal", "Chana Dal", "Urad Dal",
        "Arhar Dal", "Mixed Dal", "Panchmel Dal",
        "Steamed Rice", "Jeera Rice", "Vegetable Pulao",
        "Peas Pulao", "Kashmiri Pulao", "Vegetable Biryani",
        "Paneer Biryani", "Moong Dal Khichdi",
        "Masala Khichdi", "Curd Rice", "Lemon Rice",
        "Tomato Rice", "Coconut Rice", "Rajma Chawal",
        "Kadhi Chawal"
    ],

    southIndian: [
        "Plain Dosa", "Masala Dosa", "Cheese Dosa",
        "Paneer Dosa", "Rava Dosa", "Mysore Masala Dosa",
        "Paper Dosa", "Neer Dosa", "Set Dosa",
        "Idli", "Rava Idli", "Masala Idli",
        "Medu Vada", "Sambar Vada", "Rasam",
        "Sambar", "Onion Uttapam", "Vegetable Uttapam",
        "Appam", "Puttu", "Idiyappam", "Ven Pongal",
        "Avial", "Malabar Parotta", "Pesarattu"
    ],

    streetFood: [
        "Samosa", "Aloo Tikki", "Chole Tikki",
        "Pani Puri", "Dahi Puri", "Sev Puri",
        "Bhel Puri", "Papdi Chaat", "Dahi Bhalla",
        "Dahi Kachori", "Raj Kachori", "Pyaz Kachori",
        "Dal Kachori", "Pav Bhaji", "Vada Pav",
        "Dabeli", "Chole Bhature", "Chole Kulche",
        "Ram Laddu", "Vegetable Pakora", "Paneer Pakora",
        "Onion Pakora", "Mirchi Bajji", "Corn Chaat",
        "Masala Peanut Chaat"
    ],

    fastFood: [
        "Margherita Pizza", "Farmhouse Pizza",
        "Paneer Pizza", "Corn Pizza", "Cheese Pizza",
        "Vegetable Burger", "Aloo Tikki Burger",
        "Paneer Burger", "Cheese Burger", "Chicken Burger",
        "French Fries", "Peri Peri Fries", "Potato Wedges",
        "Garlic Bread", "Cheese Garlic Bread",
        "Vegetable Wrap", "Paneer Wrap", "Chicken Wrap",
        "Vegetable Roll", "Paneer Roll", "Egg Roll",
        "Chicken Roll", "Vegetable Cutlet",
        "Cheese Balls", "Nachos"
    ],

    chineseAndPasta: [
        "Steamed Momos", "Fried Momos", "Tandoori Momos",
        "Kurkure Momos", "Paneer Momos", "Chicken Momos",
        "Vegetable Chowmein", "Hakka Noodles",
        "Schezwan Noodles", "Singapore Noodles",
        "Vegetable Fried Rice", "Schezwan Fried Rice",
        "Egg Fried Rice", "Vegetable Manchurian",
        "Chilli Paneer", "Chilli Potato",
        "Honey Chilli Potato", "Spring Rolls",
        "Plain Maggi", "Vegetable Maggi", "Cheese Maggi",
        "Schezwan Maggi", "White Sauce Pasta",
        "Red Sauce Pasta", "Pink Sauce Pasta"
    ],

    nonVegetarian: [
        "Butter Chicken", "Kadai Chicken", "Chicken Curry",
        "Chicken Tikka", "Tandoori Chicken",
        "Chicken Malai Tikka", "Chicken Biryani",
        "Chicken Korma", "Chicken Do Pyaza",
        "Chicken Seekh Kebab", "Chicken 65",
        "Chilli Chicken", "Chicken Lollipop",
        "Fried Chicken", "Chicken Nuggets",
        "Mutton Curry", "Mutton Biryani", "Mutton Korma",
        "Rogan Josh", "Mutton Seekh Kebab",
        "Fish Curry", "Fish Fry", "Fish Tikka",
        "Prawn Curry", "Egg Curry"
    ],

    regionalFood: [
        "Dhokla", "Khandvi", "Thepla", "Fafda",
        "Handvo", "Gujarati Undhiyu", "Gujarati Kadhi",
        "Dal Baati Churma", "Gatte Ki Sabzi", "Ker Sangri",
        "Bajra Khichdi", "Litti Chokha", "Sattu Paratha",
        "Aloo Posto", "Shukto", "Misal Pav", "Usal Pav",
        "Puran Poli", "Thalipeeth", "Pitla Bhakri",
        "Siddu", "Himachali Chana Madra", "Kashmiri Haak",
        "Assamese Masor Tenga", "Naga Smoked Pork"
    ],

    sweetsAndDesserts: [
        "Gulab Jamun", "Rasgulla", "Rasmalai",
        "Jalebi", "Imarti", "Rabri", "Kaju Katli",
        "Milk Cake", "Kalakand", "Besan Laddu",
        "Boondi Laddu", "Motichoor Laddu",
        "Coconut Laddu", "Gajar Ka Halwa",
        "Suji Halwa", "Moong Dal Halwa", "Kheer",
        "Phirni", "Malpua", "Balushahi", "Gujiya",
        "Peda", "Soan Papdi", "Chocolate Brownie",
        "Chocolate Cake"
    ],

    fruitsAndHealthyFood: [
        "Apple", "Banana", "Mango", "Orange",
        "Papaya", "Watermelon", "Muskmelon",
        "Guava", "Pomegranate", "Pineapple",
        "Grapes", "Strawberries", "Kiwi", "Pear",
        "Litchi", "Chikoo", "Dragon Fruit",
        "Custard Apple", "Jamun", "Fruit Salad",
        "Green Salad", "Cucumber Salad",
        "Roasted Makhana", "Roasted Chana", "Mixed Dry Fruits"
    ],

    beveragesAndIceCream: [
        "Masala Tea", "Green Tea", "Black Tea",
        "Hot Coffee", "Cold Coffee", "Plain Milk",
        "Turmeric Milk", "Badam Milk", "Sweet Lassi",
        "Salted Lassi", "Buttermilk", "Fresh Lime Soda",
        "Sugarcane Juice", "Orange Juice", "Mango Shake",
        "Banana Shake", "Chocolate Milkshake",
        "Strawberry Shake", "Vanilla Ice Cream",
        "Chocolate Ice Cream", "Butterscotch Ice Cream",
        "Strawberry Ice Cream", "Mango Ice Cream",
        "Malai Kulfi", "Kesar Pista Kulfi"
    ]

};

const foodLabels = Object.values(foodCategories).flat();

module.exports = { foodCategories, foodLabels };
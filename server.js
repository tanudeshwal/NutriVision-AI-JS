const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { foodCategories, foodLabels } = require("./foodLabels");
const { getNutrition } = require("./nutrition");
const { calculateHealthScore } = require("./healthScore");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
    throw new Error("Missing required environment variables.");
}

if (isProduction) {
    app.set("trust proxy", 1);
}

// SECURITY CONFIGURATION

app.use(
    helmet({
        contentSecurityPolicy: false,
        strictTransportSecurity: isProduction ? undefined : false
    })
);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many login attempts. Please try again later."
});

const analysisLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many food analysis requests. Please try again later."
});

// MONGODB CONNECTION

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch(error => {
        console.error("MongoDB Connection Error:", error.message);
    });

// FOOD HISTORY MODEL

const foodHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    foodName: {
        type: String,
        required: true
    },

    originalPrediction: String,
    confidence: Number,
    serving: String,

    quantity: {
        type: Number,
        default: 1
    },

    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    healthScore: Number,
    healthRating: String,

    mealType: {
        type: String,
        enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
        default: "Snacks"
    }

}, {
    timestamps: true
});

foodHistorySchema.index({
    userId: 1,
    createdAt: -1
});

const FoodHistory = mongoose.model(
    "FoodHistory",
    foodHistorySchema
);

// UPDATED FOOD DESCRIPTIONS

const foodDescriptions = {

    "Steamed Momos": "white steamed dumplings with pleated dough",

    "Fried Momos": "golden brown deep fried dumplings",

    "Tandoori Momos": "red orange grilled dumplings",

    "Kurkure Momos": "crispy crunchy coated fried dumplings",

    "Paneer Momos": "steamed dumplings stuffed with cottage cheese",

    "Chicken Momos": "steamed dumplings stuffed with chicken",

    "Pani Puri": "crispy hollow round shells with spicy water",

    "Dahi Puri": "crispy round hollow shells filled with yogurt",

    "Sev Puri": "crispy flat puri topped with sev and chutney",

    "Bhel Puri": "Indian puffed rice snack with vegetables",

    "Dahi Bhalla": "soft lentil fritters covered with yogurt",

    "Plain Dosa": "South Indian long thin golden brown crispy rolled rice crepe served with sambar and coconut chutney",

    "Masala Dosa": "South Indian large golden brown crispy rolled rice crepe with potato masala filling served with sambar and coconut chutney",

    "Rava Dosa": "South Indian thin crispy semolina crepe with small holes and net-like texture",

    "Idli": "round white steamed rice cakes",

    "Medu Vada": "fried lentil doughnut with a hole",

    "Sambar": "South Indian lentil vegetable stew",

    "Samosa": "triangular golden fried pastry stuffed with potatoes",

    "Aloo Tikki": "round fried potato patties",

    "Pav Bhaji": "two soft square buttered bread buns served with thick mashed orange vegetable curry chopped onions and lemon",

    "Vada Pav": "Indian bread bun with fried potato fritter",

    "Poha": "yellow flattened rice with peanuts and vegetables",

    "Vegetable Upma": "cooked semolina with vegetables",

    "Besan Chilla": "yellow chickpea flour pancake",

    "Moong Dal Chilla": "yellow lentil pancake",

    "Aloo Paratha": "Indian flatbread stuffed with potatoes",

    "Paneer Paratha": "Indian flatbread stuffed with cottage cheese",

    "Plain Roti": "round thin whole wheat Indian flatbread",

    "Butter Naan": "soft oval Indian bread with butter",

    "Puri": "round puffed golden fried Indian bread",

    "Bhatura": "large fluffy deep fried Indian bread",

    "Chole Bhature": "fluffy fried bread served with chickpea curry",

    "Shahi Paneer": "cottage cheese cubes in creamy orange gravy",

    "Palak Paneer": "cottage cheese cubes in green spinach gravy",

    "Matar Paneer": "cottage cheese cubes and peas in curry",

    "Kadai Paneer": "cottage cheese with capsicum and tomato gravy",

    "Paneer Tikka": "grilled cottage cheese cubes with vegetables",

    "Dal Makhani": "creamy dark black lentil curry",

    "Dal Tadka": "yellow lentil curry with tempered spices",

    "Rajma Chawal": "red kidney bean curry served with white rice",

    "Kadhi Chawal": "yellow yogurt curry served with white rice",

    "Vegetable Biryani": "spiced long grain rice with vegetables",

    "Vegetable Chowmein": "stir fried noodles with vegetables",

    "Plain Maggi": "yellow instant cooked noodles",

    "Vegetable Maggi": "instant noodles with vegetables",

    "Spring Rolls": "small golden brown deep fried cylindrical pastry rolls stuffed with chopped vegetables",

    "White Sauce Pasta": "pasta in creamy white cheese sauce",

    "Red Sauce Pasta": "pasta in red tomato sauce",

    "Pink Sauce Pasta": "pasta in pink creamy tomato sauce",

    "Margherita Pizza": "round pizza with tomato sauce and mozzarella",

    "Farmhouse Pizza": "pizza topped with mixed vegetables",

    "Vegetable Burger": "burger bun with vegetable patty and lettuce",

    "French Fries": "thin golden fried potato sticks",

    "Gulab Jamun": "round brown sweet balls soaked in sugar syrup",

    "Rasgulla": "round white soft Indian sweets in sugar syrup",

    "Jalebi": "orange spiral shaped Indian sweet",

    "Rasmalai": "soft white cheese patties in sweet milk",

    "Gajar Ka Halwa": "orange grated carrot Indian dessert",

    "Kheer": "Indian rice pudding with milk and nuts",

    "Vanilla Ice Cream": "white vanilla ice cream scoops",

    "Chocolate Ice Cream": "brown chocolate ice cream scoops",

    "Butterscotch Ice Cream": "golden beige caramel ice cream scoops",

    "Strawberry Ice Cream": "pink strawberry ice cream scoops"

};

// AI MODEL CONFIGURATION

let classifierPromise;

async function loadAIModel() {

    if (!classifierPromise) {

        classifierPromise = (async () => {

            console.log("Loading AI Food Recognition Model...");

            const { pipeline } = await import(
                "@huggingface/transformers"
            );

            const classifier = await pipeline(
                "zero-shot-image-classification",
                "Xenova/clip-vit-base-patch32",
                {
                    dtype: "q8"
                }
            );

            console.log("AI Model Loaded Successfully!");

            return classifier;

        })().catch(error => {

            classifierPromise = null;

            throw error;

        });

    }

    return classifierPromise;

}

// IMAGE UPLOAD CONFIGURATION

const uploadDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true
    });
}

const upload = multer({

    dest: uploadDirectory,

    limits: {
        fileSize: 8 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error(
                "Only JPG, PNG and WEBP images are allowed."
            ));
        }

    }

});

// VIEW ENGINE AND MIDDLEWARE

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json({
    limit: "100kb"
}));

app.use(express.static(
    path.join(__dirname, "public")
));

// SESSION CONFIGURATION

app.use(session({

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({

        mongoUrl: process.env.MONGODB_URI,

        collectionName: "sessions",

        ttl: 7 * 24 * 60 * 60

    }),

    cookie: {

        maxAge: 7 * 24 * 60 * 60 * 1000,

        httpOnly: true,

        secure: isProduction,

        sameSite: "lax"

    }

}));

// AUTHENTICATION MIDDLEWARE

function requireLogin(req, res, next) {

    if (!req.session.userId) {
        return res.redirect("/login");
    }

    next();

}

function requireApiLogin(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            message: "Please login first."
        });

    }

    next();

}

app.use((req, res, next) => {

    res.locals.userName = req.session.userName || null;

    res.locals.userEmail = req.session.userEmail || null;

    res.locals.isLoggedIn = Boolean(req.session.userId);

    next();

});

// PROTECTED IMAGE ACCESS

app.get("/uploads/:filename", requireLogin, (req, res) => {

    const filename = req.params.filename;

    if (
        !/^[a-f0-9]{32}$/.test(filename) ||
        filename !== req.session.lastImage
    ) {
        return res.sendStatus(404);
    }

    res.sendFile(filename, {
        root: uploadDirectory
    });

});

// HOME PAGE

app.get("/", (req, res) => {
    res.render("home");
});

// REGISTRATION

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            confirmPassword
        } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.send("Please fill all fields!");
        }

        if (password !== confirmPassword) {
            return res.send("Passwords do not match!");
        }

        if (password.length < 8) {
            return res.send(
                "Password must contain at least 8 characters."
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.send("Email already registered!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({

            name: name.trim(),

            email: cleanEmail,

            password: hashedPassword

        });

        await newUser.save();

        console.log("New User Registered");

        res.redirect("/login");

    } catch (error) {

        console.error("Registration Error:", error.message);

        res.status(500).send(
            "Registration failed. Please try again."
        );

    }

});

// LOGIN

app.get("/login", (req, res) => {

    if (req.session.userId) {
        return res.redirect("/dashboard");
    }

    res.render("login");

});

app.post("/login", loginLimiter, async (req, res) => {

    try {

        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.send("Please enter email and password!");
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.send("Invalid email or password!");
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.send("Invalid email or password!");
        }

        req.session.regenerate(error => {

            if (error) {
                return res.status(500).send(
                    "Session creation failed."
                );
            }

            req.session.userId = user._id.toString();

            req.session.userName = user.name;

            req.session.userEmail = user.email;

            req.session.save(error => {

                if (error) {
                    return res.status(500).send(
                        "Session saving failed."
                    );
                }

                console.log("User Logged In:", user.name);

                res.redirect("/dashboard");

            });

        });

    } catch (error) {

        console.error("Login Error:", error.message);

        res.status(500).send(
            "Login failed. Please try again."
        );

    }

});

// LOGOUT

app.post("/logout", requireLogin, (req, res) => {

    req.session.destroy(error => {

        if (error) {
            return res.status(500).send("Logout failed.");
        }

        res.clearCookie("connect.sid", {

            path: "/",

            httpOnly: true,

            secure: isProduction,

            sameSite: "lax"

        });

        res.redirect("/login");

    });

});

// DAILY NUTRITION TRACKING

function getTodayRange() {

    const offset = 330 * 60 * 1000;

    const indianTime = new Date(Date.now() + offset);

    const midnight = Date.UTC(

        indianTime.getUTCFullYear(),

        indianTime.getUTCMonth(),

        indianTime.getUTCDate()

    );

    const start = new Date(midnight - offset);

    const end = new Date(
        start.getTime() + 24 * 60 * 60 * 1000
    );

    return { start, end };

}

async function getDailySummary(userId) {

    const { start, end } = getTodayRange();

    const records = await FoodHistory.find({

        userId,

        createdAt: {
            $gte: start,
            $lt: end
        }

    }).lean();

    const summary = {

        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        totalMeals: records.length

    };

    records.forEach(food => {

        summary.calories += food.calories || 0;

        summary.protein += food.protein || 0;

        summary.carbs += food.carbs || 0;

        summary.fat += food.fat || 0;

        summary.fiber += food.fiber || 0;

        summary.sugar += food.sugar || 0;

    });

    Object.keys(summary).forEach(key => {

        summary[key] = Number(summary[key].toFixed(2));

    });

    return summary;

}

// DASHBOARD

app.get("/dashboard", requireLogin, async (req, res) => {

    try {

        const history = await FoodHistory.find({

            userId: req.session.userId

        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const dailySummary = await getDailySummary(
            req.session.userId
        );

        const totalAnalyses = await FoodHistory.countDocuments({

            userId: req.session.userId

        });

        res.render("dashboard", {

            name: req.session.userName,

            userName: req.session.userName,

            email: req.session.userEmail,

            history,

            dailySummary,

            totalAnalyses

        });

    } catch (error) {

        console.error("Dashboard Error:", error.message);

        res.status(500).send("Unable to load dashboard.");

    }

});

// FOOD ANALYSIS PAGE

app.get("/food-analysis", requireLogin, (req, res) => {

    res.render("food-analysis");

});

app.get("/analyze", requireLogin, (req, res) => {

    res.redirect("/food-analysis");

});

// AI FOOD RECOGNITION

app.post(

    "/analyze-food",

    requireLogin,

    analysisLimiter,

    upload.single("foodImage"),

    async (req, res) => {

        if (!req.file) {

            return res.status(400).send(
                "Please upload a food image!"
            );

        }

        try {

            console.log("Analyzing Food Image...");

            const classifier = await loadAIModel();

            const imagePath = path.resolve(req.file.path);

            const detailedLabels = foodLabels.map(food => {

                return foodDescriptions[food]

                    ? `${food}, ${foodDescriptions[food]}`

                    : food;

            });

            const results = await classifier(

                imagePath,

                detailedLabels,

                {
                    hypothesis_template: "A photo of {}."
                }

            );

            const predictions = results.map(result => {

                const index = detailedLabels.indexOf(result.label);

                return {

                    label: index !== -1

                        ? foodLabels[index]

                        : result.label,

                    score: result.score

                };

            });

            predictions.sort(
                (a, b) => b.score - a.score
            );

            const prediction = predictions[0];

            if (!prediction) {

                await fs.promises.unlink(imagePath)
                    .catch(() => {});

                return res.send(
                    "Unable to recognize food."
                );

            }

            const foodName = prediction.label;

            const confidence = (
                prediction.score * 100
            ).toFixed(2);

            const nutrition = getNutrition(foodName);

            const healthScore = calculateHealthScore(nutrition);

            const topPredictions = predictions
                .slice(0, 3)
                .map(item => ({

                    foodName: item.label,

                    confidence: (
                        item.score * 100
                    ).toFixed(2)

                }));

            const previousImage = req.session.lastImage;

            req.session.lastImage = req.file.filename;

            req.session.lastAnalysis = {

                foodName,

                confidence: Number(confidence)

            };

            if (
                previousImage &&
                /^[a-f0-9]{32}$/.test(previousImage)
            ) {

                await fs.promises.unlink(

                    path.join(uploadDirectory, previousImage)

                ).catch(() => {});

            }

            console.log("Predicted Food:", foodName);

            console.log("Confidence:", confidence + "%");

            console.log("Health Score:", healthScore);

            res.render("food-result", {

                imageName: req.file.filename,

                originalName: req.file.originalname,

                foodName,

                confidence,

                topPredictions,

                nutrition,

                foodLabels,

                healthScore

            });

        } catch (error) {

            console.error("AI Error:", error.message);

            await fs.promises.unlink(req.file.path)
                .catch(() => {});

            res.status(500).send(
                "Food analysis failed. Please try again."
            );

        }

    }

);

// MANUAL FOOD CORRECTION

app.get("/api/nutrition", requireApiLogin, (req, res) => {

    try {

        const foodName = req.query.food;

        if (
            typeof foodName !== "string" ||
            !foodLabels.includes(foodName)
        ) {

            return res.status(404).json({
                message: "Food not found"
            });

        }

        const nutrition = getNutrition(foodName);

        if (!nutrition) {

            return res.status(404).json({
                message: "Nutrition information unavailable"
            });

        }

        const healthScore = calculateHealthScore(nutrition);

        res.json({

            foodName,

            nutrition,

            healthScore

        });

    } catch (error) {

        console.error("Nutrition API Error:", error.message);

        res.status(500).json({
            message: "Unable to fetch nutrition information"
        });

    }

});

// SERVING QUANTITY CALCULATION

function calculateQuantityNutrition(nutrition, quantity) {

    function calculate(value) {
        return Number((value * quantity).toFixed(2));
    }

    return {

        serving: nutrition.serving,

        quantity,

        calories: calculate(nutrition.calories),

        protein: calculate(nutrition.protein),

        carbs: calculate(nutrition.carbs),

        fat: calculate(nutrition.fat),

        fiber: calculate(nutrition.fiber),

        sugar: calculate(nutrition.sugar)

    };

}

// SAVE FOOD ANALYSIS

app.post("/api/save-food", requireApiLogin, async (req, res) => {

    try {

        const {
            foodName,
            quantity = 1,
            mealType = "Snacks"
        } = req.body || {};

        const servingQuantity = Number(quantity);

        if (!foodLabels.includes(foodName)) {

            return res.status(400).json({
                message: "Invalid food name."
            });

        }

        if (
            !Number.isFinite(servingQuantity) ||
            servingQuantity < 0.25 ||
            servingQuantity > 20
        ) {

            return res.status(400).json({
                message: "Invalid serving quantity."
            });

        }

        const allowedMeals = [

            "Breakfast",
            "Lunch",
            "Snacks",
            "Dinner"

        ];

        if (!allowedMeals.includes(mealType)) {

            return res.status(400).json({
                message: "Invalid meal type."
            });

        }

        const nutrition = getNutrition(foodName);

        if (!nutrition) {

            return res.status(404).json({
                message: "Nutrition information unavailable."
            });

        }

        const updatedNutrition = calculateQuantityNutrition(

            nutrition,

            servingQuantity

        );

        const health = calculateHealthScore(nutrition);

        const lastAnalysis = req.session.lastAnalysis;

        const record = new FoodHistory({

            userId: req.session.userId,

            foodName,

            originalPrediction: lastAnalysis?.foodName,

            confidence: lastAnalysis?.confidence,

            ...updatedNutrition,

            healthScore: health?.score ?? null,

            healthRating: health?.rating || "Unavailable",

            mealType

        });

        await record.save();

        delete req.session.lastAnalysis;

        console.log("Food History Saved:", foodName);

        res.status(201).json({

            success: true,

            message: "Food analysis saved successfully!",

            record

        });

    } catch (error) {

        console.error("Save Food Error:", error.message);

        res.status(500).json({
            message: "Unable to save food analysis."
        });

    }

});

// FOOD HISTORY

app.get("/api/history", requireApiLogin, async (req, res) => {

    try {

        const history = await FoodHistory.find({

            userId: req.session.userId

        })
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();

        res.json({

            success: true,

            history

        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to load food history."
        });

    }

});

// DELETE FOOD HISTORY

app.delete("/api/history/:id", requireApiLogin, async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).json({
                message: "Invalid record ID."
            });

        }

        const deletedRecord = await FoodHistory.findOneAndDelete({

            _id: req.params.id,

            userId: req.session.userId

        });

        if (!deletedRecord) {

            return res.status(404).json({
                message: "Food record not found."
            });

        }

        res.json({

            success: true,

            message: "Food record deleted successfully."

        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to delete food record."
        });

    }

});

// DAILY NUTRITION API

app.get("/api/daily-summary", requireApiLogin, async (req, res) => {

    try {

        const summary = await getDailySummary(
            req.session.userId
        );

        res.json({

            success: true,

            summary

        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to load daily summary."
        });

    }

});

// INDIAN MEAL SUGGESTIONS

const mealSuggestions = {

    Breakfast: [

        "Poha",
        "Vegetable Upma",
        "Aloo Paratha",
        "Paneer Paratha",
        "Besan Chilla",
        "Moong Dal Chilla",
        "Idli",
        "Plain Dosa",
        "Vegetable Sandwich",
        "Bread",
        "Milk",
        "Oats",
        "Banana"

    ],

    Lunch: [

        "Rajma Chawal",
        "Kadhi Chawal",
        "Dal Tadka",
        "Palak Paneer",
        "Matar Paneer",
        "Kadai Paneer",
        "Plain Roti",
        "Butter Naan",
        "Puri",
        "Chole Bhature",
        "Vegetable Biryani",
        "Aloo Gobi",
        "Bhindi Masala",
        "Mixed Vegetable"

    ],

    Snacks: [

        "Steamed Momos",
        "Bhel Puri",
        "Dhokla",
        "Sprouts Chaat",
        "Masala Sweet Corn",
        "Fruit Salad",
        "Roasted Makhana",
        "Vegetable Sandwich",
        "Paneer Tikka",
        "Dahi Bhalla"

    ],

    Dinner: [

        "Plain Roti",
        "Dal Tadka",
        "Dal Makhani",
        "Palak Paneer",
        "Matar Paneer",
        "Aloo Gobi",
        "Bhindi Masala",
        "Mixed Vegetable",
        "Khichdi",
        "Bajra Roti",
        "Sarson Ka Saag",
        "Makki Ki Roti",
        "Chana Dal",
        "Kadhi Chawal"

    ]

};

function generateMealSuggestions() {

    const suggestions = {};

    Object.keys(mealSuggestions).forEach(meal => {

        const availableFoods = mealSuggestions[meal]

            .filter(food => foodLabels.includes(food))

            .map(food => {

                const nutrition = getNutrition(food);

                return {

                    foodName: food,

                    nutrition,

                    healthScore: calculateHealthScore(nutrition)

                };

            })

            .filter(food => food.nutrition);

        suggestions[meal] = availableFoods;

    });

    return suggestions;

}

app.get("/api/meal-suggestions", requireApiLogin, (req, res) => {

    res.json({

        success: true,

        suggestions: generateMealSuggestions()

    });

});

// USER PROFILE

app.get("/api/profile", requireApiLogin, async (req, res) => {

    try {

        const user = await User.findById(

            req.session.userId

        ).select("name email createdAt");

        if (!user) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        res.json({

            success: true,

            user

        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to load profile."
        });

    }

});

// UPDATE USER PROFILE

app.put("/api/profile", requireApiLogin, async (req, res) => {

    try {

        const { name } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {

            return res.status(400).json({
                message: "Please enter a valid name."
            });

        }

        const user = await User.findByIdAndUpdate(

            req.session.userId,

            {
                name: name.trim()
            },

            {
                new: true,
                runValidators: true
            }

        ).select("name email");

        if (!user) {

            return res.status(404).json({
                message: "User not found."
            });

        }

        req.session.userName = user.name;

        res.json({

            success: true,

            message: "Profile updated successfully.",

            user

        });

    } catch (error) {

        res.status(500).json({
            message: "Unable to update profile."
        });

    }

});

// FOOD DATABASE API

app.get("/api/foods", requireApiLogin, (req, res) => {

    res.json({

        totalFoods: foodLabels.length,

        totalCategories: Object.keys(foodCategories).length,

        categories: foodCategories,

        foods: foodLabels

    });

});

// SERVER STATUS

app.get("/api/status", (req, res) => {

    const connected = mongoose.connection.readyState === 1;

    res.status(connected ? 200 : 503).json({

        application: "NutriVision AI",

        status: connected ? "Running" : "Database unavailable",

        database: connected ? "Connected" : "Disconnected"

    });

});

// ERROR HANDLING

app.use((error, req, res, next) => {

    console.error("Application Error:", error.message);

    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof multer.MulterError) {

        if (error.code === "LIMIT_FILE_SIZE") {

            return res.status(400).send(
                "Image size must be less than 8 MB."
            );

        }

        return res.status(400).send("Image upload failed.");

    }

    if (
        error.message ===
        "Only JPG, PNG and WEBP images are allowed."
    ) {

        return res.status(400).send(error.message);

    }

    res.status(500).send(
        "Something went wrong. Please try again."
    );

});

// START SERVER

app.listen(PORT, () => {

    console.log("-----------------------------------");

    console.log("NutriVision AI Started");

    console.log(`Website: http://localhost:${PORT}`);

    console.log(
        "Total Food Categories:",
        Object.keys(foodCategories).length
    );

    console.log(
        "Total Food Labels:",
        foodLabels.length
    );

    console.log("Session Authentication Enabled");

    console.log("Food History Backend Enabled");

    console.log("Daily Nutrition Tracking Enabled");

    console.log("Meal Suggestions Backend Enabled");

    console.log("Helmet Security Enabled");

    console.log("Login Rate Limiting Enabled");

    console.log("AI Analysis Rate Limiting Enabled");

    console.log("-----------------------------------");

});
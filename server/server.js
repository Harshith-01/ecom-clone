const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const crypto = require('crypto');
const dns = require('dns');
const app = express();
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || undefined;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
const SMTP_ENABLED = process.env.SMTP_ENABLED !== 'false';
const SERVER_PUBLIC_URL = (process.env.SERVER_PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

if (!SECRET_KEY || !MONGODB_URI || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('Missing required environment variables.');
    process.exit(1);
}

if (SMTP_ENABLED && (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM)) {
    console.warn('SMTP is enabled but some SMTP environment variables are missing. Email will remain disabled.');
}

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

let transporter = null;
let emailEnabled = false;

function createSmtpTransport() {
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { ...options, family: 4 }, callback);
        }
    });
}

async function initEmail() {
    console.log(`SMTP enabled=${SMTP_ENABLED}, host=${SMTP_HOST || 'unset'}, port=${SMTP_PORT || 'unset'}, secure=${SMTP_SECURE}, from=${SMTP_FROM || 'unset'}`);

    if (!SMTP_ENABLED) {
        console.log('SMTP is disabled by environment. Email notifications will remain off.');
        return;
    }

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        console.warn('SMTP configuration incomplete. Email will remain disabled.');
        return;
    }

    transporter = createSmtpTransport();

    try {
        await transporter.verify();
        emailEnabled = true;
        console.log('SMTP configuration is correct');
    } catch (err) {
        console.warn('SMTP configuration unavailable, email will be disabled:', err.message);
    }
}

initEmail();

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("DB Error:", err));

async function handleUpload(file) {
    const cldRes = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder: 'ebay-clone/products'
    });
    return cldRes;
}

async function sendOrderPlacedEmail(order){
    const recipient = order?.shippingDetails?.email;
    if (!recipient || !emailEnabled) return;
    await transporter.sendMail({
        from: SMTP_FROM,
        to: recipient,
        subject: `Order Placed Successfully - Order ID: ${order._id}`,
        text: `Hi ${order.shippingDetails.fullName},\n\nThank you for your purchase! Your order with ID ${order._id} has been placed successfully. We will notify you once it is shipped.`,
        html: `<p>Hi ${order.shippingDetails.fullName},</p>
            <p>Order Details:</p>
            <ul>
                ${order.products.map(p => `<li>${p.quantity} x ${p.productId.title} - ₹${p.price}</li>`).join('')}
            </ul>
            <p>Total Price: ₹${order.totalPrice}</p>
            <p>We will notify you once it is shipped.</p>
            <p>Thank you for shopping with us!</p>`
    });
}

async function sendDeliveryStatusEmail(order,previousStatus,newStatus){
    const recipient = order?.shippingDetails?.email;
    if (!recipient || !emailEnabled) return;
    await transporter.sendMail({
        from: SMTP_FROM,
        to: recipient,
        subject: `Order status updated - Order ID: ${order._id}`,
        text: `Hi ${order.shippingDetails.fullName},\n\nThe delivery status of your order with ID ${order._id} has been updated from "${previousStatus}" to "${newStatus}".\n\nThank you for shopping with us!`
    });
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'personal' },
    firstName: String,
    lastName: String,
    businessName: String,
    businessLocation: String,
    watchlist:[{type:mongoose.Schema.Types.ObjectId, ref:'Product'}]
});

const ProductSchema = new mongoose.Schema({
    title: String,
    price: Number,
    description: String,
    category: String,
    seller: String,
    quantity: Number,
    images: [String]
}, { timestamps: true });


const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    shippingDetails: {
        fullName: String,
        mobileNumber: String,
        email: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        country: String
    },
    paymentStatus: { type: String, default: 'pending' },
    deliveryStatus: { type: String, default: 'pending' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, businessName, businessLocation } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already taken" });
        } 

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword, 
            role,
            firstName, lastName, businessName, businessLocation
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ 
            message: "Login successful", 
            token: token, 
            user: { 
                id: user._id,
                name: user.firstName || user.businessName, 
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/products', upload.array('productImages', 10), async (req, res) => {
    try {
        const { title, price, description, category, seller, quantity } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one product image is required' });
        }

        const imagePaths = await Promise.all(
            req.files.map(async (file) => {
                const b64 = Buffer.from(file.buffer).toString('base64');
                const dataURI = `data:${file.mimetype};base64,${b64}`;
                const cldRes = await handleUpload(dataURI);
                return cldRes.secure_url;
            })
        );

        const newProduct = new Product({
            title,
            price,
            description,
            category,
            seller,
            quantity,
            images: imagePaths
        });
        await newProduct.save();
        res.status(201).json({ message: "Product created successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.put('/api/products/:id', upload.array('newImages', 10), async (req, res) => {
    try {
        const { title, price, description, category, quantity } = req.body;
        
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let finalImages = product.images; 

        
        if (req.files && req.files.length > 0) {
            finalImages = await Promise.all(
                req.files.map(async (file) => {
                    const b64 = Buffer.from(file.buffer).toString('base64');
                    const dataURI = `data:${file.mimetype};base64,${b64}`;
                    const cldRes = await handleUpload(dataURI);
                    return cldRes.secure_url;
                })
            );
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { title, price, description, category, quantity, images: finalImages },
            { new: true }
        );
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        const formattedProducts = products.map(p => ({
            _id: p._id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            seller: p.seller,
            quantity: p.quantity,
            images: p.images.map(img => (img.startsWith('http') ? img : `${SERVER_PUBLIC_URL}${img}`))
        }));
        res.json(formattedProducts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const formattedProduct = {
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            seller: product.seller,
            quantity: product.quantity,
            images: product.images.map(img => (img.startsWith('http') ? img : `${SERVER_PUBLIC_URL}${img}`))
        };
        res.json(formattedProduct);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post('/api/users/:id/watchlist', async (req, res)=> {
    try{
        const userId=req.params.id;
        const {productId}=req.body;
        const user=await User.findById(userId);
        if(!user) {
            return res.status(404).json({message:"User not found"});
        }
        if(user.watchlist.includes(productId)) {
            return res.status(400).json({message:"Product already in watchlist"});
        } else {
            user.watchlist.push(productId);
            await user.save();
            return res.status(200).json({message:"Product added to watchlist"});
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
})

app.get('/api/users/:id/watchlist', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('watchlist');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ watchlist: user.watchlist });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.delete('/api/users/:id/watchlist/:productId', async (req, res) => {
    try {
        const userId = req.params.id;
        const productId = req.params.productId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const index = user.watchlist.indexOf(productId);
        if (index === -1) {
            return res.status(400).json({ message: "Product not in watchlist" });
        }
        user.watchlist.splice(index, 1);
        await user.save();
        res.status(200).json({ message: "Product removed from watchlist" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
try{
    const{buyerId, products, totalPrice, shippingDetails}=req.body;
    const options={
        amount:Math.round(totalPrice*100),
        currency:"INR",
        receipt:"order_rcptid_11"
    };
    const order=await razorpay.orders.create(options);
    const newOrder= new Order({
    buyerId,
    products,
    totalPrice,
shippingDetails,
paymentStatus:"pending",
deliveryStatus:"pending"
    });
    await newOrder.save();
    try{
        await sendOrderPlacedEmail(newOrder);
    } catch (mailError) {
        console.error("Error sending order placed email:", mailError.message);
    }
    res.status(201).json({
        message:"Order created successfully",
        newOrder,
razorpayOrderId:order.id,
    });
    } catch(error){
        res.status(500).json({message:"Server error", error:error.message});
}
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('buyerId', 'email')
            .populate('products.productId', 'title price seller');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { deliveryStatus, status } = req.body;
        const nextStatus = deliveryStatus || status;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (!nextStatus) {
            return res.status(400).json({ message: "deliveryStatus is required" });
        }
        const previousStatus = order.deliveryStatus;
        order.deliveryStatus = nextStatus;
        await order.save();
        try{
            await sendDeliveryStatusEmail(order,previousStatus,nextStatus);
        } catch (mailError) {
            console.error("Error sending delivery status email:", mailError.message);
        }
        res.status(200).json({ message: "Delivery status updated successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


app.delete('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.post('/api/orders/verify', async (req, res) => {
try{
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, dbOrderId } = req.body;
    const sign= razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign= crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(sign.toString()).digest('hex');
    if(expectedSign === razorpaySignature) {
        await Order.findByIdAndUpdate(dbOrderId, { paymentStatus: "paid" });
        return res.status(200).json({ message: "Payment verified successfully" });
    } else {
        return res.status(400).json({ message: "Invalid payment signature" });
    }
} catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
}});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
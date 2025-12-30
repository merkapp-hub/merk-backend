const express = require('express');
const product = require('@controllers/productController');
const authMiddleware = require('@middlewares/authMiddleware');
const { upload } = require('@services/fileUpload');

const router = express.Router();
router.post("/createProduct", 
    authMiddleware(["user", "admin", "seller"]), 
    upload.array('images', 10), 
    product.createProduct
);
router.post("/updateProduct", 
    authMiddleware(["user", "admin", "seller"]), 
    upload.array('images', 10),  
    product.updateProduct
);
router.get("/getProduct", product.getProduct);
router.get("/getSellerProducts", authMiddleware(["seller", "admin"]), product.getSellerProducts);
router.get("/getProductforseller", authMiddleware(["user", "admin", "seller", "employee"]), product.getProductforseller);
router.get("/getSponseredProduct", product.getSponseredProduct);
router.get("/getProductByslug/:id", product.getProductByslug);
router.get("/getProductById/:id", product.getProductById);
router.post("/compareProduct", product.compareProduct);
router.get("/getProductbycategory/:id", product.getProductbycategory);
router.get("/getProductBycategoryId", product.getProductBycategoryId);
router.get("/getProductBythemeId/:id", product.getProductBythemeId);
router.get("/getcolors", product.getColors);

router.get("/topselling", product.topselling);
router.get("/getnewitem", product.getnewitem);
router.delete("/deleteProduct/:id", authMiddleware(["user", "admin", "seller"]), product.deleteProduct);
router.post("/deleteAllProduct", authMiddleware(["user", "admin", "seller"]), product.deleteAllProduct);

// router.post("/createProductRequest", authMiddleware(["user", "admin", "seller", "employee"]), product.requestProduct);
router.post('/createProductRequest',authMiddleware(["user", "admin", "seller", "employee"]),product.createProductRequest)
router.get("/getTopSoldProduct", product.getTopSoldProduct);
router.get("/sellerWalletSummary", authMiddleware(["seller", "admin"]), product.getSellerWalletSummary);
router.get("/adminWalletSummary", authMiddleware(["admin"]), product.getAdminWalletSummary);

router.get("/getProductRquest", authMiddleware(["user", "admin", "seller", "employee"]), product.getrequestProduct);
router.patch("/refundProduct/:id", authMiddleware(["user", "admin", "seller", "employee"]), product.refundProduct);
router.post("/getOrderBySeller", authMiddleware(["user", "admin", "seller", "employee"]), product.getOrderBySeller);
router.post("/getSellerOrderByAdmin", authMiddleware(["admin"]), product.getSellerOrderByAdmin);
router.post("/getSellerReturnOrderByAdmin", authMiddleware(["admin", "seller",]), product.getSellerReturnOrderByAdmin);
router.get("/getSellerProductByAdmin", authMiddleware(["admin"]), product.getSellerProductByAdmin);
router.post("/getAssignedOrder", authMiddleware(["user", "admin", "seller", "employee"]), product.getAssignedOrder);
router.post("/cashcollected", authMiddleware(["user", "admin", "seller", "driver"]), product.cashcollected);
router.post("/changeorderstatus", authMiddleware(["user", "admin", "seller", "driver", "employee"]), product.changeorderstatus);
router.get("/onthewaytodelivery/:id", authMiddleware(["user", "admin", "seller", "driver"]), product.onthewaytodelivery);
router.get("/productsearch", product.productSearch);
router.post("/updateProductRequest/:id", authMiddleware(["user", "admin", "seller"]), product.updaterequestProduct);
router.get("/getProductRequest/:id", authMiddleware(["user", "admin", "seller", "driver", "employee"]), product.getrequestProductbyid);
router.post("/nearbyorderfordriver", authMiddleware(["driver"]), product.nearbyorderfordriver);
router.get("/acceptedorderfordriver", authMiddleware(["user", "admin", "seller", "driver"]), product.acceptedorderfordriver);
router.post("/acceptorderdriver/:id", authMiddleware(["user", "admin", "seller", "driver"]), product.acceptorderdriver);
router.get("/orderhistoryfordriver", authMiddleware(["user", "admin", "seller", "driver"]), product.orderhistoryfordriver);
router.get("/orderhistoryforvendor", authMiddleware(["user", "admin", "seller", "driver"]), product.orderhistoryforvendor);
router.get("/getProductRequestbyUser", authMiddleware(["user", "admin", "seller", "employee"]), product.getrequestProductbyuser);
router.get("/generateInvoice/:orderId", authMiddleware(["user", "admin", "seller", "employee"]), product.generateInvoice);
router.get("/getAlluploadproduct", product.uploadProducts);
router.post("/suspend/:id", authMiddleware(["user", "admin", "seller"]), product.suspendProduct);
router.post("/updateProductStatus", authMiddleware(["admin", "seller"]), product.updateProductStatus);
router.post("/uploadImages", 
  authMiddleware(["user", "admin", "seller"]), 
  (req, res, next) => {
    console.log('=== Upload Images Route Hit ===');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('User:', req.user?.email);
    
    // Set a timeout to catch hanging requests
    req.setTimeout(60000, () => {
      console.error('Request timeout after 60 seconds');
      if (!res.headersSent) {
        res.status(408).json({
          status: false,
          message: 'Request timeout - upload took too long'
        });
      }
    });
    
    next();
  },
  (req, res, next) => {
    console.log('=== Before Multer Middleware ===');
    next();
  },
  upload.array('images', 10), 
  (req, res, next) => {
    console.log('=== After Multer Middleware ===');
    console.log('Files parsed:', req.files?.length || 0);
    next();
  },
  (err, req, res, next) => {
    // Multer error handler
    console.error('=== Multer Error Handler ===');
    if (err) {
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error stack:', err.stack);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: false,
          message: 'File too large. Maximum size is 10MB per file.'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          status: false,
          message: 'Too many files. Maximum is 10 files.'
        });
      }
      
      return res.status(400).json({
        status: false,
        message: err.message || 'File upload error',
        error: err.toString()
      });
    }
    next();
  },
  product.uploadImages
);

// Test endpoint without multer - just to see if request reaches
router.post("/testUploadSimple", 
  authMiddleware(["user", "admin", "seller"]),
  (req, res) => {
    console.log('=== Simple Test Upload Endpoint ===');
    console.log('Request received successfully!');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Content-Length:', req.headers['content-length']);
    console.log('Body keys:', Object.keys(req.body));
    
    return res.status(200).json({
      status: true,
      message: 'Simple test endpoint reached successfully',
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length']
    });
  }
);

// Alternative upload using raw body parser
const multer = require('multer');
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post("/uploadImagesAlt",
  authMiddleware(["user", "admin", "seller"]),
  uploadMemory.array('images', 10),
  async (req, res) => {
    try {
      console.log('=== Alternative Upload Endpoint ===');
      console.log('Files received:', req.files?.length || 0);
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: false,
          message: 'No files received'
        });
      }
      
      // Upload to Cloudinary manually
      const { cloudinary } = require('@services/fileUpload');
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'merk_uploads',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });
      
      const imageUrls = await Promise.all(uploadPromises);
      
      console.log('Upload successful:', imageUrls);
      
      return res.status(200).json({
        status: true,
        data: {
          message: 'Images uploaded successfully',
          images: imageUrls
        }
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        status: false,
        message: error.message
      });
    }
  }
);
router.post("/uploadImagesBase64", authMiddleware(["user", "admin", "seller"]), product.uploadImagesBase64);
router.get("/getdriveramount", product.getdriveramount);
router.get("/getdriverpendingamount/:id", product.getdriverpendingamount);
router.get("/collectcash/:id", authMiddleware(["user", "admin", "seller", "driver"]), product.collectcash);
router.post("/assignOrder", authMiddleware(["seller"]), product.assignOrderToEmployee);
router.post("/getOrderByEmployee", authMiddleware(["employee"]), product.getOrderByEmployee);
router.post("/getOrderHistoryByEmployee", authMiddleware(["employee"]), product.getOrderHistoryByEmployee);
router.post("/reminderSellerForReturn", authMiddleware(["admin"]), product.reminderSellerForReturn);

// Delivery label routes
router.post("/generate-delivery-label", authMiddleware(["admin", "seller"]), product.generateDeliveryLabel);
router.get("/:productId/delivery-label/print", authMiddleware(["admin", "seller"]), product.printDeliveryLabel);

module.exports = router;
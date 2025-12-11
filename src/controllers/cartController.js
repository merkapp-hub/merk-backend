const Product = require("@models/Product");
const response = require("../responses");

module.exports = {
  // Fetch fresh cart data by product IDs
  getCartItems: async (req, res) => {
    try {
      const { items } = req.body; // items = [{ productId, quantity, selectedVariant }]
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return response.success(res, { data: [] });
      }

      const productIds = items.map(item => item.productId);
      
      // Fetch fresh product data from DB
      const products = await Product.find({ 
        _id: { $in: productIds },
        is_verified: true,
        status: "verified"
      }).populate("category", "name slug is_refundable");

 
      const cartItems = items.map(cartItem => {
        const product = products.find(p => p._id.toString() === cartItem.productId);
        
        if (!product) {
          return null; 
        }

       
        let selectedVariant = null;
        let price = 0;
        let offerPrice = 0;
        let stock = product.stock || 0;
        let selectedImage = null;
        let formattedSize = null;

        if (product.hasVariants && product.varients && product.varients.length > 0) {
        
          const requestedSize = cartItem.selectedSize || cartItem.selectedVariant?.selected?.[0]?.value || cartItem.selectedVariant?.selected?.[0];
          
         
          let matchingVariant = null;
          
          if (cartItem.selectedVariant?.color) {
          
            matchingVariant = product.varients.find(v => v.color === cartItem.selectedVariant.color);
          }
          
          
          if (!matchingVariant && requestedSize) {
            matchingVariant = product.varients.find(v => {
              if (!v.selected || !Array.isArray(v.selected)) return false;
              return v.selected.some(s => {
                const sizeValue = typeof s === 'string' ? s : (s?.value || s?.label);
                return sizeValue === requestedSize;
              });
            });
          }
          
      
          if (!matchingVariant) {
            matchingVariant = product.varients[0];
          }
          
          selectedVariant = matchingVariant;
          
          if (selectedVariant) {
         
            price = selectedVariant.price || 0;
            offerPrice = selectedVariant.Offerprice || selectedVariant.price || 0;
            
          
            if (requestedSize && selectedVariant.selected) {
              const sizeObj = selectedVariant.selected.find(s => {
                const sizeValue = typeof s === 'string' ? s : (s?.value || s?.label);
                return sizeValue === requestedSize;
              });
              
              if (sizeObj && typeof sizeObj === 'object' && sizeObj.total !== undefined) {
                stock = parseInt(sizeObj.total) || 0;
              } else {
                stock = selectedVariant.stock || 0;
              }
            } else {
              stock = selectedVariant.stock || 0;
            }
            
            selectedImage = selectedVariant.image?.[0] || product.images?.[0] || product.image;
            formattedSize = requestedSize;
          }
        } else {
       
          price = product.price_slot?.[0]?.price || 0;
          offerPrice = product.price_slot?.[0]?.Offerprice || price;
          selectedImage = product.images?.[0] || product.image;
          stock = product.stock || 0;
        }

       
        const requestedQty = cartItem.quantity || 1;
        const availableStock = stock || 0;
        
   
        const finalQty = availableStock > 0 ? Math.min(requestedQty, availableStock) : requestedQty;

        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: selectedImage,
          images: product.images,
          price: price,
          Offerprice: offerPrice,
          qty: finalQty,
          requestedQty: requestedQty,
          total: (offerPrice * finalQty).toFixed(2),
          selectedVariant: selectedVariant,
          selectedColor: selectedVariant ? {
            color: selectedVariant.color,
            image: selectedVariant.image
          } : null,
          selectedSize: formattedSize,
          stock: availableStock,
          inStock: stock > 0,
          category: product.category,
          hasVariants: product.hasVariants,
          varients: product.varients
        };
      }).filter(item => item !== null); // Remove deleted products

      return response.success(res, cartItems);
    } catch (error) {
      console.error("getCartItems error:", error);
      return response.error(res, error);
    }
  },

  // Fetch fresh wishlist data by product IDs
  getWishlistItems: async (req, res) => {
    try {
      const { productIds } = req.body;
      
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return response.success(res, { data: [] });
      }

    
      const products = await Product.find({ 
        _id: { $in: productIds },
        is_verified: true,
        status: "verified"
      }).populate("category", "name slug");

      const wishlistItems = products.map(product => ({
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || product.image,
        images: product.images,
        price: product.price_slot?.[0]?.price || 0,
        Offerprice: product.price_slot?.[0]?.Offerprice || product.price_slot?.[0]?.price || 0,
        short_description: product.short_description,
        category: product.category,
        hasVariants: product.hasVariants,
        varients: product.varients,
        price_slot: product.price_slot,
        stock: product.stock || 0,
        inStock: (product.stock || 0) > 0
      }));

      return response.success(res, wishlistItems);
    } catch (error) {
      console.error("getWishlistItems error:", error);
      return response.error(res, error);
    }
  }
};

const Product = require("@models/Product");
const ProductRequest = require("@models/ProductRequest");
const User = require("@models/User");
const response = require("../responses");
const ExcelJS = require('exceljs');

module.exports = {
  detailedSellerReport: async (req, res) => {
    try {
      const { reportTypes, id } = req.body;

      if (!id) {
        return response.error(res, { message: 'Seller ID is required' });
      }

      if (!reportTypes || reportTypes.length === 0) {
        return response.error(res, { message: 'Please select at least one report type' });
      }

      // Get seller details
      const seller = await User.findById(id).select('-password');
      
      if (!seller) {
        return response.error(res, { message: 'Seller not found' });
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();

      // Products Report
      if (reportTypes.includes('Products')) {
        try {
          const products = await Product.find({ userid: id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

          const worksheet = workbook.addWorksheet('Products');
          
          worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 10 },
            { header: 'Product Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 20 }
          ];

          products.forEach((product, index) => {
            // Determine price based on product structure
            let price = 0;
            
            if (product.hasVariants && product.varients && product.varients.length > 0) {
              // If has variants, get first variant price or lowest price
              const prices = product.varients.map(v => v.price || v.Offerprice || 0).filter(p => p > 0);
              price = prices.length > 0 ? Math.min(...prices) : 0;
            } else if (product.price_slot && product.price_slot.length > 0) {
              // If has price slots, get first slot price
              price = product.price_slot[0]?.price || product.price_slot[0]?.Offerprice || 0;
            }
            
            worksheet.addRow({
              sno: index + 1,
              name: product.name || '',
              category: product.category?.name || '',
              price: price,
              stock: product.stock || 0,
              status: product.is_verified ? 'Active' : 'Inactive',
              createdAt: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''
            });
          });
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }

      // Orders Report
      if (reportTypes.includes('Orders')) {
        try {
          const orders = await ProductRequest.find({ seller_id: id })
            .populate('user', 'firstName lastName email number mobile')
            .populate('productDetail.product', 'name')
            .sort({ createdAt: -1 });

          const worksheet = workbook.addWorksheet('Orders');
          
          worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 10 },
            { header: 'Order ID', key: 'orderId', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 25 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Payment Mode', key: 'paymentMode', width: 15 },
            { header: 'Order Date', key: 'orderDate', width: 20 }
          ];

          orders.forEach((order, index) => {
            worksheet.addRow({
              sno: index + 1,
              orderId: order.orderId || '',
              customerName: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
              totalAmount: order.finalAmount || order.total || 0,
              status: order.status || '',
              paymentMode: order.paymentmode || '',
              orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
            });
          });
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }

      // Returns Report (includes both returns and refunds)
      if (reportTypes.includes('Returns')) {
        try {
          const returns = await ProductRequest.find({
            seller_id: id,
            'productDetail.returnDetails.isReturned': true
          })
            .populate('user', 'firstName lastName email')
            .populate('productDetail.product', 'name')
            .sort({ createdAt: -1 });

          const worksheet = workbook.addWorksheet('Returns & Refunds');
          
          worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 20 },
            { header: 'Product Name', key: 'productName', width: 30 },
            { header: 'Return Status', key: 'returnStatus', width: 20 },
            { header: 'Return Reason', key: 'returnReason', width: 30 },
            { header: 'Return Date', key: 'returnDate', width: 20 },
            { header: 'Is Refunded', key: 'isRefunded', width: 15 },
            { header: 'Refund Amount', key: 'refundAmount', width: 15 },
            { header: 'Refunded At', key: 'refundedAt', width: 20 }
          ];

          returns.forEach((order) => {
            order.productDetail?.forEach((product) => {
              if (product.returnDetails?.isReturned || product.returnDetails?.isRefunded) {
                worksheet.addRow({
                  orderId: order.orderId || '',
                  productName: product.product?.name || '',
                  returnStatus: product.returnDetails.returnStatus || '',
                  returnReason: product.returnDetails.reason || '',
                  returnDate: product.returnDetails.returnRequestDate ? 
                    new Date(product.returnDetails.returnRequestDate).toLocaleDateString() : '',
                  isRefunded: product.returnDetails.isRefunded ? 'Yes' : 'No',
                  refundAmount: product.returnDetails.refundAmount || 0,
                  refundedAt: product.returnDetails.refundedAt ? 
                    new Date(product.returnDetails.refundedAt).toLocaleDateString() : ''
                });
              }
            });
          });
        } catch (error) {
          console.error('Error fetching returns:', error);
        }
      }

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=seller-${seller.firstName}-report.xlsx`);
      
      return res.send(buffer);

    } catch (error) {
      console.error('Export error:', error);
      return response.error(res, { message: error.message || 'Failed to export seller report' });
    }
  }
};

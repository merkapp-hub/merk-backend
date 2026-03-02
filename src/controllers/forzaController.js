const forzaService = require('../services/forzaService');
const ProductRequest = require('../models/ProductRequest');

const trackShipment = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await ProductRequest.findById(orderId);
        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'Order not found'
            });
        }

        if (!order.forzaShipping?.trackingNumber) {
            return res.status(400).json({
                status: false,
                message: 'No tracking information available'
            });
        }

        // Check if it's a real Forza guide number (starts with FD and is numeric)
        const trackingNumber = order.forzaShipping.trackingNumber;
        const isForzaGuide = /^FD\d+$/.test(trackingNumber) || /^\d+$/.test(trackingNumber);

        if (!isForzaGuide) {
            return res.status(200).json({
                status: true,
                data: {
                    trackingNumber: trackingNumber,
                    status: order.forzaShipping.status || 'Pending',
                    currentLocation: order.forzaShipping.currentLocation || '',
                    estimatedDelivery: order.forzaShipping.estimatedDelivery || '',
                    message: 'Shipment is being processed. Real tracking number will be available soon.'
                }
            });
        }

        const country = order.shipping_address?.country?.label || 'Guatemala';
        const trackingResult = await forzaService.trackShipment(
            trackingNumber,
            country
        );

        if (trackingResult.success) {
            await ProductRequest.findByIdAndUpdate(orderId, {
                'forzaShipping.status': trackingResult.status,
                'forzaShipping.currentLocation': trackingResult.currentLocation,
                'forzaShipping.history': trackingResult.history,
                'forzaShipping.estimatedDelivery': trackingResult.estimatedDelivery
            });

            return res.status(200).json({
                status: true,
                data: {
                    trackingNumber: trackingNumber,
                    status: trackingResult.status,
                    currentLocation: trackingResult.currentLocation,
                    estimatedDelivery: trackingResult.estimatedDelivery,
                    history: trackingResult.history
                }
            });
        } else {
            return res.status(500).json({
                status: false,
                message: trackingResult.error
            });
        }
    } catch (error) {
        console.error('Tracking error:', error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

const getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await ProductRequest.findById(orderId).select('forzaShipping shipping_address orderId');
        
        if (!order) {
            return res.status(404).json({
                status: false,
                message: 'Order not found'
            });
        }

        if (!order.forzaShipping?.trackingNumber) {
            return res.status(200).json({
                status: true,
                data: {
                    hasTracking: false,
                    message: 'Tracking information not available yet'
                }
            });
        }

        return res.status(200).json({
            status: true,
            data: {
                hasTracking: true,
                trackingNumber: order.forzaShipping.trackingNumber,
                status: order.forzaShipping.status,
                currentLocation: order.forzaShipping.currentLocation,
                estimatedDelivery: order.forzaShipping.estimatedDelivery,
                history: order.forzaShipping.history || []
            }
        });
    } catch (error) {
        console.error('Get tracking error:', error);
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

module.exports = {
    trackShipment,
    getOrderTracking
};

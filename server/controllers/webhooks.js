import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe"
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

//API controller func

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });
    const { data, type } = req.body;
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_address[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findOneAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({success:false,message:error.message})
  }
};


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return; // Ensure you return after sending a response
    }
   console.log('Received event:', event);
   
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });

            if (session.data.length === 0) {
                console.error(`No session found for payment intent: ${paymentIntentId}`);
                return response.status(404).send('Session not found');
            }

            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);

            if (!purchaseData) {
                console.error(`Purchase not found for ID: ${purchaseId}`);
                return response.status(404).send('Purchase not found');
            }

            // Update the purchase status to "completed"
            purchaseData.status = "completed";
            await purchaseData.save();
            console.log(`Payment completed for purchase ID: ${purchaseId}`);
            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);
            purchaseData.status = "failed";
            await purchaseData.save();
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    response.json({ received: true });
};
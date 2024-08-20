import { db } from "@/firebase";
import { getAuth } from "@clerk/nextjs/server";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const formatAmountForStripe = (amount, currency) => {
  return Math.round(amount * 100);
};

export async function POST(req) {
  try {
    const { plan } = await req.json(); // Expecting a "plan" parameter to be sent from the client

    let priceData;
    if (plan === "pro") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Pro subscription",
        },
        unit_amount: formatAmountForStripe(10, "usd"),
        recurring: {
          interval: "month",
          interval_count: 1,
        },
      };
    } else if (plan === "basic") {
      priceData = {
        currency: "usd",
        product_data: {
          name: "Basic subscription",
        },
        unit_amount: formatAmountForStripe(5, "usd"),
        recurring: {
          interval: "month",
          interval_count: 1,
        },
      };
    } else {
      throw new Error("Invalid subscription plan");
    }

    const params = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData, // Correct reference to priceData
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("Referer")}result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("Referer")}result?session_id={CHECKOUT_SESSION_ID}`,
    };

    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json(checkoutSession, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse(JSON.stringify({ error: { message: error.message } }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const session_id = searchParams.get("session_id");

  try {
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // Retrieve user information from Clerk
    const { userId } = getAuth(req);
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    const userDocRef = doc(collection(db, 'users'), userId);
    const docSnap = await getDoc(userDocRef);

    let newGenerationsLeft = getGenerationsLeftFromCheckoutSession(checkoutSession);

    // Directly set the new generationsLeft value
    await updateDoc(userDocRef, { generationsLeft: newGenerationsLeft });

    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error("Error retrieving checkout session or updating Firestore:", error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

function getGenerationsLeftFromCheckoutSession(checkoutSession) {
  switch (checkoutSession.amount_total) {
    case 1000:
      return 40; // Pro plan
    case 500:
      return 20; // Basic plan
    default:
      console.log(`Unknown subscription amount: ${checkoutSession.amount_total}`);
      return 0; // Default value
  }
}
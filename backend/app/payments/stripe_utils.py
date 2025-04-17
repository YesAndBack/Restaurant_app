import stripe
from app.config import settings
from fastapi import HTTPException

stripe.api_key = settings.STRIPE_SECRET_KEY

async def create_payment_intent(amount: int, currency: str = "usd"):
    """Создает платежное намерение в Stripe."""
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Сумма в центах (10 USD = 1000 центов)
            currency=currency,
            payment_method_types=["card"],
            description="Admin fee for restaurant upload",
        )
        return intent
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")

async def confirm_payment_intent(payment_intent_id: str, payment_method: str):
    """Подтверждает платежное намерение."""
    try:
        intent = stripe.PaymentIntent.confirm(
            payment_intent_id,
            payment_method=payment_method,
        )
        return intent
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment confirmation error: {str(e)}")


async def create_checkout_session(
    amount: int,
    currency: str = "usd",
    success_url: str = "http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: str = "http://localhost:8080/cancel",
):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "unit_amount": amount,  # В центах, 1000 = 10 USD
                        "product_data": {
                            "name": "Admin Fee for Restaurant Upload",
                        },
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return session
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Checkout error: {str(e)}")
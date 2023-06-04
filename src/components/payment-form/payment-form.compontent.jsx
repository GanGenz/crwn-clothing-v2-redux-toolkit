import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useSelector } from 'react-redux'

import { selectCartTotal } from '../../store/cart/cart.selector'
import { selectCurrentUser } from '../../store/user/user.selector'
import Button, { BUTTON_TYPE_CLASSES } from '../button/button.component'
import { PaymentFormContainer, FormContainer, PaymentButton } from './payment-form.styles'


export default function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const amount = useSelector(selectCartTotal)
  const currentUser = useSelector(selectCurrentUser)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const paymentHanlder = async (e) => {
    e.preventDefault()
    if(!stripe || !elements) return

    setIsProcessingPayment(true)

    const response = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: amount * 100 })
    }).then(res => res.json())

    // console.log('response', response)
    const { paymentIntent: { client_secret } } = response

    const paymentResult = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: currentUser ? currentUser.displayName : "Guest"
        }
      }
    })
    // console.log('payment result', paymentResult)
    setIsProcessingPayment(false)
    if(paymentResult.error){
      alert(paymentResult.error)
    } else {
      if(paymentResult.paymentIntent.status === "succeeded"){
        alert('Payment successful')
      }
    }
    // console.log(client_secret)

  }

  return (
    <PaymentFormContainer>
      <FormContainer onSubmit={paymentHanlder}>
        <h2>Credit Card Payment: </h2>
        <CardElement />
        <PaymentButton isLoading={isProcessingPayment} buttonType={BUTTON_TYPE_CLASSES.inverted}>Payment</PaymentButton>
      </FormContainer>
      
    </PaymentFormContainer>
  )
}

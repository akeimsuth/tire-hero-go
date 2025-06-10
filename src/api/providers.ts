
export const createStripeAccount = async (providerId: string, email: string, businessName: string) => {
  try {
    const response = await fetch('/api/providers/create-stripe-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId,
        email,
        businessName,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe account');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    throw error;
  }
};

export const getStripeAccountStatus = async (providerId: string) => {
  try {
    const response = await fetch(`/api/providers/${providerId}/stripe-status`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Stripe status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Stripe status:', error);
    throw error;
  }
};

export const updateProviderStripeAccount = async (providerId: string, stripeAccountId: string) => {
  try {
    console.log("PROVIDER ID: ", providerId);
    console.log("STRIPE ACCOUNT ID: ", stripeAccountId);
    // const providerRef = doc(db, 'providers', providerId);
    // await updateDoc(providerRef, {
    //   stripeAccountId,
    //   stripeStatus: 'pending',
    //   updatedAt: new Date().toISOString(),
    // });
  } catch (error) {
    console.error('Error updating provider with Stripe account:', error);
    throw error;
  }
}; 
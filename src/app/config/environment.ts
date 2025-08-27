export const environment = {
  supabaseUrl: 'https://aijvzrmcakpmkredknsq.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpanZ6cm1jYWtwbWtyZWRrbnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzEwNDIsImV4cCI6MjA2NDkwNzA0Mn0.K9cIqAtqTpfrquxnOZONwDE7WYiSu2y8emM31q5mqzQ',

  stripePublicKey: 'pk_test_51RaNnZGlGAiAprB7bY8fCSosyaubb9RS6v1u1JtFLM0YWEPdXy51IWPPbB2NYAsh9GMHQnNGf09nnYl40MQVD3rI00ivSsvzHf',

  functions: {
    createCheckoutSession: '/functions/v1/create-checkout-session',
    cancelSubscription: '/functions/v1/cancel-subscription',
  },

  talkJS: {
    appId: 'tPAuGWk2'
  },

  exercises: {
    apiUrl: 'https://api.api-ninjas.com/v1/exercises',
    apiKey: 'wjx3XFBO5ETE0fLjcbjqYw==V8UC0R0OIZW5nABu'
    //apiKey: 'yM8G7AsVRsV0VJa31ze4gw==4RjIjQgg7Gq2MsB3'
  }
};

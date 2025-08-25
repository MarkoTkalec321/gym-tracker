export const MESSAGES = {
  notLoggedIn: {
    title: 'Not logged in',
    message: 'You must register or log in to subscribe.',
    options: ['Register', 'Login', 'Cancel']
  },
  upgrade: (planName: string) => ({
    title: 'Confirm Upgrade',
    message: `Are you sure you want to upgrade to ${planName}? You will be charged immediately.`,
  }),
  downgrade: (planName: string) => ({
    title: 'Confirm Downgrade',
    message: `Are you sure you want to downgrade to ${planName}? It will take effect at the end of your billing period.`,
  }),
  successDowngrade: (planName: string) =>
    `Your subscription will be downgraded to ${planName} at the end of the billing period.`,

  deleteClientFromGroup: (clientName: string) => ({
    title: 'Confirm Deletion',
    message: `Are you sure you want to remove ${clientName} from this group?`,
  }),
};
